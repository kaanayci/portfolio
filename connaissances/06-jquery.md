# jQuery : Manipulation du DOM et Animations — Fiche Technique N°06

> **Thème** : Bibliothèques JavaScript - jQuery | **Dernière mise à jour** : Mars 2026 | **Niveau** : Intermédiaire

---

## 1. Introduction et contexte

jQuery est une bibliothèque JavaScript fondée en 2006 par John Resig, conçue pour simplifier la manipulation du DOM (Document Object Model) et la gestion des événements. Longtemps dominante en développement web, elle offrait une abstraction unifiée sur les incompatibilités entre navigateurs.

### Historique et position actuelle

- **Apogée (2010-2015)** : 70%+ des sites web utilisaient jQuery
- **Déclin progressif (2015-2020)** : Émergence de React, Vue, Angular
- **Position actuelle (2026)** : Toujours présente dans un tiers des sites, mais nouvelles applications privilégient les frameworks modernes
- **Cas d'usage persistants** : Projets legacy, petit DOM dynamique, intégration légère

### Pourquoi jQuery décline mais reste pertinent

**Avantages historiques**
- Syntaxe élégante et expressive
- Compatibilité cross-browser unifié
- Corbe d'apprentissage douce
- Écosystème de plugins riche

**Limitations modernes**
- Complexité croissante des UIs (jQuery génère du spaghetti code)
- Frameworks modernes offrent meilleure organisation
- Taille du bundle (34KB minifiée)
- Virtual DOM plus efficace que manipulation directe

---

## 2. Concepts fondamentaux

### 2.1 Sélecteurs et Traversage du DOM

jQuery simplifie la sélection d'éléments via la fonction `$()`.

```javascript
// Sélecteurs CSS standards
$("#myId"); // Par ID
$(".myClass"); // Par classe
$("div"); // Par tag
$("[data-role='button']"); // Par attribut

// Sélecteurs combinés
$("div.active"); // div avec classe active
$("ul > li"); // enfants directs
$("article ~ section"); // sœurs

// Sélecteurs jQuery spécifiques
$(":visible"); // Éléments visibles
$("input:checked"); // Inputs cochés
$("li:eq(2)"); // Troisième li (index 2)
$("p:contains('texte')"); // Paragraphes contenant 'texte'
$("div:has(.active)"); // Divs contenant .active

// Traversage
$("#container").find(".item"); // Descendants
$(".item").parent(); // Parent direct
$(".item").parents(".section"); // Tous les parents
$(".item").closest(".section"); // Premier parent correspondant
$(".item").next(); // Sœur suivante
$(".item").siblings(); // Toutes les sœurs
```

**Performance**
```javascript
// ✓ BON : Cacher d'abord si modifs multiples
const $items = $("#container").find(".item");
$items.hide();
$items.css("color", "red");
$items.show();

// ✗ MAUVAIS : Rechercher le DOM plusieurs fois
$("#container .item").hide();
$("#container .item").css("color", "red");
$("#container .item").show();
```

### 2.2 Manipulation de Contenu

```javascript
// Lire et modifier le texte
const text = $("#myDiv").text(); // Contenu texte
$("#myDiv").text("Nouveau texte");

// Lire et modifier le HTML
const html = $("#myDiv").html(); // Contenu HTML
$("#myDiv").html("<p>Nouveau <strong>HTML</strong></p>");

// Attributs
const href = $("a").attr("href");
$("a").attr("href", "https://example.com");
$("a").attr({ // Plusieurs attributs
    href: "https://example.com",
    target: "_blank",
    title: "Exemple"
});

// Data attributes
$("#user").data("userId", 123);
const userId = $("#user").data("userId"); // 123

// Valeurs de formulaire
const email = $("#emailInput").val();
$("#emailInput").val("new@example.com");

// Classes CSS
$("#myDiv").addClass("active");
$("#myDiv").removeClass("active");
$("#myDiv").toggleClass("active");
$("#myDiv").hasClass("active"); // true/false
```

### 2.3 Événements

jQuery unifie la gestion des événements entre navigateurs.

