// Spotify API Response Types
export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface SpotifyArtist {
  name: string;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyAlbum {
  name: string;
  images: SpotifyImage[];
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyTrack {
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  external_urls: {
    spotify: string;
  };
  duration_ms: number;
}

export interface SpotifyPlayHistoryItem {
  track: SpotifyTrack;
  played_at: string;
}

export interface SpotifyRecentlyPlayedResponse {
  items: SpotifyPlayHistoryItem[];
}

// Token Response
export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

// Simplified Response for Client
export interface RecentlyPlayedTrack {
  name: string;
  artist: string;
  albumArt: string;
  spotifyUrl: string;
  playedAt: string;
}

// API Response
export interface SpotifyApiResponse {
  success: boolean;
  data?: RecentlyPlayedTrack;
  error?: string;
}
