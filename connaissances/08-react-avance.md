# React Avancé : State, Hooks et Gestion d'État — Fiche Technique N°08

> **Thème** : Bibliothèques JavaScript - React Avancé | **Dernière mise à jour** : Mars 2026 | **Niveau** : Avancé

---

## 1. Introduction et contexte

La gestion d'état est le cœur des applications React complexes. Alors que les props permettent le flux de données parent → enfant, l'état local gère les données modifiables et réactives. L'introduction des Hooks en React 16.8 a transformé la gestion d'état, le rendant plus flexible et composable.

### Évolution de la gestion d'état en React

- **Avant 2019** : Component state avec classes, Redux obligatoire pour complexité
- **2019 (Hooks)** : useState, useEffect révolutionnent la gestion d'état
- **2020-2021** : Context API mûrit, alternatives à Redux émergent
- **2022-2026** : Hooks dominants, Server Components et concurrent rendering

### Architecture moderne (2026)

```
Composant fonctionnel + Hooks
    ↓
State local (useState)
    ↓
Side effects (useEffect)
    ↓
Context API ou externe (Redux/Zustand)
```

---

## 2. Concepts fondamentaux

### 2.1 useState : Gestion de l'état local

Le Hook `useState` ajoute l'état à des composants fonctionnels.

```javascript
import React, { useState } from 'react';

// Syntaxe de base
function Counter() {
    const [count, setCount] = useState(0);

    return (
        <div>
            <p>Compteur: {count}</p>
            <button onClick={() => setCount(count + 1)}>
                Incrémenter
            </button>
        </div>
    );
}

// Plusieurs états
function UserForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [age, setAge] = useState(0);

    return (
        <form>
            <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nom"
            />
            <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
            />
            <input
                type="number"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value))}
                placeholder="Âge"
            />
        </form>
    );
}

// État objet (meilleur pour données liées)
function UserFormBetter() {
    const [user, setUser] = useState({
        name: "",
        email: "",
        age: 0
    });

    const handleChange = (field, value) => {
        setUser(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <form>
            <input
                value={user.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Nom"
            />
            <input
                value={user.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Email"
            />
            <input
                type="number"
                value={user.age}
                onChange={(e) => handleChange("age", parseInt(e.target.value))}
                placeholder="Âge"
            />
        </form>
    );
}

// État avec initialisation fonctionnelle
function TodoList() {
    // La fonction n'est appelée qu'à la montée
    const [todos, setTodos] = useState(() => {
        const saved = localStorage.getItem("todos");
        return saved ? JSON.parse(saved) : [];
    });

    return (
        <div>
            {todos.map(todo => (
                <div key={todo.id}>{todo.text}</div>
            ))}
        </div>
    );
}
```

### 2.2 useEffect : Effets de bord

Le Hook `useEffect` gère les effets de bord (requêtes API, subscriptions, timers).

```javascript
import React, { useEffect } from 'react';

// Exécuté après chaque rendu
function Component() {
    useEffect(() => {
        console.log("Composant a rendu");
    });

    return <div>Contenu</div>;
}

// Exécuté une seule fois à la montée
function FetchData() {
    const [data, setData] = React.useState(null);

    useEffect(() => {
        async function loadData() {
            const response = await fetch("/api/data");
            const json = await response.json();
            setData(json);
        }

        loadData();
    }, []); // Dépendance vide = exécution unique

    return <div>{data ? JSON.stringify(data) : "Chargement..."}</div>;
}

// Avec dépendances
function UserProfile({ userId }) {
    const [user, setUser] = React.useState(null);

    useEffect(() => {
        // Recharger à chaque changement de userId
        async function loadUser() {
            const response = await fetch(`/api/users/${userId}`);
            const userData = await response.json();
            setUser(userData);
        }

        loadUser();
    }, [userId]); // Re-exécuté si userId change

    return user ? <div>{user.name}</div> : <div>Chargement...</div>;
}

// Cleanup function
function Timer() {
    const [seconds, setSeconds] = React.useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(s => s + 1);
        }, 1000);

        // Cleanup : exécuté avant prochains effet et à la montée
        return () => clearInterval(interval);
    }, []);

    return <div>Secondes: {seconds}</div>;
}

// Multiples effets
function ComplexComponent({ id, shouldRefresh }) {
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(false);

    // Effet 1 : charger données
    useEffect(() => {
        setLoading(true);
        fetch(`/api/items/${id}`)
            .then(r => r.json())
            .then(d => {
                setData(d);
                setLoading(false);
            });
    }, [id]);

    // Effet 2 : logger changements
    useEffect(() => {
        console.log("Données mises à jour:", data);
    }, [data]);

    // Effet 3 : rafraîchir si demandé
    useEffect(() => {
        if (shouldRefresh) {
            // Déclencher rafraîchissement
        }
    }, [shouldRefresh]);

    return <div>{loading ? "..." : data?.title}</div>;
}
```

