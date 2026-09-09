/* ============================================================
   PUMP — nourriture
   ------------------------------------------------------------
   Un bras ne grossit pas avec l'entrainement seul : il faut de
   quoi construire (proteines) et de quoi alimenter (calories).
   Valeurs pour 100 g cuits sauf mention contraire.
   ============================================================ */

window.CAT_ALIMENTS = [
  { k: 'prot', nom: "Protéines", ico: '🥩',
    intro: "La brique du muscle. Vise 1,6 à 2,2 g par kilo de poids de corps et par jour, répartis sur 4 repas plutôt que sur un seul." },
  { k: 'glu', nom: "Glucides", ico: '🍚',
    intro: "Le carburant. Sans eux, tes séances sont molles et ton corps pioche dans le muscle. C'est aussi le levier le plus simple pour créer le surplus de calories." },
  { k: 'lip', nom: "Lipides", ico: '🥑',
    intro: "Nécessaires aux hormones, dont la testostérone. Très caloriques : c'est utile pour atteindre ton total sans manger des volumes énormes." },
  { k: 'leg', nom: "Légumes & fruits", ico: '🥦',
    intro: "Peu de calories, beaucoup de micronutriments et de fibres. Ils ne font pas grossir le bras, ils font que le reste fonctionne." },
  { k: 'lim', nom: "À limiter", ico: '⛔',
    intro: "Rien n'est interdit. Ce sont juste les choses qui coûtent cher en calories ou qui freinent directement la construction musculaire." }
];

