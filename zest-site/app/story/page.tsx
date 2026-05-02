import Image from 'next/image';
import Link from 'next/link';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata = {
  title: 'Story ｜ 鍛鉄工房 ZEST',
  description:
    '制作の裏側、鍛鉄の技法、工房の日々。鍛冶師・蠣﨑良治のノート。',
};

type Note = {
  slug: string;
  date: string;
  category: 'Technique' | 'Atelier' | 'Notes';
  title: string;
  excerpt: string;
  image: string;
};

const wp = (f: string) => `https://tantetuzest.com/wp-content/uploads/2021/04/${f}`;

const notes: Note[] = [
  {
    slug: 'forging-rose',
    date: '2025.10.18',
    category: 'Technique',
    title: '薔薇を打つ — 一枚の鉄板から、花びらが立ち上がるまで',
    excerpt: '鍛鉄で花を作るとき、最初に決めるのは「枚数」ではなく「順番」。火を入れるたびに鉄は痩せていく。',
    image: wp('1090166.jpg'),
  },
  {
    slug: 'kuroyama-finish',
    date: '2025.09.02',
    category: 'Technique',
    title: '黒皮仕上げの話',
    excerpt: '塗装でも、サビ止めでもない、鍛冶屋の仕上げ。鉄そのものの黒を残すために、削らず、磨かず、火だけで仕上げる。',
    image: wp('1140312.jpg'),
  },
  {
    slug: 'spring-hammer',
    date: '2025.07.21',
    category: 'Atelier',
    title: 'スプリングハンマーが工房に来た日',
    excerpt: '長く手打ちにこだわってきたが、大型の門扉が増えるにつれ、限界も見えていた。導入の決め手は、音だった。',
    image: wp('DSCF4774.jpg'),
  },
  {
    slug: 'forge-summer',
    date: '2025.06.10',
    category: 'Notes',
    title: '夏の工房',
    excerpt: '鍛冶場の夏は、外気よりも炉の前のほうが涼しい、と思える瞬間がある。錯覚だが、その錯覚を信じて打つ。',
    image: wp('DSCF5067.jpg'),
  },
  {
    slug: 'commissioning',
    date: '2025.04.28',
    category: 'Notes',
    title: '依頼主の言葉から、図面が立ち上がる',
    excerpt: 'ヒアリングのとき、私はあまり喋らない。家を見て、家族の動線を見て、家具の角を見る。図面はそこから生まれる。',
    image: wp('1100204.jpg'),
  },
  {
    slug: 'yakigane',
    date: '2025.02.14',
    category: 'Technique',
    title: '焼鈍 — 鉄を一度、休ませる',
    excerpt: '鍛えた鉄は内部に応力を残す。最後にゆっくりと冷ますことで、鉄は自分のかたちに落ち着く。',
    image: wp('1120470.jpg'),
  },
];

const categories: Array<Note['category'] | 'All'> = ['All', 'Technique', 'Atelier', 'Notes'];

export default function StoryPage() {
  return (
    <main className="bg-paper text-ink">
      <SiteHeader variant="on-paper" />

      {/* ─── Title ─────────────────────────────────── */}
      <section className="px-8 md:px-12 pt-40 md:pt-48 pb-16 md:pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="font-en-sans text-[11px] tracking-[0.4em] uppercase text-rust mb-8">
            Story — Notes from the forge
          </div>
          <h1 className="font-en font-light text-5xl md:text-7xl leading-[1.05] tracking-tight max-w-4xl">
            <em className="italic font-normal">Notes</em><br />
            from the forge.
          </h1>
          <p className="mt-10 max-w-2xl text-[15px] leading-[2.0] tracking-[0.04em] text-ink-soft">
            制作の裏側、鍛鉄の技法、工房の日々。
            蠣﨑良治のノートです。
          </p>
        </div>
      </section>

      {/* ─── Filters ───────────────────────────────── */}
      <nav className="px-8 md:px-12 pb-12 border-b border-line">
        <div className="mx-auto max-w-7xl flex flex-wrap gap-x-8 gap-y-3 font-en-sans text-[12px] tracking-[0.32em] uppercase text-ash">
          {categories.map((c) => (
            <span key={c} className={c === 'All' ? 'text-ink border-b border-ink pb-1' : 'hover:text-ink cursor-pointer'}>
              {c}
            </span>
          ))}
        </div>
      </nav>

      {/* ─── Notes ─────────────────────────────────── */}
      <section className="px-8 md:px-12 py-16 md:py-24">
        <div className="mx-auto max-w-7xl divide-y divide-line">
          {notes.map((n) => (
            <article key={n.slug} className="py-12 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
              <div className="md:col-span-4 relative aspect-[4/3] order-1 md:order-2">
                <Image
                  src={n.image}
                  alt={n.title}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover grayscale-[15%]"
                />
              </div>
              <div className="md:col-span-8 order-2 md:order-1">
                <div className="flex items-baseline gap-6 font-en-sans text-[10px] tracking-[0.32em] uppercase text-ash mb-5">
                  <time>{n.date}</time>
                  <span className="text-rust">{n.category}</span>
                </div>
                <h2 className="font-ja text-2xl md:text-3xl leading-[1.4] tracking-[0.04em] mb-6 max-w-xl">
                  <Link href={`/story/${n.slug}`} className="hover:underline underline-offset-4 decoration-line">
                    {n.title}
                  </Link>
                </h2>
                <p className="text-[15px] leading-[2.0] tracking-[0.04em] text-ink-soft max-w-xl">
                  {n.excerpt}
                </p>
                <Link
                  href={`/story/${n.slug}`}
                  className="inline-block mt-6 font-en-sans text-[11px] tracking-[0.32em] uppercase border-b border-ink/60 pb-1 hover:border-ink"
                >
                  Read more →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
