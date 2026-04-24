"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JournalEntryCard } from "./journal-entry-card";
import { AddEntryModal } from "./add-entry-modal";
import type { JournalEntry } from "@/types/journal";


interface PaginatedResponse {
  entries: JournalEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const FEED_LIMIT = 10;

export function JournalView() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchPage = useCallback(async (p: number, append: boolean) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/journal/entries?page=${p}&limit=${FEED_LIMIT}`);
      if (res.status === 401) {
        setError("Your session has expired — refresh the page to log back in.");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? `Server error (${res.status}) — please try again.`);
        return;
      }
      const data: PaginatedResponse = await res.json();

      setEntries((prev) => (append ? [...prev, ...data.entries] : data.entries));
      setTotal(data.total);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch {
      setError("Could not reach the server — check your connection and try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPage(1, false);
  }, [fetchPage]);

  const handleLoadMore = () => {
    if (page < totalPages && !loadingMore) {
      fetchPage(page + 1, true);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/journal", { method: "DELETE" });
    window.location.reload();
  };

  const handleEntryDeleted = (id: string) => {
    setEntries((prev) => prev.filter((e) => e._id !== id));
    setTotal((prev) => prev - 1);
  };

  const handleEntryAdded = () => {
    setShowAddModal(false);
    // Reload from scratch so the new entry appears at the top
    setPage(1);
    fetchPage(1, false);
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
              Ashley & Kevin ❤️
            </h1>
            {!loading && (
              <p className="text-xs text-muted-foreground">{total} {total === 1 ? "memory" : "memories"}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              id="add-journal-entry-btn"
              onClick={() => setShowAddModal(true)}
              size="sm"
              className="gap-1.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0 shadow-sm shadow-pink-500/20"
            >
              <Plus className="h-4 w-4" />
              Add Memory
            </Button>
            <Button
              id="journal-logout-btn"
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Lock journal"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pt-6 space-y-6">
        {/* Initial loading skeletons */}
        {loading && (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-card border border-border overflow-hidden animate-pulse"
              >
                <div className="px-5 py-4 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-muted" />
                  <div className="h-3 w-36 bg-muted rounded" />
                </div>
                <div className="w-full aspect-[4/3] bg-muted" />
                <div className="px-5 py-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-4/5" />
                </div>
              </div>
            ))}
          </>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-sm mb-4">{error}</p>
            <Button variant="outline" size="sm" onClick={() => fetchPage(1, false)}>
              Try again
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && entries.length === 0 && (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">💕</p>
            <p className="text-muted-foreground text-sm mb-6">
              No memories yet. Add your first one!
            </p>
            <Button
              onClick={() => setShowAddModal(true)}
              size="sm"
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Memory
            </Button>
          </div>
        )}

        {/* Feed */}
        {!loading && entries.map((entry) => (
          <JournalEntryCard
            key={entry._id}
            entry={entry}
            onDeleted={handleEntryDeleted}
          />
        ))}

        {/* Load more */}
        {!loading && page < totalPages && (
          <div className="flex justify-center py-4">
            <Button
              id="journal-load-more"
              variant="outline"
              size="sm"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="gap-2"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Loading…
                </>
              ) : (
                "Load older memories"
              )}
            </Button>
          </div>
        )}

        {/* End of feed */}
        {!loading && entries.length > 0 && page >= totalPages && (
          <div className="text-center py-6">
            <p className="text-xs text-muted-foreground">You&apos;ve reached the beginning 💕</p>
          </div>
        )}
      </main>

      {showAddModal && (
        <AddEntryModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleEntryAdded}
        />
      )}
    </div>
  );
}
