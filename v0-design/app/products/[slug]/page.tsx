"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ChevronLeft, ChevronRight, X, Play, Minus, Plus, ChevronDown, Check, Hammer, Paintbrush, Ruler, Wrench } from "lucide-react"

const CDN = "https://imagedelivery.net/QondspN4HIUvB_R16-ddAQ/60e3e0f9c3289c7ab78f13e7"

const productImages = [
  { src: `${CDN}/d0f5f0e83d40a4d29044.jpg/public`, alt: "René 全体" },
  { src: `${CDN}/64c3f4b2b519ba72780d.jpg/public`, alt: "ブラケット詳細" },
  { src: `${CDN}/c3cf0cf4cc3e4a4fece7.jpg/public`, alt: "側面" },
  { src: `${CDN}/ab37d46e36cbcbdd77d6.jpg/public`, alt: "施工例" },
  { src: `${CDN}/f8d5e9e1c6ecbeebfaf1.jpg/public`, alt: "取り付けイメージ" },
  { src: `${CDN}/0a0c0c78f9f636cca733.jpg/public`, alt: "カラーバリエーション" },
]

const specs = [
  { label: "素材", value: "鉄（無垢丸鋼）" },
  { label: "仕上げ", value: "焼付マット塗装" },
  { label: "カラー", value: "マットブラック" },
  { label: "標準長さ", value: "〜1500mm（最大5000mm）" },
  { label: "太さ", value: "φ25mm" },
  { label: "付属品", value: "座金3個・取付ビス一式" },
]

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
  { name: "Claire クレール", price: "¥42,000〜", image: `${CDN}/0a0c0c78f9f636cca733.jpg/fit=cover,w=400,h=400`, href: "/products/claire" },
  { name: "Marcel マルセル", price: "¥36,000〜", image: `${CDN}/939d0690971c550c1dd9.jpg/fit=cover,w=400,h=400`, href: "/products/marcel" },
  { name: "Émile エミール", price: "¥45,800〜", image: `${CDN}/2d1043dcd7658a96e5f3.jpg/fit=cover,w=400,h=400`, href: "/products/emile" },
]

