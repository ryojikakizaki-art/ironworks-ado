import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { allPosts, getPost } from '@/data/blog';

export function generateStaticParams() {
  return allPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = getPost(slug);
  if (!data) return {};
  return {
    title: `${stripTags(data.meta.title)} ｜ Story ｜ 鍛鉄工房 ZEST`,
    description: data.meta.excerpt || '鍛鉄工房 ZEST のノート',
  };
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, '');
}

export default async function StoryDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = getPost(slug);
  if (!data) notFound();
  const { meta, html } = data;

  // Find adjacent posts
  const idx = allPosts.findIndex((p) => p.slug === slug);
  const newer = idx > 0 ? allPosts[idx - 1] : null;
  const older = idx < allPosts.length - 1 ? allPosts[idx + 1] : null;

  return (
    <main className="bg-paper text-ink">
      <SiteHeader variant="on-paper" />

      {/* ─── Breadcrumb ─────────────────────────────── */}
      <div className="px-8 md:px-12 pt-40 md:pt-44 pb-6 font-en-sans text-[11px] tracking-[0.32em] uppercase text-ash">
        <div className="mx-auto max-w-3xl">
          <Link href="/story" className="hover:text-ink">Story</Link>
          <span className="mx-3 opacity-40">/</span>
          <span>{meta.date.slice(0, 4)}</span>
        </div>
      </div>

      {/* ─── Article ─────────────────────────────── */}
      <article className="px-8 md:px-12 pb-20">
        <div className="mx-auto max-w-3xl">
          <time className="font-en-sans text-[11px] tracking-[0.4em] uppercase text-rust mb-6 block">
            {meta.date.replaceAll('-', '.')}
          </time>
          <h1
            className="font-ja text-3xl md:text-5xl leading-[1.3] tracking-[0.04em] mb-12"
            dangerouslySetInnerHTML={{ __html: meta.title }}
          />
          {meta.image && (
            <div className="relative aspect-[3/2] overflow-hidden bg-iron mb-12">
              <Image
                src={meta.image}
                alt={stripTags(meta.title)}
                fill
                priority
                sizes="(min-width: 1024px) 768px, 100vw"
                className="object-cover"
              />
            </div>
          )}
          <div className="hairline mb-12 max-w-md" />
          <div
            className="story-prose text-[15px] md:text-[16px] leading-[2.0] tracking-[0.04em] text-ink-soft"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </article>

      {/* ─── Adjacent navigation ───────────────────── */}
      <nav className="px-8 md:px-12 py-16 border-t border-line bg-paper-deep">
        <div className="mx-auto max-w-3xl grid grid-cols-2 gap-8 text-[13px]">
          <div>
            {newer && (
              <Link href={`/story/${newer.slug}`} className="block group">
                <div className="font-en-sans text-[10px] tracking-[0.32em] uppercase text-ash mb-2">
                  ← Newer
                </div>
                <div className="font-ja leading-[1.7] group-hover:underline underline-offset-4 decoration-line"
                  dangerouslySetInnerHTML={{ __html: newer.title }} />
              </Link>
            )}
          </div>
          <div className="text-right">
            {older && (
              <Link href={`/story/${older.slug}`} className="block group">
                <div className="font-en-sans text-[10px] tracking-[0.32em] uppercase text-ash mb-2">
                  Older →
                </div>
                <div className="font-ja leading-[1.7] group-hover:underline underline-offset-4 decoration-line"
                  dangerouslySetInnerHTML={{ __html: older.title }} />
              </Link>
            )}
          </div>
        </div>
        <div className="mx-auto max-w-3xl mt-12 pt-8 border-t border-line text-center">
          <Link
            href="/story"
            className="inline-block font-en-sans text-[12px] tracking-[0.32em] uppercase border-b border-ink pb-1"
          >
            All notes →
          </Link>
        </div>
      </nav>

      <SiteFooter />
    </main>
  );
}
