/* ============================================================
   PUMP — programmes, methode et paliers
   ------------------------------------------------------------
   Regle de fond : un muscle sollicite 2 fois par semaine grossit
   plus vite que le meme volume concentre sur une seule seance.
   ============================================================ */

window.PROGRAMMES = [
  {
    id: 'demarrage',
    nom: "Démarrage",
    jours: 2, duree: "25 min",
    pour: "Tu débutes ou tu reprends après une longue pause.",
    conseil: "Deux séances par semaine, espacées d'au moins 48 h (mardi / vendredi par exemple). Ne cherche pas à en faire plus le premier mois : c'est le tendon qui s'adapte le plus lentement, et c'est lui qui te blesserait.",
    seances: [
      { nom: "Bras A", exos: [
        { id: 'extension-nuque', series: 3, reps: "10-12", repos: 90 },
        { id: 'curl-halteres', series: 3, reps: "10-12", repos: 90 },
        { id: 'dips-banc', series: 3, reps: "10-15", repos: 75 },
        { id: 'curl-marteau', series: 3, reps: "10-12", repos: 75 },
        { id: 'curl-poignet', series: 2, reps: "15-20", repos: 45 }
      ] },
      { nom: "Bras B", exos: [
        { id: 'curl-incline', series: 3, reps: "10-12", repos: 90 },
        { id: 'pompes-diamant', series: 3, reps: "8-15", repos: 90 },
        { id: 'curl-marteau', series: 3, reps: "10-12", repos: 75 },
        { id: 'pushdown-elastique', series: 2, reps: "15-20", repos: 60 },
        { id: 'extension-poignet', series: 2, reps: "15-20", repos: 45 }
      ] }
    ]
  },
  {
    id: 'masse',
    nom: "Prise de masse",
    jours: 3, duree: "35 min",
    pour: "Tu t'entraînes déjà depuis 2-3 mois et tu veux du volume.",
    conseil: "Trois séances par semaine (lundi / mercredi / vendredi). C'est le programme à suivre le plus longtemps : la progression vient de la charge qui monte semaine après semaine, pas du changement d'exercices.",
    seances: [
      { nom: "A — accent biceps", exos: [
        { id: 'curl-incline', series: 4, reps: "8-12", repos: 90 },
        { id: 'curl-marteau', series: 3, reps: "8-12", repos: 90 },
        { id: 'extension-nuque', series: 3, reps: "8-12", repos: 90 },
        { id: 'dips-banc', series: 3, reps: "10-15", repos: 75 },
        { id: 'curl-poignet', series: 2, reps: "15-25", repos: 45 }
      ] },
      { nom: "B — accent triceps", exos: [
        { id: 'extension-nuque', series: 4, reps: "8-12", repos: 90 },
        { id: 'dips-chaises', series: 3, reps: "6-12", repos: 120 },
        { id: 'barre-front-sol', series: 3, reps: "8-12", repos: 90 },
        { id: 'curl-halteres', series: 3, reps: "8-12", repos: 90 },
        { id: 'curl-concentre', series: 2, reps: "10-15", repos: 60 }
      ] },
      { nom: "C — bras complet", exos: [
        { id: 'traction-supination', series: 3, reps: "5-10", repos: 120 },
        { id: 'pompes-diamant', series: 3, reps: "8-15", repos: 90 },
        { id: 'curl-araignee', series: 3, reps: "10-15", repos: 75 },
        { id: 'extension-nuque-elastique', series: 3, reps: "12-20", repos: 60 },
        { id: 'curl-inverse', series: 2, reps: "12-15", repos: 60 },
        { id: 'suspension', series: 3, reps: "30-60 s", repos: 60 }
      ] }
    ]
  },
  {
    id: 'specialisation',
    nom: "Spécialisation bras",
    jours: 4, duree: "40 min",
    pour: "Bras en retard sur le reste du corps, 6 à 8 semaines maximum.",
    conseil: "Quatre séances par semaine, c'est un forçage temporaire. Au-delà de 8 semaines le corps ne suit plus : reviens ensuite à 3 séances. Pendant cette période, allège franchement le reste de ton entraînement.",
    seances: [
      { nom: "A — biceps lourd", exos: [
        { id: 'traction-supination', series: 4, reps: "5-8", repos: 150 },
        { id: 'curl-incline', series: 4, reps: "8-10", repos: 90 },
        { id: 'curl-marteau', series: 3, reps: "8-12", repos: 90 },
        { id: 'curl-elastique', series: 2, reps: "jusqu'à l'échec", repos: 60 }
      ] },
      { nom: "B — triceps lourd", exos: [
        { id: 'dips-chaises', series: 4, reps: "6-10", repos: 150 },
        { id: 'extension-nuque', series: 4, reps: "8-12", repos: 90 },
        { id: 'barre-front-sol', series: 3, reps: "10-12", repos: 90 },
        { id: 'pushdown-elastique', series: 2, reps: "jusqu'à l'échec", repos: 60 }
      ] },
      { nom: "C — biceps volume", exos: [
        { id: 'curl-araignee', series: 3, reps: "12-15", repos: 75 },
        { id: 'curl-halteres', series: 3, reps: "10-15", repos: 75 },
        { id: 'curl-concentre', series: 3, reps: "12-15", repos: 60 },
        { id: 'curl-inverse', series: 3, reps: "12-15", repos: 60 },
        { id: 'curl-poignet', series: 3, reps: "20-25", repos: 45 }
      ] },
      { nom: "D — triceps volume + avant-bras", exos: [
        { id: 'pompes-diamant', series: 3, reps: "12-20", repos: 75 },
        { id: 'extension-nuque-elastique', series: 3, reps: "15-20", repos: 60 },
        { id: 'kickback', series: 2, reps: "15-20", repos: 45 },
        { id: 'suspension', series: 3, reps: "40-60 s", repos: 60 },
        { id: 'essorage-serviette', series: 2, reps: "30 s / sens", repos: 30 }
      ] }
    ]
  },
  {
    id: 'zero',
    nom: "Zéro matériel",
    jours: 3, duree: "20 min",
    pour: "En déplacement, chez quelqu'un, ou avant d'avoir acheté quoi que ce soit.",
    conseil: "Une table solide et une chaise suffisent. La progression se fait en avançant les pieds, en surélevant les appuis et en ralentissant la descente — pas en ajoutant des répétitions à l'infini.",
    seances: [
      { nom: "Bras sans rien", exos: [
        { id: 'curl-australien', series: 3, reps: "8-15", repos: 90 },
        { id: 'pompes-diamant', series: 3, reps: "8-15", repos: 90 },
        { id: 'dips-banc', series: 3, reps: "10-15", repos: 75 },
        { id: 'curl-isometrique', series: 3, reps: "8 + 20 s", repos: 60 },
        { id: 'essorage-serviette', series: 2, reps: "30 s / sens", repos: 30 }
      ] }
    ]
  },
  {
    id: 'express',
    nom: "Express 12 minutes",
    jours: 1, duree: "12 min",
    pour: "Journée pleine, mais tu ne veux pas sauter la séance.",
    conseil: "Enchaîne biceps et triceps sans repos entre les deux (pendant que l'un travaille, l'autre récupère), puis 60 s de pause. Trois tours. C'est court mais dense : mets lourd.",
    seances: [
      { nom: "Superset bras", exos: [
        { id: 'curl-marteau', series: 3, reps: "10-12", repos: 0, note: "Enchaîne directement sur l'extension nuque." },
        { id: 'extension-nuque', series: 3, reps: "10-12", repos: 60, note: "Puis 60 s de repos et on repart." },
        { id: 'curl-elastique', series: 1, reps: "jusqu'à l'échec", repos: 0 }
      ] }
    ]
  }
];

