/* ============================================================
   SpeakUS — moteur vocal
   1. TTS  : lecture des expressions avec une voix américaine
   2. ASR  : reconnaissance vocale (Web Speech API)
   3. Score: comparaison tolérante entre ce qui est attendu
             et ce qui a été prononcé, mot par mot.
   ============================================================ */
(function (global) {
  'use strict';

  /* ---------------- TTS ---------------- */
  var voices = [];
  var preferred = null;

  function loadVoices() {
    voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    var us = voices.filter(function (v) { return /en[-_]US/i.test(v.lang); });
    if (!us.length) us = voices.filter(function (v) { return /^en/i.test(v.lang); });
    // On privilégie les voix "naturelles" quand elles existent
    var nice = us.filter(function (v) {
      return /natural|neural|google|samantha|aria|jenny|guy|matthew|zira|david/i.test(v.name);
    });
    preferred = (nice[0] || us[0] || null);
  }
  if (window.speechSynthesis) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  function listVoices() {
    return voices.filter(function (v) { return /^en/i.test(v.lang); });
  }
  function setVoice(name) {
    var v = voices.filter(function (x) { return x.name === name; })[0];
    if (v) preferred = v;
  }
  function currentVoiceName() { return preferred ? preferred.name : ''; }

  function speak(text, opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      if (!window.speechSynthesis) return resolve();
      try { window.speechSynthesis.cancel(); } catch (e) {}
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      if (preferred) u.voice = preferred;
      u.rate = opts.rate || 1;
      u.pitch = opts.pitch || 1;
      u.volume = 1;
      u.onend = function () { resolve(); };
      u.onerror = function () { resolve(); };
      // Chrome coupe parfois les longues phrases : petit délai de sécurité
      setTimeout(function () { try { window.speechSynthesis.speak(u); } catch (e) { resolve(); } }, 40);
    });
  }
  function stopSpeaking() { try { window.speechSynthesis.cancel(); } catch (e) {} }

  // iOS n'autorise la synthèse vocale que si une première prise de parole
  // part d'un vrai geste utilisateur. On « déverrouille » au premier contact,
  // sinon toutes les lectures déclenchées par minuterie restent muettes.
  var unlocked = false;
  function unlock() {
    if (unlocked || !window.speechSynthesis) return;
    try {
      var u = new SpeechSynthesisUtterance(' ');
      u.volume = 0; u.lang = 'en-US';
      window.speechSynthesis.speak(u);
      unlocked = true;
    } catch (e) {}
  }
  document.addEventListener('touchend', unlock, true);
  document.addEventListener('click', unlock, true);

  /* ---------------- Normalisation ---------------- */
  // Formes contractées / relâchées ramenées à une forme canonique,
  // pour que "gonna" == "going to", "I'm" == "I am", etc.
  var EXPAND = {
    "gonna": "going to", "wanna": "want to", "gotta": "got to", "hafta": "have to",
    "lemme": "let me", "gimme": "give me", "kinda": "kind of", "sorta": "sort of",
    "outta": "out of", "lotta": "lot of", "coulda": "could have", "shoulda": "should have",
    "woulda": "would have", "musta": "must have", "cuz": "because", "cos": "because",
    "'cause": "because", "cause": "because", "dunno": "do not know", "imma": "i am going to",
    "ya": "you", "u": "you", "ur": "your", "yall": "you all", "y'all": "you all",
    "em": "them", "'em": "them", "til": "until", "till": "until", "ok": "okay",
    "i'm": "i am", "im": "i am", "you're": "you are", "youre": "you are",
    "we're": "we are", "were'": "we are", "they're": "they are", "theyre": "they are",
    "he's": "he is", "she's": "she is", "it's": "it is", "its'": "it is",
    "that's": "that is", "thats": "that is", "what's": "what is", "whats": "what is",
    "who's": "who is", "there's": "there is", "theres": "there is",
    "here's": "here is", "let's": "let us", "lets": "let us",
    "i've": "i have", "you've": "you have", "we've": "we have", "they've": "they have",
    "i'll": "i will", "you'll": "you will", "he'll": "he will", "she'll": "she will",
    "we'll": "we will", "they'll": "they will", "it'll": "it will",
    "i'd": "i would", "you'd": "you would", "he'd": "he would", "she'd": "she would",
    "we'd": "we would", "they'd": "they would",
    "don't": "do not", "dont": "do not", "doesn't": "does not", "doesnt": "does not",
    "didn't": "did not", "didnt": "did not", "can't": "can not", "cant": "can not",
    "cannot": "can not", "won't": "will not", "wont": "will not",
    "wouldn't": "would not", "shouldn't": "should not", "couldn't": "could not",
    "isn't": "is not", "isnt": "is not", "aren't": "are not", "arent": "are not",
    "wasn't": "was not", "weren't": "were not", "haven't": "have not",
    "hasn't": "has not", "hadn't": "had not", "ain't": "is not", "aint": "is not",
    "gotcha": "got you", "betcha": "bet you", "whatcha": "what are you"
  };
  var FILLER = { "uh": 1, "um": 1, "erm": 1, "er": 1, "hmm": 1, "mm": 1, "ah": 1, "eh": 1 };

  function normalize(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/[‘’ʼ]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[^a-z0-9' ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function tokens(s) {
    var out = [];
    normalize(s).split(' ').forEach(function (w) {
      if (!w) return;
      var e = EXPAND[w];
      if (e) { e.split(' ').forEach(function (x) { out.push(x); }); return; }
      var stripped = w.replace(/'/g, '');
      if (EXPAND[stripped]) { EXPAND[stripped].split(' ').forEach(function (x) { out.push(x); }); return; }
      out.push(w);
    });
    return out.filter(function (w) { return !FILLER[w]; });
  }

  /* ---------------- Distances ---------------- */
  function lev(a, b) {
    var m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    var prev = new Array(n + 1), cur = new Array(n + 1), i, j;
    for (j = 0; j <= n; j++) prev[j] = j;
    for (i = 1; i <= m; i++) {
      cur[0] = i;
      for (j = 1; j <= n; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      var t = prev; prev = cur; cur = t;
    }
    return prev[n];
  }

  // Similarité entre deux mots (0 → 1). Tolère l'accent / les erreurs d'ASR.
  function wordSim(a, b) {
    if (a === b) return 1;
    var d = lev(a, b), L = Math.max(a.length, b.length);
    var s = 1 - d / L;
    // même racine (play / played / playing…) → on est indulgent
    if (a.length > 3 && b.length > 3 && (a.indexOf(b.slice(0, 4)) === 0 || b.indexOf(a.slice(0, 4)) === 0)) {
      s = Math.max(s, 0.82);
    }
    return s < 0 ? 0 : s;
  }

  /* Alignement mot à mot (Levenshtein pondéré) → score + diff détaillé */
  function align(target, heard) {
    var m = target.length, n = heard.length;
    var D = [], P = [], i, j;
    for (i = 0; i <= m; i++) { D.push(new Array(n + 1)); P.push(new Array(n + 1)); }
    D[0][0] = 0;
    for (i = 1; i <= m; i++) { D[i][0] = i; P[i][0] = 'D'; }
    for (j = 1; j <= n; j++) { D[0][j] = j; P[0][j] = 'I'; }
    for (i = 1; i <= m; i++) {
      for (j = 1; j <= n; j++) {
        var sim = wordSim(target[i - 1], heard[j - 1]);
        var sub = D[i - 1][j - 1] + (1 - sim);
        var del = D[i - 1][j] + 1;
        var ins = D[i][j - 1] + 1;
        var best = Math.min(sub, del, ins);
        D[i][j] = best;
        P[i][j] = best === sub ? 'S' : (best === del ? 'D' : 'I');
      }
    }
    // backtrack
    var diff = [];
    i = m; j = n;
    while (i > 0 || j > 0) {
      var op = (i > 0 && j > 0) ? P[i][j] : (i > 0 ? 'D' : 'I');
      if (op === 'S') {
        var sm = wordSim(target[i - 1], heard[j - 1]);
        diff.unshift({ w: target[i - 1], heard: heard[j - 1], s: sm });
        i--; j--;
      } else if (op === 'D') {
        diff.unshift({ w: target[i - 1], heard: null, s: 0 });
        i--;
      } else {
        diff.unshift({ w: null, heard: heard[j - 1], s: 0 });
        j--;
      }
    }
    var cost = D[m][n];
    var score = 1 - cost / Math.max(m, 1);
    if (n > m) score -= (n - m) * 0.06; // pénalité légère si on ajoute plein de mots

    // Deuxième garde-fou : quelle proportion des mots attendus a été réellement
    // reconnue ? Sur une phrase courte, un seul mot raté doit faire échouer.
    var hit = 0, tot = 0;
    diff.forEach(function (d) { if (d.w !== null) { tot++; if (d.s >= 0.6) hit++; } });
    var ratio = tot ? hit / tot : 0;

    return { score: Math.max(0, Math.min(1, Math.min(score, ratio))), diff: diff };
  }

  /**
   * Compare l'attendu et l'entendu.
   * mode 'exact'    → il faut répéter la phrase telle quelle
   * mode 'contains' → la phrase cible doit apparaître quelque part dans ce qui est dit
   */
  function compare(expected, heardText, mode) {
    var T = tokens(expected), H = tokens(heardText);
    if (!T.length) return { score: 0, diff: [] };
    if (!H.length) return { score: 0, diff: T.map(function (w) { return { w: w, heard: null, s: 0 }; }) };

    if (mode === 'contains' && H.length > T.length) {
      var best = null;
      for (var start = 0; start + 1 <= H.length; start++) {
        for (var len = Math.max(1, T.length - 2); len <= Math.min(T.length + 2, H.length - start); len++) {
          var r = align(T, H.slice(start, start + len));
          if (!best || r.score > best.score) best = r;
        }
      }
      if (best) return best;
    }
    return align(T, H);
  }

  /** Meilleur score parmi toutes les hypothèses renvoyées par l'ASR */
  function bestOf(expected, hypotheses, mode) {
    var best = { score: 0, diff: [], text: '' };
    (hypotheses || []).forEach(function (h) {
      var r = compare(expected, h, mode);
      if (r.score > best.score) { best = r; best.text = h; }
    });
    return best;
  }

  /* ---------------- ASR ---------------- */
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var rec = null, busy = false;

  function supported() { return !!SR; }

  /**
   * listen({ maxMs, onPartial }) → Promise<{hypotheses:[string], error}>
   */
  function listen(opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      if (!SR) return resolve({ hypotheses: [], error: 'unsupported' });
      if (busy) { try { rec.abort(); } catch (e) {} }
      busy = true;

      var hyp = [], done = false, timer = null;
      rec = new SR();
      rec.lang = 'en-US';
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 5;

      function finish(err) {
        if (done) return; done = true; busy = false;
        if (timer) clearTimeout(timer);
        try { rec.stop(); } catch (e) {}
        resolve({ hypotheses: hyp, error: err || null });
      }

      rec.onresult = function (ev) {
        var partial = '';
        for (var i = ev.resultIndex; i < ev.results.length; i++) {
          var res = ev.results[i];
          if (res.isFinal) {
            for (var k = 0; k < res.length; k++) {
              if (res[k] && res[k].transcript) hyp.push(res[k].transcript);
            }
          } else {
            partial += res[0].transcript;
          }
        }
        if (partial && opts.onPartial) opts.onPartial(partial);
      };
      rec.onerror = function (e) {
        if (e.error === 'no-speech') return finish('no-speech');
        finish(e.error || 'error');
      };
      rec.onend = function () { finish(null); };

      try { rec.start(); } catch (e) { finish('start-failed'); return; }
      if (opts.onStart) opts.onStart();
      timer = setTimeout(function () { try { rec.stop(); } catch (e) {} }, opts.maxMs || 7000);
    });
  }

  function abort() { if (rec) { try { rec.abort(); } catch (e) {} } busy = false; }

  global.Speech = {
    speak: speak, stopSpeaking: stopSpeaking,
    listVoices: listVoices, setVoice: setVoice, currentVoiceName: currentVoiceName,
    supported: supported, listen: listen, abort: abort,
    compare: compare, bestOf: bestOf, tokens: tokens, normalize: normalize
  };
})(window);
