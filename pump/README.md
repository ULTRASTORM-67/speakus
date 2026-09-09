# PUMP

Entrainement des bras a la maison : biceps, triceps, avant-bras.
22 exercices notes sur leur efficacite reelle, schemas animes, programmes,
suivi des charges et guide de nourriture.

**https://ultrastorm-67.github.io/speakus/pump/**

Sur iPhone : ouvrir le lien dans Safari -> bouton Partager -> "Ajouter a
l'ecran d'accueil". L'app s'ouvre alors en plein ecran avec son icone.
Tout marche hors connexion une fois la page chargee.

Application independante de SpeakUS, qui vit dans le meme depot mais dans
son propre dossier, avec son propre stockage.

## Ce qu'il y a dedans

**Accueil** — la seance du jour, la serie de semaines, le tour de bras et le
prochain palier.

**Exos** — les 22 exercices classes par note. Chaque fiche donne le schema
anime, le detail de la note, la technique, les erreurs frequentes, le tempo
et la solution de repli quand on n'a pas le materiel.

**Seance** — cinq programmes (Demarrage 2x/sem, Prise de masse 3x/sem,
Specialisation bras 4x/sem, Zero materiel, Express 12 min), la seance guidee
exercice par exercice, le chronometre de repos et l'historique des charges.

**Nourriture** — calcul des calories et des macros, journee type mise a
l'echelle, 29 aliments avec leurs valeurs et pourquoi ils sont utiles,
compteur de proteines du jour, le tri des complements, et le coin sushis.

**Progres** — mesures du tour de bras, paliers, records par exercice,
historique des seances.

## La note des exercices

Elle n'est pas une opinion : elle se calcule a partir de quatre criteres,
visibles sur chaque fiche.

| Critere | Poids | Ce qu'il mesure |
|---|---|---|
| Tension en etirement | 35 % | Le muscle est-il charge quand il est long ? C'est la que le signal de croissance est le plus fort. |
| Charge progressive | 30 % | Peut-on ajouter du poids semaine apres semaine, a la maison ? |
| Ciblage | 20 % | Quelle part du travail arrive vraiment sur le muscle vise. |
| Accessibilite | 15 % | Materiel necessaire et facilite d'execution correcte sans coach. |

Note = somme ponderee ramenee sur 100. S a partir de 88, A a partir de 78,
B a partir de 68, C en dessous. Les poids sont dans `data/exercices.js`
(`window.CRITERES`) : les changer suffit a reclasser tout le catalogue.

## Les schemas animes

Ce ne sont pas des videos : ce sont des animations vectorielles calculees
par `assets/anim.js`. Rien a telecharger, rien a heberger, ca marche hors
connexion et ca pese quelques kilo-octets.

Un exercice decrit des angles articulaires et des images cles :

```js
anim: {
  base: 'incline',        // la posture (debout, assis, couche, suspendu, pompe...)
  charge: 'haltere',      // haltere, elastique, corps
  poignet: 'sup',         // supination, pronation ou neutre (prise marteau)
  muscle: 'biceps',       // le muscle qui s'allume
  cles: [
    { sh: -12, el: 8,   hi: .2, t: 1000, lbl: "Montee — 1 s" },
    { sh: -4,  el: 140, hi: 1,  t: 400,  lbl: "Serre en haut" },
    { sh: -4,  el: 140, hi: .9, t: 1800, lbl: "Descente — 3 s" }
  ]
}
```

Convention d'angle : 0 pointe vers le bas, positif vers l'avant (le
bonhomme regarde a droite). `sh` est l'angle epaule -> coude, `el` la
flexion du coude, `pg` celle du poignet, `hi` l'intensite du muscle
(il gonfle et s'allume), `t` la duree de la transition vers l'image
suivante, `lbl` le texte affiche pendant cette transition.

Deux familles de postures :

- **bras libre** : la posture fixe l'epaule, le bras est calcule vers la main.
- **main fixee** (traction, dips, pompe, curl australien) : la main est
  posee sur un appui et c'est le corps qui monte ou descend. Le moteur
  remonte alors la chaine a l'envers, de la main vers l'epaule.

Le pointille est la trajectoire de la main sur un cycle complet, calculee
en echantillonnant l'animation. `zoom` recadre les postures bras tendus
au-dessus de la tete, qui debordent sinon. Les vignettes de liste sont
cadrees automatiquement sur la boite englobante du bonhomme.

## Ajouter un exercice

Une entree dans `window.EXOS` (`data/exercices.js`) suffit : le classement,
les filtres, les fiches et les vignettes se mettent a jour tout seuls.
Les champs attendus sont `id`, `nom`, `zone`, `muscles`, `mat`, `niveau`,
`s` (les quatre notes sur 5), `pourquoi`, `exec`, `erreurs`, `series`,
`reps`, `repos`, `tempo`, `variante`, `yt` et `anim`.

Pour le reutiliser dans un programme, ajouter son `id` dans une seance de
`data/programmes.js`.

## Fichiers

```
index.html              la page
manifest.webmanifest    installation sur telephone
data/exercices.js       les 22 exercices + les criteres de notation
data/nutrition.js       aliments, journee type, regles, complements
data/programmes.js      programmes, principes, techniques, paliers
assets/anim.js          le moteur de schemas animes
assets/app.css          le design
assets/app.js           etat, vues, seance guidee, chrono, calculs
```

## Ou sont mes donnees

Dans le navigateur de l'appareil (localStorage, cle `pump_state_v1`), comme
SpeakUS. Pas de compte, pas de serveur, aucune synchronisation entre le PC
et le telephone. Reglages -> Exporter produit un fichier .json, Importer le
recharge.

## Precautions

Ce n'est pas un avis medical. En cas de douleur articulaire qui dure,
arreter l'exercice concerne et consulter. Les paliers de tour de bras sont
la pour rigoler ; les ordres de grandeur realistes sont donnes dans la
section "Ce qui est reellement atteignable" de l'onglet Progres.
