# Algorithme de Fidélité

## Description
Le système inclut une mécanique de gamification simple : la "11ème commande offerte".

## Logique Métier
L'algorithme ne rend pas *n'importe quoi* gratuit, mais applique une réduction plafonnée (Cap method).

### Formule
```javascript
// Dans cart.js
getters: {
    loyaltyDiscount: (state) => {
        const userStore = useUserStore()
        
        // Si c'est la 11ème commande (multiple de 10)
        if (userStore.isEligibleForFreeItem) {
            // On offre le panier jusqu'à hauteur de 10 CHF
            return Math.min(10, state.cartTotal) 
        }
        return 0
    }
}
```

### Cas d'usage
1.  **Panier 42 CHF** : Réduction de 10 CHF -> Client paie 32 CHF.
2.  **Panier 8 CHF** : Réduction de 8 CHF -> Client paie 0 CHF (Gratuit).

Cette approche protège le restaurant contre des abus (commander pour 100 CHF gratuitement) tout en récompensant généreusement les petits paniers habituels.

## Exemple de code
![alt text](fidelite-algorithme.png)
