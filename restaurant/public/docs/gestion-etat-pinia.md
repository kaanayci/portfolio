# Gestion d'État Global (Pinia)

## Description
L'application utilise **Pinia** (le standard pour Vue 3) pour gérer l'état global, remplaçant Vuex. Cela permet de partager les données du panier et de l'utilisateur entre toutes les pages sans "props drilling".

## Stores Implémentés
1.  **CartStore (`cart.js`)** :
    *   Gère la liste des items (`items`), le total (`cartTotal`).
    *   Contient la logique métier : ajout, suppression, calcul des sous-totaux.
    *   **Persistance** : Utilise `localStorage` via un watcher pour sauvegarder le panier même si l'utilisateur rafraîchit la page.

2.  **UserStore (`user.js`)** :
    *   Gère l'authentification (`isAuthenticated`, `user`).
    *   Stocke l'historique des commandes et le compteur de fidélité.

## Avantages
*   **Réactivité** : Tout composant utilisant `useCartStore()` est automatiquement mis à jour si le panier change.
*   **DevTools** : Intégration parfaite avec Vue DevTools pour le débogage time-travel.
*   **Actions** : La logique (ex: `addToCart`) est centralisée dans le store, pas éparpillée dans les vues.

## Exemple de code
![alt text](gestion-etat-pinia.png)
