/* ============================================================
   SpeakUS — moteur de l'application
   ============================================================ */
(function () {
  'use strict';

  var LS = 'speakus_state_v1';
  var INTERVALS = [1, 1, 2, 4, 8, 16, 32, 64];  // jours, par boîte Leitner
  var DAY = 86400000;

  /* ================= CORPUS ================= */
  var CORPUS = [];
  (window.PACKS || []).forEach(function (pack) {
    (pack.blocks || []).forEach(function (block) {
      (block.items || []).forEach(function (it) {
        CORPUS.push({
          id: pack.id + '-' + (CORPUS.length + 1),
          en: it.en, fr: it.fr, ex: it.ex || '', sit: it.sit || '',
          cue: it.cue || '', lv: it.lv || pack.level, rg: it.rg || 'casual',
          th: block.th, month: pack.month, packTitle: pack.title
        });
      });
    });
  });
  var BY_ID = {};
  CORPUS.forEach(function (c) { BY_ID[c.id] = c; });

  /* ================= ÉTAT ================= */
  function fresh() {
    return {
      created: ymd(new Date()),
      cards: {},          // id -> {b:box, due:'YYYY-MM-DD', seen:n, ok:n, ko:n, last:score}
      learned: 0,         // nb d'expressions déjà distribuées
      history: [],        // [{d, nw, rv, acc, xp}]
      streak: 0, best: 0, lastSession: null,
      xp: 0,
      v: 2,
      settings: {
        newPerDay: 8, threshold: 0.72, rate: 0.95, voice: '',
        maxReview: 22, shadowing: true, tripDate: '2027-06-20'
      }
    };
  }
  var S = load();

  // Migration : passage au rythme 20 min/jour + vraie date de départ
  if (!S.v) {
    S.v = 2;
    S.settings.newPerDay = 8;
    S.settings.maxReview = 22;
    S.settings.shadowing = true;
    S.settings.tripDate = '2027-06-20';
    save();
  }

  function load() {
    try {
      var raw = localStorage.getItem(LS);
      if (!raw) return fresh();
      var o = JSON.parse(raw);
      var d = fresh();
      for (var k in d) if (!(k in o)) o[k] = d[k];
      for (var k2 in d.settings) if (!(k2 in o.settings)) o.settings[k2] = d.settings[k2];
      return o;
    } catch (e) { return fresh(); }
  }
  function save() {
    S.updatedAt = Date.now();
    try { localStorage.setItem(LS, JSON.stringify(S)); } catch (e) {}
    if (window.Sync) window.Sync.push(S);
  }
  // Une autre machine (le téléphone) a pris de l'avance : on adopte son état.
  function adoptRemote(remote) {
    if (!remote || !remote.cards) return;
    S = remote;
    try { localStorage.setItem(LS, JSON.stringify(S)); } catch (e) {}
    if (!SES) go('home');
    toast('Progression synchronisée depuis ton autre appareil');
  }

  /* ================= DATES ================= */
  function ymd(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function parseYmd(s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function addDays(d, n) { var x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; }
  function daysBetween(a, b) { return Math.round((parseYmd(b) - parseYmd(a)) / DAY); }
  var TODAY = ymd(new Date());

  /* ================= SRS ================= */
  function card(id) {
    if (!S.cards[id]) S.cards[id] = { b: 0, due: TODAY, seen: 0, ok: 0, ko: 0, last: 0 };
    return S.cards[id];
  }
  function dueList() {
    var out = [];
    for (var id in S.cards) {
      var c = S.cards[id];
      if (!BY_ID[id]) continue;
      if (c.due <= TODAY) out.push(id);
    }
    // les plus en retard d'abord, puis les boîtes les plus fragiles
    out.sort(function (a, b) {
      var A = S.cards[a], B = S.cards[b];
      if (A.due !== B.due) return A.due < B.due ? -1 : 1;
      return A.b - B.b;
    });
    return out;
  }
  function grade(id, success) {
    var c = card(id);
    c.seen++;
    if (success) {
      c.ok++;
      c.b = Math.min(c.b + 1, INTERVALS.length - 1);
    } else {
      c.ko++;
      c.b = Math.max(0, c.b - 1);
    }
    var iv = INTERVALS[c.b];
    c.due = ymd(addDays(new Date(), iv));
    return c;
  }
  function mastered() {
    var n = 0;
    for (var id in S.cards) if (S.cards[id].b >= 4) n++;
    return n;
  }
  function seenCount() { return Object.keys(S.cards).length; }

  /* ================= NIVEAU ================= */
  var LEVELS = [
    { p: 0.00, n: 'B1' }, { p: 0.14, n: 'B1+' }, { p: 0.34, n: 'B2' },
    { p: 0.58, n: 'B2+' }, { p: 0.82, n: 'C1' }
  ];
  function levelProgress() {
    // 70% = volume d'expressions maîtrisées, 30% = régularité (sessions faites)
    var vol = Math.min(1, mastered() / Math.max(1, CORPUS.length * 0.8));
    var reg = Math.min(1, S.history.length / 120);
    return Math.min(1, vol * 0.7 + reg * 0.3);
  }
  function levelName() {
    var p = levelProgress(), name = 'B1';
    LEVELS.forEach(function (l) { if (p >= l.p) name = l.n; });
    return name;
  }

  /* ================= UI HELPERS ================= */
  var app = document.getElementById('app');
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function on(sel, ev, fn) { var e = $(sel); if (e) e.addEventListener(ev, fn); }
  var toastT;
  function toast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('show'); }, 2400);
  }
  function confetti() {
    var c = document.createElement('div'); c.className = 'confetti';
    var cols = ['#7C5CFF', '#FF5C8A', '#31D97A', '#FFB84D', '#B25CFF'];
    for (var i = 0; i < 70; i++) {
      var s = document.createElement('i');
      s.style.left = Math.random() * 100 + 'vw';
      s.style.top = '-20px';
      s.style.background = cols[i % cols.length];
      s.style.animationDelay = (Math.random() * 0.7) + 's';
      s.style.animationDuration = (2 + Math.random() * 1.6) + 's';
      c.appendChild(s);
    }
    document.body.appendChild(c);
    setTimeout(function () { c.remove(); }, 4200);
  }

  /* ================= HEADER + NAV ================= */
  function header() {
    return '<div class="hdr">' +
      '<div class="logo"><span class="dot">🎙️</span><span>Speak<i>US</i></span></div>' +
      '<div class="sp"></div>' +
      '<div class="chip fire">🔥 <b>' + S.streak + '</b></div>' +
      '<div class="chip">⚡ <b>' + S.xp + '</b></div>' +
      syncChip() +
      '<button class="iconbtn" id="btnSettings">⚙️</button>' +
      '</div>';
  }
  var SYNC_LABEL = {
    connecting: '<span class="chip" id="syncChip" title="Connexion…">☁︎</span>',
    saving: '<span class="chip" id="syncChip" title="Sauvegarde…">☁︎ ↑</span>',
    synced: '<span class="chip ok" id="syncChip" title="Progression synchronisée">☁︎ ✓</span>',
    error: '<span class="chip warn" id="syncChip" title="Synchro indisponible — la progression reste sur cet appareil">☁︎ !</span>'
  };
  function syncChip() {
    if (!window.Sync) return '';
    return SYNC_LABEL[window.Sync.status()] || '';
  }
  function nav(active) {
    var due = dueList().length;
    function b(k, i, l) {
      return '<button data-nav="' + k + '" class="' + (active === k ? 'on' : '') + '">' +
        (k === 'review' && due ? '<span class="badge">' + due + '</span>' : '') +
        '<span class="i">' + i + '</span>' + l + '</button>';
    }
    return '<div class="nav"><div class="inner">' +
      b('home', '🎯', "Aujourd'hui") +
      b('review', '🔁', 'Révisions') +
      b('library', '📚', 'Expressions') +
      b('stats', '📈', 'Progression') +
      '</div></div>';
  }
  function bindNav() {
    $$('[data-nav]').forEach(function (b) {
      b.addEventListener('click', function () { go(b.getAttribute('data-nav')); });
    });
    on('#btnSettings', 'click', openSettings);
  }
  function go(view) {
    Speech.stopSpeaking(); Speech.abort();
    if (view === 'home') renderHome();
    else if (view === 'review') renderReview();
    else if (view === 'library') renderLibrary();
    else if (view === 'stats') renderStats();
  }

  /* ================= ACCUEIL ================= */
  function nextNewItems(n) {
    var out = [];
    for (var i = S.learned; i < CORPUS.length && out.length < n; i++) out.push(CORPUS[i]);
    return out;
  }
  function dayNumber() { return S.history.length + 1; }
  // Durée du programme = corpus restant à la cadence choisie
  function totalDays() {
    return Math.max(dayNumber(), Math.ceil(CORPUS.length / Math.max(1, S.settings.newPerDay)));
  }

  function renderHome() {
    var doneToday = S.lastSession === TODAY;
    var news = nextNewItems(S.settings.newPerDay);
    var due = dueList();
    var reviews = due.slice(0, S.settings.maxReview);
    var theme = news.length ? news[0].th : 'Consolidation';
    var monthLbl = news.length ? news[0].packTitle : 'Corpus terminé';
    var pct = Math.round(levelProgress() * 100);

    var goalDate = ymd(addDays(parseYmd(S.created), 120));
    var tripDate = S.settings.tripDate || ymd(addDays(parseYmd(S.created), 240));
    var dGoal = Math.max(0, daysBetween(TODAY, goalDate));
    var dTrip = Math.max(0, daysBetween(TODAY, tripDate));

    var html = header();

    if (!Speech.supported()) {
      html += '<div class="warnbox"><b>Micro non supporté par ce navigateur.</b><br>' +
        'Ouvre SpeakUS dans <b>Google Chrome</b> ou <b>Microsoft Edge</b> pour la partie orale. ' +
        'Tu peux quand même réviser en mode écrit.</div>';
    }

    html += '<div class="card hero glow">' +
      '<div class="eyebrow">Jour ' + dayNumber() + ' / ' + totalDays() + ' &nbsp;·&nbsp; ' + esc(monthLbl) + '</div>' +
      '<h1>' + esc(theme) + '</h1>' +
      '<p>' + (doneToday
        ? 'Session du jour terminée. Tu peux enchaîner un bonus si tu veux pousser.'
        : news.length + ' nouvelles expressions + ' + reviews.length + ' révisions à dire à l\'oral. ~' +
          estimateMinutes(news.length, reviews.length) + ' min.') + '</p>' +
      '<div class="btnrow" style="margin-top:18px">' +
      '<button class="btn primary block" id="btnStart">' +
      (doneToday ? '➕ Session bonus' : '▶︎ Commencer la session') + '</button>' +
      '</div></div>';

    html += '<div class="grid3">' +
      stat('Expressions', seenCount(), 'vues sur ' + CORPUS.length) +
      stat('Maîtrisées', mastered(), 'ancrées en mémoire') +
      stat('Série', S.streak + ' j', 'record : ' + S.best + ' j') +
      '</div>';

    html += '<div class="card"><div class="row" style="border:0;padding:0 0 6px">' +
      '<div class="lb">Niveau estimé <small>Objectif : C1 conversationnel</small></div>' +
      '<div style="font-size:26px;font-weight:900;letter-spacing:-.04em">' + levelName() + '</div></div>' +
      '<div class="levelbar"><div class="bar"><i style="width:' + pct + '%"></i></div>' +
      '<div class="levelticks"><span>B1</span><span>B1+</span><span>B2</span><span>B2+</span><b>C1</b></div></div>' +
      '<div class="grid2" style="margin-top:16px">' +
      '<div class="stat"><div class="k">Objectif B2/C1</div><div class="v">J-' + dGoal + '</div><div class="s">' + fmtDate(goalDate) + '</div></div>' +
      '<div class="stat"><div class="k">Départ USA</div><div class="v">J-' + dTrip + '</div><div class="s">' + fmtDate(tripDate) + '</div></div>' +
      '</div></div>';

    if (news.length) {
      html += '<div class="sect">Au programme aujourd\'hui</div><div class="list">';
      news.forEach(function (it) {
        html += '<div class="item"><div class="m"><div class="en">' + esc(it.en) + '</div>' +
          '<div class="fr">' + esc(it.fr) + '</div></div>' +
          '<span class="lvl">' + esc(it.lv) + '</span>' +
          '<button class="play" data-say="' + esc(it.en) + '">🔊</button></div>';
      });
      html += '</div>';
    }

    app.innerHTML = html + nav('home');
    bindNav(); bindSay();
    on('#btnStart', 'click', function () { startSession(doneToday); });
  }
  // découverte ~40s, shadowing ~25s, production ~25s, roleplay ~30s, révision ~16s
  function estimateMinutes(nw, rv) {
    var sec = nw * 40 + (S.settings.shadowing ? nw * 25 : 0) + nw * 25 +
              Math.min(nw, 4) * 30 + rv * 16;
    return Math.max(5, Math.round(sec / 60));
  }
  function stat(k, v, s) {
    return '<div class="stat"><div class="k">' + k + '</div><div class="v">' + v + '</div><div class="s">' + s + '</div></div>';
  }
  function fmtDate(y) {
    var M = ['janv', 'févr', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];
    var d = parseYmd(y); return d.getDate() + ' ' + M[d.getMonth()] + ' ' + d.getFullYear();
  }
  function bindSay() {
    $$('[data-say]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        Speech.speak(b.getAttribute('data-say'), { rate: S.settings.rate });
      });
    });
  }

  /* ================= RÉVISIONS ================= */
  function renderReview() {
    var due = dueList();
    var html = header() +
      '<div class="card glow"><div class="eyebrow">Révisions</div>' +
      '<h1>' + due.length + ' expression' + (due.length > 1 ? 's' : '') + ' à revoir</h1>' +
      '<p>Ce sont celles d\'hier et celles que ta mémoire est sur le point de lâcher. ' +
      'Tu dois les redire à l\'oral, sans regarder.</p>' +
      (due.length ? '<div class="btnrow" style="margin-top:18px"><button class="btn primary block" id="btnRev">▶︎ Lancer la révision</button></div>'
                  : '<p style="margin-top:14px;color:var(--ok);font-weight:700">✅ Tout est à jour. Reviens demain.</p>') +
      '</div>';

    if (due.length) {
      html += '<div class="sect">Dans la file</div><div class="list">';
      due.slice(0, 40).forEach(function (id) {
        var it = BY_ID[id], c = S.cards[id];
        html += '<div class="item"><div class="m"><div class="en">' + esc(it.en) + '</div>' +
          '<div class="fr">' + esc(it.fr) + '</div></div>' + boxdots(c.b) +
          '<button class="play" data-say="' + esc(it.en) + '">🔊</button></div>';
      });
      html += '</div>';
    }
    app.innerHTML = html + nav('review');
    bindNav(); bindSay();
    on('#btnRev', 'click', function () { startSession(false, true); });
  }
  function boxdots(b) {
    var s = '<div class="boxdots">';
    for (var i = 0; i < 6; i++) s += '<i class="' + (i < b ? 'f' : '') + '"></i>';
    return s + '</div>';
  }

  /* ================= BIBLIOTHÈQUE ================= */
  var libFilter = 'seen', libQuery = '';
  function renderLibrary() {
    var html = header() +
      '<input class="search" id="q" placeholder="Chercher une expression, un mot, une traduction…" value="' + esc(libQuery) + '">' +
      '<div class="btnrow" style="margin-bottom:14px">' +
      ['seen', 'weak', 'mastered', 'all'].map(function (f) {
        var lbl = { seen: 'Apprises', weak: 'Fragiles', mastered: 'Maîtrisées', all: 'Tout le programme' }[f];
        return '<button class="btn sm ' + (libFilter === f ? 'primary' : 'ghost') + '" data-f="' + f + '">' + lbl + '</button>';
      }).join('') + '</div>';

    var list = CORPUS.filter(function (it) {
      var c = S.cards[it.id];
      if (libFilter === 'seen' && !c) return false;
      if (libFilter === 'weak' && (!c || c.b >= 3)) return false;
      if (libFilter === 'mastered' && (!c || c.b < 4)) return false;
      if (libQuery) {
        var q = libQuery.toLowerCase();
        if ((it.en + ' ' + it.fr + ' ' + it.ex + ' ' + it.th).toLowerCase().indexOf(q) < 0) return false;
      }
      return true;
    });

    html += '<div class="muted" style="margin-bottom:10px">' + list.length + ' expression' + (list.length > 1 ? 's' : '') + '</div>';
    html += '<div class="list">';
    list.slice(0, 400).forEach(function (it) {
      var c = S.cards[it.id];
      html += '<div class="item"><div class="m"><div class="en">' + esc(it.en) + '</div>' +
        '<div class="fr">' + esc(it.fr) + '</div></div>' +
        (c ? boxdots(c.b) : '<span class="lvl">' + esc(it.lv) + '</span>') +
        '<button class="play" data-say="' + esc(it.en) + '">🔊</button></div>';
    });
    html += '</div>';
    if (list.length > 400) html += '<div class="muted center" style="margin-top:12px">…affine ta recherche pour voir la suite</div>';

    app.innerHTML = html + nav('library');
    bindNav(); bindSay();
    $$('[data-f]').forEach(function (b) {
      b.addEventListener('click', function () { libFilter = b.getAttribute('data-f'); renderLibrary(); });
    });
    var q = $('#q');
    q.addEventListener('input', function () {
      libQuery = q.value;
      clearTimeout(q._t); q._t = setTimeout(function () {
        var pos = q.selectionStart; renderLibrary();
        var nq = $('#q'); nq.focus(); try { nq.setSelectionRange(pos, pos); } catch (e) {}
      }, 220);
    });
  }

  /* ================= PROGRESSION ================= */
  function renderStats() {
    var hist = S.history.slice(-120);
    var totalXp = S.xp;
    var acc = hist.length ? Math.round(hist.reduce(function (a, h) { return a + (h.acc || 0); }, 0) / hist.length) : 0;
    var minutes = hist.length * 11;

    var html = header() +
      '<div class="card glow"><div class="eyebrow">Progression</div><h1>' + levelName() +
      ' · ' + Math.round(levelProgress() * 100) + '%</h1>' +
      '<div class="levelbar"><div class="bar"><i style="width:' + Math.round(levelProgress() * 100) + '%"></i></div>' +
      '<div class="levelticks"><span>B1</span><span>B1+</span><span>B2</span><span>B2+</span><b>C1</b></div></div></div>' +
      '<div class="grid3">' +
      stat('Sessions', hist.length, 'jours travaillés') +
      stat('Précision', acc + '%', 'moyenne à l\'oral') +
      stat('Temps', Math.round(minutes / 60) + 'h', 'de pratique orale') +
      stat('XP', totalXp, 'points cumulés') +
      stat('Maîtrisées', mastered(), 'boîte 4+') +
      stat('Record', S.best + ' j', 'meilleure série') +
      '</div>';

    // heatmap sur 120 jours
    var map = {};
    S.history.forEach(function (h) { map[h.d] = (h.nw || 0) + (h.rv || 0); });
    html += '<div class="sect">Régularité (120 derniers jours)</div><div class="card"><div class="heat">';
    for (var i = 119; i >= 0; i--) {
      var d = ymd(addDays(new Date(), -i));
      var v = map[d] || 0;
      var cls = v === 0 ? '' : (v < 8 ? 'l1' : v < 16 ? 'l2' : 'l3');
      html += '<i class="' + cls + (d === TODAY ? ' today' : '') + '" title="' + d + ' — ' + v + '"></i>';
    }
    html += '</div><div class="muted" style="margin-top:12px">Une case = un jour. Plus c\'est violet, plus tu as bossé.</div></div>';

    // répartition par mois de programme
    html += '<div class="sect">Avancement du programme</div><div class="card">';
    [1, 2, 3, 4, 5, 6].forEach(function (m) {
      var items = CORPUS.filter(function (c) { return c.month === m; });
      if (!items.length) return;
      var done = items.filter(function (c) { return S.cards[c.id]; }).length;
      var p = Math.round(done / items.length * 100);
      html += '<div style="margin-bottom:14px"><div class="row" style="border:0;padding:0 0 6px">' +
        '<div class="lb">' + esc(items[0].packTitle) + '</div><div class="muted">' + done + '/' + items.length + '</div></div>' +
        '<div class="bar thin"><i style="width:' + p + '%"></i></div></div>';
    });
    html += '</div>';

    app.innerHTML = html + nav('stats');
    bindNav();
  }

  /* ================= RÉGLAGES ================= */
  function openSettings() {
    var voices = Speech.listVoices();
    var m = document.createElement('div');
    m.className = 'modal';
    m.innerHTML = '<div class="box"><h3 style="margin-bottom:6px">Réglages</h3>' +
      '<div class="muted" style="margin-bottom:10px">Adapte l\'app à ton rythme.</div>' +
      '<div class="row"><div class="lb">Nouvelles expressions / jour<small>8 = rythme 20 min/jour</small></div>' +
      '<select id="sNew">' + [3, 5, 8, 10, 12, 15].map(function (n) {
        return '<option value="' + n + '"' + (S.settings.newPerDay === n ? ' selected' : '') + '>' + n + '</option>';
      }).join('') + '</select></div>' +
      '<div class="row"><div class="lb">Shadowing<small>Répéter la phrase entière au débit natif</small></div>' +
      '<select id="sShadow">' +
      '<option value="1"' + (S.settings.shadowing ? ' selected' : '') + '>Activé</option>' +
      '<option value="0"' + (!S.settings.shadowing ? ' selected' : '') + '>Désactivé</option>' +
      '</select></div>' +
      '<div class="row"><div class="lb">Date de départ aux USA<small>Pilote le compte à rebours</small></div>' +
      '<input type="date" id="sTrip" value="' + esc(S.settings.tripDate || '') + '"></div>' +
      '<div class="row"><div class="lb">Exigence de prononciation<small>Souple au début, strict ensuite</small></div>' +
      '<select id="sTh">' +
      '<option value="0.62"' + (S.settings.threshold === 0.62 ? ' selected' : '') + '>Souple</option>' +
      '<option value="0.72"' + (S.settings.threshold === 0.72 ? ' selected' : '') + '>Normal</option>' +
      '<option value="0.82"' + (S.settings.threshold === 0.82 ? ' selected' : '') + '>Strict</option>' +
      '<option value="0.9"' + (S.settings.threshold === 0.9 ? ' selected' : '') + '>Natif</option>' +
      '</select></div>' +
      '<div class="row"><div class="lb">Révisions max / session</div>' +
      '<input type="number" id="sMax" min="5" max="60" value="' + S.settings.maxReview + '" style="width:80px"></div>' +
      '<div class="row"><div class="lb">Vitesse de la voix</div>' +
      '<select id="sRate">' + [['0.75', 'Lente'], ['0.95', 'Normale'], ['1.1', 'Rapide (natif)']].map(function (r) {
        return '<option value="' + r[0] + '"' + (String(S.settings.rate) === r[0] ? ' selected' : '') + '>' + r[1] + '</option>';
      }).join('') + '</select></div>' +
      '<div class="row"><div class="lb">Voix américaine</div>' +
      '<select id="sVoice" style="max-width:190px">' + voices.map(function (v) {
        return '<option value="' + esc(v.name) + '"' + (Speech.currentVoiceName() === v.name ? ' selected' : '') + '>' + esc(v.name) + '</option>';
      }).join('') + '</select></div>' +
      '<div class="btnrow" style="margin-top:18px">' +
      '<button class="btn primary block" id="sClose">Fermer</button>' +
      '</div>' +
      '<div class="btnrow" style="margin-top:10px">' +
      '<button class="btn ghost sm" id="sExport">Exporter</button>' +
      '<button class="btn ghost sm" id="sImport">Importer</button>' +
      '<button class="btn ghost sm" id="sReset">Reset</button>' +
      '<input type="file" id="sFile" accept="application/json,.json" style="display:none">' +
      '</div></div>';
    document.body.appendChild(m);

    $('#sNew', m).addEventListener('change', function () { S.settings.newPerDay = +this.value; save(); });
    $('#sShadow', m).addEventListener('change', function () { S.settings.shadowing = this.value === '1'; save(); });
    $('#sTrip', m).addEventListener('change', function () { S.settings.tripDate = this.value; save(); });
    $('#sTh', m).addEventListener('change', function () { S.settings.threshold = +this.value; save(); });
    $('#sMax', m).addEventListener('change', function () { S.settings.maxReview = Math.max(5, Math.min(60, +this.value || 16)); save(); });
    $('#sRate', m).addEventListener('change', function () { S.settings.rate = +this.value; save(); Speech.speak('Alright, let me try this voice.', { rate: S.settings.rate }); });
    $('#sVoice', m).addEventListener('change', function () {
      S.settings.voice = this.value; Speech.setVoice(this.value); save();
      Speech.speak('What\'s up? This is how I sound.', { rate: S.settings.rate });
    });
    $('#sClose', m).addEventListener('click', function () { m.remove(); go('home'); });
    $('#sExport', m).addEventListener('click', function () {
      var name = 'speakus-sauvegarde-' + TODAY + '.json';
      var json = JSON.stringify(S);
      // Publié en ligne, le téléchargement passe par la capacité `downloads` ;
      // en local, un simple lien suffit.
      if (window.claude && window.claude.use) {
        window.claude.use('downloads').then(function (d) {
          if (!d) return localDownload(name, json);
          return d.save({ filename: name, data: json })
            .then(function () { toast('Sauvegarde enregistrée'); })
            .catch(function () { toast('Téléchargement refusé'); });
        }).catch(function () { localDownload(name, json); });
      } else { localDownload(name, json); }
    });
    function localDownload(name, json) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
      a.download = name;
      a.click();
      toast('Sauvegarde téléchargée');
    }
    $('#sImport', m).addEventListener('click', function () { $('#sFile', m).click(); });
    $('#sFile', m).addEventListener('change', function () {
      var f = this.files && this.files[0];
      if (!f) return;
      var rd = new FileReader();
      rd.onload = function () {
        try {
          var o = JSON.parse(rd.result);
          if (!o || !o.cards) throw new Error('format');
          S = o; save(); m.remove(); go('home');
          toast('Progression restaurée');
        } catch (e) { toast('Fichier illisible — prends le .json exporté par SpeakUS'); }
      };
      rd.readAsText(f);
    });
    $('#sReset', m).addEventListener('click', function () {
      if (confirm('Tout effacer et repartir au jour 1 ?')) { S = fresh(); save(); m.remove(); go('home'); }
    });
    m.addEventListener('click', function (e) { if (e.target === m) { m.remove(); go('home'); } });
  }

  /* ================= SESSION ================= */
  var SES = null;

  function startSession(bonus, reviewOnly) {
    var reviews = dueList().slice(0, S.settings.maxReview);
    var news = reviewOnly ? [] : nextNewItems(S.settings.newPerDay);
    if (bonus && !reviewOnly) news = nextNewItems(S.settings.newPerDay);

    if (!reviews.length && !news.length) { toast('Rien à faire pour le moment 👌'); return; }

    var steps = [];
    reviews.forEach(function (id) { steps.push({ t: 'review', it: BY_ID[id] }); });
    news.forEach(function (it) { steps.push({ t: 'learn', it: it }); });
    if (S.settings.shadowing) {
      news.forEach(function (it) { if (it.ex) steps.push({ t: 'shadow', it: it }); });
    }
    news.forEach(function (it) { if (it.sit) steps.push({ t: 'produce', it: it }); });
    news.slice(0, 4).forEach(function (it) { if (it.cue) steps.push({ t: 'roleplay', it: it }); });

    SES = {
      steps: steps, i: 0, newIds: news.map(function (x) { return x.id; }),
      scores: [], xp: 0, nw: news.length, rv: reviews.length,
      attempts: 0, revealed: false, bonus: !!bonus, reviewOnly: !!reviewOnly
    };
    renderStep();
  }

  function stepLabel(t) {
    return {
      review: 'Révision', learn: 'Nouvelle expression', shadow: 'Shadowing',
      produce: 'Mise en situation', roleplay: 'Conversation'
    }[t];
  }
  // Ce que l'utilisateur doit prononcer à cette étape
  function targetText(st) { return st.t === 'shadow' ? st.it.ex : st.it.en; }
  // Une phrase longue est plus dure : on assouplit un peu le seuil
  function passThreshold(st) {
    var th = S.settings.threshold;
    if (st.t === 'shadow') th -= 0.08;
    return Math.max(0.5, th);
  }

  function renderStep() {
    if (SES.i >= SES.steps.length) return finishSession();
    var st = SES.steps[SES.i], it = st.it;
    SES.attempts = 0; SES.revealed = (st.t === 'learn');
    var pct = Math.round(SES.i / SES.steps.length * 100);

    var html = '<div class="sess-top">' +
      '<button class="iconbtn" id="btnQuit">✕</button>' +
      '<div class="bar"><i style="width:' + pct + '%"></i></div>' +
      '<span class="stepbadge">' + stepLabel(st.t) + '</span></div>';

    html += '<div class="card fadein" id="stepCard">';

    if (st.t === 'learn') {
      html += '<div class="expr">' +
        '<div class="en">' + esc(it.en) + '</div>' +
        '<div class="fr">' + esc(it.fr) + '</div>' +
        '<div class="tags"><span class="tag lv">' + esc(it.lv) + '</span>' +
        '<span class="tag rg">' + esc(it.rg) + '</span>' +
        '<span class="tag">' + esc(it.th) + '</span></div></div>' +
        '<div class="exbox"><div class="lbl">En contexte</div>' +
        '<div class="txt">' + esc(it.ex) + '</div>' +
        (it.sit ? '<div class="note">💡 ' + esc(it.sit) + '</div>' : '') + '</div>' +
        '<div class="btnrow" style="margin-top:14px;justify-content:center">' +
        '<button class="btn ghost sm" data-say="' + esc(it.en) + '">🔊 Écouter</button>' +
        '<button class="btn ghost sm" id="btnSlow">🐢 Au ralenti</button>' +
        '<button class="btn ghost sm" data-say="' + esc(it.ex) + '">💬 La phrase</button>' +
        '</div>';

    } else if (st.t === 'shadow') {
      html += '<div class="prompt" style="font-size:16px"><small>Shadowing — répète la phrase entière d\'un bloc</small>' +
        'Vitesse naturelle. Vise le rythme, pas la perfection.</div>' +
        '<div class="exbox" style="margin-top:0"><div class="lbl">La phrase</div>' +
        '<div class="txt" style="font-size:20px;font-weight:800;line-height:1.45">' + esc(it.ex) + '</div>' +
        '<div class="note">' + esc(it.en) + ' — ' + esc(it.fr) + '</div></div>' +
        '<div class="btnrow" style="margin-top:14px;justify-content:center">' +
        '<button class="btn ghost sm" id="btnNative">🔊 Vitesse natif</button>' +
        '<button class="btn ghost sm" id="btnSlow">🐢 Au ralenti</button>' +
        '</div>';

    } else if (st.t === 'review') {
      html += '<div class="prompt"><small>Dis-le en anglais</small>' + esc(it.fr) + '</div>' +
        (it.sit ? '<div class="muted center" style="margin-top:-8px">Contexte : ' + esc(it.sit) + '</div>' : '') +
        '<div id="answerZone"></div>';

    } else if (st.t === 'produce') {
      html += '<div class="prompt"><small>Situation — réponds à voix haute</small>' + esc(it.sit) + '</div>' +
        '<div class="muted center">Utilise : <b style="color:var(--acc2)">' + esc(it.fr) + '</b></div>' +
        '<div id="answerZone"></div>';

    } else if (st.t === 'roleplay') {
      html += '<div class="cue"><div class="who">🇺🇸 Ton interlocuteur</div>' +
        '<div class="line">' + esc(it.cue) + '</div></div>' +
        '<div class="prompt" style="font-size:16px"><small>À toi de répondre</small>' +
        'Place « <span style="color:var(--acc2)">' + esc(it.fr) + '</span> » dans ta réponse.</div>' +
        '<div id="answerZone"></div>';
    }

    html += '<div class="micwrap">' +
      '<button class="mic" id="mic">🎙️</button>' +
      '<div class="michint" id="hint">' + (Speech.supported() ? 'Appuie et prononce la phrase' : 'Micro indisponible — valide manuellement') + '</div>' +
      '</div><div id="fb"></div>' +
      '<div class="btnrow" style="margin-top:16px;justify-content:center" id="ctrls">' +
      (st.t === 'review' || st.t === 'produce' || st.t === 'roleplay'
        ? '<button class="btn ghost sm" id="btnReveal">👁 Voir la réponse</button>' : '') +
      '<button class="btn ghost sm" id="btnSkip">Passer →</button>' +
      '</div>';

    html += '</div>';
    app.innerHTML = html;
    bindSay();

    on('#btnQuit', 'click', function () { Speech.stopSpeaking(); Speech.abort(); SES = null; go('home'); });
    on('#btnSlow', 'click', function () { Speech.speak(targetText(st), { rate: 0.6 }); });
    on('#btnNative', 'click', function () { Speech.speak(it.ex, { rate: 1.08 }); });
    on('#mic', 'click', function () { doListen(st); });
    on('#btnSkip', 'click', function () { nextStep(false); });
    on('#btnReveal', 'click', function () { reveal(it); });

    if (st.t === 'learn') setTimeout(function () { Speech.speak(it.en, { rate: S.settings.rate }); }, 250);
    if (st.t === 'shadow') setTimeout(function () { Speech.speak(it.ex, { rate: 1.08 }); }, 250);
    if (st.t === 'roleplay') setTimeout(function () { Speech.speak(it.cue, { rate: S.settings.rate }); }, 250);
  }

  function reveal(it) {
    SES.revealed = true;
    var z = $('#answerZone');
    if (z && !z.innerHTML) {
      z.innerHTML = '<div class="exbox" style="margin-top:16px"><div class="lbl">Réponse</div>' +
        '<div class="txt" style="font-size:22px;font-weight:900">' + esc(it.en) + '</div>' +
        (it.ex ? '<div class="note">' + esc(it.ex) + '</div>' : '') + '</div>';
      Speech.speak(it.en, { rate: S.settings.rate });
    }
  }

  function doListen(st) {
    if (!Speech.supported()) {
      // Mode secours : validation manuelle
      reveal(st.it);
      $('#fb').innerHTML = '<div class="btnrow" style="margin-top:14px;justify-content:center">' +
        '<button class="btn ok sm" id="mOk">✅ Je l\'ai dit correctement</button>' +
        '<button class="btn ghost sm" id="mKo">❌ À revoir</button></div>';
      on('#mOk', 'click', function () { nextStep(true); });
      on('#mKo', 'click', function () { nextStep(false); });
      return;
    }
    var mic = $('#mic'), hint = $('#hint');
    Speech.stopSpeaking();
    mic.classList.add('listening');
    hint.textContent = 'Je t\'écoute…';

    Speech.listen({
      maxMs: st.t === 'shadow' ? 12000 : (st.t === 'learn' ? 6000 : 9000),
      onPartial: function (p) { hint.textContent = '“' + p + '”'; }
    }).then(function (res) {
      mic.classList.remove('listening');
      if (res.error === 'not-allowed' || res.error === 'service-not-allowed') {
        hint.textContent = 'Micro bloqué';
        var ios = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        $('#fb').innerHTML = '<div class="warnbox"><b>Le navigateur refuse le micro.</b><br>' +
          (ios
            ? 'Sur iPhone : Réglages → Safari → <b>Microphone</b> → Autoriser, et Réglages → Général → Clavier → <b>Activer Dictée</b>. Puis recharge la page.'
            : 'Clique sur l\'icône à gauche de l\'adresse → Micro → <b>Autoriser</b>, puis recharge la page.') +
          '</div>';
        return;
      }
      if (!res.hypotheses.length) {
        hint.textContent = 'Je n\'ai rien entendu — réessaie en parlant plus fort';
        return;
      }
      hint.textContent = 'Appuie pour réessayer';
      evaluate(st, res.hypotheses);
    });
  }

  function evaluate(st, hyps) {
    var it = st.it;
    var target = targetText(st);
    var mode = (st.t === 'learn' || st.t === 'shadow') ? 'exact' : 'contains';
    var r = Speech.bestOf(target, hyps, mode);
    SES.attempts++;

    var pct = Math.round(r.score * 100);
    var pass = r.score >= passThreshold(st);
    var perfect = r.score >= 0.92;

    // rendu mot à mot
    var words = r.diff.map(function (d) {
      if (d.w === null) return '<span class="w-extra">' + esc(d.heard) + '</span>';
      var cls = d.s >= 0.85 ? 'w-ok' : (d.s >= 0.55 ? 'w-mid' : 'w-bad');
      return '<span class="' + cls + '">' + esc(d.w) + '</span>';
    }).join(' ');

    // Combien de mots attendus sont passés à la trappe ?
    var missed = r.diff.filter(function (d) { return d.w !== null && d.s < 0.5; }).length;

    var cls = pass ? (perfect ? 'good' : 'mid') : 'bad';
    var msg, sub;
    if (perfect) {
      msg = 'Parfait 🔥';
      sub = st.t === 'shadow' ? 'Le débit y est. C\'est comme ça qu\'on sonne natif.' : 'Prononciation propre, ça sonne natif.';
    } else if (pass && missed) {
      msg = 'Compris, mais incomplet';
      sub = missed + ' mot' + (missed > 1 ? 's' : '') + ' en rouge ' + (missed > 1 ? 'sont passés' : 'est passé') +
            ' à la trappe. Refais un essai pour la version propre.';
    } else if (pass) {
      msg = 'Validé ✅';
      sub = 'Compris. Les mots en orange peuvent être plus nets.';
    } else if (SES.attempts === 1) {
      msg = 'Presque';
      sub = 'Réécoute et refais un essai — vise les mots en rouge.';
    } else {
      msg = 'Encore un effort';
      sub = st.t === 'shadow' ? 'Découpe la phrase en deux, puis enchaîne.' : 'Ralentis, articule chaque mot, puis réessaie.';
    }

    var html = '<div class="heard"><div class="lbl">Mot par mot — vert = net, orange = flou, rouge = raté</div>' +
      '<div class="words">' + words + '</div>' +
      '<div class="note" style="margin-top:10px;font-size:13px;color:var(--txt3);border-top:1px dashed var(--line);padding-top:8px">' +
      'Entendu : « ' + esc(r.text || hyps[0]) + ' »</div></div>' +
      '<div class="scorebox ' + cls + '"><div class="pct">' + pct + '%</div>' +
      '<div class="msg">' + msg + '<small>' + sub + '</small></div></div>';

    if (!pass) {
      html += '<div class="btnrow" style="margin-top:14px;justify-content:center">' +
        '<button class="btn ghost sm" id="fbSlow">🐢 Réécouter lentement</button>';
      if (SES.attempts >= 3 || st.t === 'shadow') html += '<button class="btn ghost sm" id="fbPass">Passer quand même</button>';
      html += '</div>';
    } else {
      html += '<div class="btnrow" style="margin-top:14px"><button class="btn ok block" id="fbNext">Continuer →</button></div>';
    }

    $('#fb').innerHTML = html;
    if (!pass && st.t !== 'shadow') reveal(it);

    on('#fbSlow', 'click', function () { Speech.speak(target, { rate: 0.6 }); });
    on('#fbPass', 'click', function () { nextStep(false); });
    on('#fbNext', 'click', function () { nextStep(true, r.score); });

    if (pass) {
      // « Compris mais incomplet » : on continue, mais on laisse la porte ouverte
      // à un deuxième essai propre avant de passer à la suite.
      if (missed && SES.attempts < 3) {
        $('#fbNext').textContent = 'Continuer quand même →';
        $('#fb').insertAdjacentHTML('beforeend',
          '<div class="btnrow" style="margin-top:10px;justify-content:center">' +
          '<button class="btn ghost sm" id="fbRetry">🔁 Je refais la phrase</button></div>');
        on('#fbRetry', 'click', function () {
          $('#fb').innerHTML = '';
          $('#hint').textContent = 'Appuie et reprends la phrase en entier';
        });
      }
      SES.scores.push(pct);
      var gained = { learn: 10, review: 6, shadow: 9, produce: 8, roleplay: 12 }[st.t] * (perfect ? 1.5 : 1);
      SES.xp += Math.round(gained);
      if (perfect) toast('+' + Math.round(gained) + ' XP — nickel !');
    }
  }

  function nextStep(success, score) {
    var st = SES.steps[SES.i];
    var it = st.it;
    var c = card(it.id);

    if (st.t === 'learn') {
      // première exposition : la carte revient DEMAIN, systématiquement
      c.seen++;
      c.b = success && SES.attempts <= 1 ? 1 : 0;
      c.due = ymd(addDays(new Date(), 1));
      c.last = score || 0;
      if (SES.newIds.indexOf(it.id) >= 0 && S.learned < CORPUS.length) {
        var idx = CORPUS.indexOf(it);
        if (idx === S.learned) S.learned++;
        else if (idx >= S.learned) S.learned = idx + 1;
      }
    } else if (st.t === 'review') {
      grade(it.id, success && SES.attempts <= 2);
      c.last = score || 0;
    } else {
      // shadowing / production / roleplay : entraînement bonus.
      // Ne dégrade pas la boîte si raté, et ne fait pas sauter d'étape si réussi.
      if (success) c.ok++;
    }
    save();
    SES.i++;
    renderStep();
  }

  function finishSession() {
    var avg = SES.scores.length ? Math.round(SES.scores.reduce(function (a, b) { return a + b; }, 0) / SES.scores.length) : 0;
    S.xp += SES.xp;

    if (!SES.bonus && !SES.reviewOnly) {
      if (S.lastSession !== TODAY) {
        var y = ymd(addDays(new Date(), -1));
        S.streak = (S.lastSession === y) ? S.streak + 1 : 1;
        S.best = Math.max(S.best || 0, S.streak);
        S.lastSession = TODAY;
      }
      S.history.push({ d: TODAY, nw: SES.nw, rv: SES.rv, acc: avg, xp: SES.xp });
    }
    save();

    var tomorrow = dueList().length;
    var dueTomorrow = 0;
    var t = ymd(addDays(new Date(), 1));
    for (var id in S.cards) if (S.cards[id].due <= t) dueTomorrow++;

    var html = header() +
      '<div class="card hero glow center fadein">' +
      '<div style="font-size:56px;line-height:1">🎉</div>' +
      '<h1 style="margin-top:10px">Session terminée</h1>' +
      '<p>' + (avg >= 85 ? 'Ta prononciation était solide aujourd\'hui.' :
        avg >= 70 ? 'Bon travail — continue, ça s\'affine vite.' :
        'C\'est en forçant l\'oral que ça rentre. Bien joué d\'avoir fait la session.') + '</p>' +
      '</div>' +
      '<div class="grid3">' +
      stat('Nouvelles', SES.nw, 'expressions') +
      stat('Révisées', SES.rv, 'de la veille') +
      stat('Précision', avg + '%', 'à l\'oral') +
      stat('XP gagnés', '+' + SES.xp, 'total ' + S.xp) +
      stat('Série', S.streak + ' j', 'ne casse pas la chaîne') +
      stat('Demain', dueTomorrow, 'à revoir') +
      '</div>' +
      '<div class="card"><div class="lb" style="font-weight:800;margin-bottom:8px">Ce que tu as appris aujourd\'hui</div><div class="list">' +
      SES.newIds.map(function (id) {
        var it = BY_ID[id];
        return '<div class="item"><div class="m"><div class="en">' + esc(it.en) + '</div>' +
          '<div class="fr">' + esc(it.fr) + '</div></div>' +
          '<button class="play" data-say="' + esc(it.en) + '">🔊</button></div>';
      }).join('') + '</div></div>' +
      '<button class="btn primary block" id="btnHome">Retour à l\'accueil</button>';

    app.innerHTML = html + nav('home');
    bindNav(); bindSay();
    on('#btnHome', 'click', function () { SES = null; go('home'); });
    confetti();
    SES = null;
    if (window.Sync) window.Sync.flushPending();
  }

  /* ================= BOOT ================= */
  if (window.Sync) {
    window.Sync.onStatus(function () {
      var chip = document.getElementById('syncChip');
      var hdr = chip && chip.parentNode;
      if (!hdr) return;
      var tmp = document.createElement('div');
      tmp.innerHTML = syncChip();
      if (tmp.firstChild) hdr.replaceChild(tmp.firstChild, chip);
      else chip.remove();
    });
    window.Sync.init({
      getState: function () { return S; },
      adopt: adoptRemote,
      canAdopt: function () { return !SES; }   // jamais en pleine session
    });
  }
  if (S.settings.voice) setTimeout(function () { Speech.setVoice(S.settings.voice); }, 600);
  if (!CORPUS.length) {
    app.innerHTML = '<div class="card"><h1>Corpus introuvable</h1><p class="muted">Les fichiers data/m1.js … m4.js ne sont pas chargés.</p></div>';
  } else {
    renderHome();
  }
})();
