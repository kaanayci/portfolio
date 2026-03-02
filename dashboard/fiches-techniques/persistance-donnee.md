# Persistance des données avec localStorage

## Définition
`localStorage` est une API du navigateur (Web Storage API) permettant de stocker des données localement de manière persistante. Les données restent disponibles même après la fermeture du navigateur ou le redémarrage de l’ordinateur. Contrairement aux cookies, localStorage ne s’envoie pas avec chaque requête HTTP et dispose d’une capacité bien supérieure (~5-10 MB par domaine selon le navigateur).

## Contexte d’utilisation
localStorage est approprié pour :
- Sauvegarder les préférences utilisateur (thème, langue, unités)
- Mémoriser le dernier état de l’application (ville recherchée, favoris)
- Stocker des données offline (liste de courses, panier d’achat)
- Implémenter une expérience utilisateur fluide sans backend
- Cacher certaines données pour éviter des requêtes API répétées

localStorage ne doit PAS être utilisé pour :
- Données sensibles (mots de passe, tokens d’auth, numéros de carte bancaire)
- Données volumineuses (images, vidéos, gros fichiers JSON)
- Données qui doivent être supprimées après la session (utiliser sessionStorage)

## Exemples de code

### 1) Lecture et écriture basique
```javascript
// Écriture simple (clé: valeur)
localStorage.setItem("theme", "dark");
localStorage.setItem("lastCity", "Genève");
localStorage.setItem("weatherUnit", "metric");

// Lecture simple
const theme = localStorage.getItem("theme");  // "dark"
const city = localStorage.getItem("lastCity");  // "Genève"

// Vérifier l’existence d’une clé
if (localStorage.getItem("theme")) {
    console.log("Thème trouvé");
}

// Supprimer une clé
localStorage.removeItem("theme");

// Vider tout le localStorage
localStorage.clear();  // ⚠️ Dangereux, affecte TOUTE l’application
```

### 2) Pattern de lecture SÛRE avec fallback (Très important !)
```javascript
// ❌ DANGEREUX: Si la clé n’existe pas, get() retourne null
const favorites = JSON.parse(localStorage.getItem(‘weatherFavs’));  // null !

// ✅ BON: Utiliser le fallback || pour valeur par défaut
const favorites = JSON.parse(localStorage.getItem(‘weatherFavs’) || ‘[]’);
// Si vide: retourne []
// Si existe: retourne le tableau parsé

// Même approche pour objet
const preferences = JSON.parse(localStorage.getItem(‘preferences’) || ‘{}’);
```

### 3) Sérialisation JSON (données complexes)
```javascript
// Stockage d’un TABLEAU de favoris
const favoriteCities = ["Genève", "Zurich", "Lausanne"];
localStorage.setItem("weatherFavs", JSON.stringify(favoriteCities));
// localStorage contient: ["Genève", "Zurich", "Lausanne"]

// Lecture et manipulation
const favs = JSON.parse(localStorage.getItem(‘weatherFavs’) || ‘[]’);
favs.push("Bern");
localStorage.setItem("weatherFavs", JSON.stringify(favs));

// Stockage d’un OBJET complexe
const preferences = {
    theme: "dark",
    language: "fr",
    weatherUnit: "metric",
    notificationEnabled: true
};
localStorage.setItem("userPrefs", JSON.stringify(preferences));

// Lecture et modification
const prefs = JSON.parse(localStorage.getItem(‘userPrefs’) || ‘{}’);
prefs.theme = "light";
localStorage.setItem("userPrefs", JSON.stringify(prefs));
```

### 4) Cas réel du dashboard météo
```javascript
// Au chargement de l’app
function applyTheme() {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
        $("body").addClass("dark");
        $("#theme-toggle").text("☀️");
    } else {
        $("body").removeClass("dark");
        $("#theme-toggle").text("🌙");
    }
}

// Au clic sur le toggle
$(document).ready(function() {
    $("#theme-toggle, #btn-theme-toggle").on("click", function () {
        const isDark = $("body").hasClass("dark");
        localStorage.setItem("theme", isDark ? "light" : "dark");
        applyTheme();
    });
});

// Favoris météo (tableau)
function addToFavorites(city) {
    const favorites = JSON.parse(localStorage.getItem(‘weatherFavs’) || ‘[]’);

    if (!favorites.includes(city)) {
        favorites.push(city);
        localStorage.setItem(‘weatherFavs’, JSON.stringify(favorites));
    }
}

// Unité de mesure (string simple)
$(document).on(‘click’, ‘#unit-toggle’, function() {
    currentUnit = currentUnit === ‘metric’ ? ‘imperial’ : ‘metric’;
    localStorage.setItem(‘weatherUnit’, currentUnit);
    updateUnitUI();
});

// Dernière ville cherchée (pour restauration au chargement)
$.getJSON(url)
  .done(function (data) {
    renderWeather(data);

    if (typeof query === "string") {
        localStorage.setItem("lastCity", query);
    }
  });
```

