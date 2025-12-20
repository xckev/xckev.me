import { NextResponse } from "next/server";
import { getRecentlyPlayed } from "@/lib/spotify";
import type { SpotifyApiResponse } from "@/types/spotify";

export const dynamic = "force-dynamic"; // Disable static optimization
export const runtime = "nodejs"; // Use Node.js runtime for better fetch support

export async function GET() {
  try {
    const track = await getRecentlyPlayed();

    const response: SpotifyApiResponse = {
      success: true,
      data: track,
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    console.error("Error fetching recently played:", error);

    const response: SpotifyApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch recently played track",
    };

    return NextResponse.json(response, {
      status: 500,
      headers: {
        "Cache-Control": "no-cache",
      },
    });
  }
}
