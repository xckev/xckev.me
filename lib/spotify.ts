import type {
  SpotifyTokenResponse,
  SpotifyRecentlyPlayedResponse,
  RecentlyPlayedTrack,
} from "@/types/spotify";
import { getRedis } from "@/lib/redis";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_RECENTLY_PLAYED_URL =
  "https://api.spotify.com/v1/me/player/recently-played";
const SPOTIFY_ACCESS_TOKEN_KEY = "spotify:access-token";

async function getCachedAccessToken(): Promise<string | null> {
  try {
    return await getRedis().get<string>(SPOTIFY_ACCESS_TOKEN_KEY);
  } catch (error) {
    console.warn("Unable to read Spotify access token from Redis:", error);
    return null;
  }
}

async function cacheAccessToken(token: string, expiresInSeconds: number) {
  try {
    const ttl = Math.max(expiresInSeconds - 300, 60);
    await getRedis().setex(SPOTIFY_ACCESS_TOKEN_KEY, ttl, token);
  } catch (error) {
    console.warn("Unable to cache Spotify access token in Redis:", error);
  }
}

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

  await cacheAccessToken(data.access_token, data.expires_in);

  return data.access_token;
}

/**
 * Gets a valid access token (from cache or refreshes)
 */
async function getAccessToken(): Promise<string> {
  const cachedAccessToken = await getCachedAccessToken();
  if (cachedAccessToken) return cachedAccessToken;

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

  if (!data.items || data.items.length === 0) {
    throw new Error("No recently played tracks found");
  }

  const item = data.items[0];
  const track = item.track;

  // Extract smallest album art (usually 64x64 or 300x300)
  const albumArt = track.album.images.reduce((smallest, img) =>
    img.height < smallest.height ? img : smallest
  ).url;

  return {
    name: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    albumArt,
    spotifyUrl: track.external_urls.spotify,
    playedAt: item.played_at,
  };
}
