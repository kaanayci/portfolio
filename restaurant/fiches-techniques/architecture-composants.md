# Architecture en Composants (Vue 3)

## Description
Le projet suit une architecture modulaire stricte. Chaque partie de l'interface est un fichier `.vue` indépendant (Single File Component).

## Structure des Dossiers
*   `views/` : Les pages complètes (ex: `CartView`, `AdminView`). Elles agissent comme des conteneurs.
*   `components/` : Les briques d'interface.
    *   `common/` : Boutons, Badges, Modales réutilisables.
    *   `menu/` : Carte produit (`DishCard`), Filtres.
    *   `cart/` : Ligne d'article (`CartItem`), Résumé.

## Communication
*   **Props** : Données descendantes (Parent -> Enfant). Ex: `DishCard` reçoit l'objet `dish`.
*   **Events** : Actions remontantes (Enfant -> Parent). Ex: `DishCard` émet `@add-to-cart`.
*   **Stores** : État partagé transversalement (Pinia).

Cette fragmentation permet à plusieurs développeurs de travailler en parallèle et facilite les tests unitaires de chaque composant isolé.

## Exemple de code
![alt text](architecture-composants.png)
