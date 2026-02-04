# Impression Thermique & CSS Print

## Description
L'application est capable d'imprimer des tickets de caisse formatés spécifiquement pour des imprimantes thermiques (80mm), directement depuis le navigateur.

## Technique CSS (`@media print`)
Plutôt que de générer un PDF ou une image, nous utilisons le moteur de rendu du navigateur avec des règles CSS strictes.

### Stratégie de Visibilité
Lors de l'impression, tout le site est caché, sauf la div du ticket :
```css
@media print {
  body * {
    visibility: hidden; /* Cache tout */
  }
  #printable-ticket, #printable-ticket * {
    visibility: visible; /* Montre le ticket */
  }
  #printable-ticket {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%; /* S'adapte au papier 80mm */
  }
}
```

### Optimisations
*   ** Noir & Blanc** : Suppression des fonds colorés et ombres (les imprimantes thermiques ne gèrent pas le gris/couleur).
*   **Polices** : Utilisation de polices Monospace pour un alignement clair des prix et quantités.
*   **Marges** : Réduites au minimum pour économiser le papier.

## Exemple de code
![alt text](impression-thermique.png)
