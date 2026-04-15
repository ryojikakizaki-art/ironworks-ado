"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CATALOG_PRODUCTS, CATEGORIES, type CategoryKey } from "@/lib/products/catalog"
import { galleryUrl } from "@/lib/products/display"
import { ExternalLink } from "lucide-react"

type FilterKey = CategoryKey | "all"

export default function ProductListPage() {
  const [filter, setFilter] = useState<FilterKey>("all")

  const products = useMemo(() => {
    if (filter === "all") return CATALOG_PRODUCTS
    return CATALOG_PRODUCTS.filter((p) => p.cat === filter)
  }, [filter])

  return (
    <>
      <Header />
      <main className="pt-20 lg:pt-24 pb-20 bg-background">
        {/* Page Header */}
        <div className="border-b border-border">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Item</p>
                <h1 className="font-serif text-3xl lg:text-5xl text-foreground">製品一覧</h1>
              </div>

              {/* Filter bar */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setFilter(c.key as FilterKey)}
                    className={`px-4 py-2 text-[10px] tracking-[0.2em] uppercase border transition-colors ${
                      filter === c.key
                        ? "border-gold text-gold bg-gold/10"
                        : "border-border text-muted-foreground hover:border-gold hover:text-gold"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Products grid */}
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[2px]"
            layout
          >
            {products.map((p) => {
              const isExternal = p.external === true
              const content = (
                <>
                  <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
                    <Image
                      src={galleryUrl(`${p.img}.jpg`)}
                      alt={p.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {p.badge && (
                      <span className="absolute top-4 left-4 bg-gold text-dark text-[9px] tracking-[0.25em] uppercase font-semibold px-2.5 py-1">
                        {p.badge}
                      </span>
                    )}
                    {isExternal && (
                      <span className="absolute top-4 right-4 bg-black/60 text-white text-[9px] tracking-wider uppercase px-2 py-1 flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> STORES
                      </span>
                    )}
                  </div>
                  <div className="p-6 border-t border-border bg-card">
                    <div className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">
                      {p.label}
                    </div>
                    <div className="text-lg font-light text-foreground mb-1">
                      {p.name}
                    </div>
                    <div className="text-[11px] tracking-wide text-muted-foreground mb-4">
                      {p.sub}
                    </div>
                    <div className="pt-4 border-t border-border flex items-baseline justify-between">
                      {p.price > 0 ? (
                        <>
                          <span className="text-[10px] tracking-wider text-muted-foreground uppercase">
                            From
                          </span>
                          <div>
                            <span className="text-xl font-light text-foreground">
                              ¥{p.price.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-muted-foreground ml-1">
                              税込
                            </span>
                          </div>
                        </>
                      ) : (
                        <span className="text-[12px] tracking-wide text-muted-foreground">
                          要見積もり
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )
              return isExternal ? (
                <a
                  key={p.name}
                  href={p.href}
                  target="_blank"
                  rel="noopener"
                  className="group bg-card block"
                >
                  {content}
                </a>
              ) : (
                <Link key={p.name} href={p.href} className="group bg-card block">
                  {content}
                </Link>
              )
            })}
          </motion.div>

          {/* Custom CTA */}
          <div className="mt-16 border border-border p-8 lg:p-12 bg-card grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <div className="text-lg font-light mb-2">ご要望に合わせたカスタムオーダー</div>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                掲載製品以外のデザイン・サイズ・仕様にも対応します。
                <br />
                まずはお気軽にお問い合わせください。
              </p>
            </div>
            <a
              href="/contact"
              className="inline-block px-8 py-4 border border-gold text-gold text-[10px] tracking-[0.3em] uppercase hover:bg-gold hover:text-dark transition-colors whitespace-nowrap text-center"
            >
              お問い合わせ
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
