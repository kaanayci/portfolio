# Gestion d'État Global (Pinia)

## Définition
**Pinia** est le gestionnaire d'état officiel de Vue 3. Il remplace Vuex et permet de centraliser les données partagées entre plusieurs composants dans des **stores** — des objets réactifs accessibles depuis n'importe quel composant. Chaque store contient un **state** (données), des **getters** (données calculées) et des **actions** (méthodes qui modifient le state).

## Contexte d'utilisation
Dans Coin Régal, plusieurs composants indépendants ont besoin des mêmes données : le badge du panier dans le header (`App.vue`) affiche le nombre d'articles, la page Menu ajoute des items, la page Panier les modifie, et le Checkout calcule le total avec la réduction fidélité. Sans store centralisé, il faudrait faire transiter ces données via des props sur 3-4 niveaux de profondeur (props drilling), ce qui rendrait le code ingérable.

## Les 3 stores du projet

| Store | Rôle | State | Persistance |
|-------|------|-------|-------------|
| `CartStore` | Panier d'achat | items, quantités, options | localStorage |
| `UserStore` | Auth + fidélité | user, orderCount | localStorage |
| `MenuStore` | Catalogue produits | categories, products | Chargé depuis JSON |

## Exemple de code : CartStore

Le store le plus complexe — il gère l'ajout intelligent d'articles (fusion si même produit + mêmes options), le calcul du total avec extras, et la réduction fidélité :

```javascript
// stores/cart.js
import { defineStore } from 'pinia'
import { useUserStore } from './user'

export const useCartStore = defineStore('cart', {
  // State : initialisé depuis localStorage pour persister au refresh
  state: () => ({
    items: JSON.parse(localStorage.getItem('cart_items') || '[]')
  }),

  getters: {
    // Compte total d'articles (somme des quantités)
    itemCount: (state) => state.items.reduce((acc, item) => acc + item.quantity, 0),

    // Total du panier avec calcul des extras et suppléments
    cartTotal: (state) => {
      return state.items.reduce((total, item) => {
        let itemPrice = item.product.price
        // Ajouter le prix des extras (sauce, fromage...)
        if (item.options?.extras) {
          item.options.extras.forEach(extra => { itemPrice += extra.price || 0 })
        }
        return total + (itemPrice * item.quantity)
      }, 0)
    },

    // Réduction fidélité : accès au UserStore depuis le CartStore
    loyaltyDiscount: (state) => {
      const userStore = useUserStore()
      if (!userStore.isEligibleForFreeItem) return 0
      return Math.min(10, state.cartTotal)  // Plafonné à 10 CHF
    }
  },

  actions: {
    addItem(product, quantity = 1, options = {}) {
      // Fusion intelligente : même produit + mêmes options = +quantité
      const existingIndex = this.items.findIndex(item =>
        item.product.id === product.id &&
        JSON.stringify(item.options) === JSON.stringify(options)
      )
      if (existingIndex > -1) {
        this.items[existingIndex].quantity += quantity
      } else {
        this.items.push({ product, quantity, options, timestamp: Date.now() })
      }
      this.saveCart()
    },

    saveCart() {
      localStorage.setItem('cart_items', JSON.stringify(this.items))
    }
  }
})
```

## Exemple de code : utilisation dans un composant

Dans n'importe quel composant, il suffit d'appeler `useCartStore()` pour accéder au panier réactif :

```javascript
// Dans MenuView.vue
import { useCartStore } from '@/stores/cart'
const cartStore = useCartStore()

// Ajouter un article
cartStore.addItem(product, quantity, options)
```

```html
<!-- Dans App.vue : badge réactif automatiquement mis à jour -->
<span v-if="cartStore.itemCount > 0">
  {{ cartStore.itemCount }}
</span>
```

## Exemple de code : communication entre stores

Un point technique intéressant : le `CartStore` accède au `UserStore` dans son getter `loyaltyDiscount` pour vérifier l'éligibilité fidélité. Pinia permet cette communication inter-stores simplement en appelant `useUserStore()` à l'intérieur d'un getter ou d'une action.

## Cas d'usage dans mon projet
La persistance via localStorage a été essentielle pour l'expérience utilisateur : un client qui ferme son navigateur et revient retrouve son panier intact. Le `MenuStore` utilise aussi localStorage pour sauvegarder la disponibilité des produits modifiée par l'admin, ce qui simule une base de données côté client.

## Pièges à éviter
*   **Sérialisation circulaire** : `JSON.stringify()` ne gère pas les références circulaires. Il faut stocker des données simples (pas de fonctions, pas d'objets Vue réactifs bruts).
*   **Comparaison d'options** : `JSON.stringify(item.options) === JSON.stringify(options)` fonctionne pour la fusion d'articles, mais l'ordre des clés doit être identique. Une solution plus robuste serait une fonction de deep equal.
*   **localStorage synchrone** : `localStorage.setItem()` est synchrone et bloque le thread principal. Pour un panier avec peu d'items c'est négligeable, mais pour de grandes quantités de données il faudrait envisager IndexedDB.
*   **Pas de validation côté serveur** : Dans un vrai projet, les prix et la disponibilité devraient être vérifiés côté serveur au moment de la commande, pas uniquement côté client.

## Analyse personnelle
Le passage à Pinia a été un moment clé dans ma compréhension de Vue 3. Dans mes projets précédents (Hitster, Dashboard), je gérais l'état avec des variables globales ou du localStorage brut — ça fonctionnait mais c'était fragile et difficile à débugger. Avec Pinia, la logique métier est centralisée et testable. L'intégration avec Vue DevTools m'a particulièrement aidé à comprendre le flux de données : je pouvais voir en temps réel le state changer quand j'ajoutais un article au panier. Si c'était à refaire, j'utiliserais la syntaxe Composition API (`setup()`) plutôt que l'Options API pour les stores, car c'est la direction recommandée par l'équipe Vue.

## Sources
*   Pinia - Documentation officielle : [https://pinia.vuejs.org/](https://pinia.vuejs.org/)
*   Vue.js - State Management : [https://vuejs.org/guide/scaling-up/state-management](https://vuejs.org/guide/scaling-up/state-management)
*   Pinia vs Vuex : [https://pinia.vuejs.org/introduction.html#comparison-with-vuex](https://pinia.vuejs.org/introduction.html#comparison-with-vuex)
