# SpeakUS

Application d'anglais americain avec entrainement oral quotidien.
900 expressions, 113 jours de programme, du B1 au C1.

## Deux facons de l'utiliser

### En ligne (PC + telephone) — recommande

**https://ultrastorm-67.github.io/speakus/**

Marche partout, rien a lancer, micro autorise.
Sur iPhone : ouvre le lien dans Safari -> bouton Partager -> "Ajouter a l'ecran
d'accueil". L'app s'ouvre alors en plein ecran avec son icone.

La progression est stockee dans le navigateur de chaque appareil (pas de synchro
automatique entre le PC et le telephone : voir "Ou sont mes donnees").

Depot : https://github.com/ULTRASTORM-67/speakus — GitHub Pages sert la branche `main`.

> Une version avait ete publiee comme Artifact Claude : abandonnee, l'iframe de
> claude.ai retire la permission micro (`featurePolicy microphone: false`).

### En local (PC uniquement)

Double-clique sur **Lancer-SpeakUS.bat**.
Le navigateur s'ouvre tout seul. Laisse la fenetre noire ouverte pendant que tu bosses.
Pour arreter : ferme la fenetre noire.

Cette version garde sa progression sur le PC seul, sans synchronisation.
Elle sert de secours hors ligne.

### Republier apres modification

```
powershell -ExecutionPolicy Bypass -File build-dist.ps1
cd dist ; git add -A ; git commit -m "..." ; git push
```

`build-dist.ps1` recopie `index.html`, `assets/`, `data/`, le manifest et les icones
dans `dist/`, qui est le depot GitHub. Une seule source de code pour les deux versions.
`make-icons.ps1` regenere les icones, `build-artifact.ps1` produit la version
mono-fichier (plus utilisee).

## Important

- Utilise **Chrome** ou **Edge** (la reconnaissance vocale ne marche pas sur Firefox).
- A la premiere session, le navigateur demande l'autorisation du micro : clique **Autoriser**.
- Il faut une connexion internet (la reconnaissance vocale passe par le serveur du navigateur).

## Comment ca marche

Chaque jour, une session de ~20 minutes en 5 temps :

1. **Revision** — les expressions de la veille (et celles que ta memoire va lacher).
   Tu vois le francais, tu dois dire l'anglais a l'oral, sans regarder.
2. **Decouverte** — 8 nouvelles expressions. Tu ecoutes, tu repetes, l'app note ta prononciation.
3. **Shadowing** — la phrase complete au debit natif, a repeter d'un seul bloc.
   C'est l'etape qui construit le rythme et la fluidite, pas juste le vocabulaire.
4. **Mise en situation** — une situation en francais, tu produis la phrase a l'oral.
5. **Conversation** — un interlocuteur americain te parle, tu reponds en placant l'expression.

Si la prononciation n'est pas validee, tu recommences. Apres 3 essais tu peux passer,
mais l'expression revient le lendemain.

## Le programme

113 jours a 8 expressions/jour. Termine fin decembre, soit ~6 mois avant le depart :
tout le premier semestre 2027 sert de consolidation sur les 900 expressions.

| Mois | Niveau | Contenu |
|------|--------|---------|
| 1 | B1 -> B1+ | Reflexes du quotidien : saluer, reagir, donner son avis, phrasal verbs, commander, faire des plans |
| 2 | B1+ -> B2 | Raconter, argumenter, nuancer, travail/argent, idiomes, decrire les gens, anglais parle vite |
| 3 | B2 -> B2+ | **Vie sociale US** : bars, clubs, aborder, flirter, humour, slang de soiree, garder le contact |
| 4 | B2+ -> C1 | Slang natif, sarcasme, debat d'idees, storytelling, dating, conflits, idiomes C1 |
| 5 | B2+ -> C1 | **Vivre sur place** : douane, logement, transport, courses, medecin, banque, salle de sport, codes culturels |
| 6 | C1 | **Fluidite** : phrases longues d'un bloc, connecteurs avances, pitch perso, negocier, humour, tics natifs |

## Plusieurs utilisateurs

Chaque personne cree son profil (prenom + avatar) : progression, serie, revisions
et reglages sont separes. On bascule via la pastille en haut a droite.

Les profils vivent dans le navigateur de l'appareil. Deux personnes sur le meme
telephone = deux profils. La meme personne sur deux appareils = deux progressions
distinctes (utiliser Exporter / Importer pour transferer).

## Aide a la prononciation

Sous chaque phrase, une ligne "Comment le dire" : transcription a la francaise,
lisible sans rien connaitre a l'API. MAJUSCULES = syllabe accentuee.
Chaque mot est cliquable pour l'entendre seul au ralenti. Le bouton "?" affiche
la legende (th, dh, eu, ii, ai, aou, r americain...).

`assets/phonetic.js` : dictionnaire de ~500 mots (83 % des occurrences du corpus)
plus un moteur de regles pour le reste. C'est une approximation destinee a se
faire comprendre, pas une transcription phonetique exacte.

## Formulations alternatives acceptees

