"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, ChevronDown, Check, Mail, MessageSquare, ShoppingBag, Minus, Plus, Hammer, Paintbrush, Ruler, Wrench, Sparkles, Clock, Truck, ShieldCheck, Camera, Copy, FileDown } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PrimaryCTA } from "@/components/ui/primary-cta"
import type { SimpleProduct, TrustBadgeIcon } from "@/lib/products/simple"
import { galleryUrl, type FeatureIconName } from "@/lib/products/display"
import { getProductStructuredData } from "@/lib/products/structured-data"
import { getRelatedProducts, CATALOG_PRODUCTS } from "@/lib/products/catalog"
import { KaigoNotice } from "@/components/kaigo-notice"
import { EmbeddedCheckoutModal } from "@/components/checkout/embedded-checkout-modal"
import { BankOrderModal } from "@/components/checkout/bank-order-modal"
import { fireGtagEvent } from "@/lib/gtag"
import { FinishCommitment } from "@/components/finish-commitment"
import { ClemenceSpecPanel } from "@/components/clemence-spec-panel"
import { RailPriceSimulator } from "@/components/rail-price-simulator"
import { calcClemenceShipping, PREF_TO_REGION } from "@/lib/shipping/sagawa"
import { getEarliestArrival } from "@/lib/business-days"
import { copyToClipboard } from "@/lib/products/quote-share"

const PREFECTURES = Object.keys(PREF_TO_REGION)

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