### 2.3 useContext : Éviter la prop drilling

Le Hook `useContext` accède aux valeurs partagées sans passer par props.

```javascript
import React, { createContext, useContext } from 'react';

// Création du Context
const ThemeContext = createContext();

// Provider (composant parent)
function App() {
    const [theme, setTheme] = React.useState("light");

    const value = {
        theme,
        toggleTheme: () => setTheme(t => t === "light" ? "dark" : "light")
    };

    return (
        <ThemeContext.Provider value={value}>
            <Header />
            <Content />
            <Footer />
        </ThemeContext.Provider>
    );
}

// Utilisation du Context
function Header() {
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <header style={{
            backgroundColor: theme === "light" ? "#fff" : "#333",
            color: theme === "light" ? "#000" : "#fff"
        }}>
            <button onClick={toggleTheme}>Changer thème</button>
        </header>
    );
}

// Context avec plusieurs valeurs
const UserContext = createContext();

function UserProvider({ children }) {
    const [user, setUser] = React.useState(null);
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);

    const login = async (email, password) => {
        const response = await fetch("/api/login", {
            method: "POST",
            body: JSON.stringify({ email, password })
        });
        const userData = await response.json();
        setUser(userData);
        setIsLoggedIn(true);
    };

    const logout = () => {
        setUser(null);
        setIsLoggedIn(false);
    };

    return (
        <UserContext.Provider value={{
            user,
            isLoggedIn,
            login,
            logout
        }}>
            {children}
        </UserContext.Provider>
    );
}

// Hook personnalisé pour accéder au context
function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser doit être utilisé dans UserProvider");
    }
    return context;
}

// Utilisation
function LoginButton() {
    const { isLoggedIn, login, logout } = useUser();

    return isLoggedIn
        ? <button onClick={logout}>Déconnexion</button>
        : <button onClick={() => login("user@ex.com", "pwd")}>Connexion</button>;
}
```

### 2.4 useReducer : État complexe

Le Hook `useReducer` gère un état avec transitions complexes.