export default function ProductDetailPage() {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [length, setLength] = useState(1000)
  const [quantity, setQuantity] = useState(1)
  const [prefecture, setPrefecture] = useState("")
  const [deliveryType, setDeliveryType] = useState<"normal" | "express">("normal")
  const [isPrefectureOpen, setIsPrefectureOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  // Price calculation — matches API route logic (checkout/route.ts)
  const BASE_PRICE = 36500       // René base price
  const STD_LENGTH = 1500        // mm included in base
  const PRICE_PER_MM = 25
  const ZAKIN_PRICE = 3500
  const END_DIST = 100
  const MAX_SPAN = 850
  const SURGE_START = 2000
  const SURGE_BASE = 1.2
  const SURGE_INTERVAL = 500
  const RUSH_RATE = 0.2
  const INCLUDED_ZAKIN = 3

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
    const zakinCount = length <= 1050 ? 2 : 1 + Math.ceil((length - 2 * END_DIST) / MAX_SPAN)
    const addZakin = Math.max(0, zakinCount - INCLUDED_ZAKIN) * ZAKIN_PRICE
    const unitPrice = BASE_PRICE + addon + addZakin + surcharge
    const subtotal = Math.round(unitPrice) * quantity
    const expressAddon = deliveryType === "express" ? Math.round(subtotal * RUSH_RATE) : 0
    const shipping = prefecture
      ? (shippingCosts[prefecture] || shippingCosts.default)
      : 0
    const total = subtotal + expressAddon + shipping
    return { unitPrice: Math.round(unitPrice), subtotal, expressAddon, shipping, total, zakinCount }
  }, [length, quantity, deliveryType, prefecture])

  const prices = calculatePrice()

  // Update current step based on filled fields
  useEffect(() => {
    if (length >= 500) setCurrentStep(Math.max(currentStep, 1))
    if (quantity > 0 && prefecture) setCurrentStep(Math.max(currentStep, 2))
    if (deliveryType) setCurrentStep(Math.max(currentStep, 3))
  }, [length, quantity, prefecture, deliveryType, currentStep])

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
            <Link href="/products" className="hover:text-foreground transition-colors">横型手すり</Link>
            <span>/</span>
            <span className="text-foreground">René ルネ</span>
          </nav>
        </div>

        {/* Two Column Layout */}
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            {/* LEFT COLUMN - Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <motion.div 
                className="relative aspect-[4/3] bg-secondary rounded-lg overflow-hidden cursor-zoom-in group"
                onClick={() => setIsLightboxOpen(true)}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={productImages[selectedImage].src}
                      alt={productImages[selectedImage].alt}
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

              {/* Thumbnail Strip */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden transition-all duration-300 ${
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
                  壁付け手すり ・ 横型
                </span>
              </div>

              {/* Product Name */}
              <div>
                <h1 className="font-serif text-3xl lg:text-4xl text-foreground mb-2">
                  René ルネ
                </h1>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  鍛冶職人制作 壁付けアイアン手すり 横型 φ25 マットブラック
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
                    <h3 className="text-[14px] font-medium text-foreground">長さを選ぶ</h3>
                    <div className="flex items-center gap-4">
                      <div className="relative flex-1">
                        <input
                          type="range"
                          min={500}
                          max={5000}
                          step={100}
                          value={length}
                          onChange={(e) => setLength(Number(e.target.value))}
                          className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
                        />
                        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                          <span>500mm</span>
                          <span>5000mm</span>
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          min={500}
                          max={5000}
                          step={100}
                          value={length}
                          onChange={(e) => setLength(Math.min(5000, Math.max(500, Number(e.target.value))))}
                          className="w-28 h-12 bg-gold/10 border-2 border-gold text-center font-mono text-lg text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-muted-foreground">
                          mm
                        </span>
                      </div>
                    </div>
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
                    
                    {/* Price Breakdown */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-[13px]">
                        <span className="text-muted-foreground">本体価格 ({length}mm × {quantity})</span>
                        <span>¥{prices.subtotal.toLocaleString()}</span>
                      </div>
                      {prices.expressAddon > 0 && (
                        <div className="flex justify-between text-[13px]">
                          <span className="text-muted-foreground">特急オプション (+20%)</span>
                          <span>¥{prices.expressAddon.toLocaleString()}</span>
                        </div>
                      )}
                      {prices.shipping > 0 && (
                        <div className="flex justify-between text-[13px]">
                          <span className="text-muted-foreground">送料 ({prefecture})</span>
                          <span>¥{prices.shipping.toLocaleString()}</span>
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
                René（ルネ）は、シンプルでありながら存在感のある横型アイアン手すりです。
                φ25mmの無垢丸鋼を鍛冶職人が一本一本手作りし、焼付マット塗装で仕上げています。
                マットブラックの落ち着いた佇まいは和洋どちらの空間にも馴染み、
                握りやすい太さで安全性と美しさを両立。座金・取付ビス一式付属で、届いたらすぐに取り付けられます。
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: Hammer, title: "手打ち鍛造", desc: "一点一点、職人が手打ちで仕上げます" },
                  { icon: Paintbrush, title: "マット塗装", desc: "耐久性の高い焼付塗装で長持ち" },
                  { icon: Ruler, title: "オーダーメイド", desc: "お好みのサイズでお作りします" },
                  { icon: Wrench, title: "取付簡単", desc: "付属の金具で簡単に取り付け可能" },
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-secondary rounded-lg">
                    <feature.icon className="w-6 h-6 text-gold flex-shrink-0" />
                    <div>
                      <h4 className="text-[14px] font-medium mb-1">{feature.title}</h4>
                      <p className="text-[12px] text-muted-foreground">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Video Section */}
            <section>
              <h2 className="font-serif text-2xl mb-6">制作動画</h2>
              <div className="aspect-video bg-dark rounded-lg overflow-hidden relative group cursor-pointer">
                <Image
                  src="/images/craftsman.jpg"
                  alt="制作動画サムネイル"
                  fill
                  className="object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-dark ml-1" fill="currentColor" />
                  </div>
                </div>
              </div>
            </section>

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
    </>
  )
}
