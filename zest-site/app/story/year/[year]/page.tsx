import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { allPosts, getYears, postsByYear } from '@/data/blog';

export function generateStaticParams() {
  return getYears().map((year) => ({ year }));
}

export async function generateMetadata({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  return {
    title: `${year} ｜ Story ｜ 鍛鉄工房 ZEST`,
    description: `鍛鉄工房 ZEST ・蠣﨑良治のノート — ${year}年の記事一覧`,
  };
}

export default async function YearArchive({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  const posts = postsByYear(year);
  if (posts.length === 0) notFound();
  const years = getYears();

  return (
    <main className="bg-paper text-ink">
      <SiteHeader variant="on-paper" />

      <section className="px-8 md:px-12 pt-40 md:pt-48 pb-12">
        <div className="mx-auto max-w-7xl">
          <div className="font-en-sans text-[11px] tracking-[0.4em] uppercase text-rust mb-8">
            <Link href="/story" className="hover:text-ink">Story</Link>
            <span className="mx-3 opacity-40">/</span>
            <span>{year}</span>
          </div>
          <h1 className="font-en font-light text-5xl md:text-7xl leading-[1.05] tracking-tight">
            <em className="italic">{year}</em>
          </h1>
          <p className="mt-6 font-en-sans text-[12px] tracking-[0.32em] uppercase text-ash">
            {posts.length} {posts.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>
      </section>

      <nav className="px-8 md:px-12 pb-12 border-b border-line">
        <div className="mx-auto max-w-7xl flex flex-wrap gap-x-6 gap-y-2 font-en-sans text-[12px] tracking-[0.32em] uppercase text-ash">
          <Link href="/story" className="hover:text-ink">All</Link>
          {years.map((y) => (
            <Link
              key={y}
              href={`/story/year/${y}`}
              className={y === year ? 'text-ink border-b border-ink pb-1' : 'hover:text-ink'}
            >
              {y}
            </Link>
          ))}
        </div>
      </nav>

      <section className="px-8 md:px-12 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-16">
            {posts.map((p) => (
              <article key={p.slug} className="group">
                <Link href={`/story/${p.slug}`} className="block">
                  {p.image ? (
                    <div className="relative aspect-[4/3] overflow-hidden bg-iron mb-5">
                      <Image
                        src={p.image}
                        alt={p.title.replace(/<[^>]+>/g, '')}
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
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