/* Les regles qui font vraiment grossir un bras. */
window.PRINCIPES = [
  { t: "La charge doit monter",
    d: "C'est LE facteur. Si tu soulèves les mêmes 10 kg dans six mois, tu auras les mêmes bras. Quand tu atteins le haut de la fourchette de répétitions sur toutes tes séries (par exemple 12, 12, 12), augmente : +1 kg, ou +2 répétitions par série la semaine suivante." },
  { t: "Arrête-toi à 1 ou 2 répétitions de l'échec",
    d: "Trop facile ne stimule rien, l'échec systématique fatigue plus qu'il ne construit. La bonne série se termine quand tu sens que tu aurais pu en faire une ou deux de plus, pas cinq." },
  { t: "10 à 20 séries par muscle et par semaine",
    d: "En dessous de 10, on entretient. Au-delà de 20 pour les bras, la récupération lâche avant le muscle. Compte les séries de biceps et de triceps séparément." },
  { t: "Descends en 3 secondes",
    d: "La phase de descente (excentrique) crée plus de dégâts musculaires — donc plus de reconstruction — que la montée. C'est gratuit : ralentis, tu progresses plus avec le même poids." },
  { t: "Le triceps fait les deux tiers du bras",
    d: "Vu de face on ne voit que le biceps, mais en volume le triceps représente environ 60 % du bras. Un bras qui ne grossit pas est presque toujours un bras dont on n'entraîne pas assez le triceps." },
  { t: "Les gros exercices comptent aussi",
    d: "Tractions, rowing, pompes, développés : ils chargent les bras lourdement au passage. Une séance de dos ou de pectoraux dans la semaine accélère la croissance des bras, elle ne la freine pas." },
  { t: "Amplitude complète, surtout en bas",
    d: "Bras totalement tendu en bas de chaque curl. C'est inconfortable, ça oblige à mettre moins lourd, et c'est précisément ce qui fait la différence à six mois." },
  { t: "Le repos fait partie du programme",
    d: "Le muscle grossit entre les séances. Deux jours d'affilée de bras lourds, c'est un jour perdu. 48 h minimum entre deux séances qui touchent le même muscle." }
];

