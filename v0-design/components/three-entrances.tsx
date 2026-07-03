import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

/**
 * ヒーロー直下「3つの入口」（タスク5-1）。
 * 全国EC（手すり／ロートアイアン・装飾）と千葉施工の二層戦略を
 * トップページ構造に反映する入口セクション。大きな写真＋短い見出しのみ。
 * 「千葉エリア」は提供エリアの事実情報（施工は千葉限定）であり修飾的な地域訴求ではない。
 * 飛び先は商品一覧の単一カテゴリではなく、各案内ページへ（初訪問者が全体像を掴めるように）。
 */

const ENTRANCES = [
  {
    title: "手すり",
    area: "全国配送",
    description: "横型・縦型の壁付け手すり。ご注文からお届けまでオンラインで完結。",
    img: "/images/hero/dscf6699.jpg",
    alt: "鎚目仕上げのアイアン手すりを握る手元",
    href: "/handrail",
  },
  {
    title: "ロートアイアン・装飾",
    area: "全国配送",
    description: "鎚目・Scroll など、鍛冶職人が手打ちで仕上げる鍛鉄の世界。",
    img: "/images/hero/dscf1995.jpg",
    alt: "吹き抜けに施工した曲線縦桟のロートアイアン手すり",
    href: "/wrought-iron",
  },
  {
    title: "施工（千葉エリア）",
    area: "工事込み",
    description: "階段・門扉・フェンスなど、製作から取付工事までお任せください。",
    img: "/images/hero/loft-staircase.jpg",
    alt: "スケルトン階段のあるリビング空間",
    href: "/construction",
  },
]

export function ThreeEntrances() {
  return (
    <section className="bg-white py-12 md:py-16 border-b border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-8">
          {ENTRANCES.map((e) => (
            <Link key={e.title} href={e.href} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-secondary">
                <Image
                  src={e.img}
                  alt={e.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="mt-4 flex items-baseline gap-3">
                <h3 className="font-serif text-[18px] md:text-[19px] text-foreground group-hover:text-gold transition-colors">
                  {e.title}
                </h3>
                <span className="shrink-0 whitespace-nowrap text-[10px] tracking-[0.2em] text-gold border border-gold/40 rounded-full px-2 py-0.5">
                  {e.area}
                </span>
              </div>
              <p className="mt-1.5 text-[13px] leading-[1.8] text-muted-foreground">
                {e.description}
              </p>
              <span className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-gold">
                見る
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
