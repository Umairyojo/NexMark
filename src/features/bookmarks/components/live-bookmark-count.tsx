"use client";

import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type Bookmark = Database["public"]["Tables"]["bookmarks"]["Row"];

type BroadcastMessage =
  | { type: "UPSERT"; bookmark: Bookmark }
  | { type: "DELETE"; bookmarkId: string };

type LiveBookmarkCountProps = {
  initialCount: number;
  userId: string;
};

export function LiveBookmarkCount({ initialCount, userId }: LiveBookmarkCountProps) {
  const supabase = useMemo(() => createClient(), []);
  const [count, setCount] = useState(initialCount);

  const refreshCount = useCallback(async () => {
    const { count: latestCount, error } = await supabase
      .from("bookmarks")
      .select("id", { count: "exact", head: true })
      .filter("user_id", "eq", userId);

    if (!error && typeof latestCount === "number") {
      setCount(latestCount);
    }
  }, [supabase, userId]);

  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
      return;
    }

    const channel = new BroadcastChannel(`bookmarks-sync-${userId}`);
    channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
      if (event.data.type === "UPSERT") {
        setCount((current) => current + 1);
      }
      if (event.data.type === "DELETE") {
        setCount((current) => Math.max(0, current - 1));
      }
    };

    return () => channel.close();
  }, [userId]);

  useEffect(() => {
    const channel = supabase
      .channel(`bookmarks-count-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
        },
        (payload: RealtimePostgresChangesPayload<Bookmark>) => {
          const changedUserId =
            payload.eventType === "DELETE" ? payload.old?.user_id : payload.new?.user_id;

          if (changedUserId === userId) {
            void refreshCount();
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          void refreshCount();
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refreshCount, supabase, userId]);

  return <p className="mt-1 text-2xl font-bold text-slate-900">{count}</p>;
}