```javascript
import React, { useReducer } from 'react';

// Reducer : logique d'état centralisée
function counterReducer(state, action) {
    switch (action.type) {
        case 'INCREMENT':
            return { count: state.count + 1 };
        case 'DECREMENT':
            return { count: state.count - 1 };
        case 'RESET':
            return { count: 0 };
        default:
            return state;
    }
}

// Composant utilisant useReducer
function Counter() {
    const [state, dispatch] = useReducer(counterReducer, { count: 0 });

    return (
        <div>
            <p>Compteur: {state.count}</p>
            <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
            <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
            <button onClick={() => dispatch({ type: 'RESET' })}>Reset</button>
        </div>
    );
}

// Cas réel : TodoApp (du cours)
function todoReducer(todos, action) {
    switch (action.type) {
        case 'ADD':
            return [...todos, {
                id: Date.now(),
                text: action.payload,
                completed: false
            }];
        case 'REMOVE':
            return todos.filter(t => t.id !== action.payload);
        case 'TOGGLE':
            return todos.map(t =>
                t.id === action.payload
                    ? { ...t, completed: !t.completed }
                    : t
            );
        case 'UPDATE':
            return todos.map(t =>
                t.id === action.payload.id
                    ? { ...t, text: action.payload.text }
                    : t
            );
        default:
            return todos;
    }
}

function TodoApp() {
    const [todos, dispatch] = useReducer(todoReducer, []);
    const [input, setInput] = React.useState("");

    const handleAddTodo = () => {
        if (input.trim()) {
            dispatch({ type: 'ADD', payload: input });
            setInput("");
        }
    };

    return (
        <div className="todo-app">
            <h1>Liste de tâches</h1>

            <div className="input-group">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
                    placeholder="Ajouter une tâche..."
                />
                <button onClick={handleAddTodo}>Ajouter</button>
            </div>

            <ul className="todo-list">
                {todos.map(todo => (
                    <TodoItem
                        key={todo.id}
                        todo={todo}
                        onToggle={() => dispatch({
                            type: 'TOGGLE',
                            payload: todo.id
                        })}
                        onRemove={() => dispatch({
                            type: 'REMOVE',
                            payload: todo.id
                        })}
                    />
                ))}
            </ul>

            <div className="stats">
                <p>Total: {todos.length}</p>
                <p>Complétées: {todos.filter(t => t.completed).length}</p>
            </div>
        </div>
    );
}

function TodoItem({ todo, onToggle, onRemove }) {
    return (
        <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <input
                type="checkbox"
                checked={todo.completed}
                onChange={onToggle}
            />
            <span>{todo.text}</span>
            <button onClick={onRemove}>Supprimer</button>
        </li>
    );
}

export default TodoApp;
```

### 2.5 Hooks personnalisés

Créer des hooks réutilisables pour logique partagée.

```javascript
import React, { useState, useEffect } from 'react';

// Hook personnalisé : useLocalStorage
function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue];
}

// Hook personnalisé : useFetch
function useFetch(url) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const json = await response.json();
                if (isMounted) {
                    setData(json);
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.message);
                    setLoading(false);
                }
            }
        }

        fetchData();

        return () => { isMounted = false; }; // Cleanup
    }, [url]);

    return { data, loading, error };
}

// Hook personnalisé : useForm
function useForm(initialValues, onSubmit) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setValues(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(values);
    };

    const reset = () => setValues(initialValues);

    return {
        values,
        errors,
        handleChange,
        handleSubmit,
        reset,
        setValues
    };
}

// Utilisation
function LoginForm() {
    const { values, handleChange, handleSubmit } = useForm(
        { email: "", password: "" },
        async (data) => {
            const response = await fetch("/api/login", {
                method: "POST",
                body: JSON.stringify(data)
            });
            console.log("Connexion réussie");
        }
    );

    return (
        <form onSubmit={handleSubmit}>
            <input
                name="email"
                value={values.email}
                onChange={handleChange}
                placeholder="Email"
            />
            <input
                name="password"
                type="password"
                value={values.password}
                onChange={handleChange}
                placeholder="Mot de passe"
            />
            <button type="submit">Se connecter</button>
        </form>
    );
}
```

### 2.6 Gestion d'état globale

Au-delà de Context API pour applications complexes.

```javascript
// Option 1 : Redux (paradigme traditionnel)
// Action, Reducer, Store
// Verbose mais très prévisible

// Option 2 : Zustand (moderne, minimaliste)
import create from 'zustand';

const useStore = create((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 }))
}));

function Counter() {
    const count = useStore((state) => state.count);
    const increment = useStore((state) => state.increment);

    return (
        <div>
            <p>{count}</p>
            <button onClick={increment}>+</button>
        </div>
    );
}

// Option 3 : Jotai (atomique)
import { atom, useAtom } from 'jotai';

const countAtom = atom(0);

function Counter() {
    const [count, setCount] = useAtom(countAtom);

    return (
        <div>
            <p>{count}</p>
            <button onClick={() => setCount(count + 1)}>+</button>
        </div>
    );
}

// Option 4 : Context API + useReducer (gratuit, suffisant pour petit projet)
// Voir section 2.3 et 2.4
```

