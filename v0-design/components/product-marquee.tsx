"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useRef } from "react"
import { ArrowRight } from "lucide-react"
import { CATALOG_PRODUCTS } from "@/lib/products/catalog"
import { galleryUrl } from "@/lib/products/display"

/**
 * 全商品マーキー（タスク5-1）。
 * 元はヒーロー下部 CategoryDock 内にあった 30 商品ループを、蠣﨑さんの判断で
 * ページ下部へ移動したもの。スクロール駆動ロジックは旧 CategoryDock から踏襲。
 * ページ下部は白背景のため配色をライトに変更（ダーク背景は使わない方針）。
 *
 * - 触れていない間は rAF で scrollLeft を進めて自動マーキー
 * - 触れている間は自動を一時停止し、ネイティブの横スワイプで手動スクロール可
 * - 一度手動でスクロールしたら自動は再開しない
 * - 短いタップは商品ページへ遷移。8px を超えて動いたらドラッグ扱いで遷移しない
 * - 商品を 2 周分複製し、複製先頭カードの offsetLeft 差ぶんで戻してシームレスループ
 */

const AUTO_SCROLL_PX_PER_SEC = 45
const DRAG_THRESHOLD_PX = 8
const RESUME_DELAY_MS = 1400

export function ProductMarquee() {
  const scrollRef = useRef<HTMLDivElement>(null)

  const hoverPausedRef = useRef(false)
  const dragPausedRef = useRef(false)
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)
  const draggedRef = useRef(false)
  const scrollStartRef = useRef(0)
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const accumRef = useRef(0)

  const marqueeProducts = [...CATALOG_PRODUCTS, ...CATALOG_PRODUCTS]

  const getLoopPeriod = () => {
    const el = scrollRef.current
    if (!el) return 0
    const first = el.children[0] as HTMLElement | undefined
    const secondCopyFirst = el.children[CATALOG_PRODUCTS.length] as HTMLElement | undefined
    if (!first || !secondCopyFirst) return 0
    return secondCopyFirst.offsetLeft - first.offsetLeft
  }

  const normalizeScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const period = getLoopPeriod()
    if (period <= 0) return
    if (el.scrollLeft >= period) el.scrollLeft -= period
    else if (el.scrollLeft <= 0) el.scrollLeft = period - 1
  }

  useEffect(() => {
    let rafId = 0
    let prev = performance.now()
    const tick = (now: number) => {
      const el = scrollRef.current
      const dt = Math.min(now - prev, 50)
      prev = now
      if (el && !hoverPausedRef.current && !dragPausedRef.current) {
        accumRef.current += (AUTO_SCROLL_PX_PER_SEC * dt) / 1000
        const step = Math.floor(accumRef.current)
        if (step >= 1) {
          accumRef.current -= step
          el.scrollLeft += step
          normalizeScroll()
        }
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    }
  }, [])

  const clearResumeTimer = () => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current)
      resumeTimerRef.current = null
    }
  }

  const endPointer = () => {
    pointerStartRef.current = null
    clearResumeTimer()
    const el = scrollRef.current
    const scrolled = el ? Math.abs(el.scrollLeft - scrollStartRef.current) > 2 : false
    if (draggedRef.current || scrolled) return
    resumeTimerRef.current = setTimeout(() => {
      dragPausedRef.current = false
    }, RESUME_DELAY_MS)
  }

  const handlePointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") hoverPausedRef.current = true
  }
  const handlePointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") hoverPausedRef.current = false
    if (pointerStartRef.current) endPointer()
  }
  const handlePointerDown = (e: React.PointerEvent) => {
    clearResumeTimer()
    dragPausedRef.current = true
    draggedRef.current = false
    pointerStartRef.current = { x: e.clientX, y: e.clientY }
    scrollStartRef.current = scrollRef.current?.scrollLeft ?? 0
  }
  const handlePointerMove = (e: React.PointerEvent) => {
    const start = pointerStartRef.current
    if (!start) return
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > DRAG_THRESHOLD_PX) {
      draggedRef.current = true
    }
  }
  const handleClickCapture = (e: React.MouseEvent) => {
    if (draggedRef.current) e.preventDefault()
  }

  return (
    <section className="py-16 md:py-20 bg-white border-t border-border">
      <div className="max-w-7xl mx-auto px-6 mb-8 flex items-end justify-between">
        <div>
          <span className="inline-block text-[11px] tracking-[0.25em] text-muted-foreground uppercase mb-2">
            Line Up
          </span>
          <h2 className="font-serif text-[24px] md:text-[28px] text-foreground">製品一覧</h2>
        </div>
        <Link
          href="/products"
          className="group inline-flex items-center gap-2 text-[13px] text-muted-foreground hover:text-gold transition-colors pb-1"
        >
          <span>すべての製品を見る</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="relative overflow-hidden">
        {/* 左右のフェードマスク */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 md:w-20 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 md:w-20 bg-gradient-to-l from-white to-transparent z-10" />

        <div
          ref={scrollRef}
          onScroll={normalizeScroll}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          onClickCapture={handleClickCapture}
          className="flex gap-3 md:gap-4 py-1 px-4 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {marqueeProducts.map((p, idx) => {
            const isExternal = p.external === true
            const card = (
              <div className="group">
                <div className="relative w-[120px] h-[120px] md:w-[140px] md:h-[140px] overflow-hidden rounded bg-secondary">
                  <Image
                    src={galleryUrl(`${p.img}.jpg`, "fit=cover,w=300,h=300")}
                    alt={p.name}
                    fill
                    sizes="140px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="pt-1.5 px-0.5 w-[120px] md:w-[140px]">
                  <div className="text-[11px] md:text-[12px] font-medium text-foreground leading-tight truncate group-hover:text-gold transition-colors">
                    {p.name}
                  </div>
                  <div className="text-[10px] md:text-[11px] text-muted-foreground mt-0.5">
                    {p.price > 0
                      ? `¥${p.price.toLocaleString()}${p.priceFrom ? "〜" : ""}`
                      : "要見積もり"}
                  </div>
                </div>
              </div>
            )
            return isExternal ? (
              <a
                key={`${p.name}-${idx}`}
                href={p.href}
                target="_blank"
                rel="noopener"
                draggable={false}
                className="flex-shrink-0"
              >
                {card}
              </a>
            ) : (
              <Link key={`${p.name}-${idx}`} href={p.href} draggable={false} className="flex-shrink-0">
                {card}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
