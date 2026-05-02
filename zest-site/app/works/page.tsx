import Image from 'next/image';
import Link from 'next/link';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { categoryLabels, categoryOrder, worksByCategory } from '@/data/works';

export const metadata = {
  title: 'Works ｜ 鍛鉄工房 ZEST',
  description:
    '鍛冶師・蠣﨑良治がこれまで手がけた、門扉・手すり・表札・フェンス・家具・インテリア・小物の制作事例。',
};

export default function WorksIndex() {
  return (
    <main className="bg-paper text-ink">
      <SiteHeader variant="on-paper" />

      {/* ─── Title ──────────────────────────────────── */}
      <section className="px-8 md:px-12 pt-40 md:pt-48 pb-16 md:pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="font-en-sans text-[11px] tracking-[0.4em] uppercase text-rust mb-8">
            Works — Selected projects 2017 — 2024
          </div>
          <h1 className="font-en font-light text-5xl md:text-7xl leading-[1.05] tracking-tight max-w-4xl">
            All works,<br />
            <em className="italic font-normal">drawn from fire.</em>
          </h1>
          <p className="mt-10 max-w-2xl text-[15px] leading-[2.0] tracking-[0.04em] text-ink-soft">
            門扉・手すり・表札・面格子・家具・インテリア・小物。
            これまでに手がけた一点ものの記録です。
          </p>
        </div>
      </section>

      {/* ─── Anchor index ───────────────────────────── */}
      <nav className="px-8 md:px-12 pb-12 md:pb-16 border-b border-line">
        <div className="mx-auto max-w-7xl flex flex-wrap gap-x-8 gap-y-3 font-en-sans text-[12px] tracking-[0.32em] uppercase text-ash">
          {categoryOrder.map((c) => (
            <a key={c} href={`#${c}`} className="hover:text-ink">
              {categoryLabels[c].en}
              <span className="ml-2 text-[10px] opacity-60">
                {String(worksByCategory(c).length).padStart(2, '0')}
              </span>
            </a>
          ))}
        </div>
      </nav>

      {/* ─── Categories ─────────────────────────────── */}
      {categoryOrder.map((cat) => {
        const items = worksByCategory(cat);
        return (
          <section
            key={cat}
            id={cat}
            className="px-8 md:px-12 py-24 md:py-32 border-b border-line last:border-b-0"
          >
            <div className="mx-auto max-w-7xl">
              <div className="flex items-end justify-between mb-14 md:mb-20">
                <div>
                  <div className="font-en-sans text-[11px] tracking-[0.4em] uppercase text-rust mb-4">
                    {String(categoryOrder.indexOf(cat) + 1).padStart(2, '0')} — {categoryLabels[cat].en}
                  </div>
                  <h2 className="font-en font-light text-3xl md:text-5xl leading-[1.1] tracking-tight">
                    {categoryLabels[cat].ja}
                  </h2>
                </div>
                <span className="font-en-sans text-[11px] tracking-[0.32em] uppercase text-ink/60">
                  {String(items.length).padStart(2, '0')} works
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-16">
                {items.map((w, i) => (
                  <Link key={w.slug} href={`/works/${w.slug}`} className="group block">
                    <div className="relative aspect-[4/5] overflow-hidden bg-iron mb-5">
                      <Image
                        src={w.image}
                        alt={w.title}
                        fill
                        sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover grayscale-[15%] transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="font-en-sans text-[10px] tracking-[0.32em] uppercase text-ash mb-1">
                          {categoryLabels[w.category].en}
                          {w.year && <> &nbsp;·&nbsp; {w.year}</>}
                        </div>
                        <h3 className="font-ja text-[17px] tracking-[0.05em]">{w.title}</h3>
                      </div>
                      <span className="font-en-sans text-[10px] tracking-[0.32em] uppercase text-ink/40">
                        No.{String(i + 1).padStart(3, '0')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* ─── CTA Footer ─────────────────────────────── */}
      <section className="px-8 md:px-12 py-24 md:py-32 bg-ink text-paper">
        <div className="mx-auto max-w-3xl text-center">
          <div className="font-en-sans text-[11px] tracking-[0.4em] uppercase text-paper/60 mb-6">
            Custom Order
          </div>
          <h2 className="font-en font-light text-3xl md:text-5xl leading-[1.15] tracking-tight mb-10">
            <em className="italic">Made to order</em><br />— for the place it will live.
          </h2>
          <p className="text-[15px] leading-[2.0] tracking-[0.04em] text-paper/75 mb-12">
            ご相談は、図面・設置場所の写真と共にメールでお送りください。
          </p>
          <Link
            href="/contact"
            className="inline-block font-en-sans text-[12px] tracking-[0.32em] uppercase border-b border-paper pb-1"
          >
            Get in touch →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
