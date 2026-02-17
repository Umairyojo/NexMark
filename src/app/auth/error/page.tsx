import Link from "next/link";

type AuthErrorPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const params = await searchParams;
  const message = params.message ?? "Authentication failed. Please try again.";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl items-center justify-center px-6 py-16">
      <section className="w-full rounded-2xl border border-red-200 bg-red-50 p-8 text-red-900 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Sign-in Error</h1>
        <p className="mt-3 text-sm">{message}</p>
        <Link
          className="mt-6 inline-flex rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          href="/"
        >
          Back to Home
        </Link>
      </section>
    </main>
  );
}
