export type JournalPoster = "Kevin" | "Ashley";

export interface JournalEntry {
  _id: string;
  title: string;
  date: string;
  notes: string;
  poster: JournalPoster;
  imageMimeType: string | null;
  createdAt: string;
}

