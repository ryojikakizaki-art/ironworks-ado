import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

/**
 * 施工事例ギャラリー（タスク5-5）。
 * 空間全体が写った施工写真のマソンリーグリッド。文字は最小限。
 * 蠣﨑さん提供のチャット写真から撮影者の足・スリッパ等をクロップ除去して圧縮済み。
 * caption は「地域＋商品名」を蠣﨑さんに確認後に追記する（未確認のうちは書かない＝捏造禁止）。
 * もっと見るは施工案内ページ（/construction）の事例セクションへ。
 */

const CASES: { src: string; alt: string; w: number; h: number; caption?: string }[] = [
  {
    src: "/images/gallery/case-5.jpg",
    alt: "白壁の階段に取り付けた曲線のロートアイアン手すり",
    w: 900,
    h: 1600,
  },
  {
    src: "/images/gallery/case-1.jpg",
    alt: "コンクリート壁の廻り階段に取り付けた白い壁付け手すり",
    w: 941,
    h: 1150,
  },
  {
    src: "/images/gallery/case-3.jpg",
    alt: "玄関の上がり框に取り付けた渦巻き装飾の手すり",
    w: 1600,
    h: 1600,
  },
  {
    src: "/images/gallery/case-2.jpg",
    alt: "コンクリート外階段と黒いアプローチ手すりのある住宅外観",
    w: 900,
    h: 1600,
  },
  {
    src: "/images/gallery/case-4.jpg",
    alt: "バルコニーの黒いアイアン手すりとウッドデッキ",
    w: 740,
    h: 1600,
  },
]

export function CaseGallery() {
  return (
    <section id="works" className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-[11px] tracking-[0.25em] text-muted-foreground uppercase mb-3">
            Works
          </span>
          <h2 className="font-serif text-[28px] md:text-[32px] text-foreground">施工事例</h2>
          <p className="text-[13px] text-muted-foreground mt-3">
            実際の住まいに取り付けた様子をご紹介します。
          </p>
        </div>

        {/* マソンリーグリッド（next/image はデフォルトで遅延読み込み） */}
        <div className="columns-2 md:columns-3 gap-3 md:gap-4">
          {CASES.map((c) => (
            <figure key={c.src} className="break-inside-avoid mb-3 md:mb-4">
              <div className="overflow-hidden rounded-xl bg-secondary">
                <Image
                  src={c.src}
                  alt={c.alt}
                  width={c.w}
                  height={c.h}
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="w-full h-auto"
                />
              </div>
              {c.caption && (
                <figcaption className="mt-1.5 px-0.5 text-[11px] tracking-wide text-muted-foreground">
                  {c.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>

        {/* もっと見る */}
        <div className="text-center mt-10">
          <Link
            href="/construction"
            className="inline-flex items-center gap-2 text-[13px] text-muted-foreground hover:text-gold transition-colors group"
          >
            <span>施工の流れ・事例をもっと見る</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
