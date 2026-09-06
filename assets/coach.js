/* ============================================================
   SpeakUS — le correcteur

   Le score local repond a « est-ce que c'est la phrase attendue ? ».
   Ce module repond aux trois questions qui comptent quand on apprend :

     1. Est-ce que ce que j'ai dit est correct en anglais ?
     2. Qu'est-ce que ma phrase veut dire, exactement ?
     3. Donc, qu'est-ce que j'aurais du dire ?

   Juger une phrase libre demande un modele de langue. L'app appelle
   pour ca un petit relais heberge chez Cloudflare (voir worker/) :
   une seule adresse pour tout le monde, aucune cle a coller sur les
   appareils. Si le relais n'est pas joignable, `judge` resout `null`
   et l'app garde son comportement d'avant.
   ============================================================ */
(function (global) {
  'use strict';

  // Adresse du relais. Vide = correcteur desactive.
  // Se remplit une fois le Worker deploye (voir worker/DEPLOIEMENT.md).
  var RELAIS = '';

  var dead = false;        // relais absent ou definitivement en echec
  var echecs = 0;          // on abandonne apres quelques ratés d'affilée

  function endpoint() {
    // Une adresse posee dans les reglages prend le dessus : pratique
    // pour tester un relais avant de le figer dans le code.
    try {
      var o = localStorage.getItem('speakus_coach_url');
      if (o) return o;
    } catch (e) {}
    return RELAIS;
  }

  function alive() { return !dead && !!endpoint(); }

  function judge(c) {
    var url = endpoint();
    if (dead || !url) return Promise.resolve(null);

    var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var minuteur = setTimeout(function () { if (ctl) ctl.abort(); }, 12000);

    return fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        fr: c.fr || '', sit: c.sit || '',
        target: c.target || '', said: c.said || ''
      }),
      signal: ctl ? ctl.signal : undefined
    }).then(function (r) {
      clearTimeout(minuteur);
      if (r.status === 403) { dead = true; return null; }   // origine refusee
      if (!r.ok) throw new Error('http ' + r.status);
      return r.json();
    }).then(function (v) {
      if (!v || v.error || !v.verdict) throw new Error('reponse vide');
      echecs = 0;
      var ok = { natural: 1, awkward: 1, wrong: 1, misheard: 1 };
      return {
        verdict: ok[v.verdict] ? v.verdict : 'awkward',
        meaning: String(v.meaning || ''),
        correction: String(v.correction || c.target),
        note: String(v.note || '')
      };
    }).catch(function () {
      clearTimeout(minuteur);
      // Quota epuise, coupure reseau, relais eteint : on arrete d'insister
      // pour ne pas ralentir chaque essai rate de la session.
      if (++echecs >= 3) dead = true;
      return null;
    });
  }

  /** Utilise par les reglages pour verifier une adresse de relais. */
  function test(url) {
    return fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        fr: 'Je te presente mon ami Alex.',
        target: 'This is my friend Alex.',
        said: 'I introduce to you my friend Alex'
      })
    }).then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
  }

  global.Coach = {
    judge: judge,
    alive: alive,
    test: test,
    endpoint: endpoint,
    setEndpoint: function (u) {
      try {
        if (u) localStorage.setItem('speakus_coach_url', u);
        else localStorage.removeItem('speakus_coach_url');
      } catch (e) {}
      dead = false; echecs = 0;
    }
  };
})(window);
