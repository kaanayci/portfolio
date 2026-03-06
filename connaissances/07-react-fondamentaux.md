# React : Composants, JSX et Props — Fiche Technique N°07

> **Thème** : Bibliothèques JavaScript - React | **Dernière mise à jour** : Mars 2026 | **Niveau** : Intermédiaire

---

## 1. Introduction et contexte

React est une bibliothèque JavaScript créée par Facebook en 2013 pour construire des interfaces utilisateur interactives. Elle introduit le paradigme des **composants réutilisables** et du **rendu déclaratif**, transformant l'approche du développement web.

### Historique de React

- **2013** : Première release open-source par Facebook
- **2015** : React Native, ReactDOM séparation
- **2016** : React 15, amélioration performance
- **2017** : Hooks introduction en planning
- **2019** : React Hooks révolution (useState, useEffect)
- **2022** : Server Components, concurrent rendering
- **2026** : React 19+, maturité complète

### Positionnement dans l'écosystème JavaScript

React s'est imposé comme le framework/bibliothèque la plus populaire, avec une part importante du marché du développement web frontend. Son approche componentisée a influencé Angular, Vue et même les Web Components standards.

---

## 2. Concepts fondamentaux

### 2.1 Composants React

React applications sont construites à partir de **composants**, unités réutilisables d'UI.

```javascript
// Composant fonctionnel (moderne, recommandé)
function Welcome() {
    return <h1>Bienvenue dans React!</h1>;
}

// Composant de classe (legacy, déprécié)
class WelcomeClass extends React.Component {
    render() {
        return <h1>Bienvenue dans React!</h1>;
    }
}

// Utilisation
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Welcome />);

// Composants acceptent des paramètres (props)
function Greeting(props) {
    return <h1>Bonjour, {props.nom}!</h1>;
}

root.render(<Greeting nom="Alice" />);
```

### 2.2 JSX : JavaScript XML Extension

JSX est une extension de syntaxe qui permet d'écrire du HTML-like dans JavaScript.

```javascript
// JSX (syntaxe React)
const element = <h1 className="greeting">Bonjour le monde!</h1>;

// Équivalent sans JSX
const element = React.createElement(
    "h1",
    { className: "greeting" },
    "Bonjour le monde!"
);

// JSX n'est pas du HTML valide
// Particularités :
// 1. className au lieu de class
const button = <button className="btn">Cliquer</button>;

// 2. htmlFor au lieu de for
const label = <label htmlFor="email">Email:</label>;

// 3. camelCase pour événements
const input = <input onChange={handleChange} />;

// 4. Style comme objet
const style = { color: "red", fontSize: "14px" };
const div = <div style={style}>Texte stylisé</div>;

// 5. Expressions JavaScript entre {}
const nom = "Alice";
const age = 25;
const greeting = <p>Bonjour {nom}, vous avez {age} ans</p>;

// 6. Conditions
const connecte = true;
const navbar = (
    <nav>
        {connecte ? <p>Bienvenue!</p> : <p>Veuillez vous connecter</p>}
    </nav>
);

// 7. Boucles (map)
const items = ["Apple", "Banana", "Orange"];
const list = (
    <ul>
        {items.map((item, index) => (
            <li key={index}>{item}</li>
        ))}
    </ul>
);

// 8. Fragments (sans wrapper div)
const fragment = (
    <>
        <h1>Titre</h1>
        <p>Contenu</p>
    </>
);
```

### 2.3 Virtual DOM

React optimise le rendu avec le **Virtual DOM**, une représentation en mémoire du DOM réel.

**Processus**
```
1. State/Props change → Nouveau Virtual DOM créé
2. Diff : Comparer ancien vs nouveau Virtual DOM
3. Reconciliation : Calculer changements minimaux
4. Update : Appliquer changements au vrai DOM
```

**Avantages du Virtual DOM**
- Modifications en batch (plus efficace)
- Algorithme de diff optimisé
- Abstraction du DOM réel
- Permet React Native (même logique, rendu différent)

```javascript
// React identifie et met à jour uniquement ce qui change
function Counter() {
    const [count, setCount] = React.useState(0);

    return (
        <div>
            <p>Compteur: {count}</p>
            {/* Seul le paragraphe sera re-rendu au clic */}
            <button onClick={() => setCount(count + 1)}>Incrémenter</button>
        </div>
    );
}
```

### 2.4 Props : Passage de données

Les **props** (propriétés) permettent de passer des données aux composants enfants.

