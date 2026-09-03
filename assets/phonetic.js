/* ============================================================
   SpeakUS — transcription phonétique à la française

   Objectif : qu'un francophone puisse LIRE la ligne et sortir un
   son compréhensible par un Américain. Ce n'est pas de l'API :
   c'est une approximation lisible sans rien apprendre.

   Conventions (affichées à l'utilisateur) :
     MAJUSCULES = syllabe accentuée
     th  = langue entre les dents (think)
     dh  = même chose mais sonore (this)
     eu  = son de "up", "but"
     ii  = i long (see)          i  = i bref (sit)
     aï  eï  ô  aou  oï          r  = r américain, arrondi
     ng  = n nasal de "sing"     h  = souffle audible
   ============================================================ */
(function (global) {
  'use strict';

  /* ---- Dictionnaire : les mots fréquents ou irréguliers ----
     L'anglais s'écrit trop mal pour être deviné : ces 430 mots
     couvrent 83 % des occurrences du corpus. Le reste passe par
     les règles plus bas. */
  var DICT = {
    "a": "e", "about": "e-BAOUT", "accent": "AK-sent", "actually": "AK-tchou-e-li",
    "after": "AF-teur", "again": "e-GUÈN", "ago": "e-GÔ", "ahead": "e-HÈD",
    "all": "ol", "almost": "OL-môst", "already": "ol-RÈ-di", "alright": "ol-RAÏT",
    "always": "OL-oueïz", "an": "eun", "and": "and", "another": "e-NEU-dheur",
    "any": "È-ni", "anyone": "È-ni-oueun", "anything": "È-ni-thing", "anyway": "È-ni-oueï",
    "appreciate": "e-PRII-chi-eït", "are": "âr", "around": "e-RAOUND", "as": "az",
    "ask": "ask", "at": "at", "away": "e-OUEÏ", "back": "bak", "bad": "bad",
    "bar": "bâr", "be": "bii", "been": "bin", "before": "bi-FOR", "being": "BII-ing",
    "believe": "bi-LIIV", "best": "bèst", "better": "BÈ-teur", "big": "big",
    "bit": "bit", "break": "breïk", "bring": "bring", "busy": "BI-zi", "but": "beut",
    "by": "baï", "call": "kol", "came": "keïm", "can": "kèn", "can't": "kant",
    "car": "kâr", "card": "kârd", "care": "kèr", "case": "keïs", "catch": "katch",
    "changed": "tcheïndjd", "check": "tchèk", "city": "SI-ti", "close": "klôs",
    "coffee": "KO-fi", "come": "keum", "comes": "keumz", "coming": "KEU-ming",
    "complicated": "KOM-pli-keï-tid", "completely": "keum-PLIIT-li", "cool": "koul",
    "could": "koud", "couple": "KEU-peul", "count": "kaount", "crazy": "KREÏ-zi",
    "dance": "danss", "day": "deï", "days": "deïz", "deal": "diil", "depends": "di-PENDZ",
    "did": "did", "didn't": "DI-deunt", "do": "dou", "does": "deuz", "doesn't": "DEU-zeunt",
    "doing": "DOU-ing", "don't": "dônt", "done": "deun", "double": "DEU-beul",
    "down": "daoun", "downtown": "daoun-TAOUN", "drink": "drink", "early": "EUR-li",
    "easy": "II-zi", "eight": "eït", "either": "II-dheur", "end": "end",
    "english": "ING-glich", "enough": "i-NEUF", "even": "II-veun", "ever": "È-veur",
    "every": "È-vri", "everybody": "È-vri-bo-di", "everyone": "È-vri-oueun",
    "everything": "È-vri-thing", "exactly": "ig-ZAKT-li", "excuse": "ik-SKYOUZ",
    "expensive": "iks-PEN-siv", "explain": "iks-PLEÏN", "fair": "fèr", "far": "fâr",
    "feel": "fiil", "figure": "FI-gueur", "finally": "FAÏ-ne-li", "find": "faïnd",
    "fine": "faïn", "first": "feurst", "five": "faïv", "flight": "flaït", "for": "for",
    "free": "frii", "friday": "FRAÏ-deï", "friend": "frend", "friends": "frendz",
    "from": "from", "fun": "feun", "game": "gueïm", "get": "guèt", "getting": "GUÈ-ting",
    "give": "guiv", "go": "gô", "going": "GÔ-ing", "gonna": "GO-ne", "good": "goud",
    "got": "got", "grab": "grab", "great": "greït", "group": "group",
    "guy": "gaï", "guys": "gaïz", "had": "had", "hadn't": "HA-deunt", "hang": "hang",
    "happened": "HA-peund", "hard": "hârd", "has": "haz", "have": "hav", "head": "hèd",
    "heading": "HÈ-ding", "hear": "hir", "heard": "heurd", "help": "hèlp", "her": "heur",
    "here": "hir", "here's": "hirz", "hey": "heï", "hi": "haï", "him": "him",
    "his": "hiz", "hit": "hit", "hold": "hôld", "home": "hôm", "honest": "O-nist",
    "honestly": "O-nist-li", "hour": "AOU-eur", "hours": "AOU-eurz", "how": "haou",
    "how's": "haouz", "i": "aï", "i'd": "aïd", "i'll": "aïl", "i'm": "aïm",
    "i've": "aïv", "idea": "aï-DII-e", "if": "if", "in": "in", "insane": "in-SEÏN",
    "interested": "IN-tris-tid", "into": "IN-tou", "is": "iz", "isn't": "I-zeunt",
    "it": "it", "it's": "its", "jacket": "DJA-kit", "job": "djob", "just": "djeust",
    "keep": "kiip", "kind": "kaïnd", "know": "nô", "last": "last", "late": "leït",
    "lately": "LEÏT-li", "later": "LEÏ-teur", "learning": "LEUR-ning", "leave": "liiv",
    "leaving": "LII-ving", "left": "lèft", "let": "lèt", "let's": "lètss", "life": "laïf",
    "like": "laïk", "line": "laïn", "little": "LI-teul", "live": "liv", "long": "long",
    "look": "louk", "looking": "LOU-king", "lost": "lost", "lot": "lot", "love": "leuv",
    "made": "meïd", "makes": "meïks", "make": "meïk", "man": "man", "many": "MÈ-ni",
    "maybe": "MEÏ-bi", "me": "mii", "mean": "miin", "meet": "miit", "meeting": "MII-ting",
    "met": "mèt", "mind": "maïnd", "minute": "MI-nit", "minutes": "MI-nits",
    "money": "MEU-ni", "month": "meunth", "months": "meunthss", "more": "mor",
    "morning": "MOR-ning", "most": "môst", "moved": "mouvd", "moving": "MOU-ving",
    "move": "mouv", "much": "meutch", "music": "MYOU-zik", "my": "maï", "name": "neïm",
    "need": "niid", "neighborhood": "NEÏ-beur-houd", "never": "NÈ-veur", "new": "nou",
    "next": "nèkst", "nice": "naïss", "night": "naït", "nine": "naïn", "no": "nô",
    "nothing": "NEU-thing", "now": "naou", "of": "euv", "off": "of", "offer": "O-feur",
    "oh": "ô", "okay": "ô-KEÏ", "on": "on", "once": "oueunss", "one": "oueun",
    "only": "ÔN-li", "open": "Ô-peun", "or": "or", "other": "EU-dheur", "out": "aout",
    "outside": "aout-SAÏD", "over": "Ô-veur", "owe": "ô", "part": "pârt", "party": "PÂR-ti",
    "people": "PII-peul", "person": "PEUR-seun", "pick": "pik", "place": "pleïss",
    "plan": "plan", "play": "pleï", "please": "pliiz", "point": "poïnt",
    "presentation": "prè-zeun-TEÏ-cheun", "pretty": "PRI-ti", "price": "praïss",
    "probably": "PRO-be-bli", "put": "pout", "question": "KOUÈS-tcheun", "rather": "RA-dheur",
    "ready": "RÈ-di", "real": "riil", "really": "RII-li", "rent": "rent", "right": "raït",
    "room": "roum", "rough": "reuf", "run": "reun", "rush": "reuch", "said": "sèd",
    "same": "seïm", "saturday": "SA-teur-deï", "save": "seïv", "say": "seï", "says": "sèz",
    "second": "SÈ-keund", "see": "sii", "seeing": "SII-ing", "seem": "siim", "seen": "siin",
    "sense": "senss", "serious": "SI-ri-euss", "set": "sèt", "she": "chi", "she's": "chiz",
    "short": "chort", "should": "choud", "show": "chô", "since": "sinss", "sit": "sit",
    "six": "siks", "small": "smol", "so": "sô", "some": "seum", "someone": "SEUM-oueun",
    "something": "SEUM-thing", "song": "song", "soon": "soun", "sorry": "SO-ri",
    "sounds": "saoundz", "spot": "spot", "split": "split", "start": "stârt",
    "staying": "STEÏ-ing", "stay": "steï", "still": "stil", "stop": "stop", "story": "STO-ri",
    "sure": "chour", "take": "teïk", "taking": "TEÏ-king", "talk": "tok", "talking": "TO-king",
    "tell": "tèl", "ten": "tèn", "term": "teurm", "text": "tèkst", "than": "dhan",
    "thank": "thank", "thanks": "thankss", "that": "dhat", "that's": "dhats",
    "the": "dhe", "them": "dhèm", "then": "dhèn", "there": "dhèr", "there's": "dhèrz",
    "these": "dhiiz", "they": "dheï", "they're": "dhèr", "thing": "thing",
    "things": "thingz", "think": "think", "thinking": "THIN-king", "this": "dhiss",
    "those": "dhôz", "though": "dhô", "thought": "thot", "three": "thrii",
    "through": "throu", "ticket": "TI-kit", "time": "taïm", "times": "taïmz",
    "to": "tou", "today": "tou-DEÏ", "together": "tou-GUÈ-dheur", "told": "tôld",
    "tomorrow": "tou-MO-rô", "tonight": "tou-NAÏT", "too": "tou", "took": "touk",
    "totally": "TÔ-te-li", "traffic": "TRA-fik", "trip": "trip", "try": "traï",
    "trying": "TRAÏ-ing", "twelve": "touèlv", "twenty": "TOUÈN-ti", "two": "tou",
    "until": "eun-TIL", "up": "eup", "us": "euss", "used": "youzd", "very": "VÈ-ri",
    "vibe": "vaïb", "wait": "oueït", "walk": "ouok", "want": "ouont", "wanna": "OUO-ne",
    "was": "ouoz", "wasn't": "OUO-zeunt", "way": "oueï", "we": "oui", "we'll": "ouil",
    "we're": "ouir", "we've": "ouiv", "week": "ouik", "weekend": "OUIK-ènd",
    "weeks": "ouiks", "well": "ouèl", "went": "ouènt", "were": "oueur", "what": "ouot",
    "what's": "ouots", "whatever": "ouot-È-veur", "when": "ouèn", "where": "ouèr",
    "where's": "ouèrz", "which": "ouitch", "while": "ouaïl", "who": "hou", "who's": "houz",
    "whole": "hôl", "why": "ouaï", "will": "ouil", "with": "ouidh", "without": "ouidh-AOUT",
    "work": "oueurk", "working": "OUEUR-king", "works": "oueurks", "worry": "OUEU-ri",
    "worries": "OUEU-riz", "worse": "oueurss", "worth": "oueurth", "would": "woud",
    "wouldn't": "WOU-deunt", "would've": "WOU-deuv", "wow": "waou", "wrong": "rong",
    "year": "yir", "years": "yirz", "yeah": "yè", "yet": "yèt", "you": "you",
    "you'd": "youd", "you're": "your", "you've": "youv", "your": "your",

    /* --- rattrapages : mots que les règles massacrent --- */
    "he": "hi", "buy": "baï", "full": "foul", "put": "pout", "push": "pouch",
    "pull": "poul", "book": "bouk", "look": "louk", "foot": "fout", "good": "goud",
    "would": "woud", "should": "choud", "could": "koud", "woman": "OU-meun",
    "women": "OUI-min", "many": "MÈ-ni", "money": "MEU-ni", "done": "deun",
    "some": "seum", "come": "keum", "love": "leuv", "above": "e-BEUV",
    "one": "oueun", "once": "oueunss", "two": "tou", "who": "hou", "whose": "houz",
    "sure": "chour", "sugar": "CHOU-gueur", "busy": "BI-zi", "build": "bild",
    "guide": "gaïd", "guest": "guèst", "regret": "ri-GRÈT", "restroom": "RÈST-roum",
    "himself": "him-SÈLF", "herself": "heur-SÈLF", "myself": "maï-SÈLF",
    "yourself": "your-SÈLF", "island": "AÏ-leund", "iron": "AÏ-eurn",
    "heart": "hârt", "learn": "leurn", "earn": "eurn", "early": "EUR-li",
    "heard": "heurd", "world": "oueurld", "word": "oueurd", "work": "oueurk",
    "worse": "oueurss", "answer": "AN-seur", "castle": "KA-seul", "listen": "LI-seun",
    "often": "O-feun", "salmon": "SA-meun", "half": "haf", "talk": "tok",
    "walk": "ouok", "chalk": "tchok", "laugh": "laf", "cough": "kof",
    "tough": "teuf", "rough": "reuf", "dough": "dô", "bought": "bot",
    "brought": "brot", "caught": "kot", "taught": "tot", "daughter": "DO-teur",
    "eight": "eït", "weight": "oueït", "height": "haït", "friend": "frend",
    "beautiful": "BYOU-ti-feul", "business": "BIZ-niss", "colonel": "KEUR-neul",
    "vegetable": "VÈDJ-te-beul", "chocolate": "TCHOK-leut", "comfortable": "KEUMF-teur-beul",
    "clothes": "klôz", "receipt": "ri-SIIT", "debt": "dèt", "doubt": "daout",
    "knee": "nii", "know": "nô", "knife": "naïf", "wrong": "rong", "write": "raït",
    "wrap": "rap", "hour": "AOU-eur", "honest": "O-nist", "ghost": "gôst"
  };

  /* ---- Règles pour tout le reste ----
     Motifs testés du plus long au plus court, de gauche à droite. */
  var RULES = [
    ["ough", "of"], ["augh", "af"], ["eigh", "eï"], ["tion", "cheun"], ["sion", "jeun"],
    ["ture", "tcheur"], ["ight", "aït"], ["ould", "oud"], ["ing", "ing"], ["tch", "tch"],
    ["dge", "dj"], ["ck", "k"], ["ch", "tch"], ["sh", "ch"], ["th", "th"], ["ph", "f"],
    ["wh", "ou"], ["qu", "kou"], ["ee", "ii"], ["ea", "ii"], ["oo", "ou"], ["ou", "aou"],
    ["ow", "aou"], ["oa", "ô"], ["ai", "eï"], ["ay", "eï"], ["oi", "oï"], ["oy", "oï"],
    ["ey", "i"], ["ie", "ii"], ["au", "o"], ["aw", "o"], ["oe", "ô"],
    ["ar", "âr"], ["er", "eur"], ["ir", "eur"], ["ur", "eur"], ["or", "or"],
    ["ng", "ng"], ["ss", "ss"], ["ll", "l"], ["tt", "t"], ["pp", "p"], ["mm", "m"],
    ["nn", "n"], ["ff", "f"], ["dd", "d"], ["gg", "g"], ["rr", "r"], ["bb", "b"],
    ["a", "a"], ["e", "è"], ["i", "i"], ["o", "o"], ["u", "eu"], ["y", "i"],
    ["c", "k"], ["g", "g"], ["j", "dj"], ["x", "ks"], ["s", "s"], ["w", "ou"]
  ];
  var VOW = "aeiouy";

  function byRules(w) {
    // -ed final : « d » ou « t » collés, sauf après t/d où la syllabe existe
    // (sailed -> seïld, walked -> ouokt, wanted -> OUON-tid)
    if (w.length > 3 && w.slice(-2) === 'ed') {
      var stem = w.slice(0, -2), last = stem.slice(-1);
      if (last === 't' || last === 'd') return byRules(stem) + 'id';
      if ('ptkfsx'.indexOf(last) >= 0) return byRules(stem) + 't';
      if (VOW.indexOf(last) < 0) return byRules(stem) + 'd';
    }
    // « magic e » : name -> neïm, like -> laïk, note -> nôt
    var LONG = { a: "eï", i: "aï", o: "ô", u: "you", e: "ii" };
    var magic = /^(.*?)([aeiou])([bcdfgklmnprstvz])e$/.exec(w);
    if (magic && magic[1].length <= 3) {
      return byRules(magic[1]) + LONG[magic[2]] + byRules(magic[3]);
    }
    if (w.length > 2 && w.charAt(w.length - 1) === 'e' &&
        VOW.indexOf(w.charAt(w.length - 2)) < 0) {
      w = w.slice(0, -1);   // e final muet
    }

    var out = '', i = 0;
    while (i < w.length) {
      var hit = null;
      for (var r = 0; r < RULES.length; r++) {
        var pat = RULES[r][0];
        if (w.substr(i, pat.length) === pat) {
          // c et g s'adoucissent devant e, i, y
          if (pat === 'c' && 'eiy'.indexOf(w.charAt(i + 1)) >= 0) { hit = ['c', 's']; }
          else if (pat === 'g' && 'eiy'.indexOf(w.charAt(i + 1)) >= 0) { hit = ['g', 'dj']; }
          else hit = RULES[r];
          break;
        }
      }
      if (hit) { out += hit[1]; i += hit[0].length; }
      else { out += w.charAt(i); i++; }
    }
    return out;
  }

  // Contractions : on traite la base puis on recolle la terminaison,
  // sinon l'apostrophe ressort telle quelle dans la transcription.
  var CONTR = [["n't", "eunt"], ["'re", "eur"], ["'ve", "v"], ["'ll", "l"],
               ["'s", "z"], ["'d", "d"], ["'m", "m"]];

  function word(w) {
    var clean = String(w || '').toLowerCase().replace(/[^a-z']/g, '');
    if (!clean) return '';
    if (DICT[clean]) return DICT[clean];

    for (var c = 0; c < CONTR.length; c++) {
      var suf = CONTR[c][0];
      if (clean.length > suf.length && clean.slice(-suf.length) === suf) {
        return word(clean.slice(0, -suf.length)) + CONTR[c][1];
      }
    }
    // pluriel / 3e personne / passé dont la base est connue.
    // La terminaison se sonorise selon la consonne qui précède.
    if (clean.length > 3 && clean.slice(-1) === 's' && DICT[clean.slice(0, -1)]) {
      var b = clean.slice(0, -1), lb = b.slice(-1);
      return DICT[b] + ('ptkfh'.indexOf(lb) >= 0 ? 's' : 'z');
    }
    if (clean.length > 4 && clean.slice(-2) === 'ed' && DICT[clean.slice(0, -2)]) {
      var st = clean.slice(0, -2), ls = st.slice(-1);
      return DICT[st] + (ls === 't' || ls === 'd' ? 'id' : ('ptkfsx'.indexOf(ls) >= 0 ? 't' : 'd'));
    }
    return byRules(clean.replace(/'/g, ''));
  }

  /** Transcrit une phrase entière, ponctuation conservée. */
  function line(sentence) {
    return String(sentence || '')
      .split(/(\s+)/)
      .map(function (tok) {
        if (/^\s+$/.test(tok)) return tok;
        var m = /^([^A-Za-z']*)([A-Za-z']+)([^A-Za-z']*)$/.exec(tok);
        if (!m) return tok;
        return m[1] + word(m[2]) + m[3];
      })
      .join('');
  }

  /** Combien de mots viennent du dictionnaire (fiables) vs des règles. */
  function coverage(sentence) {
    var ws = String(sentence || '').toLowerCase().match(/[a-z']+/g) || [];
    var known = ws.filter(function (w) { return !!DICT[w]; }).length;
    return { total: ws.length, known: known };
  }

  global.Phonetic = { word: word, line: line, coverage: coverage, dict: DICT };
})(window);
