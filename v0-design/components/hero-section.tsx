"use client"

import Image from "next/image"
import { useEffect, useState, useCallback } from "react"
import { CategoryDock } from "@/components/category-dock"
// メモ: ヒーローには価格を出さない（蠣﨑さん指示）。価格訴求は商品ページ側で行う。

/**
 * ヒーロー：1 画面（100vh）の購買誘導型構成。
 * - 背景：施工写真のクロスフェードカルーセル（5 秒ごと）
 * - 上部：ado ロゴ
 * - 中央：見出し（ゴシック・日本語）＋英語サブ（白）
 * - 最下部：CategoryDock（常時マーキー）
 *
 * 2026-05-13: CTA ボタンと信頼バッジを撤去し、ロゴ＋見出しに集中させる構成へ。
 *             誘導は最下部の CategoryDock マーキーが担う。
 */

type HeroImage = { src: string; alt: string }

const heroImages: HeroImage[] = [
  { src: "/images/hero/1140304.jpg", alt: "アイアン手すり 主要カット" },
  { src: "/images/hero/dscf1995.jpg", alt: "アイアン手すり施工例 1" },
  { src: "/images/hero/dscf6186.jpg", alt: "アイアン手すり施工例 2" },
  { src: "/images/hero/dscf6234.jpg", alt: "アイアン手すり施工例 3" },
  { src: "/images/hero/dscf6699.jpg", alt: "アイアン手すり施工例 4" },
]

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  // 2 枚目以降のカルーセル画像は遅延マウント（初期ロード軽量化・2026-06-12 B群⑫）。
  // 最初の切替（5 秒）までに読み込みが終わるよう 2.5 秒後にマウントする。
  const [restMounted, setRestMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setRestMounted(true), 2500)
    return () => clearTimeout(t)
  }, [])

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
            {(idx === 0 || restMounted) && (
              <Image
                src={media.src}
                alt={media.alt}
                fill
                priority={idx === 0}
                sizes="100vw"
                className="object-cover"
              />
            )}
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
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 pt-20 md:pt-24 pb-80 md:pb-72">
        {/* ado ロゴ + キャッチを 1 グループとして、ヒーロー (ドック上の領域) 中央に縦配置 */}
        <div className="flex flex-col items-center gap-16 md:gap-20">
          {/* ado ロゴ */}
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

          {/* 見出し */}
          <div className="flex flex-col items-center text-center text-white max-w-[520px]">
            <h1 className="font-sans text-[22px] md:text-[28px] lg:text-[32px] font-medium tracking-wide leading-[1.5] text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)]">
              <span className="block">毎日手にするものだから、</span>
              <span className="block">手触りのいいものを</span>
            </h1>
            <p className="mt-3 md:mt-4 font-serif text-[9px] md:text-[10px] tracking-[0.25em] text-white/90 uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
              Real Ironworks. Real Blacksmith.
            </p>
          </div>
        </div>
      </div>

      {/* ── 最下部：カテゴリードック ── */}
      <CategoryDock />
    </section>
  )
}
