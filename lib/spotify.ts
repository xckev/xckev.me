import type {
  SpotifyTokenResponse,
  SpotifyRecentlyPlayedResponse,
  RecentlyPlayedTrack,
} from "@/types/spotify";

// In-memory cache for access token
let cachedAccessToken: string | null = null;
let tokenExpiryTime: number | null = null;

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_RECENTLY_PLAYED_URL =
  "https://api.spotify.com/v1/me/player/recently-played";

/**
 * Refreshes the Spotify access token using the refresh token
 */
async function refreshAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing Spotify credentials in environment variables");
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh token: ${response.status}`);
  }

  const data: SpotifyTokenResponse = await response.json();

  console.log("Access Token Response:");
  console.log(data);

  // Cache token (expires_in is in seconds, convert to ms)
  // Subtract 300s (5 minutes) buffer to refresh before expiry
  cachedAccessToken = data.access_token;
  tokenExpiryTime = Date.now() + (data.expires_in - 300) * 1000;

  return data.access_token;
}

/**
 * Gets a valid access token (from cache or refreshes)
 */
async function getAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (cachedAccessToken && tokenExpiryTime && Date.now() < tokenExpiryTime) {
    return cachedAccessToken;
  }

  // Refresh token if expired or not cached
  return await refreshAccessToken();
}

/**
 * Fetches the most recently played track from Spotify
 */
export async function getRecentlyPlayed(): Promise<RecentlyPlayedTrack> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${SPOTIFY_RECENTLY_PLAYED_URL}?limit=1`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    // Next.js 16 cache control - revalidate every 60 seconds
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Spotify API error: ${response.status}`);
  }

  const data: SpotifyRecentlyPlayedResponse = await response.json();

  console.log("Recently Played Response:");
  console.log(data);

  if (!data.items || data.items.length === 0) {
    throw new Error("No recently played tracks found");
  }

  const item = data.items[0];
  const track = item.track;

  // Extract smallest album art (usually 64x64 or 300x300)
  const albumArt = track.album.images.reduce((smallest, img) =>
    img.height < smallest.height ? img : smallest
  ).url;

   console.log("Track Name: " + track.name);

  return {
    name: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    albumArt,
    spotifyUrl: track.external_urls.spotify,
    playedAt: item.played_at,
  };
}
