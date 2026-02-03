# Coin Régal - Restaurant PWA 🍔

Une Application Progressive (PWA) de restauration rapide développée avec Vue 3 et Tailwind CSS.  
Ce projet démontre la création d'une expérience de commande moderne, mobile-first et installable.

## 🌟 Fonctionnalités Clés

*   **Progressive Web App (PWA)** : Installable sur mobile/desktop, fonctionne hors-ligne.
*   **Menu Dynamique** : Filtrage par catégorie, gestion des stocks et best-sellers.
*   **Panier Intelligent** : Gestion des quantités, persistance (localStorage).
*   **Personnalisation Avancée** : Options de sauces, suppléments, et variantes.
*   **Checkout Complet** :
    *   Validation intelligente des zones de livraison.
    *   Calcul des montants minimums.
    *   Choix Livraison vs À emporter.
*   **Design Responsive** : Optimisé pour mobile avec une UI "App-like".

## 🛠 Stack Technique

*   **Framework** : Vue 3 (Composition API)
*   **Build Tool** : Vite
*   **State Management** : Pinia
*   **Router** : Vue Router
*   **Styling** : Tailwind CSS
*   **PWA** : Vite PWA Plugin (Service Worker, Manifest)
*   **Icons** : SVG natifs

## 📁 Structure du Projet

```
src/
├── components/
│   ├── common/      # Boutons, Modals, InstallPrompt
│   ├── menu/        # Cartes produits, Filtres
│   ├── cart/        # Items panier
│   └── checkout/    # Formulaires livraison/paiement
├── stores/          # Logique métier (Panier, Menu, User)
├── views/           # Pages (Accueil, Menu, Panier, Checkout)
├── data/            # Mock data (produits, config)
└── assets/          # Styles globaux
```

## 🚀 Installation et Lancement

1.  **Prérequis**
    *   Node.js (v16 ou supérieur)

2.  **Installation des dépendances**
    ```bash
    npm install
    ```

3.  **Lancement en développement**
    ```bash
    npm run dev
    ```
    L'application sera accessible sur `http://localhost:5173`.

4.  **Production (Build)**
    ```bash
    npm run build
    npm run preview
    ```

## 📸 Captures d'écran

*(Insérer ici des captures d'écran de l'interface mobile et desktop)*

---
Développé par Kaan Ayci - Portfolio Project 2026.
