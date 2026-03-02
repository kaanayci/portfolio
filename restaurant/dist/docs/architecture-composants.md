# Architecture en Composants (Vue 3)

## Définition
L'architecture en composants est un patron de conception où l'interface est découpée en blocs indépendants et réutilisables appelés **Single File Components (SFC)**. Chaque fichier `.vue` encapsule son template HTML, sa logique JavaScript et son style CSS en un seul endroit. C'est le principe fondamental de Vue 3.

## Contexte d'utilisation
Dans le projet Coin Régal, l'application est trop complexe pour être gérée dans un seul fichier : menu avec filtres, panier, commande, fidélité, admin... L'architecture en composants permet de découper chaque fonctionnalité en unités testables et maintenables, et de les composer entre elles.

## Structure des dossiers

```
src/
├── views/              # Pages complètes (conteneurs)
│   ├── HomeView.vue
│   ├── MenuView.vue
│   ├── CartView.vue
│   ├── CheckoutView.vue
│   ├── LoginView.vue
│   ├── ProfileView.vue
│   └── AdminView.vue
├── components/         # Briques d'interface réutilisables
│   ├── common/         # Composants génériques
│   │   ├── InstallPrompt.vue
│   │   └── ToastContainer.vue
│   ├── menu/           # Composants liés au menu
│   │   ├── DishCard.vue
│   │   └── ProductModal.vue
│   ├── cart/
│   │   └── CartItem.vue
│   └── checkout/
│       ├── DeliveryForm.vue
│       └── PaymentMethods.vue
├── stores/             # État global (Pinia)
└── router/             # Navigation (Vue Router)
```

## Exemple de code : communication Parent → Enfant

Dans `MenuView.vue`, la vue parent passe un produit au composant enfant `DishCard` via une **prop**, et écoute l'événement `@add-to-cart` remontant :

```html
<!-- MenuView.vue (Parent) -->
<DishCard
  v-for="product in filteredProducts"
  :key="product.id"
  :product="product"
  @add-to-cart="openProductModal"
/>
```

Le composant enfant `DishCard.vue` déclare ce qu'il reçoit et ce qu'il émet :

```javascript
// DishCard.vue (Enfant)
defineProps({
  product: {
    type: Object,
    required: true
  }
})

defineEmits(['add-to-cart'])
```

```html
<!-- Le bouton dans DishCard émet l'événement vers le parent -->
<button @click="$emit('add-to-cart', product)">
  Ajouter au panier
</button>
```

## Exemple de code : lazy loading des routes

Les pages rarement visitées (Admin, Checkout) sont chargées à la demande grâce au **lazy loading** avec `import()` dynamique, ce qui réduit le bundle initial :

```javascript
// router/index.js
{
  path: '/admin',
  name: 'admin',
  component: () => import('../views/AdminView.vue'),  // Chargé uniquement si besoin
  meta: { requiresAdmin: true }
}
```

Les pages principales (Home, Menu, Cart) sont importées directement car elles sont visitées systématiquement.

## Cas d'usage dans mon projet
Le composant `DishCard` est utilisé dans une grille responsive sur la page Menu. Grâce à l'isolation du composant, j'ai pu modifier son design (ajout du badge "Best-seller", gestion du fallback image avec `@error`) sans toucher au reste de l'application. La vue `MenuView` ne fait que filtrer les données et les passer aux composants enfants.

## Pièges à éviter
*   **Composants trop gros** : Si un composant dépasse ~150 lignes, c'est un signe qu'il faut le découper. Mon `App.vue` contient le header complet — idéalement, j'aurais dû extraire un `AppHeader.vue`.
*   **Props drilling** : Quand on passe des props sur 3+ niveaux de profondeur, il vaut mieux utiliser un store Pinia. C'est ce que j'ai fait pour le panier et l'utilisateur.
*   **Confusion events/stores** : Pour la communication parent-enfant directe, les events suffisent. Le store est réservé aux données partagées entre composants sans lien hiérarchique.

## Analyse personnelle
C'est la première fois que j'utilisais un framework avec des composants. Venant du JavaScript vanilla (projet Hitster), où tout était dans quelques gros fichiers, le passage aux SFC a été un vrai changement de mentalité. Au début, je trouvais que ça rajoutait de la complexité — créer un fichier pour un simple bouton semblait excessif. Mais dès que le projet a grandi (7 vues, 6+ composants), j'ai compris l'intérêt : chaque modification est localisée et n'a pas d'effet de bord imprévu. La prochaine fois, j'extrairais le header dans un composant séparé dès le départ pour garder `App.vue` léger.

## Sources
*   Vue.js - Components Basics : [https://vuejs.org/guide/essentials/component-basics](https://vuejs.org/guide/essentials/component-basics)
*   Vue.js - Single File Components : [https://vuejs.org/guide/scaling-up/sfc](https://vuejs.org/guide/scaling-up/sfc)
*   Vue.js - Props : [https://vuejs.org/guide/components/props](https://vuejs.org/guide/components/props)
