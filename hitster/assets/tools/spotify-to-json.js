/**
 * spotify-to-json.js
 *
 * Objectif (WHY)
 * -------------
 * Convertir une playlist Spotify en fichier JSON statique (`assets/data/songs.json`)
 * afin de l'utiliser dans le jeu Hitster en ligne.
 *
 * Pourquoi du JSON statique ?
 * - Éviter d'appeler Spotify pendant la partie (latence, quotas, dépendance réseau).
 * - Ne pas exposer de secrets Spotify côté navigateur (CLIENT_SECRET).
 * - Rendre le jeu jouable avec une simple lecture de fichier JSON.
 *
 * Comment l'utiliser ?
 * -------------------
 * 1) Créer une app Spotify (Dashboard développeur Spotify)
 * 2) Définir les variables d'environnement (CLIENT_ID / CLIENT_SECRET)
 * 3) Lancer : node spotify-to-json.js <PLAYLIST_ID>
 *
 * Exemple :
 *   node spotify-to-json.js 37i9dQZF1DXcBWIGoYBM5M
 */

import fetch from "node-fetch";
import fs from "fs";
import path from "path";

// ✅ Secrets via variables d'environnement (ne jamais commit dans Git)
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// ✅ Playlist ID via argument CLI pour permettre "partage" (tu passes l'ID)
const PLAYLIST_ID = process.argv[2];

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("❌ SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET manquants (variables d'environnement).");
  process.exit(1);
}

if (!PLAYLIST_ID) {
  console.error("❌ Playlist ID manquant. Usage : node spotify-to-json.js <PLAYLIST_ID>");
  process.exit(1);
}

/**
 * Récupère un token "client credentials" (lecture publique).
 * Limite : ce flux ne permet pas d'accéder aux playlists privées d'un utilisateur.
 * Pour du privé, il faut OAuth "Authorization Code".
 */
async function getToken() {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Token error (${res.status}) : ${txt}`);
  }

  const json = await res.json();
  return json.access_token;
}

/**
 * Spotify renvoie parfois des dates "YYYY", "YYYY-MM", "YYYY-MM-DD".
 * On extrait proprement l'année.
 */
function extractYear(releaseDate) {
  if (!releaseDate) return null;
  const year = parseInt(String(releaseDate).slice(0, 4), 10);
  return Number.isFinite(year) ? year : null;
}

/**
 * Spotify pagine les tracks. On boucle jusqu'à tout récupérer.
 */
async function fetchAllPlaylistTracks(token) {
  const items = [];
  let url = `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks?limit=100`;

  while (url) {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Playlist error (${res.status}) : ${txt}`);
    }

    const data = await res.json();
    items.push(...(data.items || []));
    url = data.next; // null quand fini
  }

  return items;
}

/**
 * Convertit les tracks en "cartes" exploitables par le jeu.
 * On garde uniquement les morceaux avec preview_url (extrait audio),
 * car la mécanique Hitster nécessite un extrait pour jouer.
 */
function toGameSongs(items) {
  return items
    .map((item) => item?.track)
    .filter((track) => track && track.preview_url)
    .map((track) => ({
      title: track.name,
      artist: track.artists.map((a) => a.name).join(", "),
      year: extractYear(track.album?.release_date),
      preview: track.preview_url,
      image: track.album?.images?.[0]?.url ?? null
    }))
    .filter((s) => s.year); // optionnel : enlever les morceaux sans année
}

async function convertPlaylistToJson() {
  const token = await getToken();
  const items = await fetchAllPlaylistTracks(token);
  const songs = toGameSongs(items);

  // Emplacement de sortie utilisé par ton jeu
  const outputPath = path.resolve("./assets/data/songs.json");

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(songs, null, 2), "utf-8");

  console.log(`✅ songs.json généré (${songs.length} morceaux avec preview) → ${outputPath}`);
}

convertPlaylistToJson().catch((err) => {
  console.error("❌ Erreur :", err.message);
  process.exit(1);
});
