require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();

// 👉 Racine réelle du projet (portfolio/)
const ROOT_DIR = path.resolve(__dirname, ".."); // remonte de hitster/ vers portfolio/

// 1) JSON body AVANT les routes
app.use(express.json());

// 2) No-cache pour songs.json (pour forcer le reload)
app.use((req, res, next) => {
  if (req.url.includes("songs.json")) {
    res.setHeader("Cache-Control", "no-store");
  }
  next();
});

// 3) API : générer songs.json depuis une playlist
app.post("/api/playlist", async (req, res) => {
  try {
    const { playlistUrl, playlistId } = req.body || {};
    const id = extractSpotifyPlaylistId(playlistUrl) || playlistId;

    if (!id) {
      return res.status(400).json({
        ok: false,
        error: "Playlist Spotify invalide (URL ou ID manquant).",
      });
    }

    // Convertisseur dans: portfolio/hitster/assets/tools/spotify-to-json.mjs
    const modulePath = path.resolve(__dirname, "assets/tools/spotify-to-json.mjs");
    const converter = await import(`file://${modulePath}`);

    const result = await converter.generateSongsJsonFromSpotifyPlaylist(id);

    return res.json({
      ok: true,
      playlistId: id,
      count: result.count,
      savedTo: result.outputPath,
    });
  } catch (e) {
    console.error("POST /api/playlist error:", e);
    return res.status(500).json({ ok: false, error: e.message || "Erreur serveur" });
  }
});

// 4) Static : sert tout le dossier portfolio/ (donc /hitster marche)
app.use(express.static(ROOT_DIR));

app.listen(3000, () => console.log("Serveur lancé sur http://localhost:3000"));

// Helpers
function extractSpotifyPlaylistId(input) {
  if (!input || typeof input !== "string") return null;

  const m1 = input.match(/open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/);
  if (m1?.[1]) return m1[1];

  const m2 = input.match(/spotify:playlist:([a-zA-Z0-9]+)/);
  if (m2?.[1]) return m2[1];

  const raw = input.trim();
  if (/^[a-zA-Z0-9]{16,32}$/.test(raw)) return raw;

  return null;
}
