// ─── Fiches de connaissances (19 fiches thématiques) ───
const connaissances = [
  { theme: "Fondamentaux du Web", items: [
    { title: "HTML5 : Structure et Sémantique", path: "connaissances/01-html5-semantique.md" },
    { title: "CSS3 : Mise en Forme et Responsive Design", path: "connaissances/02-css3-responsive.md" },
  ]},
  { theme: "Frameworks CSS", items: [
    { title: "Bootstrap : Framework CSS Complet", path: "connaissances/03-bootstrap.md" },
    { title: "Tailwind CSS : Approche Utility-First", path: "connaissances/04-tailwind-css.md" },
  ]},
  { theme: "JavaScript côté client", items: [
    { title: "JavaScript ES6+ : Fondamentaux Modernes", path: "connaissances/05-javascript-es6.md" },
    { title: "jQuery : Manipulation du DOM", path: "connaissances/06-jquery.md" },
    { title: "React : Composants, JSX et Props", path: "connaissances/07-react-fondamentaux.md" },
    { title: "React Avancé : State, Hooks et Gestion d'État", path: "connaissances/08-react-avance.md" },
  ]},
  { theme: "Développement côté serveur", items: [
    { title: "Node.js : Environnement d'Exécution", path: "connaissances/09-nodejs.md" },
    { title: "Express.js : Framework Web", path: "connaissances/10-expressjs.md" },
    { title: "API REST : Conception et Bonnes Pratiques", path: "connaissances/11-api-rest.md" },
  ]},
  { theme: "Accessibilité et SEO", items: [
    { title: "Accessibilité Web : Normes WCAG", path: "connaissances/12-accessibilite-wcag.md" },
    { title: "SEO : Référencement et Optimisation", path: "connaissances/13-seo-referencement.md" },
  ]},
  { theme: "Sécurité et confidentialité", items: [
    { title: "Sécurité : Menaces et Prévention", path: "connaissances/14-securite-web.md" },
    { title: "Authentification et Gestion des Tokens", path: "connaissances/15-authentification-tokens.md" },
    { title: "Confidentialité et RGPD/nLPD", path: "connaissances/16-confidentialite-rgpd.md" },
  ]},
  { theme: "Déploiement, performance et outils", items: [
    { title: "Déploiement et CI/CD", path: "connaissances/17-deploiement-cicd.md" },
    { title: "Optimisation des Performances Web", path: "connaissances/18-performance-web.md" },
    { title: "Outils et Environnement de Développement", path: "connaissances/19-outils-developpement.md" },
  ]},
];

// ─── Documents transversaux (Analyses, Veille & Réflexions) ───
const documents = [
  { title: "Analyse UX/Tech : CFF.ch", category: "Analyse", path: "analyses/site-cff.md" },
  { title: "Analyse UX/Tech : Qoqa.ch", category: "Analyse", path: "analyses/site-qoqa.md" },
  { title: "Veille Technologique 2026", category: "Veille", path: "analyses/veille-technologique.md" },
  { title: "Réflexion de mi-parcours", category: "Réflexion", path: "reflexions/mi-parcours.md" },
  { title: "Bilan final & perspectives", category: "Réflexion", path: "reflexions/bilan-final.md" }
];

// ─── Rendu : Fiches de connaissances (par thème) ───
const connaissancesContainer = document.getElementById('connaissances-list');
connaissances.forEach(group => {
  const section = document.createElement('div');
  section.className = 'theme-group';

  const header = document.createElement('h4');
  header.className = 'theme-header';
  header.textContent = group.theme;
  section.appendChild(header);

  group.items.forEach(fiche => {
    const item = document.createElement('div');
    item.className = 'doc-item';
    item.innerHTML = `
      <div class="doc-meta">
        <span class="tag connaissances">${group.theme}</span>
        <strong>${fiche.title}</strong>
      </div>
      <span>→</span>
    `;
    item.onclick = () => loadMarkdown(fiche.path);
    section.appendChild(item);
  });

  connaissancesContainer.appendChild(section);
});

// ─── Rendu : Documents transversaux ───
const listContainer = document.getElementById('doc-list');
documents.forEach(doc => {
  const item = document.createElement('div');
  item.className = 'doc-item';
  const tagClass = doc.category === 'Réflexion' ? 'tag reflexion' : doc.category === 'Veille' ? 'tag veille' : 'tag';
  item.innerHTML = `
    <div class="doc-meta">
      <span class="${tagClass}">${doc.category}</span>
      <strong>${doc.title}</strong>
    </div>
    <span>→</span>
  `;
  item.onclick = () => loadMarkdown(doc.path);
  listContainer.appendChild(item);
});

// Chargement et affichage MD
async function loadMarkdown(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error("Fichier introuvable");
    const text = await response.text();
    
    // Utilisation de marked.js (chargé via CDN dans index.html)
    document.getElementById('markdown-content').innerHTML = marked.parse(text);
    document.getElementById('doc-modal').classList.add('active');
  } catch (error) {
    console.error(error);
    alert("Erreur lors du chargement du document.");
  }
}

// Fermeture de la modale
document.querySelector('.close-btn').onclick = () => {
  document.getElementById('doc-modal').classList.remove('active');
};

// Fermeture avec Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.getElementById('doc-modal').classList.remove('active');
  }
});
