import Image from "next/image";
import Link from "next/link";

export function GlobalLogo() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-white/85 px-3 py-2 shadow-sm backdrop-blur"
      aria-label="Nexmark home"
    >
      <Image
        src="/brand/nexmark-logo.png"
        alt="Nexmark logo"
        width={34}
        height={34}
        priority
      />
      <span className="text-sm font-semibold tracking-tight text-slate-900">Nexmark</span>
    </Link>
  );
}
