"use client";

import { useEffect, useState } from "react";
import { Music } from "lucide-react";
import Image from "next/image";
import type { RecentlyPlayedTrack } from "@/types/spotify";

export function SpotifyNowPlaying() {
  const [track, setTrack] = useState<RecentlyPlayedTrack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchTrack() {
      try {
        const response = await fetch("/api/spotify/recently-played");
        const data = await response.json();

        if (data.success && data.data) {
          setTrack(data.data);
          setError(false);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Failed to fetch Spotify data:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchTrack();
  }, []);

  // Silent failure - don't show anything if error or loading
  if (loading || error || !track) {
    return null;
  }

  return (
    <a
      href={track.spotifyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 mt-4 p-3 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors group"
    >
      <div className="relative w-12 h-12 rounded overflow-hidden shrink-0 bg-muted">
        <Image
          src={track.albumArt}
          alt={`${track.name} album art`}
          fill
          className="object-cover"
          sizes="48px"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <Music className="h-3 w-3 text-green-500" />
          <span className="text-xs text-muted-foreground">
            Recently played
          </span>
        </div>
        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
          {track.name}
        </p>
        <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
      </div>
    </a>
  );
}
