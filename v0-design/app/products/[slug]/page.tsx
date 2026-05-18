"use client"

import { useState, useCallback, useRef } from "react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PrimaryCTA } from "@/components/ui/primary-cta"
import { ReneDrawingModal } from "@/components/drawing-modal/rene-drawing-modal"
import { InlineRailSimulator } from "@/components/drawing-modal/inline-rail-simulator"
import { ZakinEditor, type ZakinState } from "@/components/drawing-modal/zakin-editor"
import { calcZakin, getZakinPositions } from "@/lib/drawing-modal/rene-constants"
import { getProductFull, galleryUrl, type FeatureIconName } from "@/lib/products/display"
import { getSimpleProduct } from "@/lib/products/simple"
import { getRelatedProducts } from "@/lib/products/catalog"
import { getProductStructuredData } from "@/lib/products/structured-data"
import { SimpleProductPage } from "@/components/simple-product-page"
import { EmbeddedCheckoutModal } from "@/components/checkout/embedded-checkout-modal"
import { FinishCommitment } from "@/components/finish-commitment"
import { calcShipping, type ProductType } from "@/lib/shipping/sagawa"
import type { WasherTypeId } from "@/lib/drawing-modal/products"
import { ChevronLeft, ChevronRight, Play, Minus, Plus, ChevronDown, Check, Hammer, Paintbrush, Ruler, Wrench } from "lucide-react"

// productImages / specs は商品ごとに display.ts から取得

// featureBullets の icon 名 → lucide コンポーネント対応表
const FEATURE_ICON_MAP: Record<FeatureIconName, typeof Hammer> = {
  Hammer,
  Paintbrush,
  Ruler,
  Wrench,
}

const prefectures = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
]

function priceLabel(price: number, priceFrom = false): string {
  if (price <= 0) return "お見積もり"
  return `¥${price.toLocaleString()}${priceFrom ? "〜" : ""}`
}