```javascript
// Événements simples
$("#submitBtn").click(function() {
    console.log("Cliqué!");
});

$("#emailInput").focus(function() {
    $(this).css("border", "2px solid blue");
});

$("#emailInput").blur(function() {
    $(this).css("border", "1px solid gray");
});

// Événements multiples
$("#myForm")
    .on("submit", function(e) {
        e.preventDefault();
        console.log("Formulaire soumis");
    })
    .on("change", "input", function() {
        console.log("Input changé");
    });

// Event delegation (événements dynamiques)
$("#container").on("click", ".item", function() {
    console.log("Item cliqué:", $(this).text());
});

// Supprimer des événements
$("#btn").off("click");
$(document).off("click", ".item");

// Événements personnalisés
$("#myDiv").on("customEvent", function(event, data) {
    console.log("Événement personnalisé reçu:", data);
});

$("#myDiv").trigger("customEvent", ["Paramètre 1", "Paramètre 2"]);

// Événements spécifiques hover
$("#myDiv").hover(
    function() { console.log("Souris entre"); },
    function() { console.log("Souris sort"); }
);
```

### 2.4 Animations

jQuery fournit une API fluide pour les animations.

```javascript
// Animations basiques
$("#myDiv").animate({
    left: "200px",
    opacity: 0.5,
    width: "300px"
}, 1000); // 1000ms = 1 secondes

// Avec callback
$("#myDiv").animate({
    marginLeft: "100px"
}, 500, function() {
    console.log("Animation terminée");
});

// Animations de dimensions
$("#myDiv").show(300); // Afficher progressivement
$("#myDiv").hide(300); // Cacher progressivement
$("#myDiv").toggle(300); // Basculer

// Fade in/out
$("#myDiv").fadeIn(500);
$("#myDiv").fadeOut(500);
$("#myDiv").fadeToggle(500);
$("#myDiv").fadeTo(500, 0.3); // Fade vers opacité 0.3

// Slide
$("#myDiv").slideDown(500); // Dérouler
$("#myDiv").slideUp(500); // Rouler
$("#myDiv").slideToggle(500); // Basculer

// Chaînage d'animations
$("#myDiv")
    .slideDown(300)
    .delay(500) // Pause 500ms
    .fadeOut(300)
    .callback(function() {
        console.log("Séquence terminée");
    });

// Animation personnalisée avec easing
$("#myDiv").animate(
    { left: "500px" },
    {
        duration: 1000,
        easing: "easeInOutQuad",
        complete: function() { console.log("Fini"); }
    }
);

// Arrêter les animations
$("#myDiv").stop();
$("#myDiv").stop(true, true); // Arrêter et sauter à la fin
```

**Easing courants**
```javascript
// jQuery UI propose des easings avancés
// sans jQuery UI : "linear", "swing" par défaut

$.easing.myEasing = function(x, t, b, c, d) {
    return c * (t / d) + b; // Linéaire
};

$("#myDiv").animate(
    { left: "200px" },
    { duration: 1000, easing: "myEasing" }
);
```

### 2.5 AJAX avec jQuery

jQuery simplifie les requêtes HTTP asynchrones.

```javascript
// $.ajax - complète et configurable
$.ajax({
    url: "/api/utilisateurs",
    type: "GET",
    dataType: "json",
    success: function(data) {
        console.log("Données reçues:", data);
    },
    error: function(xhr, status, error) {
        console.error("Erreur:", error);
    }
});

// $.get - shorthand pour GET
$.get("/api/utilisateurs", function(data) {
    console.log(data);
});

// $.post - shorthand pour POST
$.post("/api/utilisateurs", {
    nom: "Alice",
    email: "alice@example.com"
}, function(response) {
    console.log("Utilisateur créé:", response);
});

// $.getJSON - pour JSON
$.getJSON("/api/utilisateurs", function(data) {
    $.each(data, function(index, user) {
        console.log(user.nom);
    });
});

// Cas réel : formulaire AJAX
$("#userForm").on("submit", function(e) {
    e.preventDefault();

    const formData = $(this).serialize(); // Sérialiser le formulaire

    $.ajax({
        url: "/api/utilisateurs",
        type: "POST",
        data: formData,
        dataType: "json",
        beforeSend: function() {
            $("#submitBtn").prop("disabled", true);
            $("#loadingSpinner").show();
        },
        success: function(response) {
            $("#successMessage").text("Utilisateur créé avec succès!");
            $("#userForm")[0].reset();
        },
        error: function(xhr) {
            const errors = xhr.responseJSON.errors;
            $("#errorMessage").text("Erreur: " + errors[0]);
        },
        complete: function() {
            $("#submitBtn").prop("disabled", false);
            $("#loadingSpinner").hide();
        }
    });
});

// Promesses avec AJAX (jQuery 1.5+)
$.ajax("/api/utilisateurs")
    .done(function(data) {
        console.log("Succès:", data);
    })
    .fail(function(xhr) {
        console.error("Erreur:", xhr.status);
    })
    .always(function() {
        console.log("Requête terminée");
    });
```

