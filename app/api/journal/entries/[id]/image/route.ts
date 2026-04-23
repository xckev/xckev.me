import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/journal-auth";
import { getJournalDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/journal/entries/[id]/image
 * Serves the stored base64 image as a proper binary response.
 * This lets the feed use a normal <img src="..."> URL instead of
 * embedding giant base64 strings in the JSON list response.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return new NextResponse("Invalid ID", { status: 400 });
    }

    const db = await getJournalDb();
    const entry = await db
      .collection("journal_entries")
      .findOne(
        { _id: new ObjectId(id) },
        { projection: { imageData: 1, imageMimeType: 1 } }
      );

    if (!entry || !entry.imageData) {
      return new NextResponse("Not found", { status: 404 });
    }

    const buffer = Buffer.from(entry.imageData, "base64");

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": entry.imageMimeType ?? "image/jpeg",
        "Content-Length": buffer.length.toString(),
        // Cache for 1 hour on client — image content never changes
        "Cache-Control": "private, max-age=3600, immutable",
      },
    });
  } catch (error) {
    console.error("Failed to serve journal image:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