```javascript
// Composant enfant
function Welcome({ nom, age, ville }) {
    return (
        <div>
            <h1>Bonjour {nom}!</h1>
            <p>Âge: {age}</p>
            <p>Ville: {ville}</p>
        </div>
    );
}

// Utilisation - Composant parent
function App() {
    return (
        <>
            <Welcome nom="Alice" age={25} ville="Paris" />
            <Welcome nom="Bob" age={30} ville="Lyon" />
        </>
    );
}

// Props destructuring
function UserCard({ id, name, email, ...otherProps }) {
    return (
        <div>
            <h2>{name}</h2>
            <p>{email}</p>
            {/* otherProps contient d'autres props */}
        </div>
    );
}

// Validation de props (avec PropTypes)
import PropTypes from 'prop-types';

function Greeting({ nom, age }) {
    return <h1>{nom}, {age} ans</h1>;
}

Greeting.propTypes = {
    nom: PropTypes.string.isRequired,
    age: PropTypes.number,
};

Greeting.defaultProps = {
    age: 0,
};

// Enfants comme prop spéciale
function Card({ children, title }) {
    return (
        <div className="card">
            <h2>{title}</h2>
            <div className="card-content">
                {children}
            </div>
        </div>
    );
}

function App() {
    return (
        <Card title="Mon Carte">
            <p>Contenu de la carte</p>
            <button>Action</button>
        </Card>
    );
}
```

### 2.5 Setup avec Create React App

**Create React App** automatise la configuration de React.

```bash
# Installation globale
npm install -g create-react-app

# Créer nouveau projet
npx create-react-app mon-app

# ou moderno (vite)
npm create vite@latest mon-app -- --template react

cd mon-app
npm start
```

**Structure de projet**
```
mon-app/
├── node_modules/
├── public/
│   └── index.html
├── src/
│   ├── index.jsx       # Point d'entrée
│   ├── App.jsx         # Composant principal
│   └── App.css
├── package.json
└── .gitignore
```

**Fichier index.jsx minimal**
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
```

### 2.6 Styles en React

Plusieurs approches pour styler les composants.

```javascript
// 1. Style inline
function StyledButton() {
    const buttonStyle = {
        backgroundColor: "#007BFF",
        color: "white",
        padding: "10px 20px",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer"
    };

    return <button style={buttonStyle}>Cliquer</button>;
}

// 2. Classes CSS (recommandé)
import './Button.css';

function Button() {
    return <button className="btn btn-primary">Cliquer</button>;
}

// 3. CSS Modules
import styles from './Button.module.css';

function Button() {
    return <button className={styles.btn}>Cliquer</button>;
}

// 4. Styled Components (CSS-in-JS)
import styled from 'styled-components';

const StyledButton = styled.button`
    background-color: #007BFF;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
        background-color: #0056b3;
    }
`;

function Button() {
    return <StyledButton>Cliquer</StyledButton>;
}
```

---

## 3. Exemples pratiques

### Exemple 1 : Application Welcome (Depuis le cours)

```javascript
// Reproduire l'exemple du cours
function Welcome(props) {
    return <h1>Bonjour, {props.name}!</h1>;
}

function App() {
    return (
        <div className="container">
            <Welcome name="Alice" />
            <Welcome name="Bob" />
            <Welcome name="Charlie" />
        </div>
    );
}

