/* ============================================================
   PUMP — catalogue des exercices
   ------------------------------------------------------------
   Tout se fait a la maison : halteres (ou sac a dos charge,
   ou bouteilles d'eau), un elastique, une chaise, une serviette.

   La note n'est pas une opinion : elle se calcule a partir de
   quatre criteres (window.CRITERES), pour qu'on puisse toujours
   repondre a "pourquoi cet exo est mieux que l'autre".
   ============================================================ */

/* Les quatre criteres de notation, avec leur poids.
   L'etirement pese le plus lourd : c'est la partie du mouvement
   ou le muscle prend le plus de signal de croissance. */
window.CRITERES = [
  { k: 'etir', nom: 'Tension en étirement', poids: 0.35,
    aide: "Le muscle est-il chargé quand il est long ? C'est là que la croissance se déclenche le plus fort. Un exercice où la résistance disparaît en bas perd beaucoup." },
  { k: 'charge', nom: 'Charge progressive', poids: 0.30,
    aide: "Peux-tu ajouter du poids semaine après semaine à la maison ? Sans progression de charge, le muscle n'a aucune raison de grossir." },
  { k: 'cible', nom: 'Ciblage du muscle', poids: 0.20,
    aide: "Quelle part du travail arrive vraiment sur le muscle visé, et pas sur les épaules, le dos ou l'élan." },
  { k: 'acces', nom: 'Accessibilité', poids: 0.15,
    aide: "Matériel nécessaire et facilité d'exécution correcte sans coach ni miroir." }
];

