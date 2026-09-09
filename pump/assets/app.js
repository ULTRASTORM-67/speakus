/* ============================================================
   PUMP — moteur de l'application
   ============================================================ */
(function () {
  'use strict';

  var LS = 'pump_state_v1';
  var app = document.getElementById('app');
  var EXOS = window.EXOS, CRITERES = window.CRITERES, PROGRAMMES = window.PROGRAMMES;
  var PAR_ID = {}; EXOS.forEach(function (e) { PAR_ID[e.id] = e; });

  /* ================= OUTILS ================= */
  function ymd(d) {
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  function parseYmd(s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function jours(a, b) { return Math.round((parseYmd(b) - parseYmd(a)) / 86400000); }
  var AUJ = ymd(new Date());

  function h(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function plur(n, mot) { return n + ' ' + mot + (n > 1 ? 's' : ''); }
  function $(s) { return app.querySelector(s); }
  function $$(s) { return Array.prototype.slice.call(app.querySelectorAll(s)); }

  var toastT;
  function toast(m) {
    var t = document.getElementById('toast');
    t.textContent = m; t.className = 'toast on';
    clearTimeout(toastT); toastT = setTimeout(function () { t.className = 'toast'; }, 2400);
  }

  /* ================= ÉTAT ================= */
  function neuf() {
    return {
      cree: AUJ, prog: null, si: 0,
      hist: [],        // séances terminées
      perf: {},        // meilleure performance par exercice
      mesures: [],     // tour de bras
      prot: {},        // compteur de protéines par jour
      pending: null,   // séance en cours
      profil: { poids: 75, taille: 178, age: 30, sexe: 'h', act: 1.55, obj: 'lente' },
      reglages: { son: true }
    };
  }
  function charger() {
    var s = null;
    try { s = JSON.parse(localStorage.getItem(LS)); } catch (e) { }
    if (!s || !s.cree) return neuf();
    var d = neuf();
    for (var k in d) if (!(k in s)) s[k] = d[k];
    for (var k2 in d.profil) if (!(k2 in s.profil)) s.profil[k2] = d.profil[k2];
    return s;
  }
  function sauver() { try { localStorage.setItem(LS, JSON.stringify(S)); } catch (e) { } }
  var S = charger();

  /* ================= NOTES ================= */
  function note(ex) {
    var t = 0;
    CRITERES.forEach(function (c) { t += (ex.s[c.k] / 5) * c.poids; });
    return Math.round(t * 100);
  }
  function grade(n) { return n >= 88 ? 'S' : n >= 78 ? 'A' : n >= 68 ? 'B' : 'C'; }
  EXOS.forEach(function (e) { e.note = note(e); e.grade = grade(e.note); });
  var CLASSE = EXOS.slice().sort(function (a, b) { return b.note - a.note; });

  /* ================= ANIMATIONS ================= */
  var vivants = [];
  function tuerAnims() { vivants.forEach(function (a) { a.detruire(); }); vivants = []; }
  function monterAnims() {
    $$('[data-anim]').forEach(function (el) {
      var ex = PAR_ID[el.getAttribute('data-anim')];
      if (!ex) return;
      var grand = el.getAttribute('data-grand') === '1';
      var boite = el.closest ? el.closest('.card') : el.parentNode.parentNode;
      var lbl = grand && boite ? boite.querySelector('.scene-lbl b') : null;
      var jau = grand && boite ? boite.querySelector('.jauge > i') : null;
      vivants.push(window.Anim.creer(el, ex.anim, { lbl: lbl, jauge: jau, trajet: grand, cadre: !grand }));
    });
  }

  /* ================= ROUTEUR ================= */
  var V = { n: 'accueil', a: null };
  function go(n, a) {
    V = { n: n, a: a || null };
    window.scrollTo(0, 0);
    peindre();
  }
  var VUES = {};
  function peindre() {
    tuerAnims();
    app.innerHTML = (VUES[V.n] || VUES.accueil)(V.a);
    lier();
    monterAnims();
    barreNav();
  }
  function lier() {
    $$('[data-go]').forEach(function (el) {
      el.onclick = function () { go(el.getAttribute('data-go'), el.getAttribute('data-arg')); };
    });
    $$('[data-act]').forEach(function (el) {
      el.onclick = function (ev) { ACT[el.getAttribute('data-act')](el, el.getAttribute('data-arg'), ev); };
    });
    $$('.acc').forEach(function (el) {
      el.onclick = function () { el.classList.toggle('on'); };
    });
  }

  var ONGLETS = [
    { k: 'accueil', i: '🏠', n: 'Accueil' },
    { k: 'exos', i: '💪', n: 'Exos' },
    { k: 'seance', i: '🏋️', n: 'Séance' },
    { k: 'bouffe', i: '🍣', n: 'Nourriture' },
    { k: 'progres', i: '📈', n: 'Progrès' }
  ];
  function barreNav() {
    var n = document.getElementById('nav');
    var cur = V.n === 'exo' ? 'exos' : (V.n === 'session' || V.n === 'bilan') ? 'seance' : V.n;
    n.innerHTML = ONGLETS.map(function (o) {
      return '<button data-nav="' + o.k + '" class="' + (cur === o.k ? 'on' : '') + '">' +
        '<em>' + o.i + '</em>' + o.n + '</button>';
    }).join('');
    Array.prototype.slice.call(n.children).forEach(function (b) {
      b.onclick = function () { go(b.getAttribute('data-nav')); };
    });
  }

  /* ================= EN-TÊTE ================= */
  function entete() {
    var sem = seancesSemaine();
    return '<div class="hdr">' +
      '<div class="logo"><span class="dot">💪</span><span><i>PUMP</i></span></div>' +
      '<div class="sp"></div>' +
      '<span class="chip fire">🔥 <b>' + sem + '</b> cette semaine</span>' +
      '<button class="iconbtn" data-go="reglages">⚙</button>' +
      '</div>';
  }

  /* ================= CALCULS ================= */
  function debutSemaine(d) {
    var x = parseYmd(d), j = (x.getDay() + 6) % 7;
    x.setDate(x.getDate() - j); return ymd(x);
  }
  function seancesSemaine() {
    var s = debutSemaine(AUJ), n = 0;
    S.hist.forEach(function (x) { if (x.d >= s) n++; });
    return n;
  }
  function serieSemaines() {
    if (!S.hist.length) return 0;
    var sem = {}, n = 0;
    S.hist.forEach(function (x) { sem[debutSemaine(x.d)] = 1; });
    var cur = parseYmd(debutSemaine(AUJ));
    if (!sem[ymd(cur)]) cur.setDate(cur.getDate() - 7);
    while (sem[ymd(cur)]) { n++; cur.setDate(cur.getDate() - 7); }
    return n;
  }
  function prog() { return PROGRAMMES.filter(function (p) { return p.id === S.prog; })[0] || null; }
  function seanceDuJour() {
    var p = prog(); if (!p) return null;
    return p.seances[S.si % p.seances.length];
  }
  function volume(log) {
    var v = 0;
    for (var k in log) log[k].forEach(function (s) { v += (+s.r || 0) * (+s.w || 0); });
    return Math.round(v);
  }
  function dernierBras() { return S.mesures.length ? S.mesures[S.mesures.length - 1].cm : null; }
  function palierCourant() {
    var cm = dernierBras(), P = window.PALIERS, i, cur = -1;
    if (cm == null) return { i: -1, suivant: P[0] };
    for (i = 0; i < P.length; i++) if (cm >= P[i].cm) cur = i;
    return { i: cur, suivant: P[cur + 1] || null };
  }

  /* ================= ACCUEIL ================= */
  VUES.accueil = function () {
    var p = prog(), sc = seanceDuJour(), html = entete();
    var cm = dernierBras(), pal = palierCourant();

    html += '<div class="card glow hero">' +
      '<div class="eyebrow">Objectif bras</div>' +
      '<h1>' + (cm ? cm.toFixed(1) + ' cm de tour de bras' : 'Des bras à plateau à sushis') + '</h1>' +
      '<p class="lead">' +
      (pal.suivant
        ? 'Prochain palier : <b>' + h(pal.suivant.titre) + '</b> à ' + pal.suivant.cm + ' cm' +
        (cm ? ' — il te manque ' + (pal.suivant.cm - cm).toFixed(1) + ' cm.' : '.')
        : 'Tous les paliers sont franchis. Le bar est ouvert.') +
      '</p></div>';

    if (S.pending) {
      var pp = PROGRAMMES.filter(function (x) { return x.id === S.pending.prog; })[0];
      var ps = S.pending.libre ? { nom: 'Exercice seul', exos: S.pending.exos } : pp.seances[S.pending.si];
      html += '<div class="card glow"><h2>Séance en pause</h2>' +
        '<p class="lead">Tu en étais à l\'exercice ' + (S.pending.i + 1) + ' sur ' + ps.exos.length + ' — ' + h(ps.nom) + '.</p>' +
        '<div class="btnrow"><button class="btn primary" data-go="session">Reprendre</button>' +
        '<button class="btn ghost" data-act="abandonner">Abandonner</button></div></div>';
    }

    if (!p) {
      html += '<div class="card"><h2>Choisis ton programme</h2>' +
        '<p class="lead">Trois séances par semaine est le meilleur compromis pour la plupart des gens. Tu pourras changer quand tu veux.</p>' +
        '<button class="btn primary block" data-go="seance">Voir les programmes</button></div>';
    } else if (!S.pending) {
      html += '<div class="card"><div class="eyebrow">Séance du jour</div>' +
        '<h2>' + h(sc.nom) + '</h2>' +
        '<p class="lead">' + sc.exos.length + ' exercices · ' + h(p.duree) + ' · programme ' + h(p.nom) + '</p>' +
        '<div style="margin:12px 0 14px">' + sc.exos.map(function (e) {
          var x = PAR_ID[e.id];
          return '<div style="display:flex;gap:9px;align-items:center;padding:6px 0;font-size:14.5px">' +
            '<span class="note" style="margin:0"><span class="g g-' + x.grade + '" style="width:26px;height:26px;font-size:12px;border-radius:8px">' + x.grade + '</span></span>' +
            '<span style="flex:1">' + h(x.nom) + '</span>' +
            '<span style="color:var(--txt3);font-size:13px">' + e.series + ' × ' + h(e.reps) + '</span></div>';
        }).join('') + '</div>' +
        '<button class="btn primary block" data-act="demarrer">Commencer la séance</button></div>';
    }

    html += '<div class="grid3">' +
      '<div class="stat"><div class="k">Séances</div><div class="v">' + S.hist.length + '</div><div class="s">au total</div></div>' +
      '<div class="stat"><div class="k">Série</div><div class="v">' + serieSemaines() + '</div><div class="s">semaines d\'affilée</div></div>' +
      '<div class="stat"><div class="k">Tour de bras</div><div class="v">' + (cm ? cm.toFixed(1) : '—') + '</div><div class="s">cm' + (cm ? '' : ' · à mesurer') + '</div></div>' +
      '</div>';

    var pr = window.PRINCIPES[(jours(S.cree, AUJ) + 1) % window.PRINCIPES.length];
    html += '<div class="card"><div class="eyebrow">Le point du jour</div>' +
      '<h3>' + h(pr.t) + '</h3><p class="lead">' + h(pr.d) + '</p></div>';

    html += '<div class="card"><h2>Les 3 exercices les mieux notés</h2>' +
      '<p class="lead">Sur 22 exercices évalués sur quatre critères.</p><div style="margin-top:12px">' +
      CLASSE.slice(0, 3).map(carteExo).join('') + '</div>' +
      '<button class="btn ghost block" data-go="exos" style="margin-top:6px">Voir le classement complet</button></div>';

    return html;
  };

  /* ================= LISTE DES EXERCICES ================= */
  var filtre = { zone: 'tout', mat: 'tout' };

  function carteExo(ex) {
    return '<button class="exo" data-go="exo" data-arg="' + ex.id + '">' +
      '<div class="scene-box mini"><div data-anim="' + ex.id + '" style="width:100%;height:100%"></div></div>' +
      '<div style="flex:1;min-width:0">' +
      '<div class="nom">' + h(ex.nom) + '</div>' +
      '<div class="meta">' + h(ex.muscles[0]) + '</div>' +
      '<div class="tags"><span class="tag z-' + ex.zone + '">' + ex.zone + '</span>' +
      '<span class="tag mat">' + h(ex.mat[0]) + '</span></div>' +
      '</div>' +
      '<div class="note"><span class="g g-' + ex.grade + '">' + ex.grade + '</span><span class="n">' + ex.note + '</span></div>' +
      '</button>';
  }

  VUES.exos = function () {
    var html = entete();
    html += '<div class="card glow"><h2>Classement par efficacité</h2>' +
      '<p class="lead">Chaque exercice est noté sur 100 à partir de quatre critères : tension en étirement, charge progressive possible à la maison, ciblage du muscle et accessibilité. Le détail du calcul est visible sur chaque fiche.</p></div>';

    html += '<div class="filtres">' +
      ['tout', 'biceps', 'triceps', 'avant-bras'].map(function (z) {
        return '<button data-act="fz" data-arg="' + z + '" class="' + (filtre.zone === z ? 'on' : '') + '">' +
          (z === 'tout' ? 'Tout' : z.charAt(0).toUpperCase() + z.slice(1)) + '</button>';
      }).join('') +
      '<button data-act="fm" data-arg="aucun" class="' + (filtre.mat === 'aucun' ? 'on' : '') + '">Sans matériel</button>' +
      '<button data-act="fm" data-arg="élastique" class="' + (filtre.mat === 'élastique' ? 'on' : '') + '">Élastique</button>' +
      '<button data-act="fm" data-arg="haltères" class="' + (filtre.mat === 'haltères' ? 'on' : '') + '">Haltères</button>' +
      '</div>';

    var l = CLASSE.filter(function (e) {
      if (filtre.zone !== 'tout' && e.zone !== filtre.zone) return false;
      if (filtre.mat !== 'tout' && e.mat.join(' ').indexOf(filtre.mat) < 0) return false;
      return true;
    });
    html += l.length ? l.map(carteExo).join('') : '<div class="vide">Aucun exercice avec ces filtres.</div>';
    return html;
  };

  /* ================= FICHE D'UN EXERCICE ================= */
  VUES.exo = function (id) {
    var ex = PAR_ID[id]; if (!ex) return VUES.exos();
    var html = '<button class="retour" data-go="exos">‹ Retour aux exercices</button>';

    html += '<div class="card">' +
      '<div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:14px">' +
      '<div style="flex:1"><h2>' + h(ex.nom) + '</h2>' +
      '<div class="tags" style="margin-top:7px"><span class="tag z-' + ex.zone + '">' + ex.zone + '</span>' +
      ex.muscles.map(function (m) { return '<span class="tag">' + h(m) + '</span>'; }).join('') + '</div></div>' +
      '<div class="note"><span class="g g-' + ex.grade + '">' + ex.grade + '</span><span class="n">' + ex.note + '/100</span></div>' +
      '</div>' +
      '<div class="scene-box grand"><div data-anim="' + ex.id + '" data-grand="1" style="width:100%;height:100%"></div></div>' +
      '<div class="scene-lbl">▶ <b></b></div><div class="jauge"><i style="width:0"></i></div>' +
      '<div class="animctl">' +
      '<button data-act="pause">⏸ Pause</button>' +
      '<button data-act="vit" data-arg="0.5">Ralenti</button>' +
      '<button data-act="vit" data-arg="1" class="on">Normal</button>' +
      '</div>' +
      '<p class="lead" style="margin-top:12px;font-size:13px;color:var(--txt3)">Schéma animé : le muscle qui s\'allume est celui qui travaille, le pointillé montre la trajectoire de la main.</p>' +
      '</div>';

    html += '<div class="card"><h3>Pourquoi cette note</h3>' +
      '<p class="lead" style="margin-bottom:14px">' + h(ex.pourquoi) + '</p>' +
      '<div class="crit">' + CRITERES.map(function (c) {
        return '<div class="l"><span>' + h(c.nom) + '</span><b>' + ex.s[c.k] + '/5 · poids ' + Math.round(c.poids * 100) + ' %</b></div>' +
          '<div class="bar"><i style="width:' + (ex.s[c.k] / 5 * 100) + '%"></i></div>';
      }).join('') + '</div></div>';

    html += '<div class="card"><h3>Comment faire</h3>' +
      '<ol class="liste ok">' + ex.exec.map(function (x) { return '<li>' + h(x) + '</li>'; }).join('') + '</ol>' +
      '<div class="kv" style="margin-top:14px">' +
      '<div><div class="k">Séries</div><div class="v">' + h(ex.series) + '</div></div>' +
      '<div><div class="k">Répétitions</div><div class="v">' + h(ex.reps) + '</div></div>' +
      '<div><div class="k">Repos</div><div class="v">' + h(ex.repos) + '</div></div>' +
      '<div><div class="k">Tempo</div><div class="v">' + h(ex.tempo) + '</div></div>' +
      '</div>' +
      '<p class="lead" style="margin-top:10px;font-size:12.5px;color:var(--txt3)">Tempo : secondes de descente – pause en bas – secondes de montée.</p>' +
      '</div>';

    html += '<div class="card"><h3>Les erreurs qui coûtent cher</h3>' +
      '<ul class="liste err">' + ex.erreurs.map(function (x) { return '<li>' + h(x) + '</li>'; }).join('') + '</ul></div>';

    html += '<div class="card"><h3>Si tu n\'as pas le matériel</h3>' +
      '<p class="lead">' + h(ex.variante) + '</p>' +
      '<a class="mini-lien acc" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=' +
      encodeURIComponent(ex.yt) + '">▶ Chercher une démonstration en vidéo</a></div>';

    html += '<button class="btn primary block" data-act="exoseul" data-arg="' + ex.id + '">Travailler cet exercice maintenant</button>';
    return html;
  };

  /* ================= PROGRAMMES / SÉANCE ================= */
  VUES.seance = function () {
    var html = entete(), p = prog();

    if (p) {
      var sc = seanceDuJour();
      html += '<div class="card glow"><div class="eyebrow">Programme en cours</div>' +
        '<h2>' + h(p.nom) + '</h2>' +
        '<p class="lead">' + p.jours + ' séances par semaine · ' + h(p.duree) + ' · prochaine : <b>' + h(sc.nom) + '</b></p>' +
        '<div class="btnrow" style="margin-top:12px">' +
        '<button class="btn primary" data-act="demarrer">Commencer</button>' +
        '<button class="btn ghost" data-act="sauter">Séance suivante</button></div>' +
        '<p class="lead" style="margin-top:12px;font-size:13.5px">' + h(p.conseil) + '</p></div>';
    }

    html += '<div class="card"><h2>' + (p ? 'Changer de programme' : 'Choisis ton programme') + '</h2>' +
      '<p class="lead">Tous se font à la maison. Le matériel utilisé est indiqué sur chaque exercice.</p></div>';

    PROGRAMMES.forEach(function (x) {
      var on = S.prog === x.id;
      html += '<div class="card"' + (on ? ' style="border-color:rgba(255,107,53,.4)"' : '') + '>' +
        '<div style="display:flex;align-items:baseline;gap:8px"><h3 style="margin:0">' + h(x.nom) + '</h3>' +
        '<span style="margin-left:auto;font-size:12.5px;color:var(--txt3)">' + x.jours + '×/sem · ' + h(x.duree) + '</span></div>' +
        '<p class="lead" style="margin-top:6px">' + h(x.pour) + '</p>' +
        '<div style="margin:10px 0">' + x.seances.map(function (s) {
          return '<div style="font-size:13.5px;color:var(--txt2);padding:3px 0">• <b>' + h(s.nom) + '</b> — ' +
            s.exos.map(function (e) { return h(PAR_ID[e.id].nom); }).join(', ') + '</div>';
        }).join('') + '</div>' +
        '<button class="btn ' + (on ? 'ghost' : 'primary') + ' block" data-act="choisir" data-arg="' + x.id + '">' +
        (on ? 'Programme actuel' : 'Choisir ce programme') + '</button></div>';
    });

    html += '<div class="card"><h2>Les règles qui font grossir un bras</h2>' +
      window.PRINCIPES.map(function (x) {
        return '<div class="acc"><div class="t">' + h(x.t) + '<em>▾</em></div><div class="d">' + h(x.d) + '</div></div>';
      }).join('') + '</div>';

    html += '<div class="card"><h2>Techniques d\'intensification</h2>' +
      '<p class="lead">À utiliser une fois que la base est solide, pas avant.</p>' +
      window.TECHNIQUES.map(function (x) {
        return '<div class="acc"><div class="t">' + h(x.nom) + '<em>▾</em></div><div class="d">' + h(x.d) +
          '<div style="margin-top:6px;color:var(--acc)">Quand : ' + h(x.quand) + '</div></div></div>';
      }).join('') + '</div>';

    return html;
  };

  /* ================= SÉANCE EN COURS ================= */
  var chrono = null;

  function seancePending() {
    if (!S.pending) return null;
    if (S.pending.libre) return { nom: S.pending.nom, exos: S.pending.exos };
    var p = PROGRAMMES.filter(function (x) { return x.id === S.pending.prog; })[0];
    return p ? p.seances[S.pending.si] : null;
  }

  VUES.session = function () {
    var sc = seancePending();
    if (!sc) { S.pending = null; sauver(); return VUES.accueil(); }
    var P = S.pending, ligne = sc.exos[P.i], ex = PAR_ID[ligne.id];
    var faites = P.log[ex.id] || [];
    var best = S.perf[ex.id];
    var corps = ex.anim.charge === 'corps';

    var html = '<div class="hdr"><button class="iconbtn" data-act="pausesession">✕</button>' +
      '<div class="sp" style="text-align:center;font-weight:800;font-size:14px">' + h(sc.nom) + '</div>' +
      '<span class="chip">' + (P.i + 1) + '/' + sc.exos.length + '</span></div>';

    html += '<div class="prog">' + sc.exos.map(function (_, i) {
      return '<i class="' + (i <= P.i ? 'on' : '') + '"></i>';
    }).join('') + '</div>';

    html += '<div class="card">' +
      '<div style="display:flex;align-items:flex-start;gap:10px"><div style="flex:1">' +
      '<h2>' + h(ex.nom) + '</h2>' +
      '<p class="lead" style="margin:4px 0 0">' + ligne.series + ' séries de ' + h(ligne.reps) +
      (ligne.repos ? ' · ' + ligne.repos + ' s de repos' : '') + '</p></div>' +
      '<span class="note"><span class="g g-' + ex.grade + '">' + ex.grade + '</span></span></div>' +
      '<div class="scene-box grand" style="margin-top:12px"><div data-anim="' + ex.id + '" data-grand="1" style="width:100%;height:100%"></div></div>' +
      '<div class="scene-lbl">▶ <b></b></div><div class="jauge"><i style="width:0"></i></div>' +
      (best ? '<div class="dernier">Dernière fois : ' + best.r + ' répétitions' + (best.w ? ' à ' + best.w + ' kg' : '') + ' — fais mieux.</div>' : '') +
      (ligne.note ? '<div class="callout" style="margin-top:12px">' + h(ligne.note) + '</div>' : '') +
      '</div>';

    html += '<div class="card"><h3>Tes séries</h3>';
    for (var i = 0; i < ligne.series; i++) {
      var f = faites[i];
      html += '<div class="serie' + (f ? ' faite' : '') + '">' +
        '<span class="num">' + (i + 1) + '</span>' +
        '<input type="number" inputmode="numeric" data-r="' + i + '" placeholder="reps" value="' + (f ? f.r : '') + '">' +
        (corps ? '<input type="number" inputmode="decimal" data-w="' + i + '" placeholder="lest" value="' + (f && f.w ? f.w : '') + '"><span class="u">kg</span>'
          : '<input type="number" inputmode="decimal" data-w="' + i + '" placeholder="poids" value="' + (f && f.w ? f.w : '') + '"><span class="u">kg</span>') +
        '<button class="go" data-act="valider" data-arg="' + i + '">' + (f ? '✓' : 'OK') + '</button>' +
        '</div>';
    }
    html += '<p class="lead" style="margin:12px 0 0;font-size:13px;color:var(--txt3)">' +
      'Arrête chaque série 1 à 2 répétitions avant l\'échec. Quand tu atteins le haut de la fourchette sur toutes les séries, monte la charge la fois suivante.</p></div>';

    html += '<div class="btnrow">' +
      (P.i < sc.exos.length - 1
        ? '<button class="btn primary block" data-act="exosuivant">Exercice suivant ›</button>'
        : '<button class="btn ok block" data-act="finir">Terminer la séance</button>') +
      '</div>';
    html += '<button class="btn ghost block" data-go="exo" data-arg="' + ex.id + '" style="margin-top:9px">Voir la fiche détaillée</button>';
    return html;
  };

  VUES.bilan = function (d) {
    var s = S.hist[S.hist.length - 1] || {};
    var html = entete();
    html += '<div class="card glow hero"><div class="eyebrow">Séance terminée</div>' +
      '<h1>C\'est plié 💪</h1>' +
      '<p class="lead">' + h(s.seance || '') + ' · ' + (s.duree || 0) + ' min · ' + plur(s.exos || 0, 'exercice') + '</p></div>';
    html += '<div class="grid3">' +
      '<div class="stat"><div class="k">Volume</div><div class="v">' + (s.vol || 0) + '</div><div class="s">kg soulevés</div></div>' +
      '<div class="stat"><div class="k">Séries</div><div class="v">' + (s.series || 0) + '</div><div class="s">au total</div></div>' +
      '<div class="stat"><div class="k">Cette semaine</div><div class="v">' + seancesSemaine() + '</div><div class="s">séances</div></div>' +
      '</div>';
    html += '<div class="card"><h3>Maintenant, mange</h3>' +
      '<p class="lead">Le muscle se construit dans les heures qui suivent, pas pendant la séance. Vise 30 à 40 g de protéines dans les deux heures.</p>' +
      '<button class="btn primary block" data-go="bouffe">Ouvrir le compteur de protéines</button></div>';
    html += '<button class="btn ghost block" data-go="accueil">Retour à l\'accueil</button>';
    return html;
  };

  /* ================= NOURRITURE ================= */
  function besoins() {
    var p = S.profil;
    var bmr = 10 * p.poids + 6.25 * p.taille - 5 * p.age + (p.sexe === 'h' ? 5 : -161);
    var tdee = bmr * p.act;
    var sur = p.obj === 'rapide' ? 450 : p.obj === 'maintien' ? 0 : 250;
    var kcal = Math.round((tdee + sur) / 10) * 10;
    var prot = Math.round(1.8 * p.poids);
    var lip = Math.round(0.9 * p.poids);
    var glu = Math.max(0, Math.round((kcal - prot * 4 - lip * 9) / 4));
    return { bmr: Math.round(bmr), tdee: Math.round(tdee), kcal: kcal, prot: prot, lip: lip, glu: glu, sur: sur };
  }
  function protJour() { return S.prot[AUJ] || { g: 0, kcal: 0 }; }

  function portion(al, g) {
    if (al.pu) {
      var n = Math.max(1, Math.round(g / al.pu));
      return n + ' ' + al.un + (n > 1 && al.un.slice(-1) !== 's' && al.un.indexOf(' ') < 0 ? 's' : '');
    }
    return Math.round(g / 5) * 5 + (al.id === 'lait' ? ' ml' : ' g');
  }

  var sousB = 'jour', catA = 'prot';

  VUES.bouffe = function () {
    var b = besoins(), pj = protJour(), pct = Math.min(1, pj.g / b.prot);
    var ALI = window.ALIMENTS, parId = {}; ALI.forEach(function (a) { parId[a.id] = a; });
    var html = entete();
    html += '<div class="filtres">' +
      [['jour', 'Besoins & journée'], ['alim', 'Aliments'], ['regles', 'Règles & compléments']]
        .map(function (o) {
          return '<button data-act="sb" data-arg="' + o[0] + '" class="' + (sousB === o[0] ? 'on' : '') + '">' + o[1] + '</button>';
        }).join('') + '</div>';
    if (sousB === 'jour') {

    /* --- compteur du jour --- */
    var C = 2 * Math.PI * 46;
    html += '<div class="card glow"><h2>Protéines du jour</h2>' +
      '<div class="anneau" style="margin-top:14px">' +
      '<svg viewBox="0 0 110 110"><defs><linearGradient id="gradp" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="#FF8A3D"/><stop offset="100%" stop-color="#FF3D68"/></linearGradient></defs>' +
      '<circle class="fond" cx="55" cy="55" r="46"/>' +
      '<circle class="arc" cx="55" cy="55" r="46" transform="rotate(-90 55 55)" ' +
      'stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (C * (1 - pct)).toFixed(1) + '"/></svg>' +
      '<div><div class="big">' + pj.g + ' <span style="font-size:16px;color:var(--txt3)">/ ' + b.prot + ' g</span></div>' +
      '<div class="txt">' + (pj.g >= b.prot ? 'Objectif atteint. Le muscle a de quoi travailler.' :
        'Il te manque ' + (b.prot - pj.g) + ' g — soit environ ' + plur(Math.ceil((b.prot - pj.g) / 25), 'portion') + '.') + '</div>' +
      '<div class="txt" style="margin-top:4px;color:var(--txt3)">' + pj.kcal + ' kcal pointées sur ' + b.kcal + '</div></div></div>' +
      '<div class="quick">' + window.QUICK_PROT.map(function (q, i) {
        return '<button data-act="addprot" data-arg="' + i + '">' + h(q.nom) + ' <b>+' + q.g + '</b></button>';
      }).join('') + '</div>' +
      '<button class="btn ghost sm" data-act="razprot" style="margin-top:12px">Remettre le compteur à zéro</button>' +
      '</div>';

    /* --- besoins --- */
    html += '<div class="card"><h2>Tes besoins</h2>' +
      '<p class="lead">Calcul Mifflin-St Jeor, le plus fiable sans mesure en laboratoire. Ajuste avec la balance : si tu ne prends pas 250 à 400 g par semaine, ajoute 200 kcal.</p>' +
      '<div class="macros" style="margin-top:14px">' +
      '<div class="macro"><div class="k">Calories</div><div class="v">' + b.kcal + '</div></div>' +
      '<div class="macro p"><div class="k">Protéines</div><div class="v">' + b.prot + ' g</div></div>' +
      '<div class="macro g"><div class="k">Glucides</div><div class="v">' + b.glu + ' g</div></div>' +
      '<div class="macro l"><div class="k">Lipides</div><div class="v">' + b.lip + ' g</div></div>' +
      '</div>' +
      '<div class="kv" style="margin-top:12px">' +
      '<div><div class="k">Métabolisme</div><div class="v">' + b.bmr + '</div></div>' +
      '<div><div class="k">Dépense/jour</div><div class="v">' + b.tdee + '</div></div>' +
      '<div><div class="k">Surplus</div><div class="v">+' + b.sur + '</div></div>' +
      '</div>' +
      '<div class="sep"></div>' +
      '<div class="grid2">' +
      champ('Poids (kg)', 'poids', S.profil.poids) +
      champ('Taille (cm)', 'taille', S.profil.taille) +
      champ('Âge', 'age', S.profil.age) +
      select('Sexe', 'sexe', S.profil.sexe, [['h', 'Homme'], ['f', 'Femme']]) +
      select('Activité', 'act', S.profil.act, [[1.35, 'Sédentaire'], [1.55, 'Actif'], [1.75, 'Très actif']]) +
      select('Objectif', 'obj', S.profil.obj, [['lente', 'Masse lente'], ['rapide', 'Masse rapide'], ['maintien', 'Maintien']]) +
      '</div></div>';

    /* --- journée type --- */
    var ratio = b.kcal / 2400, totK = 0, totP = 0;
    html += '<div class="card"><h2>Ta journée type</h2>' +
      '<p class="lead">Quantités déjà mises à l\'échelle de tes ' + b.kcal + ' kcal.</p><div style="margin-top:12px">';
    window.JOURNEE.forEach(function (r) {
      var p1 = r.plats[0], p2 = r.plats[1];
      function ligne(pl) {
        var kc = 0, pr = 0;
        var items = pl.items.map(function (it) {
          var al = parId[it[0]], g = it[1] * ratio;
          kc += al.kcal * g / al.base; pr += al.prot * g / al.base;
          return '<li>' + h(al.nom) + ' — <b>' + portion(al, g) + '</b></li>';
        }).join('');
        return { html: items, kc: Math.round(kc), pr: Math.round(pr) };
      }
      var a = ligne(p1), bb = p2 ? ligne(p2) : null;
      totK += a.kc; totP += a.pr;
      html += '<div class="repas"><div class="h"><b>' + h(r.nom) + '</b>' +
        '<span>' + a.kc + ' kcal · ' + a.pr + ' g de protéines</span></div>' +
        '<ul>' + a.html + '</ul>' +
        (bb ? '<div class="alt"><b>Variante — ' + h(p2.nom) + '</b> (' + bb.kc + ' kcal, ' + bb.pr + ' g) : ' +
          p2.items.map(function (it) { return h(parId[it[0]].nom) + ' ' + portion(parId[it[0]], it[1] * ratio); }).join(', ') + '</div>' : '') +
        '</div>';
    });
    html += '</div>' +
      '<div class="callout" style="margin:4px 0 0"><b>Total de la journée : ' + totK + ' kcal et ' + totP + ' g de protéines</b>' +
      ' — ton objectif est de ' + b.kcal + ' kcal et ' + b.prot + ' g. ' +
      (totP > b.prot * 1.12
        ? 'Cette journée dépasse la cible en protéines. Ce n\'est pas un problème (aucun risque à 2,5 g/kg), mais si tu préfères coller à l\'objectif, réduis les portions de viande et de poisson d\'un quart et ajoute l\'équivalent en riz ou en pâtes.'
        : totP < b.prot * 0.9
          ? 'Il manque des protéines : augmente les portions de viande, de poisson ou de skyr.'
          : 'Les deux collent : tu peux suivre cette journée telle quelle.') +
      '</div></div>';
    }

    /* --- aliments --- */
    if (sousB === 'alim') {
      html += '<div class="filtres">' + window.CAT_ALIMENTS.map(function (c) {
        return '<button data-act="ca" data-arg="' + c.k + '" class="' + (catA === c.k ? 'on' : '') + '">' +
          c.ico + ' ' + h(c.nom) + '</button>';
      }).join('') + '</div>';
      window.CAT_ALIMENTS.filter(function (c) { return c.k === catA; }).forEach(function (c) {
      html += '<div class="card"><h2>' + c.ico + ' ' + h(c.nom) + '</h2>' +
        '<p class="lead">' + h(c.intro) + '</p><div style="margin-top:6px">' +
        ALI.filter(function (a) { return a.cat === c.k; }).map(function (a) {
          return '<div class="alim">' +
            (a.cat === 'lim' ? '' : '<span class="pastille">' + a.prot + ' g</span>') +
            '<div style="flex:1;min-width:0"><div class="nom">' + h(a.nom) + '</div>' +
            (a.cat === 'lim' ? '' : '<div class="val">' + h(a.unite) + ' · ' + a.kcal + ' kcal · ' + a.prot + ' g de protéines</div>') +
            '<div class="why">' + h(a.pourquoi) + '</div>' +
            '<div class="tip">→ ' + h(a.astuce) + '</div></div>' +
            (a.score ? '<div class="sc">' + '⭐'.repeat(a.score) + '</div>' : '') +
            '</div>';
        }).join('') + '</div></div>';
      });

      /* --- sushis --- */
      var su = window.SUSHI;
      html += '<div class="card glow"><h2>🍣 ' + h(su.titre) + '</h2>' +
        '<p class="lead">' + h(su.texte) + '</p>' +
        '<ul class="liste" style="margin-top:10px">' + su.points.map(function (x) { return '<li>' + h(x) + '</li>'; }).join('') + '</ul></div>';
    }

    /* --- règles + compléments --- */
    if (sousB === 'regles') {
    html += '<div class="card"><h2>Les règles qui comptent</h2>' +
      window.REGLES.map(function (x) {
        return '<div class="acc"><div class="t">' + h(x.t) + '<em>▾</em></div><div class="d">' + h(x.d) + '</div></div>';
      }).join('') + '</div>';

    html += '<div class="card"><h2>Compléments : le tri</h2>' +
      window.COMPLEMENTS.map(function (x) {
        return '<div class="alim"><span class="pastille" style="' + (x.note >= 3 ? '' :
          x.note === 0 ? 'background:rgba(249,112,102,.13);border-color:rgba(249,112,102,.3);color:#FFB3AD' :
            'background:rgba(253,176,34,.13);border-color:rgba(253,176,34,.3);color:#FFDFA6') + '">' + h(x.verdict) + '</span>' +
          '<div style="flex:1"><div class="nom">' + h(x.nom) + '</div><div class="why">' + h(x.d) + '</div></div></div>';
      }).join('') + '</div>';
    }

    return html;
  };

  function champ(lbl, k, v) {
    return '<div><div class="k" style="font-size:10.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--txt3);margin-bottom:5px">' + lbl + '</div>' +
      '<input type="number" inputmode="decimal" data-prof="' + k + '" value="' + v + '" ' +
      'style="width:100%;padding:11px;border-radius:12px;background:var(--bg2);border:1px solid var(--line2);color:var(--txt);font-weight:700;text-align:center"></div>';
  }
  function select(lbl, k, v, opts) {
    return '<div><div class="k" style="font-size:10.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--txt3);margin-bottom:5px">' + lbl + '</div>' +
      '<select data-prof="' + k + '" style="width:100%;padding:11px;border-radius:12px;background:var(--bg2);border:1px solid var(--line2);color:var(--txt);font-weight:700">' +
      opts.map(function (o) { return '<option value="' + o[0] + '"' + (String(v) === String(o[0]) ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') +
      '</select></div>';
  }

  /* ================= PROGRÈS ================= */
  VUES.progres = function () {
    var html = entete(), cm = dernierBras(), pal = palierCourant();

    html += '<div class="card glow"><h2>🍣 Objectif plateau à sushis</h2>' +
      '<p class="lead">Mesure ton bras contracté, au point le plus large, une fois par semaine et toujours dans les mêmes conditions.</p>' +
      '<div class="mesure-row"><input type="number" step="0.1" inputmode="decimal" id="mes" placeholder="' + (cm ? cm.toFixed(1) : '35.0') + '">' +
      '<button class="btn primary" data-act="mesurer">Enregistrer</button></div>';

    if (S.mesures.length > 1) {
      var m = S.mesures.slice(-12), min = Math.min.apply(null, m.map(function (x) { return x.cm; })) - 0.6;
      var max = Math.max.apply(null, m.map(function (x) { return x.cm; })) + 0.4;
      html += '<div class="hist">' + m.map(function (x) {
        var p = (x.cm - min) / (max - min || 1);
        return '<i style="height:' + Math.max(6, p * 100) + '%" title="' + x.cm + ' cm"></i>';
      }).join('') + '</div>' +
        '<div class="histlbl"><span>' + h(m[0].d) + ' · ' + m[0].cm + ' cm</span><span>' +
        h(m[m.length - 1].d) + ' · ' + m[m.length - 1].cm + ' cm</span></div>';
      var g = (m[m.length - 1].cm - m[0].cm);
      html += '<p class="lead" style="margin-top:10px">' +
        (g > 0 ? 'Tu as pris <b>' + g.toFixed(1) + ' cm</b> depuis la première mesure. Continue.' :
          g < 0 ? 'Tu as perdu ' + Math.abs(g).toFixed(1) + ' cm. Vérifie que tu manges assez et que la charge monte.' :
            'Rien n\'a bougé pour l\'instant. Regarde d\'abord les calories.') + '</p>';
    }
    html += '</div>';

    html += '<div class="card"><h2>Les paliers</h2>' +
      window.PALIERS.map(function (p, i) {
        var cls = cm != null && cm >= p.cm ? 'fait' : (pal.suivant && pal.suivant.cm === p.cm ? 'cible' : '');
        return '<div class="palier ' + cls + '"><div class="cm">' + p.cm + '</div>' +
          '<div style="flex:1"><div class="ti">' + (cm != null && cm >= p.cm ? '✓ ' : '') + h(p.titre) + '</div>' +
          '<div class="tx">' + h(p.txt) + '</div></div></div>';
      }).join('') + '</div>';

    html += '<div class="card"><h2>' + h(window.REALISME.t) + '</h2>' +
      '<ul class="liste">' + window.REALISME.points.map(function (x) { return '<li>' + h(x) + '</li>'; }).join('') + '</ul></div>';

    /* records */
    var recs = Object.keys(S.perf).map(function (k) { return { ex: PAR_ID[k], p: S.perf[k] }; })
      .filter(function (x) { return x.ex; })
      .sort(function (a, b) { return (b.p.w * b.p.r) - (a.p.w * a.p.r); });
    html += '<div class="card"><h2>Tes records</h2>' +
      (recs.length ? recs.map(function (x) {
        return '<div class="alim"><div style="flex:1"><div class="nom">' + h(x.ex.nom) + '</div>' +
          '<div class="val">' + x.p.r + ' répétitions' + (x.p.w ? ' à ' + x.p.w + ' kg' : ' au poids du corps') + ' · ' + h(x.p.d) + '</div></div></div>';
      }).join('') : '<div class="vide">Fais une première séance, tes records s\'afficheront ici.</div>') +
      '</div>';

    /* historique */
    html += '<div class="card"><h2>Historique</h2>' +
      (S.hist.length ? S.hist.slice().reverse().slice(0, 20).map(function (x) {
        return '<div class="alim"><span class="pastille">' + (x.vol || 0) + ' kg</span>' +
          '<div style="flex:1"><div class="nom">' + h(x.seance) + '</div>' +
          '<div class="val">' + h(x.d) + ' · ' + (x.duree || 0) + ' min · ' + (x.series || 0) + ' séries</div></div></div>';
      }).join('') : '<div class="vide">Aucune séance enregistrée pour l\'instant.</div>') +
      '</div>';

    return html;
  };

  /* ================= RÉGLAGES ================= */
  VUES.reglages = function () {
    var html = '<button class="retour" data-go="accueil">‹ Retour</button>';
    html += '<div class="card"><h2>Réglages</h2>' +
      '<div class="acc on"><div class="t">Son du chronomètre<em>▾</em></div>' +
      '<div class="d"><button class="btn sm ' + (S.reglages.son ? 'ok' : 'ghost') + '" data-act="son">' +
      (S.reglages.son ? 'Activé' : 'Désactivé') + '</button></div></div>' +
      '</div>';
    html += '<div class="card"><h3>Tes données</h3>' +
      '<p class="lead">Tout est stocké dans ce navigateur, rien n\'est envoyé nulle part. Si tu vides les données du site, tout disparaît : exporte de temps en temps.</p>' +
      '<div class="btnrow"><button class="btn ghost" data-act="export">Exporter</button>' +
      '<button class="btn ghost" data-act="import">Importer</button>' +
      '<button class="btn ghost" data-act="raz">Tout effacer</button></div></div>';
    html += '<div class="card"><h3>À propos</h3>' +
      '<p class="lead">PUMP — 22 exercices de bras à faire à la maison, notés sur leur efficacité réelle, avec schémas animés et guide de nourriture. ' +
      'Les schémas sont des animations vectorielles générées par l\'application : rien à télécharger, ça marche hors connexion.</p>' +
      '<p class="lead" style="font-size:13px;color:var(--txt3)">Ce n\'est pas un avis médical. En cas de douleur articulaire qui dure, arrête l\'exercice concerné et consulte.</p></div>';
    return html;
  };

  /* ================= ACTIONS ================= */
  var ACT = {
    fz: function (el, v) { filtre.zone = filtre.zone === v ? 'tout' : v; peindre(); },
    sb: function (el, v) { sousB = v; peindre(); },
    ca: function (el, v) { catA = v; peindre(); },
    fm: function (el, v) { filtre.mat = filtre.mat === v ? 'tout' : v; peindre(); },

    pause: function (el) {
      var on = vivants.length ? vivants[0].bascule() : false;
      vivants.forEach(function (a, i) { if (i) { on ? a.play() : a.pause(); } });
      el.textContent = on ? '⏸ Pause' : '▶ Lecture';
    },
    vit: function (el, v) {
      vivants.forEach(function (a) { a.vitesse(+v); a.play(); });
      $$('.animctl button[data-act="vit"]').forEach(function (b) { b.classList.remove('on'); });
      el.classList.add('on');
      var p = $('.animctl button[data-act="pause"]'); if (p) p.textContent = '⏸ Pause';
    },

    choisir: function (el, id) {
      S.prog = id; S.si = 0; sauver();
      toast('Programme : ' + PROGRAMMES.filter(function (p) { return p.id === id; })[0].nom);
      go('seance');
    },
    sauter: function () {
      var p = prog(); if (!p) return;
      S.si = (S.si + 1) % p.seances.length; sauver(); peindre();
    },
    demarrer: function () {
      if (!S.prog) { go('seance'); return; }
      S.pending = { prog: S.prog, si: S.si % prog().seances.length, i: 0, log: {}, debut: Date.now() };
      sauver(); go('session');
    },
    exoseul: function (el, id) {
      var ex = PAR_ID[id];
      S.pending = {
        libre: true, nom: ex.nom, i: 0, log: {}, debut: Date.now(),
        exos: [{ id: id, series: 3, reps: ex.reps, repos: 75 }]
      };
      sauver(); go('session');
    },
    pausesession: function () { arreterChrono(); go('accueil'); },
    abandonner: function () {
      if (!confirm('Abandonner cette séance ? Les séries déjà validées seront perdues.')) return;
      S.pending = null; sauver(); peindre();
    },

    valider: function (el, idx) {
      var sc = seancePending(), ligne = sc.exos[S.pending.i], ex = PAR_ID[ligne.id];
      var i = +idx;
      var r = +($('[data-r="' + i + '"]').value || 0);
      var w = +($('[data-w="' + i + '"]').value || 0);
      if (!r) { toast('Note le nombre de répétitions'); return; }
      var l = S.pending.log[ex.id] = S.pending.log[ex.id] || [];
      l[i] = { r: r, w: w };
      var b = S.perf[ex.id];
      if (!b || w > b.w || (w === b.w && r > b.r)) S.perf[ex.id] = { r: r, w: w, d: AUJ };
      sauver();
      if (ligne.repos) lancerChrono(ligne.repos, ex.nom);
      peindre();
    },
    exosuivant: function () {
      S.pending.i++; arreterChrono(); sauver(); go('session');
    },
    finir: function () {
      var sc = seancePending(), P = S.pending;
      var nb = 0; for (var k in P.log) nb += P.log[k].filter(Boolean).length;
      if (!nb) { toast('Aucune série validée'); return; }
      S.hist.push({
        d: AUJ, prog: P.prog || 'libre', seance: sc.nom,
        duree: Math.max(1, Math.round((Date.now() - P.debut) / 60000)),
        exos: sc.exos.length, series: nb, vol: volume(P.log), log: P.log
      });
      if (!P.libre) { var p = prog(); S.si = (P.si + 1) % p.seances.length; }
      S.pending = null; arreterChrono(); sauver();
      go('bilan');
    },

    mesurer: function () {
      var v = parseFloat(($('#mes') || {}).value);
      if (!v || v < 15 || v > 70) { toast('Entre une mesure en cm (entre 15 et 70)'); return; }
      var last = S.mesures[S.mesures.length - 1];
      if (last && last.d === AUJ) S.mesures.pop();
      S.mesures.push({ d: AUJ, cm: Math.round(v * 10) / 10 });
      sauver();
      var pal = palierCourant();
      if (pal.i >= 0 && window.PALIERS[pal.i].cm <= v && (!last || last.cm < window.PALIERS[pal.i].cm)) {
        toast('Palier franchi : ' + window.PALIERS[pal.i].titre + ' 🍣');
      } else toast('Mesure enregistrée');
      peindre();
    },

    addprot: function (el, i) {
      var q = window.QUICK_PROT[+i], p = protJour();
      S.prot[AUJ] = { g: p.g + q.g, kcal: p.kcal + q.kcal };
      sauver(); peindre();
    },
    razprot: function () { delete S.prot[AUJ]; sauver(); peindre(); },

    son: function () { S.reglages.son = !S.reglages.son; sauver(); peindre(); },
    raz: function () {
      if (!confirm('Effacer toute ta progression (séances, mesures, records) ?')) return;
      S = neuf(); sauver(); go('accueil');
    },
    export: function () {
      var b = new Blob([JSON.stringify(S)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(b); a.download = 'pump-' + AUJ + '.json';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      toast('Sauvegarde téléchargée');
    },
    import: function () {
      var inp = document.createElement('input');
      inp.type = 'file'; inp.accept = 'application/json';
      inp.onchange = function () {
        var f = inp.files[0]; if (!f) return;
        var rd = new FileReader();
        rd.onload = function () {
          try {
            var d = JSON.parse(rd.result);
            if (!d.cree) throw 0;
            S = d; sauver(); go('accueil'); toast('Progression restaurée');
          } catch (e) { toast('Fichier illisible'); }
        };
        rd.readAsText(f);
      };
      inp.click();
    }
  };

  /* ================= CHRONOMÈTRE DE REPOS ================= */
  var boite = null, veille = null;
  function lancerChrono(sec, nom) {
    arreterChrono();
    var fin = Date.now() + sec * 1000;
    boite = document.createElement('div');
    boite.className = 'timer';
    document.body.appendChild(boite);
    demanderVeille();
    var rendre = function () {
      var r = Math.max(0, Math.round((fin - Date.now()) / 1000));
      var p = 1 - r / sec;
      boite.innerHTML = '<div class="t">' + Math.floor(r / 60) + ':' + ('0' + (r % 60)).slice(-2) + '</div>' +
        '<div class="lbl">Repos — ' + h(nom) + '<div class="bar"><i style="width:' + Math.round(p * 100) + '%"></i></div></div>' +
        '<button class="btn sm ghost" id="skipt">Passer</button>';
      boite.querySelector('#skipt').onclick = arreterChrono;
      if (r <= 0) { bip(); arreterChrono(); }
    };
    rendre();
    chrono = setInterval(rendre, 250);
  }
  function arreterChrono() {
    if (chrono) { clearInterval(chrono); chrono = null; }
    if (boite && boite.parentNode) boite.parentNode.removeChild(boite);
    boite = null; libererVeille();
  }
  function bip() {
    if (!S.reglages.son) return;
    try {
      var C = window.AudioContext || window.webkitAudioContext; if (!C) return;
      var c = new C(), o = c.createOscillator(), g = c.createGain();
      o.connect(g); g.connect(c.destination); o.type = 'sine'; o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.25, c.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.6);
      o.start(); o.stop(c.currentTime + 0.62);
    } catch (e) { }
  }
  /* L'écran qui s'éteint au milieu d'une série, c'est la série ratée. */
  function demanderVeille() {
    try {
      if (navigator.wakeLock && !veille) {
        navigator.wakeLock.request('screen').then(function (w) { veille = w; }, function () { });
      }
    } catch (e) { }
  }
  function libererVeille() { try { if (veille) { veille.release(); veille = null; } } catch (e) { } }

  /* ================= PROFIL NOURRITURE (champs) ================= */
  document.addEventListener('change', function (e) {
    var k = e.target.getAttribute && e.target.getAttribute('data-prof');
    if (!k) return;
    var v = e.target.value;
    S.profil[k] = (k === 'sexe' || k === 'obj') ? v : parseFloat(v) || S.profil[k];
    sauver();
    if (V.n === 'bouffe') peindre();
  });

  /* ================= DÉPART ================= */
  if (S.pending) go('session'); else go('accueil');
})();
