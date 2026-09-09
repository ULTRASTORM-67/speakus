/* ============================================================
   PUMP — moteur de schemas animes
   ------------------------------------------------------------
   Chaque exercice est decrit par des angles articulaires et des
   images cles. Le moteur interpole entre elles et dessine un
   bonhomme articule en SVG : c'est une boucle video, sans video.

   Convention d'angle : 0 = vers le bas, positif = vers l'avant
   (le bonhomme regarde a droite). Un angle de 180 pointe donc
   vers le haut, -90 vers l'arriere a l'horizontale.
     sh = angle epaule -> coude (dans le repere du monde)
     el = flexion du coude, l'avant-bras est donc a sh + el
     pg = angle du poignet, la main est a sh + el + pg
   ============================================================ */
window.Anim = (function () {
  'use strict';

  var RAD = Math.PI / 180, DEG = 180 / Math.PI;
  var VB = { w: 320, h: 310 };
  var L = { bras: 46, avb: 40, main: 12, tete: 15 };

  /* ---------- geometrie de base ---------- */
  function P(o, a, l) { return [o[0] + l * Math.sin(a * RAD), o[1] + l * Math.cos(a * RAD)]; }
  function mid(a, b) { return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }
  function dist(a, b) { var x = b[0] - a[0], y = b[1] - a[1]; return Math.sqrt(x * x + y * y); }
  function ang(a, b) { return Math.atan2(b[0] - a[0], b[1] - a[1]) * DEG; }
  function le(a, b, t) { return a + (b - a) * t; }

  /* Cinematique inverse a deux segments : place le coude (ou le genou)
     pour qu'une extremite atteigne exactement un point donne. */
  function ik2(S, T, u, f, sens) {
    var d = Math.min(dist(S, T), u + f - 1);
    if (d < 1) d = 1;
    var a = ang(S, T);
    var c = (u * u + d * d - f * f) / (2 * u * d);
    c = Math.max(-1, Math.min(1, c));
    var off = Math.acos(c) * DEG;
    var sh = a + sens * off;
    return { sh: sh, coude: P(S, sh, u) };
  }

  /* ---------- decors ---------- */
  function sol(y) {
    return '<line class="sol" x1="8" y1="' + y + '" x2="312" y2="' + y + '"/>';
  }
  function meuble(x1, y1, x2, y2, ys) {  /* assise + pieds */
    return '<line class="obj" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"/>' +
      '<line class="obj fin" x1="' + (x1 + 5) + '" y1="' + y1 + '" x2="' + (x1 + 7) + '" y2="' + ys + '"/>' +
      '<line class="obj fin" x1="' + (x2 - 5) + '" y1="' + y2 + '" x2="' + (x2 - 7) + '" y2="' + ys + '"/>';
  }

  /* ---------- les postures ----------
     Chaque posture dit ou est l'epaule (ou, quand la main est fixee
     sur un appui, ou est cette main), puis dessine le corps autour. */
  var BASES = {

    debout: {
      ep: [142, 96],
      anc: { pied: [148, 278], 'pied-arriere': [124, 278], haut: [286, 34], main: [150, 176] },
      decor: sol(282),
      corps: function (ep) {
        var h = [140, 170], g = [135, 226], p = [142, 278];
        return { seg: [[ep, h], [h, g, p]], tete: [148, 70] };
      }
    },

    assis: {
      ep: [126, 100],
      anc: { pied: [186, 240], 'pied-arriere': [150, 240], haut: [286, 34], main: [140, 180] },
      decor: meuble(96, 178, 190, 180, 282) +
        '<line class="obj" x1="100" y1="178" x2="94" y2="104"/>' + sol(282),
      corps: function (ep) {
        var h = [118, 172], g = [176, 178], p = [182, 240];
        return { seg: [[ep, h], [h, g, p]], tete: [132, 76] };
      }
    },

    /* Dossier incline : le buste part en arriere, l'epaule passe
       derriere la hanche. C'est ce qui met le biceps en etirement. */
    incline: {
      ep: [122, 122],
      anc: { pied: [232, 254], haut: [286, 34], main: [150, 190] },
      decor: '<line class="obj gros" x1="184" y1="196" x2="96" y2="96"/>' +
        meuble(178, 198, 244, 200, 282) + sol(282),
      corps: function (ep) {
        var h = [170, 182], g = [226, 196], p = [232, 254];
        return { seg: [[ep, h], [h, g, p]], tete: [108, 100] };
      }
    },

    /* Assis penche, coude cale sur la cuisse : on construit la cuisse
       autour du coude pour qu'il soit toujours pose dessus. */
    'assis-penche': {
      ep: [152, 126],
      anc: { main: [120, 200] },
      decor: meuble(88, 186, 178, 188, 282) +
        '<line class="obj" x1="92" y1="186" x2="86" y2="118"/>' + sol(282),
      corps: function (ep, jt) {
        var h = [116, 180];
        var g = [jt.coude[0] + 22, jt.coude[1] + 12];
        var p = [g[0] + 8, 246];
        return { seg: [[ep, h], [h, g, p]], tete: [166, 104] };
      }
    },

    /* Buste penche en avant, main libre en appui. */
    penche: {
      ep: [204, 128],
      anc: { pied: [150, 278], main: [214, 186] },
      decor: meuble(196, 184, 262, 186, 282) + sol(282),
      corps: function (ep) {
        var h = [146, 168], g = [140, 224], p = [146, 278];
        return { seg: [[ep, h], [h, g, p]], tete: [224, 114] };
      }
    },

    /* Buste appuye sur un dossier, bras pendants devant. */
    'penche-dossier': {
      ep: [150, 130],
      anc: { main: [150, 214] },
      decor: '<line class="obj gros" x1="176" y1="132" x2="172" y2="206"/>' +
        meuble(160, 208, 232, 210, 282) + sol(282),
      corps: function (ep) {
        var h = [122, 194], g = [118, 236], p = [124, 278];
        return { seg: [[ep, h], [h, g, p]], tete: [168, 112] };
      }
    },

    /* Allonge sur le dos, tete a gauche. */
    couche: {
      ep: [122, 240],
      anc: { main: [150, 250] },
      decor: sol(266),
      corps: function (ep) {
        var h = [194, 246], g = [230, 208], p = [256, 248];
        return { seg: [[ep, h], [h, g, p]], tete: [96, 232] };
      }
    },

    /* Avant-bras poses sur les cuisses, seul le poignet bouge. */
    'assis-avantbras': {
      ep: [136, 108],
      anc: { main: [110, 190] },
      decor: meuble(90, 186, 186, 188, 282) +
        '<line class="obj" x1="94" y1="186" x2="88" y2="116"/>' + sol(282),
      corps: function (ep, jt) {
        var h = [112, 180];
        var g = [jt.poignet[0] - 4, jt.poignet[1] + 6];
        var p = [g[0] + 10, 246];
        return { seg: [[ep, h], [h, g, p]], tete: [150, 86] };
      }
    },

    /* --- postures ou la main est fixee sur un appui --- */

    /* Suspendu a une barre. */
    suspendu: {
      fixe: [162, 48],
      decor: '<line class="obj gros" x1="52" y1="48" x2="272" y2="48"/>' +
        '<line class="obj fin" x1="58" y1="48" x2="58" y2="14"/>' +
        '<line class="obj fin" x1="266" y1="48" x2="266" y2="14"/>',
      corps: function (ep) {
        var h = P(ep, 2, 72), g = P(h, 16, 46), p = P(g, -66, 48);
        return { seg: [[ep, h], [h, g, p]], tete: [ep[0] + 11, ep[1] - 20] };
      }
    },

    /* Dips : mains sur une assise, corps suspendu entre deux appuis. */
    dips: {
      fixe: [176, 142],
      decor: '<line class="obj fade" x1="156" y1="156" x2="226" y2="156"/>' +
        '<line class="obj fin fade" x1="164" y1="156" x2="166" y2="282"/>' +
        '<line class="obj fin fade" x1="220" y1="156" x2="218" y2="282"/>' +
        '<line class="obj gros" x1="168" y1="142" x2="240" y2="142"/>' +
        '<line class="obj fin" x1="176" y1="142" x2="178" y2="282"/>' +
        '<line class="obj fin" x1="234" y1="142" x2="232" y2="282"/>' + sol(282),
      corps: function (ep) {
        var h = P(ep, -6, 70), g = P(h, -25, 46), p = P(g, -95, 46);
        return { seg: [[ep, h], [h, g, p]], tete: [ep[0] + 12, ep[1] - 20] };
      }
    },

    /* Dips sur chaise : mains derriere, talons devant au sol. */
    'dips-banc': {
      fixe: [110, 206],
      decor: meuble(74, 206, 150, 206, 282) +
        '<line class="obj" x1="78" y1="206" x2="72" y2="140"/>' + sol(282),
      corps: function (ep) {
        var h = P(ep, 32, 68), t = [220, 256];
        var j = ik2(h, t, 52, 54, 1);
        return { seg: [[ep, h], [h, j.coude, t]], tete: [ep[0] + 12, ep[1] - 20] };
      }
    },

    /* Pompes : mains au sol, corps en ligne des talons aux epaules. */
    pompe: {
      fixe: [222, 268],
      decor: sol(272),
      corps: function (ep) {
        var t = [56, 264];
        var u = [(ep[0] - t[0]), (ep[1] - t[1])];
        var n = Math.sqrt(u[0] * u[0] + u[1] * u[1]) || 1;
        u = [u[0] / n, u[1] / n];
        var h = [t[0] + u[0] * n * 0.52, t[1] + u[1] * n * 0.52];
        return { seg: [[ep, h, t]], tete: [ep[0] + u[0] * 22 + 2, ep[1] + u[1] * 22 - 12] };
      }
    },

    /* Curl australien : mains sous une table, corps face au plafond. */
    table: {
      fixe: [214, 152],
      decor: '<line class="obj gros" x1="148" y1="148" x2="306" y2="148"/>' +
        '<line class="obj fin" x1="298" y1="150" x2="300" y2="278"/>' + sol(282),
      corps: function (ep) {
        var t = [64, 274];
        var u = [(ep[0] - t[0]), (ep[1] - t[1])];
        var n = Math.sqrt(u[0] * u[0] + u[1] * u[1]) || 1;
        u = [u[0] / n, u[1] / n];
        var h = [t[0] + u[0] * n * 0.5, t[1] + u[1] * n * 0.5];
        return { seg: [[ep, h, t]], tete: [ep[0] + u[0] * 22, ep[1] + u[1] * 22 - 14] };
      }
    }
  };

  /* ---------- squelette complet pour un instant donne ---------- */
  function joints(def, k) {
    var B = BASES[def.base] || BASES.debout;
    var sh = k.sh, el = k.el, pg = k.pg || 0;
    var ep, coude, poignet;

    if (B.fixe) {
      poignet = B.fixe;
      coude = P(poignet, sh + el + 180, L.avb);
      ep = P(coude, sh + 180, L.bras);
    } else {
      ep = B.ep;
      coude = P(ep, sh, L.bras);
      poignet = P(coude, sh + el, L.avb);
    }
    var main = P(poignet, sh + el + pg, L.main);
    var jt = { ep: ep, coude: coude, poignet: poignet, main: main, sh: sh, el: el, pg: pg };

    var c = B.corps(ep, jt);
    jt.seg = c.seg; jt.tete = c.tete;
    jt.decor = B.decor || '';
    jt.anc = B.anc || {};

    /* Le second bras */
    var m = def.bras2 || 'repos';
    if (m === 'miroir') {
      jt.b2 = { coude: coude, poignet: poignet, main: main };
    } else if (m === 'repos' || m === 'basse') {
      var s2 = m === 'basse' ? 4 : 2, e2 = m === 'basse' ? 18 : 8;
      var c2 = P(ep, s2, L.bras), p2 = P(c2, s2 + e2, L.avb);
      jt.b2 = { coude: c2, poignet: p2, main: P(p2, s2 + e2, L.main) };
    } else if (m === 'appui' || m === 'appui-genou' || m === 'serviette') {
      var cible = m === 'serviette' ? P(main, sh + el + pg + 90, 44) : ((B.anc && B.anc.main) || [ep[0] - 20, ep[1] + 80]);
      var k2 = ik2(ep, cible, L.bras, L.avb, -1);
      jt.b2 = { coude: k2.coude, poignet: cible, main: P(cible, k2.sh + 30, L.main) };
    } else {
      jt.b2 = null;
    }
    return jt;
  }

  /* ---------- interpolation entre images cles ---------- */
  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  function cycle(def) {
    var d = 0;
    for (var i = 0; i < def.cles.length; i++) d += def.cles[i].t || 800;
    return d;
  }

  function etat(def, ms) {
    var cl = def.cles, n = cl.length, tot = cycle(def), t = ((ms % tot) + tot) % tot;
    var i = 0;
    while (i < n && t >= (cl[i].t || 800)) { t -= (cl[i].t || 800); i++; }
    if (i >= n) i = n - 1;
    var a = cl[i], b = cl[(i + 1) % n], u = ease(Math.min(1, t / (a.t || 800)));
    return {
      k: {
        sh: le(a.sh, b.sh, u), el: le(a.el, b.el, u),
        pg: le(a.pg || 0, b.pg || 0, u), hi: le(a.hi || 0, b.hi || 0, u)
      },
      i: i, u: u, lbl: a.lbl || ''
    };
  }

  /* ---------- rendu SVG ---------- */
  function pts(a) { return a.map(function (p) { return r(p[0]) + ',' + r(p[1]); }).join(' '); }
  function r(v) { return Math.round(v * 10) / 10; }

  /* Le muscle qui travaille : une ellipse posee sur le segment
     concerne, qui gonfle et s'allume avec l'effort. */
  function muscle(def, jt, hi) {
    var surAvb = def.muscle === 'avantbras';
    var A = surAvb ? jt.coude : jt.ep, B = surAvb ? jt.poignet : jt.coude;
    var a = surAvb ? jt.sh + jt.el : jt.sh;
    var devant = def.muscle !== 'triceps';
    var c = mid(A, B);
    var off = devant ? a + 90 : a - 90;
    var pos = P(c, off, 8);
    return { x: r(pos[0]), y: r(pos[1]), rot: r(90 - a), s: 1 + 0.14 * hi, o: 0.14 + 0.62 * hi };
  }

  /* La charge dans la main. Prise marteau : l'halere est dans l'axe
     de l'avant-bras. Prise supination ou pronation : en travers. */
  function charge(def, jt) {
    var a = jt.sh + jt.el + jt.pg;
    var axe = (def.poignet === 'neutre') ? a : a + 90;
    return { x: r(jt.poignet[0]), y: r(jt.poignet[1]), rot: r(90 - axe) };
  }

  /* L'elastique : il se tend, donc il se detend aussi. La fleche du
     trace et l'epaisseur du trait racontent la tension. */
  function bande(def, jt, ref) {
    var A = jt.anc[def.ancre] || jt.anc.pied || [150, 278];
    if (def.ancre === 'main' && jt.b2) A = jt.b2.poignet;
    var B = jt.poignet, d = dist(A, B);
    var mou = Math.max(0, (ref - d) / (ref || 1));
    var c = mid(A, B), n = ang(A, B) + 90;
    var ctl = P(c, n, 8 + 30 * mou);
    return {
      d: 'M' + r(A[0]) + ' ' + r(A[1]) + ' Q' + r(ctl[0]) + ' ' + r(ctl[1]) + ' ' + r(B[0]) + ' ' + r(B[1]),
      w: r(4.6 - 2.2 * (1 - mou))
    };
  }

  /* Trajectoire de la main sur un cycle complet : le trait pointille
     montre d'un coup d'oeil l'amplitude a respecter. */
  function trajet(def) {
    var tot = cycle(def), out = [], i;
    for (i = 0; i <= 56; i++) {
      var e = etat(def, tot * i / 56);
      out.push(joints(def, e.k).poignet);
    }
    return out;
  }

  function refBande(def) {
    var tot = cycle(def), max = 0, i;
    for (i = 0; i <= 24; i++) {
      var jt = joints(def, etat(def, tot * i / 24).k);
      var A = jt.anc[def.ancre] || jt.anc.pied || [150, 278];
      if (def.ancre === 'main' && jt.b2) A = jt.b2.poignet;
      max = Math.max(max, dist(A, jt.poignet));
    }
    return max;
  }

  /* Un zoom arriere ancre en bas de l'image : la posture reste posee au
     sol, mais les bras tendus vers le haut rentrent dans le cadre. */
  function scene(def) {
    var z = def.zoom || 1;
    return z === 1 ? '<g class="scene">' :
      '<g class="scene" transform="translate(160 300) scale(' + z + ') translate(-160 -300)">';
  }

  function decorAncre(def) {
    if (def.charge !== 'elastique' || def.ancre !== 'haut') return '';
    return '<line class="obj" x1="290" y1="16" x2="290" y2="282"/>' +
      '<line class="obj fin" x1="258" y1="28" x2="290" y2="28"/>';
  }

  /* Boite englobante du bonhomme sur un cycle : sert a cadrer les
     vignettes au plus pres, sinon le personnage est perdu au milieu. */
  function cadre(def, marge) {
    var tot = cycle(def), mn = [1e9, 1e9], mx = [-1e9, -1e9], i;
    for (i = 0; i <= 20; i++) {
      var jt = joints(def, etat(def, tot * i / 20).k);
      var l = [jt.ep, jt.coude, jt.poignet, jt.main,
        [jt.tete[0] - L.tete, jt.tete[1] - L.tete], [jt.tete[0] + L.tete, jt.tete[1] + L.tete]];
      jt.seg.forEach(function (sg) { l = l.concat(sg); });
      l.forEach(function (q) {
        mn[0] = Math.min(mn[0], q[0]); mn[1] = Math.min(mn[1], q[1]);
        mx[0] = Math.max(mx[0], q[0]); mx[1] = Math.max(mx[1], q[1]);
      });
    }
    var w = mx[0] - mn[0] + marge * 2, hh = mx[1] - mn[1] + marge * 2;
    var c = Math.max(w, hh);
    return [r(mn[0] - marge - (c - w) / 2), r(mn[1] - marge - (c - hh) / 2), r(c), r(c)];
  }

  function svgHtml(def, opt) {
    opt = opt || {};
    var jt0 = joints(def, etat(def, 0).k);
    var tr = opt.trajet === false ? '' :
      '<polyline class="traj" points="' + pts(trajet(def)) + '"/>';
    var cls = 'pm-svg' + (def.muscle === 'triceps' ? ' t-tri' : def.muscle === 'avantbras' ? ' t-avb' : ' t-bic');
    var vb = opt.cadre ? cadre(def, 16).join(' ') : '0 0 ' + VB.w + ' ' + VB.h;

    return '<svg class="' + cls + '" viewBox="' + vb + '" aria-hidden="true">' +
      (opt.cadre ? '<g class="scene">' : scene(def)) +
      '<g class="decor">' + (jt0.decor || '') + decorAncre(def) + '</g>' +
      tr +
      '<polyline class="b2" points=""/>' +
      '<polyline class="corps" points=""/>' +
      '<circle class="tete" r="' + L.tete + '" cx="0" cy="0"/>' +
      '<ellipse class="mus" rx="19" ry="11"/>' +
      '<path class="bande" d=""/>' +
      '<polyline class="bras" points=""/>' +
      '<line class="main" x1="0" y1="0" x2="0" y2="0"/>' +
      '<g class="charge"><line class="barre" x1="-13" y1="0" x2="13" y2="0"/>' +
      '<rect class="plaque" x="-17" y="-9" width="7" height="18" rx="2.5"/>' +
      '<rect class="plaque" x="10" y="-9" width="7" height="18" rx="2.5"/></g>' +
      '</g></svg>';
  }

  /* ---------- instance animee ---------- */
  var vivants = [], ticking = false;

  function tick(now) {
    ticking = false;
    var actifs = 0;
    for (var i = 0; i < vivants.length; i++) {
      var it = vivants[i];
      if (!it.mort && it.on && it.vu) { it.ms += (now - it.last) * it.vit; it.peindre(); actifs++; }
      it.last = now;
    }
    vivants = vivants.filter(function (x) { return !x.mort; });
    if (actifs) relancer();
  }
  function relancer() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(tick);
  }

  function creer(hote, def, opt) {
    opt = opt || {};
    hote.innerHTML = svgHtml(def, opt);
    var svg = hote.querySelector('svg');
    var el = {
      corps: svg.querySelector('.corps'), b2: svg.querySelector('.b2'),
      tete: svg.querySelector('.tete'), bras: svg.querySelector('.bras'),
      main: svg.querySelector('.main'), mus: svg.querySelector('.mus'),
      charge: svg.querySelector('.charge'), bande: svg.querySelector('.bande')
    };
    var avecCharge = def.charge === 'haltere' || def.charge === 'sac';
    var avecBande = def.charge === 'elastique' || def.charge === 'serviette';
    if (!avecCharge) el.charge.style.display = 'none';
    if (!avecBande) el.bande.style.display = 'none';
    var ref = avecBande ? refBande(def) : 0;

    var it = {
      ms: 0, last: performance.now(), on: opt.auto !== false, vit: opt.vitesse || 1,
      vu: true, mort: false, def: def, svg: svg, lbl: opt.lbl || null, jauge: opt.jauge || null
    };

    it.peindre = function () {
      var e = etat(def, it.ms), jt = joints(def, e.k);
      var s = [];
      jt.seg.forEach(function (p) { s.push(pts(p)); });
      el.corps.setAttribute('points', s.join(' '));
      el.tete.setAttribute('cx', r(jt.tete[0]));
      el.tete.setAttribute('cy', r(jt.tete[1]));
      el.bras.setAttribute('points', pts([jt.ep, jt.coude, jt.poignet]));
      el.main.setAttribute('x1', r(jt.poignet[0])); el.main.setAttribute('y1', r(jt.poignet[1]));
      el.main.setAttribute('x2', r(jt.main[0])); el.main.setAttribute('y2', r(jt.main[1]));
      if (jt.b2) {
        el.b2.setAttribute('points', pts([jt.ep, jt.b2.coude, jt.b2.poignet]));
        el.b2.style.display = '';
      } else el.b2.style.display = 'none';

      var m = muscle(def, jt, e.k.hi);
      el.mus.setAttribute('transform', 'translate(' + m.x + ' ' + m.y + ') rotate(' + m.rot + ') scale(' + r(m.s) + ')');
      el.mus.setAttribute('opacity', r(m.o));

      if (avecCharge) {
        var c = charge(def, jt);
        el.charge.setAttribute('transform', 'translate(' + c.x + ' ' + c.y + ') rotate(' + c.rot + ')');
      }
      if (avecBande) {
        var b = bande(def, jt, ref);
        el.bande.setAttribute('d', b.d);
        el.bande.setAttribute('stroke-width', b.w);
      }
      if (it.lbl && it.lblTxt !== e.lbl) { it.lbl.textContent = e.lbl; it.lblTxt = e.lbl; }
      if (it.jauge) it.jauge.style.width = Math.round((it.ms % cycle(def)) / cycle(def) * 100) + '%';
    };

    it.play = function () { it.on = true; it.last = performance.now(); relancer(); };
    it.pause = function () { it.on = false; };
    it.bascule = function () { if (it.on) it.pause(); else it.play(); return it.on; };
    it.vitesse = function (v) { it.vit = v; };
    it.detruire = function () { it.mort = true; if (it.io) it.io.disconnect(); };

    /* On n'anime que ce qui est a l'ecran : une liste d'exercices
       peut afficher vingt bonshommes sans faire chauffer le telephone. */
    if (window.IntersectionObserver) {
      it.io = new IntersectionObserver(function (ent) {
        it.vu = ent[0].isIntersecting;
        if (it.vu) { it.last = performance.now(); relancer(); }
      }, { rootMargin: '80px' });
      it.io.observe(hote);
    }

    vivants.push(it);
    it.peindre();
    relancer();
    return it;
  }

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) { vivants.forEach(function (i) { i.last = performance.now(); }); relancer(); }
  });

  return {
    creer: creer,
    joints: joints,
    etat: etat,
    cycle: cycle,
    bases: BASES,
    /* Image fixe, pour les vignettes de liste sans animation. */
    fixe: function (def, idx) {
      var cl = def.cles, i = idx == null ? 1 % cl.length : idx;
      var jt = joints(def, { sh: cl[i].sh, el: cl[i].el, pg: cl[i].pg || 0, hi: cl[i].hi || 0 });
      var s = [];
      jt.seg.forEach(function (p) { s.push(pts(p)); });
      var m = muscle(def, jt, cl[i].hi || 0);
      return '<svg class="pm-svg" viewBox="0 0 ' + VB.w + ' ' + VB.h + '" aria-hidden="true">' +
        scene(def) + '<g class="decor">' + jt.decor + decorAncre(def) + '</g>' +
        '<polyline class="corps" points="' + s.join(' ') + '"/>' +
        '<circle class="tete" r="' + L.tete + '" cx="' + r(jt.tete[0]) + '" cy="' + r(jt.tete[1]) + '"/>' +
        '<ellipse class="mus" rx="19" ry="11" opacity="' + r(m.o) + '" transform="translate(' + m.x + ' ' + m.y + ') rotate(' + m.rot + ')"/>' +
        '<polyline class="bras" points="' + pts([jt.ep, jt.coude, jt.poignet]) + '"/>' +
        '</g></svg>';
    }
  };
})();