export default App;
```

### Exemple 2 : Liste d'utilisateurs avec détails

```javascript
function UserList() {
    const users = [
        { id: 1, name: "Alice", email: "alice@example.com", role: "Admin" },
        { id: 2, name: "Bob", email: "bob@example.com", role: "User" },
        { id: 3, name: "Charlie", email: "charlie@example.com", role: "Editor" }
    ];

    return (
        <div className="users-container">
            <h1>Liste d'utilisateurs</h1>
            <table className="users-table">
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Rôle</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <UserRow key={user.id} user={user} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function UserRow({ user }) {
    return (
        <tr className="user-row">
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>
                <span className={`badge badge-${user.role.toLowerCase()}`}>
                    {user.role}
                </span>
            </td>
        </tr>
    );
}

export default UserList;
```

### Exemple 3 : Composant réutilisable Card

```javascript
// Card.jsx - Composant réutilisable
function Card({ title, children, footer, className = "" }) {
    return (
        <div className={`card ${className}`}>
            {title && <div className="card-header">{title}</div>}
            <div className="card-body">
                {children}
            </div>
            {footer && <div className="card-footer">{footer}</div>}
        </div>
    );
}

// App.jsx - Utilisation
function App() {
    return (
        <div className="app">
            <Card
                title="Profil utilisateur"
                className="profile-card"
                footer="Modification: 2026-03-06"
            >
                <h2>Alice Martin</h2>
                <p>Email: alice@example.com</p>
                <p>Département: Développement</p>
            </Card>

            <Card
                title="Produit populaire"
                className="product-card"
            >
                <img src="product.jpg" alt="Produit" />
                <h3>Produit X</h3>
                <p>Description du produit...</p>
                <button className="btn-buy">Acheter</button>
            </Card>
        </div>
    );
}

export default App;
```

---

## 4. Bonnes pratiques

### 4.1 Nommage et organisation

```javascript
// ✓ BON : Noms clairs, Pascal case pour composants
function UserProfileCard({ userId }) {
    // ...
}

// ✗ MAUVAIS : Noms génériques ou camelCase
function component() {
    // ...
}

// ✓ BON : Dossiers organisés par feature
src/
├── components/
│   ├── UserProfile/
│   │   ├── UserProfile.jsx
│   │   ├── UserProfile.css
│   │   └── UserProfile.test.js
│   └── Header/
├── pages/
├── hooks/
└── utils/
```

### 4.2 Clés lors du rendu de listes

```javascript
// ✓ BON : Utiliser ID unique
const items = items.map(item => (
    <Item key={item.id} item={item} />
));

// ✗ MAUVAIS : Utiliser index comme clé
const items = items.map((item, index) => (
    <Item key={index} item={item} />
)); // Problème si la liste change

// ✓ BON : Clés stables
function TodoList({ todos }) {
    return todos.map(todo => (
        <TodoItem
            key={todo.id}
            id={todo.id}
            title={todo.title}
        />
    ));
}
```

### 4.3 Éviter les rendus inutiles

```javascript
// ✓ BON : Composants purs et légers
function UserBadge({ name, role }) {
    return <span className={`badge badge-${role}`}>{name}</span>;
}

// ✗ MAUVAIS : Logique complexe dans render
function UserBadge({ user }) {
    const processedName = user.name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    // ... plus de logique
}

// Mieux : Séparer logique et présentation
function processUserData(user) {
    return user.name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function UserBadge({ user }) {
    const displayName = processUserData(user);
    return <span>{displayName}</span>;
}
```

---

## 5. Comparaison / Alternatives

### React vs autres frameworks

| Aspect | React | Angular | Vue.js | Ember |
|--------|-------|---------|--------|-------|
| Fondateur | Facebook | Google | Evan You | Tilde |
| Approche | Bibliothèque | Framework | Framework | Framework |
| Courbe d'apprentissage | Douce | Raide | Très douce | Raide |
| Performance | Excellent | Bon | Excellent | Bon |
| Taille Bundle | 50KB | 150KB+ | 30KB | 100KB+ |
| Communauté | Énorme | Importante | Croissante | Petite |
| Emplois | Abondant | Abondant | Croissant | Rare |
| JSX | Oui | Non | Optionnel | Non |
| Courbe d'oubli | Haute | Moyenne | Basse | Haute |

**Quand utiliser React**
- Applications complexes et interactives
- Équipes expérimentées
- Besoin de flexibilité
- Écosystème riche (Redux, React Router, etc.)

**Quand utiliser Vue.js**
- Apprentissage rapide important
- Projets de taille petite à moyenne
- Équipes avec peu d'expérience JS
- Documentation prioritaire

**Quand utiliser Angular**
- Grandes applications d'entreprise
- Teams avec expérience TypeScript
- Besoin de structure stricte
- Équipes nombreuses

---

## 6. Ressources externes

### 6.1 Documentation officielle
- **React Official Documentation** - https://react.dev
  - Critique : Excellente refonte en 2023. Documentation moderne, tutoriels progressifs, exemples interactifs. Indispensable comme référence.

### 6.2 Création de projets
- **Create React App** - https://create-react-app.dev/
  - Critique : Setup zero-config, excellent pour débuter. Bien qu'en maintenance réduite, reste viable pour apprentissage. Pour projets modernes, considérer Vite.

- **Vite** - https://vitejs.dev/
  - Critique : Bundler moderne, plus rapide que Create React App. Recommandé pour nouveaux projets.

### 6.3 Tutoriels et Apprentissage
- **React Tutorial** - https://react.dev/learn
  - Critique : Tutoriel progressif excellent. Explique bien JSX, composants, et fondamentaux. Un très bon point de départ.

### 6.4 Tools et DevTools
- **React Developer Tools** (Extension Chrome) - https://chromewebstore.google.com/
  - Critique : Indispensable pour déboguer. Inspection composants, props, state en temps réel.

### 6.5 Community
- **React Subreddit** - https://reddit.com/r/reactjs/
  - Critique : Communauté active. Bonne source d'actualités, questions, best practices.

---

## 7. Points clés à retenir

1. **Composants** : Unités réutilisables d'UI, pierre angulaire de React
2. **JSX** : Extension syntaxique puissante, transpilée en `React.createElement()`
3. **Props** : Passage de données parent → enfant, immuables
4. **Virtual DOM** : Optimisation clé de React, abstraction du DOM réel
5. **Keys** : Essentielles lors de rendu de listes, utiliser IDs stables
6. **Composants purs** : Mêmes props → même rendu, déterministe
7. **Séparation** : Logique métier hors du rendu
8. **Réutilisabilité** : Concevoir composants génériques et composables
9. **Create React App** : Excellente introduction, plus de flexibilité avec Vite/Webpack
10. **Écosystème** : React est une bibliothèque, combiner avec React Router, gestion d'état, etc.

---

## Conclusion

React a révolutionné le développement frontend avec ses composants déclaratifs et son Virtual DOM. Bien que complète seule pour l'UI, elle s'associe avec d'autres bibliothèques (routing, state management) pour former une stack complète.

La maîtrise des fondamentaux (composants, props, JSX, Virtual DOM) est cruciale avant d'explorer des concepts avancés comme les Hooks, Context API et gestion d'état.

React reste le choix dominant en 2026, avec un marché du travail très actif et une communauté dynamique qui continue d'évoluer et d'innover.
