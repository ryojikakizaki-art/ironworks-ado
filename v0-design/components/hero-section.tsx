"use client"

import Image from "next/image"
import { useEffect, useState, useCallback } from "react"
import { Hammer, Truck, Ruler } from "lucide-react"
import { CategoryDock } from "@/components/category-dock"
import { PrimaryCTA } from "@/components/ui/primary-cta"
import { LineIcon } from "@/components/ui/line-icon"
// メモ: ヒーローには価格を出さない（蠣﨑さん指示）。価格訴求は商品ページ側で行う。

/**
 * ヒーロー：1 画面（100vh）の購買誘導型構成。
 * - 背景：施工写真のクロスフェードカルーセル（5 秒ごと）
 * - 上部：キャッチコピー＋見出し（横幅統一・中央寄せ）
 * - 中央：ado ロゴ大（写真の意匠を維持）
 * - 下部：価格小 + CTA 横並び（半透明 / glass 風）+ 信頼バッジ
 * - 最下部：CategoryDock（既存）
 *
 * 旧版は中央 ado ロゴのみで「何の商品か」「いくらか」「どう買うか」がファーストビューに
 * 出ず、広告流入の CV が伸びなかった。価格・CTA・信頼要素を ATF に集約しつつ、
 * ado ロゴの意匠を残した構成。
 */

type HeroImage = { src: string; alt: string }

const heroImages: HeroImage[] = [
  { src: "/images/hero/1140304.jpg", alt: "アイアン手すり 主要カット" },
  { src: "/images/hero/dscf1995.jpg", alt: "アイアン手すり施工例 1" },
  { src: "/images/hero/dscf6186.jpg", alt: "アイアン手すり施工例 2" },
  { src: "/images/hero/dscf6234.jpg", alt: "アイアン手すり施工例 3" },
  { src: "/images/hero/dscf6699.jpg", alt: "アイアン手すり施工例 4" },
  { src: "/images/hero/loft-staircase.jpg", alt: "鉄製手すり付き階段のあるロフトリビング" },
]

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length)
  }, [])

  useEffect(() => {
    const timer = setTimeout(nextSlide, 5000)
    return () => clearTimeout(timer)
  }, [currentSlide, nextSlide])

  return (
    <section className="relative h-screen min-h-[760px] w-full overflow-hidden bg-dark">
      {/* ── 背景：画像カルーセル（クロスフェード） ── */}
      <div className="absolute inset-0 z-0">
        {heroImages.map((media, idx) => (
          <div
            key={media.src}
            className="absolute inset-0 transition-opacity duration-1000 ease-out"
            style={{ opacity: idx === currentSlide ? 1 : 0 }}
            aria-hidden={idx !== currentSlide}
          >
            <Image
              src={media.src}
              alt={media.alt}
              fill
              priority={idx === 0}
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ))}
        {/* 全体暗幕（テキスト可読性） */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/70" />
        {/* ヘッダーゾーン用の追加暗幕 */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/85 via-black/45 to-transparent" />
      </div>

      {/* ── 前景：上に ado ロゴ → 中央に見出し → 下に CTA ＋ 信頼 ──
          justify-between で 3 ブロックを上端・中央・下端へ確実に配置。
          ロゴだけ上に、見出しは中央位置を維持する設計。 */}
      <div className="relative z-10 h-full flex flex-col items-center justify-between px-6 pt-20 md:pt-24 pb-36 md:pb-44">
        {/* 上部：ado ロゴ */}
        <div className="flex flex-col items-center">
          <div className="relative w-[180px] h-[209px] md:w-[210px] md:h-[244px] lg:w-[230px] lg:h-[267px]">
            <Image
              src="/images/ado_logo_W.png"
              alt="IRONWORKS ado"
              fill
              priority
              unoptimized
              sizes="(min-width: 1024px) 230px, (min-width: 768px) 210px, 180px"
              className="object-contain"
            />
          </div>
        </div>

        {/* 中央：見出し＋英語サブ（位置はキープ） */}
        <div className="flex flex-col items-center text-center text-white max-w-[460px]">
          <h1 className="font-serif text-[20px] md:text-[26px] lg:text-[30px] font-medium leading-[1.35] drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)]">
            現代の鍛冶屋、真心こめて直販。
          </h1>
          <p className="mt-2 md:mt-3 font-serif italic text-[10px] md:text-[12px] tracking-[0.25em] text-gold/95 uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
            Real Ironworks. Real Blacksmith.
          </p>
        </div>

        {/* 下部：CTA + 信頼バッジ（価格はヒーローに出さない） */}
        <div className="w-full max-w-[520px] text-center text-white">
          {/* CTA 2 つを grid-cols-2 で完全等幅に揃える */}
          <div className="grid grid-cols-2 gap-3 max-w-[420px] mx-auto mb-5">
            <PrimaryCTA
              href="/products"
              variant="gold-glass"
              size="md"
              className="w-full whitespace-nowrap"
            >
              製品紹介
            </PrimaryCTA>
            <PrimaryCTA
              href="https://lin.ee/Tnjukrf"
              external
              variant="line-glass"
              size="md"
              icon={<LineIcon className="w-4 h-4" />}
              className="w-full whitespace-nowrap"
            >
              LINE で相談
            </PrimaryCTA>
          </div>

          {/* 信頼バッジ */}
          <div className="flex flex-wrap justify-center gap-x-4 md:gap-x-5 gap-y-1.5 text-[11px] md:text-[12px] text-white/85">
            <span className="inline-flex items-center gap-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
              <Hammer className="w-3 h-3 text-gold" aria-hidden />
              鍛冶職人歴 15 年
            </span>
            <span className="inline-flex items-center gap-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
              <Truck className="w-3 h-3 text-gold" aria-hidden />
              全国配送
            </span>
            <span className="inline-flex items-center gap-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
              <Ruler className="w-3 h-3 text-gold" aria-hidden />
              図面相談無料
            </span>
          </div>
        </div>
      </div>

      {/* ── 最下部：カテゴリードック ── */}
      <CategoryDock />
    </section>
  )
}
