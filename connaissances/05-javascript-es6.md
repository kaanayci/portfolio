# JavaScript ES6+ : Fondamentaux Modernes — Fiche Technique N°05

> **Thème** : Langages de programmation - JavaScript ES6+ | **Dernière mise à jour** : Mars 2026 | **Niveau** : Intermédiaire/Avancé

---

## 1. Introduction et contexte

L'ES6 (ECMAScript 2015) représente une évolution majeure du langage JavaScript, apportant des améliorations syntaxiques et fonctionnelles considérables. Depuis la standardisation en 2015, chaque année voit l'ajout de nouvelles fonctionnalités (ES7, ES8, etc.), collectivement appelées ES6+ ou JavaScript moderne.

Cette fiche technique explore les concepts fondamentaux qui ont transformé la programmation JavaScript, permettant un code plus lisible, maintenable et performant.

### Contexte historique
- **ES5 (2009)** : Standardisation initiale du JavaScript
- **ES6 (2015)** : Refonte majeure avec classes, modules, promises
- **Annuellement depuis 2016** : Ajout de petites améliorations

---

## 2. Concepts fondamentaux

### 2.1 Variables : let et const vs var

La déclaration de variables a été profondément transformée avec ES6.

**var (Legacy - à éviter)**
```javascript
// var a une portée de fonction, pas de bloc
function exemple() {
    if (true) {
        var x = 10;
    }
    console.log(x); // 10 (accessible hors du bloc if!)
}

// Hoisting problématique
console.log(y); // undefined (au lieu d'une erreur)
var y = 5;
```

**let (Portée de bloc)**
```javascript
function exemple() {
    if (true) {
        let x = 10;
    }
    // console.log(x); // ReferenceError: x is not defined
}

// Temporal Dead Zone
// console.log(z); // ReferenceError
let z = 5;
```

**const (Constante - recommandé par défaut)**
```javascript
const PI = 3.14159;
// PI = 3.14; // TypeError: Assignment to constant variable

const obj = { name: "Alice" };
obj.name = "Bob"; // OK! const empêche la réassignation, pas la mutation
```

**Bonnes pratiques de variable**
```javascript
// Hiérarchie recommandée: const > let > var (jamais)
const MAX_ATTEMPTS = 3;
const message = "Bienvenue";
let counter = 0;

// Utiliser const par défaut, let si modification nécessaire
const users = ["Alice", "Bob"]; // OK: modifier le contenu
// users = []; // Erreur: réassignation interdite
users.push("Charlie"); // OK
```

### 2.2 Arrow Functions (Fonctions fléchées)

Les fonctions fléchées offrent une syntaxe plus concise et lient lexicalement `this`.

```javascript
// Syntaxe classique vs arrow function
const classique = function(x) {
    return x * 2;
};

const fleche = (x) => x * 2;
const fleche2 = x => x * 2; // Parenthèses optionnelles avec 1 param

// Cas multi-lignes
const complexe = (x, y) => {
    const somme = x + y;
    return somme * 2;
};

// Différence importante : this
const obj = {
    nom: "Objet",
    methodeClassique: function() {
        console.log(this.nom); // "Objet"
    },
    methodeArrow: () => {
        console.log(this); // Hérite de this du scope parent, pas de l'objet
    }
};
```

### 2.3 Template Literals (Chaînes de caractères)

Les template literals permettent l'interpolation et les chaînes multi-lignes.

```javascript
const nom = "Alice";
const age = 25;

// Avant ES6
const messageES5 = "Bonjour " + nom + ", vous avez " + age + " ans.";

// Avec ES6
const messageES6 = `Bonjour ${nom}, vous avez ${age} ans.`;

// Expressions complexes
const resultat = `Le double de ${age} est ${age * 2}`;

// Chaînes multi-lignes
const html = `
    <div class="card">
        <h2>${nom}</h2>
        <p>Âge: ${age}</p>
    </div>
`;

// Tagged template literals
function highlighter(strings, ...values) {
    return strings.map((str, i) =>
        str + (values[i] ? `[${values[i]}]` : "")
    ).join("");
}

const tag = highlighter`Nom: ${nom}, Âge: ${age}`;
```

