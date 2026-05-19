"use client";

import { useState } from "react";
import { Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { JournalEntry } from "@/types/journal";
import { formatJournalDate } from "@/lib/journal-date";

interface JournalEntryCardProps {
  entry: JournalEntry;
  onDeleted: (id: string) => void;
}

export function JournalEntryCard({ entry, onDeleted }: JournalEntryCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setDeleteError(null);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/journal/entries/${entry._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onDeleted(entry._id);
      } else if (res.status === 401) {
        setDeleteError("Session expired");
      } else if (res.status === 404) {
        setDeleteError("This entry no longer exists.");
      } else {
        setDeleteError("Failed to delete");
      }
    } catch {
      setDeleteError("Network error");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };


  return (
    <article
      id={`journal-entry-${entry._id}`}
      className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      {/* Post header: date + poster + delete */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <Calendar className="h-3.5 w-3.5 text-pink-400" />
            <span className="text-sm text-muted-foreground">
              {formatJournalDate(entry.date)}
            </span>
          </div>
          {entry.poster && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium shrink-0">
              {entry.poster}
            </span>
          )}
        </div>

        <Button
          id={`delete-entry-${entry._id}`}
          variant={confirmDelete ? "destructive" : "ghost"}
          size="icon"
          onClick={handleDelete}
          disabled={deleting}
          className="h-7 w-7 shrink-0"
          title={confirmDelete ? "Tap again to delete" : "Delete memory"}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Image */}
      {entry.imageMimeType && (
        <div className="w-full bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/journal/entries/${entry._id}/image`}
            alt={entry.title}
            className="w-full object-cover max-h-[600px]"
            loading="lazy"
          />
        </div>
      )}

      {/* Post body */}
      <div className="px-5 py-4 space-y-2">
        <h2 className="text-base font-semibold text-foreground leading-snug">
          {entry.title}
        </h2>

        {entry.notes && (
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {entry.notes}
          </p>
        )}
      </div>

      {/* Confirm delete hint */}
      {confirmDelete && !deleteError && (
        <p className="px-5 pb-4 text-xs text-destructive">
          Tap delete again to permanently remove this memory.
        </p>
      )}
      {/* Delete error */}
      {deleteError && (
        <p className="px-5 pb-4 text-xs text-destructive">{deleteError}</p>
      )}
    </article>
  );
}
