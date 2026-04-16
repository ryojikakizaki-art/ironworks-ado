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
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8 lg:py-12">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">Item</p>
                <h1 className="font-serif text-2xl lg:text-4xl text-foreground">製品一覧</h1>
              </div>

              {/* Filter bar */}
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setFilter(c.key as FilterKey)}
                    className={`px-3 py-1.5 text-[9px] tracking-[0.15em] uppercase border rounded-full transition-colors ${
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

        {/* Products grid — 6列ミニマル */}
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          <motion.div
            className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3"
            layout
          >
            {products.map((p) => {
              const isExternal = p.external === true
              const content = (
                <div className="group">
                  <div className="relative aspect-square overflow-hidden bg-secondary rounded-lg">
                    <Image
                      src={galleryUrl(`${p.img}.jpg`)}
                      alt={p.name}
                      fill
                      sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
                      className="object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                    {p.badge && (
                      <span className="absolute top-1.5 left-1.5 bg-gold text-dark text-[7px] tracking-[0.15em] uppercase font-semibold px-1.5 py-0.5 rounded-sm">
                        {p.badge}
                      </span>
                    )}
                    {isExternal && (
                      <ExternalLink className="absolute top-1.5 right-1.5 w-3 h-3 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="pt-2 pb-1 px-0.5">
                    <div className="text-[11px] font-medium text-foreground leading-tight truncate group-hover:text-gold transition-colors">
                      {p.name}
                    </div>
                    {p.price > 0 ? (
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        ¥{p.price.toLocaleString()}
                      </div>
                    ) : (
                      <div className="text-[10px] text-muted-foreground mt-0.5">要見積もり</div>
                    )}
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
                  {content}
                </a>
              ) : (
                <Link key={p.name} href={p.href} className="block">
                  {content}
                </Link>
              )
            })}
          </motion.div>

          {/* Custom CTA */}
          <div className="mt-12 border border-border p-6 lg:p-8 bg-card rounded-xl grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <div className="text-base font-light mb-1">ご要望に合わせたカスタムオーダー</div>
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                掲載製品以外のデザイン・サイズ・仕様にも対応します。まずはお気軽にお問い合わせください。
              </p>
            </div>
            <a
              href="/contact"
              className="inline-block px-6 py-3 border border-gold text-gold text-[10px] tracking-[0.2em] uppercase rounded-full hover:bg-gold hover:text-dark transition-colors whitespace-nowrap text-center"
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
