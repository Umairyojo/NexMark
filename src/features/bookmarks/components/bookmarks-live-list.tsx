"use client";

import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";

import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type Bookmark = Database["public"]["Tables"]["bookmarks"]["Row"];

type BookmarksLiveListProps = {
  initialBookmarks: Bookmark[];
  userId: string;
};

type BroadcastMessage =
  | { type: "UPSERT"; bookmark: Bookmark }
  | { type: "DELETE"; bookmarkId: string };

function isValidHttpUrl(value: string) {
  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}

function byCreatedAtDesc(a: Bookmark, b: Bookmark) {
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function BookmarksLiveList({ initialBookmarks, userId }: BookmarksLiveListProps) {
  const supabase = useMemo(() => createClient(), []);
  const broadcastRef = useRef<BroadcastChannel | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(
    [...initialBookmarks].sort(byCreatedAtDesc)
  );
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "created" | "deleted" | "invalid-url" | "error">(
    "idle"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const upsertBookmark = useCallback((incoming: Bookmark) => {
    setBookmarks((current) => {
      const next = current.some((bookmark) => bookmark.id === incoming.id)
        ? current.map((bookmark) => (bookmark.id === incoming.id ? incoming : bookmark))
        : [incoming, ...current];
      return next.sort(byCreatedAtDesc);
    });
  }, []);

  const removeBookmark = useCallback((bookmarkId: string) => {
    setBookmarks((current) => current.filter((bookmark) => bookmark.id !== bookmarkId));
  }, []);

  const fetchLatestBookmarks = useCallback(async () => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select()
      .filter("user_id", "eq", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBookmarks(data as unknown as Bookmark[]);
    }
  }, [supabase, userId]);

  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
      return;
    }

    const broadcast = new BroadcastChannel(`bookmarks-sync-${userId}`);
    broadcast.onmessage = (event: MessageEvent<BroadcastMessage>) => {
      const message = event.data;
      if (message.type === "UPSERT") {
        upsertBookmark(message.bookmark);
        return;
      }
      if (message.type === "DELETE") {
        removeBookmark(message.bookmarkId);
      }
    };

    broadcastRef.current = broadcast;

    return () => {
      broadcast.close();
      broadcastRef.current = null;
    };
  }, [removeBookmark, upsertBookmark, userId]);

  useEffect(() => {
    const channel = supabase
      .channel(`bookmarks-live-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
        },
        (payload: RealtimePostgresChangesPayload<Bookmark>) => {
          if (payload.eventType === "INSERT") {
            const newRow = payload.new;
            if (newRow?.id) {
              upsertBookmark(newRow);
            }
            return;
          }

          if (payload.eventType === "UPDATE") {
            const updatedRow = payload.new;
            if (updatedRow?.id) {
              upsertBookmark(updatedRow);
            }
            return;
          }

          if (payload.eventType === "DELETE") {
            const deletedId = payload.old?.id;
            if (deletedId) {
              removeBookmark(deletedId);
            }
          }
        }
      )
      .subscribe((subscriptionStatus) => {
        if (subscriptionStatus === "SUBSCRIBED") {
          void fetchLatestBookmarks();
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [fetchLatestBookmarks, removeBookmark, supabase, upsertBookmark, userId]);

  async function handleAddBookmark(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("idle");

    const trimmedTitle = title.trim();
    const trimmedUrl = url.trim();

    if (!trimmedTitle || !trimmedUrl) {
      setStatus("error");
      return;
    }

    if (!isValidHttpUrl(trimmedUrl)) {
      setStatus("invalid-url");
      return;
    }

    setIsSubmitting(true);

    const { data, error } = await supabase
      .from("bookmarks")
      .insert({
        title: trimmedTitle,
        url: trimmedUrl,
        user_id: userId,
      })
      .select()
      .single();

    setIsSubmitting(false);

    if (error || !data) {
      setStatus("error");
      return;
    }

    const typedData = data as unknown as Bookmark;
    upsertBookmark(typedData);
    broadcastRef.current?.postMessage({ type: "UPSERT", bookmark: typedData });
    setTitle("");
    setUrl("");
    setStatus("created");
  }

  async function handleDeleteBookmark(bookmarkId: string) {
    setStatus("idle");

    const previous = bookmarks;
    removeBookmark(bookmarkId);

    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .filter("id", "eq", bookmarkId)
      .filter("user_id", "eq", userId);

    if (error) {
      setBookmarks(previous);
      setStatus("error");
      return;
    }

    broadcastRef.current?.postMessage({ type: "DELETE", bookmarkId });
    setStatus("deleted");
  }

  return (
    <>
      {status === "created" ? (
        <p className="status-banner mt-5" data-variant="success">
          Bookmark added successfully.
        </p>
      ) : null}
      {status === "deleted" ? (
        <p className="status-banner mt-5" data-variant="success">
          Bookmark deleted successfully.
        </p>
      ) : null}
      {status === "invalid-url" ? (
        <p className="status-banner mt-5" data-variant="warning">
          URL must start with http:// or https://
        </p>
      ) : null}
      {status === "error" ? (
        <p className="status-banner mt-5" data-variant="danger">
          Request failed. Please try again.
        </p>
      ) : null}

      <form onSubmit={handleAddBookmark} className="mt-7 grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
        <input
          name="title"
          placeholder="Bookmark title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="field"
          required
        />
        <input
          name="url"
          placeholder="https://example.com"
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          className="field"
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary h-[2.9rem] rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Adding..." : "Add Link"}
        </button>
      </form>

      <section className="mt-9">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Your Bookmarks
          </h2>
          <p className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
            {bookmarks.length} items
          </p>
        </div>
        {bookmarks.length > 0 ? (
          <ul className="mt-4 grid gap-3">
            {bookmarks.map((bookmark, index) => (
              <li
                key={bookmark.id}
                style={{ animationDelay: `${index * 55}ms` }}
                className="fade-in-up overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-[color:var(--surface-muted)]"
              >
                <div className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-start">
                  <div className="border-l-2 border-blue-300 pl-3">
                    <p className="font-semibold text-slate-900">{bookmark.title}</p>
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block break-all text-sm text-slate-600 transition hover:text-blue-700"
                    >
                      {bookmark.url}
                    </a>
                    <p className="mt-2 text-xs text-slate-500">{formatTimestamp(bookmark.created_at)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteBookmark(bookmark.id)}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-red-200 bg-white px-3 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-slate-500">No bookmarks yet. Add your first link above.</p>
        )}
      </section>
    </>
  );
}
