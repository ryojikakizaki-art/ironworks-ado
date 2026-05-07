import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { IntroSplash } from '@/components/intro-splash';

const heroSlides = [
  {
    src: 'https://i0.wp.com/tantetuzest.com/wp-content/uploads/2021/04/1140037.jpg',
    alt: '鍛鉄工房 ZEST の制作風景',
  },
  {
    src: 'https://i0.wp.com/tantetuzest.com/wp-content/uploads/2023/05/IMG_9757.jpeg',
    alt: '完成した大型門扉',
  },
  {
    src: 'https://i0.wp.com/tantetuzest.com/wp-content/uploads/2021/04/DSCF4317.jpg',
    alt: 'クレマチスの手すり',
  },
  {
    src: 'https://i0.wp.com/tantetuzest.com/wp-content/uploads/2023/05/DSCF6203-1.jpg',
    alt: '薔薇の面格子',
  },
];

const selectedWorks = [
  {
    title: '大型門扉',
    sub: 'Iron Gate',
    place: '個人邸／千葉',
    year: '2023',
    image: 'https://i0.wp.com/tantetuzest.com/wp-content/uploads/2023/05/IMG_9757.jpeg',
    serial: '其の壱',
  },
  {
    title: 'クレマチスの手すり',
    sub: 'Handrail · Clematis',
    place: '個人邸／神奈川',
    year: '2021',
    image: 'https://i0.wp.com/tantetuzest.com/wp-content/uploads/2021/04/DSCF4317.jpg',
    serial: '其の弐',
  },
  {
    title: '薔薇の面格子',
    sub: 'Window Grille · Rose',
    place: '個人邸／東京',
    year: '2023',
    image: 'https://i0.wp.com/tantetuzest.com/wp-content/uploads/2023/05/DSCF6203-1.jpg',
    serial: '其の参',
  },
  {
    title: '薪ストーブアクセサリー',
    sub: 'Stove Tools',
    place: '別荘／長野',
    year: '2023',
    image: 'https://i0.wp.com/tantetuzest.com/wp-content/uploads/2023/05/DSCF4238.jpg',
    serial: '其の四',
  },
];

const stepIcons = {
  inquiry: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" className="w-12 h-12">
      <path d="M8 12h32v20H22l-8 8v-8H8z" />
      <path d="M16 20h16M16 26h10" />
    </svg>
  ),
  sketch: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
      <path d="M8 38l6-2 24-24-4-4-24 24z" />
      <path d="M30 12l4 4" />
      <path d="M8 42h32" />
    </svg>
  ),
  forge: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
      <path d="M24 6c2 6 8 8 8 16a8 8 0 01-16 0c0-5 3-7 4-12 1 3 3 4 4 8" />
      <path d="M16 38h16" />
    </svg>
  ),
  finish: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
      <path d="M10 32l24-24 6 6-24 24z" />
      <path d="M28 14l6 6" />
      <path d="M8 38l4 4 8-2" />
    </svg>
  ),
  install: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
      <path d="M8 24l16-14 16 14" />
      <path d="M12 24v18h24V24" />
      <path d="M22 42v-10h4v10" />
    </svg>
  ),
};

const processSteps = [
  {
    no: '①',
    label: 'STEP 01',
    title: 'お問い合わせ',
    en: 'Inquiry',
    text: '住まいの図面や設置場所の写真と、ご希望のイメージをお送りください。素材で叶うこと・難しいこと、率直にお返事いたします。',
    icon: stepIcons.inquiry,
  },
  {
    no: '②',
    label: 'STEP 02',
    title: '素描・お見積り',
    en: 'Sketch & Quote',
    text: '蠣﨑が手描きの素案とお見積りをお返しします。打ち合わせは現地でも工房でも。図面が固まり次第、正式なご注文へ。',
    icon: stepIcons.sketch,
  },
  {
    no: '③',
    label: 'STEP 03',
    title: '鍛造',
    en: 'Forging',
    text: '赤らむまで熱した鉄をアンビルとハンマーで一打ずつ打ち延ばし、曲げ、繋いでゆく。一年の大半を火と鉄の前で過ごす本業の工程。',
    icon: stepIcons.forge,
  },
  {
    no: '④',
    label: 'STEP 04',
    title: '仕上げ・塗装',
    en: 'Finishing',
    text: 'ワイヤーブラシ・サンダーで肌を整え、屋外仕様には亜鉛メッキ＋焼付け塗装を二層。室内仕様にはオイル仕上げ。',
    icon: stepIcons.finish,
  },
  {
    no: '⑤',
    label: 'STEP 05',
    title: '搬入・取り付け',
    en: 'Installation',
    text: '完成品を現地へお届けし、建物に合わせて取り付け。アンカー打ちから最終調整まで一貫してお引き受けします。',
    icon: stepIcons.install,
  },
];

