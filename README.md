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

## Reglages (icone engrenage)

- Nombre de nouvelles expressions par jour (3 / 5 / 8 / 10 / 12 / 15) — 8 = rythme 20 min
- Shadowing activable / desactivable
- Date de depart aux USA (pilote le compte a rebours)
- Exigence de prononciation (Souple -> Natif) : commence en Normal, passe en Strict au mois 3
- Voix americaine et vitesse (mets "Rapide" a partir du mois 2 pour habituer ton oreille)
- Sauvegarde de la progression en fichier JSON

## Ou sont mes donnees

Version en ligne : sur le serveur (synchronise entre appareils) **et** en copie locale
dans le navigateur. La pastille nuage en haut a droite indique l'etat :
`☁︎ ✓` synchronise, `☁︎ ↑` en cours, `☁︎ !` synchro indisponible (la progression
reste alors sur l'appareil).

Version locale : uniquement dans le navigateur du PC.

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