---

## 3. Exemples pratiques

### Exemple 1 : TodoApp Complète (Cours)

```javascript
import React, { useReducer, useState } from 'react';
import './TodoApp.css';

// Reducer
function todoReducer(todos, action) {
    switch (action.type) {
        case 'ADD':
            return [...todos, {
                id: Date.now(),
                text: action.payload,
                completed: false,
                createdAt: new Date()
            }];
        case 'REMOVE':
            return todos.filter(t => t.id !== action.payload);
        case 'TOGGLE':
            return todos.map(t =>
                t.id === action.payload
                    ? { ...t, completed: !t.completed }
                    : t
            );
        case 'EDIT':
            return todos.map(t =>
                t.id === action.payload.id
                    ? { ...t, text: action.payload.text }
                    : t
            );
        case 'CLEAR_COMPLETED':
            return todos.filter(t => !t.completed);
        default:
            return todos;
    }
}

function TodoApp() {
    const [todos, dispatch] = useReducer(todoReducer, []);
    const [input, setInput] = useState("");
    const [filter, setFilter] = useState('all');

    const handleAddTodo = () => {
        if (input.trim()) {
            dispatch({ type: 'ADD', payload: input });
            setInput("");
        }
    };

    const filteredTodos = todos.filter(todo => {
        if (filter === 'completed') return todo.completed;
        if (filter === 'active') return !todo.completed;
        return true;
    });

    const stats = {
        total: todos.length,
        completed: todos.filter(t => t.completed).length,
        active: todos.filter(t => !t.completed).length
    };

    return (
        <div className="todo-app">
            <header className="todo-header">
                <h1>Ma Liste de Tâches</h1>
                <p>Organisez votre journée efficacement</p>
            </header>

            <div className="todo-input-group">
                <input
                    className="todo-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
                    placeholder="Ajouter une nouvelle tâche..."
                />
                <button className="todo-btn-add" onClick={handleAddTodo}>
                    Ajouter
                </button>
            </div>

            <div className="todo-filters">
                <button
                    className={filter === 'all' ? 'active' : ''}
                    onClick={() => setFilter('all')}
                >
                    Toutes ({stats.total})
                </button>
                <button
                    className={filter === 'active' ? 'active' : ''}
                    onClick={() => setFilter('active')}
                >
                    Actives ({stats.active})
                </button>
                <button
                    className={filter === 'completed' ? 'active' : ''}
                    onClick={() => setFilter('completed')}
                >
                    Terminées ({stats.completed})
                </button>
            </div>

            <div className="todo-list">
                {filteredTodos.length === 0 ? (
                    <p className="todo-empty">Aucune tâche</p>
                ) : (
                    filteredTodos.map(todo => (
                        <TodoItem
                            key={todo.id}
                            todo={todo}
                            onToggle={() => dispatch({
                                type: 'TOGGLE',
                                payload: todo.id
                            })}
                            onRemove={() => dispatch({
                                type: 'REMOVE',
                                payload: todo.id
                            })}
                        />
                    ))
                )}
            </div>

            {stats.completed > 0 && (
                <button
                    className="todo-btn-clear"
                    onClick={() => dispatch({ type: 'CLEAR_COMPLETED' })}
                >
                    Effacer complétées
                </button>
            )}
        </div>
    );
}

function TodoItem({ todo, onToggle, onRemove }) {
    return (
        <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <input
                type="checkbox"
                checked={todo.completed}
                onChange={onToggle}
                className="todo-checkbox"
            />
            <span className="todo-text">{todo.text}</span>
            <button
                className="todo-btn-remove"
                onClick={onRemove}
                aria-label="Supprimer"
            >
                ✕
            </button>
        </div>
    );
}

export default TodoApp;
```

### Exemple 2 : Panier d'achat avec Context

