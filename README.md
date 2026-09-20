# Ma seconde

Site de révision pour l'année de seconde, en deux matières : **mathématiques** (carte du
programme officiel 2026, fiches de méthode, labo des probabilités conditionnelles) et
**histoire** (les chapitres du tronc commun).

Site statique, sans build, sans dépendance. Trois pages, trois scripts, trois fichiers de
contenu :

```
index.html              l'accueil : on choisit une matière
maths.html              la page maths
histoire.html           la page histoire

assets/styles.css       tout le style, partagé par les trois pages
assets/common.js        le socle : thème, stockage local, blocages, bas de fiche
assets/maths.js         programme à cocher, fiches, labo
assets/histoire.js      fiches de chapitre

content/programme.json  la carte du programme de maths (notions, fils rouges, intox…)
content/fiches.json     les fiches de maths — le fichier qu'on enrichit
content/histoire.json   les fiches d'histoire — l'autre fichier qu'on enrichit
```

Le dépôt s'appelle encore `maths-2de` et les clés de stockage encore `m2d-*` : renommer
l'un casserait l'URL GitHub Pages, renommer les autres effacerait la progression déjà
enregistrée par l'élève. Seul l'affichage porte le nom « Ma seconde ».

---

## Déployer sur GitHub Pages

1. Créer le dépôt (privé) et pousser ces fichiers à la racine.
2. `Settings` → `Pages` → Source : `Deploy from a branch`, branche `main`, dossier `/ (root)`.
3. Le site sort sur `https://<compte>.github.io/<dépôt>/` en une minute environ.

### À savoir avant de choisir « privé »

Publier des Pages depuis un dépôt privé demande un plan **Pro, Team ou Enterprise** — ce
n'est pas disponible sur le plan gratuit.

Et surtout : **dépôt privé ne veut pas dire site privé.** Le code source reste caché, mais
le site publié est accessible à qui connaît l'URL. Rendre le site lui-même privé exige
GitHub Enterprise Cloud (fonction « access control » pour Pages).

Conséquence pratique : **ne jamais commiter ici quoi que ce soit de personnel.** Les
blocages notés par l'élève restent volontairement dans le navigateur (`localStorage`) et
ne transitent par aucun serveur.

La balise `noindex, nofollow` dans `index.html` évite l'indexation par les moteurs. C'est
une politesse, pas une protection.

---

## Travailler en local

Les navigateurs bloquent `fetch()` sur `file://`. Ouvrir `index.html` par double-clic ne
chargera pas le contenu. Lancer un serveur :

```bash
cd maths-2de
python3 -m http.server 8000
# puis http://localhost:8000
```

---

## Ajouter une fiche de maths

Une entrée dans `content/fiches.json`. Le tableau est trié par `ordre` à l'affichage.

```json
{
  "id": "tableau-de-signes",
  "ordre": 30,
  "partie": "fonctions",
  "titre": "Tableau de signes d'un produit",
  "maj": "2026-11-04",
  "idee": "Une phrase. Pas deux.",
  "methode": [
    "Première étape.",
    "Deuxième étape."
  ],
  "erreur": "L'erreur que tout le monde fait, et pourquoi.",
  "exercice": {
    "enonce": "Un énoncé court.",
    "corrige": "La correction, masquée derrière un bouton."
  }
}
```

| Champ | Obligatoire | Notes |
|---|---|---|
| `id` | oui | unique, en minuscules avec tirets ; sert de clé pour « compris » |
| `ordre` | oui | entier, pas de 10 pour pouvoir intercaler |
| `partie` | oui | `nombres`, `geometrie`, `fonctions`, `stats` ou `transversal` |
| `titre` | oui | court |
| `idee` | non | une phrase |
| `methode` | non | tableau de chaînes, rendu en liste numérotée |
| `erreur` | non | encadré corail |
| `exercice` | non | objet `{enonce, corrige}` |
| `maj` | non | date, pour s'y retrouver |

Tout le texte est inséré via `textContent` : pas de HTML dans les fiches, et pas
d'injection possible non plus.

**Attention :** changer l'`id` d'une fiche fait perdre son statut « compris » côté élève.

---

## Ajouter un chapitre d'histoire

`content/histoire.json` porte la partie histoire du tronc commun. Le fichier a sa propre
forme : une fiche d'histoire n'a ni « méthode » ni « exercice corrigé », mais une
problématique, un tableau de repères et des blocs d'analyse.