Sur **Mise en situation** et **Conversation**, plusieurs reponses sont valables :
l'app accepte aussi les autres expressions du meme theme. Cible "Long time no see"
mais tu dis "How's it going?" -> accepte, avec rappel de la formulation visee.

Sur **Decouverte** et **Shadowing**, c'est strict : l'exercice est de reproduire
la phrase exacte, son rythme et sa prononciation. Y accepter un synonyme le viderait
de son sens.

Deuxieme filet : si la phrase dite porte les memes mots de sens que la cible
(hors mots vides), elle est acceptee meme si elle n'existe nulle part dans le
corpus. Cible "Nice to finally meet you", tu dis "I'm glad I can finally meet
you" -> accepte (finally + meet). Seuil : 60 % des mots de sens, minimum deux.

Troisieme filet : bouton "Ma phrase etait juste aussi" pour valider soi-meme.
L'app n'a pas de moteur semantique — deux phrases synonymes sans vocabulaire
commun ("give me a hand" / "help me out") lui echappent, c'est l'utilisateur
qui tranche.

Le champ optionnel `alt: ["...", "..."]` sur une expression ajoute des variantes
acceptees explicitement.

## Reglages (icone engrenage)

- Nombre de nouvelles expressions par jour (3 / 5 / 8 / 10 / 12 / 15) — 8 = rythme 20 min
- Shadowing activable / desactivable
- Date de depart aux USA (pilote le compte a rebours)
- Exigence de prononciation (Souple -> Natif) : commence en Normal, passe en Strict au mois 3
- Voix americaine et vitesse (mets "Rapide" a partir du mois 2 pour habituer ton oreille)
- Sauvegarde de la progression en fichier JSON

## Ou sont mes donnees

Dans le navigateur de chaque appareil (localStorage), en ligne comme en local.
**Il n'y a pas de synchronisation automatique** : le PC et le telephone ont chacun
leur progression. `assets/sync.js` existe mais reste inerte — il avait ete ecrit
pour la version Artifact, qui a ete abandonnee.

Consequence : ne vide pas les donnees du site, et exporte de temps en temps.

Dans les reglages : **Exporter** produit un .json, **Importer** le recharge.
Utile pour transferer la progression a la main si la synchro ne marche pas.

## Ajouter des expressions

Les fichiers `data/m1.js` a `data/m6.js` contiennent le corpus.
Format d'une entree :

```js
{en:"What's up?", fr:"Quoi de neuf ?", lv:"B1", rg:"casual",
 ex:"Hey man, what's up?",           // la phrase en contexte
 sit:"Tu croises un pote dans la rue.", // situation FR pour la production
 cue:"Hey! I thought that was you."}    // ce que dit l'interlocuteur en roleplay
```

## Le correcteur de phrases libres

Quand tu reponds a une consigne francaise ("Je te presente mon ami Alex") et que
ta phrase ne colle pas au modele, l'app ne dit plus juste "rate". Elle repond
aux trois questions qui comptent :

1. **Est-ce que ce que j'ai dit est correct ?** — verdict : juste / compréhensible
   mais pas naturel / faux / mal entendu par le micro.
2. **Qu'est-ce que ma phrase veut dire ?** — la traduction de CE QUE TU AS DIT,
   pas de ce qu'il fallait dire.
3. **Alors qu'est-ce que je dois dire ?** — la version naturelle, avec le son et
   la ligne phonetique.

Si ta formulation est correcte et naturelle, elle est **acceptee** meme si ce
n'est pas la phrase du jour. Dans ce cas le score mot-a-mot disparait : noter la
prononciation d'une phrase contre un modele que tu n'as pas essaye n'apprend rien.

Ca demande de juger une phrase libre, donc **ca ne marche que sur la version en
ligne**. En local, l'app garde son comportement d'avant (score + reponse revelee).

## Deployer le relais du correcteur

Le correcteur est **inactif tant que le relais n'existe pas**. Voir
`worker/DEPLOIEMENT.md` : compte Cloudflare gratuit, un Worker a creer,
le code de `worker/speakus-coach.js` a coller, une liaison `AI` a ajouter.

Une fois deploye, colle l'adresse du Worker dans `RELAIS` en haut de
`assets/coach.js`, rebuild, push : le correcteur marche alors pour tous
les appareils et toutes les personnes, sans reglage individuel.

Pour tester avant de figer l'adresse : Reglages -> Correcteur -> coller
l'adresse -> Tester. L'adresse saisie la est locale a l'appareil.

## Mettre une session en pause

Une session de 28 etapes ne se finit pas toujours d'une traite. La croix en
haut a gauche ne jette plus la session : elle la **met en pause**.

L'accueil affiche alors une carte "Session en pause — tu etais a l'etape X sur Y"
avec **Reprendre** et **Abandonner**. Ca survit a la fermeture de l'onglet,
au redemarrage du telephone, et au retour sur le site des jours plus tard.

Ce qui est sauve : la file des etapes restantes, la position, les scores et
les XP de la session. Les notes des cartes, elles, etaient deja enregistrees
au fil de l'eau — meme en cas de crash, les expressions validees restent acquises.

La pause vit dans `state.pending`, donc elle est **par profil** : chacun peut
avoir la sienne en cours.