window.ALIMENTS = [
  /* ---------- PROTÉINES ---------- */
  { id: 'oeuf', base: 55, pu: 55, un: "œuf", nom: "Œufs entiers", cat: 'prot', unite: "1 œuf (55 g)", prot: 6.5, kcal: 78, score: 3,
    pourquoi: "Protéine de référence, profil d'acides aminés parfait, et le jaune apporte les vitamines. Le moins cher au gramme de protéine.",
    astuce: "3 œufs + 2 tranches de pain complet = un petit-déjeuner qui tient jusqu'à midi." },
  { id: 'poulet', base: 100, nom: "Blanc de poulet", cat: 'prot', unite: "100 g", prot: 31, kcal: 165, score: 3,
    pourquoi: "Le meilleur rapport protéines/calories. 200 g couvrent presque un tiers de tes besoins quotidiens.",
    astuce: "Cuis 600 g d'un coup le dimanche, ça fait 3 repas de la semaine." },
  { id: 'skyr', base: 100, nom: "Skyr / fromage blanc 0 %", cat: 'prot', unite: "100 g", prot: 11, kcal: 63, score: 3,
    pourquoi: "Caséine : digestion lente, apport de protéines étalé sur des heures. Idéal le soir.",
    astuce: "400 g de skyr + miel + flocons d'avoine = 45 g de protéines en collation." },
  { id: 'thon', base: 110, pu: 110, un: "boîte", nom: "Thon en boîte au naturel", cat: 'prot', unite: "1 boîte (110 g)", prot: 26, kcal: 116, score: 3,
    pourquoi: "Se stocke, ne se cuisine pas, 26 g de protéines en 30 secondes. L'arme anti-journée-chargée.",
    astuce: "Garde-en toujours deux boîtes d'avance : c'est ce qui évite le repas sauté." },
  { id: 'saumon', base: 100, nom: "Saumon", cat: 'prot', unite: "100 g", prot: 20, kcal: 208, score: 3,
    pourquoi: "Protéines + oméga-3, qui aident la récupération et l'état des articulations sollicitées par les curls.",
    astuce: "Cru en sushi, cuit à la poêle ou fumé : même intérêt nutritionnel." },
  { id: 'boeuf', base: 100, nom: "Steak haché 5 %", cat: 'prot', unite: "100 g", prot: 21, kcal: 137, score: 3,
    pourquoi: "Protéines + fer + créatine naturelle. Le fer transporte l'oxygène jusqu'au muscle.",
    astuce: "Le 15 % passe aussi en prise de masse : plus de calories, moins cher." },
  { id: 'whey', base: 30, pu: 30, un: "dose", nom: "Whey (poudre)", cat: 'prot', unite: "1 dose (30 g)", prot: 24, kcal: 120, score: 2,
    pourquoi: "Pas magique, juste pratique : 24 g de protéines en trois gorgées quand tu n'as pas le temps de cuisiner.",
    astuce: "Utile seulement si tu n'atteins pas ton total avec de la nourriture. Sinon économise ton argent." },
  { id: 'lentilles', base: 100, nom: "Lentilles cuites", cat: 'prot', unite: "100 g", prot: 9, kcal: 116, score: 2,
    pourquoi: "Protéines + glucides lents dans le même aliment. Excellent complément, pas suffisant seul.",
    astuce: "Associe-les à du riz : les deux réunis donnent un profil complet." },
  { id: 'jambon', base: 40, pu: 40, un: "tranche", nom: "Jambon blanc", cat: 'prot', unite: "1 tranche (40 g)", prot: 8, kcal: 44, score: 2,
    pourquoi: "Dépannage rapide et efficace, mais transformé et salé : pas la base de tes apports.",
    astuce: "2 tranches dans une omelette de 3 œufs : 29 g de protéines." },
  { id: 'fromage', base: 30, nom: "Emmental / comté", cat: 'prot', unite: "30 g", prot: 8, kcal: 114, score: 2,
    pourquoi: "Protéines et calories denses : très pratique en prise de masse, à surveiller sinon.",
    astuce: "Râpé sur les pâtes, c'est 100 kcal de plus sans effort de mastication." },
  { id: 'lait', base: 250, nom: "Lait entier", cat: 'prot', unite: "250 ml", prot: 8, kcal: 160, score: 2,
    pourquoi: "Le moyen le plus simple d'ajouter calories et protéines quand on a du mal à manger assez.",
    astuce: "Un grand verre à chaque repas = environ 500 kcal de plus dans la journée." },

  /* ---------- GLUCIDES ---------- */
  { id: 'riz', base: 100, nom: "Riz blanc cuit", cat: 'glu', unite: "100 g", prot: 2.7, kcal: 130, score: 3,
    pourquoi: "Se digère facilement, donc on peut en manger beaucoup sans être ballonné. Le carburant de base.",
    astuce: "200 g de riz cuit à chaque repas principal : simple à mesurer, simple à augmenter." },
  { id: 'avoine', base: 60, nom: "Flocons d'avoine", cat: 'glu', unite: "60 g (cru)", prot: 8, kcal: 225, score: 3,
    pourquoi: "Glucides lents + fibres + protéines. Le petit-déjeuner de prise de masse le moins cher qui existe.",
    astuce: "Flocons + lait + banane + beurre de cacahuète = 700 kcal en un bol." },
  { id: 'pates', base: 100, nom: "Pâtes complètes cuites", cat: 'glu', unite: "100 g", prot: 5, kcal: 124, score: 3,
    pourquoi: "Énergie longue durée, faciles à préparer en grande quantité.",
    astuce: "Pèse-les crues (100 g crues ≈ 250 g cuites) pour ne pas te tromper." },
  { id: 'pdt', base: 150, nom: "Pommes de terre / patates douces", cat: 'glu', unite: "150 g", prot: 3, kcal: 130, score: 3,
    pourquoi: "Rassasiantes, riches en potassium, faciles à digérer autour de la séance.",
    astuce: "Au four avec un filet d'huile d'olive : plus de calories, meilleur goût." },
  { id: 'pain', base: 60, nom: "Pain complet", cat: 'glu', unite: "2 tranches (60 g)", prot: 5, kcal: 150, score: 2,
    pourquoi: "Pratique, se mange partout, se marie avec toutes tes sources de protéines.",
    astuce: "Complet plutôt que blanc : plus de fibres, plus de satiété." },
  { id: 'banane', base: 120, pu: 120, un: "banane", nom: "Banane", cat: 'glu', unite: "1 moyenne (120 g)", prot: 1.3, kcal: 107, score: 2,
    pourquoi: "Sucres rapides et potassium, se transporte partout, parfaite avant ou après la séance.",
    astuce: "Deux bananes + une dose de whey = collation post-séance complète." },
  { id: 'fruitssecs', base: 40, nom: "Fruits secs (dattes, raisins)", cat: 'glu', unite: "40 g", prot: 1, kcal: 115, score: 2,
    pourquoi: "Beaucoup de calories dans très peu de volume : la solution quand l'appétit ne suit plus.",
    astuce: "Une poignée dans le sac, à grignoter dans l'après-midi." },

  /* ---------- LIPIDES ---------- */
  { id: 'huile', base: 10, pu: 10, un: "c. à soupe", nom: "Huile d'olive", cat: 'lip', unite: "1 c. à soupe (10 g)", prot: 0, kcal: 88, score: 3,
    pourquoi: "Le moyen le plus discret d'ajouter des calories : une cuillère sur les légumes ne se remarque pas.",
    astuce: "Deux cuillères par jour en plus = presque 180 kcal de surplus sans effort." },
  { id: 'cacahuete', base: 20, pu: 20, un: "c. à soupe", nom: "Beurre de cacahuète", cat: 'lip', unite: "1 c. à soupe (20 g)", prot: 5, kcal: 118, score: 3,
    pourquoi: "Calories très denses + protéines. L'allié n° 1 quand on a du mal à prendre du poids.",
    astuce: "Prends celui sans sucre ajouté (100 % cacahuètes)." },
  { id: 'amandes', base: 30, nom: "Amandes / noix", cat: 'lip', unite: "30 g", prot: 6, kcal: 174, score: 3,
    pourquoi: "Vitamine E, magnésium, bonnes graisses. Une poignée remplace un grignotage inutile.",
    astuce: "Prépare des sachets de 30 g : au-delà, on ne s'arrête plus." },
  { id: 'avocat', base: 100, nom: "Avocat", cat: 'lip', unite: "1/2 (100 g)", prot: 2, kcal: 160, score: 2,
    pourquoi: "Graisses de qualité et potassium, se marie avec tout, cale bien.",
    astuce: "Sur du pain complet avec deux œufs : petit-déjeuner salé complet." },

  /* ---------- LÉGUMES & FRUITS ---------- */
  { id: 'brocoli', base: 150, nom: "Brocoli, haricots verts, courgettes", cat: 'leg', unite: "150 g", prot: 4, kcal: 45, score: 3,
    pourquoi: "Volume et micronutriments pour presque aucune calorie : ils équilibrent une assiette chargée en riz.",
    astuce: "Surgelés : même valeur nutritionnelle, aucun gâchis, prêts en 6 minutes." },
  { id: 'epinards', base: 150, nom: "Épinards", cat: 'leg', unite: "150 g", prot: 4, kcal: 35, score: 3,
    pourquoi: "Fer, magnésium, nitrates. Ne fait pas gonfler les bras comme Popeye, mais aide la performance.",
    astuce: "Une poignée dans l'omelette du matin, tu ne la sens même pas." },
  { id: 'fruits', base: 130, pu: 130, un: "fruit", nom: "Fruits frais (pomme, orange, kiwi)", cat: 'leg', unite: "1 fruit", prot: 1, kcal: 80, score: 2,
    pourquoi: "Vitamine C et fibres, utile à la récupération et au transit quand on mange beaucoup.",
    astuce: "2 à 3 fruits par jour, en plus des légumes, pas à leur place." },

  /* ---------- À LIMITER ---------- */
  { id: 'alcool', nom: "Alcool", cat: 'lim', unite: "", prot: 0, kcal: 0, score: 0,
    pourquoi: "C'est le seul point vraiment coûteux : il gêne directement la construction du muscle dans les heures qui suivent, dégrade le sommeil (donc la récupération) et ajoute des calories vides.",
    astuce: "Si tu bois, évite le soir d'une séance de bras. Le lendemain d'une grosse soirée, ne compte pas sur ta meilleure performance." },
  { id: 'sodas', nom: "Sodas et jus industriels", cat: 'lim', unite: "", prot: 0, kcal: 0, score: 0,
    pourquoi: "Beaucoup de calories qui ne rassasient pas et ne construisent rien. En prise de masse ils peuvent dépanner, mais ils remplissent le compteur sans nourrir le muscle.",
    astuce: "Si tu as besoin de calories liquides, prends du lait : mêmes calories, 8 g de protéines par verre." },
  { id: 'fastfood', nom: "Fast-food au quotidien", cat: 'lim', unite: "", prot: 0, kcal: 0, score: 0,
    pourquoi: "Un burger de temps en temps ne casse rien. Tous les jours, tu prends surtout du gras, pas du muscle, et le bras ne se dessine jamais.",
    astuce: "Une fois par semaine, et prends le menu avec le plus de viande." },
  { id: 'sautrepas', nom: "Sauter des repas", cat: 'lim', unite: "", prot: 0, kcal: 0, score: 0,
    pourquoi: "C'est l'erreur n° 1 de ceux qui n'arrivent pas à grossir. On ne rattrape pas 800 kcal le soir, et les protéines manquées ne se stockent pas.",
    astuce: "Un repas de secours dans le placard : thon + pain complet, prêt en 2 minutes." }
];

