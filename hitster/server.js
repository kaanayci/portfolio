require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
app.use(express.static("."));

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;


// Token Spotify
async function getToken() {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  return data.access_token;
}

// Extraire l’ID playlist depuis l’URL
function extractPlaylistId(url) {
  const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

app.get("/api/playlist", async (req, res) => {
  try {
    const token = await getToken();

    const playlistId = req.query.url
      ? extractPlaylistId(req.query.url)
      : "PLAYLIST_PAR_DEFAUT_ID";

    if (!playlistId) {
      return res.status(400).json({ error: "Playlist invalide" });
    }

    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    const songs = data.items
      .filter(item => item.track && item.track.preview_url)
      .map(item => ({
        title: item.track.name,
        artist: item.track.artists[0].name,
        year: item.track.album.release_date.substring(0, 4),
        preview_url: item.track.preview_url,
      }));

    res.json(songs);
  } catch (err) {
    res.status(500).json({ error: "Erreur Spotify" });
  }
});

app.listen(3000, () =>
  console.log("Serveur lancé sur http://localhost:3000")
);

// POST /api/playlist
// Body: { playlistUrl: "https://open.spotify.com/playlist/..." } OU { playlistId: "..." }
app.post("/api/playlist", express.json(), async (req, res) => {
  try {
    const { playlistUrl, playlistId } = req.body || {};

    const id = extractSpotifyPlaylistId(playlistUrl) || playlistId;
    if (!id) {
      return res.status(400).json({ ok: false, error: "Playlist Spotify invalide (URL ou ID manquant)." });
    }

    // IMPORTANT: ton convertisseur est en .mjs (ESM). En CommonJS on utilise import() dynamique.
    const modulePath = path.resolve(__dirname, "assets/tools/spotify-to-json.mjs");
    const converter = await import(`file://${modulePath}`);

    // On suppose que tu vas exporter une fonction depuis spotify-to-json.mjs (voir étape 2)
    const result = await converter.generateSongsJsonFromSpotifyPlaylist(id);

    return res.json({
      ok: true,
      playlistId: id,
      savedTo: result.outputPath,
      count: result.count
    });
  } catch (e) {
    console.error("API /api/playlist error:", e);
    return res.status(500).json({ ok: false, error: e.message || "Erreur serveur" });
  }
});

// Extraction robuste d'ID depuis une URL Spotify playlist
function extractSpotifyPlaylistId(input) {
  if (!input || typeof input !== "string") return null;

  // Ex: https://open.spotify.com/playlist/<ID>?si=...
  const m1 = input.match(/open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/);
  if (m1?.[1]) return m1[1];

  // Ex: spotify:playlist:<ID>
  const m2 = input.match(/spotify:playlist:([a-zA-Z0-9]+)/);
  if (m2?.[1]) return m2[1];

  // Si on reçoit déjà un ID brut
  if (/^[a-zA-Z0-9]{16,32}$/.test(input.trim())) return input.trim();

  return null;
}

