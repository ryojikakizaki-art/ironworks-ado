"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Mail, MessageSquare, ShoppingBag, Minus, Plus, Hammer, Paintbrush, Ruler, Wrench, Sparkles, Clock, Truck, ShieldCheck } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PrimaryCTA } from "@/components/ui/primary-cta"
import type { SimpleProduct, TrustBadgeIcon } from "@/lib/products/simple"
import { galleryUrl, type FeatureIconName } from "@/lib/products/display"
import { getProductStructuredData } from "@/lib/products/structured-data"
import { getRelatedProducts, CATALOG_PRODUCTS } from "@/lib/products/catalog"
import { KaigoNotice } from "@/components/kaigo-notice"
import { EmbeddedCheckoutModal } from "@/components/checkout/embedded-checkout-modal"
import { fireGtagEvent } from "@/lib/gtag"
import { FinishCommitment } from "@/components/finish-commitment"

const FEATURE_ICON_MAP: Record<FeatureIconName, typeof Hammer> = {
  Hammer,
  Paintbrush,
  Ruler,
  Wrench,
}

/** TrustBadge アイコン名 → lucide-react コンポーネントへのマップ */
const TRUST_BADGE_ICON_MAP: Record<TrustBadgeIcon, typeof Sparkles> = {
  Sparkles,
  Hammer,
  Clock,
  Mail,
  Truck,
  ShieldCheck,
}

/**
 * ATF（ファーストビュー）の価格ブロック。
 * priceBuildup が指定されていれば「単価表示 + 例示」を優先表示し、価格ショックを和らげる。
 * 未指定の商品はこれまで通り basePrice 単独表示。
 */
