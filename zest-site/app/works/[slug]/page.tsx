import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { categoryLabels, getWork, works, worksByCategory } from '@/data/works';

export function generateStaticParams() {
  return works.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const w = getWork(slug);
  if (!w) return {};
  return {
    title: `${w.title} ｜ ${categoryLabels[w.category].en} ｜ 鍛鉄工房 ZEST`,
    description: w.caption ?? `鍛鉄工房 ZEST の制作事例「${w.title}」`,
  };
}

export default async function WorkDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const w = getWork(slug);
  if (!w) notFound();

  const siblings = worksByCategory(w.category).filter((s) => s.slug !== w.slug).slice(0, 3);
  const cat = categoryLabels[w.category];

  return (
    <main className="bg-paper text-ink">
      <SiteHeader variant="on-paper" />

      {/* ─── Breadcrumb ─────────────────────────────── */}
      <div className="px-8 md:px-12 pt-40 md:pt-44 pb-6 font-en-sans text-[11px] tracking-[0.32em] uppercase text-ash">
        <div className="mx-auto max-w-7xl">
          <Link href="/works" className="hover:text-ink">Works</Link>
          <span className="mx-3 opacity-40">/</span>
          <Link href={`/works#${w.category}`} className="hover:text-ink">{cat.en}</Link>
        </div>
      </div>

      {/* ─── Hero image ─────────────────────────────── */}
      <section className="px-8 md:px-12 pb-12">
        <div className="mx-auto max-w-7xl relative aspect-[3/2] bg-iron overflow-hidden">
          <Image
            src={w.image}
            alt={w.title}
            fill
            priority
            sizes="(min-width: 1024px) 1280px, 100vw"
            className="object-cover grayscale-[10%]"
          />
        </div>
      </section>

      {/* ─── Title + caption (museum-style) ─────────── */}
      <section className="px-8 md:px-12 py-16 md:py-24">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-7">
            <div className="font-en-sans text-[11px] tracking-[0.4em] uppercase text-rust mb-6">
              {cat.en} {w.year && <>&nbsp;·&nbsp; {w.year}</>}
            </div>
            <h1 className="font-ja text-3xl md:text-5xl leading-[1.25] tracking-[0.04em] mb-12">
              {w.title}
            </h1>
            <div className="hairline mb-12 max-w-md" />
            {w.caption ? (
              <p className="text-[15px] md:text-[16px] leading-[2.1] tracking-[0.04em] text-ink-soft max-w-xl">
                {w.caption}
              </p>
            ) : (
              <p className="text-[15px] leading-[2.1] tracking-[0.04em] text-ash italic max-w-xl">
                {/* prettier-ignore */}
                — Caption to be added.
              </p>
            )}
          </div>

          <aside className="md:col-span-4 md:col-start-9 border-t border-line pt-8 md:border-t-0 md:border-l md:pl-12 md:pt-0">
            <div className="font-en-sans text-[10px] tracking-[0.4em] uppercase text-ash mb-6">
              Specification
            </div>
            <dl className="space-y-5 text-[13px] leading-[1.8] tracking-[0.04em]">
              <SpecRow label="Material"   value={w.material} />
              <SpecRow label="Finish"     value={w.finish} />
              <SpecRow label="Dimensions" value={w.dimensions} />
              <SpecRow label="Location"   value={w.location} />
              <SpecRow label="Year"       value={w.year} />
            </dl>
            <div className="mt-10 pt-8 border-t border-line">
              <Link
                href="/contact"
                className="inline-block font-en-sans text-[11px] tracking-[0.32em] uppercase border-b border-ink pb-1"
              >
                Inquire about a similar piece →
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* ─── Related works ──────────────────────────── */}
      {siblings.length > 0 && (
        <section className="px-8 md:px-12 py-24 md:py-32 bg-paper-deep">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between mb-12">
              <div>
                <div className="font-en-sans text-[11px] tracking-[0.4em] uppercase text-rust mb-4">
                  More in {cat.en}
                </div>
                <h2 className="font-en font-light text-3xl md:text-4xl tracking-tight">
                  Other works
                </h2>
              </div>
              <Link
                href={`/works#${w.category}`}
                className="hidden md:block font-en-sans text-[12px] tracking-[0.32em] uppercase border-b border-ink pb-1"
              >
                View all {cat.en.toLowerCase()} →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
              {siblings.map((s) => (
                <Link key={s.slug} href={`/works/${s.slug}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden bg-iron mb-4">
                    <Image
                      src={s.image}
                      alt={s.title}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover grayscale-[15%] transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="font-en-sans text-[10px] tracking-[0.32em] uppercase text-ash mb-1">
                    {cat.en} {s.year && <>&nbsp;·&nbsp; {s.year}</>}
                  </div>
                  <h3 className="font-ja text-[16px] tracking-[0.05em]">{s.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </main>
  );
}

function SpecRow({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="font-en-sans text-[10px] tracking-[0.32em] uppercase text-ash mb-1">
        {label}
      </dt>
      <dd className="text-ink-soft">
        {value ?? <span className="text-ash/60">—</span>}
      </dd>
    </div>
  );
}
