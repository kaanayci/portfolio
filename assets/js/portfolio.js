// Liste des fiches techniques
const documents = [
  { title: "Service Worker & PWA", category: "Dashboard", path: "dashboard/fiches-techniques/pwa-service-worker.md" },
  { title: "Intégration Leaflet", category: "Dashboard", path: "dashboard/fiches-techniques/interactivite-carte.md" },
  { title: "Architecture API Audio", category: "Hitster", path: "hitster/fiches-techniques/controle-audio.md" },
  { title: "Boucle de Jeu (Game Loop)", category: "Hitster", path: "hitster/fiches-techniques/boucle-de-jeu.md" },
  { title: "Architecture Vue 3 / Pinia", category: "Restaurant", path: "restaurant/fiches-techniques/gestion-etat-pinia.md" },
  { title: "Impression Thermique & QR", category: "Restaurant", path: "restaurant/fiches-techniques/impression-thermique.md" },
  { title: "Algorithme de Fidélité", category: "Restaurant", path: "restaurant/fiches-techniques/fidelite-algorithme.md" }
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
    
    // Conversion simple MD -> HTML (Pour éviter une lib lourde, on fait du basic regex ou on injecte texte brut)
    // Pour l'évaluation, afficher le texte proprement formatted est suffisant ou utiliser une lib légère comme marked via CDN
    // Ici on va utiliser marked.js via CDN dans le HTML
    
    document.getElementById('markdown-content').innerHTML = marked.parse(text);
    document.getElementById('doc-modal').classList.add('active');
  } catch (e) {
    alert("Erreur de chargement de la fiche : " + e.message);
  }
}

// Fermeture modal
document.querySelector('.close-btn').onclick = () => {
  document.getElementById('doc-modal').classList.remove('active');
};