### 5) Exemple: Panier d’achat (Restaurant)
```javascript
// Ajouter un article au panier
function addToCart(productId, productName, price) {
    let cart = JSON.parse(localStorage.getItem(‘cart_items’) || ‘[]’);

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: price,
            quantity: 1
        });
    }

    localStorage.setItem(‘cart_items’, JSON.stringify(cart));
}

// Récupérer et afficher le panier
function displayCart() {
    const cart = JSON.parse(localStorage.getItem(‘cart_items’) || ‘[]’);

    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
    });

    console.log(`Panier: ${cart.length} articles, Total: ${total}€`);
}

// Vider le panier
function clearCart() {
    localStorage.removeItem(‘cart_items’);
}
```

### 6) Différence: localStorage vs sessionStorage vs IndexedDB
```javascript
// localStorage: Persistant jusqu’à suppression manuelle ou expiration (années)
localStorage.setItem("theme", "dark");

// sessionStorage: Supprimé à la fermeture de l’onglet
sessionStorage.setItem("tempData", JSON.stringify(data));

// IndexedDB: Base de données locale, capacité massive (~50+ MB)
// Plus complexe, nécessite une librairie ou du code verbeux
// Meilleur pour: Gros volumes de données, requêtes complexes, synchronisation offline
// Pire pour: Simples clé-valeur (overkill)

// Comparaison:
// localStorage:     5-10 MB, clé-valeur simple, synchrone, bon pour prefs
// sessionStorage:   5-10 MB, clé-valeur simple, synchrone, pour données temp
// IndexedDB:        50+ MB, queries, asynchrone, pour données complexes
```

## Cas d’usage dans mon projet

**Dashboard météo :**
- `theme`: "dark" ou "light" → Appliqué au chargement pour restaurer la préférence
- `lastCity`: "Genève" → Recherche automatique au reload
- `weatherUnit`: "metric" ou "imperial" → Conversion des températures/vitesse du vent
- `weatherFavs`: ["Genève", "Zurich"] → Affiche un badge ⭐ sur les favoris

**Restaurant (projet comparaison) :**
- `product_availability`: JSON stringifié avec stock disponible
- `cart_items`: Panier sauvegardé même après fermeture/reload du navigateur

## Pièges à éviter

1. **Oublier le fallback || ‘[]’** :
   ```javascript
   // ❌ Crash si clé vide
   const items = JSON.parse(localStorage.getItem(‘cart_items’));
   items.push({...});  // TypeError: Cannot read property ‘push’

   // ✅ Safe
   const items = JSON.parse(localStorage.getItem(‘cart_items’) || ‘[]’);
   items.push({...});
   ```

2. **Stocker du JSON mal échappé** :
   ```javascript
   // ❌ DANGEREUX: Données sensibles
   localStorage.setItem(‘user’, JSON.stringify({
       email: ‘user@example.com’,
       password: ‘secret123’  // NE JAMAIS faire ça !
   }));

   // ✅ OK: Données non-sensibles
   localStorage.setItem(‘prefs’, JSON.stringify({
       language: ‘fr’,
       theme: ‘dark’
   }));
   ```

3. **localStorage pas privé entre onglets** :
   ```javascript
   // localStorage est PARTAGÉ entre tous les onglets du même domaine
   // Si on modifie dans l’onglet A, l’onglet B voit les changements
   // Utiliser l’événement ‘storage’ pour synchroniser
   window.addEventListener(‘storage’, (e) => {
       if (e.key === ‘theme’) {
           applyTheme();  // Recharger le thème si changé ailleurs
       }
   });
   ```

4. **Capacité dépassée (Quota) :**
   ```javascript
   // Si localStorage est plein (5-10 MB), .setItem() lève une erreur
   try {
       localStorage.setItem(‘bigData’, hugeString);
   } catch (e) {
       if (e.name === ‘QuotaExceededError’) {
           console.log(‘localStorage plein’);
           // Nettoyer les vieux données ou utiliser IndexedDB
       }
   }
   ```

5. **Utiliser clear() à la légère** :
   ```javascript
   // ❌ Supprime TOUTES les données de TOUTE l’app
   localStorage.clear();

   // ✅ Supprimer une clé spécifique
   localStorage.removeItem(‘theme’);
   ```

## Analyse personnelle
localStorage a été mon premier contact avec la persistance de données côté client. J’ai d’abord pensé que c’était une base de données simple, mais j’ai compris ses limites :
- Pas de chiffrement (visible en DevTools)
- Pas de requêtes complexes (juste clé-valeur)
- Capacité limitée (~5 MB)
- Synchrone (peut ralentir si trop d’opérations)

J’ai appris à organiser les données (favoris en tableau JSON, prefs en objet), et à toujours utiliser le pattern `|| ‘{}’` pour ne pas planter.

En travaillant sur le restaurant project, j’ai découvert que localStorage était suffisant pour un panier simple, mais qu’un vrai projet e-commerce aurait besoin d’une vraie base de données backend + IndexedDB pour la sync offline.

localStorage a soulevé une question importante : comment gérer la synchronisation entre onglets ? (Réponse: l’événement ‘storage’). Cette question m’a poussé à comprendre que les apps modernes nécessitent des patterns plus sophistiqués qu’une simple clé-valeur.

## Sources
- https://developer.mozilla.org/fr/docs/Web/API/Window/localStorage
- https://developer.mozilla.org/fr/docs/Web/API/Web_Storage_API
- https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- https://www.html5rocks.com/en/tutorials/offline/storage/
- JSON.stringify() et JSON.parse() - MDN
