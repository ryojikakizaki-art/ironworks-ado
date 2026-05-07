"use client"

import Link from "next/link"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { CATALOG_PRODUCTS, type CategoryKey } from "@/lib/products/catalog"
import { galleryUrl } from "@/lib/products/display"

/**
 * ヒーロー下部に常時表示されるカテゴリードック。
 * - PC: カテゴリーラベルにホバー → 商品リストが上方向に展開
 * - モバイル: タップでトグル
 *
 * 商品リストはヒーロー下半分を覆うように出現。クリック外でクローズ。
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
  const [activeKey, setActiveKey] = useState<CategoryKey | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 範囲外クリックで閉じる（モバイルのトグル用）
  useEffect(() => {
    if (!activeKey) return
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveKey(null)
      }
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [activeKey])

  const activeProducts = activeKey
    ? CATALOG_PRODUCTS.filter((p) => p.cat === activeKey)
    : []

  return (
    <div
      ref={containerRef}
      className="absolute inset-x-0 bottom-0 z-20"
      onMouseLeave={() => setActiveKey(null)}
    >
      {/* 商品リストパネル（上方向に展開） */}
      <AnimatePresence>
        {activeKey && (
          <motion.div
            key={activeKey}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 bottom-full bg-black/85 backdrop-blur-sm border-t border-white/10"
          >
            <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6 md:py-8">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4">
                {activeProducts.map((p) => {
                  const isExternal = p.external === true
                  const card = (
                    <div className="group">
                      <div className="relative aspect-square overflow-hidden rounded bg-white/5">
                        <Image
                          src={galleryUrl(`${p.img}.jpg`)}
                          alt={p.name}
                          fill
                          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 16vw, 12vw"
                          className="object-contain transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="pt-1.5 px-0.5">
                        <div className="text-[10px] md:text-[11px] font-medium text-white leading-tight truncate group-hover:text-gold transition-colors">
                          {p.name}
                        </div>
                        <div className="text-[9px] md:text-[10px] text-white/60 mt-0.5">
                          {p.price > 0
                            ? `¥${p.price.toLocaleString()}${p.priceFrom ? "〜" : ""}`
                            : "要見積もり"}
                        </div>
                      </div>
                    </div>
                  )
                  return isExternal ? (
                    <a
                      key={p.name}
                      href={p.href}
                      target="_blank"
                      rel="noopener"
                      className="block"
                    >
                      {card}
                    </a>
                  ) : (
                    <Link key={p.name} href={p.href} className="block">
                      {card}
                    </Link>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* カテゴリーラベル（常時表示） */}
      <nav className="bg-black/80 backdrop-blur-sm border-t border-white/15">
        <div className="max-w-[1400px] mx-auto px-2 lg:px-6">
          <ul className="flex items-stretch overflow-x-auto scrollbar-hide">
            {DOCK_CATEGORIES.map((cat) => {
              const active = activeKey === cat.key
              return (
                <li key={cat.key} className="flex-1 min-w-[110px] md:min-w-[140px]">
                  <button
                    type="button"
                    onMouseEnter={() => setActiveKey(cat.key)}
                    onClick={() =>
                      setActiveKey((prev) => (prev === cat.key ? null : cat.key))
                    }
                    className={`w-full px-3 py-4 md:py-5 text-[11px] md:text-[13px] tracking-[0.15em] transition-all duration-300 ${
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
