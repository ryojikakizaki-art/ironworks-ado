import Image from 'next/image';
import Link from 'next/link';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { allPosts, getYears } from '@/data/blog';

export const metadata = {
  title: 'Story ｜ 鍛鉄工房 ZEST',
  description:
    '制作の裏側、鍛鉄の技法、工房の日々。蠣﨑良治のノート。2016年からの全 347 記事。',
};

const PER_PAGE = 36;

export default function StoryPage() {
  const recent = allPosts.slice(0, PER_PAGE);
  const years = getYears();

  return (
    <main className="bg-paper text-ink">
      <SiteHeader variant="on-paper" />

      {/* ─── Title ─────────────────────────────────── */}
      <section className="px-8 md:px-12 pt-40 md:pt-48 pb-12 md:pb-16">
        <div className="mx-auto max-w-7xl">
          <div className="font-en-sans text-[11px] tracking-[0.4em] uppercase text-rust mb-8">
            Story — Notes from the forge ・ {allPosts.length} entries since 2016
          </div>
          <h1 className="font-en font-light text-5xl md:text-7xl leading-[1.05] tracking-tight max-w-4xl">
            <em className="italic font-normal">Notes</em><br />
            from the forge.
          </h1>
          <p className="mt-10 max-w-2xl text-[15px] leading-[2.0] tracking-[0.04em] text-ink-soft">
            制作の裏側、鍛鉄の技法、工房の日々、暮らしのこと。
            2016年からの蠣﨑良治のノートです。
          </p>
        </div>
      </section>

      {/* ─── Year filters ──────────────────────────── */}
      <nav className="px-8 md:px-12 pb-12 border-b border-line">
        <div className="mx-auto max-w-7xl flex flex-wrap gap-x-6 gap-y-2 font-en-sans text-[12px] tracking-[0.32em] uppercase text-ash">
          <span className="text-ink border-b border-ink pb-1">All</span>
          {years.map((y) => (
            <a key={y} href={`/story/year/${y}`} className="hover:text-ink">
              {y}
            </a>
          ))}
        </div>
      </nav>

      {/* ─── Recent posts ──────────────────────────── */}
      <section className="px-8 md:px-12 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="font-en-sans text-[11px] tracking-[0.4em] uppercase text-rust mb-10">
            Latest — {PER_PAGE} of {allPosts.length}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-16">
            {recent.map((p) => (
              <article key={p.slug} className="group">
                <Link href={`/story/${p.slug}`} className="block">
                  {p.image ? (
                    <div className="relative aspect-[4/3] overflow-hidden bg-iron mb-5">
                      <Image
                        src={p.image}
                        alt={p.title}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-cover grayscale-[10%] transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] bg-paper-deep mb-5" />
                  )}
                  <time className="font-en-sans text-[10px] tracking-[0.32em] uppercase text-ash mb-2 block">
                    {p.date.replaceAll('-', '.')}
                  </time>
                  <h2 className="font-ja text-[17px] leading-[1.5] tracking-[0.05em] mb-3" dangerouslySetInnerHTML={{ __html: p.title }} />
                  {p.excerpt && (
                    <p className="text-[13px] leading-[1.9] tracking-[0.04em] text-ink-soft line-clamp-3">
                      {p.excerpt}
                    </p>
                  )}
                </Link>
              </article>
            ))}
          </div>
          {allPosts.length > PER_PAGE && (
            <div className="mt-20 text-center">
              <Link
                href={`/story/year/${years[0]}`}
                className="inline-block font-en-sans text-[12px] tracking-[0.32em] uppercase border-b border-ink pb-1"
              >
                Browse by year →
              </Link>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
