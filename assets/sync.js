/* ============================================================
   SpeakUS — synchronisation de la progression entre appareils.

   Quand la page tourne comme Artifact publié, elle obtient une petite
   base de données côté serveur : le PC et le téléphone lisent et
   écrivent le même document, donc la progression suit.

   Quand la page tourne en local (double-clic sur le .bat), il n'y a
   pas de `claude.use` : tout ce module devient inerte et l'app
   fonctionne exactement comme avant, sur localStorage seul.
   ============================================================ */
(function (global) {
  'use strict';

  var PATH = 'progress/main';
  var doc = null, ready = false, timer = null;
  var getState = null, adopt = null, canAdopt = null;
  var state = 'local';
  var watchers = [];

  function setStatus(s) {
    state = s;
    watchers.forEach(function (f) { try { f(s); } catch (e) {} });
  }

  // Le paquet envoyé au serveur. On borne l'historique pour garder
  // le document léger même après un an d'utilisation.
  function payload(S) {
    var copy = JSON.parse(JSON.stringify(S));
    if (copy.history && copy.history.length > 400) {
      copy.history = copy.history.slice(-400);
    }
    return { updatedAt: S.updatedAt || Date.now(), state: copy };
  }

  function init(opts) {
    getState = opts.getState;
    adopt = opts.adopt;
    canAdopt = opts.canAdopt || function () { return true; };

    if (!global.claude || typeof global.claude.use !== 'function') {
      setStatus('local');
      return;
    }
    setStatus('connecting');

    global.claude.use('db').then(function (db) {
      if (!db) { setStatus('local'); return; }
      doc = db.doc(PATH);
      ready = true;
      return doc.get().then(function (snap) {
        var remote = snap.exists ? snap.data() : null;
        var local = getState();

        if (remote && remote.state && (remote.updatedAt || 0) > (local.updatedAt || 0)) {
          // Un autre appareil a de l'avance : on prend sa version.
          adopt(remote.state);
          setStatus('synced');
        } else {
          // On est à jour ou en avance : on pousse.
          push(getState(), true);
        }
        listen();
      });
    }).catch(function () { setStatus('error'); });
  }

  var pending = null;
  function listen() {
    doc.onSnapshot(function (snap) {
      if (!snap.exists) return;
      if (snap.metadata && snap.metadata.hasPendingWrites) return;
      var r = snap.data();
      if (!r || !r.state) return;
      var cur = getState();
      // 2 s de marge : on n'adopte que ce qui est franchement plus récent
      if ((r.updatedAt || 0) <= (cur.updatedAt || 0) + 2000) return;

      if (canAdopt()) { adopt(r.state); setStatus('synced'); }
      else { pending = r.state; }   // session en cours : on attend la fin
    }, function () { setStatus('error'); });
  }

  // Appelé quand une session se termine : applique une mise à jour différée.
  function flushPending() {
    if (pending && canAdopt()) { adopt(pending); pending = null; setStatus('synced'); }
  }

  function push(S, immediate) {
    if (!ready) return;
    clearTimeout(timer);
    timer = setTimeout(function () {
      setStatus('saving');
      doc.set(payload(S))
        .then(function () { setStatus('synced'); })
        .catch(function () { setStatus('error'); });
    }, immediate ? 0 : 1500);
  }

  global.Sync = {
    init: init,
    push: push,
    flushPending: flushPending,
    status: function () { return state; },
    onStatus: function (f) { watchers.push(f); f(state); }
  };
})(window);