### 2.4 Destructuring (Déstructuration)

La déstructuration simplifie l'extraction de valeurs d'objets et d'tableaux.

```javascript
// Déstructuring d'objet
const personne = { nom: "Alice", age: 25, ville: "Paris" };
const { nom, age } = personne;
console.log(nom); // "Alice"

// Avec renommage
const { nom: n, age: a } = personne;

// Avec valeurs par défaut
const { nom, pays = "France" } = personne;

// Déstructuring imbriqué
const utilisateur = {
    id: 1,
    profil: {
        nom: "Bob",
        email: "bob@example.com"
    }
};
const { profil: { nom, email } } = utilisateur;

// Déstructuring de tableau
const [premier, deuxieme, ...reste] = [1, 2, 3, 4, 5];
console.log(premier); // 1
console.log(reste); // [3, 4, 5]

// Dans les paramètres de fonction
function afficher({ nom, age }) {
    console.log(`${nom} a ${age} ans`);
}
afficher(personne);
```

### 2.5 Spread et Rest Operators

Ces opérateurs (...) permettent l'expansion ou la collecte d'éléments.

```javascript
// Spread operator - expansion
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5]; // [1, 2, 3, 4, 5]

const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 }; // { a: 1, b: 2, c: 3 }

// Rest operator - collecte
function somme(...nombres) {
    return nombres.reduce((acc, n) => acc + n, 0);
}
console.log(somme(1, 2, 3, 4)); // 10

// Dans destructuring
const [x, ...reste] = [1, 2, 3, 4];

// Cas pratique : clonage
const original = { id: 1, nom: "Alice" };
const clone = { ...original }; // Copie superficielle
```

### 2.6 Promises et Gestion Asynchrone

Les Promises formalisent la gestion du code asynchrone.

```javascript
// Création d'une Promise
const promesse = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve("Succès!");
    }, 1000);
});

promesse.then(resultat => {
    console.log(resultat); // "Succès!"
}).catch(erreur => {
    console.error(erreur);
});

// Chaînage
fetch("/api/utilisateurs")
    .then(response => response.json())
    .then(data => {
        console.log(data);
        return data[0].id;
    })
    .then(id => fetch(`/api/utilisateurs/${id}`))
    .catch(erreur => console.error("Erreur:", erreur));

// Promise.all pour exécution parallèle
Promise.all([
    fetch("/api/users"),
    fetch("/api/posts"),
    fetch("/api/comments")
]).then(responses => {
    return Promise.all(responses.map(r => r.json()));
}).then(data => {
    console.log("Toutes les données:", data);
});
```

### 2.7 Async/Await

Syntaxe plus lisible pour travailler avec les Promises.

```javascript
// Avant : chaînage de promises
function obtenirUtilisateur(id) {
    return fetch(`/api/users/${id}`)
        .then(res => res.json())
        .then(user => {
            return fetch(`/api/posts/${user.id}`)
                .then(res => res.json())
                .then(posts => ({ ...user, posts }));
        });
}

// Avec async/await
async function obtenirUtilisateurAvecPosts(id) {
    try {
        const resUser = await fetch(`/api/users/${id}`);
        const user = await resUser.json();

        const resPosts = await fetch(`/api/posts/${user.id}`);
        const posts = await resPosts.json();

        return { ...user, posts };
    } catch (error) {
        console.error("Erreur lors du chargement:", error);
        throw error;
    }
}

// Exécution parallèle avec async/await
async function obtenirDonnees() {
    try {
        const [users, posts, comments] = await Promise.all([
            fetch("/api/users").then(r => r.json()),
            fetch("/api/posts").then(r => r.json()),
            fetch("/api/comments").then(r => r.json())
        ]);

        return { users, posts, comments };
    } catch (error) {
        console.error("Erreur:", error);
    }
}
```

### 2.8 Modules (Import/Export)

Les modules permettent l'organisation modulaire du code.

