"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ReneDrawingModal } from "@/components/drawing-modal/rene-drawing-modal"
import { InlineRailSimulator } from "@/components/drawing-modal/inline-rail-simulator"
import { ZakinEditor, type ZakinState } from "@/components/drawing-modal/zakin-editor"
import { calcZakin, getZakinPositions } from "@/lib/drawing-modal/rene-constants"
import { getProductFull, galleryUrl, type FeatureIconName } from "@/lib/products/display"
import { ChevronLeft, ChevronRight, X, Play, Minus, Plus, ChevronDown, Check, Hammer, Paintbrush, Ruler, Wrench } from "lucide-react"

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

const relatedProducts = [
  { name: "Claire クレール", price: "¥42,000〜", image: galleryUrl("0a0c0c78f9f636cca733.jpg"), href: "/products/claire" },
  { name: "Marcel マルセル", price: "¥36,000〜", image: galleryUrl("939d0690971c550c1dd9.jpg"), href: "/products/marcel" },
  { name: "Émile エミール", price: "¥45,800〜", image: galleryUrl("2d1043dcd7658a96e5f3.jpg"), href: "/products/emile" },
]

export default function ProductDetailPage() {
  const routeParams = useParams<{ slug: string }>()
  const slug = routeParams?.slug ?? "rene"
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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [length, setLength] = useState(product.drawing.stdLengthMm)
  const [quantity, setQuantity] = useState(1)
  const [prefecture, setPrefecture] = useState("")
  const [deliveryType, setDeliveryType] = useState<"normal" | "express">("normal")
  const [isPrefectureOpen, setIsPrefectureOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isDrawingOpen, setIsDrawingOpen] = useState(false)
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
  // 共通定数 (全商品同じ)
  const PRICE_PER_MM = 25
  const ZAKIN_PRICE = 3500
  const ANGLE_PRICE = 2000 // 角度加工: 座金1箇所あたり (rene.html 準拠)
  const SURGE_START = 2000
  const SURGE_BASE = 1.2
  const SURGE_INTERVAL = 500
  const RUSH_RATE = 0.2

  const shippingCosts: { [key: string]: number } = {
    "北海道": 3500,
    "沖縄県": 4500,
    default: 1800
  }

  const calculatePrice = useCallback(() => {
    const addon = Math.max(0, length - STD_LENGTH) * PRICE_PER_MM
    const longM = length > SURGE_START
      ? Math.pow(SURGE_BASE, (length - SURGE_START) / SURGE_INTERVAL)
      : 1
    const surcharge = length > SURGE_START ? addon * (longM - 1) : 0
    // 座金数はカスタムモードなら zakin.positions.length、自動なら calcZakin
    const zakinCount = zakin.customMode
      ? zakin.positions.length
      : calcZakin(length, zakinRule)
    const addZakin = Math.max(0, zakinCount - INCLUDED_ZAKIN) * ZAKIN_PRICE
    // 角度加工料金 (横型のみ適用、縦型は 0 固定)
    const isHorizontalCat = product.drawing.category === "horizontal"
    const angleCost = isHorizontalCat && zakin.angleDeg > 0 ? zakinCount * ANGLE_PRICE : 0
    const unitPrice = BASE_PRICE + addon + addZakin + surcharge + angleCost
    const subtotal = Math.round(unitPrice) * quantity
    const expressAddon = deliveryType === "express" ? Math.round(subtotal * RUSH_RATE) : 0
    const shipping = prefecture
      ? (shippingCosts[prefecture] || shippingCosts.default)
      : 0
    const total = subtotal + expressAddon + shipping
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
      total,
      zakinCount,
    }
  }, [length, quantity, deliveryType, prefecture, zakin])

  const prices = calculatePrice()

  // Update current step based on filled fields
  useEffect(() => {
    if (length >= minLength) setCurrentStep(Math.max(currentStep, 1))
    if (quantity > 0 && prefecture) setCurrentStep(Math.max(currentStep, 2))
    if (deliveryType) setCurrentStep(Math.max(currentStep, 3))
  }, [length, quantity, prefecture, deliveryType, currentStep, minLength])

  // Lightbox 開閉時の body スクロールロック
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = "hidden"
      return () => { document.body.style.overflow = "" }
    }
  }, [isLightboxOpen])

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

  return (
    <>
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
              {/* Main Image — サムネと同じスクエア */}
              <motion.div
                className="relative aspect-square bg-secondary rounded-lg overflow-hidden cursor-zoom-in group"
                onClick={() => setIsLightboxOpen(true)}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={hoveredImage ?? selectedImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={productImages[hoveredImage ?? selectedImage].src}
                      alt={productImages[hoveredImage ?? selectedImage].alt}
                      fill
                      className="object-cover"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>
                
                {/* Navigation Arrows */}
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white shadow-lg"
                  aria-label="前の画像"
                >
                  <ChevronLeft className="w-5 h-5 text-dark" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white shadow-lg"
                  aria-label="次の画像"
                >
                  <ChevronRight className="w-5 h-5 text-dark" />
                </button>

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-dark/70 text-white text-[11px] px-3 py-1 rounded-full font-mono">
                  {selectedImage + 1} / {productImages.length}
                </div>
              </motion.div>

              {/* Thumbnail Grid — ホバーでヒーロー画像切替、クリックでLightbox */}
              <div
                className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-5 lg:grid-cols-7 gap-2"
                onMouseLeave={() => setHoveredImage(null)}
              >
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onMouseEnter={() => setHoveredImage(index)}
                    onClick={() => { setSelectedImage(index); setIsLightboxOpen(true); }}
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
            <div className="space-y-6">
              {/* Category Label */}
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-gold rounded-full" />
                <span className="text-[12px] tracking-wide text-muted-foreground">
                  {product.subtitle}
                </span>
              </div>

              {/* Product Name */}
              <div>
                <h1 className="font-serif text-3xl lg:text-4xl text-foreground mb-2">
                  {product.nameEn} {product.nameJaShort}
                </h1>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  {product.shortDescription}
                </p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 py-4">
                {specs.map((spec, index) => (
                  <div key={index} className="flex items-baseline">
                    <span className="text-[12px] text-muted-foreground min-w-[60px]">
                      {spec.label}
                    </span>
                    <span className="flex-1 border-b border-dotted border-border mx-2" />
                    <span className="text-[13px] text-foreground">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t-2 border-gold/30 pt-6" />

              {/* Price Calculator */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] tracking-[0.2em] uppercase text-gold font-medium">
                    PRICE CALCULATOR
                  </span>
                  <div className="flex-1 h-px bg-gold/30" />
                </div>

                {/* Step 1: Length */}
                <div className="relative pl-10">
                  <div className={`absolute left-0 top-0 w-7 h-7 flex items-center justify-center text-[12px] font-medium transition-colors ${
                    currentStep >= 1 ? "bg-gold text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    01
                  </div>
                  <div className="absolute left-[13px] top-8 bottom-0 w-px bg-border" />
                  
                  <div className="space-y-3">
                    <h3 className="text-[14px] font-medium text-foreground">
                      {product.drawing.category === "fixed" ? "サイズ" : "長さを選ぶ"}
                    </h3>
                    {product.drawing.category === "fixed" ? (
                      <div className="flex items-center gap-4">
                        <div className="flex-1 px-4 py-4 bg-secondary border border-border text-[14px] text-foreground">
                          高さ {product.drawing.stdLengthMm}mm 固定サイズ
                          <span className="text-[11px] text-muted-foreground ml-2">
                            （長さ調整不可）
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-4">
                          <div className="relative flex-1">
                            <input
                              type="range"
                              min={minLength}
                              max={maxLength}
                              step={1}
                              value={length}
                              onChange={(e) => setLength(Number(e.target.value))}
                              className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
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
                              value={length}
                              onChange={(e) => setLength(Math.min(maxLength, Math.max(minLength, Number(e.target.value))))}
                              className="w-28 h-12 bg-gold/10 border-2 border-gold text-center font-mono text-lg text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-muted-foreground">
                              mm
                            </span>
                          </div>
                        </div>
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
                          className="mt-3"
                        />
                        <ZakinEditor
                          lengthMm={length}
                          state={zakin}
                          onChange={setZakin}
                          zakinRule={zakinRule}
                          disableAngle={product.drawing.category !== "horizontal"}
                          className="mt-3"
                        />
                        <button
                          type="button"
                          onClick={() => setIsDrawingOpen(true)}
                          className="mt-2 inline-flex items-center gap-2 text-[12px] tracking-wider text-gold hover:text-gold/80 border border-gold/40 hover:border-gold px-4 py-2 transition-colors"
                        >
                          制作図プレビュー ▸
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Step 2: Quantity & Prefecture */}
                <div className="relative pl-10 pt-6">
                  <div className={`absolute left-0 top-6 w-7 h-7 flex items-center justify-center text-[12px] font-medium transition-colors ${
                    currentStep >= 2 ? "bg-gold text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    02
                  </div>
                  <div className="absolute left-[13px] top-14 bottom-0 w-px bg-border" />
                  
                  <div className="space-y-4">
                    <h3 className="text-[14px] font-medium text-foreground">数量・配送先</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Quantity */}
                      <div className="flex items-center border border-border rounded-md">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"
                          aria-label="数量を減らす"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-mono text-lg">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"
                          aria-label="数量を増やす"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Prefecture Dropdown */}
                      <div className="relative flex-1">
                        <button
                          onClick={() => setIsPrefectureOpen(!isPrefectureOpen)}
                          className="w-full h-10 px-4 flex items-center justify-between border border-border rounded-md text-[13px] hover:border-gold transition-colors"
                        >
                          <span className={prefecture ? "text-foreground" : "text-muted-foreground"}>
                            {prefecture || "配送先都道府県を選択"}
                          </span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${isPrefectureOpen ? "rotate-180" : ""}`} />
                        </button>
                        
                        <AnimatePresence>
                          {isPrefectureOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-md shadow-lg max-h-60 overflow-y-auto z-20"
                            >
                              {prefectures.map((pref) => (
                                <button
                                  key={pref}
                                  onClick={() => { setPrefecture(pref); setIsPrefectureOpen(false); }}
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
                  </div>
                </div>

                {/* Step 3: Delivery */}
                <div className="relative pl-10 pt-6">
                  <div className={`absolute left-0 top-6 w-7 h-7 flex items-center justify-center text-[12px] font-medium transition-colors ${
                    currentStep >= 3 ? "bg-gold text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    03
                  </div>
                  <div className="absolute left-[13px] top-14 bottom-0 w-px bg-border" />
                  
                  <div className="space-y-4">
                    <h3 className="text-[14px] font-medium text-foreground">納品日・配送を選ぶ</h3>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setDeliveryType("normal")}
                        className={`flex-1 py-3 px-4 rounded-md border-2 transition-all ${
                          deliveryType === "normal"
                            ? "border-gold bg-gold/5"
                            : "border-border hover:border-gold/50"
                        }`}
                      >
                        <div className="text-[13px] font-medium">通常</div>
                        <div className="text-[11px] text-muted-foreground">10営業日</div>
                      </button>
                      <button
                        onClick={() => setDeliveryType("express")}
                        className={`flex-1 py-3 px-4 rounded-md border-2 transition-all ${
                          deliveryType === "express"
                            ? "border-gold bg-gold/5"
                            : "border-border hover:border-gold/50"
                        }`}
                      >
                        <div className="text-[13px] font-medium">特急 <span className="text-gold">+20%</span></div>
                        <div className="text-[11px] text-muted-foreground">5営業日</div>
                      </button>
                    </div>
                    <p className="text-[12px] text-muted-foreground">
                      お届け予定日: <span className="text-foreground font-medium">{getDeliveryDate()}頃</span>
                    </p>
                  </div>
                </div>

                {/* Step 4: Confirm & Purchase */}
                <div className="relative pl-10 pt-6">
                  <div className={`absolute left-0 top-6 w-7 h-7 flex items-center justify-center text-[12px] font-medium transition-colors ${
                    currentStep >= 4 ? "bg-gold text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    04
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-[14px] font-medium text-foreground">確認して購入</h3>
                    
                    {/* Price Breakdown (詳細内訳) */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-[13px]">
                        <span className="text-muted-foreground">
                          基本料金（〜{product.drawing.stdLengthMm}mm）
                        </span>
                        <span>¥{prices.basePrice.toLocaleString()}</span>
                      </div>
                      {prices.addon > 0 && (
                        <div className="flex justify-between text-[13px]">
                          <span className="text-muted-foreground">
                            長さ追加料金（+{length - product.drawing.stdLengthMm}mm × ¥{PRICE_PER_MM}）
                          </span>
                          <span>+¥{prices.addon.toLocaleString()}</span>
                        </div>
                      )}
                      {prices.addZakin > 0 && (
                        <div className="flex justify-between text-[13px]">
                          <span className="text-muted-foreground">
                            追加座金料金（{prices.zakinCount - INCLUDED_ZAKIN}個 × ¥{ZAKIN_PRICE.toLocaleString()}）
                          </span>
                          <span>+¥{prices.addZakin.toLocaleString()}</span>
                        </div>
                      )}
                      {prices.surcharge > 0 && (
                        <div className="flex justify-between text-[13px]">
                          <span className="text-muted-foreground">
                            長尺割増（{length}mm）
                          </span>
                          <span>+¥{prices.surcharge.toLocaleString()}</span>
                        </div>
                      )}
                      {prices.angleCost > 0 && (
                        <div className="flex justify-between text-[13px]">
                          <span className="text-muted-foreground">
                            角度加工料金（{prices.zakinCount}個 × ¥{ANGLE_PRICE.toLocaleString()}、{zakin.angleDir === "left" ? "左" : "右"}{zakin.angleDeg}°）
                          </span>
                          <span>+¥{prices.angleCost.toLocaleString()}</span>
                        </div>
                      )}
                      {quantity > 1 && (
                        <div className="flex justify-between text-[13px] pt-2 border-t border-border/60">
                          <span className="text-muted-foreground">
                            単価 × {quantity}
                          </span>
                          <span>¥{prices.subtotal.toLocaleString()}</span>
                        </div>
                      )}
                      {prices.expressAddon > 0 && (
                        <div className="flex justify-between text-[13px]">
                          <span className="text-muted-foreground">特急割増（+20%）</span>
                          <span>+¥{prices.expressAddon.toLocaleString()}</span>
                        </div>
                      )}
                      {prices.shipping > 0 && (
                        <div className="flex justify-between text-[13px] pt-2 border-t border-border/60">
                          <span className="text-muted-foreground">送料（{prefecture}）</span>
                          <span>+¥{prices.shipping.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Total Price */}
                    <div className="flex items-center gap-4 py-4">
                      <div className="w-1.5 h-12 bg-gold rounded-full" />
                      <div>
                        <span className="text-[11px] text-muted-foreground block">合計（税込）</span>
                        <span className="font-mono text-3xl lg:text-4xl text-foreground">
                          ¥{prices.total.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="space-y-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-4 bg-gold text-white font-medium rounded-md relative overflow-hidden group"
                      >
                        <span className="relative z-10">カートに追加 — 購入手続きへ</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      </motion.button>
                      <button className="w-full py-3 border border-border text-foreground font-medium rounded-md hover:border-gold hover:text-gold transition-colors">
                        見積もりを取る
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BELOW THE FOLD */}
          <div className="mt-20 space-y-20">
            {/* Product Description */}
            <section className="max-w-3xl">
              <h2 className="font-serif text-2xl mb-6">製品について</h2>
              <p className="text-[14px] leading-relaxed text-muted-foreground mb-8">
                {product.longDescription}
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {product.featureBullets.map((feature, index) => {
                  const Icon = FEATURE_ICON_MAP[feature.icon]
                  return (
                    <div key={index} className="flex items-start gap-3 p-4 bg-secondary rounded-lg">
                      <Icon className="w-6 h-6 text-gold flex-shrink-0" />
                      <div>
                        <h4 className="text-[14px] font-medium mb-1">{feature.title}</h4>
                        <p className="text-[12px] text-muted-foreground">{feature.desc}</p>
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
            <section>
              <h2 className="font-serif text-2xl mb-6">関連商品</h2>
              <div className="grid sm:grid-cols-3 gap-6">
                {relatedProducts.map((product, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -8 }}
                    className="group cursor-pointer"
                  >
                    <div className="aspect-square bg-secondary rounded-lg overflow-hidden mb-4 relative">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <h3 className="font-serif text-lg mb-1">{product.name}</h3>
                    <p className="text-[13px] text-muted-foreground">{product.price}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
            onClick={() => setIsLightboxOpen(false)}
          >
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label="閉じる"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label="前の画像"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label="次の画像"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
            
            <div className="relative w-full max-w-5xl aspect-[4/3] mx-6" onClick={(e) => e.stopPropagation()}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={productImages[selectedImage].src}
                    alt={productImages[selectedImage].alt}
                    fill
                    className="object-contain"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Lightbox Thumbnails */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {productImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.stopPropagation(); setSelectedImage(index); }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    selectedImage === index ? "bg-gold w-6" : "bg-white/40 hover:bg-white/60"
                  }`}
                  aria-label={`画像 ${index + 1}`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ReneDrawingModal
        open={isDrawingOpen}
        onClose={() => setIsDrawingOpen(false)}
        lengthMm={length}
        productSlug={slug}
        positions={zakin.positions}
        angleDeg={zakin.angleDeg}
        angleDir={zakin.angleDir}
        zakinRule={zakinRule}
      />
    </>
  )
}
