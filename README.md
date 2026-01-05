# Portfolio – Intégration Web

Ce dépôt contient mon **portfolio d’intégration web**, réalisé dans le cadre du cours  
*Réseaux / Web – Intégration web* (CPNE – Informatique de gestion).

Ce portfolio a pour objectif de démontrer :
- ma maîtrise des bases du développement web (HTML, CSS, JavaScript)
- ma capacité à structurer et documenter des projets
- ma progression et ma réflexion critique tout au long du cours

---

## 📦 Contenu du portfolio

Le portfolio regroupe trois types de contenus complémentaires :

### 🔹 Projets pratiques
Des projets d’intégration web fonctionnels permettant d’appliquer les notions vues en cours :
- mise en page responsive
- manipulation du DOM
- logique JavaScript
- structuration de projets

### 🔹 Documentation technique
Chaque projet est accompagné de :
- fichiers `README.md`
- documentation spécifique (règles du jeu, explications fonctionnelles)
- commentaires dans le code lorsque nécessaire

### 🔹 Réflexion critique
Le portfolio inclut une démarche réflexive sur :
- les choix techniques réalisés
- les difficultés rencontrées
- les compétences acquises et à approfondir

---

## 🌐 Portfolio en ligne

🔗 **Lien : http://91.98.164.47/**

Le portfolio est hébergé sur un serveur distant et accessible depuis n’importe quel navigateur moderne.

---

## 🧱 Structure du projet

Le portfolio est organisé comme un **hub** regroupant plusieurs projets indépendants.
Chaque projet possède sa propre architecture et sa documentation.

```txt
portfolio/
│
├── index.html              # Page d’accueil du portfolio
├── style.css               # Styles globaux
├── package.json            # Configuration Node.js
│
├── dashboard/              # Projet Dashboard
│   ├── index.html
│   ├── server.js
│   ├── README.md
│   └── assets/
│       ├── css/style.css
│       └── js/app.js
│
└── hitster/                # Projet Hitster (adaptation web)
    ├── index.html
    ├── server.js
    ├── README.md
    ├── assets/
    │   ├── audio/
    │   ├── css/style.css
    │   ├── data/songs.json
    │   └── js/game.js
    └── docs/
        └── regle-du-jeu.md
