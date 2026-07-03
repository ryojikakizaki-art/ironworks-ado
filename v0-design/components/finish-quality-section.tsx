import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

/**
 * 「二重防錆」品質セクション（2026-07-03）。
 * ado の中核差別化＝溶融亜鉛メッキ × 2液型ウレタン塗装を、トップページから
 * /galvanizing・/paint へクローズアップする導線。ランキング直後に置き、
 * 商品を見た直後の「なぜ錆びないのか」に答える。写真2枚＋短文のみの視覚主体。
 */

const PILLARS = [
  {
    no: "01",
    role: "守る",
    title: "溶融亜鉛メッキ",
    body: "橋や鉄塔を数十年守る防錆技術。450℃の亜鉛浴にまるごと浸け、鉄を隅々まで包み込みます。",
    img: "/images/process/galvanizing-hero.jpg",
    alt: "450℃の亜鉛浴に鉄製手すりを浸漬している様子",
    href: "/galvanizing",
    linkLabel: "メッキの話を読む",
  },
  {
    no: "02",
    role: "仕上げる",
    title: "2液型ウレタン塗装",
    body: "自動車と同じ塗料を、職人が一本ずつ手仕上げ。強い塗膜と、手に馴染む美しさを。",
    img: "/images/process/hero-paint-spray.jpg",
    alt: "鉄手すりにスプレーガンで2液型ウレタン塗装を施している様子",
    href: "/paint",
    linkLabel: "塗装の話を読む",
  },
]

export function FinishQualitySection() {
  return (
    <section id="quality" className="bg-white py-16 md:py-24 border-b border-border">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">
            Double Rust Protection
          </p>
          <h2 className="font-serif text-[26px] md:text-4xl text-foreground leading-snug">
            10年先も、錆びさせない。
          </h2>
          <p className="mt-4 text-[13px] md:text-[15px] leading-[1.9] text-foreground/70 max-w-xl mx-auto">
            メッキ工程を10年統括した職人が、「守るメッキ」と「仕上げる塗装」、二重の備えで鉄を錆から守ります。
          </p>
        </div>

        {/* Two pillars — めっき ＋ 塗装 */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 lg:gap-12">
          {/* ＋ バッジ（desktop: 写真の谷間中央） */}
          <span
            className="hidden md:flex absolute left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2 z-10 h-14 w-14 items-center justify-center rounded-full bg-white border-2 border-gold text-gold font-black text-2xl shadow-sm"
            aria-hidden="true"
          >
            ＋
          </span>

          {PILLARS.map((p, i) => (
            <div key={p.href} className="contents">
              {/* ＋ バッジ（mobile: カードの間） */}
              {i === 1 && (
                <span
                  className="md:hidden -my-2 mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white border-2 border-gold text-gold font-black text-xl shadow-sm"
                  aria-hidden="true"
                >
                  ＋
                </span>
              )}
              <Link href={p.href} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-secondary">
                  <Image
                    src={p.img}
                    alt={p.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* 役割ラベル */}
                  <span className="absolute top-3 left-3 inline-flex items-baseline gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[12px] tracking-[0.15em] text-foreground">
                    <span className="text-gold font-bold">{p.no}</span>
                    {p.role}
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="font-serif text-[19px] md:text-[21px] text-foreground group-hover:text-gold transition-colors">
                    {p.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] md:text-[14px] leading-[1.8] text-muted-foreground">
                    {p.body}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-gold">
                    {p.linkLabel}
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Conclusion — マーカー強調 */}
        <div className="mt-12 md:mt-16 text-center">
          <p className="text-[15px] md:text-lg font-bold text-foreground leading-relaxed">
            <span className="relative inline-block">
              <span
                className="absolute inset-x-0 bottom-0 h-[0.5em] bg-gold/40 -skew-x-3"
                aria-hidden="true"
              />
              <span className="relative">
                <span className="text-gold">メッキ × 塗装</span>の二重防錆
              </span>
            </span>
            で、屋外でも
            <span className="font-serif text-gold text-3xl md:text-4xl mx-1 align-baseline">
              10年以上
            </span>
            の安心を。
          </p>
        </div>
      </div>
    </section>
  )
}