```javascript
// math.js - Exporter des fonctions
export const addition = (a, b) => a + b;
export const multiplication = (a, b) => a * b;

export default function soustraction(a, b) {
    return a - b;
}

// main.js - Importer
import soustraction, { addition, multiplication } from "./math.js";

console.log(addition(5, 3)); // 8
console.log(soustraction(10, 4)); // 6

// Import with alias
import { addition as add } from "./math.js";

// Import everything
import * as Math from "./math.js";
console.log(Math.addition(5, 3));

// Cas réel : module avec classe
// User.js
export class User {
    constructor(name, email) {
        this.name = name;
        this.email = email;
    }

    getInfo() {
        return `${this.name} (${this.email})`;
    }
}

// App.js
import { User } from "./User.js";
const user = new User("Alice", "alice@example.com");
console.log(user.getInfo());
```

### 2.9 Map et Set

Collections de données avec comportements spécifiques.

```javascript
// Map : clés-valeurs avec clés de n'importe quel type
const utilisateurs = new Map();

utilisateurs.set("user1", { nom: "Alice", age: 25 });
utilisateurs.set("user2", { nom: "Bob", age: 30 });
utilisateurs.set(1, { nom: "Charlie", age: 28 }); // clé numérique OK

console.log(utilisateurs.get("user1")); // { nom: "Alice", age: 25 }
console.log(utilisateurs.has("user1")); // true
console.log(utilisateurs.size); // 3

// Itération
for (const [cle, valeur] of utilisateurs) {
    console.log(cle, valeur);
}

// Comparaison avec Object
const objMap = {};
objMap[{ id: 1 }] = "valeur1"; // La clé devient "[object Object]"
const mapProper = new Map();
mapProper.set({ id: 1 }, "valeur1"); // OK, objet comme clé

// Set : collection de valeurs uniques
const ids = new Set([1, 2, 3, 2, 1]); // Dupliquats ignorés
console.log(ids.size); // 3

ids.add(4);
console.log(ids.has(2)); // true

// Cas pratique : supprimer les doublons
const doubly = [1, 2, 2, 3, 3, 3];
const unique = [...new Set(doubly)]; // [1, 2, 3]
```

### 2.10 Classes et Héritage

Syntaxe orientée objet pour structures complexes.

```javascript
// Classe simple
class Animal {
    constructor(nom) {
        this.nom = nom;
    }

    parler() {
        console.log(`${this.nom} fait du bruit`);
    }
}

const chien = new Animal("Rex");
chien.parler(); // "Rex fait du bruit"

// Héritage
class Chien extends Animal {
    constructor(nom, race) {
        super(nom);
        this.race = race;
    }

    parler() {
        console.log(`${this.nom} aboie`);
    }

    description() {
        return `${this.nom} est un ${this.race}`;
    }
}

const monChien = new Chien("Bella", "Golden Retriever");
monChien.parler(); // "Bella aboie"
console.log(monChien.description()); // "Bella est un Golden Retriever"

// Getter et Setter
class Utilisateur {
    constructor(prenom, nom) {
        this._prenom = prenom;
        this._nom = nom;
    }

    get nomComplet() {
        return `${this._prenom} ${this._nom}`;
    }

    set nomComplet(valeur) {
        [this._prenom, this._nom] = valeur.split(" ");
    }

    static creerParDefaut() {
        return new Utilisateur("John", "Doe");
    }
}

const user = new Utilisateur("Alice", "Martin");
console.log(user.nomComplet); // "Alice Martin"
user.nomComplet = "Bob Smith";

const userDefault = Utilisateur.creerParDefaut();
```

### 2.11 Optional Chaining et Nullish Coalescing

Sécuriser l'accès aux propriétés potentiellement nulles.

```javascript
// Optional chaining (?.)
const user = {
    profil: {
        adresse: {
            ville: "Paris"
        }
    }
};

// Avant ES2020
const ville = user && user.profil && user.profil.adresse && user.profil.adresse.ville;

// Avec optional chaining
const villeOptional = user?.profil?.adresse?.ville; // "Paris"
const nonExistant = user?.telephone?.numero; // undefined

// Avec méthodes
const nom = user?.getNom?.(); // undefined si getNom n'existe pas

// Nullish coalescing (??)
const valeur1 = null ?? "défaut"; // "défaut"
const valeur2 = undefined ?? "défaut"; // "défaut"
const valeur3 = 0 ?? "défaut"; // 0 (pas considéré comme nullish)
const valeur4 = "" ?? "défaut"; // "" (pas considéré comme nullish)

// Cas pratique
const config = {
    timeout: 0
};
const timeout = config.timeout ?? 5000; // 0 (pas remplacé)
```

