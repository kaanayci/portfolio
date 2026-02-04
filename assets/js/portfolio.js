// Liste des documents transversaux (Analyses & Veille)
const documents = [
  { title: "Analyse UX/Tech : CFF.ch", category: "Analyse", path: "analyses/site-cff.md" },
  { title: "Analyse UX/Tech : Qoqa.ch", category: "Analyse", path: "analyses/site-qoqa.md" },
  { title: "Veille Technologique 2026", category: "Veille", path: "analyses/veille-technologique.md" }
];

// Rendu de la liste
const listContainer = document.getElementById('doc-list');
documents.forEach(doc => {
  const item = document.createElement('div');
  item.className = 'doc-item';
  item.innerHTML = `
    <div class="doc-meta">
      <span class="tag">${doc.category}</span>
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
document.querySelector('.close-modal').onclick = () => {
  document.getElementById('doc-modal').classList.remove('active');
};

// Fermeture avec Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.getElementById('doc-modal').classList.remove('active');
  }
});
