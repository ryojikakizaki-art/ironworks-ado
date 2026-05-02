import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="px-8 md:px-12 pt-20 pb-12 border-t border-line bg-paper">
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-5">
          <div className="font-en-sans text-[15px] tracking-[0.32em] uppercase mb-3">ZEST</div>
          <p className="font-en-sans text-[12px] tracking-[0.18em] uppercase text-ash">
            Tantetsu Kobo · Forged Iron Studio
          </p>
        </div>
        <div className="md:col-span-4 text-[13px] leading-[2.0] tracking-[0.04em]">
          <div className="font-en-sans text-[10px] tracking-[0.32em] uppercase text-ash mb-3">Studio</div>
          〒265-0052<br />
          千葉市若葉区和泉町 239-2<br />
          Mon — Fri　9:00 – 18:00
        </div>
        <div className="md:col-span-3 text-[13px] leading-[2.0] tracking-[0.04em]">
          <div className="font-en-sans text-[10px] tracking-[0.32em] uppercase text-ash mb-3">Contact</div>
          <a href="mailto:kaki@tantetuzest.com" className="block">kaki@tantetuzest.com</a>
          <a href="tel:07038170659" className="block">070-3817-0659</a>
        </div>
      </div>
      <div className="mx-auto max-w-7xl mt-16 pt-8 border-t border-line flex flex-wrap gap-4 justify-between text-[11px] tracking-[0.2em] uppercase text-ash font-en-sans">
        <span>© ZEST {new Date().getFullYear()}</span>
        <Link href="https://ado.tantetuzest.com" className="hover:text-ink">
          Sister brand · ironworks ado →
        </Link>
        <span>Kakizaki Ryoji · Blacksmith</span>
      </div>
    </footer>
  );
}
