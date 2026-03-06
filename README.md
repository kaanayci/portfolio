# Portfolio - Integration Web

Ce depot contient mon **portfolio d'integration web**, realise dans le cadre du cours
*Reseaux / Web - Integration web* (ESNE - Informatique de gestion).

## Objectifs

- Demontrer ma maitrise progressive du developpement web (HTML, CSS, JavaScript, Vue 3)
- Structurer et documenter trois projets fonctionnels de complexite croissante
- Mener une reflexion critique sur mes choix techniques et ma progression

---

## Lancement

Le portfolio fonctionne en local via Node/Express :

```bash
npm start       # lance le serveur sur http://localhost:3000
```

Tous les projets (hub, Dashboard, Hitster, Restaurant) sont alors accessibles depuis ce port.

---

## Projets

| Projet | Stack | Description |
|--------|-------|-------------|
| **SwissMeteo** (Dashboard) | jQuery, Leaflet, OpenWeatherMap API, PWA | Dashboard meteo interactif avec carte, favoris et Service Worker |
| **Hitster Music** | ES Modules natifs, Node/Express, Web Audio API | Jeu de culture musicale : placement chronologique, drag & drop, scores |
| **Coin Regal** (Restaurant) | Vue 3, Vite, Pinia, Tailwind CSS, PWA | Application de commande restaurant : panier, QR code, impression thermique |

Chaque projet possede son propre `README.md` avec instructions de lancement.

---

## Documentation

### Fiches techniques (18)

Chaque projet est accompagne de **6 fiches techniques** detaillant un concept cle avec definition, extrait de code commente, analyse et sources.

- `dashboard/fiches-techniques/` - API externe, architecture, interactivite carte, DOM, persistance, PWA
- `hitster/fiches-techniques/` - Boucle de jeu, controle audio, zones cliquables, JSON BDD, placement chronologique, randomisation
- `restaurant/public/docs/` - Architecture composants, fidelite, QR code, Pinia, impression thermique, PWA offline

### Fiches de connaissances (19)

Le dossier `connaissances/` contient **19 fiches thematiques** couvrant l'ensemble du developpement web :

| Theme | Fiches |
|-------|--------|
| Fondamentaux du Web | 01-HTML5, 02-CSS3 |
| Frameworks CSS | 03-Bootstrap, 04-Tailwind |
| JavaScript cote client | 05-ES6+, 06-jQuery, 07-React, 08-React avance |
| Developpement serveur | 09-Node.js, 10-Express, 11-API REST |
| Accessibilite et SEO | 12-WCAG, 13-SEO |
| Securite et confidentialite | 14-Securite web, 15-Tokens, 16-RGPD |
| Deploiement et outils | 17-CI/CD, 18-Performance, 19-Outils dev |

Voir `connaissances/INDEX.md` pour la table des matieres complete et les parcours de lecture recommandes.

### Analyses de sites (2) et Veille technologique

- `analyses/site-cff.md` - Analyse UX/accessibilite/SEO de CFF.ch
- `analyses/site-qoqa.md` - Analyse UX/accessibilite/SEO de Qoqa.ch
- `analyses/veille-technologique.md` - 5 tendances web 2025-2026 (Container Queries, View Transitions API, etc.)

### Reflexions

- `reflexions/mi-parcours.md` - Bilan intermediaire
- `reflexions/bilan-final.md` - Synthese finale, auto-evaluation et perspectives professionnelles

---

## Structure du depot

```
portfolio/
├── index.html                  # Page d'accueil (hub)
├── assets/css/main.css         # Styles du hub
├── assets/js/portfolio.js      # Chargement dynamique des documents
│
├── analyses/                   # Analyses de sites + veille
├── reflexions/                 # Reflexions mi-parcours & bilan final
├── connaissances/              # 19 fiches thematiques (INDEX.md inclus)
│
├── dashboard/                  # Projet 1 - SwissMeteo
│   ├── index.html
│   ├── sw.js
│   ├── assets/
│   └── fiches-techniques/
│
├── hitster/                    # Projet 2 - Hitster Music
│   ├── index.html
│   ├── server.js
│   ├── assets/
│   ├── docs/
│   └── fiches-techniques/
│
└── restaurant/                 # Projet 3 - Coin Regal
    ├── src/                    # Code source Vue 3
    ├── public/docs/            # Fiches techniques
    ├── vite.config.js
    └── tailwind.config.js
```

---

## Installation locale

```bash
# Cloner le depot
git clone https://github.com/kaanayci/portfolio.git
cd portfolio
npm install
npm start                 # http://localhost:3000
```

Le hub, Dashboard, Hitster et Restaurant (`/restaurant/dist/`) sont tous servis automatiquement.

> **Note :** le Dashboard necessite une cle API OpenWeatherMap.
> Copier `dashboard/assets/js/modules/config.example.js` vers `config.js` et y mettre votre cle.

---

## Auteur

**Kaan Kalayci** - CPNE Neuchatel
[GitHub](https://github.com/kaanayci)
