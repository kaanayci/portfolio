# Algorithme de Fidélité

## Définition
Un algorithme de fidélité est une logique métier qui récompense les clients réguliers pour encourager leur retour. Dans Coin Régal, le système fonctionne sur le principe de la "11ème commande offerte" avec un **plafonnement (cap method)** pour protéger le restaurant financièrement. C'est un exemple concret de gamification appliquée au e-commerce.

## Contexte d'utilisation
La fidélité client est un enjeu business classique en restauration. Plutôt qu'une carte à tamponner physique, j'ai implémenté un système entièrement numérique qui suit le nombre de commandes de l'utilisateur et applique automatiquement la réduction au moment du checkout.

## Architecture du système

Le programme de fidélité est réparti sur 3 fichiers qui collaborent :

| Fichier | Rôle dans la fidélité |
|---------|----------------------|
| `stores/user.js` | Compteur de commandes + vérification d'éligibilité |
| `stores/cart.js` | Calcul de la réduction plafonnée |
| `views/ProfileView.vue` | Affichage visuel de la progression |

## Exemple de code : vérification d'éligibilité (UserStore)

```javascript
// stores/user.js
state: () => ({
  orderCount: parseInt(localStorage.getItem('orderCount')) || 0
}),

getters: {
  // Le client est éligible tous les 10 commandes (10ème, 20ème, 30ème...)
  isEligibleForFreeItem: (state) => {
    return state.isAuthenticated
      && state.orderCount > 0
      && state.orderCount % 10 === 0
  },

  // Combien de commandes avant la prochaine récompense
  ordersUntilFreeItem: (state) => {
    const remainder = state.orderCount % 10
    if (remainder === 0 && state.orderCount > 0) return 0
    return 10 - remainder
  }
}
```

## Exemple de code : réduction plafonnée (CartStore)

L'algorithme ne rend pas le panier entier gratuit — il applique un **cap à 10 CHF** pour éviter les abus :

```javascript
// stores/cart.js
loyaltyDiscount: (state) => {
  const userStore = useUserStore()
  if (!userStore.isEligibleForFreeItem) return 0
  if (state.items.length === 0) return 0

  // Plafonnement : minimum entre 10 CHF et le total du panier
  return Math.min(10, state.cartTotal)
},

finalTotal: (state) => {
  return Math.max(0, state.cartTotal - state.loyaltyDiscount)
}
```

### Scénarios concrets

| Commande n° | Panier | Réduction | Client paie | Explication |
|-------------|--------|-----------|-------------|-------------|
| 9ème | 25 CHF | 0 CHF | 25 CHF | Pas encore éligible |
| 10ème | 42 CHF | 10 CHF | 32 CHF | Cap atteint |
| 10ème | 8 CHF | 8 CHF | 0 CHF | Petit panier = 100% offert |
| 11ème | 30 CHF | 0 CHF | 30 CHF | Compteur remis à zéro |

## Exemple de code : affichage de la progression (ProfileView)

La barre de progression dans le profil utilise les getters du UserStore :

```html
<!-- views/ProfileView.vue -->
<div v-if="userStore.ordersUntilFreeItem > 0">
  <p>Plus que <span class="font-bold">
    {{ userStore.ordersUntilFreeItem }} commandes
  </span> avant votre récompense !</p>

  <!-- Barre de progression visuelle -->
  <div class="w-full bg-gray-200 rounded-full h-2.5">
    <div class="bg-secondary h-2.5 rounded-full"
         :style="{ width: ((userStore.orderCount % 10) * 10) + '%' }">
    </div>
  </div>
</div>

<!-- Message quand le client est éligible -->
<div v-else class="text-green-600 font-bold">
  🎉 Votre prochaine commande bénéficie de 10 CHF de réduction.
</div>
```

## Cas d'usage dans mon projet
Le système fonctionne de bout en bout : le compteur s'incrémente à chaque commande validée (via `userStore.incrementOrderCount()`), la réduction s'applique automatiquement dans le calcul du total, et le profil affiche la progression en temps réel. La fonction "Commander à nouveau" (`reorder`) réinjecte les items d'une commande passée dans le panier, ce qui encourage la fidélisation.

## Pièges à éviter
*   **Modulo et cas zéro** : `0 % 10 === 0` est vrai, donc un utilisateur avec 0 commandes serait considéré éligible sans la vérification `orderCount > 0`. C'est un bug classique avec l'opérateur modulo.
*   **Pas de validation serveur** : Le compteur est stocké en localStorage, donc un utilisateur technique pourrait le modifier manuellement. En production, il faudrait absolument un backend pour valider l'éligibilité.
*   **Plafonnement trop bas/haut** : Le cap de 10 CHF est un choix business. Trop bas, la récompense n'est pas motivante. Trop haut, le restaurant perd de l'argent. Dans un vrai contexte, cette valeur serait configurable.

## Analyse personnelle
Cette fonctionnalité m'a appris que le développement web ne se limite pas à la technique — il faut aussi comprendre la logique métier. J'ai dû réfléchir comme un propriétaire de restaurant : comment récompenser sans se ruiner ? Le cap method est une solution élégante que j'ai trouvée après avoir initialement codé une version sans plafond. C'est aussi un bon exemple de communication entre stores Pinia : le CartStore "interroge" le UserStore pour savoir si le client est éligible, ce qui montre comment les stores peuvent collaborer sans être couplés.

## Sources
*   Pinia - Accéder à d'autres stores : [https://pinia.vuejs.org/core-concepts/actions.html#accessing-other-stores-actions](https://pinia.vuejs.org/core-concepts/actions.html#accessing-other-stores-actions)
*   Gamification en e-commerce : [https://www.smashingmagazine.com/2012/04/gamification-ux-users-program/](https://www.smashingmagazine.com/2012/04/gamification-ux-users-program/)