```javascript
import React, { createContext, useContext, useReducer } from 'react';

// Context
const CartContext = createContext();

// Reducer
function cartReducer(state, action) {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existing = state.items.find(i => i.id === action.payload.id);
            return {
                ...state,
                items: existing
                    ? state.items.map(i =>
                        i.id === action.payload.id
                            ? { ...i, quantity: i.quantity + 1 }
                            : i
                    )
                    : [...state.items, { ...action.payload, quantity: 1 }]
            };
        }
        case 'REMOVE_ITEM':
            return {
                ...state,
                items: state.items.filter(i => i.id !== action.payload)
            };
        case 'UPDATE_QUANTITY':
            return {
                ...state,
                items: state.items.map(i =>
                    i.id === action.payload.id
                        ? { ...i, quantity: Math.max(1, action.payload.quantity) }
                        : i
                )
            };
        case 'CLEAR':
            return { ...state, items: [] };
        default:
            return state;
    }
}

// Provider
export function CartProvider({ children }) {
    const [state, dispatch] = useReducer(cartReducer, { items: [] });

    const value = {
        items: state.items,
        addItem: (item) => dispatch({ type: 'ADD_ITEM', payload: item }),
        removeItem: (id) => dispatch({ type: 'REMOVE_ITEM', payload: id }),
        updateQuantity: (id, quantity) =>
            dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } }),
        clear: () => dispatch({ type: 'CLEAR' }),
        total: state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Hook
export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart doit être utilisé dans CartProvider");
    }
    return context;
}

// Utilisation
function ProductCard({ product }) {
    const { addItem } = useCart();

    return (
        <div className="product-card">
            <h3>{product.name}</h3>
            <p>{product.price}€</p>
            <button onClick={() => addItem(product)}>
                Ajouter au panier
            </button>
        </div>
    );
}

function Cart() {
    const { items, removeItem, updateQuantity, total, clear } = useCart();

    return (
        <div className="cart">
            <h2>Panier ({items.length} articles)</h2>
            {items.map(item => (
                <div key={item.id} className="cart-item">
                    <span>{item.name}</span>
                    <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                            updateQuantity(item.id, parseInt(e.target.value))
                        }
                    />
                    <span>{(item.price * item.quantity).toFixed(2)}€</span>
                    <button onClick={() => removeItem(item.id)}>✕</button>
                </div>
            ))}
            <div className="cart-total">Total: {total.toFixed(2)}€</div>
            <button onClick={clear}>Vider le panier</button>
        </div>
    );
}
```

---

## 4. Bonnes pratiques

### 4.1 Règles des Hooks

```javascript
// ✓ BON : Hooks au niveau top du composant
function GoodComponent() {
    const [count, setCount] = React.useState(0);
    const theme = React.useContext(ThemeContext);

    return <div>{count}</div>;
}

// ✗ MAUVAIS : Hooks conditionnels
function BadComponent({ shouldUseState }) {
    if (shouldUseState) {
        const [count, setCount] = React.useState(0); // ERREUR!
    }
    return <div></div>;
}

// ✗ MAUVAIS : Hooks dans boucles
function BadComponent() {
    for (let i = 0; i < 5; i++) {
        const [state, setState] = React.useState(i); // ERREUR!
    }
    return <div></div>;
}
```

### 4.2 Dépendances useEffect

```javascript
// ✓ BON : Dépendances précises
useEffect(() => {
    fetchUser(userId);
}, [userId]); // Re-exécuté si userId change

// ✗ MAUVAIS : Dépendances manquantes
useEffect(() => {
    console.log(userId); // Alerte ESLint
}, []); // Jamais re-exécuté

// ✓ BON : Cleanup si nécessaire
useEffect(() => {
    const timer = setInterval(() => {}, 1000);
    return () => clearInterval(timer); // Cleanup
}, []);
```

### 4.3 Optimisation performance

