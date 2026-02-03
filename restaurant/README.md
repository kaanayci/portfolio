# Coin Régal - Plateforme de Commande Restaurant 🍔

Une application web progressive (PWA) de restauration complète, incluant prise de commande client, programme de fidélité, et interface d'administration avec gestion d'impression thermique.

Développé avec **Vue 3**, **Vite**, **Tailwind CSS** et **Pinia**.

## 🚀 Fonctionnalités

### 📱 Pour les Clients (Web App / Mobile)
*   **Menu Interactif** : Navigation fluide, filtres par catégorie, gestion des stocks et best-sellers.
*   **Panier Intelligent** : Calcul automatique, gestion des quantités, et persistance des données.
*   **Options de Commande** : "À emporter" ou "Livraison" (avec vérification de zone/NPA).
*   **Programme de Fidélité** : 
    *   Historique des commandes.
    *   **11ème commande offerte** (réduction jusqu'à 10 CHF).
    *   Fonction "Commander à nouveau" en un clic.
*   **Installation (PWA)** : Peut être installée comme une application native sur Android/iOS.

### 👨‍🍳 Pour l'Administration (Dashboard)
*   **Gestion des Stocks** : Activation/Désactivation rapide des plats en rupture de stock.
*   **Suivi des Commandes** :
    *   Vue temps réel des commandes (En attente, En préparation, Prêt, Livré).
    *   Détails complets (Client, Adresse, Contenu).
*   **Impression Thermique (Ticket de Caisse)** :
    *   Format ticket optimisé (80mm).
    *   Génération automatique de **QR Code de Livraison** (lance la navigation GPS vers le client).
    *   Impression via le dialogue système (compatible imprimantes USB/Bluetooth).

## 📂 Structure du Projet

Le projet suit une architecture de composants Vue 3 standard et modulaire :

```
src/
├── assets/          # Images, CSS global, polices
├── components/      # Composants UI réutilisables
│   ├── admin/       # Composants spécifiques à l'admin (Tableau de bord, Tickets)
│   ├── cart/        # Composants du panier
│   ├── checkout/    # Formulaires de paiement et livraison
│   ├── common/      # Composants génériques (InstallPrompt, Toasts)
│   └── menu/        # Cartes produits, Modales de détails
├── data/            # Données statiques (menu.json)
├── router/          # Configuration des routes (Navigation)
├── stores/          # Gestion d'état global avec Pinia (Panier, User, Admin)
└── views/           # Pages principales (Home, Menu, Admin, Profile)
```

**Pourquoi autant de fichiers ?**  
Dans un projet Vue moderne, on découpe l'interface en petits morceaux (composants) indépendants. Cela permet de :
1.  **Réutiliser le code** (ex: le bouton "Ajouter" est le même partout).
2.  **Faciliter la maintenance** : Si le panier a un bug, on va voir le dossier `cart`, sans risquer de casser le menu.
3.  **Travailler en équipe** : Chacun peut bosser sur un fichier différent.

## 🛠 Installation et Démarrage

### Pré-requis
*   Node.js (v16+)
*   npm

### Installation

```bash
# Installer les dépendances
npm install
```

### Développement

```bash
# Lancer le serveur local (hot-reload)
npm run dev
```

### Production

```bash
# Construire pour la production (dossier dist/)
npm run build
```

## 🖨 Configuration de l'Imprimante

L'application utilise le driver d'impression natif du navigateur (`window.print()`) avec une feuille de style CSS spécifique (`@media print`).

*   **Réglages recommandés** :
    *   Format papier : 80mm (ou "Roll paper").
    *   Marges : Aucune / Minimum.
    *   Entêtes/Pieds de page : Désactivés.
*   **QR Code** : Le QR code sur le ticket de livraison encode une URL `https://www.google.com/maps/search/?api=1&query=...` pour lancement rapide du GPS.

## 👤 Compte de Test & Admin

*   **Mode Admin** : 
    *   Email : `admin@coinregal.com`
    *   Mot de passe : `admin123`
    *   Accès : `/admin` (Tableau de bord, Stocks)