/** 特急配送の割増率（合計の +20%）。見積計算機つき商品（order-pricing.ts の RUSH_RATE）と同一。 */
const CLEMENCE_RUSH_RATE = 0.2

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
  // Clémence は延長オプション＋配送先別送料のため専用の直接決済フローを持つ
  const isClemencePurchase = product.slug === "clemence"
  const [quantity, setQuantity] = useState(1)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  // Embedded Checkout: clientSecret が入ったらモーダルが開く
  const [checkoutClientSecret, setCheckoutClientSecret] = useState<string | null>(null)
  // Clémence 専用: 見積もり共有 URL からの復元（w/h/x2/x3/ext は ClemenceSpecPanel へ
  // initial として渡す。René の shareQuery と同じ発想だが、Clémence は W/H/ブラケット位置
  // というまったく別の入力モデルのため lib/products/quote-share.ts は流用せず、
  // ClemenceSpecPanel が既に生成している w/h/x2/x3/ext クエリのキー名をそのまま共有 URL にも使う）。
  const clemenceSearchParams = useSearchParams()
  const clemenceRestored = useMemo(() => {
    if (!isClemencePurchase) return null
    const num = (key: string) => {
      const v = Number(clemenceSearchParams.get(key))
      return Number.isFinite(v) && v > 0 ? v : undefined
    }
    return {
      w: num("w"),
      h: num("h"),
      x2: num("x2"),
      x3: num("x3"),
      ext: num("ext"),
      pref: clemenceSearchParams.get("pref") || "",
      dt: clemenceSearchParams.get("dt") === "e" ? ("express" as const) : ("normal" as const),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClemencePurchase])

  // Clémence 専用: 寸法・ブラケット位置の入力内容を ClemenceSpecPanel から引き継ぐクエリ
  const [clemenceQuery, setClemenceQuery] = useState("")
  // 参考価格シミュレーター（Élisabeth 等 product.simulator 指定商品）の選択内容を
  // 見積もり依頼リンクに引き継ぐクエリ。clemenceQuery とは商品が排他なので同時には使われない
  const [simulatorQuery, setSimulatorQuery] = useState("")
  const [clemencePrefecture, setClemencePrefecture] = useState(() =>
    clemenceRestored?.pref && PREFECTURES.includes(clemenceRestored.pref) ? clemenceRestored.pref : "",
  )
  const [clemenceDelivery, setClemenceDelivery] = useState<"normal" | "express">(
    () => clemenceRestored?.dt ?? "normal",
  )
  const [isClemenceCheckingOut, setIsClemenceCheckingOut] = useState(false)
  const [clemenceCheckoutError, setClemenceCheckoutError] = useState<string | null>(null)
  const [clemenceBankOrderOpen, setClemenceBankOrderOpen] = useState(false)
  const [isClemencePrefOpen, setIsClemencePrefOpen] = useState(false)
  const clemencePurchaseRef = useRef<HTMLDivElement | null>(null)
  const clemencePrefRef = useRef<HTMLDivElement | null>(null)
  const [clemenceLinkCopied, setClemenceLinkCopied] = useState(false)
  // quote-pdf-root の Portal は document.body を参照するため、SSR では呼び出せない。
  // マウント後のみ true にして、初回サーバーレンダリングと初回クライアントレンダリングを
  // 一致させる（isClemencePurchase 自体は SSR でも true になるため直接ガードにはできない）。
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])

  const clemenceParams = useMemo(
    () => new URLSearchParams(clemenceQuery.replace(/^&/, "")),
    [clemenceQuery],
  )
  const clemenceW = Number(clemenceParams.get("w")) || 1000
  const clemenceH = Number(clemenceParams.get("h")) || 500
  const clemenceX2 = Number(clemenceParams.get("x2")) || 455
  const clemenceX3 = Number(clemenceParams.get("x3")) || 910
  const clemenceExt = Number(clemenceParams.get("ext")) || 0
  const clemenceExtPrice = Number(clemenceParams.get("extprice")) || 0
  const clemenceShippingInfo = useMemo(
    () => (clemencePrefecture ? calcClemenceShipping(clemencePrefecture, clemenceExt) : null),
    [clemencePrefecture, clemenceExt],
  )
  // 見積計算機つき商品（René 等）と同じ営業日ベースでお届け予定日を算出（通常10 / 特急5 営業日）
  const clemenceDeliveryDate = useMemo(
    () =>
      getEarliestArrival(new Date(), clemenceDelivery === "express").toLocaleDateString("ja-JP", {
        month: "long",
        day: "numeric",
      }),
    [clemenceDelivery],
  )
  const clemenceSubtotal = product.basePrice + clemenceExtPrice
  const clemenceExpressAddon =
    clemenceDelivery === "express" ? Math.round(clemenceSubtotal * CLEMENCE_RUSH_RATE) : 0
  const clemenceShipping =
    clemenceShippingInfo && !clemenceShippingInfo.inquiry ? clemenceShippingInfo.shipping : 0
  const clemenceShippingTax = Math.round(clemenceShipping * 0.1)
  const clemenceTotal = clemenceSubtotal + clemenceExpressAddon + clemenceShipping + clemenceShippingTax

  // カード決済・銀行振込で共有する注文ペイロード（サーバ側で価格を再計算するため入力を一致させる）
  const clemenceOrderPayload = {
    product: "clemence",
    prefecture: clemencePrefecture,
    rushDelivery: clemenceDelivery === "express",
    w: clemenceW,
    h: clemenceH,
    x2: clemenceX2,
    x3: clemenceX3,
    ext: clemenceExt,
  }
  const clemenceSummary = {
    productName: `${product.nameJa}（${product.nameEn}）`,
    productNote: `W${clemenceW}×H${clemenceH}mm・②${clemenceX2}mm/③${clemenceX3}mm${clemenceExt > 0 ? `・③延長+${clemenceExt}mm` : ""} / ${clemenceDelivery === "express" ? "特急配送 5営業日" : "通常配送 10営業日"}`,
    lines: [
      { label: "本体料金（500×1000mm 一律）", amount: product.basePrice },
      ...(clemenceExtPrice > 0 ? [{ label: "③側延長オプション", amount: clemenceExtPrice }] : []),
      ...(clemenceExpressAddon > 0 ? [{ label: "特急割増（+20%）", amount: clemenceExpressAddon }] : []),
      ...(clemenceShipping > 0 ? [{ label: `送料（佐川急便・${clemencePrefecture}・税抜）`, amount: clemenceShipping }] : []),
      ...(clemenceShippingTax > 0 ? [{ label: "送料消費税（10%）", amount: clemenceShippingTax }] : []),
    ],
    totalLabel: "合計（税込）",
    totalAmount: clemenceTotal,
  }

  // Step 表示用（René と同じ 01〜04 の完了判定）
  const clemenceStep2Done = clemencePrefecture !== ""
  const clemenceStep4Ready = clemenceStep2Done

  // 見積もり共有 URL（René の shareUrl/lineShareUrl と同じ役割）。
  // ClemenceSpecPanel が生成する w/h/x2/x3/ext クエリに配送先・配送区分を足すだけ。
  const clemenceShareQuery = new URLSearchParams(clemenceParams)
  clemenceShareQuery.delete("type")
  clemenceShareQuery.delete("extprice")
  clemenceShareQuery.delete("total")
  if (clemencePrefecture) clemenceShareQuery.set("pref", clemencePrefecture)
  if (clemenceDelivery === "express") clemenceShareQuery.set("dt", "e")
  const clemenceShareUrl = `https://ado.tantetuzest.com/products/clemence?${clemenceShareQuery.toString()}`
  const clemenceLineShareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(clemenceShareUrl)}`
  const handleClemenceCopyShareLink = async () => {
    const ok = await copyToClipboard(clemenceShareUrl)
    if (ok) {
      setClemenceLinkCopied(true)
      setTimeout(() => setClemenceLinkCopied(false), 2200)
    }
  }
  const handleClemencePrintQuote = () => window.print()
  const clemenceQuoteIssueDate = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const handleClemenceCheckout = async () => {
    if (!clemencePrefecture || !clemenceShippingInfo || clemenceShippingInfo.inquiry) {
      setClemenceCheckoutError("配送先都道府県を選択してください")
      clemencePurchaseRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    setIsClemenceCheckingOut(true)
    setClemenceCheckoutError(null)
    fireGtagEvent("begin_checkout", {
      currency: "JPY",
      value: clemenceTotal,
      checkout_method: "card",
      items: [{ item_id: "clemence", item_name: "Clémence", quantity: 1 }],
    })
    try {
      const res = await fetch("/api/checkout/simple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clemenceOrderPayload),
      })
      const data = await res.json()
      if (!res.ok || !data.clientSecret) {
        throw new Error(data?.error || "セッションの作成に失敗しました")
      }
      setCheckoutClientSecret(data.clientSecret)
      setIsClemenceCheckingOut(false)
    } catch (err) {
      setClemenceCheckoutError(err instanceof Error ? err.message : "セッションの作成に失敗しました")
      setIsClemenceCheckingOut(false)
    }
  }

  const handleClemenceBankOrder = () => {
    if (!clemencePrefecture || !clemenceShippingInfo || clemenceShippingInfo.inquiry) {
      setClemenceCheckoutError("配送先都道府県を選択してください")
      clemencePurchaseRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    setClemenceCheckoutError(null)
    fireGtagEvent("begin_checkout", {
      currency: "JPY",
      value: clemenceTotal,
      checkout_method: "bank",
      items: [{ item_id: "clemence", item_name: "Clémence", quantity: 1 }],
    })
    setClemenceBankOrderOpen(true)
  }

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

            {isClemencePurchase ? (
              <>
                {/* René 等・見積計算機つき商品ページと同じ並び:
                    価格のすぐ下に介護保険案内＋仕上げのこだわり訴求を置く（蠣﨑さん指示・2026-07-11） */}
                {isHandrail && <KaigoNotice />}
                <div className="mb-10">
                  <FinishCommitment specs={product.specs} />
                </div>

                {/* 商品説明（長文）*/}
                <p className="text-[15px] leading-relaxed text-foreground whitespace-pre-line mb-10">
                  {product.longDescription}
                </p>

                {/* ===== 相談誘導 CTA① — 説明文直後（René と同一構成） ===== */}
                <div className="mb-10 rounded-lg border-2 border-gold/50 bg-gold/[0.05] p-6 shadow-sm">
                  <p className="mb-1 flex items-center gap-2 text-[12px] tracking-[0.2em] uppercase text-gold font-semibold">
                    <Camera className="w-4 h-4 shrink-0" />
                    Before you order
                  </p>
                  <p className="mb-3 font-serif text-[18px] font-bold text-foreground">
                    取り付けられるか、まず確認してみませんか？
                  </p>
                  <p className="mb-5 text-[14px] leading-relaxed text-muted-foreground">
                    「下地の位置がわからない」「サイズが合うか不安」——
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
                      href={`/contact?product=${encodeURIComponent(product.slug)}`}
                      className="flex items-center justify-center gap-2 rounded-md border-2 border-gold/40 bg-white px-5 py-3 text-[14px] font-semibold text-foreground transition hover:border-gold hover:text-gold"
                    >
                      フォームで相談する
                    </Link>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t-2 border-gold/30 pt-6" />

                {/* PRICE CALCULATOR（René の Step 01〜04 構成と同一） */}
                <div className="space-y-7">
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] tracking-[0.2em] uppercase text-gold font-semibold">
                      PRICE CALCULATOR
                    </span>
                    <div className="flex-1 h-px bg-gold/30" />
                  </div>

                  {/* Step 1: サイズとブラケット位置 */}
                  <div className="relative pl-14">
                    <div className="absolute left-0 top-0 w-11 h-11 flex items-center justify-center text-[16px] font-serif font-bold rounded-full shadow-sm bg-gold text-white">
                      01
                    </div>
                    <div className="absolute left-[21px] top-12 bottom-0 w-px bg-border" />
                    <div className="space-y-4">
                      <h3 className="font-serif text-[22px] font-bold text-foreground tracking-tight">
                        サイズとブラケット位置を指定
                      </h3>
                      <ClemenceSpecPanel onQueryChange={setClemenceQuery} initial={clemenceRestored ?? undefined} />
                    </div>
                  </div>

                  {/* Step 2: 配送先 */}
                  <div className="relative pl-14 pt-6">
                    <div className={`absolute left-0 top-6 w-11 h-11 flex items-center justify-center text-[16px] font-serif font-bold rounded-full shadow-sm transition-colors ${
                      clemenceStep2Done ? "bg-gold text-white" : "bg-gold/15 text-gold"
                    }`}>
                      02
                    </div>
                    <div className="absolute left-[21px] top-[68px] bottom-0 w-px bg-border" />
                    <div className="space-y-4">
                      <h3 className="font-serif text-[22px] font-bold text-foreground tracking-tight">
                        配送先
                        {!clemencePrefecture && (
                          <span className="ml-2 text-[11px] font-sans font-medium text-red-600 align-middle tracking-wider">必須</span>
                        )}
                      </h3>
                      <div ref={clemencePrefRef} className="relative">
                        <button
                          type="button"
                          onClick={() => setIsClemencePrefOpen(!isClemencePrefOpen)}
                          className={`w-full h-12 px-4 flex items-center justify-between border-2 rounded-md text-[14px] font-medium transition-colors ${
                            clemencePrefecture
                              ? "border-gold bg-gold/5 text-foreground"
                              : "border-gold/60 bg-white text-foreground hover:border-gold"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {!clemencePrefecture && (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gold/15 text-gold text-[11px] font-bold">
                                ▼
                              </span>
                            )}
                            <span>{clemencePrefecture || "配送先都道府県を選択 ▸"}</span>
                          </span>
                          <ChevronDown className={`w-5 h-5 text-gold transition-transform ${isClemencePrefOpen ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence>
                          {isClemencePrefOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gold/20 rounded-md shadow-lg max-h-60 overflow-y-auto z-20"
                            >
                              {PREFECTURES.map((pref) => (
                                <button
                                  key={pref}
                                  type="button"
                                  onClick={() => {
                                    setClemencePrefecture(pref)
                                    setIsClemencePrefOpen(false)
                                    setClemenceCheckoutError(null)
                                  }}
                                  className="w-full px-4 py-2 text-left text-[13px] hover:bg-muted transition-colors flex items-center justify-between"
                                >
                                  {pref}
                                  {clemencePrefecture === pref && <Check className="w-4 h-4 text-gold" />}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: 納品日・配送 */}
                  <div className="relative pl-14 pt-6">
                    <div className="absolute left-0 top-6 w-11 h-11 flex items-center justify-center text-[16px] font-serif font-bold rounded-full shadow-sm bg-gold text-white">
                      03
                    </div>
                    <div className="absolute left-[21px] top-[68px] bottom-0 w-px bg-border" />
                    <div className="space-y-4">
                      <h3 className="font-serif text-[22px] font-bold text-foreground tracking-tight">納品日・配送を選ぶ</h3>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setClemenceDelivery("normal")}
                          className={`flex-1 py-4 px-4 rounded-md border-2 transition-all ${
                            clemenceDelivery === "normal" ? "border-gold bg-gold/5" : "border-gold/20 hover:border-gold/50"
                          }`}
                        >
                          <div className="text-[15px] font-medium">通常</div>
                          <div className="text-[12px] text-muted-foreground mt-0.5">10営業日</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setClemenceDelivery("express")}
                          className={`flex-1 py-4 px-4 rounded-md border-2 transition-all ${
                            clemenceDelivery === "express" ? "border-gold bg-gold/5" : "border-gold/20 hover:border-gold/50"
                          }`}
                        >
                          <div className="text-[15px] font-medium">特急 <span className="text-gold">+20%</span></div>
                          <div className="text-[12px] text-muted-foreground mt-0.5">5営業日</div>
                        </button>
                      </div>
                      <p className="text-[14px] text-muted-foreground">
                        お届け予定日: <span className="text-foreground font-medium">{clemenceDeliveryDate}頃</span>
                      </p>
                    </div>
                  </div>

                  {/* Step 4: 確認して購入 */}
                  <div className="relative pl-14 pt-6">
                    <div className={`absolute left-0 top-6 w-11 h-11 flex items-center justify-center text-[16px] font-serif font-bold rounded-full shadow-sm transition-colors ${
                      clemenceStep4Ready ? "bg-gold text-white" : "bg-gold/15 text-gold"
                    }`}>
                      04
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-serif text-[22px] font-bold text-foreground tracking-tight">確認して購入</h3>

                      {/* Price Breakdown */}
                      <div className="bg-white border border-gold/20 rounded-lg p-5 space-y-2.5">
                        <div className="flex justify-between text-[15px]">
                          <span className="text-muted-foreground">本体料金（500×1000mm 一律）</span>
                          <span className="font-mono">¥{product.basePrice.toLocaleString()}</span>
                        </div>
                        {clemenceExtPrice > 0 && (
                          <div className="flex justify-between text-[15px]">
                            <span className="text-muted-foreground">③側延長オプション</span>
                            <span className="font-mono">+¥{clemenceExtPrice.toLocaleString()}</span>
                          </div>
                        )}
                        {clemenceExpressAddon > 0 && (
                          <div className="flex justify-between text-[15px]">
                            <span className="text-muted-foreground">特急割増（+20%）</span>
                            <span className="font-mono">+¥{clemenceExpressAddon.toLocaleString()}</span>
                          </div>
                        )}
                        {clemenceShipping > 0 && (
                          <div className="pt-2 border-t border-border/60 space-y-1">
                            <div className="flex justify-between text-[15px]">
                              <span className="text-muted-foreground">送料（{clemencePrefecture}・佐川急便・税抜）</span>
                              <span className="font-mono">+¥{clemenceShipping.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[15px]">
                              <span className="text-muted-foreground">送料消費税（10%）</span>
                              <span className="font-mono">+¥{clemenceShippingTax.toLocaleString()}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Shipping Inquiry Banner（沖縄県のみ） */}
                      {clemencePrefecture && clemenceShippingInfo?.inquiry && (
                        <div className="border-2 border-yellow-500/60 bg-yellow-500/5 rounded-lg p-4">
                          <p className="text-[14px] text-yellow-700 font-medium mb-2">
                            ⚠ {clemenceShippingInfo.inquiryReason}
                          </p>
                          <a
                            href="mailto:ado@tantetuzest.com"
                            className="inline-flex items-center gap-1 text-[14px] text-gold hover:text-gold/80 underline"
                          >
                            お問い合わせよりご相談ください
                          </a>
                        </div>
                      )}

                      {/* 見積もりを保存・共有・PDF化（René と同一機能） */}
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-1 pb-1">
                        <PrimaryCTA
                          type="button"
                          onClick={handleClemenceCopyShareLink}
                          variant="outline"
                          size="sm"
                          withArrow={false}
                          icon={<Copy className="w-3.5 h-3.5" />}
                          className="text-[13px] tracking-normal normal-case"
                        >
                          {clemenceLinkCopied ? "コピーしました" : "この見積もりを共有"}
                        </PrimaryCTA>
                        <PrimaryCTA
                          href={clemenceLineShareUrl}
                          external
                          variant="line"
                          size="sm"
                          withArrow={false}
                          className="text-[13px] tracking-normal normal-case"
                        >
                          LINEで共有
                        </PrimaryCTA>
                        <PrimaryCTA
                          type="button"
                          onClick={handleClemencePrintQuote}
                          variant="outline"
                          size="sm"
                          withArrow={false}
                          icon={<FileDown className="w-3.5 h-3.5" />}
                          className="text-[13px] tracking-normal normal-case"
                        >
                          見積書をPDF保存
                        </PrimaryCTA>
                      </div>

                      {/* Total Price */}
                      <div ref={clemencePurchaseRef} className="flex items-center gap-4 py-5">
                        <div className="w-2 h-14 bg-gold rounded-full" />
                        <div>
                          <span className="text-[13px] tracking-[0.15em] uppercase text-muted-foreground block mb-1">合計（税込）</span>
                          <span className="font-serif text-4xl lg:text-5xl text-foreground">
                            ¥{clemenceTotal.toLocaleString()}
                          </span>
                          {!clemencePrefecture && (
                            <p className="mt-1.5 flex items-start gap-1.5 text-[13px] text-muted-foreground">
                              <Truck className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gold" />
                              <span>配送先を選択すると送料を含む合計が確定します</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* CTA Buttons */}
                      <div className="space-y-3">
                        {clemenceCheckoutError && (
                          <div className="border-2 border-red-500/60 bg-red-50 rounded-md p-3 text-[13px] text-red-700">
                            {clemenceCheckoutError}
                          </div>
                        )}
                        {clemencePrefecture && clemenceShippingInfo?.inquiry ? (
                          <button
                            disabled
                            className="w-full py-5 font-serif text-[17px] font-bold rounded-md bg-muted text-muted-foreground cursor-not-allowed"
                          >
                            要問い合わせ（別途見積もり）
                          </button>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex justify-center">
                              <PrimaryCTA
                                onClick={handleClemenceCheckout}
                                disabled={isClemenceCheckingOut}
                                variant="purchase"
                                size="lg"
                                withArrow
                                className={`font-sans w-full max-w-[340px] ${isClemenceCheckingOut ? "cursor-wait" : ""}`}
                              >
                                {isClemenceCheckingOut ? "購入ページへ移動中…" : "クレジットカードで購入"}
                              </PrimaryCTA>
                            </div>
                            <div className="flex justify-center">
                              <PrimaryCTA
                                type="button"
                                onClick={handleClemenceBankOrder}
                                variant="purchase-steel"
                                size="lg"
                                withArrow
                                className="font-sans w-full max-w-[340px]"
                              >
                                銀行振込で注文する
                              </PrimaryCTA>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* ── 参考価格シミュレーター（Élisabeth 等・価格のすぐ下） ── */}
                {product.simulator && (
                  <RailPriceSimulator
                    config={product.simulator}
                    queryType={product.slug}
                    onQueryChange={setSimulatorQuery}
                  />
                )}

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
                      {/* 送料計算が必要な商品はお問い合わせフォーム経由。
                          シミュレーターつき商品は選択内容（長さ・座金・参考価格）も引き継ぐ */}
                      <PrimaryCTA
                        href={`/contact?product=${encodeURIComponent(product.slug)}&category=order${clemenceQuery}${simulatorQuery}`}
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

                {/* ===== 相談誘導 CTA — 購入前の不安解消（見積計算機つき商品ページと同じパターン） ===== */}
                <div className="mb-10 rounded-lg border-2 border-gold/50 bg-gold/[0.05] p-6 shadow-sm">
                  <p className="mb-1 flex items-center gap-2 text-[12px] tracking-[0.2em] uppercase text-gold font-semibold">
                    <Camera className="w-4 h-4 shrink-0" />
                    Before you order
                  </p>
                  <p className="mb-3 font-serif text-[18px] font-bold text-foreground">
                    ご購入前に、ご不明点はお気軽にご相談ください
                  </p>
                  <p className="mb-5 text-[14px] leading-relaxed text-muted-foreground">
                    「取り付けられるか不安」「サイズが合うか確認したい」——
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
                      href={`/contact?product=${encodeURIComponent(product.slug)}`}
                      className="flex items-center justify-center gap-2 rounded-md border-2 border-gold/40 bg-white px-5 py-3 text-[14px] font-semibold text-foreground transition hover:border-gold hover:text-gold"
                    >
                      フォームで相談する
                    </Link>
                  </div>
                </div>

                {/* 仕上げのこだわり訴求。仕上げ spec からウレタン塗装／蜜蝋仕上げを自動で出し分け。 */}
                <div className="mb-10">
                  <FinishCommitment specs={product.specs} />
                </div>
              </>
            )}

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
        } : isClemencePurchase && clemenceShippingInfo && !clemenceShippingInfo.inquiry
          ? clemenceSummary
          : undefined}
      />

      {/* Clémence 銀行振込モーダル（見積計算機つき商品と同じフロー） */}
      {isClemencePurchase && (
        <BankOrderModal
          open={clemenceBankOrderOpen}
          onClose={() => setClemenceBankOrderOpen(false)}
          orderPayload={clemenceOrderPayload}
          summary={clemenceSummary}
        />
      )}

      {/* Clémence 見積書 PDF 化（画面には表示せず印刷/PDF保存時のみ表示。
          app/products/[slug]/page.tsx の .quote-pdf-root 印刷スコープをそのまま使う）。
          この SimpleProductPage は単一の <main> を返すため、そのままだと .quote-pdf-root が
          <main> の内側にネストされ body の直接の子にならず、印刷CSSの body > * セレクタに
          一致しない（= 印刷時に <main> ごと非表示になる）。Portal で body 直下に描画する。 */}
      {isClemencePurchase && isMounted && createPortal(
        <div className="quote-pdf-root">
          <style>{`
            .quote-pdf-root { display: none; }
            @media print {
              .quote-pdf-root { display: block; }
              @page { size: A4 portrait; margin: 0; }
              html, body { background: #fff !important; margin: 0 !important; padding: 0 !important; }
              .quote-pdf-root .qp-paper * {
                color-adjust: exact;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
            .quote-pdf-root .qp-paper {
              width: 210mm;
              min-height: 297mm;
              margin: 0 auto;
              padding: 15mm;
              box-sizing: border-box;
              background: #fff;
              color: #111;
              font-family: var(--font-rounded-body, "Zen Kaku Gothic New"), "Hiragino Sans", "Yu Gothic", sans-serif;
              font-size: 11pt;
              line-height: 1.6;
            }
          `}</style>
          <div className="qp-paper">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-2xl font-bold tracking-[0.15em] text-gray-900">御 見 積 書</h1>
                <p className="mt-1 text-xs text-gray-500">QUOTATION</p>
              </div>
              <div className="text-right text-xs leading-relaxed text-gray-700">
                <div>発行日: <span className="font-medium text-gray-900">{clemenceQuoteIssueDate}</span></div>
                <div className="mt-0.5">有効期限: <span className="text-gray-900">発行日より30日間</span></div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-6">
              <div className="border-b-2 border-gray-900 pb-3">
                <div className="text-xl font-medium text-gray-900">
                  ＿＿＿＿＿＿＿＿＿＿＿＿ <span className="ml-1 text-base">様</span>
                </div>
                <p className="mt-2 text-xs text-gray-600">
                  下記の通りお見積り申し上げます。ご検討のほど、よろしくお願いいたします。
                </p>
              </div>
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="text-[11px] leading-relaxed text-gray-800">
                    <div className="font-medium text-gray-900">鍛鉄工房ZEST</div>
                    <div>代表 蠣﨑 良治</div>
                    <div className="mt-1">〒265-0052</div>
                    <div>千葉県千葉市若葉区和泉町239-2</div>
                    <div className="mt-0.5">TEL 070-3817-0659</div>
                    <div>ado@tantetuzest.com</div>
                    <div className="mt-1 text-[10px] text-gray-600">
                      適格請求書発行事業者
                      <br />
                      登録番号 T7810771171765
                    </div>
                  </div>
                  <Image
                    src="/images/ado_logo_K.png"
                    alt="IRONWORKS ado"
                    width={72}
                    height={48}
                    className="h-auto w-[60px]"
                    unoptimized
                  />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="text-[10px] tracking-[0.2em] text-gray-500">件名</div>
              <div className="mt-1 border-b border-gray-200 pb-1 text-base font-medium text-gray-900">
                {clemenceSummary.productName}
              </div>
              <div className="mt-1 text-sm text-gray-600">{clemenceSummary.productNote}</div>
            </div>

            <div className="mt-4 flex items-end justify-between gap-4 border-y-2 border-gray-900 bg-gray-50 px-4 py-3">
              <div className="text-xs text-gray-700">お見積り合計金額（税込）</div>
              <div className="font-mono text-2xl font-bold text-gray-900">
                ¥{clemenceSummary.totalAmount.toLocaleString()}
              </div>
            </div>

            <div className="mt-5">
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr className="bg-gray-100 text-left text-[10px] tracking-wider text-gray-700">
                    <th className="border border-gray-300 px-2 py-1.5 font-medium">内容</th>
                    <th className="border border-gray-300 px-2 py-1.5 text-right font-medium w-28">金額</th>
                  </tr>
                </thead>
                <tbody>
                  {clemenceSummary.lines.map((line, i) => (
                    <tr key={i}>
                      <td className="border border-gray-300 px-2 py-1.5 text-gray-900">
                        {line.label}
                      </td>
                      <td className="border border-gray-300 px-2 py-1.5 text-right font-mono text-gray-900">
                        ¥{line.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="border border-gray-300 bg-gray-900 px-2 py-2 text-xs font-medium text-white">
                      合計（税込）
                    </td>
                    <td className="border border-gray-300 bg-gray-900 px-2 py-2 text-right font-mono text-base font-bold text-white">
                      ¥{clemenceSummary.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="mt-5">
              <div className="text-[10px] tracking-[0.2em] text-gray-500">備考</div>
              <div className="mt-1 min-h-[40px] border border-gray-200 px-3 py-2 text-[11px] leading-relaxed text-gray-800">
                {clemencePrefecture && clemenceShippingInfo?.inquiry && (
                  <>
                    {clemenceShippingInfo.inquiryReason} — 送料は別途お問い合わせにて確定いたします。
                    <br />
                  </>
                )}
                {!clemencePrefecture && "送料は配送先ご住所により別途加算されます。"}
                本お見積もりは概算です。仕様変更・部材価格変動により最終価格が変わる場合がございます。
                <br />
                こちらの見積もり内容は下記URLからいつでもご確認・再計算いただけます。
                <br />
                <span className="break-all text-[10px] text-gray-600">{clemenceShareUrl}</span>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-2 text-center text-[10px] text-gray-500">
              IRONWORKS ado — https://ado.tantetuzest.com
            </div>
          </div>
        </div>,
        document.body,
      )}
    </main>
  )
}