window.EXOS = [

/* ================== BICEPS ================== */
{
  id: 'curl-incline',
  nom: "Curl incliné",
  zone: 'biceps',
  muscles: ["Biceps — longue portion", "Biceps — courte portion"],
  mat: ['haltères', 'canapé ou chaise inclinée'],
  niveau: 'inter',
  s: { etir: 5, charge: 4, cible: 5, acces: 3 },
  pourquoi: "Assis en arrière, ton bras part derrière le corps : la longue portion du biceps est étirée à fond avant même de commencer. C'est le seul curl maison qui charge le biceps dans sa position la plus longue, et c'est exactement là que le muscle grossit le plus.",
  exec: [
    "Assieds-toi dans un canapé ou sur une chaise inclinée à 45-60°, dos calé.",
    "Laisse les bras pendre complètement derrière la ligne du corps, paumes vers l'avant.",
    "Monte sans bouger le coude : seul l'avant-bras se déplace.",
    "Redescends en 3 secondes jusqu'à bras totalement tendu — ne triche pas sur la fin."
  ],
  erreurs: [
    "Remonter les coudes vers l'avant : tu transformes le curl en exercice d'épaule et tu perds l'étirement.",
    "S'arrêter à mi-descente : la moitié la plus utile du mouvement est justement en bas.",
    "Décoller le dos du dossier pour aider avec le buste."
  ],
  series: '3 à 4', reps: '8 à 12', repos: '90 s', tempo: '3-0-1',
  variante: "Pas d'haltères : deux bouteilles de 1,5 L (1,5 kg chacune) ou un sac à dos tenu par la sangle.",
  yt: "curl incliné haltères technique",
  anim: {
    base: 'incline', charge: 'haltere', poignet: 'sup', muscle: 'biceps', bras2: 'miroir',
    cles: [
      { sh: -12, el: 8, hi: 0.2, t: 1000, lbl: "Montée — 1 s" },
      { sh: -4, el: 140, hi: 1, t: 400, lbl: "Serre en haut" },
      { sh: -4, el: 140, hi: 0.9, t: 1800, lbl: "Descente — 3 s (le plus important)" }
    ]
  }
},
{
  id: 'curl-marteau',
  nom: "Curl marteau",
  zone: 'biceps',
  muscles: ["Brachial antérieur", "Brachio-radial", "Biceps"],
  mat: ['haltères'],
  niveau: 'debut',
  s: { etir: 4, charge: 5, cible: 4, acces: 5 },
  pourquoi: "Prise neutre : le biceps perd du levier, le brachial prend le relais. Or le brachial est situé SOUS le biceps — le développer pousse le biceps vers le haut et élargit le bras vu de face. C'est l'exercice qui fait le plus pour l'épaisseur du bras à la maison, et c'est aussi celui où tu peux mettre le plus lourd.",
  exec: [
    "Debout, bras le long du corps, pouces vers le haut, comme si tu tenais deux marteaux.",
    "Monte sans tourner le poignet, coudes collés aux côtes.",
    "Monte jusqu'à ce que l'avant-bras touche presque le biceps, redescends en 3 s bras tendu."
  ],
  erreurs: [
    "Balancer le buste pour lancer la charge : passe à plus léger, tu gagneras plus.",
    "Laisser les coudes partir vers l'avant en fin de montée.",
    "Tourner le poignet en montant — ça devient un curl classique, pas un marteau."
  ],
  series: '3 à 4', reps: '8 à 12', repos: '90 s', tempo: '3-0-1',
  variante: "Un seul haltère lourd tenu à deux mains devant soi, ou un sac à dos par la sangle.",
  yt: "curl marteau haltères technique",
  anim: {
    base: 'debout', charge: 'haltere', poignet: 'neutre', muscle: 'biceps', bras2: 'miroir',
    cles: [
      { sh: 3, el: 10, hi: 0.2, t: 1000, lbl: "Montée — 1 s" },
      { sh: 8, el: 140, hi: 1, t: 400, lbl: "Serre en haut" },
      { sh: 3, el: 10, hi: 0.9, t: 1800, lbl: "Descente — 3 s" }
    ]
  }
},
{
  id: 'curl-halteres',
  nom: "Curl haltères debout",
  zone: 'biceps',
  muscles: ["Biceps — les deux portions"],
  mat: ['haltères'],
  niveau: 'debut',
  s: { etir: 3, charge: 5, cible: 5, acces: 5 },
  pourquoi: "La valeur sûre. La supination (tourner la paume vers le haut en montant) est une fonction propre du biceps : c'est le seul geste qui recrute les deux portions à fond en même temps. Il manque juste l'étirement du curl incliné, d'où la note un cran en dessous.",
  exec: [
    "Debout, dos droit, paumes face à toi, bras tendus.",
    "Monte en tournant progressivement la paume vers le plafond.",
    "En haut, serre 1 seconde, petit doigt légèrement plus haut que le pouce.",
    "Descends en 3 s, bras complètement tendu en bas."
  ],
  erreurs: [
    "Ne pas tendre les bras en bas : tu coupes le tiers le plus productif de la série.",
    "Reculer les épaules pour aider.",
    "Alterner trop vite : un bras à la fois permet plus lourd, mais garde le rythme lent."
  ],
  series: '3 à 4', reps: '8 à 12', repos: '90 s', tempo: '3-0-1',
  variante: "Sac à dos chargé de livres ou de bouteilles, tenu par les deux sangles.",
  yt: "curl biceps haltères supination technique",
  anim: {
    base: 'debout', charge: 'haltere', poignet: 'sup', muscle: 'biceps', bras2: 'miroir',
    cles: [
      { sh: 3, el: 8, hi: 0.2, t: 1000, lbl: "Montée + supination — 1 s" },
      { sh: 8, el: 142, hi: 1, t: 400, lbl: "Serre en haut" },
      { sh: 3, el: 8, hi: 0.9, t: 1800, lbl: "Descente — 3 s" }
    ]
  }
},
{
  id: 'traction-supination',
  nom: "Tractions en supination",
  zone: 'biceps',
  muscles: ["Biceps", "Grand dorsal", "Brachial"],
  mat: ['barre de traction'],
  niveau: 'avance',
  s: { etir: 4, charge: 5, cible: 3, acces: 3 },
  pourquoi: "Le biceps y déplace tout ton corps : aucune charge maison ne s'en approche. Le dos participe beaucoup — d'où un ciblage moyen — mais en volume de muscle construit sur le bras, c'est imbattable dès que tu as une barre.",
  exec: [
    "Prise mains en supination (paumes vers toi), écartement largeur d'épaules.",
    "Pars bras tendus, sans balancer.",
    "Tire en amenant les coudes vers les côtes, menton au-dessus de la barre.",
    "Redescends en 3 s jusqu'aux bras tendus."
  ],
  erreurs: [
    "Se balancer pour arracher la première répétition : la charge revient aux hanches, pas au biceps.",
    "Ne pas redescendre complètement.",
    "Trop peu de répétitions possibles : commence avec les pieds sur une chaise pour t'aider."
  ],
  series: '3 à 4', reps: '5 à 10', repos: '2 min', tempo: '3-0-1',
  variante: "Pas de barre : passe par le curl australien sous une table, même principe au poids du corps.",
  yt: "traction supination chin up technique",
  anim: {
    base: 'suspendu', charge: 'corps', poignet: 'sup', muscle: 'biceps', bras2: 'miroir',
    cles: [
      { sh: 174, el: 5, hi: 0.25, t: 1000, lbl: "Traction — 1 s" },
      { sh: 150, el: 135, hi: 1, t: 350, lbl: "Menton au-dessus" },
      { sh: 150, el: 135, hi: 0.85, t: 1700, lbl: "Descente — 3 s" }
    ]
  }
},
{
  id: 'curl-elastique',
  nom: "Curl à l'élastique",
  zone: 'biceps',
  muscles: ["Biceps", "Brachial"],
  mat: ['élastique'],
  niveau: 'debut',
  s: { etir: 2, charge: 4, cible: 5, acces: 5 },
  pourquoi: "Tension constante et zéro contrainte sur les articulations, mais l'élastique est mou en bas — précisément là où le muscle est étiré. Excellent en fin de séance pour finir de vider le biceps, moins bon comme exercice principal.",
  exec: [
    "Debout au milieu de l'élastique, un pied dessus (deux pieds = plus dur).",
    "Coudes collés au corps, monte en gardant la tension jusqu'en haut.",
    "Résiste 3 s à la descente : l'élastique va vouloir te ramener vite.",
    "Recule le pied d'un cran pour pré-tendre l'élastique et corriger le point faible du bas."
  ],
  erreurs: [
    "Laisser l'élastique se détendre complètement en bas.",
    "Se pencher en arrière quand ça devient dur.",
    "Prendre un élastique trop léger : si tu dépasses 20 répétitions faciles, change de résistance."
  ],
  series: '2 à 3', reps: '12 à 20', repos: '60 s', tempo: '2-0-1',
  variante: "En finisseur : une série jusqu'à l'échec après ton dernier exercice d'haltères.",
  yt: "curl biceps élastique technique",
  anim: {
    base: 'debout', charge: 'elastique', ancre: 'pied', poignet: 'sup', muscle: 'biceps', bras2: 'miroir',
    cles: [
      { sh: 3, el: 10, hi: 0.15, t: 900, lbl: "Montée — 1 s" },
      { sh: 6, el: 140, hi: 1, t: 400, lbl: "Tension maximale en haut" },
      { sh: 3, el: 10, hi: 0.8, t: 1500, lbl: "Retenir la descente — 3 s" }
    ]
  }
},
{
  id: 'curl-concentre',
  nom: "Curl concentré",
  zone: 'biceps',
  muscles: ["Biceps — courte portion"],
  mat: ['1 haltère', 'chaise'],
  niveau: 'debut',
  s: { etir: 3, charge: 3, cible: 5, acces: 5 },
  pourquoi: "Coude calé sur la cuisse : impossible de tricher, le biceps travaille seul. C'est l'exercice qui donne le plus de sensation, mais la charge plafonne vite (un bras, position assise), donc il finit une séance plutôt qu'il ne la commence.",
  exec: [
    "Assis, jambes écartées, coude de l'intérieur du bras posé contre la cuisse.",
    "Bras complètement tendu en bas, haltère près du sol.",
    "Monte en supination, serre 1 s en haut.",
    "Descends en 3 s sans laisser le coude glisser."
  ],
  erreurs: [
    "Pousser sur la cuisse avec le coude pour aider.",
    "Tourner le buste au moment difficile.",
    "Écourter la descente."
  ],
  series: '2 à 3', reps: '10 à 15', repos: '60 s', tempo: '3-0-1',
  variante: "Une bouteille de 5 L d'eau tenue par la poignée fait très bien l'affaire.",
  yt: "curl concentré technique",
  anim: {
    base: 'assis-penche', charge: 'haltere', poignet: 'sup', muscle: 'biceps', bras2: 'appui',
    cles: [
      { sh: 32, el: 8, hi: 0.2, t: 1000, lbl: "Montée — 1 s" },
      { sh: 32, el: 135, hi: 1, t: 450, lbl: "Serre fort en haut" },
      { sh: 32, el: 8, hi: 0.9, t: 1800, lbl: "Descente — 3 s" }
    ]
  }
},
{
  id: 'curl-araignee',
  nom: "Curl araignée",
  zone: 'biceps',
  muscles: ["Biceps — courte portion"],
  mat: ['haltères', 'dossier de chaise'],
  niveau: 'inter',
  s: { etir: 3, charge: 3, cible: 5, acces: 4 },
  pourquoi: "Buste penché sur un dossier, bras à la verticale devant : la résistance est maximale en haut du mouvement, exactement l'inverse du curl incliné. Les deux se complètent bien dans une même séance.",
  exec: [
    "Penche-toi poitrine contre le dossier d'une chaise, bras pendants devant.",
    "Bras à la verticale, complètement tendus.",
    "Monte sans que le coude ne recule, serre 1 s.",
    "Descends en 3 s."
  ],
  erreurs: [
    "Reculer les coudes pour se donner un angle plus facile.",
    "Prendre trop lourd : ici la tension en haut compte plus que le poids affiché.",
    "S'appuyer sur le dossier avec les bras au lieu de la poitrine."
  ],
  series: '2 à 3', reps: '10 à 15', repos: '75 s', tempo: '3-1-1',
  variante: "À plat ventre en travers d'un lit, bras dans le vide.",
  yt: "spider curl curl araignée technique",
  anim: {
    base: 'penche-dossier', charge: 'haltere', poignet: 'sup', muscle: 'biceps', bras2: 'miroir',
    cles: [
      { sh: 20, el: 6, hi: 0.15, t: 950, lbl: "Montée — 1 s" },
      { sh: 20, el: 138, hi: 1, t: 550, lbl: "Serre 1 s (le point clé)" },
      { sh: 20, el: 6, hi: 0.85, t: 1700, lbl: "Descente — 3 s" }
    ]
  }
},
{
  id: 'curl-inverse',
  nom: "Curl inversé",
  zone: 'biceps',
  muscles: ["Brachio-radial", "Brachial", "Extenseurs de l'avant-bras"],
  mat: ['haltères'],
  niveau: 'inter',
  s: { etir: 3, charge: 3, cible: 4, acces: 5 },
  pourquoi: "Paumes vers le bas : le biceps est en mauvaise position, tout part sur le brachio-radial, ce muscle en relief entre le coude et le poignet. C'est lui qui donne au bras l'air plein quand il est le long du corps. Charges forcément légères.",
  exec: [
    "Debout, paumes vers le sol, poignets droits et fermes.",
    "Monte lentement sans casser le poignet vers le bas.",
    "Descends en 3 s, bras tendus."
  ],
  erreurs: [
    "Mettre le même poids qu'au curl classique : c'est normalement 40 à 50 % de moins.",
    "Laisser le poignet plier sous la charge.",
    "Compenser avec les épaules."
  ],
  series: '2 à 3', reps: '10 à 15', repos: '60 s', tempo: '3-0-1',
  variante: "Un manche à balai chargé de deux packs d'eau accrochés aux extrémités.",
  yt: "curl inversé pronation avant-bras technique",
  anim: {
    base: 'debout', charge: 'haltere', poignet: 'pron', muscle: 'avantbras', bras2: 'miroir',
    cles: [
      { sh: 3, el: 8, hi: 0.2, t: 1000, lbl: "Montée — 1 s" },
      { sh: 6, el: 135, hi: 1, t: 400, lbl: "Poignet verrouillé" },
      { sh: 3, el: 8, hi: 0.85, t: 1800, lbl: "Descente — 3 s" }
    ]
  }
},
{
  id: 'curl-australien',
  nom: "Curl australien",
  zone: 'biceps',
  muscles: ["Biceps", "Dos"],
  mat: ['aucun', 'table solide'],
  niveau: 'debut',
  s: { etir: 3, charge: 4, cible: 3, acces: 4 },
  pourquoi: "Zéro matériel et pourtant une vraie charge : ton propre corps. On règle la difficulté en avançant les pieds. Le dos aide beaucoup, donc le ciblage biceps reste moyen — mais c'est la meilleure option quand tu n'as strictement rien.",
  exec: [
    "Allonge-toi sous une table solide, mains sur le bord en supination, largeur d'épaules.",
    "Corps gainé, en ligne droite des talons aux épaules.",
    "Tire en amenant la poitrine vers le bord, coudes qui restent près du corps.",
    "Descends en 3 s bras tendus. Pieds plus loin = plus dur."
  ],
  erreurs: [
    "Casser les hanches vers le sol (tu ne soulèves plus rien).",
    "Utiliser une table légère qui bascule — teste-la avant, appuie fort.",
    "Coudes qui s'écartent : ça devient du dos."
  ],
  series: '3', reps: '8 à 15', repos: '90 s', tempo: '3-0-1',
  variante: "Avec un balai posé entre deux chaises, plus bas donc plus difficile.",
  yt: "australian pull up curl inversé table biceps",
  anim: {
    base: 'table', charge: 'corps', poignet: 'sup', muscle: 'biceps', bras2: 'miroir',
    cles: [
      { sh: 175, el: 5, hi: 0.25, t: 1000, lbl: "Tirer — 1 s" },
      { sh: 140, el: 125, hi: 1, t: 350, lbl: "Poitrine au bord" },
      { sh: 140, el: 125, hi: 0.85, t: 1700, lbl: "Descente — 3 s" }
    ]
  }
},
{
  id: 'curl-isometrique',
  nom: "Curl auto-résistance",
  zone: 'biceps',
  muscles: ["Biceps"],
  mat: ['aucun', 'serviette'],
  niveau: 'debut',
  s: { etir: 2, charge: 2, cible: 4, acces: 5 },
  pourquoi: "Une main tire, l'autre freine : tu crées ta propre charge, n'importe où, même en déplacement. Le problème est qu'on ne peut pas mesurer la progression et qu'on ne se pousse jamais aussi loin qu'avec un poids réel. Solution de secours, pas solution principale.",
  exec: [
    "Passe une serviette sous ton pied ou tiens-la avec la main libre en bas.",
    "Curl d'un bras contre la résistance de l'autre, montée en 3 s.",
    "Résiste encore plus fort à la descente, 4 s.",
    "8 répétitions lentes par bras, puis un blocage de 20 s à mi-hauteur."
  ],
  erreurs: [
    "Résister mollement : sans charge mesurable, l'intensité dépend entièrement de toi.",
    "Aller vite : ici seule la lenteur crée la tension.",
    "En faire son unique exercice de biceps sur la durée."
  ],
  series: '2 à 3', reps: '8 lentes + 20 s de blocage', repos: '60 s', tempo: '3-2-4',
  variante: "En voyage : sangle de sac à dos ou ceinture à la place de la serviette.",
  yt: "auto résistance biceps serviette sans matériel",
  anim: {
    base: 'debout', charge: 'elastique', ancre: 'main', poignet: 'sup', muscle: 'biceps', bras2: 'basse',
    cles: [
      { sh: 3, el: 12, hi: 0.3, t: 1600, lbl: "Montée en force — 3 s" },
      { sh: 3, el: 120, hi: 1, t: 700, lbl: "Blocage" },
      { sh: 3, el: 12, hi: 0.95, t: 2000, lbl: "L'autre main freine — 4 s" }
    ]
  }
},

/* ================== TRICEPS ================== */
{
  id: 'extension-nuque',
  nom: "Extension nuque haltère",
  zone: 'triceps',
  muscles: ["Triceps — longue portion"],
  mat: ['1 haltère'],
  niveau: 'debut',
  s: { etir: 5, charge: 4, cible: 5, acces: 4 },
  pourquoi: "Le meilleur exercice de bras à la maison, et de loin. Bras au-dessus de la tête, la longue portion du triceps est étirée au maximum — c'est la plus grosse des trois portions, et c'est elle qui donne l'épaisseur du bras vu de dos. Comparé à une extension bras le long du corps, l'overhead fait environ 1,5 fois plus de croissance sur cette portion.",
  exec: [
    "Assis ou debout, un haltère tenu à deux mains, bras tendus au-dessus de la tête.",
    "Coudes serrés vers l'avant, ils ne bougent plus de tout l'exercice.",
    "Descends la charge derrière la nuque jusqu'à l'étirement complet, 3 s.",
    "Remonte sans verrouiller violemment le coude."
  ],
  erreurs: [
    "Écarter les coudes en descendant : l'étirement disparaît.",
    "Cambrer le bas du dos pour aider — gaine les abdos, assieds-toi dos calé si besoin.",
    "Descendre trop vite : c'est une position articulaire à respecter, pas à subir."
  ],
  series: '3 à 4', reps: '8 à 12', repos: '90 s', tempo: '3-1-1',
  variante: "Sac à dos chargé tenu par les sangles, ou une bouteille de 5 L à deux mains.",
  yt: "extension triceps nuque haltère technique",
  anim: {
    base: 'assis', charge: 'haltere', poignet: 'neutre', muscle: 'triceps', bras2: 'miroir', zoom: 0.84,
    cles: [
      { sh: 168, el: 8, hi: 0.3, t: 1700, lbl: "Descente derrière la nuque — 3 s" },
      { sh: 168, el: 150, hi: 0.75, t: 500, lbl: "Étirement maximal" },
      { sh: 168, el: 150, hi: 1, t: 900, lbl: "Remontée — 1 s" }
    ]
  }
},
{
  id: 'barre-front-sol',
  nom: "Extension au front, au sol",
  zone: 'triceps',
  muscles: ["Triceps — les trois portions"],
  mat: ['haltères', 'sol'],
  niveau: 'inter',
  s: { etir: 4, charge: 4, cible: 5, acces: 4 },
  pourquoi: "Allongé, épaules stables, tout le travail va au triceps. Le sol limite la descente et protège le coude tout en gardant un bon étirement. C'est le meilleur exercice de triceps pour charger lourd sans banc.",
  exec: [
    "Allongé sur le dos, haltères bras tendus au-dessus de la poitrine.",
    "Coudes pointés vers le plafond, fixes.",
    "Descends les haltères vers le front / au-dessus des oreilles en 3 s.",
    "Remonte en tendant les bras, sans que les coudes ne partent vers l'extérieur."
  ],
  erreurs: [
    "Laisser les coudes s'écarter : le pectoral prend le relais.",
    "Descendre pile sur le front sans contrôle — vise légèrement derrière la tête, c'est plus sûr et plus étiré.",
    "Charger trop lourd sur un mouvement où le coude est en position vulnérable."
  ],
  series: '3', reps: '8 à 12', repos: '90 s', tempo: '3-0-1',
  variante: "Un seul haltère tenu à deux mains, ou un manche à balai lesté.",
  yt: "skull crusher haltères au sol technique",
  anim: {
    base: 'couche', charge: 'haltere', poignet: 'neutre', muscle: 'triceps', bras2: 'miroir',
    cles: [
      { sh: 172, el: 6, hi: 0.3, t: 1700, lbl: "Descente — 3 s" },
      { sh: 172, el: 120, hi: 0.8, t: 350, lbl: "Étirement" },
      { sh: 172, el: 120, hi: 1, t: 900, lbl: "Extension — 1 s" }
    ]
  }
},
{
  id: 'dips-chaises',
  nom: "Dips entre deux chaises",
  zone: 'triceps',
  muscles: ["Triceps", "Pectoral bas", "Épaule avant"],
  mat: ['2 chaises solides'],
  niveau: 'avance',
  s: { etir: 4, charge: 5, cible: 4, acces: 3 },
  pourquoi: "Ton corps entier comme charge : c'est le mouvement de triceps le plus lourd qu'on puisse faire à la maison, et on peut encore ajouter un sac à dos. Exigeant pour l'épaule, donc à réserver quand tu maîtrises déjà les pompes.",
  exec: [
    "Deux chaises stables face à face, mains sur les assises, bras tendus.",
    "Buste le plus vertical possible (penché = pectoraux, vertical = triceps).",
    "Descends en 3 s jusqu'à ce que le coude fasse 90°, pas plus bas.",
    "Remonte en poussant, sans verrouiller sec en haut."
  ],
  erreurs: [
    "Descendre trop bas : au-delà de 90° l'épaule prend cher pour rien.",
    "Utiliser des chaises légères ou à roulettes.",
    "Se pencher en avant si l'objectif est le triceps."
  ],
  series: '3', reps: '6 à 12', repos: '2 min', tempo: '3-0-1',
  variante: "Trop dur ? Garde les pieds au sol, jambes pliées, et pousse un peu avec les jambes.",
  yt: "dips entre deux chaises triceps technique",
  anim: {
    base: 'dips', charge: 'corps', poignet: 'neutre', muscle: 'triceps', bras2: 'miroir',
    cles: [
      { sh: 2, el: 4, hi: 0.3, t: 1600, lbl: "Descente — 3 s" },
      { sh: -14, el: 92, hi: 0.8, t: 300, lbl: "Coude à 90°, stop" },
      { sh: -14, el: 92, hi: 1, t: 900, lbl: "Poussée — 1 s" }
    ]
  }
},
{
  id: 'extension-nuque-elastique',
  nom: "Extension nuque à l'élastique",
  zone: 'triceps',
  muscles: ["Triceps — longue portion"],
  mat: ['élastique'],
  niveau: 'debut',
  s: { etir: 4, charge: 3, cible: 5, acces: 4 },
  pourquoi: "Même position que l'extension nuque à l'haltère, avec une résistance qui augmente là où tu es le plus fort. Très bonne option si tu n'as qu'un élastique, et articulations épargnées.",
  exec: [
    "Un pied sur l'élastique, l'autre extrémité tenue derrière la nuque à deux mains.",
    "Coudes hauts et serrés, tends les bras vers le plafond.",
    "Reviens en freinant 3 s jusqu'à l'étirement complet.",
    "Avance le pied pour tendre plus l'élastique si c'est trop facile."
  ],
  erreurs: [
    "Élastique trop court derrière le dos : ça tire l'épaule vers l'arrière.",
    "Coudes qui s'ouvrent en fin de série.",
    "Laisser l'élastique claquer au retour."
  ],
  series: '3', reps: '12 à 20', repos: '60 s', tempo: '2-0-1',
  variante: "À genoux si l'élastique est trop long debout.",
  yt: "extension triceps nuque élastique technique",
  anim: {
    base: 'debout', charge: 'elastique', ancre: 'pied-arriere', poignet: 'neutre', muscle: 'triceps', bras2: 'miroir', zoom: 0.82,
    cles: [
      { sh: 150, el: 120, hi: 0.4, t: 900, lbl: "Extension — 1 s" },
      { sh: 156, el: 8, hi: 1, t: 400, lbl: "Bras tendus, serre" },
      { sh: 156, el: 8, hi: 0.6, t: 1600, lbl: "Retour freiné — 3 s" }
    ]
  }
},
{
  id: 'dips-banc',
  nom: "Dips sur chaise",
  zone: 'triceps',
  muscles: ["Triceps", "Épaule avant"],
  mat: ['1 chaise'],
  niveau: 'debut',
  s: { etir: 3, charge: 4, cible: 4, acces: 5 },
  pourquoi: "Une chaise suffit, et on charge facilement en avançant les pieds ou en posant un sac sur les cuisses. La position d'épaule est moins confortable que sur des dips classiques, donc on limite la profondeur.",
  exec: [
    "Mains sur le bord de l'assise derrière toi, doigts vers l'avant.",
    "Fesses juste devant la chaise, jambes plus ou moins tendues devant.",
    "Descends en 3 s jusqu'à 90° au coude.",
    "Remonte en poussant par les paumes, sans hausser les épaules."
  ],
  erreurs: [
    "Descendre jusqu'à sentir tirer devant l'épaule : remonte avant.",
    "Éloigner les fesses de la chaise : tout le poids passe sur l'articulation.",
    "Rester jambes pliées quand c'est devenu facile — tends-les, puis pose un poids sur les cuisses."
  ],
  series: '3', reps: '10 à 15', repos: '75 s', tempo: '3-0-1',
  variante: "Pieds surélevés sur une deuxième chaise pour augmenter la charge.",
  yt: "dips sur chaise banc triceps technique",
  anim: {
    base: 'dips-banc', charge: 'corps', poignet: 'neutre', muscle: 'triceps', bras2: 'miroir',
    cles: [
      { sh: -4, el: 6, hi: 0.3, t: 1600, lbl: "Descente — 3 s" },
      { sh: -20, el: 92, hi: 0.8, t: 300, lbl: "90°, pas plus bas" },
      { sh: -20, el: 92, hi: 1, t: 900, lbl: "Poussée — 1 s" }
    ]
  }
},
{
  id: 'pompes-diamant',
  nom: "Pompes diamant",
  zone: 'triceps',
  muscles: ["Triceps", "Pectoraux", "Épaules"],
  mat: ['aucun'],
  niveau: 'inter',
  s: { etir: 3, charge: 4, cible: 4, acces: 5 },
  pourquoi: "Mains serrées en losange : c'est la variante de pompe qui envoie le plus sur le triceps. Zéro matériel, et on continue à progresser en surélevant les pieds puis en mettant un sac à dos chargé.",
  exec: [
    "Mains au sol sous la poitrine, pouces et index qui se touchent en losange.",
    "Corps gainé, une seule ligne des talons à la tête.",
    "Descends en 3 s, coudes qui frôlent les côtes.",
    "Pousse sans creuser le bas du dos."
  ],
  erreurs: [
    "Écarter les coudes : ça redevient une pompe classique.",
    "Poser les mains trop haut, vers le visage.",
    "Faire 30 répétitions bâclées au lieu de 12 lentes et complètes."
  ],
  series: '3', reps: '8 à 15', repos: '90 s', tempo: '3-0-1',
  variante: "Trop dur : mains sur une table (plus haut = plus facile). Trop facile : pieds sur une chaise + sac à dos.",
  yt: "pompes diamant triceps technique",
  anim: {
    base: 'pompe', charge: 'corps', poignet: 'neutre', muscle: 'triceps', bras2: 'miroir',
    cles: [
      { sh: 8, el: 6, hi: 0.3, t: 1600, lbl: "Descente — 3 s" },
      { sh: -30, el: 92, hi: 0.85, t: 300, lbl: "Poitrine près des mains" },
      { sh: -30, el: 92, hi: 1, t: 800, lbl: "Poussée — 1 s" }
    ]
  }
},
{
  id: 'pushdown-elastique',
  nom: "Extension verticale élastique",
  zone: 'triceps',
  muscles: ["Triceps — portions latérale et médiale"],
  mat: ['élastique', 'point d\'ancrage haut'],
  niveau: 'debut',
  s: { etir: 2, charge: 3, cible: 5, acces: 4 },
  pourquoi: "Coude le long du corps, la longue portion est déjà raccourcie : on travaille surtout les deux autres portions, et la résistance est faible là où le muscle est étiré. Confortable et sans risque, mais ce n'est pas ce qui construit le plus de volume — à placer après un exercice overhead.",
  exec: [
    "Coince l'élastique en haut d'une porte (ou passe-le par-dessus une poignée haute).",
    "Coudes collés aux côtes, avant-bras à l'horizontale.",
    "Tends les bras vers le bas, serre 1 s en bas.",
    "Remonte en freinant 2 s."
  ],
  erreurs: [
    "Se pencher en avant pour pousser avec le poids du corps.",
    "Décoller les coudes des côtes.",
    "Ne pas vérifier la fixation de l'élastique — teste avant de tirer fort."
  ],
  series: '2 à 3', reps: '12 à 20', repos: '60 s', tempo: '2-1-1',
  variante: "En finisseur, série longue jusqu'à sensation de brûlure.",
  yt: "extension triceps poulie haute élastique technique",
  anim: {
    base: 'debout', charge: 'elastique', ancre: 'haut', poignet: 'pron', muscle: 'triceps', bras2: 'miroir',
    cles: [
      { sh: 2, el: 95, hi: 0.3, t: 800, lbl: "Extension — 1 s" },
      { sh: 2, el: 6, hi: 1, t: 500, lbl: "Serre en bas" },
      { sh: 2, el: 95, hi: 0.6, t: 1300, lbl: "Retour freiné — 2 s" }
    ]
  }
},
{
  id: 'kickback',
  nom: "Kickback",
  zone: 'triceps',
  muscles: ["Triceps"],
  mat: ['1 haltère léger'],
  niveau: 'debut',
  s: { etir: 1, charge: 2, cible: 4, acces: 5 },
  pourquoi: "La résistance est maximale quand le bras est tendu, c'est-à-dire quand le triceps est court : presque zéro tension en position étirée, et impossible de charger lourd. Sensation de brûlure garantie, croissance beaucoup plus faible que le reste. Gardé ici comme finisseur, pas comme exercice de base.",
  exec: [
    "Buste penché à 45°, dos plat, coude collé au corps et remonté haut.",
    "Tends l'avant-bras vers l'arrière jusqu'à bras totalement droit.",
    "Serre 1 s en haut, reviens lentement.",
    "Léger : 2 à 5 kg suffisent."
  ],
  erreurs: [
    "Faire descendre et remonter le coude : c'est du dos, plus du triceps.",
    "Prendre lourd et balancer.",
    "En faire son exercice principal de triceps."
  ],
  series: '2', reps: '12 à 20', repos: '45 s', tempo: '2-1-2',
  variante: "À l'élastique sous le pied avant, tension plus constante.",
  yt: "kickback triceps haltère technique",
  anim: {
    base: 'penche', charge: 'haltere', poignet: 'neutre', muscle: 'triceps', bras2: 'appui-genou',
    cles: [
      { sh: -62, el: 95, hi: 0.25, t: 800, lbl: "Extension — 1 s" },
      { sh: -62, el: 4, hi: 1, t: 600, lbl: "Serre bras tendu" },
      { sh: -62, el: 95, hi: 0.5, t: 1200, lbl: "Retour — 2 s" }
    ]
  }
},

/* ================== AVANT-BRAS ================== */
{
  id: 'curl-poignet',
  nom: "Curl poignet",
  zone: 'avant-bras',
  muscles: ["Fléchisseurs de l'avant-bras"],
  mat: ['haltères', 'chaise'],
  niveau: 'debut',
  s: { etir: 4, charge: 3, cible: 5, acces: 5 },
  pourquoi: "L'avant-bras est visible en permanence, manches remontées — c'est lui qui fait croire à un bras costaud avant même le biceps. Le curl poignet l'attaque dans un grand étirement, et il récupère vite : on peut en faire souvent.",
  exec: [
    "Assis, avant-bras posés sur les cuisses, paumes vers le haut, poignets dans le vide.",
    "Laisse l'haltère rouler jusqu'au bout des doigts, étirement complet.",
    "Referme les doigts puis enroule le poignet vers le haut.",
    "Descends en 3 s. Séries longues."
  ],
  erreurs: [
    "Bouger l'avant-bras au lieu du seul poignet.",
    "Amplitude minuscule : la phase doigts ouverts fait la moitié du travail.",
    "Charger trop lourd et compenser avec le coude."
  ],
  series: '2 à 3', reps: '15 à 25', repos: '45 s', tempo: '3-1-1',
  variante: "Enroulement de corde : une bouteille pendue à une ficelle nouée à un manche à balai.",
  yt: "curl poignet avant-bras technique",
  anim: {
    base: 'assis-avantbras', charge: 'haltere', poignet: 'sup', muscle: 'avantbras', bras2: 'appui',
    cles: [
      { sh: 40, el: 55, pg: -45, hi: 0.25, t: 800, lbl: "Enroule vers le haut — 1 s" },
      { sh: 40, el: 55, pg: 40, hi: 1, t: 400, lbl: "Serre" },
      { sh: 40, el: 55, pg: -45, hi: 0.8, t: 1600, lbl: "Ouvre les doigts — 3 s" }
    ]
  }
},
{
  id: 'suspension',
  nom: "Suspension à la barre",
  zone: 'avant-bras',
  muscles: ["Grip", "Fléchisseurs", "Avant-bras complet"],
  mat: ['barre de traction ou 2 sacs lourds'],
  niveau: 'debut',
  s: { etir: 2, charge: 5, cible: 4, acces: 4 },
  pourquoi: "Le grip supporte des charges énormes : c'est le seul travail d'avant-bras où tu peux mettre très lourd. Bonus direct : une main plus solide te fait tenir plus longtemps sur tous les autres exercices, donc plus de répétitions de biceps.",
  exec: [
    "Suspends-toi bras tendus à une barre, épaules légèrement engagées (pas molles).",
    "Tiens le plus longtemps possible, chronomètre.",
    "Sans barre : marche 40 secondes avec un sac de courses lourd dans chaque main, dos droit.",
    "3 tours, note le temps pour progresser."
  ],
  erreurs: [
    "Épaules complètement relâchées pendant longtemps.",
    "Marcher voûté avec les charges.",
    "Ne rien noter : ici la progression, c'est le chrono."
  ],
  series: '3', reps: '30 à 60 s', repos: '60 s', tempo: 'tenue',
  variante: "Serviette pliée autour de la barre : prise épaisse, avant-bras beaucoup plus sollicité.",
  yt: "dead hang suspension barre avant-bras grip",
  anim: {
    base: 'suspendu', charge: 'corps', poignet: 'pron', muscle: 'avantbras', bras2: 'miroir',
    cles: [
      { sh: 172, el: 5, hi: 0.75, t: 1500, lbl: "Tenir — chrono en cours" },
      { sh: 170, el: 7, hi: 1, t: 1500, lbl: "Tenir — ça brûle, c'est normal" }
    ]
  }
},
{
  id: 'extension-poignet',
  nom: "Extension poignet",
  zone: 'avant-bras',
  muscles: ["Extenseurs de l'avant-bras"],
  mat: ['haltères légers', 'chaise'],
  niveau: 'debut',
  s: { etir: 3, charge: 2, cible: 5, acces: 5 },
  pourquoi: "Le côté opposé du curl poignet, sur le dessus de l'avant-bras. Petit muscle, charges minuscules, mais c'est l'assurance anti-douleur du coude : la fameuse épicondylite guette ceux qui ne font que des curls.",
  exec: [
    "Assis, avant-bras sur les cuisses, paumes vers le SOL, poignets dans le vide.",
    "Laisse la main descendre, puis relève-la lentement.",
    "1 à 3 kg suffisent largement.",
    "Séries longues, 20 répétitions."
  ],
  erreurs: [
    "Mettre le même poids qu'au curl poignet.",
    "Décoller l'avant-bras de la cuisse.",
    "Sauter cet exercice — c'est celui qui protège le coude."
  ],
  series: '2', reps: '15 à 25', repos: '45 s', tempo: '2-1-2',
  variante: "Un élastique autour des doigts, ouverture de la main : même famille, encore plus simple.",
  yt: "extension poignet avant-bras épicondylite prévention",
  anim: {
    base: 'assis-avantbras', charge: 'haltere', poignet: 'pron', muscle: 'avantbras', bras2: 'appui',
    cles: [
      { sh: 40, el: 55, pg: 35, hi: 0.25, t: 900, lbl: "Relève la main — 1 s" },
      { sh: 40, el: 55, pg: -30, hi: 1, t: 400, lbl: "Serre en haut" },
      { sh: 40, el: 55, pg: 35, hi: 0.7, t: 1300, lbl: "Descente — 2 s" }
    ]
  }
},
{
  id: 'essorage-serviette',
  nom: "Essorage de serviette",
  zone: 'avant-bras',
  muscles: ["Pronateurs", "Supinateurs", "Grip"],
  mat: ['aucun', 'serviette'],
  niveau: 'debut',
  s: { etir: 2, charge: 2, cible: 4, acces: 5 },
  pourquoi: "Travaille la rotation de l'avant-bras, que rien d'autre ne sollicite dans une séance de bras classique. Rien à acheter, se fait devant la télé. Impossible de mesurer la charge, donc note plafonnée.",
  exec: [
    "Serviette mouillée ou éponge, une main à chaque bout.",
    "Tourne les deux poignets en sens inverse, comme pour essorer.",
    "30 secondes dans un sens, 30 dans l'autre.",
    "Serre à fond du début à la fin."
  ],
  erreurs: [
    "Tourner mollement : sans intensité il ne se passe rien.",
    "Ne le faire qu'une fois de temps en temps.",
    "Compter dessus pour faire grossir le bras à lui seul."
  ],
  series: '2', reps: '30 s par sens', repos: '30 s', tempo: 'continu',
  variante: "Une balle anti-stress ou une éponge serrée 100 fois par main.",
  yt: "essorage serviette avant-bras grip exercice",
  anim: {
    base: 'debout', charge: 'serviette', poignet: 'neutre', muscle: 'avantbras', bras2: 'serviette',
    cles: [
      { sh: 55, el: 95, pg: -50, hi: 0.6, t: 900, lbl: "Essore dans un sens" },
      { sh: 55, el: 95, pg: 50, hi: 1, t: 900, lbl: "Puis dans l'autre" }
    ]
  }
}

];
