"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Mail, MessageSquare, ShoppingBag, Minus, Plus, Hammer, Paintbrush, Ruler, Wrench } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PrimaryCTA } from "@/components/ui/primary-cta"
import type { SimpleProduct } from "@/lib/products/simple"
import { galleryUrl, type FeatureIconName } from "@/lib/products/display"
import { getProductStructuredData } from "@/lib/products/structured-data"
import { getRelatedProducts } from "@/lib/products/catalog"
import { EmbeddedCheckoutModal } from "@/components/checkout/embedded-checkout-modal"

const FEATURE_ICON_MAP: Record<FeatureIconName, typeof Hammer> = {
  Hammer,
  Paintbrush,
  Ruler,
  Wrench,
}

function priceLabel(price: number): string {
  if (price <= 0) return "お見積もり"
  return `¥${price.toLocaleString()}〜`
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
        <span className={`shrink-0 w-7 h-7 rounded-full border border-border flex items-center justify-center transition-transform ${open ? "rotate-45 border-gold" : ""}`}>
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

  // 画像 URL を構築：STORES CDN から id を解決
  const imageUrls = product.images.map((id) => galleryUrl(id))

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
            {/* メイン画像（サムネイルにホバー中はホバー画像を優先表示） */}
            <div className="relative aspect-square bg-secondary rounded-xl overflow-hidden mb-3">
              <Image
                key={imageUrls[hoveredImage ?? selectedImage]}
                src={imageUrls[hoveredImage ?? selectedImage]}
                alt={`${product.nameEn} ${(hoveredImage ?? selectedImage) + 1}`}
                fill
                className="object-cover"
                priority={selectedImage === 0}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />

              {/* 前後ボタン（画像 2 枚以上の場合のみ表示） */}
              {imageUrls.length > 1 && (
                <>
                  <button
                    onClick={goPrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:bg-white transition-colors"
                    aria-label="前の画像"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={goNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:bg-white transition-colors"
                    aria-label="次の画像"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {product.badge && (
                <div className="absolute top-3 left-3 px-3 py-1 bg-gold text-white text-xs tracking-wider rounded-full">
                  {product.badge}
                </div>
              )}
            </div>

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
            <p className="text-sm text-muted-foreground mb-8">{product.subtitle}</p>

            {/* 価格表示 */}
            {!isQuoteOnly && (
              <div className="mb-8 pb-8 border-b border-border">
                <p className="text-xs text-muted-foreground mb-1 tracking-wider">PRICE</p>
                <p className="font-serif text-3xl text-dark">
                  ¥{product.basePrice.toLocaleString()}
                  <span className="text-sm text-muted-foreground ml-2">
                    {product.shippingIncluded ? "（税込・送料込）" : "（税込・送料別）"}
                  </span>
                </p>
              </div>
            )}

            {/* キャッチ */}
            <p className="text-base text-dark leading-relaxed mb-6">
              {product.shortDescription}
            </p>

            {/* 詳細 */}
            <p className="text-sm text-muted-foreground leading-loose mb-10 whitespace-pre-line">
              {product.longDescription}
            </p>

            {/* スペック表 */}
            <div className="mb-10">
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
                  お見積もり・ご相談はこちら
                </PrimaryCTA>
              ) : isDirectCheckout ? (
                <>
                  {/* 数量セレクタ — 立体感のあるカード */}
                  <div className="flex items-center justify-between border-2 border-border bg-card rounded-md px-5 py-4 mb-2 shadow-sm">
                    <span className="font-serif text-[15px] font-medium text-foreground">数量</span>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={isCheckingOut || quantity <= 1}
                        className="w-9 h-9 flex items-center justify-center rounded-full border border-border bg-white shadow-sm hover:border-gold hover:text-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
                        className="w-9 h-9 flex items-center justify-center rounded-full border border-border bg-white shadow-sm hover:border-gold hover:text-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
                    ご注文・お問い合わせ
                  </PrimaryCTA>
                  <p className="text-xs text-muted-foreground text-center leading-loose">
                    ご注文確認後、見積書（送料込）をお送りいたします。
                    <br />
                    オンライン決済対応は順次拡大中です。
                  </p>
                </>
              )}

            </motion.div>
          </div>
        </div>

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
                  <div key={i} className="flex flex-col items-start gap-3 p-6 bg-secondary rounded-lg">
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
                href={`/contact?product=${encodeURIComponent(product.slug)}&category=question`}
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
                      <p className="text-[13px] text-muted-foreground">{priceLabel(rel.price)}</p>
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
