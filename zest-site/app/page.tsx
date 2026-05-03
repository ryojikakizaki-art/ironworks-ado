import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';

const heroImage = 'https://i0.wp.com/tantetuzest.com/wp-content/uploads/2021/04/1140037.jpg';

const selectedWorks = [
  {
    title: '鍛鉄の門扉',
    category: 'Gate',
    year: '2023',
    image: 'https://i0.wp.com/tantetuzest.com/wp-content/uploads/2021/04/1100206.jpg',
  },
  {
    title: 'クレマチスの手すり',
    category: 'Handrail',
    year: '2022',
    image: 'https://i0.wp.com/tantetuzest.com/wp-content/uploads/2021/04/DSCF4769.jpg',
  },
  {
    title: '薔薇の面格子',
    category: 'Fence',
    year: '2021',
    image: 'https://i0.wp.com/tantetuzest.com/wp-content/uploads/2021/04/1090166.jpg',
  },
  {
    title: '螺旋階段',
    category: 'Interior',
    year: '2020',
    image: 'https://i0.wp.com/tantetuzest.com/wp-content/uploads/2021/04/1120470.jpg',
  },
];

export default function Home() {
  return (
    <main className="bg-paper text-ink">
      <SiteHeader variant="over-image" />

      {/* ─── Hero ──────────────────────────────────────── */}
      <section className="relative h-[100svh] w-full overflow-hidden">
        <Image
          src={heroImage}
          alt="鍛鉄工房 ZEST の制作風景"
          fill
          priority
          sizes="100vw"
          className="object-cover grayscale-[35%] brightness-[0.72]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/55" />
        <div className="relative z-10 flex h-full flex-col justify-end px-8 pb-20 md:px-12 md:pb-28 text-paper">
          <div className="font-en-sans text-[11px] tracking-[0.4em] uppercase opacity-80 mb-6">
            Tantetsu Kobo ZEST &nbsp;·&nbsp; Chiba, Japan &nbsp;·&nbsp; Est. 2010
          </div>
          <h1 className="font-en font-light text-5xl md:text-7xl lg:text-[88px] leading-[1.05] tracking-tight max-w-4xl">
            Iron, drawn by
            <br />
            <em className="italic font-normal">fire</em> and hand.
          </h1>
          <p className="mt-8 max-w-xl text-[15px] md:text-base leading-[2.0] tracking-[0.05em] opacity-90">
            鉄を、火で、手で。<br />
            一本ずつ手仕事で打ち上げる、住まいの一点もの。<br />
            鍛冶職人・蠣﨑良治のフルオーダー作品。
          </p>
        </div>
        <div className="absolute bottom-6 right-8 md:right-12 z-10 font-en-sans text-[11px] tracking-[0.32em] uppercase text-paper/70">
          Scroll ↓
        </div>
      </section>

      {/* ─── Statement ─────────────────────────────────── */}
      <section className="px-8 md:px-12 py-32 md:py-48">
        <div className="mx-auto max-w-3xl">
          <div className="font-en-sans text-[11px] tracking-[0.4em] uppercase text-rust mb-10">
            01 — Studio Statement
          </div>
          <h2 className="font-en font-light text-3xl md:text-5xl leading-[1.2] tracking-tight mb-12">
            Tantetsu — A dialogue<br />between fire and iron.
          </h2>
          <div className="hairline mb-12" />
          <div className="space-y-7 text-[15px] md:text-[16px] leading-[2.1] tracking-[0.04em] text-ink-soft">
            <p>
              「鍛鉄（たんてつ）」は、日本では馴染みの薄い、西洋で発展した鉄の金工技術。
              赤らむまで熱した鉄を、ハンマーで一打ずつ打ち延ばし、曲げ、繋いでいく — フォージングと呼ばれる手仕事です。
            </p>
            <p>
              鋳型で量産する製品とは違って、一本一本に「打ち手の物語」が残る。
              機械では出せない、わずかな歪み。
              木の節のような、火の跡。
              握ったときに手がよろこぶ、そんな鉄を作りたいと思っています。
            </p>
            <p>
              鍛鉄工房 ZEST は、千葉・若葉区の小さな工房です。
              ご依頼主と直接お話して図面を起こし、門扉・手すり・家具・表札を、
              一本ずつ手仕事で打ち上げています。
            </p>
          </div>
        </div>
      </section>

      {/* ─── Selected Works ────────────────────────────── */}
      <section className="px-8 md:px-12 py-24 md:py-32 bg-paper-deep">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-16 md:mb-20">
            <div>
              <div className="font-en-sans text-[11px] tracking-[0.4em] uppercase text-rust mb-4">
                02 — Selected Works
              </div>
              <h2 className="font-en font-light text-3xl md:text-5xl leading-[1.1] tracking-tight">
                Selected works
              </h2>
            </div>
            <Link
              href="/works"
              className="hidden md:block font-en-sans text-[12px] tracking-[0.32em] uppercase border-b border-ink pb-1"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-20">
            {selectedWorks.map((w, i) => (
              <article key={w.title} className={i % 2 === 1 ? 'md:mt-24' : ''}>
                <div className="relative aspect-[4/5] overflow-hidden bg-iron mb-6">
                  <Image
                    src={w.image}
                    alt={w.title}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover grayscale-[15%]"
                  />
                </div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="font-en-sans text-[11px] tracking-[0.32em] uppercase text-ash mb-2">
                      {w.category} &nbsp;·&nbsp; {w.year}
                    </div>
                    <h3 className="font-ja text-xl md:text-2xl tracking-[0.05em]">{w.title}</h3>
                  </div>
                  <span className="font-en-sans text-[11px] tracking-[0.32em] uppercase text-ink/60">
                    No. {String(i + 1).padStart(3, '0')}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Studio teaser ─────────────────────────────── */}
      <section className="px-8 md:px-12 py-32 md:py-44">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20 items-center">
          <div className="md:col-span-7 relative aspect-[5/4]">
            <Image
              src="https://i0.wp.com/tantetuzest.com/wp-content/uploads/2021/04/DSCF5067.jpg"
              alt="工房の風景"
              fill
              sizes="(min-width: 768px) 58vw, 100vw"
              className="object-cover grayscale-[20%]"
            />
          </div>
          <div className="md:col-span-5">
            <div className="font-en-sans text-[11px] tracking-[0.4em] uppercase text-rust mb-6">
              03 — Studio
            </div>
            <h2 className="font-en font-light text-3xl md:text-4xl leading-[1.15] tracking-tight mb-10">
              The forge,<br />
              <em className="italic">in the woods of Chiba.</em>
            </h2>
            <div className="hairline mb-8" />
            <p className="text-[15px] leading-[2.1] tracking-[0.04em] text-ink-soft mb-10">
              千葉市若葉区。住宅地の外れにある工房で、
              アンビル（金床）とエアーハンマーを並べ、
              一年の大半を火と鉄に向き合って過ごしています。
            </p>
            <Link
              href="/studio"
              className="inline-block font-en-sans text-[12px] tracking-[0.32em] uppercase border-b border-ink pb-1"
            >
              About the studio →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Order ─────────────────────────────────────── */}
      <section className="px-8 md:px-12 py-24 md:py-32 bg-ink text-paper">
        <div className="mx-auto max-w-5xl">
          <div className="font-en-sans text-[11px] tracking-[0.4em] uppercase text-paper/60 mb-6">
            04 — Custom Order
          </div>
          <h2 className="font-en font-light text-3xl md:text-5xl leading-[1.15] tracking-tight mb-12 max-w-3xl">
            <em className="italic">Made to order</em> — for the place it will live.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 mb-16">
            {[
              ['Inquiry', '住まいの図面・設置場所の写真と、イメージをお送りください。'],
              ['Sketch', '蠣﨑が直接、手描きの素案をお返しします。打ち合わせは現地でも工房でも。'],
              ['Forge & Install', '鍛造から仕上げ・取り付けまで、一貫してお引き受けします。'],
            ].map(([n, text], i) => (
              <div key={n}>
                <div className="font-en-sans text-[11px] tracking-[0.32em] uppercase text-paper/50 mb-3">
                  Step {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="font-en text-2xl tracking-tight mb-4">{n}</h3>
                <p className="text-[14px] leading-[2.0] tracking-[0.04em] text-paper/75">{text}</p>
              </div>
            ))}
          </div>
          <Link
            href="/order"
            className="inline-block font-en-sans text-[12px] tracking-[0.32em] uppercase border-b border-paper pb-1"
          >
            Order process in detail →
          </Link>
        </div>
      </section>

      {/* ─── ado link block ────────────────────────────── */}
      <section className="px-8 md:px-12 py-24 md:py-32">
        <div className="mx-auto max-w-5xl border border-line p-10 md:p-16 grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-3">
            <div className="font-en-sans text-[11px] tracking-[0.4em] uppercase text-rust">
              Sister Brand
            </div>
          </div>
          <div className="md:col-span-6">
            <h3 className="font-en text-2xl md:text-3xl tracking-tight mb-3">
              ironworks <em className="italic">ado</em>
            </h3>
            <p className="text-[14px] leading-[1.9] tracking-[0.04em] text-ink-soft">
              ZEST が手がける、規格化された手すり・小物のオンラインショップ。
              フルオーダーまでは要らない方へ。
            </p>
          </div>
          <div className="md:col-span-3 md:text-right">
            <a
              href="https://ado.tantetuzest.com"
              className="inline-block font-en-sans text-[12px] tracking-[0.32em] uppercase border-b border-ink pb-1"
            >
              Visit shop →
            </a>
          </div>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────── */}
      <footer className="px-8 md:px-12 pt-20 pb-12 border-t border-line">
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
        <div className="mx-auto max-w-7xl mt-16 pt-8 border-t border-line flex justify-between text-[11px] tracking-[0.2em] uppercase text-ash font-en-sans">
          <span>© ZEST {new Date().getFullYear()}</span>
          <span>Kakizaki Ryoji · Blacksmith</span>
        </div>
      </footer>
    </main>
  );
}
