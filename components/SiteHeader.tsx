import Image from "next/image";
import Link from "next/link";
import HyperLogo from "./HyperLogo";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="group flex min-w-0 items-center gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-1 ring-[var(--hl-aqua)]/40 transition group-hover:ring-[var(--hl-aqua)] md:h-14 md:w-14">
          <Image
            src="/giga12.png"
            alt="Gigachad"
            fill
            sizes="56px"
            className="object-cover object-top"
            priority
          />
        </div>
        <div className="min-w-0 leading-tight">
          <div className="font-mono text-sm text-white">hypercurb</div>
          <a
            href="https://x.com/cryptocurb"
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[11px] text-[var(--hl-aqua)] hover:underline"
          >
            x.com/cryptocurb
          </a>
        </div>
      </Link>

      <h1 className="hidden flex-1 text-center md:block">
        Hyper<em>liquid</em>
      </h1>

      <div className="shrink-0 flex items-center gap-3">
        <HyperLogo className="h-7 w-auto md:h-10" />
      </div>
    </header>
  );
}
