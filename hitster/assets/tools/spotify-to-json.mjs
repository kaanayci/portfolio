/**
 * spotify-to-json.mjs
 * Convertit une playlist Spotify en songs.json pour Hitster,
 * en utilisant iTunes Search API pour obtenir un extrait audio (previewUrl).
 *
 * - Côté serveur (import): export generateSongsJsonFromSpotifyPlaylist()
 * - Côté CLI: node spotify-to-json.mjs <PLAYLIST_ID>
 */

import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import "dotenv/config";
import { fileURLToPath, pathToFileURL } from "url";

// ✅ Secrets via .env
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error(
    "SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET manquants (variables d'environnement)."
  );
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ écrit dans: hitster/assets/data/songs.json
const outputPath = path.resolve(__dirname, "../data/songs.json");

/** Token Spotify (Client Credentials) : OK pour playlists publiques */
async function getSpotifyToken() {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) throw new Error(`Token error (${res.status}) : ${await res.text()}`);
  return (await res.json()).access_token;
}

function extractYear(releaseDate) {
  if (!releaseDate) return null;
  const year = parseInt(String(releaseDate).slice(0, 4), 10);
  return Number.isFinite(year) ? year : null;
}

/** Récupère tous les tracks d'une playlist Spotify (pagination) */
async function fetchAllPlaylistTracks(token, playlistId) {
  const items = [];
  let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`;

  while (url) {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`Playlist error (${res.status}) : ${await res.text()}`);

    const data = await res.json();
    items.push(...(data.items || []));
    url = data.next;
  }
  return items;
}

function normalize(str) {
  return String(str || "").toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Cherche un extrait audio sur iTunes (previewUrl) à partir (title + artist).
 * Retourne { audio, itunesUrl } ou null.
 */
async function fetchItunesPreview(title, artist) {
  const term = encodeURIComponent(`${title} ${artist}`);
  const url = `https://itunes.apple.com/search?term=${term}&media=music&entity=song&limit=5`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  const results = data.results || [];
  if (results.length === 0) return null;

  const wantedTitle = normalize(title);
  const wantedArtist = normalize(artist);

  const scored = results
    .map((r) => {
      const t = normalize(r.trackName);
      const a = normalize(r.artistName);
      let score = 0;
      if (t === wantedTitle) score += 3;
      if (a === wantedArtist) score += 3;
      if (t.includes(wantedTitle) || wantedTitle.includes(t)) score += 1;
      if (a.includes(wantedArtist) || wantedArtist.includes(a)) score += 1;
      return { r, score };
    })
    .sort((x, y) => y.score - x.score);

  const best = scored[0]?.r;
  if (!best?.previewUrl) return null;

  return { audio: best.previewUrl, itunesUrl: best.trackViewUrl ?? null };
}

/**
 * ✅ Export pour ton serveur: génère songs.json à partir d'une playlist ID
 * Et ne garde QUE les morceaux qui ont un preview iTunes.
 */
export async function generateSongsJsonFromSpotifyPlaylist(playlistId) {
  if (!playlistId) throw new Error("playlistId manquant");

  const token = await getSpotifyToken();
  const items = await fetchAllPlaylistTracks(token, playlistId);

  const baseSongs = items
    .map((item) => item?.track)
    .filter(Boolean)
    .map((t) => ({
      title: t.name,
      artist: t.artists.map((a) => a.name).join(", "),
      year: extractYear(t.album?.release_date),
      image: t.album?.images?.[0]?.url ?? null,
      spotifyUrl: t.external_urls?.spotify ?? null,
      audio: null,
      itunesUrl: null,
    }))
    .filter((s) => s.year);

  console.log(`ℹ️ Spotify tracks: ${baseSongs.length}. Recherche iTunes previews...`);

  const finalSongs = [];
  let found = 0;

  for (let i = 0; i < baseSongs.length; i++) {
    const s = baseSongs[i];

    // boost matching: 1er artiste seulement
    const mainArtist = s.artist.split(",")[0].trim();

    const it = await fetchItunesPreview(s.title, mainArtist);
    if (it?.audio) {
      s.audio = it.audio;
      s.itunesUrl = it.itunesUrl;
      finalSongs.push(s);
      found++;
    }

    if ((i + 1) % 10 === 0 || i === baseSongs.length - 1) {
      console.log(`... ${i + 1}/${baseSongs.length} (previews gardés: ${found})`);
    }
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(finalSongs, null, 2), "utf-8");

  return { count: finalSongs.length, outputPath };
}

/* ---------------- CLI mode (optionnel) ---------------- */

// ✅ Exécuter en CLI uniquement si le fichier est lancé directement
const isDirectRun =
  process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;

if (isDirectRun) {
  const playlistId = process.argv[2];

  if (!playlistId) {
    console.error("❌ Playlist ID manquant. Usage : node spotify-to-json.mjs <PLAYLIST_ID>");
    process.exit(1);
  }

  generateSongsJsonFromSpotifyPlaylist(playlistId)
    .then((r) => console.log(`✅ songs.json généré (${r.count}) → ${r.outputPath}`))
    .catch((e) => {
      console.error("❌ Erreur :", e.message);
      process.exit(1);
    });
}