```json
{
  "matiere": "Histoire",
  "intitule": "Grandes étapes de la formation du monde moderne",
  "source": { "texte": "BO spécial n° 1 du 22 janvier 2019" },
  "fiches": [
    {
      "id": "histoire-periodisation",
      "ordre": 10,
      "theme": "Introduction",
      "titre": "La périodisation",
      "duree": "2 h",
      "problematique": "Une question, pas deux.",
      "reperes": {
        "titre": "Les quatre grandes périodes",
        "colonnes": ["Période", "Borne", "Ce que la date marque"],
        "lignes": [["Moyen Âge", "476", "Chute de Rome"]],
        "note": "Une précision en petit sous le tableau."
      },
      "blocs": [
        { "titre": "Un titre de bloc", "ton": "coral", "points": ["Un point.", "Un autre."] }
      ],
      "retenir": "La phrase à retenir.",
      "activite": "Ce que le prof fait faire."
    }
  ]
}
```

| Champ | Obligatoire | Notes |
|---|---|---|
| `id` | oui | unique ; préfixé `histoire-` pour ne pas croiser les ids de maths |
| `ordre` | oui | entier, pas de 10 pour pouvoir intercaler |
| `theme` | non | surtitre de la fiche (`Introduction`, `Thème 1`…) |
| `titre` | oui | court |
| `duree` | non | pastille lime (`2 h`, `10-12 h`) |
| `problematique` | non | encadré violet |
| `reperes` | non | `{titre, colonnes[], lignes[][], note}` — tableau sur desktop, blocs empilés sur mobile |
| `blocs` | non | tableau de `{titre, points[], ton}` ; `ton: "coral"` colore les puces |
| `retenir` | non | encadré lime |
| `activite` | non | une ligne en gris |

Le nombre de cellules de chaque ligne doit correspondre à `colonnes`. Comme pour les
maths, tout est inséré via `textContent` : pas de HTML dans le JSON.

Les boutons « Marquer comme compris » et « Je bloque » sont les mêmes qu'en maths, et
écrivent dans les mêmes clés `localStorage`.

Si `content/histoire.json` est absent ou invalide, la section affiche un message et le
reste du site continue de fonctionner.

Source du programme : **BO spécial n° 1 du 22 janvier 2019**, toujours en vigueur pour la
seconde générale et technologique à la rentrée 2026. Attention : la seconde
professionnelle a un programme différent.

---

## Modifier le programme

`content/programme.json` porte le reste : les parties et leurs notions (`parties`), les
fils rouges, les nouveautés, les rumeurs vérifiées, les compétences et les réserves.

Les clés `k` des notions (`n1`, `g3`…) sont les identifiants de la progression cochée.
Les changer réinitialise les cases de l'élève.

---

## Ce que le site garde, et où

Tout dans le `localStorage` du navigateur de l'élève. Rien n'est envoyé nulle part, rien
n'est synchronisé entre appareils. Les trois pages partagent les mêmes clés : ce qui est
coché en maths reste coché quand on passe à l'histoire et qu'on revient.

| Clé | Contenu |
|---|---|
| `m2d-check` | notions du programme de maths cochées |
| `m2d-done` | fiches marquées « compris », les deux matières confondues |
| `m2d-bloc` | notes « je bloque », chacune étiquetée par sa matière |
| `m2d-theme` | thème clair/sombre forcé |

Chaque note « je bloque » porte un champ `matiere` (`maths` ou `histoire`) : la page maths
n'affiche que les blocages de maths, la page histoire que les siens. Les notes écrites
avant la séparation des matières n'ont pas ce champ et sont comptées comme des maths —
elles ne pouvaient venir que de là.

Les identifiants de fiche doivent rester uniques **toutes matières confondues**, puisque
`m2d-done` est commun : d'où le préfixe `histoire-` sur les fiches d'histoire.

---

## Sources des programmes

**Mathématiques** — Arrêté du 26 février 2026, publié au Bulletin officiel n° 14 du 2 avril 2026, applicable
à la rentrée 2026-2027.
<https://www.education.gouv.fr/bo/2026/Hebdo14/MENE2602914A>

Deux réserves assumées, affichées dans le site : l'horaire hebdomadaire ne vient pas de ce
texte mais de la grille horaire du lycée (non vérifiée), et la série STHR a son propre
programme de maths (non vérifié ici).

**Histoire** — BO spécial n° 1 du 22 janvier 2019, toujours en vigueur pour la seconde
générale et technologique à la rentrée 2026. La seconde professionnelle a un programme
différent, non couvert ici.

Les fiches ne sont pas des documents officiels. Elles expliquent, elles ne font pas foi.
