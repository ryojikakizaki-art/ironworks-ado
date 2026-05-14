"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { CATALOG_PRODUCTS, type CategoryKey } from "@/lib/products/catalog"
import { galleryUrl } from "@/lib/products/display"

/**
 * ヒーロー下部に常時表示されるカテゴリードック。
 *
 * 2026-05-14 改修: マーキーを CSS transform アニメから JS 駆動の自動スクロール
 * （実スクロールコンテナ）に変更。
 * - 触れていない間は rAF で scrollLeft を進めて自動マーキー
 * - 触れている間（ポインタ操作中・マウスホバー中）は自動を一時停止し、
 *   overflow-x: auto によりネイティブの横スワイプで手動スクロールできる
 * - 一度ユーザーが手動でスクロールしたら自動スクロールは再開しない
 *   （止めた位置からじわじわ動く違和感を防ぐ）。タップのみ・ホバーのみなら
 *   従来通り再開する
 * - 短いタップは商品ページへ遷移。8px を超えて動いたらドラッグ扱いで遷移しない
 * - 商品を 2 周分複製し、複製先頭カードの offsetLeft 差ぶんで戻してシームレスループ
 *
 * カテゴリーラベルをホバー/タップで切替 → 該当カテゴリの商品に差し替わる。
 */

type DockCategory = {
  key: CategoryKey
  label: string
}

const DOCK_CATEGORIES: DockCategory[] = [
  { key: "handrail_h", label: "手すり 横型" },
  { key: "handrail_v", label: "手すり 縦型" },
  { key: "approach", label: "アプローチ" },
  { key: "fence", label: "フェンス" },
  { key: "door", label: "ドア" },
  { key: "stair", label: "階段" },
  { key: "other", label: "その他" },
]

// マーキーの自動スクロール速度（px/秒）
const AUTO_SCROLL_PX_PER_SEC = 45
// タップかドラッグかの判定しきい値（これ以上動いたらドラッグ＝遷移しない）
const DRAG_THRESHOLD_PX = 8
// ポインタ操作終了後、自動スクロールを再開するまでの待ち時間
const RESUME_DELAY_MS = 1400