/* Journée type. Les quantités sont calibrées pour 2500 kcal ;
   l'application les remet à l'échelle du besoin réel. */
window.JOURNEE = [
  { nom: "Petit-déjeuner", pct: 0.25, heure: "7 h - 9 h",
    plats: [
      { nom: "Bol d'avoine costaud", items: [['avoine', 60], ['lait', 250], ['banane', 120], ['cacahuete', 20]] },
      { nom: "Version salée", items: [['oeuf', 165], ['pain', 60], ['avocat', 100]] }
    ] },
  { nom: "Déjeuner", pct: 0.32, heure: "12 h - 13 h 30",
    plats: [
      { nom: "Poulet-riz classique", items: [['poulet', 150], ['riz', 280], ['brocoli', 150], ['huile', 10]] },
      { nom: "Version rapide", items: [['thon', 110], ['pates', 250], ['epinards', 150], ['fromage', 30]] }
    ] },
  { nom: "Collation", pct: 0.15, heure: "16 h - 17 h",
    plats: [
      { nom: "Autour de la séance", items: [['skyr', 250], ['banane', 120], ['amandes', 30]] },
      { nom: "Sur le pouce", items: [['whey', 30], ['pain', 60], ['cacahuete', 20]] }
    ] },
  { nom: "Dîner", pct: 0.28, heure: "19 h - 21 h",
    plats: [
      { nom: "Poisson et féculent", items: [['saumon', 130], ['pdt', 280], ['brocoli', 150]] },
      { nom: "Viande rouge", items: [['boeuf', 180], ['lentilles', 200], ['epinards', 150], ['huile', 10]] }
    ] }
];