/* セクション見出し共通：番号と英タイトルを編集デザイン的に並べる */
function SectionEyebrow({
  number,
  numberRoman,
  english,
  japanese,
}: {
  number: string;
  numberRoman: string;
  english: string;
  japanese: string;
}) {
  return (
    <div className="flex items-baseline gap-5 md:gap-7">
      <span className="font-text-ja text-shu text-3xl md:text-5xl leading-none" style={{ fontWeight: 400 }}>
        {number}
      </span>
      <span className="font-en-sans text-[10px] tracking-[0.4em] uppercase text-paper/45">
        {numberRoman}
      </span>
      <span className="hidden md:block w-12 h-px bg-paper/20" aria-hidden />
      <span className="font-en-sans text-[10px] tracking-[0.4em] uppercase text-paper/55">
        {english}
        <span className="ml-3 font-text-ja tracking-[0.32em] text-paper/45 normal-case" style={{ fontWeight: 300 }}>
          ／&nbsp;{japanese}
        </span>
      </span>
    </div>
  );
}

export default function Home() {
  return (
    <main className="bg-[#0a0908] text-paper">
      <IntroSplash />
      <div className="top-shade" aria-hidden />
      <SiteHeader variant="over-image" />

      {/* ─── 〇. Hero ─────────────────────────────────────────────────────── */}
      <section className="relative w-full h-[100svh] md:grid md:grid-cols-12 overflow-hidden bg-[#0a0908]">
        {/* 左：B100 + 縦書き「鍛鉄」（PCのみ） */}
        <div className="hidden md:flex md:col-span-5 lg:col-span-4 bg-[#0a0908] relative z-10">
          {/* ghost kanji 鉄 — 大胆に滲ませる背景文字 */}
          <span
            className="kanji-mark"
            aria-hidden
            style={{
              top: '-6vh',
              left: '-4vw',
              fontSize: 'clamp(360px, 36vw, 620px)',
              color: 'rgba(244, 239, 232, 0.025)',
            }}
          >
            鉄
          </span>

          <div className="absolute inset-0 flex items-center justify-end pr-10 lg:pr-14 z-10">
            <div className="flex flex-col items-end gap-12">
              <div
                className="tate-upright font-text-ja text-paper leading-[0.98]"
                style={{ fontSize: 'clamp(96px, 11vw, 180px)', fontWeight: 300, letterSpacing: '0.02em' }}
              >
                鍛鉄
              </div>
              <div
                className="tate font-text-ja text-paper/70 text-[14px] tracking-[0.22em] leading-[2.0] pr-2"
                style={{ fontWeight: 300 }}
              >
                火と鉄の対話。住まいに据える、一点もの。
              </div>
            </div>
          </div>

        </div>

        {/* 右：4 枚スライドショー */}
        <div className="relative md:col-span-7 lg:col-span-8 w-full h-full">
          {heroSlides.map((s, i) => (
            <div key={s.src} className={`absolute inset-0 hero-slide hero-slide-${i + 1}`}>
              <Image
                src={s.src}
                alt={s.alt}
                fill
                priority={i === 0}
                sizes="(min-width: 768px) 60vw, 100vw"
                className="object-cover grayscale-[35%] brightness-[0.82]"
              />
            </div>
          ))}
          {/* 黒へのなじませグラデ */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/55 md:bg-gradient-to-l md:from-transparent md:via-transparent md:to-[#0a0908]/85" />

          {/* モバイル：オーバーレイ */}
          <div className="absolute inset-0 md:hidden flex flex-col justify-end px-8 pb-20 text-paper">
            <h1
              className="font-text-ja text-[88px] leading-[0.95] mb-7"
              style={{ fontWeight: 300, letterSpacing: '0.02em' }}
            >
              鍛鉄
            </h1>
            <p className="font-text-ja text-[14px] leading-[2.0] tracking-[0.08em] opacity-90 max-w-md" style={{ fontWeight: 300 }}>
              火と鉄の対話。<br />
              住まいに据える、一点もの。
            </p>
          </div>

        </div>
      </section>

      {/* ─── 一. About — 鍛鉄について（B100・asymmetric） ───────────────── */}
      <section className="relative px-8 md:px-12 py-32 md:py-48 bg-[#0a0908] text-paper overflow-hidden">
        {/* 背景に「一」を巨大マージナリア配置 */}
        <span
          className="kanji-mark"
          aria-hidden
          style={{
            right: '-3vw',
            top: '8vh',
            fontSize: 'clamp(280px, 38vw, 540px)',
            color: 'rgba(181, 58, 42, 0.05)',
          }}
        >
          一
        </span>

        <div className="relative mx-auto max-w-7xl grid grid-cols-12 gap-6 md:gap-12">
          <aside className="col-span-12 md:col-span-3 flex md:flex-col items-baseline md:items-start md:gap-12 md:pt-2 gap-6">
            <SectionEyebrow number="一" numberRoman="I" english="About" japanese="鍛鉄について" />
            <div className="hidden md:block">
              <div className="font-en italic text-[42px] leading-[0.92] tracking-[0.02em] text-paper/85" style={{ fontWeight: 400 }}>
                Tantetsu
              </div>
              <div className="mt-2 font-en-sans text-[10px] tracking-[0.4em] uppercase text-paper/40">
                noun · forged iron
              </div>
            </div>
          </aside>

          <div className="col-span-12 md:col-span-9 md:pl-8">
            <h2
              className="font-text-ja text-paper leading-[1.1] tracking-[0.04em] mb-12 max-w-3xl"
              style={{ fontWeight: 300, fontSize: 'clamp(40px, 5.4vw, 80px)' }}
            >
              火と鉄の、<br />ささやかな問答。
            </h2>

            <div className="grid grid-cols-12 gap-6 md:gap-10">
              <div className="col-span-12 md:col-span-7 space-y-7 font-text-ja text-[15px] md:text-[16px] leading-[2.4] tracking-[0.08em] text-paper/82" style={{ fontWeight: 300 }}>
                <p>
                  「鍛鉄（たんてつ）」は、日本では馴染みの薄い、西洋で発展した鉄の金工技術。
                  赤らむまで熱した鉄を、ハンマーで一打ずつ打ち延ばし、曲げ、繋いでいく — フォージングと呼ばれる手仕事です。
                </p>
                <p>
                  鋳型で量産する製品とは違って、一本一本に「打ち手の物語」が残る。
                  機械では出せない、わずかな歪み。木の節のような、火の跡。
                  握ったときに手がよろこぶ、そんな鉄を作りたいと思っています。
                </p>
                <p>
                  鍛鉄工房 ZEST は、千葉・若葉区の小さな工房です。
                  ご依頼主と直接お話して図面を起こし、門扉・手すり・家具・表札を、
                  一本ずつ手仕事で打ち上げています。
                </p>
              </div>

              {/* 右マージナリア：年表・素材リスト */}
              <aside className="col-span-12 md:col-span-4 md:col-start-9 md:border-l md:border-paper/15 md:pl-8 pt-2 space-y-8">
                <div>
                  <div className="font-en-sans text-[10px] tracking-[0.4em] uppercase text-paper/45 mb-3">
                    Materials
                  </div>
                  <ul className="font-text-ja text-[13px] leading-[2.0] tracking-[0.06em] text-paper/72" style={{ fontWeight: 300 }}>
                    <li>軟鋼・SS400（黒皮／磨き）</li>
                    <li>真鍮・銅</li>
                    <li>ステンレス（屋外・特注）</li>
                  </ul>
                </div>
                <div>
                  <div className="font-en-sans text-[10px] tracking-[0.4em] uppercase text-paper/45 mb-3">
                    Lineage
                  </div>
                  <ul className="font-text-ja text-[13px] leading-[2.0] tracking-[0.06em] text-paper/72" style={{ fontWeight: 300 }}>
                    <li>鍛冶歴 15 年</li>
                    <li>2010 工房 ZEST 創業</li>
                    <li>2024 ironworks ado 開設</li>
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 二. Works — 選り抜きの仕事（B85・千鳥） ───────────────────── */}
      <section className="relative px-8 md:px-12 py-28 md:py-40 bg-[#1a1614] text-paper overflow-hidden">
        <span
          className="kanji-mark"
          aria-hidden
          style={{
            left: '-2vw',
            top: '4vh',
            fontSize: 'clamp(280px, 36vw, 520px)',
            color: 'rgba(244, 239, 232, 0.022)',
          }}
        >
          二
        </span>

        <div className="relative mx-auto max-w-7xl">
          <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16 md:mb-24">
            <div className="flex flex-col gap-8">
              <SectionEyebrow number="二" numberRoman="II" english="Selected Works" japanese="選り抜きの仕事" />
              <h2
                className="font-text-ja text-paper leading-[1.05] tracking-[0.02em]"
                style={{ fontWeight: 300, fontSize: 'clamp(40px, 6vw, 92px)' }}
              >
                選り抜きの仕事
              </h2>
            </div>
            <Link
              href="/works"
              className="self-start md:self-end font-text-ja text-[13px] tracking-[0.24em] border-b border-paper/50 pb-1 text-paper/85 hover:border-shu hover:text-shu transition-colors"
              style={{ fontWeight: 300 }}
            >
              一覧を見る　→
            </Link>
          </header>

          <div className="grid grid-cols-2 md:grid-cols-12 gap-x-6 md:gap-x-10 gap-y-16 md:gap-y-24">
            {selectedWorks.map((w, i) => {
              const colSpan = ['md:col-span-3', 'md:col-span-3', 'md:col-span-3', 'md:col-span-3'][i];
              const offset = ['md:mt-0', 'md:mt-24', 'md:mt-10', 'md:mt-32'][i];
              return (
                <article key={w.title} className={`group ${colSpan} ${offset}`}>
                  <div className="relative aspect-[3/5] overflow-hidden bg-iron mb-5">
                    <Image
                      src={w.image}
                      alt={w.title}
                      fill
                      sizes="(min-width: 768px) 22vw, 50vw"
                      className="object-cover grayscale-[15%] transition duration-700 group-hover:grayscale-0 group-hover:scale-[1.03]"
                    />
                    {/* 連番（朱印） */}
                    <span
                      className="absolute top-3 left-3 seal-mark text-[11px]"
                      style={{ width: '32px', height: '32px', fontSize: '11px' }}
                      aria-hidden
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mb-2">
                    <span
                      className="font-text-ja text-[12px] tracking-[0.18em] text-shu"
                      style={{ fontWeight: 400 }}
                    >
                      {w.serial}
                    </span>
                    <span className="font-en-sans text-[10px] tracking-[0.32em] uppercase text-paper/45">
                      {w.year}
                    </span>
                  </div>
                  <h3
                    className="font-text-ja text-[17px] md:text-lg tracking-[0.04em] leading-[1.5] text-paper mb-1"
                    style={{ fontWeight: 300 }}
                  >
                    {w.title}
                  </h3>
                  <div className="font-en-sans text-[10px] tracking-[0.32em] uppercase text-paper/45 mb-2">
                    {w.sub}
                  </div>
                  <div className="font-text-ja text-[11px] tracking-[0.16em] text-paper/40" style={{ fontWeight: 300 }}>
                    {w.place}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="md:hidden mt-12 text-center">
            <Link
              href="/works"
              className="inline-block font-text-ja text-[13px] tracking-[0.24em] border-b border-paper/60 pb-1 text-paper"
              style={{ fontWeight: 300 }}
            >
              一覧を見る　→
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 三. Process — 鍛鉄の手仕事（B100・墨線コネクタ） ─────────── */}
      <section className="relative px-8 md:px-12 py-32 md:py-44 bg-[#0a0908] text-paper overflow-hidden">
        <span
          className="kanji-mark"
          aria-hidden
          style={{
            right: '-2vw',
            top: '6vh',
            fontSize: 'clamp(280px, 36vw, 520px)',
            color: 'rgba(181, 58, 42, 0.045)',
          }}
        >
          三
        </span>

        <div className="relative mx-auto max-w-7xl">
          <header className="grid grid-cols-12 gap-6 md:gap-12 mb-20 md:mb-28">
            <div className="col-span-12 md:col-span-4">
              <SectionEyebrow number="三" numberRoman="III" english="Process" japanese="鍛鉄の手仕事" />
            </div>
            <div className="col-span-12 md:col-span-8">
              <h2
                className="font-text-ja text-paper leading-[1.05] tracking-[0.02em] mb-8"
                style={{ fontWeight: 300, fontSize: 'clamp(40px, 5.6vw, 84px)' }}
              >
                鍛鉄の手仕事、<br />五つの工程。
              </h2>
              <p
                className="font-text-ja text-paper/65 text-[15px] md:text-[16px] leading-[2.0] tracking-[0.1em] max-w-xl"
                style={{ fontWeight: 300 }}
              >
                ご相談から取り付けまで、すべて蠣﨑本人が一貫して手がけます。
                <br />
                標準納期は素描から完成まで 2 〜 4 ヶ月。
              </p>
            </div>
          </header>

          {/* 5 STEP グリッド + 墨線コネクタ */}
          <div className="relative">
            {/* 墨線：手描き風 SVG パスを左→右に */}
            <svg
              className="hidden md:block absolute top-[34px] left-[5%] right-[5%] w-[90%] h-[6px] pointer-events-none"
              viewBox="0 0 1000 6"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path
                className="ink-stroke"
                d="M0,3 Q120,1 240,3 T480,3 T720,3 T1000,3"
              />
              {/* 各工程の点 */}
              {[0, 250, 500, 750, 1000].map((x, i) => (
                <circle key={i} cx={x} cy="3" r="1.6" fill="rgba(181,58,42,0.7)" />
              ))}
            </svg>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-x-8 gap-y-14">
              {processSteps.map((s) => (
                <div key={s.no} className="relative">
                  <div className="flex items-center gap-3 mb-7">
                    <span
                      className="font-display-ja text-shu text-3xl leading-none"
                      style={{ fontWeight: 400 }}
                    >
                      {s.no}
                    </span>
                    <span className="font-en-sans text-[10px] tracking-[0.32em] uppercase text-paper/55">
                      {s.label}
                    </span>
                  </div>
                  <div className="text-paper/85 mb-7">{s.icon}</div>
                  <h3
                    className="font-text-ja text-paper text-xl tracking-[0.04em] mb-2"
                    style={{ fontWeight: 300 }}
                  >
                    {s.title}
                  </h3>
                  <div className="font-en-sans text-[10px] tracking-[0.32em] uppercase text-paper/45 mb-5">
                    {s.en}
                  </div>
                  <p
                    className="font-text-ja text-[13px] leading-[2.0] tracking-[0.06em] text-paper/72"
                    style={{ fontWeight: 300 }}
                  >
                    {s.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-20 flex flex-col md:flex-row md:items-baseline md:justify-between gap-6 border-t border-paper/15 pt-10">
            <p
              className="font-text-ja text-paper/65 text-[14px] leading-[2.0] tracking-[0.08em] max-w-md"
              style={{ fontWeight: 300 }}
            >
              「鉄は何でも作れる」と言われた現場の言葉に、まだ甘んじていたい。
            </p>
            <Link
              href="/order"
              className="inline-block font-text-ja text-[13px] tracking-[0.24em] border-b border-paper/60 pb-1 text-paper hover:border-shu hover:text-shu transition-colors whitespace-nowrap self-start md:self-auto"
              style={{ fontWeight: 300 }}
            >
              注文の詳細　→
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 四. Studio — 工房（画像が右端をぶち抜くアシメ） ─────────── */}
      <section className="relative bg-[#1a1614] text-paper overflow-hidden">
        <span
          className="kanji-mark"
          aria-hidden
          style={{
            left: '-3vw',
            top: '20vh',
            fontSize: 'clamp(280px, 32vw, 480px)',
            color: 'rgba(244, 239, 232, 0.022)',
          }}
        >
          四
        </span>

        <div className="relative mx-auto max-w-[1400px] grid grid-cols-12 gap-y-12 md:gap-x-12 px-8 md:px-12 py-32 md:py-44">
          <div className="col-span-12 md:col-span-5 md:order-1 flex flex-col gap-10 md:pr-6">
            <SectionEyebrow number="四" numberRoman="IV" english="Studio" japanese="工房" />
            <h2
              className="font-text-ja text-paper leading-[1.05] tracking-[0.02em]"
              style={{ fontWeight: 300, fontSize: 'clamp(40px, 5.4vw, 80px)' }}
            >
              森のなかの<br />小さな工房。
            </h2>
            <p
              className="font-text-ja text-paper/65 text-[14px] tracking-[0.22em]"
              style={{ fontWeight: 300 }}
            >
              千葉・若葉区にて
            </p>
            <div className="h-px bg-paper/20" />
            <p
              className="font-text-ja text-[15px] leading-[2.3] tracking-[0.08em] text-paper/82"
              style={{ fontWeight: 300 }}
            >
              千葉市若葉区。住宅地の外れにある工房で、
              アンビル（金床）とエアーハンマーを並べ、
              一年の大半を火と鉄に向き合って過ごしています。
            </p>

            <ul className="grid grid-cols-2 gap-y-4 font-text-ja text-[12px] leading-[1.7] tracking-[0.18em] text-paper/55" style={{ fontWeight: 300 }}>
              <li><span className="text-paper/35 mr-2">01</span>アンビル ／ 金床</li>
              <li><span className="text-paper/35 mr-2">02</span>エアーハンマー</li>
              <li><span className="text-paper/35 mr-2">03</span>コークス炉</li>
              <li><span className="text-paper/35 mr-2">04</span>ガス炉 ／ 二基</li>
            </ul>

            <Link
              href="/studio"
              className="self-start font-text-ja text-[13px] tracking-[0.24em] border-b border-paper/60 pb-1 text-paper hover:border-shu hover:text-shu transition-colors"
              style={{ fontWeight: 300 }}
            >
              工房について　→
            </Link>
          </div>

          {/* 右側：画像をビューポート右端まで bleeding（編集デザイン的） */}
          <div className="col-span-12 md:col-span-7 md:order-2 relative md:-mr-12 lg:-mr-[calc((100vw-1400px)/2)]">
            <div className="relative aspect-[5/4]">
              <Image
                src="https://i0.wp.com/tantetuzest.com/wp-content/uploads/2021/04/1100203.jpg"
                alt="工房の風景"
                fill
                sizes="(min-width: 768px) 60vw, 100vw"
                className="object-cover grayscale-[25%] brightness-[0.92]"
              />
              <div className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 font-en-sans text-[10px] tracking-[0.4em] uppercase text-paper/65 bg-[#1a1614] px-3 py-1">
                Workshop &nbsp;·&nbsp; Wakaba, Chiba
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 五. ironworks ado — 姉妹ブランドの編集デザイン的紹介 ───── */}
      <section className="relative bg-[#0a0908] text-paper overflow-hidden">
        <span
          className="kanji-mark"
          aria-hidden
          style={{
            right: '-2vw',
            top: '12vh',
            fontSize: 'clamp(280px, 36vw, 520px)',
            color: 'rgba(181, 58, 42, 0.05)',
          }}
        >
          五
        </span>

        <div className="relative mx-auto max-w-[1400px] grid grid-cols-12 gap-y-12 md:gap-x-12 px-8 md:px-12 py-32 md:py-44">
          {/* 画像（左にぶち抜き） */}
          <div className="col-span-12 md:col-span-6 md:order-1 relative md:-ml-12 lg:-ml-[calc((100vw-1400px)/2)]">
            <div className="relative aspect-[4/5]">
              <Image
                src="https://i0.wp.com/tantetuzest.com/wp-content/uploads/2023/05/DSCF4238.jpg"
                alt="ironworks ado の作品"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover grayscale-[15%]"
              />
              {/* 朱印で「規格品」 */}
              <span
                className="absolute top-6 left-6 seal-mark"
                style={{ width: '54px', height: '54px', fontSize: '12px', letterSpacing: '0.05em' }}
                aria-hidden
              >
                規格
              </span>
            </div>
          </div>

          {/* 右：テキスト */}
          <div className="col-span-12 md:col-span-6 md:order-2 flex flex-col gap-8 md:pl-8 md:pt-12">
            <SectionEyebrow number="五" numberRoman="V" english="Online Shop" japanese="姉妹ブランド" />

            <h2
              className="font-text-ja text-paper leading-[0.95] tracking-[0.01em]"
              style={{ fontWeight: 300, fontSize: 'clamp(56px, 8vw, 132px)' }}
            >
              ironworks{' '}
              <em className="font-en italic" style={{ fontWeight: 400 }}>
                ado
              </em>
            </h2>

            <p
              className="font-text-ja text-paper/72 text-[15px] md:text-[17px] leading-[2.0] tracking-[0.08em] max-w-xl"
              style={{ fontWeight: 300 }}
            >
              ZEST が手がける、規格化された手すり・小物のオンラインショップ。
              <br />
              フルオーダーまでは要らない方へ、すぐに届くアイアン。
            </p>

            <ul className="grid grid-cols-3 gap-x-4 max-w-md font-text-ja text-[12px] leading-[1.7] tracking-[0.18em] text-paper/55 mt-2" style={{ fontWeight: 300 }}>
              <li className="border-l border-paper/15 pl-3">
                <span className="block text-paper/35 text-[10px] tracking-[0.32em] uppercase font-en-sans mb-1">items</span>
                17 商品
              </li>
              <li className="border-l border-paper/15 pl-3">
                <span className="block text-paper/35 text-[10px] tracking-[0.32em] uppercase font-en-sans mb-1">lead time</span>
                1〜2 週
              </li>
              <li className="border-l border-paper/15 pl-3">
                <span className="block text-paper/35 text-[10px] tracking-[0.32em] uppercase font-en-sans mb-1">payment</span>
                Stripe
              </li>
            </ul>

            <a
              href="https://ado.tantetuzest.com"
              className="self-start mt-4 inline-flex items-center gap-4 font-en-sans text-[12px] tracking-[0.32em] uppercase text-paper border border-paper/40 px-10 py-4 hover:bg-shu hover:border-shu transition-colors"
            >
              Visit shop
              <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── Footer (B85・編集マスト) ──────────────────────────────────── */}
      <footer className="relative px-8 md:px-12 pt-20 pb-12 border-t border-paper/10 bg-[#1a1614] text-paper">
        <div className="mx-auto max-w-7xl grid grid-cols-12 gap-y-12 md:gap-x-10">
          <div className="col-span-12 md:col-span-5 flex flex-col gap-4">
            <div
              className="font-text-ja text-2xl tracking-[0.18em] text-paper"
              style={{ fontWeight: 300 }}
            >
              鍛鉄工房 ZEST
            </div>
            <p className="font-en-sans text-[11px] tracking-[0.32em] uppercase text-paper/55">
              Tantetsu Kobo · Forged Iron Studio
            </p>
            <p className="font-text-ja text-[13px] leading-[2.0] tracking-[0.08em] text-paper/55 max-w-md mt-3" style={{ fontWeight: 300 }}>
              火と鉄の対話。住まいに据える、一点もの。
            </p>
          </div>

          <div
            className="col-span-6 md:col-span-3 font-text-ja text-[13px] leading-[2.1] tracking-[0.05em] text-paper/85"
            style={{ fontWeight: 300 }}
          >
            <div className="font-en-sans text-[10px] tracking-[0.32em] uppercase text-paper/45 mb-3">
              Studio
            </div>
            〒265-0052<br />
            千葉市若葉区和泉町 239-2<br />
            月 — 金　9:00 – 18:00
          </div>

          <div
            className="col-span-6 md:col-span-2 font-text-ja text-[13px] leading-[2.1] tracking-[0.05em] text-paper/85"
            style={{ fontWeight: 300 }}
          >
            <div className="font-en-sans text-[10px] tracking-[0.32em] uppercase text-paper/45 mb-3">
              Contact
            </div>
            <a href="mailto:kaki@tantetuzest.com" className="block hover:text-shu transition-colors">
              kaki@tantetuzest.com
            </a>
            <a href="tel:07038170659" className="block hover:text-shu transition-colors">
              070-3817-0659
            </a>
          </div>

          <div className="col-span-12 md:col-span-2 flex flex-col gap-3">
            <div className="font-en-sans text-[10px] tracking-[0.32em] uppercase text-paper/45 mb-1">
              Sister
            </div>
            <a
              href="https://ado.tantetuzest.com"
              className="font-en italic text-[20px] tracking-[0.04em] text-paper/85 hover:text-shu transition-colors"
              style={{ fontWeight: 400 }}
            >
              ironworks ado →
            </a>
          </div>
        </div>

        <div className="mx-auto max-w-7xl mt-16 pt-8 border-t border-paper/10 flex flex-wrap gap-y-3 justify-between text-[11px] tracking-[0.2em] uppercase text-paper/45 font-en-sans">
          <span>© ZEST {new Date().getFullYear()}</span>
          <span>Kakizaki Ryoji · Blacksmith</span>
        </div>
      </footer>
    </main>
  );
}
