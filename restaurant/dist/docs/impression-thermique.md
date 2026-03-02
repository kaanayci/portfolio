# Impression Thermique & CSS Print

## Définition
La directive CSS `@media print` permet de définir des styles spécifiques qui s'appliquent uniquement lors de l'impression d'une page web. Combinée avec `window.print()` en JavaScript, elle permet de transformer le navigateur en système d'impression de tickets — sans générer de PDF ni utiliser de librairie tierce. C'est une approche légère et native.

## Contexte d'utilisation
Dans Coin Régal, l'admin doit pouvoir imprimer des tickets de caisse pour les commandes. Les imprimantes thermiques utilisées en restauration ont un format spécifique : **80mm de largeur**, papier en rouleau, impression monochrome uniquement. Le défi est de passer d'une interface web colorée et responsive à un ticket minimaliste en noir et blanc, sans casser l'interface de l'application.

## Exemple de code : stratégie de visibilité

Le principe est de cacher toute l'application et de ne rendre visible que la zone du ticket :

```css
/* components/admin/AdminOrders.vue - <style scoped> */
@media print {
  /* Étape 1 : Cacher TOUT le contenu du body */
  :global(body > *) {
    visibility: hidden;
  }

  /* Étape 2 : Rendre le conteneur app visible (pour le flux) */
  :global(#app) {
    visibility: visible;
  }

  /* Étape 3 : Mais cacher ses enfants directs */
  :global(#app > *) {
    visibility: hidden;
  }

  /* Étape 4 : Seul le ticket est visible, positionné en haut à gauche */
  #print-area {
    visibility: visible;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 9999;
  }

  /* Étape 5 : Tous les enfants du ticket redeviennent visibles */
  #print-area * {
    visibility: visible;
  }
}
```

**Pourquoi `visibility: hidden` et non `display: none` ?** La propriété `display: none` supprime l'élément du flux et peut décaler la position du ticket. `visibility: hidden` garde l'élément dans le flux mais le rend invisible, ce qui préserve le layout.

## Exemple de code : formatage du ticket thermique

```css
@media print {
  .ticket {
    font-family: 'Courier New', Courier, monospace;  /* Police fixe pour aligner les prix */
    width: 80mm;           /* Largeur standard d'un ticket thermique */
    max-width: 100%;
    margin: 0;
    padding: 5mm;
    font-size: 12px;
    line-height: 1.2;      /* Espacement serré pour économiser le papier */
  }

  /* Forcer le noir et blanc pour l'imprimante thermique */
  .ticket * {
    color: black !important;
    border-color: black !important;
  }

  /* Supprimer les marges de la page */
  @page {
    margin: 0;
    size: auto;
  }
}
```

## Exemple de code : template HTML du ticket

Le ticket est un `<div>` caché en temps normal (`class="hidden"`) qui ne s'affiche qu'à l'impression (`print:block`) :

```html
<!-- Le ticket est masqué à l'écran, visible à l'impression -->
<div id="print-area" class="hidden print:block">
  <div class="ticket">
    <!-- En-tête restaurant -->
    <h1 class="text-xl font-bold">COIN RÉGAL</h1>
    <p>123 Rue de la Liberté, 1200 Genève</p>

    <!-- Infos commande -->
    <span>CMD: {{ printOrder.id }}</span>

    <!-- Détails articles avec options -->
    <tr v-for="item in printOrder.items">
      <td>{{ item.quantity }}x</td>
      <td>{{ item.product.name }}</td>
      <td>{{ (item.product.price * item.quantity).toFixed(2) }}</td>
    </tr>

    <!-- QR Code pour le livreur -->
    <img v-if="qrCodeUrl" :src="qrCodeUrl" />

    <!-- Total -->
    <span>{{ printOrder.total.toFixed(2) }} CHF</span>
  </div>
</div>
```

## Exemple de code : déclenchement JavaScript

```javascript
const printTicket = async (order) => {
  // 1. Charger les données dans le template
  printOrder.value = order

  // 2. Générer le QR Code (async)
  // ... (voir fiche QR Code)

  // 3. Attendre que le DOM se mette à jour, puis imprimer
  setTimeout(() => { window.print() }, 100)
}
```

Le `setTimeout` de 100ms est nécessaire pour laisser Vue mettre à jour le DOM réactif avant que `window.print()` capture l'état de la page.

## Pièges à éviter
*   **`visibility` vs `display`** : Utiliser `display: none` au lieu de `visibility: hidden` casse le positionnement du ticket. C'est le piège principal.
*   **`:global()` en scoped** : Comme le style du composant est `scoped`, les sélecteurs ne s'appliquent qu'à ce composant. Pour cibler `body` ou `#app` (qui sont en dehors), il faut utiliser `:global()` — sinon les règles print sont ignorées.
*   **Couleurs et backgrounds** : Par défaut, les navigateurs n'impriment pas les couleurs de fond. Pour une imprimante thermique c'est parfait (tout doit être noir et blanc), mais si on voulait des fonds il faudrait forcer `-webkit-print-color-adjust: exact`.
*   **Le `setTimeout` avant `print()`** : Sans ce délai, Vue n'a pas le temps de rendre le QR Code et les données de commande dans le template. Le ticket s'imprime vide ou incomplet.
*   **Test sans imprimante** : On peut tester avec "Print to PDF" du navigateur, mais attention : la largeur 80mm ne se traduit pas exactement pareil en PDF qu'en impression réelle.

## Analyse personnelle
L'impression thermique est la fonctionnalité qui m'a le plus poussé à comprendre le CSS en profondeur. J'ai découvert que `@media print` est un outil puissant mais sous-documenté — la plupart des développeurs web n'impriment jamais depuis le navigateur. Le plus gros défi a été le `visibility` vs `display` : j'ai passé du temps à debugger pourquoi mon ticket n'apparaissait pas avant de comprendre la différence entre ces deux propriétés au niveau du flux CSS. C'est aussi la première fois que j'utilisais `:global()` dans un style scoped Vue — ça m'a appris comment Vue isole les styles et quand il faut "casser" cette isolation.

## Sources
*   MDN - @media print : [https://developer.mozilla.org/fr/docs/Web/CSS/@media](https://developer.mozilla.org/fr/docs/Web/CSS/@media)
*   MDN - visibility : [https://developer.mozilla.org/fr/docs/Web/CSS/visibility](https://developer.mozilla.org/fr/docs/Web/CSS/visibility)
*   CSS-Tricks - A Guide to the Responsive Images Syntax in HTML : [https://css-tricks.com/designing-for-print-with-css/](https://css-tricks.com/designing-for-print-with-css/)