/* Techniques d'intensification : utiles une fois la base en place. */
window.TECHNIQUES = [
  { nom: "Séries 21",
    d: "7 répétitions sur la moitié basse, 7 sur la moitié haute, 7 complètes, sans lâcher la charge. Volume de tension énorme sur le biceps.",
    quand: "En dernière série de curl, une semaine sur deux." },
  { nom: "Rest-pause",
    d: "Série jusqu'à 1 répétition de l'échec, 15 s de pause, on repart pour 3 à 5 répétitions, encore 15 s, encore 3. Trois mini-séries pour le prix d'une.",
    quand: "Sur le dernier exercice, quand le temps manque." },
  { nom: "Séries dégressives",
    d: "À l'échec, tu réduis la charge de 30 % et tu continues immédiatement. Deux baisses maximum.",
    quand: "Une fois par semaine, sur un seul exercice." },
  { nom: "Excentrique lente",
    d: "Descente en 5 secondes au lieu de 3, sur toutes les répétitions de la dernière série. Courbatures garanties le lendemain.",
    quand: "Quand tu stagnes avec la même charge depuis trois semaines." },
  { nom: "Occlusion légère",
    d: "Séries longues (20-30 répétitions) avec une charge légère, en cherchant la congestion maximale. Ça complète le travail lourd, ça ne le remplace pas.",
    quand: "En fin de séance, jamais au début." }
];

/* Paliers du tour de bras — objectif affiche de l'application. */
window.PALIERS = [
  { cm: 28, titre: "Le bar ouvre", txt: "On commence quelque part. Un maki tient en équilibre si tu ne bouges pas." },
  { cm: 31, titre: "Deux makis", txt: "Le biceps se dessine quand tu serres. Ta copine commence à poser des questions." },
  { cm: 34, titre: "Un california roll entier", txt: "Le bras remplit la manche du t-shirt. Effet visible sur les photos." },
  { cm: 36, titre: "Plateau 6 pièces", txt: "Séparation nette entre biceps et triceps. Tu as gagné le droit de commander pour deux." },
  { cm: 38, titre: "Plateau 12 pièces + baguettes", txt: "Bras clairement musclé au repos, pas seulement contracté." },
  { cm: 40, titre: "Plateau 18 pièces, sauce soja comprise", txt: "Le cap symbolique des 40. Peu de gens naturels le dépassent." },
  { cm: 42, titre: "Bar à sushis complet", txt: "Service à volonté. À ce stade c'est le t-shirt qui pose problème, plus le biceps." }
];

window.REALISME = {
  t: "Ce qui est réellement atteignable",
  points: [
    "Un débutant naturel prend 2 à 4 cm de tour de bras sur sa première année, en s'entraînant sérieusement et en mangeant assez. La moitié arrive dans les 4 premiers mois.",
    "Après deux ans d'entraînement, +1 cm par an est déjà une bonne performance.",
    "Le bras ne grossit pas seul : une partie du tour de bras vient de la masse générale. Si ton poids de corps ne bouge pas du tout, le bras ne bougera presque pas non plus.",
    "La forme du biceps (le fameux pic) est génétique, sa taille non. On travaille la taille.",
    "Mesure toujours dans les mêmes conditions : bras contracté, au point le plus large, le matin, une fois par semaine. Le reste, c'est du bruit."
  ]
};