### 2.6 jQuery UI

jQuery UI étend jQuery avec des widgets et interactions avancées.

```javascript
// Installation : <script src="jquery-ui.js"></script>

// Draggable - rendre élément draggable
$("#myDiv").draggable({
    axis: "x", // Uniquement horizontal
    containment: "#parent", // Limiter à parent
    start: function() { console.log("Drag commence"); },
    stop: function() { console.log("Drag terminé"); }
});

// Resizable - rendre élément redimensionnable
$("#myDiv").resizable({
    minWidth: 200,
    minHeight: 150,
    handles: "se" // Poignée sud-est
});

// Sortable - réorganiser liste
$("#sortable").sortable({
    items: "> li",
    placeholder: "placeholder",
    update: function(event, ui) {
        console.log("Nouvel ordre:", $(this).sortable("toArray"));
    }
});

// Datepicker - sélecteur de date
$("#datepicker").datepicker({
    dateFormat: "dd/mm/yy",
    minDate: 0,
    onSelect: function(dateText) {
        console.log("Date sélectionnée:", dateText);
    }
});

// Dialog - dialogue modal
$("#dialog").dialog({
    autoOpen: false,
    modal: true,
    buttons: {
        "Confirmer": function() {
            console.log("Confirmé");
            $(this).dialog("close");
        },
        "Annuler": function() {
            $(this).dialog("close");
        }
    }
});

$("#openDialog").click(function() {
    $("#dialog").dialog("open");
});

// Tabs - onglets
$("#tabs").tabs();

// Accordion - accordéon
$("#accordion").accordion({
    heightStyle: "content",
    active: 0
});
```

---

## 3. Exemples pratiques

### Exemple 1 : Carrousel d'Images

```html
<div id="carousel">
    <div class="carousel-container">
        <img src="img1.jpg" class="carousel-slide active" alt="Slide 1">
        <img src="img2.jpg" class="carousel-slide" alt="Slide 2">
        <img src="img3.jpg" class="carousel-slide" alt="Slide 3">
    </div>
    <button id="prevBtn" class="control">Précédent</button>
    <button id="nextBtn" class="control">Suivant</button>
</div>
```

```javascript
(function() {
    const $carousel = $("#carousel");
    const $slides = $carousel.find(".carousel-slide");
    let currentIndex = 0;
    const slideCount = $slides.length;

    function showSlide(index) {
        // Wrapper le index (0 à slideCount-1)
        currentIndex = (index + slideCount) % slideCount;

        $slides.removeClass("active").fadeOut(300);
        $slides.eq(currentIndex).addClass("active").fadeIn(300);

        updateIndicators();
    }

    function updateIndicators() {
        $carousel.find(".indicator").removeClass("active");
        $carousel.find(".indicator").eq(currentIndex).addClass("active");
    }

    // Événements
    $("#nextBtn").click(function() {
        showSlide(currentIndex + 1);
    });

    $("#prevBtn").click(function() {
        showSlide(currentIndex - 1);
    });

    // Navigation au clavier
    $(document).on("keydown", function(e) {
        if (e.key === "ArrowLeft") showSlide(currentIndex - 1);
        if (e.key === "ArrowRight") showSlide(currentIndex + 1);
    });

    // Auto-play
    setInterval(function() {
        showSlide(currentIndex + 1);
    }, 5000);

    // Initialisation
    showSlide(0);
})();
```

### Exemple 2 : Formulaire avec Validation AJAX

```html
<form id="contactForm">
    <input type="text" name="nom" class="required" placeholder="Nom">
    <input type="email" name="email" class="required" placeholder="Email">
    <textarea name="message" class="required" placeholder="Message"></textarea>
    <button type="submit">Envoyer</button>
    <div id="message"></div>
</form>
```