function PriceBlock({ product }: { product: SimpleProduct }) {
  const buildup = product.priceBuildup
  if (buildup) {
    return (
      <div className="mb-8 pb-8 border-b border-border">
        <p className="text-xs text-muted-foreground mb-1 tracking-wider">PRICE</p>
        <p className="font-serif text-3xl text-dark">
          ¥{buildup.unitPrice.toLocaleString()}
          <span className="text-3xl">〜</span>
          <span className="text-sm text-muted-foreground ml-1">/ {buildup.unitLabel}</span>
          <span className="text-sm text-muted-foreground ml-2">（税込）</span>
        </p>
        {buildup.unitNote && (
          <p className="text-[12px] md:text-[13px] text-muted-foreground leading-relaxed mt-2">
            {buildup.unitNote}
          </p>
        )}
        {buildup.examples && buildup.examples.length > 0 && (
          <div className="mt-4 rounded-md bg-white border border-gold/20 px-4 py-3">
            <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase mb-1.5">
              Example
            </p>
            {buildup.examples.map((ex, i) => (
              <div key={i} className={i > 0 ? "mt-2" : ""}>
                <p className="text-[13px] md:text-[14px] text-dark leading-relaxed">
                  {ex.label}
                </p>
                <p className="font-serif text-[18px] md:text-[20px] text-dark mt-0.5">
                  ¥{ex.price.toLocaleString()}
                  <span className="text-[12px] text-muted-foreground ml-1.5">（税込）</span>
                </p>
                {ex.note && (
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                    {ex.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
  return (
    <div className="mb-8 pb-8 border-b border-border">
      <p className="text-xs text-muted-foreground mb-1 tracking-wider">PRICE</p>
      <p className="font-serif text-3xl text-dark">
        ¥{product.basePrice.toLocaleString()}{product.priceFrom ? "〜" : ""}
        <span className="text-sm text-muted-foreground ml-2">
          {product.shippingIncluded
            ? "（税込・送料込）"
            : product.priceFrom
            ? "（税込）"
            : "（税込・送料別）"}
        </span>
      </p>
      {product.priceNote && (
        <p className="text-[12px] md:text-[13px] text-muted-foreground leading-relaxed mt-2">
          {product.priceNote}
        </p>
      )}
    </div>
  )
}

/**
 * 価格内訳テーブル（Specs 下に配置）。
 * オーダーメイド商品の長さ別価格を一覧表示し、お客様が即計算できる透明性を提供。
 */
function PriceTable({ buildup }: { buildup: NonNullable<SimpleProduct["priceBuildup"]> }) {
  if (!buildup.options && !buildup.table) return null
  return (
    <section className="mt-20 pt-12 border-t border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-7 bg-gold rounded-full" />
        <h2 className="font-serif text-2xl text-dark">価格について</h2>
      </div>
      <p className="text-[13px] md:text-[14px] text-muted-foreground leading-loose mb-8">
        オーダーメイドのため、長さ・装飾の構成によって価格が変わります。下記の単価と価格表を目安にご検討ください。正確な金額は図面・写真をお送りいただければ無料でお見積もりいたします。
      </p>

      {buildup.options && buildup.options.length > 0 && (
        <div className="mb-10">
          <h3 className="text-xs tracking-[0.3em] text-muted-foreground uppercase mb-4">
            Unit prices
          </h3>
          <dl className="divide-y divide-border border-y border-border">
            <div className="grid grid-cols-12 gap-4 py-3">
              <dt className="text-[14px] text-dark col-span-7 md:col-span-8">
                {buildup.unitLabel}
                <span className="block text-[11px] text-muted-foreground mt-0.5">
                  鍛冶職人手打ち・22φ 無垢鉄
                </span>
              </dt>
              <dd className="text-[14px] text-dark col-span-5 md:col-span-4 text-right font-serif">
                ¥{buildup.unitPrice.toLocaleString()}
              </dd>
            </div>
            {buildup.options.map((opt) => (
              <div key={opt.label} className="grid grid-cols-12 gap-4 py-3">
                <dt className="text-[14px] text-dark col-span-7 md:col-span-8">
                  {opt.label}
                  {opt.note && (
                    <span className="block text-[11px] text-muted-foreground mt-0.5">
                      {opt.note}
                    </span>
                  )}
                </dt>
                <dd className="text-[14px] text-dark col-span-5 md:col-span-4 text-right font-serif">
                  +¥{opt.price.toLocaleString()}
                  {opt.unit && (
                    <span className="text-[11px] text-muted-foreground ml-1">/{opt.unit}</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {buildup.table && (() => {
        const table = buildup.table
        return (
          <div>
            <h3 className="text-xs tracking-[0.3em] text-muted-foreground uppercase mb-4">
              Price examples
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-y border-border text-[14px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-[12px] font-normal text-muted-foreground tracking-wider">
                      長さ
                    </th>
                    <th className="text-right py-3 px-2 text-[12px] font-normal text-muted-foreground tracking-wider">
                      {table.primaryLabel}
                    </th>
                    {table.altLabel && (
                      <th className="text-right py-3 px-2 text-[12px] font-normal text-muted-foreground tracking-wider">
                        {table.altLabel}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row) => (
                    <tr key={row.length} className="border-b border-border last:border-b-0">
                      <td className="py-3 px-2 text-dark">{row.length}</td>
                      <td className="py-3 px-2 text-right font-serif text-dark">
                        ¥{row.primaryPrice.toLocaleString()}
                      </td>
                      {table.altLabel && (
                        <td className="py-3 px-2 text-right font-serif text-muted-foreground">
                          {row.altPrice ? `¥${row.altPrice.toLocaleString()}` : "—"}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {table.footnote && (
              <p className="text-[12px] text-muted-foreground leading-relaxed mt-4">
                {table.footnote}
              </p>
            )}
          </div>
        )
      })()}
    </section>
  )
}

/**
 * ATF（ファーストビュー）に縦並びで安心要素を提示するバッジリスト。
 * - 価格直下に挿入し、価格ショックを和らげつつ高単価商品の検討材料を即座に提示する
 * - ハンドメイドEC の品位を保つため装飾は最小限（左にゴールドアイコン + ラベル + 補足）
 * - モバイルでもデスクトップでも縦 4 行を維持（高さよりも視認性優先）
 */
function TrustBadges({ badges }: { badges: NonNullable<SimpleProduct["trustBadges"]> }) {
  return (
    <ul className="mb-8 pb-8 border-b border-border space-y-4">
      {badges.map((badge, i) => {
        const Icon = TRUST_BADGE_ICON_MAP[badge.icon] ?? Sparkles
        return (
          <li key={i} className="flex items-start gap-4">
            <span className="shrink-0 mt-0.5 inline-flex w-6 h-6 items-center justify-center text-gold">
              <Icon className="w-5 h-5" strokeWidth={1.6} />
            </span>
            <span className="flex-1">
              <span className="block font-serif text-[15px] md:text-[16px] text-dark leading-snug">
                {badge.label}
              </span>
              {badge.sub && (
                <span className="block text-[12px] md:text-[13px] text-muted-foreground leading-relaxed mt-0.5">
                  {badge.sub}
                </span>
              )}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

function priceLabel(price: number, priceFrom = false): string {
  if (price <= 0) return "お見積もり"
  return `¥${price.toLocaleString()}${priceFrom ? "〜" : ""}`
}

/** FAQ アコーディオン項目 */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left hover:text-gold transition-colors"
        aria-expanded={open}
      >
        <span className="font-serif text-[16px] font-medium text-foreground leading-relaxed">{q}</span>
        <span className={`shrink-0 w-7 h-7 rounded-full border border-gold/20 flex items-center justify-center transition-transform ${open ? "rotate-45 border-gold" : ""}`}>
          <Plus className="w-4 h-4" />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="text-[14px] leading-loose text-muted-foreground pb-5 whitespace-pre-line">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** 施工事例 横スライダー */
function CaseStudySlider({ images, productName }: { images: string[]; productName: string }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const scroll = (dir: "prev" | "next") => {
    const el = ref.current
    if (!el) return
    const dx = (el.clientWidth ?? 320) * 0.85
    el.scrollBy({ left: dir === "next" ? dx : -dx, behavior: "smooth" })
  }
  return (
    <div className="relative">
      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {images.map((id, i) => (
          <div key={`${id}-${i}`} className="relative shrink-0 w-[78%] sm:w-[55%] md:w-[42%] lg:w-[32%] aspect-[4/3] bg-secondary rounded-lg overflow-hidden snap-start">
            <Image
              src={galleryUrl(id)}
              alt={`${productName} 施工事例 ${i + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 78vw, 32vw"
            />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <>
          <button
            onClick={() => scroll("prev")}
            aria-label="前の施工事例"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("next")}
            aria-label="次の施工事例"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  )
}

/**
 * シンプルな商品詳細ページ（手すり以外の 17 商品向け）
 *
 * - 画像ギャラリー（/public/images/products/{slug}/ から読み込み）
 * - 商品説明・スペック表
 * - 価格 > 0: 表示価格 + ご購入ボタン（Stripe — 追って実装）
 * - 価格 = 0: 「お見積もりを取る」ボタン → /contact （商品プリセレクト）
 *
 * 画像が未配置でも壊れず、placeholder としてプレースホルダーが表示される
 */
export function SimpleProductPage({ product }: { product: SimpleProduct }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [hoveredImage, setHoveredImage] = useState<number | null>(null)
  // モバイル: ヒーロー画像のスワイプ用 (2026-05-12)
  // X/Y 両方記録して縦スクロールと区別する
  const touchStartXRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)

  // 画像 URL を構築：STORES CDN から id を解決
  const imageUrls = product.images.map((id) => galleryUrl(id))

  // 介護保険ブロックの表示判定（カタログ上の手すりカテゴリのみ）
  const isHandrail = CATALOG_PRODUCTS.some(
    (p) => p.href === `/products/${product.slug}` && p.cat.startsWith("handrail"),
  )

  const goNext = () => setSelectedImage((i) => (i + 1) % imageUrls.length)
  const goPrev = () => setSelectedImage((i) => (i - 1 + imageUrls.length) % imageUrls.length)

  const isQuoteOnly = product.basePrice === 0
  // 送料込・固定価格の小物は Stripe 直接決済が可能
  const isDirectCheckout = !isQuoteOnly && product.shippingIncluded === true
  const [quantity, setQuantity] = useState(1)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  // Embedded Checkout: clientSecret が入ったらモーダルが開く
  const [checkoutClientSecret, setCheckoutClientSecret] = useState<string | null>(null)

  const handleDirectCheckout = async () => {
    setIsCheckingOut(true)
    setCheckoutError(null)
    fireGtagEvent("begin_checkout", {
      currency: "JPY",
      value: product.basePrice * quantity,
      checkout_method: "card",
      items: [{ item_id: product.slug, item_name: product.nameEn, quantity }],
    })
    try {
      const res = await fetch("/api/checkout/simple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: product.slug, quantity }),
      })
      const data = await res.json()
      if (!res.ok || !data.clientSecret) {
        throw new Error(data?.error || "セッションの作成に失敗しました")
      }
      setCheckoutClientSecret(data.clientSecret)
      setIsCheckingOut(false)
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "セッションの作成に失敗しました")
      setIsCheckingOut(false)
    }
  }

  const structuredData = getProductStructuredData(product.slug)

  return (
    <main className="min-h-screen bg-white">
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <Header />

      {/* ── パンくず ── */}
      <div className="pt-24 pb-6 px-6 max-w-7xl mx-auto">
        <nav className="text-xs text-muted-foreground tracking-wider">
          <Link href="/" className="hover:text-dark transition-colors">
            HOME
          </Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-dark transition-colors">
            PRODUCTS
          </Link>
          <span className="mx-2">/</span>
          <span className="text-dark">{product.nameEn}</span>
        </nav>
      </div>

      {/* ── 商品メイン ── */}
      <section className="px-6 max-w-7xl mx-auto pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* ── 左：画像ギャラリー ── */}
          <div>
            {/* メイン画像（サムネイルにホバー中はホバー画像を優先表示）
                モバイル: タッチスワイプで左右切替 (2026-05-12 追加)
                スライドトラック方式 (2026-05-12): 画像間が横に繋がってスライド表示 */}
            {(() => {
              const displayIndex = hoveredImage ?? selectedImage
              const N = imageUrls.length
              return (
                <div
                  className="relative aspect-square bg-secondary rounded-xl overflow-hidden mb-3 select-none"
                  onTouchStart={(e) => {
                    touchStartXRef.current = e.touches[0].clientX
                    touchStartYRef.current = e.touches[0].clientY
                  }}
                  onTouchEnd={(e) => {
                    if (touchStartXRef.current === null || touchStartYRef.current === null || N < 2) return
                    const dx = e.changedTouches[0].clientX - touchStartXRef.current
                    const dy = e.changedTouches[0].clientY - touchStartYRef.current
                    touchStartXRef.current = null
                    touchStartYRef.current = null
                    if (Math.abs(dx) <= Math.abs(dy)) return
                    if (Math.abs(dx) < 40) return
                    if (dx > 0) goPrev()
                    else goNext()
                  }}
                >
                  {/* スライドトラック */}
                  <div
                    className="absolute inset-0 flex transition-transform duration-300 ease-out"
                    style={{
                      width: `${N * 100}%`,
                      transform: `translateX(-${(100 / N) * displayIndex}%)`,
                    }}
                  >
                    {imageUrls.map((url, i) => (
                      <div
                        key={url}
                        className="relative h-full flex-shrink-0"
                        style={{ width: `${100 / N}%` }}
                      >
                        <Image
                          src={url}
                          alt={`${product.nameEn} ${i + 1}`}
                          fill
                          className="object-cover pointer-events-none"
                          priority={i === 0}
                          sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                      </div>
                    ))}
                  </div>

                  {/* 前後ボタン（画像 2 枚以上の場合のみ表示） */}
                  {N > 1 && (
                    <>
                      <button
                        onClick={goPrev}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:bg-white transition-colors z-10"
                        aria-label="前の画像"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={goNext}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:bg-white transition-colors z-10"
                        aria-label="次の画像"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {product.badge && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-gold text-white text-xs tracking-wider rounded-full z-10">
                      {product.badge}
                    </div>
                  )}
                </div>
              )
            })()}

            {/* サムネイル（ホバーでメイン画像にプレビュー、クリックで選択固定） */}
            {imageUrls.length > 1 && (
              <div
                className="grid grid-cols-5 gap-2"
                onMouseLeave={() => setHoveredImage(null)}
              >
                {imageUrls.map((url, i) => (
                  <button
                    key={url}
                    onClick={() => setSelectedImage(i)}
                    onMouseEnter={() => setHoveredImage(i)}
                    className={`relative aspect-square bg-secondary rounded-md overflow-hidden border-2 transition-colors ${
                      selectedImage === i ? "border-gold" : "border-transparent hover:border-muted"
                    }`}
                  >
                    <Image
                      src={url}
                      alt={`${product.nameEn} ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── 右：商品情報 ── */}
          <div>
            <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase mb-3">
              {product.category}
            </p>
            <h1 className="font-serif text-3xl md:text-4xl text-dark mb-2">
              {product.nameEn}
            </h1>
            <p className="text-lg text-muted-foreground mb-1">{product.nameJa}</p>
            <p className="text-sm text-muted-foreground mb-6">{product.subtitle}</p>

            {/* 用途ライン（手すりカテゴリのみ・広告検索語句に合わせた語彙） */}
            {isHandrail && (
              <p className="-mt-4 mb-6 text-[13px] md:text-[14px] text-muted-foreground">
                玄関・階段・屋外アプローチを、おしゃれに。
              </p>
            )}

            {/* キャッチ */}
            <p className="text-base text-dark leading-relaxed mb-6">
              {product.shortDescription}
            </p>

            {/* 価格表示（priceBuildup があれば単価+例示、無ければ basePrice 単独）
                ※ 価格・安心バッジ・CTA を長文説明より先に置く（2026-06-12 監査 A群③。
                   図面フロー側の「価格の目安を先頭へ」と同じ並びに統一） */}
            {!isQuoteOnly && <PriceBlock product={product} />}

            {/* ── 安心バッジ（ATF）── */}
            {product.trustBadges && product.trustBadges.length > 0 && (
              <TrustBadges badges={product.trustBadges} />
            )}

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-3"
            >
              {isQuoteOnly ? (
                <PrimaryCTA
                  href={`/contact?product=${encodeURIComponent(product.slug)}&category=size`}
                  variant="dark"
                  size="lg"
                  icon={<MessageSquare className="w-4 h-4" />}
                  withArrow
                >
                  {product.primaryCtaLabel ?? "お見積もり・ご相談はこちら"}
                </PrimaryCTA>
              ) : isDirectCheckout ? (
                <>
                  {/* 数量セレクタ — 立体感のあるカード */}
                  <div className="flex items-center justify-between border-2 border-gold/20 bg-card rounded-md px-5 py-4 mb-2 shadow-sm">
                    <span className="font-serif text-[15px] font-medium text-foreground">数量</span>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={isCheckingOut || quantity <= 1}
                        className="w-9 h-9 flex items-center justify-center rounded-full border border-gold/20 bg-white shadow-sm hover:border-gold hover:text-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="数量を減らす"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-serif text-[18px] font-bold min-w-[2ch] text-center text-foreground">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                        disabled={isCheckingOut || quantity >= 10}
                        className="w-9 h-9 flex items-center justify-center rounded-full border border-gold/20 bg-white shadow-sm hover:border-gold hover:text-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="数量を増やす"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {checkoutError && (
                    <div className="border-2 border-red-500/60 bg-red-50 rounded-md p-3 text-[13px] text-red-700">
                      {checkoutError}
                    </div>
                  )}
                  <div className="flex justify-center">
                    <PrimaryCTA
                      onClick={handleDirectCheckout}
                      disabled={isCheckingOut}
                      variant="purchase"
                      size="lg"
                      icon={<ShoppingBag className="w-4 h-4" />}
                      withArrow
                      className={isCheckingOut ? "cursor-wait" : ""}
                    >
                      {isCheckingOut
                        ? "決済ページへ移動中…"
                        : `ご注文（合計 ¥${(product.basePrice * quantity).toLocaleString()}）`}
                    </PrimaryCTA>
                  </div>
                  <p className="text-xs text-muted-foreground text-center leading-loose">
                    クリックポストで発送（送料込）。Stripe 決済画面に進みます。
                  </p>
                </>
              ) : (
                <>
                  {/* 送料計算が必要な商品はお問い合わせフォーム経由 */}
                  <PrimaryCTA
                    href={`/contact?product=${encodeURIComponent(product.slug)}&category=order`}
                    variant="gold"
                    size="lg"
                    icon={<Mail className="w-4 h-4" />}
                    withArrow
                  >
                    {product.primaryCtaLabel ?? "ご注文・お問い合わせ"}
                  </PrimaryCTA>
                  <p className="text-xs text-muted-foreground text-center leading-loose">
                    {product.primaryCtaSub ?? (
                      <>
                        ご注文確認後、見積書（送料込）をお送りいたします。
                        <br />
                        オンライン決済対応は順次拡大中です。
                      </>
                    )}
                  </p>
                </>
              )}

            </motion.div>

            {/* 介護保険のご案内（手すりカテゴリのみ） */}
            {isHandrail && <KaigoNotice className="mt-8" />}

            {/* 詳細 */}
            <p className="text-sm text-muted-foreground leading-loose mt-10 mb-6 whitespace-pre-line">
              {product.longDescription}
            </p>

            {/* 仕上げのこだわり訴求。仕上げ spec からウレタン塗装／蜜蝋仕上げを自動で出し分け。 */}
            <div className="mb-10">
              <FinishCommitment specs={product.specs} />
            </div>

            {/* スペック表 */}
            <div className="mb-2">
              <h2 className="text-xs tracking-[0.3em] text-muted-foreground uppercase mb-4">
                Specs
              </h2>
              <dl className="divide-y divide-border border-y border-border">
                {product.specs.map((spec) => (
                  <div key={spec.label} className="grid grid-cols-3 py-3">
                    <dt className="text-sm text-muted-foreground col-span-1">{spec.label}</dt>
                    <dd className="text-sm text-dark col-span-2">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        {/* ── 価格について（単価表 + 価格例） ── */}
        {product.priceBuildup && <PriceTable buildup={product.priceBuildup} />}

        {/* ── 特徴 4 点アイコン ── */}
        {product.featureBullets && product.featureBullets.length > 0 && (
          <section className="mt-20 pt-12 border-t border-border">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-7 bg-gold rounded-full" />
              <h2 className="font-serif text-2xl text-dark">この商品について</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {product.featureBullets.map((feature, i) => {
                const Icon = FEATURE_ICON_MAP[feature.icon]
                return (
                  <div key={i} className="flex flex-col items-start gap-3 p-6 bg-white border border-gold/20 rounded-lg">
                    <Icon className="w-8 h-8 text-gold" />
                    <h3 className="font-serif text-[16px] font-medium text-foreground">{feature.title}</h3>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── 施工事例 横スライダー ── */}
        {product.caseStudyImages && product.caseStudyImages.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-7 bg-gold rounded-full" />
              <h2 className="font-serif text-2xl text-dark">施工事例</h2>
            </div>
            <CaseStudySlider images={product.caseStudyImages} productName={product.nameEn} />
            <p className="text-[12px] text-muted-foreground mt-3">
              ほかの作例は <Link href="/atelier" className="text-gold hover:underline">アトリエギャラリー</Link> でもご覧いただけます。
            </p>
          </section>
        )}

        {/* ── FAQ ── */}
        {product.faq && product.faq.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-7 bg-gold rounded-full" />
              <h2 className="font-serif text-2xl text-dark">よくあるご質問</h2>
            </div>
            <div className="border-t border-border">
              {product.faq.map((item, i) => (
                <FAQItem key={i} q={item.q} a={item.a} />
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <PrimaryCTA
                href={`/contact?product=${encodeURIComponent(product.slug)}&category=product`}
                variant="gold"
                size="md"
                icon={<MessageSquare className="w-4 h-4" />}
                withArrow
              >
                その他のご質問はこちら
              </PrimaryCTA>
            </div>
          </section>
        )}

        {/* ── 関連商品 ── */}
        {(() => {
          const related = getRelatedProducts(product.slug, 3)
          if (related.length === 0) return null
          return (
            <section className="mt-20 pt-12 border-t border-border">
              <h2 className="font-serif text-2xl text-dark mb-6">関連商品</h2>
              <div className="grid sm:grid-cols-3 gap-6">
                {related.map((rel) => (
                  <Link key={rel.href} href={rel.href} className="group block">
                    <motion.div whileHover={{ y: -8 }} className="cursor-pointer">
                      <div className="aspect-square bg-secondary rounded-lg overflow-hidden mb-4 relative">
                        <Image
                          src={galleryUrl(`${rel.img}.jpg`)}
                          alt={rel.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, 33vw"
                        />
                      </div>
                      <h3 className="font-serif text-lg text-dark mb-1">{rel.name}</h3>
                      <p className="text-[13px] text-muted-foreground">{priceLabel(rel.price, rel.priceFrom)}</p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </section>
          )
        })()}
      </section>

      <Footer />

      <EmbeddedCheckoutModal
        open={!!checkoutClientSecret}
        clientSecret={checkoutClientSecret}
        onClose={() => setCheckoutClientSecret(null)}
        summary={isDirectCheckout ? {
          productName: `${product.nameJa}（${product.nameEn}）`,
          productNote: `${product.subtitle} / 数量 ${quantity}`,
          lines: [
            { label: `単価 × ${quantity}`, amount: product.basePrice * quantity },
            { label: "送料", note: "クリックポスト（送料込）", amount: 0 },
          ],
          totalLabel: "合計（税込・送料込）",
          totalAmount: product.basePrice * quantity,
        } : undefined}
      />
    </main>
  )
}
