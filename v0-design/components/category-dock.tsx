"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { CATALOG_PRODUCTS, type CategoryKey } from "@/lib/products/catalog"
import { galleryUrl } from "@/lib/products/display"

/**
 * ヒーロー下部に常時表示されるカテゴリードック。
 *
 * 2026-05-13 改修: 商品サムネを常時マーキー (横スクロール) で表示。
 * - デフォルトで「手すり 横型」の商品が左方向に無限スクロール
 * - カテゴリーラベルをホバー/タップで切替 → 該当カテゴリの商品に差し替わる
 * - サムネにホバー/フォーカスでスクロールを一時停止
 * - クリック/タップで商品ページへ遷移
 *
 * 旧版は「ホバー時にグリッド展開」だったため、トップ進入直後は
 * 商品が一つも見えず GA4 上で離脱が早かった。常時露出 + 横アニメで
 * 視線を集める設計に変更。
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

export function CategoryDock() {
  // null = 全カテゴリの商品をシャッフルせず順番に表示 (デフォルト)
  //        CategoryKey が指定された場合は該当カテゴリのみにフィルタ
  const [activeKey, setActiveKey] = useState<CategoryKey | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // no-op (将来の拡張用)
  }, [])

  const activeProducts = activeKey
    ? CATALOG_PRODUCTS.filter((p) => p.cat === activeKey)
    : CATALOG_PRODUCTS
  // マーキー連続再生のため 2 列分複製
  const marqueeProducts = [...activeProducts, ...activeProducts]
  // 商品数に応じたスクロール時間。一定速度感を保つため上限/下限でクランプ。
  const animationDuration = Math.max(20, Math.min(90, activeProducts.length * 2.8))

  return (
    <div
      ref={containerRef}
      className="absolute inset-x-0 bottom-0 z-20"
    >
      {/* 商品マーキー（常時表示・左方向に無限スクロール） */}
      <div className="relative bg-black/75 backdrop-blur-sm border-t border-white/10 overflow-hidden">
        {/* 左右のフェードマスク（端で商品が突然出現しないよう） */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 md:w-20 bg-gradient-to-r from-black/90 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 md:w-20 bg-gradient-to-l from-black/90 to-transparent z-10" />

        <div
          key={activeKey}
          className="dock-marquee-track flex gap-3 md:gap-4 py-3 md:py-4 px-4"
          style={{
            ["--dock-marquee-duration" as string]: `${animationDuration}s`,
          }}
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
                className="flex-shrink-0"
              >
                {card}
              </a>
            ) : (
              <Link key={`${p.name}-${idx}`} href={p.href} className="flex-shrink-0">
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
