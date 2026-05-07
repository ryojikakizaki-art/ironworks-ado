"use client"

import Image from "next/image"
import { useEffect, useState, useCallback } from "react"
import { CategoryDock } from "@/components/category-dock"

/**
 * ヒーロー：1 画面（100vh）のミニマル構成。
 * - 背景：施工写真のクロスフェードカルーセル（5 秒ごと）
 * - 中央：ado ロゴ大（常時固定表示）
 * - 下部：CategoryDock（別コンポーネント）でカテゴリーから商品を呼び出す
 *
 * ※ 旧ヒーロー（500vh→250vh のスクロール演出 + Phase テキスト + CTA）は廃止。
 *    動画 (/videos/hero-reel.mp4) はカルーセルから外し、別所で再利用予定。
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

  // 画像スライドは 5 秒で自動送り（クロスフェード）
  useEffect(() => {
    const timer = setTimeout(nextSlide, 5000)
    return () => clearTimeout(timer)
  }, [currentSlide, nextSlide])

  return (
    <section className="relative h-screen w-full overflow-hidden bg-dark">
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
        {/* 文字・ロゴの可読性を保つ暗幕 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/35 to-black/65" />
      </div>

      {/* ── 中央：ado ロゴ（常時固定） ── */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <div className="relative w-[220px] h-[260px] md:w-[300px] md:h-[360px] lg:w-[360px] lg:h-[420px]">
          <Image
            src="/images/ado_logo_W.png"
            alt="IRONWORKS ado"
            fill
            priority
            unoptimized
            sizes="(min-width: 1024px) 360px, (min-width: 768px) 300px, 220px"
            className="object-contain"
          />
        </div>
      </div>

      {/* ── 下部：カテゴリードック（ホバー / タップで商品リスト展開） ── */}
      <CategoryDock />
    </section>
  )
}
