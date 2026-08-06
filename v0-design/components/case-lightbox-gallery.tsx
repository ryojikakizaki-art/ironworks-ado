"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import type { ConstructionCase } from "@/lib/construction-cases"

// 施工事例ギャラリー。
// href があるカードは画像タップでそのままリンク先へ遷移する。
// href がないカードはタップで拡大表示（商品ページの旧Lightbox＝2026-05-12廃止・
// モバイルで黒バック+×だけで不便、の反省を踏まえ、背景タップで閉じる・
// スワイプで前後移動・現在位置表示を備える）。
// サムネイルは aspect-[4/5] に揃えた整列グリッド。
export function CaseLightboxGallery({ cases }: { cases: ConstructionCase[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const touchStartX = useRef<number | null>(null)

  const close = useCallback(() => setActiveIndex(null), [])
  const showPrev = useCallback(
    () => setActiveIndex((i) => (i === null ? null : (i - 1 + cases.length) % cases.length)),
    [cases.length],
  )
  const showNext = useCallback(
    () => setActiveIndex((i) => (i === null ? null : (i + 1) % cases.length)),
    [cases.length],
  )

  useEffect(() => {
    if (activeIndex === null) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
      if (e.key === "ArrowLeft") showPrev()
      if (e.key === "ArrowRight") showNext()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener("keydown", onKey)
    }
  }, [activeIndex, close, showPrev, showNext])

  const active = activeIndex !== null ? cases[activeIndex] : null

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {cases.map((c, i) => {
          const tile = (
            <div className="group relative block w-full aspect-[4/5] overflow-hidden rounded-xl bg-secondary">
              <Image
                src={c.src}
                alt={c.alt}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
                {c.prefecture && (
                  <p className="text-[9px] md:text-[10px] tracking-[0.3em] uppercase text-gold mb-1">
                    {c.prefecture}
                  </p>
                )}
                <p className="text-[12px] md:text-[13px] text-white leading-snug">{c.caption}</p>
              </div>
            </div>
          )

          if (!c.href) {
            return (
              <button
                key={c.src}
                type="button"
                onClick={() => setActiveIndex(i)}
                className="block w-full text-left"
                aria-label={`${c.alt}を拡大表示`}
              >
                {tile}
              </button>
            )
          }

          const isExternal = c.href.startsWith("http")
          return isExternal ? (
            <a key={c.src} href={c.href} target="_blank" rel="noopener noreferrer" className="block w-full">
              {tile}
            </a>
          ) : (
            <Link key={c.src} href={c.href} className="block w-full">
              {tile}
            </Link>
          )
        })}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 bg-black/92 flex items-center justify-center px-2 md:px-6"
          onClick={close}
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return
            const dx = e.changedTouches[0].clientX - touchStartX.current
            if (dx > 50) showPrev()
            else if (dx < -50) showNext()
            touchStartX.current = null
          }}
        >
          <button
            type="button"
            onClick={close}
            aria-label="閉じる"
            className="absolute top-4 right-4 md:top-6 md:right-6 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              showPrev()
            }}
            aria-label="前の写真"
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              showNext()
            }}
            aria-label="次の写真"
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center max-w-[92vw]" onClick={(e) => e.stopPropagation()}>
            <Image
              key={active.src}
              src={active.src}
              alt={active.alt}
              width={active.w}
              height={active.h}
              sizes="92vw"
              priority
              className="w-auto h-auto max-w-[92vw] max-h-[72vh] object-contain rounded-lg"
            />
            <div className="mt-3 text-center">
              {active.prefecture && (
                <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-1">{active.prefecture}</p>
              )}
              <p className="text-[13px] text-white/90">{active.caption}</p>
              <p className="text-[11px] text-white/50 mt-2">
                {activeIndex! + 1} / {cases.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
