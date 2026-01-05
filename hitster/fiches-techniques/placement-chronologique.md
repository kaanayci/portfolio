# Jeu de placement chronologique sur une timeline

## Définition
Un jeu de placement chronologique consiste à organiser des éléments
sur une timeline en respectant leur ordre temporel.

## Contexte d’utilisation
Ce type de mécanique est utilisé dans des jeux éducatifs ou ludiques
pour travailler la logique, la chronologie et la prise de décision.

## Implémentation dans le projet
Dans le Music Timeline Game, le joueur doit placer une carte de chanson
dans une timeline en fonction de son année de sortie.
La validation repose sur une comparaison entre l’année de la carte
courante et celles des cartes déjà placées.

La logique est implémentée dans la fonction `checkPlacement()`.

## Exemple de code 
![alt text](placement-chronologique.png)
## Pièges à éviter
- Ne pas gérer les cas limites (début ou fin de timeline)
- Comparer les valeurs sous forme de chaînes au lieu de nombres
- Mélanger la logique de validation et l’affichage

## Analyse personnelle
Cette mécanique m’a permis de comprendre comment traduire une règle de
jeu abstraite en conditions logiques précises en JavaScript.

## Sources
- https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide/Control_flow_and_error_handling
- https://javascript.info/logical-operators
