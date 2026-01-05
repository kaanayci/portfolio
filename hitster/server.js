require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();

// 1) Body parser JSON AVANT les routes
app.use(express.json());

// 2) Désactiver le cache pour songs.json (évite de rejouer l’ancien fichier)
app.use((req, res, next) => {
  if (req.url.includes("songs.json")) {
    res.setHeader("Cache-Control", "no-store");
  }
  next();
});

// 3) Route: générer songs.json à partir d’un lien Spotify
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

    // Import dynamique du convertisseur ESM (.mjs)
    const modulePath = path.resolve(__dirname, "assets/tools/spotify-to-json.mjs");
    const converter = await import(`file://${modulePath}`);

    if (typeof converter.generateSongsJsonFromSpotifyPlaylist !== "function") {
      return res.status(500).json({
        ok: false,
        error: "Le module spotify-to-json.mjs n'exporte pas generateSongsJsonFromSpotifyPlaylist().",
      });
    }

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

// 4) Fichiers statiques (après les routes API)
app.use(express.static(__dirname));

app.listen(3000, () => console.log("Serveur lancé sur http://localhost:3000"));

// -------- Helpers --------
function extractSpotifyPlaylistId(input) {
  if (!input || typeof input !== "string") return null;

  // https://open.spotify.com/playlist/<ID>?si=...
  const m1 = input.match(/open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/);
  if (m1?.[1]) return m1[1];

  // spotify:playlist:<ID>
  const m2 = input.match(/spotify:playlist:([a-zA-Z0-9]+)/);
  if (m2?.[1]) return m2[1];

  // ID brut
  const raw = input.trim();
  if (/^[a-zA-Z0-9]{16,32}$/.test(raw)) return raw;

  return null;
}