---

## 3. Exemples pratiques

### Exemple 1 : Gestionnaire de tâches avec Classes et Destructuring

```javascript
class Task {
    constructor(id, titre, description, statut = "À faire") {
        this.id = id;
        this.titre = titre;
        this.description = description;
        this.statut = statut;
        this.createdAt = new Date();
    }

    marquerTerminee() {
        this.statut = "Terminée";
    }
}

class TaskManager {
    constructor() {
        this.tasks = [];
        this.nextId = 1;
    }

    ajouterTache(titre, description) {
        const task = new Task(this.nextId++, titre, description);
        this.tasks.push(task);
        return task;
    }

    obtenirTaches(statut = null) {
        return statut
            ? this.tasks.filter(t => t.statut === statut)
            : this.tasks;
    }

    terminerTache(id) {
        const task = this.tasks.find(t => t.id === id);
        task?.marquerTerminee();
    }

    afficherRapport() {
        const stats = {
            total: this.tasks.length,
            terminee: this.tasks.filter(t => t.statut === "Terminée").length,
            aFaire: this.tasks.filter(t => t.statut === "À faire").length
        };

        console.log(`Total: ${stats.total}, Terminées: ${stats.terminee}, À faire: ${stats.aFaire}`);
    }
}

// Utilisation
const manager = new TaskManager();
manager.ajouterTache("Apprendre ES6", "Étudier les nouveautés JavaScript");
manager.ajouterTache("Créer un projet", "Appliquer les concepts");
manager.terminerTache(1);
manager.afficherRapport();
```

### Exemple 2 : Fetch et Traitement de Données Asynchrones

```javascript
async function traiterDonneeUtilisateur(userId) {
    try {
        // Récupérer l'utilisateur
        const userRes = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
        const user = await userRes.json();

        const { name, email, address: { city } } = user;

        // Récupérer les posts en parallèle
        const [postsRes, commentsRes] = await Promise.all([
            fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`),
            fetch(`https://jsonplaceholder.typicode.com/comments?name=${name}`)
        ]);

        const posts = await postsRes.json();
        const comments = await commentsRes.json();

        return {
            utilisateur: { name, email, city },
            stats: {
                nbPosts: posts.length,
                nbCommentaires: comments.length
            },
            derniersArticles: posts.slice(0, 3).map(({ id, title }) => ({ id, title }))
        };
    } catch (error) {
        console.error(`Erreur lors du chargement des données: ${error.message}`);
        throw error;
    }
}

// Utilisation
traiterDonneeUtilisateur(1).then(resultat => {
    console.log(resultat);
});
```

---

## 4. Bonnes pratiques

### 4.1 Organisation du Code

```javascript
// ✓ BON : Utiliser const par défaut
const MAX_RETRIES = 3;
const configuration = { ...defaultConfig };
let compteur = 0;

// ✗ MAUVAIS : Utiliser var
var MAX_RETRIES = 3;

// ✓ BON : Arrow functions pour les callbacks
const nombres = [1, 2, 3, 4, 5];
const doubles = nombres.map(n => n * 2);

// ✗ MAUVAIS : Fonctions classiques inutiles
const doubles = nombres.map(function(n) { return n * 2; });
```

### 4.2 Gestion Asynchrone

```javascript
// ✓ BON : async/await pour clarté
async function chargerDonnees() {
    try {
        const response = await fetch("/api/data");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erreur:", error);
        // Gérer l'erreur appropriately
    }
}

