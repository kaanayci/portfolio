import fetch from "node-fetch";
import fs from "fs";

const CLIENT_ID = "TON_CLIENT_ID";
const CLIENT_SECRET = "TON_CLIENT_SECRET";
const PLAYLIST_ID = "37i9dQZF1DXcBWIGoYBM5M";

async function getToken() {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " + Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  return (await res.json()).access_token;
}

async function convertPlaylist() {
  const token = await getToken();

  const res = await fetch(
    `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks?limit=100`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  const data = await res.json();

  const songs = data.items
    .map(item => item.track)
    .filter(track => track && track.preview_url)
    .map(track => ({
      title: track.name,
      artist: track.artists.map(a => a.name).join(", "),
      year: parseInt(track.album.release_date),
      preview: track.preview_url,
      image: track.album.images[0]?.url
    }));

  fs.writeFileSync(
    "./assets/data/songs.json",
    JSON.stringify(songs, null, 2)
  );

  console.log("✅ songs.json généré !");
}

convertPlaylist();