/* Boutons du compteur de protéines : ce qu'on mange vraiment,
   en portions réelles, pour pointer en deux secondes. */
window.QUICK_PROT = [
  { nom: "2 œufs", g: 13, kcal: 156 },
  { nom: "Blanc de poulet 150 g", g: 46, kcal: 248 },
  { nom: "Boîte de thon", g: 26, kcal: 116 },
  { nom: "Skyr 400 g", g: 44, kcal: 252 },
  { nom: "Dose de whey", g: 24, kcal: 120 },
  { nom: "Steak haché 150 g", g: 32, kcal: 206 },
  { nom: "Saumon 150 g", g: 30, kcal: 312 },
  { nom: "Lentilles 200 g", g: 18, kcal: 232 },
  { nom: "Grand verre de lait", g: 8, kcal: 160 },
  { nom: "30 g de fromage", g: 8, kcal: 114 },
  { nom: "2 tranches de jambon", g: 16, kcal: 88 },
  { nom: "Poignée d'amandes", g: 6, kcal: 174 }
];

window.REGLES = [
  { t: "Mange plus que ce que tu dépenses",
    d: "Sans surplus de calories, un bras n'a rien pour se construire. Vise environ +300 kcal par jour au-dessus de ton entretien : assez pour grossir, assez peu pour ne pas prendre que du gras. Sur la balance, cela donne 250 à 400 g par semaine — pas plus." },
  { t: "1,6 à 2,2 g de protéines par kilo",
    d: "Au-delà, aucun gain supplémentaire prouvé. En dessous d'1,6 g/kg tu laisses des résultats sur la table. Pour 75 kg : entre 120 et 165 g par jour." },
  { t: "Répartis sur 4 prises",
    d: "Environ 30 à 40 g de protéines par repas relancent la construction musculaire à chaque fois. 150 g de protéines en un seul dîner ne valent pas 4 × 35 g." },
  { t: "Dors 7 à 9 heures",
    d: "Le muscle se construit pendant le sommeil, pas pendant la série. Une semaine à 5 h de sommeil coûte plus qu'une semaine sans entraînement." },
  { t: "Bois 2 à 3 litres d'eau",
    d: "Le muscle est composé d'environ 75 % d'eau. Déshydraté, tu es plus faible et tu récupères moins bien." },
  { t: "Ne cherche pas à sécher et à grossir en même temps",
    d: "Sauf tout premier mois d'entraînement, il faut choisir. Prends du muscle 4 à 6 mois, puis affine 6 à 8 semaines : c'est là que les bras se voient vraiment." },
  { t: "Compte pendant deux semaines, puis lâche",
    d: "Peser sa nourriture 14 jours suffit à calibrer l'œil. Après, tu sauras à vue ce que vaut ton assiette." }
];

