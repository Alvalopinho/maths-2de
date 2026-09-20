# Maths 2de

Site de révision pour l'année de seconde : la carte du programme officiel 2026, des fiches
de méthode qui s'enrichissent au fil de l'année, et un petit labo interactif sur les
probabilités conditionnelles.

Site statique, sans build, sans dépendance. Trois fichiers comptent :

```
index.html            le site
content/programme.json  la carte du programme (notions, fils rouges, intox, compétences)
content/fiches.json     les fiches de révision — le fichier qu'on enrichit
```

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

## Ajouter une fiche

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

## Modifier le programme

`content/programme.json` porte le reste : les parties et leurs notions (`parties`), les
fils rouges, les nouveautés, les rumeurs vérifiées, les compétences et les réserves.

Les clés `k` des notions (`n1`, `g3`…) sont les identifiants de la progression cochée.
Les changer réinitialise les cases de l'élève.

---

## Ce que le site garde, et où

Tout dans le `localStorage` du navigateur de l'élève. Rien n'est envoyé nulle part, rien
n'est synchronisé entre appareils.

| Clé | Contenu |
|---|---|
| `m2d-check` | notions du programme cochées |
| `m2d-done` | fiches marquées « compris » |
| `m2d-bloc` | notes « je bloque » |
| `m2d-theme` | thème clair/sombre forcé |

---

## Source du programme

Arrêté du 26 février 2026, publié au Bulletin officiel n° 14 du 2 avril 2026, applicable
à la rentrée 2026-2027.
<https://www.education.gouv.fr/bo/2026/Hebdo14/MENE2602914A>

Deux réserves assumées, affichées dans le site : l'horaire hebdomadaire ne vient pas de ce
texte mais de la grille horaire du lycée (non vérifiée), et la série STHR a son propre
programme de maths (non vérifié ici).

Les fiches ne sont pas des documents officiels. Elles expliquent, elles ne font pas foi.