export default function ProductDetailPage() {
  const routeParams = useParams<{ slug: string }>()
  const slug = routeParams?.slug ?? "rene"

  // シンプル商品（手すり以外）はシンプルテンプレートで表示
  const simple = getSimpleProduct(slug)
  if (simple) {
    return <SimpleProductPage product={simple} />
  }

  // 手すり商品（既存）— 寸法計算・座金エディタ等の複雑なフロー
  // 商品マスターから表示情報 + 価格パラメータを取得 (未登録商品は rene にフォールバック)
  const product = getProductFull(slug) ?? getProductFull("rene")!
  const specs = product.specs
  // ギャラリー画像 (galleryIds から CDN URL を構築)
  const productImages = product.galleryIds.map((id, i) => ({
    src: galleryUrl(id),
    alt: `${product.nameEn} ${i + 1}`,
  }))
  const [selectedImage, setSelectedImage] = useState(0)
  const [hoveredImage, setHoveredImage] = useState<number | null>(null)
  // スワイプ用 (モバイル): メインヒーロー画像でタッチして左右にフリックで切替
  // X/Y 両方記録して縦スクロールと区別する
  const touchStartXRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)
  const [length, setLength] = useState(product.drawing.stdLengthMm)
  // 入力欄は length とは独立した文字列 state。空文字や min 未満の途中入力も許容し、
  // Blur 時にのみ範囲内へクランプする（クリア → 再入力ができないと報告された問題への対処）。
  const [lengthInput, setLengthInput] = useState<string>(String(product.drawing.stdLengthMm))
  const [quantity, setQuantity] = useState(1)
  const [prefecture, setPrefecture] = useState("")
  const [deliveryType, setDeliveryType] = useState<"normal" | "express">("normal")
  const [isPrefectureOpen, setIsPrefectureOpen] = useState(false)
  const [isDrawingOpen, setIsDrawingOpen] = useState(false)
  const [washerType, setWasherType] = useState<WasherTypeId>(product.drawing.washerSpec?.id ?? "A")
  // Scroll 16/19/22 のみ向きの選択 (左右で価格変更なし)
  // トップ画像サムネイルが左向きのため、デフォルトは「左向き」に合わせる
  const hasOrientation = slug.startsWith("scroll")
  const [orientation, setOrientation] = useState<"right" | "left">("left")
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  // Embedded Checkout: clientSecret が入ったらモーダルが開く
  const [checkoutClientSecret, setCheckoutClientSecret] = useState<string | null>(null)
  const prefectureRef = useRef<HTMLDivElement | null>(null)
  // 座金ルール (商品固有。未指定は旧式=横型ルール)
  const zakinRule = product.drawing.zakinRule
  const minLength = zakinRule?.minLengthMm ?? 500
  const maxLength = zakinRule?.maxLengthMm ?? product.drawing.maxMm

  // 簡易座金エディター state (既存 rene.html の zakinCustomList + zakinGlobalAngle 相当)
  const [zakin, setZakin] = useState<ZakinState>(() => {
    const L = product.drawing.stdLengthMm
    const count = calcZakin(L, zakinRule)
    return {
      positions: getZakinPositions(L, count, zakinRule),
      angleDeg: 0,
      angleDir: "left",
      customMode: false,
    }
  })

  // Price calculation — matches API route logic (checkout/route.ts)
  // 商品マスターから取得
  const BASE_PRICE = product.drawing.basePrice
  const STD_LENGTH = product.drawing.stdLengthMm
  const INCLUDED_ZAKIN = product.drawing.includedZakin
  // 共通定数 (全商品同じ). 商品別にオーバーライド可能 (Antoine: pricePerMm=19)
  const PRICE_PER_MM = product.drawing.pricePerMm ?? 25
  const ZAKIN_PRICE = 3500
  const ANGLE_PRICE = 2000 // 角度加工: 座金1箇所あたり (rene.html 準拠)
  const SURGE_START = 2000
  const SURGE_BASE = 1.2
  const SURGE_INTERVAL = 500
  const RUSH_RATE = 0.2

  // 佐川急便 送料ルール: lib/shipping/sagawa.ts に基づく
  const productType: ProductType =
    product.drawing.category === "horizontal" ? "yokogata"
    : product.drawing.category === "vertical" ? "tategata"
    : "fixed"

  const calculatePrice = useCallback(() => {
    const addon = Math.max(0, length - STD_LENGTH) * PRICE_PER_MM
    const longM = length > SURGE_START
      ? Math.pow(SURGE_BASE, (length - SURGE_START) / SURGE_INTERVAL)
      : 1
    const surcharge = length > SURGE_START ? addon * (longM - 1) : 0
    const zakinCount = zakin.customMode
      ? zakin.positions.length
      : calcZakin(length, zakinRule)
    const addZakin = Math.max(0, zakinCount - INCLUDED_ZAKIN) * ZAKIN_PRICE
    const angleCost = zakin.angleDeg > 0 ? zakinCount * ANGLE_PRICE : 0
    const unitPrice = BASE_PRICE + addon + addZakin + surcharge + angleCost
    const subtotal = Math.round(unitPrice) * quantity
    const expressAddon = deliveryType === "express" ? Math.round(subtotal * RUSH_RATE) : 0
    const shippingResult = calcShipping(length, prefecture, quantity, productType)
    const shipping = shippingResult.shipping
    // 送料は外税 → 消費税 10% を上乗せ
    const shippingTax = Math.round(shipping * 0.1)
    const total = subtotal + expressAddon + shipping + shippingTax
    return {
      basePrice: BASE_PRICE,
      addon: Math.round(addon),
      addZakin,
      surcharge: Math.round(surcharge),
      angleCost,
      unitPrice: Math.round(unitPrice),
      subtotal,
      expressAddon,
      shipping,
      shippingTax,
      shippingNote: shippingResult.note,
      shippingInquiry: shippingResult.inquiry,
      shippingInquiryReason: shippingResult.inquiryReason,
      shippingBundles: shippingResult.bundles,
      shippingRate: shippingResult.rate,
      total,
      zakinCount,
    }
  }, [length, quantity, deliveryType, prefecture, zakin, productType])

  const prices = calculatePrice()

  // 各ステップの入力が満たされているか（番号サークルの進捗表示用）。
  // 以前は単調増加カウンタで、初期値のある長さ・配送のせいで未入力でも
  // ② が「完了」表示になっていた。実際の入力状況に直結する形に修正。
  const step1Done = length >= minLength && length <= maxLength
  const step2Done = quantity > 0 && prefecture !== ""
  const step3Done = deliveryType === "normal" || deliveryType === "express"
  const step4Ready = step1Done && step2Done && step3Done

  // Lightbox は廃止 (2026-05-12) — モバイルで黒バック+×だけだと不便だったため、
  // ヒーロー画像はスワイプ+矢印で切替・サムネタップでヒーローに反映する方式に移行。


  // Stripe Checkout 遷移
  const handleCheckout = async () => {
    if (prices.shippingInquiry || isCheckingOut) return
    if (!prefecture) {
      setCheckoutError("配送先都道府県を選択してください")
      prefectureRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      setIsPrefectureOpen(true)
      return
    }
    setCheckoutError(null)
    setIsCheckingOut(true)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: slug,
          lengthMm: length,
          quantity,
          rushDelivery: deliveryType === "express",
          prefecture,
          ...(hasOrientation ? { orientation } : {}),
        }),
      })
      const data = await res.json()
      if (!res.ok || !data?.clientSecret) {
        setCheckoutError(data?.error ?? "購入手続きを開始できませんでした")
        setIsCheckingOut(false)
        return
      }
      setCheckoutClientSecret(data.clientSecret)
      setIsCheckingOut(false)
    } catch {
      setCheckoutError("ネットワークエラーが発生しました。時間をおいて再度お試しください")
      setIsCheckingOut(false)
    }
  }

  // Delivery date calculation
  const getDeliveryDate = () => {
    const days = deliveryType === "express" ? 5 : 10
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date.toLocaleDateString("ja-JP", { month: "long", day: "numeric" })
  }

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % productImages.length)
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + productImages.length) % productImages.length)
  }

  const structuredData = getProductStructuredData(slug)

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <Header />
      
      <main className="pt-20 lg:pt-24 pb-20 bg-background">
        {/* Breadcrumb */}
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-[11px] font-mono tracking-wide text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-foreground transition-colors">{product.breadcrumbCategory}</Link>
            <span>/</span>
            <span className="text-foreground">{product.nameEn} {product.nameJaShort}</span>
          </nav>
        </div>

        {/* Two Column Layout */}
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            {/* LEFT COLUMN - Gallery */}
            <div className="space-y-4">
              {/* Main Image — サムネと同じスクエア
                  モバイル: 左右スワイプで切替 (画像と画像が横スライドで繋がる) + 矢印タップで切替
                  デスクトップ: サムネホバーで該当画像にスライド
                  Lightbox は廃止 (2026-05-12)
                  フェード→スライド演出に変更 (2026-05-12): フェードだと隣画像との白隙間が見えるため */}
              {(() => {
                const displayIndex = hoveredImage ?? selectedImage
                const N = productImages.length
                return (
                  <div
                    className="relative aspect-square bg-secondary rounded-lg overflow-hidden group select-none"
                    onTouchStart={(e) => {
                      touchStartXRef.current = e.touches[0].clientX
                      touchStartYRef.current = e.touches[0].clientY
                    }}
                    onTouchEnd={(e) => {
                      if (touchStartXRef.current === null || touchStartYRef.current === null) return
                      const dx = e.changedTouches[0].clientX - touchStartXRef.current
                      const dy = e.changedTouches[0].clientY - touchStartYRef.current
                      touchStartXRef.current = null
                      touchStartYRef.current = null
                      // 縦スクロールと区別: 横移動が縦移動より大きく、かつ 40px 以上の場合だけスワイプ判定
                      if (Math.abs(dx) <= Math.abs(dy)) return
                      if (Math.abs(dx) < 40) return
                      if (dx > 0) prevImage()
                      else nextImage()
                    }}
                  >
                    {/* スライドトラック: 全画像を横並びで配置し translateX で位置をずらす */}
                    <div
                      className="absolute inset-0 flex transition-transform duration-300 ease-out"
                      style={{
                        width: `${N * 100}%`,
                        transform: `translateX(-${(100 / N) * displayIndex}%)`,
                      }}
                    >
                      {productImages.map((image, i) => (
                        <div
                          key={image.src}
                          className="relative h-full flex-shrink-0"
                          style={{ width: `${100 / N}%` }}
                        >
                          <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            className="object-cover pointer-events-none"
                            priority={i === 0}
                            sizes="(max-width: 1024px) 100vw, 50vw"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Navigation Arrows — モバイルでも常に表示。デスクトップは半透明 → ホバーで強調 */}
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 bg-white/85 md:bg-white/70 lg:bg-white/60 lg:group-hover:bg-white/95 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white shadow-md hover:shadow-lg backdrop-blur-sm z-10"
                      aria-label="前の画像"
                    >
                      <ChevronLeft className="w-5 h-5 text-dark" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 bg-white/85 md:bg-white/70 lg:bg-white/60 lg:group-hover:bg-white/95 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white shadow-md hover:shadow-lg backdrop-blur-sm z-10"
                      aria-label="次の画像"
                    >
                      <ChevronRight className="w-5 h-5 text-dark" />
                    </button>

                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 bg-dark/70 text-white text-[11px] px-3 py-1 rounded-full font-mono z-10">
                      {selectedImage + 1} / {productImages.length}
                    </div>
                  </div>
                )
              })()}

              {/* Thumbnail Grid — タップでヒーロー画像を切替 (Lightbox は廃止) */}
              <div
                className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-5 lg:grid-cols-7 gap-2"
                onMouseLeave={() => setHoveredImage(null)}
              >
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onMouseEnter={() => setHoveredImage(index)}
                    onClick={() => setSelectedImage(index)}
                    aria-label={`画像 ${index + 1} を表示`}
                    className={`relative aspect-square rounded-md overflow-hidden transition-all duration-300 ${
                      selectedImage === index
                        ? "ring-2 ring-gold ring-offset-2"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover"
                    />
                    {selectedImage === index && (
                      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gold" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN - Product Info */}
            <div className="space-y-7">
              {/* Category Label */}
              <div className="flex items-center gap-3">
                <div className="w-1 h-7 bg-gold rounded-full" />
                <span className="text-[14px] tracking-wide text-muted-foreground">
                  {product.subtitle}
                </span>
              </div>

              {/* Product Name + Description */}
              <div>
                <h1 className="font-serif text-4xl lg:text-5xl text-foreground mb-3 leading-tight">
                  {product.nameEn} {product.nameJaShort}
                </h1>
                <p className="text-[16px] text-muted-foreground leading-relaxed mb-5">
                  {product.shortDescription}
                </p>
                <p className="text-[15px] leading-relaxed text-foreground whitespace-pre-line">
                  {product.longDescription}
                </p>
              </div>

              {/* 仕上げのこだわり訴求（説明文の直下・初見の人の目に付く位置）。
                  仕上げ spec からウレタン塗装／蜜蝋仕上げを自動で出し分け。 */}
              <FinishCommitment specs={specs} />

              {/* ===== 相談誘導 CTA ① — 説明文直後 ===== */}
              <div className="rounded-lg border border-gold/20 bg-card p-6">
                <p className="mb-1 text-[12px] tracking-[0.2em] uppercase text-gold font-semibold">
                  Before you order
                </p>
                <p className="mb-3 font-serif text-[18px] font-bold text-foreground">
                  取り付けられるか、まず確認してみませんか？
                </p>
                <p className="mb-5 text-[14px] leading-relaxed text-muted-foreground">
                  「コンクリート壁でも大丈夫？」「階段に合うサイズがわからない」——
                  そんな疑問でも大歓迎です。写真 1 枚送るだけで職人が直接確認します。
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="https://lin.ee/Tnjukrf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-md border-2 border-[#06C755] bg-white px-5 py-3 text-[14px] font-semibold text-[#06C755] transition hover:bg-[#06C755]/5"
                  >
                    LINE で写真を送る
                  </a>
                  <Link
                    href="/contact"
                    className="flex items-center justify-center gap-2 rounded-md border-2 border-gold/40 bg-white px-5 py-3 text-[14px] font-semibold text-foreground transition hover:border-gold hover:text-gold"
                  >
                    フォームで相談する
                  </Link>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t-2 border-gold/30 pt-6" />

              {/* Price Calculator */}
              <div className="space-y-7">
                <div className="flex items-center gap-3">
                  <span className="text-[13px] tracking-[0.2em] uppercase text-gold font-semibold">
                    PRICE CALCULATOR
                  </span>
                  <div className="flex-1 h-px bg-gold/30" />
                </div>

                {/* Step 1: Length */}
                <div className="relative pl-14">
                  <div className={`absolute left-0 top-0 w-11 h-11 flex items-center justify-center text-[16px] font-serif font-bold rounded-full shadow-sm transition-colors ${
                    step1Done ? "bg-gold text-white" : "bg-gold/15 text-gold"
                  }`}>
                    01
                  </div>
                  <div className="absolute left-[21px] top-12 bottom-0 w-px bg-border" />

                  <div className="space-y-4">
                    <h3 className="font-serif text-[22px] font-bold text-foreground tracking-tight">
                      {product.drawing.category === "fixed" ? "サイズ" : "長さを選ぶ"}
                    </h3>
                    {product.drawing.category === "fixed" ? (
                      <>
                        <div className="flex items-center gap-4">
                          <div className="flex-1 px-4 py-4 bg-white border border-gold/20 text-[14px] text-foreground">
                            高さ {product.drawing.stdLengthMm}mm 固定サイズ
                            <span className="text-[11px] text-muted-foreground ml-2">
                              （長さ調整不可）
                            </span>
                          </div>
                        </div>
                        {/* Scroll 16/19/22 のみ向き選択 (左右で価格変更なし) */}
                        {hasOrientation && (
                          <div className="mt-3 border border-gold/20 bg-card p-4">
                            <div className="flex items-center gap-3">
                              <span className="font-serif text-[15px] font-medium text-foreground min-w-[80px]">向き</span>
                              <div className="flex flex-1 gap-2">
                                <button
                                  type="button"
                                  onClick={() => setOrientation("right")}
                                  className={`flex-1 py-2.5 px-3 rounded-md border-2 transition-all text-center ${
                                    orientation === "right"
                                      ? "border-gold bg-gold/5"
                                      : "border-gold/20 hover:border-gold/50"
                                  }`}
                                >
                                  <div className="font-serif text-[14px] font-medium">右向き</div>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setOrientation("left")}
                                  className={`flex-1 py-2.5 px-3 rounded-md border-2 transition-all text-center ${
                                    orientation === "left"
                                      ? "border-gold bg-gold/5"
                                      : "border-gold/20 hover:border-gold/50"
                                  }`}
                                >
                                  <div className="font-serif text-[14px] font-medium">左向き</div>
                                </button>
                              </div>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-2">
                              壁に取り付けたときの装飾の向きをお選びください（価格は同じ）
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-[13px] text-muted-foreground">
                          <span className="font-medium text-foreground">〜{product.drawing.stdLengthMm}mm まで一律 ¥{BASE_PRICE.toLocaleString()}</span>
                          <span className="ml-2 text-[12px] opacity-75">（超過分は 1mm あたり ¥{PRICE_PER_MM}）</span>
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="relative flex-1">
                            <input
                              type="range"
                              min={minLength}
                              max={maxLength}
                              step={1}
                              value={length}
                              onChange={(e) => {
                                const v = Number(e.target.value)
                                setLength(v)
                                setLengthInput(String(v))
                              }}
                              style={{
                                ["--ado-range-fill" as string]: `${Math.max(0, Math.min(100, ((length - minLength) / (maxLength - minLength)) * 100))}%`,
                              }}
                              className="ado-range-thumb w-full h-2 rounded-full cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                              <span>{minLength}mm</span>
                              <span>{maxLength}mm</span>
                            </div>
                          </div>
                          <div className="relative">
                            <input
                              type="number"
                              min={minLength}
                              max={maxLength}
                              step={1}
                              value={lengthInput}
                              onFocus={(e) => e.currentTarget.select()}
                              onChange={(e) => {
                                const raw = e.target.value
                                setLengthInput(raw)
                                if (raw === "") return
                                const n = Number(raw)
                                if (Number.isFinite(n) && n >= minLength && n <= maxLength) {
                                  setLength(n)
                                }
                              }}
                              onBlur={() => {
                                if (lengthInput === "") {
                                  setLengthInput(String(length))
                                  return
                                }
                                const n = Number(lengthInput)
                                if (!Number.isFinite(n)) {
                                  setLengthInput(String(length))
                                  return
                                }
                                const clamped = Math.min(maxLength, Math.max(minLength, Math.round(n)))
                                setLength(clamped)
                                setLengthInput(String(clamped))
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.currentTarget.blur()
                                }
                              }}
                              className="w-28 h-12 bg-gold/10 border-2 border-gold text-center font-mono text-lg text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-muted-foreground">
                              mm
                            </span>
                          </div>
                        </div>
                        {/* 座金タイプ選択 (縦型CAD精密図対応商品のみ) — 長さの直下に常時表示 */}
                        {product.drawing.category === "vertical" && product.drawing.washerSpec && (
                          <div className="mt-3 border border-gold/20 bg-card p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="font-serif text-[15px] font-medium text-foreground min-w-[80px]">座金タイプ</span>
                              <div className="flex flex-1 gap-2">
                                <button
                                  type="button"
                                  onClick={() => setWasherType("A")}
                                  className={`flex-1 py-2.5 px-3 rounded-md border-2 transition-all text-left ${
                                    washerType === "A"
                                      ? "border-gold bg-gold/5"
                                      : "border-gold/20 hover:border-gold/50"
                                  }`}
                                >
                                  <div className="font-serif text-[14px] font-medium">Aタイプ</div>
                                  <div className="text-[11px] text-muted-foreground mt-0.5">楕円 55×35mm（標準）</div>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setWasherType("B")}
                                  className={`flex-1 py-2.5 px-3 rounded-md border-2 transition-all text-left ${
                                    washerType === "B"
                                      ? "border-gold bg-gold/5"
                                      : "border-gold/20 hover:border-gold/50"
                                  }`}
                                >
                                  <div className="font-serif text-[14px] font-medium">Bタイプ</div>
                                  <div className="text-[11px] text-muted-foreground mt-0.5">楕円 60×25mm（幅広薄型）</div>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        {/* 座金の位置調整（シミュレーター＋エディタ）は任意操作のため、
                            初見の情報量を抑える目的で details に格納し初期は畳む。
                            制作図プレビューは Step4（確認して購入）へ移動。 */}
                        <details className="group mt-3 border border-gold/20 rounded-md overflow-hidden">
                          <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between hover:bg-gold/[0.03] transition-colors">
                            <span className="text-[14px] font-medium tracking-wider text-foreground">座金の位置を調整する（任意）</span>
                            <span className="text-gold text-lg leading-none transition-transform group-open:rotate-45">＋</span>
                          </summary>
                          <div className="border-t border-gold/20 p-4">
                            <InlineRailSimulator
                              product={product.drawing}
                              lengthMm={length}
                              positions={zakin.positions}
                              angleDeg={zakin.angleDeg}
                              angleDir={zakin.angleDir}
                              zakinRule={zakinRule}
                              onPositionsChange={(positions) =>
                                setZakin({ ...zakin, positions, customMode: true })
                              }
                            />
                            <p className="md:hidden mt-2 px-1 text-[12px] text-muted-foreground leading-relaxed">
                              📱 スマホではドラッグ調整はできません。下の数値入力で各座金の位置を調整してください。
                            </p>
                            <ZakinEditor
                              lengthMm={length}
                              state={zakin}
                              onChange={setZakin}
                              zakinRule={zakinRule}
                              disableAngle={product.drawing.category === "vertical"}
                              maxCount={product.drawing.category === "vertical" ? 3 : 20}
                              className="mt-3"
                            />
                          </div>
                        </details>
                      </>
                    )}
                  </div>
                </div>

                {/* Step 2: Quantity & Prefecture */}
                <div className="relative pl-14 pt-6">
                  <div className={`absolute left-0 top-6 w-11 h-11 flex items-center justify-center text-[16px] font-serif font-bold rounded-full shadow-sm transition-colors ${
                    step2Done ? "bg-gold text-white" : "bg-gold/15 text-gold"
                  }`}>
                    02
                  </div>
                  <div className="absolute left-[21px] top-[68px] bottom-0 w-px bg-border" />

                  <div className="space-y-4">
                    <h3 className="font-serif text-[22px] font-bold text-foreground tracking-tight">
                      数量・配送先
                      {!prefecture && (
                        <span className="ml-2 text-[11px] font-sans font-medium text-red-600 align-middle tracking-wider">必須</span>
                      )}
                    </h3>
                    <div ref={prefectureRef} className="flex flex-col sm:flex-row gap-4">
                      {/* Quantity */}
                      <div className="flex items-center border border-gold/20 rounded-md">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-12 h-12 flex items-center justify-center hover:bg-muted transition-colors"
                          aria-label="数量を減らす"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-mono text-lg">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-12 h-12 flex items-center justify-center hover:bg-muted transition-colors"
                          aria-label="数量を増やす"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Prefecture Dropdown */}
                      <div className="relative flex-1">
                        <button
                          onClick={() => setIsPrefectureOpen(!isPrefectureOpen)}
                          className={`w-full h-12 px-4 flex items-center justify-between border-2 rounded-md text-[14px] font-medium transition-colors ${
                            prefecture
                              ? "border-gold bg-gold/5 text-foreground"
                              : "border-gold/60 bg-white text-foreground hover:border-gold"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {!prefecture && (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gold/15 text-gold text-[11px] font-bold">
                                ▼
                              </span>
                            )}
                            <span>{prefecture || "配送先都道府県を選択 ▸"}</span>
                          </span>
                          <ChevronDown className={`w-5 h-5 text-gold transition-transform ${isPrefectureOpen ? "rotate-180" : ""}`} />
                        </button>
                        
                        <AnimatePresence>
                          {isPrefectureOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gold/20 rounded-md shadow-lg max-h-60 overflow-y-auto z-20"
                            >
                              {prefectures.map((pref) => (
                                <button
                                  key={pref}
                                  onClick={() => { setPrefecture(pref); setIsPrefectureOpen(false); setCheckoutError(null); }}
                                  className="w-full px-4 py-2 text-left text-[13px] hover:bg-muted transition-colors flex items-center justify-between"
                                >
                                  {pref}
                                  {prefecture === pref && <Check className="w-4 h-4 text-gold" />}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">
                      ※ 数量は <span className="font-medium text-foreground">同じ長さの本数</span> です。違う長さで複数本ご注文される場合は、下の「購入前のご相談」からお問い合わせください。
                    </p>
                  </div>
                </div>

                {/* Step 3: Delivery */}
                <div className="relative pl-14 pt-6">
                  <div className={`absolute left-0 top-6 w-11 h-11 flex items-center justify-center text-[16px] font-serif font-bold rounded-full shadow-sm transition-colors ${
                    step3Done ? "bg-gold text-white" : "bg-gold/15 text-gold"
                  }`}>
                    03
                  </div>
                  <div className="absolute left-[21px] top-[68px] bottom-0 w-px bg-border" />

                  <div className="space-y-4">
                    <h3 className="font-serif text-[22px] font-bold text-foreground tracking-tight">納品日・配送を選ぶ</h3>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setDeliveryType("normal")}
                        className={`flex-1 py-4 px-4 rounded-md border-2 transition-all ${
                          deliveryType === "normal"
                            ? "border-gold bg-gold/5"
                            : "border-gold/20 hover:border-gold/50"
                        }`}
                      >
                        <div className="text-[15px] font-medium">通常</div>
                        <div className="text-[12px] text-muted-foreground mt-0.5">10営業日</div>
                      </button>
                      <button
                        onClick={() => setDeliveryType("express")}
                        className={`flex-1 py-4 px-4 rounded-md border-2 transition-all ${
                          deliveryType === "express"
                            ? "border-gold bg-gold/5"
                            : "border-gold/20 hover:border-gold/50"
                        }`}
                      >
                        <div className="text-[15px] font-medium">特急 <span className="text-gold">+20%</span></div>
                        <div className="text-[12px] text-muted-foreground mt-0.5">5営業日</div>
                      </button>
                    </div>
                    <p className="text-[14px] text-muted-foreground">
                      お届け予定日: <span className="text-foreground font-medium">{getDeliveryDate()}頃</span>
                    </p>
                  </div>
                </div>

                {/* Step 4: Confirm & Purchase */}
                <div className="relative pl-14 pt-6">
                  <div className={`absolute left-0 top-6 w-11 h-11 flex items-center justify-center text-[16px] font-serif font-bold rounded-full shadow-sm transition-colors ${
                    step4Ready ? "bg-gold text-white" : "bg-gold/15 text-gold"
                  }`}>
                    04
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-serif text-[22px] font-bold text-foreground tracking-tight">確認して購入</h3>
                    
                    {/* Price Breakdown (詳細内訳) */}
                    <div className="bg-white border border-gold/20 rounded-lg p-5 space-y-2.5">
                      <div className="flex justify-between text-[15px]">
                        <span className="text-muted-foreground">
                          基本料金（〜{product.drawing.stdLengthMm}mm）
                        </span>
                        <span className="font-mono">¥{prices.basePrice.toLocaleString()}</span>
                      </div>
                      {prices.addon > 0 && (
                        <div className="flex justify-between text-[15px]">
                          <span className="text-muted-foreground">
                            長さ追加料金（+{length - product.drawing.stdLengthMm}mm × ¥{PRICE_PER_MM}）
                          </span>
                          <span className="font-mono">+¥{prices.addon.toLocaleString()}</span>
                        </div>
                      )}
                      {prices.addZakin > 0 && (
                        <div className="flex justify-between text-[15px]">
                          <span className="text-muted-foreground">
                            追加座金料金（{prices.zakinCount - INCLUDED_ZAKIN}個 × ¥{ZAKIN_PRICE.toLocaleString()}）
                          </span>
                          <span className="font-mono">+¥{prices.addZakin.toLocaleString()}</span>
                        </div>
                      )}
                      {prices.surcharge > 0 && (
                        <div className="flex justify-between text-[15px]">
                          <span className="text-muted-foreground">
                            長尺割増（{length}mm）
                          </span>
                          <span className="font-mono">+¥{prices.surcharge.toLocaleString()}</span>
                        </div>
                      )}
                      {prices.angleCost > 0 && (
                        <div className="flex justify-between text-[15px]">
                          <span className="text-muted-foreground">
                            角度加工料金（{prices.zakinCount}個 × ¥{ANGLE_PRICE.toLocaleString()}、{zakin.angleDir === "left" ? "左" : "右"}{zakin.angleDeg}°）
                          </span>
                          <span className="font-mono">+¥{prices.angleCost.toLocaleString()}</span>
                        </div>
                      )}
                      {quantity > 1 && (
                        <div className="flex justify-between text-[15px] pt-2 border-t border-border/60">
                          <span className="text-muted-foreground">
                            単価 × {quantity}
                          </span>
                          <span className="font-mono">¥{prices.subtotal.toLocaleString()}</span>
                        </div>
                      )}
                      {prices.expressAddon > 0 && (
                        <div className="flex justify-between text-[15px]">
                          <span className="text-muted-foreground">特急割増（+20%）</span>
                          <span className="font-mono">+¥{prices.expressAddon.toLocaleString()}</span>
                        </div>
                      )}
                      {prices.shipping > 0 && !prices.shippingInquiry && (
                        <div className="pt-2 border-t border-border/60 space-y-1">
                          <div className="flex justify-between text-[15px]">
                            <span className="text-muted-foreground">送料（{prefecture}・佐川急便・税抜）</span>
                            <span className="font-mono">+¥{prices.shipping.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-[15px]">
                            <span className="text-muted-foreground">送料消費税（10%）</span>
                            <span className="font-mono">+¥{prices.shippingTax.toLocaleString()}</span>
                          </div>
                          {prices.shippingNote && (
                            <p className="text-[12px] text-muted-foreground">{prices.shippingNote}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Shipping Inquiry Banner (沖縄・7本以上・3001mm以上) */}
                    {prices.shippingInquiry && (
                      <div className="border-2 border-yellow-500/60 bg-yellow-500/5 rounded-lg p-4">
                        <p className="text-[14px] text-yellow-600 font-medium mb-2">
                          ⚠ {prices.shippingInquiryReason}
                        </p>
                        <a
                          href="mailto:info@tantetuzest.com"
                          className="inline-flex items-center gap-1 text-[14px] text-gold hover:text-gold/80 underline"
                        >
                          お問い合わせよりご相談ください
                        </a>
                      </div>
                    )}

                    {/* Total Price */}
                    <div className="flex items-center gap-4 py-5">
                      <div className="w-2 h-14 bg-gold rounded-full" />
                      <div>
                        <span className="text-[13px] tracking-[0.15em] uppercase text-muted-foreground block mb-1">合計（税込）</span>
                        <span className="font-serif text-4xl lg:text-5xl text-foreground">
                          ¥{prices.total.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* 制作図プレビュー — 購入前の最終確認として（fixed 商品は図面なし） */}
                    {product.drawing.category !== "fixed" && (
                      <button
                        type="button"
                        onClick={() => setIsDrawingOpen(true)}
                        className="block w-full py-4 border border-gold/20 text-gold text-[15px] font-medium rounded-md hover:border-gold transition-colors text-center"
                      >
                        制作図プレビューで最終確認 ▸
                      </button>
                    )}

                    {/* CTA Buttons */}
                    <div className="space-y-3">
                      {checkoutError && (
                        <div className="border-2 border-red-500/60 bg-red-50 rounded-md p-3 text-[13px] text-red-700">
                          {checkoutError}
                        </div>
                      )}
                      {prices.shippingInquiry ? (
                        <button
                          disabled
                          className="w-full py-5 font-serif text-[17px] font-bold rounded-md bg-muted text-muted-foreground cursor-not-allowed"
                        >
                          要問い合わせ（別途見積もり）
                        </button>
                      ) : (
                        <div className="flex justify-center">
                          <PrimaryCTA
                            onClick={handleCheckout}
                            disabled={isCheckingOut}
                            variant="purchase"
                            size="lg"
                            withArrow
                            className={isCheckingOut ? "cursor-wait" : ""}
                          >
                            {isCheckingOut ? "購入ページへ移動中…" : "購入手続きへ進む"}
                          </PrimaryCTA>
                        </div>
                      )}
                      {/* ===== 統合相談 CTA — 旧「特殊な仕様」ボタンと「まだ迷っている方へ」テキストを 1 つに ===== */}
                      <div className="pt-1 space-y-2">
                        <p className="text-center text-[13px] text-muted-foreground leading-relaxed">
                          入力でつまずいた、特殊な仕様を相談したい、あと一歩で迷っている——
                          <br className="hidden sm:inline" />
                          そんな方は、お気軽にご相談ください。
                        </p>
                        <Link
                          href={`/contact?product=${encodeURIComponent(slug)}`}
                          className="block w-full py-4 border border-gold/40 text-foreground text-[15px] font-medium rounded-md hover:border-gold hover:bg-gold/5 hover:text-gold transition-colors text-center"
                        >
                          購入前のご相談（無料）
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BELOW THE FOLD */}
          <div className="mt-20 space-y-20">
            {/* Specs & Features (longDescription は右カラム上部に移動) */}
            <section className="max-w-3xl">
              <h2 className="font-serif text-3xl lg:text-4xl mb-8">仕様と特徴</h2>

              {/* Specs Grid (シミュレーター上から移動) */}
              <div className="bg-white border border-gold/20 rounded-lg p-6 mb-10">
                <h3 className="font-serif text-[18px] font-medium mb-4 text-foreground">仕様</h3>
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                  {specs.map((spec, index) => (
                    <div key={index} className="flex items-baseline">
                      <span className="text-[14px] text-muted-foreground min-w-[70px]">
                        {spec.label}
                      </span>
                      <span className="flex-1 border-b border-dotted border-border mx-2" />
                      <span className="text-[15px] font-medium text-foreground">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {product.featureBullets.map((feature, index) => {
                  const Icon = FEATURE_ICON_MAP[feature.icon]
                  return (
                    <div key={index} className="flex items-start gap-3 p-5 bg-white border border-gold/20 rounded-lg">
                      <Icon className="w-7 h-7 text-gold flex-shrink-0" />
                      <div>
                        <h4 className="font-serif text-[16px] font-medium mb-1.5">{feature.title}</h4>
                        <p className="text-[14px] text-muted-foreground leading-relaxed">{feature.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Video Section (YouTube embed — youtubeId が設定されている商品のみ表示) */}
            {product.youtubeId && (
              <section>
                <h2 className="font-serif text-2xl mb-6">制作動画</h2>
                <div className="aspect-video bg-dark rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${product.youtubeId}`}
                    title={`${product.nameEn} ${product.nameJaShort} 制作動画`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    className="w-full h-full border-0"
                  />
                </div>
              </section>
            )}

            {/* Related Products */}
            {(() => {
              const related = getRelatedProducts(slug, 3)
              if (related.length === 0) return null
              return (
                <section>
                  <h2 className="font-serif text-2xl mb-6">関連商品</h2>
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
                            />
                          </div>
                          <h3 className="font-serif text-lg mb-1">{rel.name}</h3>
                          <p className="text-[13px] text-muted-foreground">{priceLabel(rel.price, rel.priceFrom)}</p>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </section>
              )
            })()}
          </div>
        </div>
      </main>

      <Footer />

      <ReneDrawingModal
        open={isDrawingOpen}
        onClose={() => setIsDrawingOpen(false)}
        lengthMm={length}
        productSlug={slug}
        positions={zakin.positions}
        angleDeg={zakin.angleDeg}
        angleDir={zakin.angleDir}
        zakinRule={zakinRule}
        washerType={washerType}
      />

      <EmbeddedCheckoutModal
        open={!!checkoutClientSecret}
        clientSecret={checkoutClientSecret}
        onClose={() => setCheckoutClientSecret(null)}
        summary={{
          productName: `${product.nameEn} ${product.nameJaShort} 壁付け手すり ${length}mm${hasOrientation ? `（${orientation === "left" ? "左向き" : "右向き"}）` : ""}`,
          productNote: `座金 ${prices.zakinCount}個 / ${deliveryType === "express" ? "特急配送 5営業日" : "通常配送 10営業日"}`,
          lines: [
            { label: `基本料金（〜${product.drawing.stdLengthMm}mm）`, amount: prices.basePrice },
            ...(prices.addon > 0 ? [{ label: "長さ追加料金", note: `+${length - product.drawing.stdLengthMm}mm × ¥${PRICE_PER_MM}`, amount: prices.addon }] : []),
            ...(prices.addZakin > 0 ? [{ label: "追加座金料金", note: `${prices.zakinCount - INCLUDED_ZAKIN}個 × ¥${ZAKIN_PRICE.toLocaleString()}`, amount: prices.addZakin }] : []),
            ...(prices.surcharge > 0 ? [{ label: "長尺割増", note: `${length}mm`, amount: prices.surcharge }] : []),
            ...(prices.angleCost > 0 ? [{ label: "角度加工料金", note: `${prices.zakinCount}個 × ¥${ANGLE_PRICE.toLocaleString()}`, amount: prices.angleCost }] : []),
            ...(quantity > 1 ? [{ label: `数量 × ${quantity}`, amount: prices.subtotal, emphasize: true }] : []),
            ...(prices.expressAddon > 0 ? [{ label: "特急割増（+20%）", amount: prices.expressAddon }] : []),
            ...(prices.shipping > 0 ? [{ label: `送料（佐川急便・${prefecture}・税抜）`, amount: prices.shipping }] : []),
            ...(prices.shippingTax > 0 ? [{ label: "送料消費税（10%）", amount: prices.shippingTax }] : []),
          ],
          totalLabel: "合計（税込）",
          totalAmount: prices.total,
        }}
      />
    </>
  )
}
