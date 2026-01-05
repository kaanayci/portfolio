/**
 * spotify-to-json.mjs
 * Convertit une playlist Spotify en songs.json pour Hitster,
 * en utilisant iTunes Search API pour obtenir un extrait audio (previewUrl).
 */

import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import "dotenv/config";
import { fileURLToPath } from "url";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const PLAYLIST_ID = process.argv[2];

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "❌ SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET manquants (variables d'environnement)."
  );
  process.exit(1);
}
if (!PLAYLIST_ID) {
  console.error(
    "❌ Playlist ID manquant. Usage : node spotify-to-json.mjs <PLAYLIST_ID>"
  );
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// >>> écrit directement dans hitster/assets/data/songs.json
const outputPath = path.resolve(__dirname, "../data/songs.json");

/** Token Spotify (Client Credentials) : OK pour playlists publiques */
async function getSpotifyToken() {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok)
    throw new Error(`Token error (${res.status}) : ${await res.text()}`);
  return (await res.json()).access_token;
}

function extractYear(releaseDate) {
  if (!releaseDate) return null;
  const year = parseInt(String(releaseDate).slice(0, 4), 10);
  return Number.isFinite(year) ? year : null;
}

/** Récupère tous les tracks d'une playlist Spotify (pagination) */
async function fetchAllPlaylistTracks(token) {
  const items = [];
  let url = `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks?limit=100`;

  while (url) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok)
      throw new Error(`Playlist error (${res.status}) : ${await res.text()}`);

    const data = await res.json();
    items.push(...(data.items || []));
    url = data.next;
  }
  return items;
}

function normalize(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Cherche un extrait audio sur iTunes (previewUrl) à partir (title + artist).
 * iTunes Search API renvoie souvent un résultat "trackName/artistName/previewUrl".
 */
async function fetchItunesPreview(title, artist) {
  const term = encodeURIComponent(`${title} ${artist}`);
  const url = `https://itunes.apple.com/search?term=${term}&media=music&entity=song&limit=5`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  const results = data.results || [];
  if (results.length === 0) return null;

  // Heuristique simple : prendre le meilleur match sur titre + artiste
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

  return {
    audio: best.previewUrl, // <- extrait audio iTunes
    itunesUrl: best.trackViewUrl ?? null,
  };
}

async function convertPlaylistToJson() {
  const token = await getSpotifyToken();
  const items = await fetchAllPlaylistTracks(token);

  const baseSongs = items
    .map((item) => item?.track)
    .filter((t) => t)
    .map((t) => ({
      title: t.name,
      artist: t.artists.map((a) => a.name).join(", "),
      year: extractYear(t.album?.release_date),
      image: t.album?.images?.[0]?.url ?? null,
      spotifyUrl: t.external_urls?.spotify ?? null,
      audio: null,
      itunesUrl: null,
    }))
    .filter((s) => s.year); // optionnel

  console.log(
    `ℹ️ Tracks Spotify trouvés: ${baseSongs.length}. Recherche iTunes previews...`
  );

  // Recherche iTunes en série (simple). Si tu veux optimiser : batch/parallel avec limite.
  let found = 0;
  for (let i = 0; i < baseSongs.length; i++) {
    const s = baseSongs[i];

    // petit boost de matching : on ne cherche que sur le premier artiste
    const mainArtist = s.artist.split(",")[0].trim();

    const it = await fetchItunesPreview(s.title, mainArtist);

    if (it?.audio) {
      s.audio = it.audio;
      s.itunesUrl = it.itunesUrl;
      finalSongs.push(s);
      found++;
    }

    if ((i + 1) % 10 === 0 || i === baseSongs.length - 1) {
      console.log(
        `... ${i + 1}/${baseSongs.length} (previews gardés: ${found})`
      );
    }
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(finalSongs, null, 2), "utf-8");
  console.log(
    `✅ songs.json généré (${finalSongs.length} morceaux avec preview iTunes) → ${outputPath}`
  );
}

convertPlaylistToJson().catch((err) => {
  console.error("❌ Erreur :", err.message);
  process.exit(1);
});
