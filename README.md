# Carte relief & pentes

Carte de randonnée installable sur téléphone : relief 3D, pentes et altitude en couleurs,
tracés GPX, zones téléchargeables pour un usage hors ligne.

- `index.html` : l'application (la bibliothèque MapLibre GL JS y est intégrée).
- `sw.js` : garde l'application disponible hors ligne et signale les nouvelles versions.
- `manifest.webmanifest` et `icons/` : nom, icône et couleurs pour l'installation.

Pour publier une nouvelle version : remplacer `index.html` dans ce dépôt.
Les zones et tracés enregistrés sur les téléphones sont conservés.

Données : © IGN (Plan IGN, photos aériennes), Terrain Tiles (Mapzen/AWS),
© contributeurs OpenStreetMap, OpenTopoMap, Waymarked Trails. MapLibre GL JS : licence BSD-3-Clause.