export function CategoryDock() {
  // null = 全カテゴリの商品を順番に表示（デフォルト）
  const [activeKey, setActiveKey] = useState<CategoryKey | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // 自動スクロール一時停止の要因（マウスホバー / ポインタ操作 を独立管理）
  const hoverPausedRef = useRef(false)
  const dragPausedRef = useRef(false)
  // タップ/ドラッグ判定用
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)
  const draggedRef = useRef(false)
  // ポインタ操作開始時の scrollLeft（操作で実際にスクロールしたか判定するため）
  const scrollStartRef = useRef(0)
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // 自動スクロールのサブピクセル端数アキュムレータ（iOS Safari の scrollLeft 整数丸め対策）
  const accumRef = useRef(0)

  const activeProducts = activeKey
    ? CATALOG_PRODUCTS.filter((p) => p.cat === activeKey)
    : CATALOG_PRODUCTS
  // マーキー連続再生のため 2 列分複製
  const marqueeProducts = [...activeProducts, ...activeProducts]

  // シームレスループの周期 = 商品 1 周分の幅。
  // scrollWidth/2 だとトラックの px-4 パディングや複製の境目に入る gap のぶん
  // 実際の周期とズレ、折り返し地点（先頭商品が左端に来る瞬間）でガタつくため、
  // 複製先頭カード（index = activeProducts.length）と先頭カードの
  // offsetLeft の差で正確に求める。
  const getLoopPeriod = () => {
    const el = scrollRef.current
    if (!el) return 0
    const first = el.children[0] as HTMLElement | undefined
    const secondCopyFirst = el.children[activeProducts.length] as HTMLElement | undefined
    if (!first || !secondCopyFirst) return 0
    return secondCopyFirst.offsetLeft - first.offsetLeft
  }

  // スクロール位置を「1 周分の範囲内」に補正してシームレスループ
  const normalizeScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const period = getLoopPeriod()
    if (period <= 0) return
    if (el.scrollLeft >= period) el.scrollLeft -= period
    else if (el.scrollLeft <= 0) el.scrollLeft = period - 1
  }

  // 自動スクロール（rAF）。一時停止中はスキップ。activeKey 変更で貼り直す。
  useEffect(() => {
    let rafId = 0
    let prev = performance.now()
    const tick = (now: number) => {
      const el = scrollRef.current
      // バックグラウンド復帰時の巨大 dt で飛びすぎないよう上限を設ける
      const dt = Math.min(now - prev, 50)
      prev = now
      if (el && !hoverPausedRef.current && !dragPausedRef.current) {
        // iOS Safari は scrollLeft が整数に丸められ、サブピクセルの +=
        // （約 0.75px/frame）が読み戻しで詰まって自動スクロールが進まない。
        // 端数を accumRef に貯め、1px 以上たまったら整数分だけ進める。
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
  }, [activeKey])

  // アンマウント時に再開タイマーを掃除
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

  // ポインタ操作終了。
  // ユーザーが実際に手動スクロールした場合は自動スクロールを再開しない
  // （止めた位置からじわじわ動く違和感を防ぐ）。タップのみなら少し置いて再開。
  const endPointer = () => {
    pointerStartRef.current = null
    clearResumeTimer()
    const el = scrollRef.current
    const scrolled = el ? Math.abs(el.scrollLeft - scrollStartRef.current) > 2 : false
    if (draggedRef.current || scrolled) {
      // dragPausedRef は true のまま据え置き（再開しない）
      return
    }
    resumeTimerRef.current = setTimeout(() => {
      dragPausedRef.current = false
    }, RESUME_DELAY_MS)
  }

  const handlePointerEnter = (e: React.PointerEvent) => {
    // マウスホバーのみ一時停止（タッチは pointerdown/up 側で扱う）
    if (e.pointerType === "mouse") hoverPausedRef.current = true
  }
  const handlePointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") hoverPausedRef.current = false
    // ドラッグ中に要素外へ出た場合の保険（pointerup を取りこぼさない）
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
  // ドラッグだった場合はリンク遷移をキャンセル（短いタップのみ遷移）
  const handleClickCapture = (e: React.MouseEvent) => {
    if (draggedRef.current) e.preventDefault()
  }

  return (
    <div className="absolute inset-x-0 bottom-0 z-20">
      {/* 商品マーキー（自動スクロール・触れている間は一時停止して手動スクロール可） */}
      <div className="relative bg-black/75 backdrop-blur-sm border-t border-white/10 overflow-hidden">
        {/* 左右のフェードマスク（端で商品が突然出現しないよう） */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 md:w-20 bg-gradient-to-r from-black/90 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 md:w-20 bg-gradient-to-l from-black/90 to-transparent z-10" />

        <div
          ref={scrollRef}
          key={activeKey}
          onScroll={normalizeScroll}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          onClickCapture={handleClickCapture}
          className="flex gap-3 md:gap-4 py-3 md:py-4 px-4 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {marqueeProducts.map((p, idx) => {
            const isExternal = p.external === true
            const card = (
              <div className="group">
                <div className="relative w-[120px] h-[120px] md:w-[140px] md:h-[140px] overflow-hidden rounded bg-white/5">
                  <Image
                    src={galleryUrl(`${p.img}.jpg`)}
                    alt={p.name}
                    fill
                    sizes="140px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="pt-1.5 px-0.5 w-[120px] md:w-[140px]">
                  <div className="text-[11px] md:text-[12px] font-medium text-white leading-tight truncate group-hover:text-gold transition-colors">
                    {p.name}
                  </div>
                  <div className="text-[10px] md:text-[11px] text-white/60 mt-0.5">
                    {p.price > 0
                      ? `¥${p.price.toLocaleString()}${p.priceFrom ? "〜" : ""}`
                      : "要見積もり"}
                  </div>
                </div>
              </div>
            )
            // key は重複対策で idx を付与（marqueeProducts が同一商品を 2 周持つため）
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
              <Link
                key={`${p.name}-${idx}`}
                href={p.href}
                draggable={false}
                className="flex-shrink-0"
              >
                {card}
              </Link>
            )
          })}
        </div>
      </div>

      {/* カテゴリーラベル（常時表示・ホバー/タップで上のマーキー商品を切替）
          nav から外れたら activeKey を null に戻して全商品マーキーへ復帰 */}
      <nav
        className="bg-black/85 backdrop-blur-sm border-t border-white/15"
        onMouseLeave={() => setActiveKey(null)}
      >
        <div className="max-w-[1400px] mx-auto px-2 lg:px-6">
          <ul className="flex items-stretch overflow-x-auto scrollbar-hide">
            {DOCK_CATEGORIES.map((cat) => {
              const active = activeKey === cat.key
              return (
                <li key={cat.key} className="flex-1 min-w-[120px] md:min-w-[150px]">
                  <button
                    type="button"
                    onMouseEnter={() => setActiveKey(cat.key)}
                    onFocus={() => setActiveKey(cat.key)}
                    onClick={() => setActiveKey((prev) => (prev === cat.key ? null : cat.key))}
                    className={`w-full px-3 py-3 md:py-4 text-[13px] md:text-[15px] tracking-[0.15em] transition-all duration-300 ${
                      active
                        ? "text-gold"
                        : "text-white/85 hover:text-white"
                    }`}
                  >
                    <span className="block font-serif">{cat.label}</span>
                    <span
                      className={`block h-px mx-auto mt-2 transition-all duration-300 ${
                        active
                          ? "w-8 bg-gold"
                          : "w-0 bg-white"
                      }`}
                    />
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>
    </div>
  )
}
