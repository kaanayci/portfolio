# Génération QR Code Dynamique

## Définition
Un QR Code (Quick Response Code) est un code-barres bidimensionnel qui peut être scanné par un smartphone pour déclencher une action — dans notre cas, ouvrir la navigation GPS vers l'adresse d'un client. La librairie JavaScript `qrcode` permet de générer des QR Codes côté client sous forme d'images **Data URI** (base64), sans avoir besoin d'un serveur.

## Contexte d'utilisation
Dans Coin Régal, quand l'admin imprime un ticket de commande pour la livraison, un QR Code est automatiquement généré avec l'adresse du client. Le livreur n'a qu'à scanner le code avec son téléphone pour lancer la navigation GPS instantanément — pas besoin de taper l'adresse manuellement. C'est une optimisation opérationnelle concrète qui réduit les erreurs et fait gagner 15-30 secondes par livraison.

## Exemple de code : génération du QR Code

La génération se fait dans `AdminOrders.vue`, au moment de l'impression du ticket :

```javascript
// components/admin/AdminOrders.vue
import QRCode from 'qrcode'

const printTicket = async (order) => {
  printOrder.value = order

  // Récupérer l'adresse du client
  const address = order.details?.customer?.address || order.customer?.address

  if (address) {
    // Encoder l'adresse dans un Universal Link Google Maps
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`

    try {
      // Générer le QR Code en Data URI (image base64)
      qrCodeUrl.value = await QRCode.toDataURL(mapsUrl, {
        width: 120,   // Taille en pixels
        margin: 1     // Marge minimale pour économiser l'espace sur le ticket
      })
    } catch (err) {
      console.error('QR Gen Error', err)
      qrCodeUrl.value = null  // Graceful degradation : pas de QR = pas de crash
    }
  }

  // Lancer l'impression après un court délai (pour que le DOM se mette à jour)
  setTimeout(() => { window.print() }, 100)
}
```

## Exemple de code : affichage sur le ticket

Le QR Code généré est affiché dans le template du ticket d'impression :

```html
<!-- Zone QR Code sur le ticket -->
<div v-if="qrCodeUrl" class="my-2 flex flex-col items-center">
  <img :src="qrCodeUrl" class="w-24 h-24 border border-black" />
  <span class="text-[10px] mt-1">Scanner pour l'itinéraire</span>
</div>
```

Le `v-if` assure que le QR Code n'est affiché que s'il a été généré avec succès — si l'adresse manque ou si la génération échoue, cette zone est simplement absente du ticket.

## Fonctionnement technique

Le flux complet est le suivant :

1. L'admin clique sur "🖨️ Ticket" sur une commande
2. L'adresse du client est extraite des données de commande
3. L'adresse est encodée avec `encodeURIComponent()` pour gérer les caractères spéciaux (accents, espaces)
4. Un Universal Link Google Maps est construit avec le paramètre `destination`
5. La librairie `qrcode` convertit cette URL en image base64 via `toDataURL()`
6. L'image est injectée dans le template du ticket
7. `window.print()` est appelé pour lancer l'impression

**Pourquoi `dir/` plutôt que `search/` ?** J'utilise l'endpoint `/dir/` (directions) plutôt que `/search/` car le livreur a besoin d'un itinéraire depuis sa position actuelle, pas juste de localiser l'adresse sur la carte.

## Cas d'usage dans mon projet
Le QR Code n'est imprimé que sur les commandes en livraison — pour les commandes à emporter, l'adresse n'est pas requise et le QR Code n'apparaît pas (grâce au `v-if`). C'est un exemple de **graceful degradation** : la fonctionnalité s'adapte au contexte sans erreur.

## Pièges à éviter
*   **`encodeURIComponent` obligatoire** : Sans encodage, une adresse comme "Rue de l'Église 5" casserait l'URL à cause de l'apostrophe et des espaces.
*   **Taille du QR Code** : Un QR Code trop petit ne sera pas lisible par les téléphones. 120px est un bon compromis pour un ticket thermique 80mm. Trop grand, il déborde.
*   **Asynchrone** : `QRCode.toDataURL()` est asynchrone (retourne une Promise). Il faut `await` le résultat avant de lancer l'impression, sinon le ticket s'imprime sans le QR Code.
*   **Data URI et taille** : Un Data URI base64 est environ 33% plus lourd que le binaire original. Pour un seul QR Code c'est négligeable, mais pour des dizaines d'images il faudrait envisager des URLs classiques.

## Analyse personnelle
Cette fonctionnalité est celle qui m'a le plus surpris par son impact pratique — c'est peu de code (environ 10 lignes) mais ça résout un vrai problème opérationnel. Ça m'a appris à réfléchir en termes d'expérience utilisateur pour les parties prenantes qu'on oublie souvent : ici, le livreur, pas le client. L'utilisation de `toDataURL` plutôt que de générer une image dans un canvas m'a aussi montré la puissance des Data URIs pour les contextes d'impression où on ne peut pas faire de requêtes réseau.

## Sources
*   qrcode (npm) : [https://www.npmjs.com/package/qrcode](https://www.npmjs.com/package/qrcode)
*   Google Maps Universal Links : [https://developers.google.com/maps/documentation/urls/get-started](https://developers.google.com/maps/documentation/urls/get-started)
*   MDN - encodeURIComponent : [https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent)
