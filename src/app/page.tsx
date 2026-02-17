import Link from "next/link";

import { signInWithGoogle, signOut } from "./auth/actions";

import { StatCard } from "@/components/stat-card";
import { createClient } from "@/lib/supabase/server";

type HomePageProps = {
  searchParams: Promise<{ auth?: string }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const metadataName = user?.user_metadata?.full_name;
  const displayName =
    typeof metadataName === "string" && metadataName.trim().length > 0
      ? metadataName.split(" ")[0]
      : user?.email?.split("@")[0] ?? "there";

  return (
    <main className="app-shell grid items-center">
      <section className="elevated-panel fade-in-up overflow-hidden p-8 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
          <div>
            <p className="section-tag">Smart Bookmark Platform</p>
            <h1 className="mt-4 max-w-xl text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              Bookmark your links organized, private, and instantly synced.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Powered by Google OAuth and Supabase, Nexmark keeps your bookmarks private, Secured, user-isolated, and synced across tabs in real time — no refresh required.
            </p>

            {params.auth === "required" ? (
              <p className="status-banner mt-5" data-variant="warning">
                Please sign in with Google to open the dashboard.
              </p>
            ) : null}

            {user ? (
              <>
                <div className="mt-5 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-cyan-50 to-blue-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                    Welcome Back
                  </p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                    Great to see you, {displayName}.
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Your private bookmark space is ready and syncing in real time.
                  </p>
                </div>
                <p className="mt-5 text-sm text-slate-600 sm:text-base">
                  Signed in as <span className="font-semibold text-slate-900">{user.email}</span>
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link
                    href="/dashboard"
                    className="btn-primary inline-flex h-11 items-center rounded-xl px-5 text-sm font-semibold transition"
                  >
                    Open Dashboard
                  </Link>
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="btn-secondary inline-flex h-11 items-center rounded-xl px-5 text-sm font-semibold transition"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <>
                <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  Sign in with Google to unlock your secure, personal bookmark hub.
                </p>
                <form action={signInWithGoogle} className="mt-6">
                  <button
                    type="submit"
                    className="btn-primary inline-flex h-11 items-center rounded-xl px-5 text-sm font-semibold transition"
                  >
                    Sign in with Google
                  </button>
                </form>
              </>
            )}
          </div>

          <aside className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              About the App
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Nexmark</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              A modern bookmark platform designed for clarity, speed, and privacy. 
              Smart organization meets real-time sync — built for focused creators &amp; developers.
            </p>
            <div className="mt-4 rounded-xl border border-blue-200 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                About the Developer
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Built with a product-first philosophy — secure by design, engineered for reliability, and crafted with attention to detail. — <b>Umair Ahmed</b>
              </p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <StatCard label="Stack" value="Next.js + Supabase" />
              <StatCard label="Mode" value="Realtime Enabled" />
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
