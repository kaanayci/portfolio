# Interaction utilisateur par zones cliquables

## Définition
Les zones cliquables permettent à l’utilisateur d’interagir avec
une application via des événements déclenchés par le clic.

## Contexte d’utilisation
Cette approche est utilisée lorsque le drag & drop n’est pas encore
implémenté ou lorsque l’on souhaite une interaction simple et fiable.

## Implémentation dans le projet
Dans le Music Timeline Game, des zones (`drop-zone`) sont générées
dynamiquement entre les cartes de la timeline.
Chaque zone déclenche une fonction de validation lorsqu’elle est cliquée.

## Exemple de code
![alt text](interaction-zone-cliquable.png)
## Pièges à éviter
- Ne pas désactiver les zones après la fin du jeu
- Ne pas donner de feedback visuel
- Attacher les événements de manière statique

## Analyse personnelle
Cette solution m’a permis de créer une interaction claire sans complexité
excessive, tout en préparant le terrain pour une future version en drag & drop.

## Sources
- https://developer.mozilla.org/fr/docs/Web/API/EventTarget/addEventListener
- https://developer.mozilla.org/fr/docs/Web/API/Element/click_event