// ✗ MAUVAIS : Nested callbacks (callback hell)
function chargerDonnees(callback) {
    fetch("/api/data").then(response => {
        response.json().then(data => {
            callback(data);
        });
    });
}
```

### 4.3 Sécurité avec Optional Chaining

```javascript
// ✓ BON : Protéger l'accès aux propriétés
const nom = utilisateur?.profil?.nom ?? "Anonyme";
const telephone = utilisateur?.contacts?.telephone?.numero;

// ✗ MAUVAIS : Risque de TypeError
const nom = utilisateur.profil.nom;
```

### 4.4 Modules et Structure

```javascript
// ✓ BON : Exports explicites
// math.js
export const addition = (a, b) => a + b;
export const multiplication = (a, b) => a * b;

// ✗ MAUVAIS : Pollution du scope global
window.addition = (a, b) => a + b;
```

---

## 5. Comparaison / Alternatives

### ES6 vs JavaScript classique

| Aspect | ES6+ | ES5 | Avantage |
|--------|------|-----|----------|
| Variables | const/let | var | Portée de bloc, pas de hoisting |
| Functions | arrow (=>) | function | Syntaxe plus courte, this lexical |
| Strings | template literals | concatenation | Plus lisible, multi-ligne |
| Classes | syntaxe native | constructor functions | Plus intuitif, héritage clairement défini |
| Async | async/await, promises | callbacks | Code plus lisible, meilleure gestion erreurs |
| Modules | import/export | IIFE, require | Standardisé, scalable |

### TypeScript comme alternative

```typescript
// TypeScript ajoute du typage à ES6+
interface User {
    name: string;
    age: number;
}

class UserManager {
    private users: User[] = [];

    addUser(user: User): void {
        this.users.push(user);
    }

    getUser(name: string): User | undefined {
        return this.users.find(u => u.name === name);
    }
}
```

**Quand utiliser TypeScript** : Projets larges, équipes nombreuses, code critique
**Quand rester en JavaScript** : Prototypes, petits projets, prototypage rapide

---

## 6. Ressources externes

### 6.1 Documentation officielle
- **MDN Web Docs (Mozilla Developer Network)** - https://developer.mozilla.org/fr/docs/Web/JavaScript
  - Critique : Excellent référentiel, à jour, exemples complets. Cependant, certaines pages peuvent être denses pour débutants.

### 6.2 Spécification
- **ECMAScript Specification** - https://tc39.es/ecma262/
  - Critique : Document technique très détaillé, difficile pour débutants. Indispensable pour clarifier des comportements edge-case.

### 6.3 Tutoriels
- **JavaScript.info** - https://javascript.info/
  - Critique : Explications progressives et claires. Très bon pour apprendre, avec illustrations pratiques.

### 6.4 Outils
- **Babel** - https://babeljs.io/
  - Critique : Transcompilateur essentiel pour compatibilité navigateurs. Interface web utile pour visualiser la transpilation.

### 6.5 Environnement d'apprentissage
- **StackBlitz/CodePen** - Éditeurs en ligne pour tester le code ES6+ immédiatement
- **Node.js** - https://nodejs.org/
  - Critique : Nécessaire pour exécuter JavaScript côté serveur. Documentation officielle est complète.

---

## 7. Points clés à retenir

1. **const par défaut** : Utiliser const sauf si réassignation nécessaire
2. **Arrow functions** : Plus concises mais attention au `this` lexical
3. **Async/await** : Préférer à `.then()` pour clarté et gestion erreurs
4. **Destructuring** : Simplifie l'extraction et rend code plus lisible
5. **Modules** : Utiliser import/export pour code modulaire et maintenable
6. **Optional chaining** : `?.` pour sécuriser l'accès aux propriétés
7. **Spread operator** : Utile pour cloner, fusionner et passer arguments
8. **Classes** : Préférer aux constructor functions pour héritage
9. **Promises et async/await** : Fondamentaux pour programmation asynchrone
10. **Map et Set** : Utiliser pour cas d'usage spécifiques (clés complexes, unicité)

---

**Conclusion**

ES6+ a modernisé JavaScript en rendant le langage plus expressif et sûr. Une maîtrise solide de ces concepts est indispensable pour développer des applications web contemporaines efficaces et maintenables.
