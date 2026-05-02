import Link from 'next/link';

type Variant = 'over-image' | 'on-paper';

export function SiteHeader({ variant = 'over-image' }: { variant?: Variant }) {
  const base = 'fixed top-0 left-0 right-0 z-50';
  const skin =
    variant === 'over-image'
      ? 'mix-blend-difference text-paper'
      : 'text-ink border-b border-line bg-paper/90 backdrop-blur';

  return (
    <header className={`${base} ${skin}`}>
      <div className="flex items-center justify-between px-8 py-5 md:px-12">
        <Link href="/" className="font-en-sans text-[15px] tracking-[0.32em] uppercase">
          ZEST <span className="opacity-60">— Forged Iron Studio</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 font-en-sans text-[12px] tracking-[0.28em] uppercase">
          <Link href="/works">Works</Link>
          <Link href="/studio">Studio</Link>
          <Link href="/order">Order</Link>
          <Link href="/story">Story</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>
    </header>
  );
}
