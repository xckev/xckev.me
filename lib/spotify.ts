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
const SPOTIFY_TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;
const SPOTIFY_TOKEN_REFRESH_ATTEMPTS = 3;
const SPOTIFY_RETRY_DELAY_MS = 500;

type CachedSpotifyAccessToken = {
  accessToken: string;
  expiresAt: number;
  refreshAfter: number;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isCachedSpotifyAccessToken(
  value: unknown
): value is CachedSpotifyAccessToken {
  return (
    typeof value === "object" &&
    value !== null &&
    "accessToken" in value &&
    "expiresAt" in value &&
    "refreshAfter" in value &&
    typeof value.accessToken === "string" &&
    typeof value.expiresAt === "number" &&
    typeof value.refreshAfter === "number"
  );
}

async function getCachedAccessToken(): Promise<CachedSpotifyAccessToken | null> {
  try {
    const cached = await getRedis().get<unknown>(SPOTIFY_ACCESS_TOKEN_KEY);

    if (typeof cached === "string") {
      return {
        accessToken: cached,
        expiresAt: Date.now() + SPOTIFY_TOKEN_REFRESH_BUFFER_MS,
        refreshAfter: Date.now() + SPOTIFY_TOKEN_REFRESH_BUFFER_MS,
      };
    }

    if (!isCachedSpotifyAccessToken(cached)) return null;

    if (Date.now() >= cached.expiresAt) return null;
    return cached;
  } catch (error) {
    console.warn("Unable to read Spotify access token from Redis:", error);
    return null;
  }
}

async function cacheAccessToken(token: string, expiresInSeconds: number) {
  try {
    const now = Date.now();
    const expiresInMs = expiresInSeconds * 1000;
    const cachedToken: CachedSpotifyAccessToken = {
      accessToken: token,
      expiresAt: now + expiresInMs,
      refreshAfter: now + Math.max(expiresInMs - SPOTIFY_TOKEN_REFRESH_BUFFER_MS, 0),
    };

    await getRedis().setex(
      SPOTIFY_ACCESS_TOKEN_KEY,
      Math.max(expiresInSeconds, 60),
      cachedToken
    );
  } catch (error) {
    console.warn("Unable to cache Spotify access token in Redis:", error);
  }
}

async function getSpotifyErrorMessage(response: Response) {
  const body = await response.text().catch(() => "");
  const detail = body ? `: ${body.slice(0, 250)}` : "";
  return `Failed to refresh token: ${response.status}${detail}`;
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

  for (let attempt = 1; attempt <= SPOTIFY_TOKEN_REFRESH_ATTEMPTS; attempt += 1) {
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

    if (response.ok) {
      const data: SpotifyTokenResponse = await response.json();
      await cacheAccessToken(data.access_token, data.expires_in);
      return data.access_token;
    }

    const errorMessage = await getSpotifyErrorMessage(response);
    if (response.status < 500 || attempt === SPOTIFY_TOKEN_REFRESH_ATTEMPTS) {
      throw new Error(errorMessage);
    }

    console.warn(`${errorMessage}; retrying Spotify token refresh`);
    await sleep(SPOTIFY_RETRY_DELAY_MS * attempt);
  }

  throw new Error("Failed to refresh token");
}

/**
 * Gets a valid access token (from cache or refreshes)
 */
async function getAccessToken(): Promise<string> {
  const cachedAccessToken = await getCachedAccessToken();
  if (cachedAccessToken && Date.now() < cachedAccessToken.refreshAfter) {
    return cachedAccessToken.accessToken;
  }

  try {
    return await refreshAccessToken();
  } catch (error) {
    if (cachedAccessToken && Date.now() < cachedAccessToken.expiresAt) {
      console.warn(
        "Using cached Spotify access token after refresh failure:",
        error
      );
      return cachedAccessToken.accessToken;
    }

    throw error;
  }
}

async function fetchRecentlyPlayed(accessToken: string) {
  return fetch(`${SPOTIFY_RECENTLY_PLAYED_URL}?limit=1`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    // Next.js 16 cache control - revalidate every 60 seconds
    next: { revalidate: 60 },
  });
}

/**
 * Fetches the most recently played track from Spotify
 */
export async function getRecentlyPlayed(): Promise<RecentlyPlayedTrack> {
  const accessToken = await getAccessToken();

  const response = await fetchRecentlyPlayed(accessToken);

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
