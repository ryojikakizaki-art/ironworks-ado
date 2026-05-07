import Link from 'next/link';

type Variant = 'over-image' | 'on-paper';

export function SiteHeader({ variant = 'over-image' }: { variant?: Variant }) {
  const base = 'fixed top-0 left-0 right-0 z-50';
  const skin =
    variant === 'over-image'
      ? 'text-paper [text-shadow:_0_1px_4px_rgba(0,0,0,0.55)]'
      : 'text-ink border-b border-line bg-paper/90 backdrop-blur';

  return (
    <header className={`${base} ${skin}`}>
      <div className="flex items-center justify-end px-8 py-5 md:px-12">
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