```javascript
// ✓ BON : useCallback pour callbacks stables
function Parent() {
    const [count, setCount] = React.useState(0);

    const handleClick = React.useCallback(() => {
        setCount(c => c + 1);
    }, []);

    return <Child onClick={handleClick} />;
}

// ✓ BON : React.memo pour composants purs
const MemoChild = React.memo(function Child({ value }) {
    console.log("Child rendu");
    return <div>{value}</div>;
});

// ✓ BON : useMemo pour calculs coûteux
function Component({ items }) {
    const expensive = React.useMemo(() => {
        return items.filter(/* ... */).map(/* ... */);
    }, [items]);

    return <div>{expensive}</div>;
}
```

---

## 5. Comparaison / Alternatives

### Gestion d'état : Options comparées

| Aspect | Context + useState | Redux | Zustand | Jotai | MobX |
|--------|-------------------|-------|---------|-------|------|
| Apprentissage | Très facile | Difficile | Facile | Moyen | Moyen |
| Boilerplate | Moyen | Élevé | Minimal | Minimal | Faible |
| Scalabilité | Moyen | Excellent | Bon | Bon | Bon |
| Devtools | Basique | Excellent | Bon | Moyen | Excellent |
| Bundle size | 0 KB | 60 KB | 3 KB | 2 KB | 20 KB |
| Décentralisé | Non | Non | Oui (atoms) | Oui (atoms) | Oui |
| Async | Complexe | Middleware | Intégré | Intégré | Facile |
| Utilisateurs | Tous | Entreprise | Startups | Modernes | Niche |

**Choix recommandé par cas d'usage**
- **Petit projet** : useState local + Context API
- **Moyen projet** : Context + useReducer
- **Complexe** : Redux ou Zustand
- **Moderne, réactif** : Jotai ou Recoil

---

## 6. Ressources externes

### 6.1 Documentation officielle
- **React Hooks Documentation** - https://react.dev/reference/react/hooks
  - Critique : Excellente documentation officielle avec exemples interactifs. Indispensable pour maîtriser les Hooks.

### 6.2 État avancé
- **Redux Toolkit** - https://redux-toolkit.js.org/
  - Critique : Simplifie Redux, meilleure que Redux pur. Bon pour applications d'entreprise.

- **Zustand** - https://github.com/pmndrs/zustand
  - Critique : Alternative moderne à Redux. Minimaliste, performant. Excellent choix 2026.

### 6.3 Tutoriels
- **React Hooks Tutorial** - https://beta.reactjs.org/reference/react
  - Critique : Guide complet des Hooks avec exemples. Bien structuré, progressif.

### 6.4 Performance
- **React.memo, useMemo, useCallback** - Dans docs officielles
  - Critique : Comprendre quand les utiliser est crucial. Over-optimization est anti-pattern courant.

---

## 7. Points clés à retenir

1. **useState** : Fondamental pour état local dans composants fonctionnels
2. **useEffect** : Gère effets de bord et side effects, attention aux dépendances
3. **useContext** : Évite prop drilling mais peut compliquer le flux de données
4. **useReducer** : Préférer pour état complexe avec transitions multiples
5. **Hooks personnalisés** : Réutiliser logique complexe entre composants
6. **Context API** : Suffisant pour petit-moyen état global (thème, user)
7. **Redux/Zustand** : Nécessaire si état devient trop complexe
8. **Cleanup** : Toujours nettoyer timers, subscriptions dans useEffect
9. **Performance** : Ne pas over-optimiser, profiler avant
10. **Composition** : Préférer petits composants réutilisables

---

## Conclusion

La maîtrise des Hooks et de la gestion d'état est cruciale pour développer des applications React modernes. Bien que React offre plusieurs approches, les principes fondamentaux (composants purs, unidirectional data flow, séparation concerns) restent constants.

L'écosystème a mûri, offrant maintenant des solutions variées du contexte intégré aux bibliothèques externes. Le choix dépend de la complexité et des besoins spécifiques du projet.

En 2026, les Hooks sont le standard incontournable, et la compréhension de l'architecture d'état est aussi importante que la syntaxe React elle-même.