```javascript
$("#contactForm").on("submit", function(e) {
    e.preventDefault();

    // Validation
    let isValid = true;
    $(".required").each(function() {
        if (!$(this).val().trim()) {
            $(this).addClass("error");
            isValid = false;
        } else {
            $(this).removeClass("error");
        }
    });

    if (!isValid) {
        $("#message").html("<span class='error'>Remplissez tous les champs</span>");
        return;
    }

    // AJAX
    $.ajax({
        url: "/api/contact",
        type: "POST",
        data: $(this).serialize(),
        dataType: "json",
        beforeSend: function() {
            $("#message").html("<span class='loading'>Envoi en cours...</span>");
        },
        success: function(response) {
            $("#message").html("<span class='success'>" + response.message + "</span>");
            $("#contactForm")[0].reset();

            // Cacher le message après 3 secondes
            setTimeout(function() {
                $("#message").fadeOut(300);
            }, 3000);
        },
        error: function(xhr) {
            const error = xhr.responseJSON?.error || "Erreur serveur";
            $("#message").html("<span class='error'>" + error + "</span>");
        }
    });
});
```

### Exemple 3 : Liste Dynamique avec Filtrage

```html
<div id="filterWidget">
    <input type="text" id="filterInput" placeholder="Filtrer...">
    <ul id="itemList">
        <li class="item" data-category="tech">JavaScript</li>
        <li class="item" data-category="tech">Python</li>
        <li class="item" data-category="design">UI Design</li>
        <li class="item" data-category="design">UX Design</li>
    </ul>
</div>
```

```javascript
const $filterInput = $("#filterInput");
const $itemList = $("#itemList");
const $items = $itemList.find(".item");

$filterInput.on("keyup", function() {
    const searchTerm = $(this).val().toLowerCase();

    $items.each(function() {
        const $item = $(this);
        const itemText = $item.text().toLowerCase();

        if (itemText.includes(searchTerm)) {
            $item.slideDown(200);
        } else {
            $item.slideUp(200);
        }
    });

    // Feedback si aucun résultat
    if ($itemList.find(".item:visible").length === 0) {
        if (!$("#noResults").length) {
            $itemList.append("<li id='noResults'>Aucun résultat</li>");
        }
    } else {
        $("#noResults").remove();
    }
});

// Tri par catégorie
$(document).on("click", ".categoryBtn", function() {
    const category = $(this).data("category");

    $items.slideUp(200);

    if (category === "all") {
        $items.slideDown(200);
    } else {
        $items.filter(`[data-category="${category}"]`).slideDown(200);
    }
});
```

---

## 4. Bonnes pratiques

### 4.1 Performance et Optimisation

```javascript
// ✓ BON : Cacher le DOM pendant modifications
const $list = $("#myList");
const $clonedList = $list.clone();

$clonedList.find("li").each(function() {
    $(this).append("<span>★</span>");
});

// Remplacer d'un coup
$list.replaceWith($clonedList);

// ✓ BON : Utiliser la délégation d'événements
$("#container").on("click", ".btn", function() {
    // S'applique aux boutons existants et futurs
});

// ✗ MAUVAIS : Attacher à chaque élément
$(".btn").each(function() {
    $(this).click(function() { });
});

// ✓ BON : Cacher initialement pour construire
$dialog = $("<div>").css("display", "none");
// ... ajouter beaucoup d'éléments ...
$dialog.fadeIn(); // Appel unique du rendu

// ✓ BON : Chaîner les opérations
$("#myDiv")
    .addClass("active")
    .slideDown(200)
    .animate({ opacity: 0.5 }, 300);
```

### 4.2 Gestion mémoire

```javascript
// ✓ BON : Nettoyer les références
$("#myDiv").on("click", function() {
    console.log("Cliqué");
});

// Plus tard, supprimer les événements
$("#myDiv").off("click");

// Supprimer du DOM (automatique)
$("#myDiv").remove();

// ✗ MAUVAIS : Laisser les références
$("#myDiv").fadeOut(function() {
    $(this).remove(); // Mieux de faire this.remove() après fade
});
```

### 4.3 Compatibilité asynchrone

