import Link from "next/link";
import { redirect } from "next/navigation";

import { signOut } from "@/app/auth/actions";
import { StatCard } from "@/components/stat-card";
import { BookmarksLiveList } from "@/features/bookmarks/components/bookmarks-live-list";
import { LiveBookmarkCount } from "@/features/bookmarks/components/live-bookmark-count";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export default async function DashboardPage() {
  type Bookmark = Database["public"]["Tables"]["bookmarks"]["Row"];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select()
    .filter("user_id", "eq", user.id)
    .order("created_at", { ascending: false });
  const typedBookmarks = (bookmarks ?? []) as unknown as Bookmark[];

  return (
    <main className="app-shell">
      <section className="elevated-panel fade-in-up w-full p-8 sm:p-10">
        <div className="grid gap-5 rounded-2xl border border-sky-200 bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 p-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              My Bookmarks Hub
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
              Session active for <span className="font-semibold text-slate-900">{user.email}</span>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:w-72">
            <div className="rounded-xl border border-sky-200 bg-white p-3">
              <p className="font-mono text-xs text-sky-700">Bookmarks</p>
              <LiveBookmarkCount initialCount={typedBookmarks.length} userId={user.id} />
            </div>
            <StatCard label="Sync" value="Realtime Active" tone="green" />
          </div>
        </div>

        <BookmarksLiveList initialBookmarks={typedBookmarks} userId={user.id} />

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="btn-secondary inline-flex h-11 items-center rounded-xl px-5 text-sm font-semibold transition"
          >
            Back to Home
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="btn-primary inline-flex h-11 items-center rounded-xl px-5 text-sm font-semibold transition"
            >
              Sign out
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
