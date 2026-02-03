# Boucle de Jeu Principale

## Description
La logique centrale du jeu Hitster est gérée par la classe `Game`. Elle orchestre le flux : chargement d'une chanson -> devinette -> vérification -> feedback.

## États du Jeu
La classe maintient l'état courant :
*   `score`: Nombre de bonnes réponses.
*   `lives`: Vies restantes.
*   `currentSong`: L'objet chanson en cours de lecture.

## Flux de Vérification
Lorsqu'un joueur soumet une date (ou place une carte sur la timeline) :
1.  **Comparaison** : L'année de la chanson (`release_date`) est comparée à l'année devinée/choisie.
2.  **Calcul de Delta** : Si l'écart est nul (exact), c'est gagné.
3.  **Feedback Visuel** :
    *   La carte de la chanson se "retourne" ou se révèle.
    *   L'interface joue une animation CSS (succès/échec).
4.  **Conséquence** :
    *   Succès : Incrément du score.
    *   Échec : Décrément d'une vie. Si 0 vie -> Game Over.

## Modularité
Le code sépare la logique (Règles) de l'interface (Manipulation DOM) via l'import de modules utilitaires (`ui.js`, `audio.js`), rendant le code plus testable et maintenable.

## Exemple de code
![alt text](boucle-de-jeu.png)
