/**
 * spotify-import.js
 * Import de playlists Spotify directement depuis le navigateur via PKCE OAuth.
 * Aucun serveur requis — fonctionne sur GitHub Pages.
 */

import { SPOTIFY_CLIENT_ID } from './spotify-config.js';

const REDIRECT_URI =
  window.location.origin +
  window.location.pathname.split('?')[0].replace(/\/?$/, '/');

// ─── PKCE Helpers ────────────────────────────────────────────────────────────

function generateCodeVerifier() {
  const array = new Uint8Array(64);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function generateCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// ─── Token Storage ───────────────────────────────────────────────────────────

function storeToken(accessToken, expiresIn) {
  localStorage.setItem('spotify_token', accessToken);
  localStorage.setItem('spotify_token_expiry', String(Date.now() + expiresIn * 1000));
}

function getStoredToken() {
  const token = localStorage.getItem('spotify_token');
  const expiry = parseInt(localStorage.getItem('spotify_token_expiry') ?? '0');
  return token && Date.now() < expiry - 60_000 ? token : null;
}

export function clearSpotifyToken() {
  localStorage.removeItem('spotify_token');
  localStorage.removeItem('spotify_token_expiry');
}

export function hasValidToken() {
  return !!getStoredToken();
}

// ─── Auth Flow ───────────────────────────────────────────────────────────────

export async function initiateSpotifyAuth(playlistUrl) {
  if (!SPOTIFY_CLIENT_ID) {
    throw new Error("SPOTIFY_CLIENT_ID non configuré dans spotify-config.js");
  }
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  sessionStorage.setItem('pkce_verifier', verifier);
  sessionStorage.setItem('pending_playlist', playlistUrl);

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: 'playlist-read-public playlist-read-collaborative',
    code_challenge_method: 'S256',
    code_challenge: challenge,
  });
  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}

async function exchangeCodeForToken(code) {
  const verifier = sessionStorage.getItem('pkce_verifier');
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
    }),
  });
  if (!res.ok) throw new Error(`Échange de token échoué (${res.status})`);
  const data = await res.json();
  storeToken(data.access_token, data.expires_in ?? 3600);
  return data.access_token;
}

/**
 * À appeler au chargement de la page.
 * Retourne l'URL de playlist en attente si on revient d'un redirect Spotify, null sinon.
 */
export async function handleSpotifyCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const error = params.get('error');

  if (error) {
    window.history.replaceState({}, '', window.location.pathname);
    throw new Error(`Auth Spotify refusée : ${error}`);
  }
  if (!code) return null;

  window.history.replaceState({}, '', window.location.pathname);
  await exchangeCodeForToken(code);

  const pending = sessionStorage.getItem('pending_playlist') ?? '';
  sessionStorage.removeItem('pending_playlist');
  sessionStorage.removeItem('pkce_verifier');
  return pending || null;
}

// ─── Spotify API ─────────────────────────────────────────────────────────────

function extractPlaylistId(input) {
  const m1 = input.match(/open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/);
  if (m1?.[1]) return m1[1];
  const m2 = input.match(/spotify:playlist:([a-zA-Z0-9]+)/);
  if (m2?.[1]) return m2[1];
  if (/^[a-zA-Z0-9]{16,32}$/.test(input.trim())) return input.trim();
  return null;
}

async function fetchAllPlaylistTracks(token, playlistId) {
  const items = [];
  let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`;
  while (url) {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (res.status === 401) { clearSpotifyToken(); throw new Error('TOKEN_EXPIRED'); }
    if (!res.ok) throw new Error(`Spotify API error (${res.status})`);
    const data = await res.json();
    items.push(...(data.items ?? []));
    url = data.next;
  }
  return items;
}

// ─── iTunes Search ───────────────────────────────────────────────────────────

function normalize(str) {
  return String(str ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
}

async function fetchItunesPreview(title, artist) {
  try {
    const term = encodeURIComponent(`${title} ${artist}`);
    const res = await fetch(
      `https://itunes.apple.com/search?term=${term}&media=music&entity=song&limit=5`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const wantedTitle = normalize(title);
    const wantedArtist = normalize(artist);
    const scored = (data.results ?? []).map(r => {
      let score = 0;
      const t = normalize(r.trackName);
      const a = normalize(r.artistName);
      if (t === wantedTitle) score += 3;
      if (a === wantedArtist) score += 3;
      if (t.includes(wantedTitle) || wantedTitle.includes(t)) score += 1;
      if (a.includes(wantedArtist) || wantedArtist.includes(a)) score += 1;
      return { r, score };
    }).sort((x, y) => y.score - x.score);
    const best = scored[0]?.r;
    if (!best?.previewUrl) return null;
    return { audio: best.previewUrl, itunesUrl: best.trackViewUrl ?? null };
  } catch {
    return null;
  }
}

// ─── Main Export ─────────────────────────────────────────────────────────────

/**
 * Importe une playlist Spotify, récupère les previews iTunes, stocke dans localStorage.
 * Retourne null si une redirection Spotify est déclenchée (auth nécessaire).
 * Retourne le tableau de chansons en cas de succès.
 */
export async function importPlaylistFromSpotify(playlistUrl, onProgress) {
  let token = getStoredToken();
  if (!token) {
    await initiateSpotifyAuth(playlistUrl);
    return null; // la page va se rediriger
  }

  const playlistId = extractPlaylistId(playlistUrl);
  if (!playlistId) throw new Error("URL ou ID de playlist Spotify invalide.");

  let items;
  try {
    items = await fetchAllPlaylistTracks(token, playlistId);
  } catch (e) {
    if (e.message === 'TOKEN_EXPIRED') {
      await initiateSpotifyAuth(playlistUrl);
      return null;
    }
    throw e;
  }

  const baseSongs = items
    .map(item => item?.track)
    .filter(Boolean)
    .map(t => ({
      title: t.name,
      artist: t.artists.map(a => a.name).join(', '),
      year: t.album?.release_date ? parseInt(t.album.release_date.slice(0, 4), 10) : null,
      image: t.album?.images?.[0]?.url ?? null,
      spotifyUrl: t.external_urls?.spotify ?? null,
      audio: null,
      itunesUrl: null,
    }))
    .filter(s => s.year && Number.isFinite(s.year));

  const finalSongs = [];
  for (let i = 0; i < baseSongs.length; i++) {
    const s = baseSongs[i];
    const it = await fetchItunesPreview(s.title, s.artist.split(',')[0].trim());
    if (it?.audio) {
      s.audio = it.audio;
      s.itunesUrl = it.itunesUrl;
      finalSongs.push(s);
    }
    onProgress?.(i + 1, baseSongs.length, finalSongs.length);
  }

  localStorage.setItem('hitster_custom_songs', JSON.stringify(finalSongs));
  localStorage.setItem('hitster_custom_playlist_id', playlistId);
  return finalSongs;
}

export function getCustomSongs() {
  try {
    const raw = localStorage.getItem('hitster_custom_songs');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearCustomSongs() {
  localStorage.removeItem('hitster_custom_songs');
  localStorage.removeItem('hitster_custom_playlist_id');
}