```javascript
// ✓ BON : Gérer les états de chargement
$.ajax({
    url: "/api/data",
    beforeSend: function() {
        $("#loading").show();
        $("#button").prop("disabled", true);
    },
    complete: function() {
        $("#loading").hide();
        $("#button").prop("disabled", false);
    }
});

// ✓ BON : Timeout pour requêtes longues
$.ajax({
    url: "/api/data",
    timeout: 5000, // 5 secondes max
    error: function(xhr, status, error) {
        if (status === "timeout") {
            console.error("Requête expirée");
        }
    }
});
```

---

## 5. Comparaison / Alternatives

### jQuery vs approches modernes

| Aspect | jQuery | Vanilla JS | Frameworks (React) |
|--------|--------|-----------|-------------------|
| Sélecteurs | `$("#id")` | `document.querySelector()` | Props, State |
| Événements | `.on("click", fn)` | `.addEventListener()` | onClick={handler} |
| DOM | Chainable, quelques mots | API plus verbeux | Déclaratif, virtuel |
| Apprentissage | Rapide, expressif | Plus détaillé | Courbe plus raide |
| Performance | Moyenne | Rapide | Optimisé |
| Taille | 34 KB | 0 KB (natif) | 50+ KB |
| Cas d'usage | Legacy, petit DOM | Natif, moderne | Grandes applications |

### Migration de jQuery vers Vanilla JS

```javascript
// jQuery
$("#myId").text("Nouveau");

// Vanilla JS
document.getElementById("myId").textContent = "Nouveau";
document.querySelector("#myId").textContent = "Nouveau";

// jQuery
$(".items").addClass("active");

// Vanilla JS
document.querySelectorAll(".items").forEach(el => {
    el.classList.add("active");
});

// jQuery
$("#form").on("submit", function() { });

// Vanilla JS
document.getElementById("form").addEventListener("submit", function() { });
```

---

## 6. Ressources externes

### 6.1 Documentation officielle
- **jQuery Official Documentation** - https://api.jquery.com/
  - Critique : Référence complète et fiable. Excellente structure avec exemples. Indispensable pour chercher la syntaxe exacte.

### 6.2 jQuery UI
- **jQuery UI Widget Library** - https://jqueryui.com/
  - Critique : Collection de widgets prêts à l'emploi avec thèmes. Bien documentée. Cependant, interface datée, préférer les alternatives modernes pour nouveaux projets.

### 6.3 Tutoriels
- **jQuery Learning Center** - https://learn.jquery.com/
  - Critique : Tutoriels progressifs et complets. Bon point de départ. Cependant, certains concepts legacy.

### 6.4 Plugins populaires
- **jQuery Plugins Registry** - https://plugins.jquery.com/
  - Critique : Large écosystème. Qualité inégale. Vérifier la maintenance active avant utilisation.

### 6.5 Alternatives modernes
- **Vanilla JS snippets** - https://vanillalist.top/
  - Critique : Montrer les équivalents modernes à jQuery. Utile pour migration. Encourage l'apprentissage du DOM natif.

---

## 7. Points clés à retenir

1. **Sélecteurs CSS** : jQuery supporte tous les sélecteurs CSS + ses propres variantes
2. **Chaînage** : La force de jQuery, permet un code fluide et expressif
3. **Event delegation** : Utiliser `.on()` sur parent pour éviter les réattachements
4. **AJAX** : Simplifie les requêtes HTTP, même si fetch/axios sont modernes
5. **Animations** : Pratique pour UI interactives simples
6. **Performance** : Chercher le sélecteur une fois et réutiliser
7. **jQuery UI** : Utile pour widgets draggable, datepicker, mais datée
8. **Déclin progressif** : Frameworks modernes offrent meilleure architecture
9. **Cas d'usage actuels** : Legacy, petite interactivité DOM, prototypes rapides
10. **Apprentissage** : Comprendre jQuery aide à comprendre le DOM natif

---

## Conclusion

jQuery reste une bibliothèque importante du web, mais son rôle a changé. Bien que moins utilisée dans les nouveaux projets, la compréhension de jQuery est précieuse pour :

- Maintenir des applications existantes (beaucoup encore en production)
- Comprendre le développement web pré-framework
- Apprendre les fondamentaux du DOM et des événements
- Intégrations légères où un framework serait excessif

Pour les nouveaux développements, les frameworks modernes (React, Vue, Angular) offrent une meilleure organisation et maintenabilité, mais jQuery reste un outil utile pour le prototypage rapide et la maintenance legacy.
