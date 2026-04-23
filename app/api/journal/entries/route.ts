import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/journal-auth";
import { getJournalDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/journal/entries?page=1&limit=20
 * Returns paginated journal entries sorted by date descending.
 */
export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10))
    );
    const skip = (page - 1) * limit;

    const db = await getJournalDb();
    const collection = db.collection("journal_entries");

    const [entries, total] = await Promise.all([
      collection
        .find({}, { projection: { imageData: 0 } }) // exclude heavy base64 from list view
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(),
    ]);

    return NextResponse.json({
      entries: entries.map((e) => ({
        ...e,
        _id: e._id.toString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Failed to fetch journal entries:", error);
    return NextResponse.json({ error: "Failed to fetch entries" }, { status: 500 });
  }
}

/**
 * POST /api/journal/entries
 * Creates a new journal entry.
 * Body: multipart/form-data with fields: title, date, notes, image (file)
 */
export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const title = formData.get("title") as string | null;
    const date = formData.get("date") as string | null;
    const notes = formData.get("notes") as string | null;
    const poster = formData.get("poster") as string | null;
    const imageFile = formData.get("image") as File | null;

    if (!title?.trim() || !date) {
      return NextResponse.json(
        { error: "Title and date are required" },
        { status: 400 }
      );
    }

    const validPosters = ["Kevin", "Ashley"];
    if (!poster || !validPosters.includes(poster)) {
      return NextResponse.json({ error: "Poster is required (Kevin or Ashley)" }, { status: 400 });
    }

    let imageData: string | null = null;
    let imageMimeType: string | null = null;

    if (imageFile && imageFile.size > 0) {
      // Validate file type
      if (!imageFile.type.startsWith("image/")) {
        return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
      }
      // Limit to 8 MB
      if (imageFile.size > 8 * 1024 * 1024) {
        return NextResponse.json({ error: "Image must be under 8 MB" }, { status: 400 });
      }
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      imageData = buffer.toString("base64");
      imageMimeType = imageFile.type;
    }

    const db = await getJournalDb();
    const collection = db.collection("journal_entries");

    const result = await collection.insertOne({
      title: title.trim(),
      date: new Date(date),
      notes: notes?.trim() ?? "",
      poster: poster ?? null,
      imageData,
      imageMimeType,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { ok: true, id: result.insertedId.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create journal entry:", error);
    return NextResponse.json({ error: "Failed to create entry" }, { status: 500 });
  }
}