window.COMPLEMENTS = [
  { nom: "Créatine monohydrate", verdict: "Ça marche", note: 3,
    d: "3 à 5 g par jour, à n'importe quelle heure, tous les jours y compris les jours de repos. C'est le complément le plus étudié qui existe : quelques répétitions de plus par série, donc plus de volume de travail, donc plus de muscle. Compte 15 à 20 € pour 3 mois." },
  { nom: "Whey", verdict: "Pratique", note: 2,
    d: "Ce n'est pas un produit magique, c'est du lait filtré. Utile uniquement si tu n'arrives pas à atteindre ton objectif de protéines avec de vrais repas." },
  { nom: "Vitamine D", verdict: "Selon le cas", note: 2,
    d: "Souvent basse en hiver dans nos régions, et impliquée dans la force musculaire. Un dosage sanguin par le médecin tranche mieux qu'une supposition." },
  { nom: "Brûleurs, BCAA, boosters", verdict: "Sans intérêt", note: 0,
    d: "Les BCAA n'apportent rien de plus si tu manges assez de protéines. Les brûleurs ne font pas grossir les bras, et les boosters ne sont que de la caféine vendue trois fois son prix." }
];

/* Le coin sushis — puisque c'est l'objectif affiché. */
window.SUSHI = {
  titre: "Et les sushis, ça vaut quoi ?",
  texte: "Bonne nouvelle : c'est un repas parfaitement compatible. Le poisson cru apporte des protéines de qualité et des oméga-3, et le riz vinaigré donne des glucides faciles à digérer — pas mal du tout autour d'une séance.",
  points: [
    "Un plateau de 12 pièces au saumon : environ 500 kcal et 25 g de protéines. Correct, mais léger en protéines pour un repas complet.",
    "Ajoute des edamamé (11 g de protéines pour 100 g) et une soupe miso : tu passes à un vrai repas de prise de masse.",
    "Les california rolls et les sauces spicy contiennent de la mayonnaise : les calories doublent pour la même quantité de protéines.",
    "La sauce soja est très salée. Si tu en mets beaucoup, bois davantage d'eau derrière.",
    "Les sashimis sont la version la plus riche en protéines : que du poisson, pas de riz."
  ]
};
