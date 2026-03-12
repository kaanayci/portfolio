/**
 * Configuration Spotify côté client.
 * CLIENT_ID est un identifiant public — safe à committer.
 * CLIENT_SECRET n'est jamais ici (reste dans .env côté serveur / GitHub Secrets).
 *
 * Pour trouver ton CLIENT_ID :
 *   https://developer.spotify.com/dashboard → ton app → "Client ID"
 *
 * Redirect URIs à ajouter dans le dashboard Spotify :
 *   http://localhost:3000/hitster/
 *   https://kaanayci.github.io/portfolio/hitster/
 */
export const SPOTIFY_CLIENT_ID = "246d790f8e444b319176f8d05c119230";
