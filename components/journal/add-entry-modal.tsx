"use client";

import { useState, useRef } from "react";
import { X, Upload, Image as ImageIcon, Calendar, Type, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { JournalPoster } from "@/types/journal";

interface AddEntryModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AddEntryModal({ onClose, onSuccess }: AddEntryModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [poster, setPoster] = useState<JournalPoster | "">("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Image must be under 8 MB.");
      return;
    }

    setError(null);
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleImageChange(fakeEvent);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) {
      setError("Title and date are required.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("date", date);
      formData.append("notes", notes.trim());
      if (poster) formData.append("poster", poster);
      if (imageFile) formData.append("image", imageFile);

      const res = await fetch("/api/journal/entries", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.error ?? "Failed to save entry. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = `
    w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm
    placeholder:text-muted-foreground/50 outline-none transition-all
    focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500/50
  `;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-4 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="font-bold text-base text-foreground">Add a Memory ❤️</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Type className="h-3 w-3" />
              Title <span className="text-pink-400">*</span>
            </label>
            <input
              id="journal-entry-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. First date at the aquarium"
              maxLength={100}
              className={inputClass}
              required
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              Date <span className="text-pink-400">*</span>
            </label>
            <input
              id="journal-entry-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          {/* Poster */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <User className="h-3 w-3" />
              Posted by <span className="text-pink-400">*</span>
            </label>
            <select
              id="journal-entry-poster"
              value={poster}
              onChange={(e) => setPoster(e.target.value as JournalPoster | "")}
              className={`${inputClass} cursor-pointer`}
              required
            >
              <option value="">— select —</option>
              <option value="Kevin">Kevin</option>
              <option value="Ashley">Ashley</option>
            </select>
          </div>

          {/* Image upload */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <ImageIcon className="h-3 w-3" />
              Photo <span className="text-muted-foreground/60 font-normal">(optional, max 8 MB)</span>
            </label>

            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden aspect-video bg-muted group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div
                id="journal-image-dropzone"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-pink-500/40 rounded-xl p-8
                  flex flex-col items-center gap-2 cursor-pointer transition-colors
                  hover:bg-pink-500/5 text-muted-foreground"
              >
                <Upload className="h-6 w-6" />
                <p className="text-xs text-center">
                  Drag & drop or click to upload
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              id="journal-image-file"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <FileText className="h-3 w-3" />
              Notes <span className="text-muted-foreground/60 font-normal">(optional)</span>
            </label>
            <textarea
              id="journal-entry-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What made this moment special?"
              rows={4}
              className={`${inputClass} resize-none`}
            />
          </div>

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}

          <Button
            id="journal-submit-entry"
            type="submit"
            disabled={submitting || !title.trim() || !date || !poster}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0 shadow-md shadow-pink-500/20"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </span>
            ) : (
              "Save Memory"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
