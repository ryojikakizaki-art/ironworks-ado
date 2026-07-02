"use client"

import { useState, useCallback, useRef, useEffect } from "react"
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
import { ZakinGuide } from "@/components/drawing-modal/zakin-guide"
import { calcZakin, getZakinPositions } from "@/lib/drawing-modal/rene-constants"
import { getProductFull, galleryUrl, type FeatureIconName } from "@/lib/products/display"
import { getSimpleProduct } from "@/lib/products/simple"
import { getRelatedProducts } from "@/lib/products/catalog"
import { getProductStructuredData } from "@/lib/products/structured-data"
import { SimpleProductPage } from "@/components/simple-product-page"
import { EmbeddedCheckoutModal } from "@/components/checkout/embedded-checkout-modal"
import { BankOrderModal } from "@/components/checkout/bank-order-modal"
import { FinishCommitment } from "@/components/finish-commitment"
import { KaigoNotice } from "@/components/kaigo-notice"
import { ProductFaq } from "@/components/product-faq"
import { calcShipping, type ProductType } from "@/lib/shipping/sagawa"
import { getEarliestArrival } from "@/lib/business-days"
import type { WasherTypeId } from "@/lib/drawing-modal/products"
import { lookupPriceFromTable, type DrawingProductConfig } from "@/lib/drawing-modal/products"
import { ChevronLeft, ChevronRight, Play, Minus, Plus, ChevronDown, Check, Hammer, Paintbrush, Ruler, Wrench, Camera } from "lucide-react"
import { fireGtagEvent } from "@/lib/gtag"
import { TOTAL_VOICE_COUNT } from "@/lib/testimonials"
import { ReviewVoiceIcon } from "@/components/ui/review-voice-icon"

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

// 導入部「価格の目安」用ヘルパー。
// 計算機 (calculatePrice) と同じロジックで本体価格を算出し、表示の食い違いを防ぐ。
function bodyPriceAt(d: DrawingProductConfig, lengthMm: number): number {
  if (d.priceTable) return lookupPriceFromTable(lengthMm, d.priceTable)
  const perMm = d.pricePerMm ?? 25
  const addon = Math.max(0, lengthMm - d.stdLengthMm) * perMm
  const longMult = lengthMm > 2000 ? Math.pow(1.2, (lengthMm - 2000) / 500) : 1
  const surcharge = lengthMm > 2000 ? addon * (longMult - 1) : 0
  return Math.round(d.basePrice + addon + surcharge)
}

function formatMeters(mm: number): string {
  return `${mm / 1000}m`
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
  // 多本注文対応 (PR #2): 本数分の長さを個別配列で持つ。quantity = lengths.length。
  // 入力欄文字列も同じ index で配列保持し、Blur 時にのみクランプする。
  const [lengths, setLengths] = useState<number[]>([product.drawing.stdLengthMm])
  const [lengthInputs, setLengthInputs] = useState<string[]>([String(product.drawing.stdLengthMm)])
  const quantity = lengths.length
  // 数量変更: 増→末尾に最後の値をコピー、減→末尾切り捨て
  // 1-6 本: 通常 Stripe 決済 / 7-12 本: 請求書振込フロー (calcShipping が inquiry を返す)
  const setQuantity = useCallback((n: number) => {
    const target = Math.max(1, Math.min(12, n))
    // 特急は 3 本まで。4 本以上に増やしたら通常配送へ自動で戻す
    if (target > 3) setDeliveryType("normal")
    setLengths(prev => {
      if (target === prev.length) return prev
      if (target > prev.length) {
        const last = prev[prev.length - 1] ?? product.drawing.stdLengthMm
        return [...prev, ...Array(target - prev.length).fill(last)]
      }
      return prev.slice(0, target)
    })
    setLengthInputs(prev => {
      if (target === prev.length) return prev
      if (target > prev.length) {
        const last = prev[prev.length - 1] ?? String(product.drawing.stdLengthMm)
        return [...prev, ...Array(target - prev.length).fill(last)]
      }
      return prev.slice(0, target)
    })
  }, [product.drawing.stdLengthMm])
  // 第一本目を「主」として扱う既存ロジック互換シム (スライダー・座金エディタ等)
  const length = lengths[0] ?? product.drawing.stdLengthMm
  const lengthInput = lengthInputs[0] ?? String(product.drawing.stdLengthMm)
  const setLength = useCallback((v: number) => {
    setLengths(prev => [v, ...prev.slice(1)])
  }, [])
  const setLengthInput = useCallback((s: string) => {
    setLengthInputs(prev => [s, ...prev.slice(1)])
  }, [])
  // 個別の本に対する長さ更新 (qty>1 時の per-item input 用)
  const updateLengthAt = useCallback((i: number, v: number) => {
    setLengths(prev => prev.map((p, idx) => idx === i ? v : p))
  }, [])
  const updateLengthInputAt = useCallback((i: number, s: string) => {
    setLengthInputs(prev => prev.map((p, idx) => idx === i ? s : p))
  }, [])
  const isMultiOrder = lengths.length > 1
  // 特急配送は 3 本までのご注文のみ対象（4 本以上は工程上 通常配送のみ）
  const expressAllowed = lengths.length <= 3
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
  // 銀行振込での注文モーダル
  const [bankOrderOpen, setBankOrderOpen] = useState(false)
  const prefectureRef = useRef<HTMLDivElement | null>(null)
  // モバイル スティッキー合計バー（2026-06-12 監査 B群⑪）:
  // 計算機を過ぎたら表示し、合計・購入エリアが見えている間は隠す
  const purchaseAreaRef = useRef<HTMLDivElement | null>(null)
  const [stickyBarOn, setStickyBarOn] = useState(false)
  const [purchaseInView, setPurchaseInView] = useState(false)
  useEffect(() => {
    const onScroll = () => setStickyBarOn(window.scrollY > 600)
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    const el = purchaseAreaRef.current
    let io: IntersectionObserver | undefined
    if (el && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        ([entry]) => setPurchaseInView(entry.isIntersecting),
        { rootMargin: "0px 0px -10% 0px" },
      )
      io.observe(el)
    }
    return () => {
      window.removeEventListener("scroll", onScroll)
      io?.disconnect()
    }
  }, [])
  const scrollToPurchase = () =>
    purchaseAreaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
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

  // ファネル計測: 計算機の初回操作（長さ・本数・座金のいずれか）を 1 ページビューあたり 1 回だけ送る。
  // 注意: ZakinEditor はマウント時と長さ変更時に onChange で zakin を「同値の新オブジェクト」に
  // 書き直すため（zakin-editor.tsx の再配置 effect）、参照比較や「マウント skip」では誤発火する。
  // JSON 値比較で「初回レンダー時と実際に値が変わった時」だけ送る（StrictMode 二重実行にも安全）。
  const simInteractSentRef = useRef(false)
  const simInitialRef = useRef<string | null>(null)
  useEffect(() => {
    if (simInteractSentRef.current) return
    const snapshot = JSON.stringify({ lengths, zakin })
    if (simInitialRef.current === null) {
      simInitialRef.current = snapshot
      return
    }
    if (snapshot === simInitialRef.current) return
    simInteractSentRef.current = true
    fireGtagEvent("sim_interact", {
      event_category: "simulator",
      item_id: slug,
    })
  }, [lengths, zakin, slug])

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

  const PRICE_TABLE = product.drawing.priceTable

  // 価格の目安ブロック用: 固定長商品は例示なし、可変長は std から +0.5m 刻みで最大 3 例
  const isFixedLength = product.drawing.category === "fixed"
  const priceGuideLengths = isFixedLength
    ? []
    : [
        product.drawing.stdLengthMm,
        product.drawing.stdLengthMm + 500,
        product.drawing.stdLengthMm + 1000,
      ].filter((L) => L <= product.drawing.maxMm)

  const calculatePrice = useCallback(() => {
    // 本ごとに per-item で計算 (多本長さ違い対応 PR #2)
    // - 多本注文時は座金カスタム禁止 (簡素化) — 各本とも auto 計算
    const items = lengths.map(L => {
      // 価格テーブル指定商品 (René/Claire/Marcel/Émile) は段階式テーブルを参照、
      // それ以外は従来の (basePrice + 25円/mm + 長尺サーチャージ) 式計算。
      let addon: number
      let surcharge: number
      if (PRICE_TABLE) {
        const tablePrice = lookupPriceFromTable(L, PRICE_TABLE)
        addon = tablePrice - BASE_PRICE
        surcharge = 0
      } else {
        addon = Math.max(0, L - STD_LENGTH) * PRICE_PER_MM
        const longM = L > SURGE_START
          ? Math.pow(SURGE_BASE, (L - SURGE_START) / SURGE_INTERVAL)
          : 1
        surcharge = L > SURGE_START ? addon * (longM - 1) : 0
      }
      const autoZakinCount = calcZakin(L, zakinRule)
      const zakinCount = isMultiOrder
        ? autoZakinCount
        : (zakin.customMode ? zakin.positions.length : autoZakinCount)
      // 価格テーブル指定商品: テーブル価格に長さに応じた標準座金本数が既に含まれる。
      //   - auto / 多本: 追加料金なし (zakinCount == autoZakinCount)
      //   - カスタムモード: auto 本数を超えて追加した分だけ加算
      // 式計算商品: 従来通り INCLUDED_ZAKIN を超えた分を加算。
      const addZakin = PRICE_TABLE
        ? Math.max(0, zakinCount - autoZakinCount) * ZAKIN_PRICE
        : Math.max(0, zakinCount - INCLUDED_ZAKIN) * ZAKIN_PRICE
      const angleCost = (!isMultiOrder && zakin.angleDeg > 0) ? zakinCount * ANGLE_PRICE : 0
      const unitPrice = BASE_PRICE + addon + addZakin + surcharge + angleCost
      return {
        length: L,
        addon: Math.round(addon),
        addZakin,
        surcharge: Math.round(surcharge),
        angleCost,
        unitPrice: Math.round(unitPrice),
        zakinCount,
      }
    })
    const subtotal = items.reduce((s, it) => s + it.unitPrice, 0)
    const expressAddon = deliveryType === "express" && lengths.length <= 3 ? Math.round(subtotal * RUSH_RATE) : 0
    // 送料: 梱包ごとに最長サイズで rate 計算 → 合算 (多本注文の正確な送料)
    const shippingResult = calcShipping(lengths, prefecture, productType)
    const shipping = shippingResult.shipping
    const shippingTax = Math.round(shipping * 0.1)
    const total = subtotal + expressAddon + shipping + shippingTax
    // 単一商品互換用 (qty=1 では first item の値が直接表示される)
    const first = items[0]
    return {
      items,
      basePrice: BASE_PRICE,
      addon: first?.addon ?? 0,
      addZakin: first?.addZakin ?? 0,
      surcharge: first?.surcharge ?? 0,
      angleCost: first?.angleCost ?? 0,
      unitPrice: first?.unitPrice ?? 0,
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
      zakinCount: first?.zakinCount ?? 0,
    }
  }, [lengths, isMultiOrder, deliveryType, prefecture, zakin, productType, STD_LENGTH, PRICE_PER_MM, BASE_PRICE, INCLUDED_ZAKIN, zakinRule, PRICE_TABLE])

  const prices = calculatePrice()

  // 各ステップの入力が満たされているか（番号サークルの進捗表示用）。
  // 以前は単調増加カウンタで、初期値のある長さ・配送のせいで未入力でも
  // ② が「完了」表示になっていた。実際の入力状況に直結する形に修正。
  // 多本対応 (PR #2): 全本数が範囲内である必要あり
  const step1Done = lengths.every(L => L >= minLength && L <= maxLength)
  // Step 2 は配送先のみ (数量は Step 1 へ移動)
  const step2Done = prefecture !== ""
  const step3Done = deliveryType === "normal" || deliveryType === "express"
  const step4Ready = step1Done && step2Done && step3Done

  // Lightbox は廃止 (2026-05-12) — モバイルで黒バック+×だけだと不便だったため、
  // ヒーロー画像はスワイプ+矢印で切替・サムネタップでヒーローに反映する方式に移行。


  // カード決済 (/api/checkout) と銀行振込 (/api/bank-order) で共有する注文ペイロード。
  // 両フローで完全に同じ入力をサーバへ送ることで、価格計算のズレを構造的に防ぐ。
  const orderPayload = {
    product: slug,
    // 多本対応 (PR #2): lengths 配列を主、lengthMm + quantity は後方互換
    lengths,
    lengthMm: length,
    quantity,
    rushDelivery: deliveryType === "express",
    prefecture,
    washerType,
    // 単品注文のみ お客様が指定した座金位置・カスタム有無・角度を同送する。
    // positions/angle は制作図の再現に、zakinCustom/angleDeg は座金本数・角度料金の課金に使う。
    // 多本注文は本ごとに長さが異なり座金は自動配置のため送らない。
    ...(isMultiOrder
      ? {}
      : {
          positions: zakin.positions,
          zakinCustom: zakin.customMode,
          angleDeg: zakin.angleDeg,
          angleDir: zakin.angleDir,
        }),
    ...(hasOrientation ? { orientation } : {}),
  }

  // 注文内訳（カード決済・銀行振込モーダルで共用）
  const checkoutSummary = {
    productName: isMultiOrder
      ? `${product.nameEn} ${product.nameJaShort} 壁付け手すり ${lengths.length}本（複数長さ）${hasOrientation ? `（${orientation === "left" ? "左向き" : "右向き"}）` : ""}`
      : `${product.nameEn} ${product.nameJaShort} 壁付け手すり ${length}mm${hasOrientation ? `（${orientation === "left" ? "左向き" : "右向き"}）` : ""}`,
    productNote: isMultiOrder
      ? `${lengths.length}本制作 / ${deliveryType === "express" ? "特急配送 5営業日" : "通常配送 10営業日"}`
      : `座金 ${prices.zakinCount}個 / ${deliveryType === "express" ? "特急配送 5営業日" : "通常配送 10営業日"}`,
    lines: isMultiOrder
      ? [
          ...prices.items.map((it, i) => ({
            label: `${i + 1}本目（${it.length}mm）`,
            amount: it.unitPrice,
          })),
          { label: "本体小計", amount: prices.subtotal, emphasize: true },
          ...(prices.expressAddon > 0 ? [{ label: "特急割増（+20%）", amount: prices.expressAddon }] : []),
          ...(prices.shipping > 0 ? [{ label: `送料（佐川急便・${prefecture}・税抜）`, amount: prices.shipping }] : []),
          ...(prices.shippingTax > 0 ? [{ label: "送料消費税（10%）", amount: prices.shippingTax }] : []),
        ]
      : [
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
  }

  // 銀行振込ボタン: 都道府県チェックのみ行い、注文フォームモーダルを開く
  const handleBankOrder = () => {
    if (prices.shippingInquiry) return
    if (!prefecture) {
      setCheckoutError("配送先都道府県を選択してください")
      prefectureRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      setIsPrefectureOpen(true)
      return
    }
    setCheckoutError(null)
    fireGtagEvent("begin_checkout", {
      currency: "JPY",
      value: prices.total,
      checkout_method: "bank",
      items: [{ item_id: slug, item_name: product.nameEn, quantity }],
    })
    setBankOrderOpen(true)
  }

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
    fireGtagEvent("begin_checkout", {
      currency: "JPY",
      value: prices.total,
      checkout_method: "card",
      items: [{ item_id: slug, item_name: product.nameEn, quantity }],
    })
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
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
  // checkout / 受注確定メールと同じ営業日ベース（lib/business-days）で算出する。
  // 旧実装は暦日加算で、実際のお届けより約4日早い日付を表示していた。
  const getDeliveryDate = () => {
    const arrival = getEarliestArrival(new Date(), deliveryType === "express")
    return arrival.toLocaleDateString("ja-JP", { month: "long", day: "numeric" })
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

              {/* Product Name + 短い補足（長文は価格・仕上げの後へ移動） */}
              <div>
                <h1 className="font-serif text-4xl lg:text-5xl text-foreground mb-3 leading-tight">
                  {product.nameEn} {product.nameJaShort}
                </h1>
                <p className="text-[16px] text-muted-foreground leading-relaxed">
                  {product.shortDescription}
                </p>
                {/* 用途ライン — 広告検索語句の最多が「玄関/階段 手すり おしゃれ」のため
                    on-page にも用途語彙を明示する（2026-06-12 監査 B群⑨） */}
                <p className="mt-2 text-[13px] md:text-[14px] text-muted-foreground">
                  {product.drawing.category === "horizontal"
                    ? "階段・廊下・吹き抜けに。空間をおしゃれに引き締める壁付け手すりです。"
                    : product.drawing.category === "vertical"
                      ? "玄関・勝手口・室内の立ち上がりに。外観をおしゃれに整える縦手すりです。"
                      : "玄関・トイレ・洗面に。一点ずつ火造りで仕上げる装飾縦手すりです。"}
                </p>
              </div>

              {/* ===== 価格の目安 — 広告流入が計算機の前に「いくらか」を掴めるように ===== */}
              <div className="rounded-lg border border-gold/20 bg-card p-6">
                <p className="mb-2 text-[12px] tracking-[0.2em] text-gold font-semibold">
                  価格の目安
                </p>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-serif text-3xl lg:text-4xl text-foreground">
                    ¥{BASE_PRICE.toLocaleString()}
                    {!isFixedLength && <span className="text-2xl lg:text-3xl">〜</span>}
                  </span>
                  <span className="text-[13px] text-muted-foreground">本体価格・税込</span>
                </div>
                <p className="mt-2 text-[13px] md:text-[14px] text-muted-foreground leading-relaxed">
                  {isFixedLength
                    ? `${product.drawing.stdLengthMm}mm 固定サイズの一点物です。`
                    : `〜${formatMeters(product.drawing.stdLengthMm)} まで一律。長さに応じて価格が変わります。`}
                </p>
                {priceGuideLengths.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-3">
                    {priceGuideLengths.map((L) => (
                      <div key={L} className="flex items-baseline gap-1.5">
                        <span className="text-[13px] text-muted-foreground">{formatMeters(L)}</span>
                        <span className="font-serif text-[17px] md:text-[19px] text-foreground">
                          ¥{bodyPriceAt(product.drawing, L).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-3 text-[13px] md:text-[14px] text-muted-foreground leading-relaxed">
                  別途送料がかかります。下の計算機で配送先を選ぶと
                  <span className="text-foreground font-medium">送料込みの総額がその場で</span>
                  分かります。
                </p>
              </div>

              {/* 介護保険のご案内（図面フロー商品は全て手すり） */}
              <KaigoNotice />

              {/* 仕上げのこだわり訴求（説明文の直下・初見の人の目に付く位置）。
                  仕上げ spec からウレタン塗装／蜜蝋仕上げを自動で出し分け。 */}
              <FinishCommitment specs={specs} />

              {/* 商品説明（長文）— 価格の目安・FINISHING の後に配置 */}
              <div>
                <p className="text-[15px] leading-relaxed text-foreground whitespace-pre-line">
                  {product.longDescription}
                </p>
              </div>

              {/* ===== 相談誘導 CTA ① — 説明文直後 ===== */}
              <div className="rounded-lg border-2 border-gold/50 bg-gold/[0.05] p-6 shadow-sm">
                <p className="mb-1 flex items-center gap-2 text-[12px] tracking-[0.2em] uppercase text-gold font-semibold">
                  <Camera className="w-4 h-4 shrink-0" />
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
                    <div className="flex items-baseline justify-between gap-3 flex-wrap">
                      <h3 className="font-serif text-[22px] font-bold text-foreground tracking-tight">
                        {product.drawing.category === "fixed" ? "サイズ・本数を選ぶ" : "長さ・本数を選ぶ"}
                      </h3>
                      {/* 数量アジャスター: Step 1 内に配置して「違う長さで複数本注文」を発見しやすく */}
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] text-muted-foreground">本数</span>
                        <div className="flex items-center border border-gold/40 rounded-md bg-white">
                          <button
                            type="button"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-10 h-10 flex items-center justify-center hover:bg-gold/5 transition-colors disabled:opacity-30"
                            disabled={quantity <= 1}
                            aria-label="本数を減らす"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center font-mono text-lg">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-10 h-10 flex items-center justify-center hover:bg-gold/5 transition-colors disabled:opacity-30"
                            disabled={quantity >= 12}
                            aria-label="本数を増やす"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="text-[12px] text-muted-foreground">本</span>
                      </div>
                    </div>
                    {!isMultiOrder && (
                      <p className="text-[12px] text-muted-foreground -mt-2">
                        ▸ 本数を <span className="font-medium text-foreground">2 本以上</span> にすると、本ごとに違う長さを指定できます
                      </p>
                    )}
                    {quantity >= 7 && (
                      <p className="text-[12px] text-yellow-700 -mt-2 leading-relaxed bg-yellow-50/60 border border-yellow-200 rounded px-3 py-2">
                        📋 7 本以上のご注文は <span className="font-medium">請求書振込</span> でお受けします。送料はサイズ・本数を確認して別途お見積もりとなります（下の「請求書振込でご注文する」ボタンへ進んでください）。
                      </p>
                    )}
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
                          <span className="ml-2 text-[12px] opacity-75">
                            {PRICE_TABLE
                              ? `（${PRICE_TABLE[0].mm}mm 超は長さ別 段階価格表 / 標準座金本数込み）`
                              : `（超過分は 1mm あたり ¥${PRICE_PER_MM}）`}
                          </span>
                        </p>
                        {/* 単本モード: スライダー + 数値入力 (qty=1) */}
                        {!isMultiOrder && (
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
                        )}
                        {/* 多本モード: 本数分の数値入力 (qty>1) */}
                        {isMultiOrder && (
                          <div className="space-y-3">
                            <p className="text-[12px] text-muted-foreground">
                              本数を変更するには上の「本数」を増減してください。各本ごとに違う長さを入力できます（範囲 {minLength}〜{maxLength}mm）。
                            </p>
                            {lengths.map((L, i) => (
                              <div key={i} className="flex items-center gap-3 border border-gold/20 bg-card rounded-md p-3">
                                <span className="font-serif text-[15px] font-medium text-foreground min-w-[64px]">
                                  {i + 1}本目
                                </span>
                                <div className="relative flex-1">
                                  <input
                                    type="number"
                                    min={minLength}
                                    max={maxLength}
                                    step={1}
                                    value={lengthInputs[i] ?? String(L)}
                                    onFocus={(e) => e.currentTarget.select()}
                                    onChange={(e) => {
                                      const raw = e.target.value
                                      updateLengthInputAt(i, raw)
                                      if (raw === "") return
                                      const n = Number(raw)
                                      if (Number.isFinite(n) && n >= minLength && n <= maxLength) {
                                        updateLengthAt(i, n)
                                      }
                                    }}
                                    onBlur={() => {
                                      const raw = lengthInputs[i] ?? ""
                                      if (raw === "") {
                                        updateLengthInputAt(i, String(L))
                                        return
                                      }
                                      const n = Number(raw)
                                      if (!Number.isFinite(n)) {
                                        updateLengthInputAt(i, String(L))
                                        return
                                      }
                                      const clamped = Math.min(maxLength, Math.max(minLength, Math.round(n)))
                                      updateLengthAt(i, clamped)
                                      updateLengthInputAt(i, String(clamped))
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.currentTarget.blur()
                                      }
                                    }}
                                    className="w-full h-12 bg-gold/10 border-2 border-gold text-center font-mono text-lg text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-muted-foreground">
                                    mm
                                  </span>
                                </div>
                              </div>
                            ))}
                            <p className="text-[12px] text-muted-foreground">
                              ※ 複数本ご注文時は座金位置のカスタマイズができません（自動配置）。
                            </p>
                          </div>
                        )}
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
                            制作図プレビューは Step4（確認して購入）へ移動。
                            多本注文時は per-item でカスタマイズ不可なので非表示 (PR #2 制約) */}
                        {!isMultiOrder && (
                        <details className="group mt-3 border border-gold/20 rounded-md overflow-hidden">
                          <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between hover:bg-gold/[0.03] transition-colors">
                            <span className="text-[14px] font-medium tracking-wider text-foreground">
                              座金（取り付け金具）の位置{product.drawing.category === "vertical" ? "" : "・角度"}を調整する
                              <span className="text-muted-foreground font-normal">（任意）</span>
                            </span>
                            <span className="text-gold text-lg leading-none transition-transform group-open:rotate-45">＋</span>
                          </summary>
                          <div className="border-t border-gold/20 p-4">
                            <ZakinGuide
                              category={product.drawing.category === "vertical" ? "vertical" : "horizontal"}
                              className="mb-4"
                            />
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
                              embedded
                              className="mt-3"
                            />
                          </div>
                        </details>
                        )}
                      </>
                    )}
                    {/* 購入前のご相談（無料）— 座金（取り付け金具）調整の下に配置 */}
                    <div className="space-y-2 pt-1">
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
                      配送先
                      {!prefecture && (
                        <span className="ml-2 text-[11px] font-sans font-medium text-red-600 align-middle tracking-wider">必須</span>
                      )}
                    </h3>
                    {/* Prefecture Dropdown — 数量は Step 01 へ移動 (PR #2 UX 改善) */}
                    <div ref={prefectureRef} className="relative">
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
                        disabled={!expressAllowed}
                        className={`flex-1 py-4 px-4 rounded-md border-2 transition-all ${
                          !expressAllowed
                            ? "border-border opacity-50 cursor-not-allowed"
                            : deliveryType === "express"
                            ? "border-gold bg-gold/5"
                            : "border-gold/20 hover:border-gold/50"
                        }`}
                      >
                        <div className="text-[15px] font-medium">特急 <span className="text-gold">+20%</span></div>
                        <div className="text-[12px] text-muted-foreground mt-0.5">5営業日</div>
                      </button>
                    </div>
                    {!expressAllowed && (
                      <p className="text-[13px] text-muted-foreground leading-relaxed">
                        特急配送は <span className="text-foreground font-medium">3 本まで</span> のご注文が対象です。4 本以上は通常配送をお選びください。
                      </p>
                    )}
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
                      {!isMultiOrder && (
                        <>
                          <div className="flex justify-between text-[15px]">
                            <span className="text-muted-foreground">
                              基本料金（〜{product.drawing.stdLengthMm}mm）
                            </span>
                            <span className="font-mono">¥{prices.basePrice.toLocaleString()}</span>
                          </div>
                          {prices.addon > 0 && (
                            <div className="flex justify-between text-[15px]">
                              <span className="text-muted-foreground">
                                {PRICE_TABLE
                                  ? `長さ追加料金（${length}mm 段階価格）`
                                  : `長さ追加料金（+${length - product.drawing.stdLengthMm}mm × ¥${PRICE_PER_MM}）`}
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
                        </>
                      )}
                      {isMultiOrder && (
                        <>
                          {prices.items.map((it, i) => (
                            <div key={i} className="flex justify-between text-[15px]">
                              <span className="text-muted-foreground">
                                {i + 1}本目（{it.length}mm）
                              </span>
                              <span className="font-mono">¥{it.unitPrice.toLocaleString()}</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-[15px] pt-2 border-t border-border/60">
                            <span className="text-muted-foreground">本体小計</span>
                            <span className="font-mono">¥{prices.subtotal.toLocaleString()}</span>
                          </div>
                        </>
                      )}
                      {!isMultiOrder && quantity > 1 && (
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

                    {/* Shipping Inquiry Banner — 7 本以上 vs その他 (沖縄/3501mm+) で文言切替 */}
                    {prices.shippingInquiry && (
                      <div className="border-2 border-yellow-500/60 bg-yellow-500/5 rounded-lg p-4">
                        <p className="text-[14px] text-yellow-700 font-medium mb-2">
                          ⚠ {prices.shippingInquiryReason}
                        </p>
                        {lengths.length > 6 ? (
                          <p className="text-[13px] text-yellow-700/90 leading-relaxed">
                            下の「請求書振込でご注文する」ボタンから注文情報を送信してください。
                            送料を含む合計金額のお見積もりと振込先のご案内をメールにてお送りいたします。
                            ご入金確認後に制作を開始いたします。
                          </p>
                        ) : (
                          <a
                            href="mailto:info@tantetuzest.com"
                            className="inline-flex items-center gap-1 text-[14px] text-gold hover:text-gold/80 underline"
                          >
                            お問い合わせよりご相談ください
                          </a>
                        )}
                      </div>
                    )}

                    {/* 制作図プレビュー — 合計金額の上で最終確認（fixed 商品は図面なし） */}
                    {product.drawing.category !== "fixed" && (
                      <button
                        type="button"
                        onClick={() => setIsDrawingOpen(true)}
                        className="flex w-full items-center justify-center gap-2 py-4 border-2 border-gold/50 bg-gold/[0.05] text-gold text-[15px] font-semibold rounded-md hover:border-gold hover:bg-gold/10 transition-colors text-center"
                      >
                        <Ruler className="w-4 h-4 shrink-0" />
                        {isMultiOrder
                          ? `制作図プレビュー（${lengths.length} 本それぞれ確認できます）▸`
                          : "制作図プレビューで最終確認 ▸"}
                      </button>
                    )}

                    {/* Total Price */}
                    <div ref={purchaseAreaRef} className="flex items-center gap-4 py-5">
                      <div className="w-2 h-14 bg-gold rounded-full" />
                      <div>
                        <span className="text-[13px] tracking-[0.15em] uppercase text-muted-foreground block mb-1">合計（税込）</span>
                        <span className="font-serif text-4xl lg:text-5xl text-foreground">
                          ¥{prices.total.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="space-y-3">
                      {checkoutError && (
                        <div className="border-2 border-red-500/60 bg-red-50 rounded-md p-3 text-[13px] text-red-700">
                          {checkoutError}
                        </div>
                      )}
                      {prices.shippingInquiry ? (
                        lengths.length > 6 ? (
                          // 7 本以上: 請求書振込フローへ pre-fill 付きで誘導
                          <Link
                            href={`/contact?product=${encodeURIComponent(slug)}&type=invoice&qty=${lengths.length}&lengths=${lengths.join(',')}`}
                            className="block w-full py-5 text-center font-serif text-[17px] font-bold rounded-md border-2 border-gold bg-gold/5 text-gold hover:bg-gold hover:text-white transition-colors"
                          >
                            請求書振込でご注文する ▸
                          </Link>
                        ) : (
                          <button
                            disabled
                            className="w-full py-5 font-serif text-[17px] font-bold rounded-md bg-muted text-muted-foreground cursor-not-allowed"
                          >
                            要問い合わせ（別途見積もり）
                          </button>
                        )
                      ) : (
                        <div className="space-y-3">
                          <div className="flex justify-center">
                            <PrimaryCTA
                              onClick={handleCheckout}
                              disabled={isCheckingOut}
                              variant="purchase"
                              size="lg"
                              withArrow
                              className={`font-sans w-full max-w-[340px] ${isCheckingOut ? "cursor-wait" : ""}`}
                            >
                              {isCheckingOut ? "購入ページへ移動中…" : "クレジットカードで購入"}
                            </PrimaryCTA>
                          </div>
                          {/* 銀行振込での注文 — クレジットカードと同形状・濃いグレー（白抜き・ゴシック太字） */}
                          <div className="flex justify-center">
                            <PrimaryCTA
                              type="button"
                              onClick={handleBankOrder}
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

                      {/* 社会的証明 — お客様の声リンク（アイコンは Gemini デザイン仕様・声ゼロ時は非表示） */}
                      {TOTAL_VOICE_COUNT > 0 && (
                        <Link
                          href="/reviews"
                          className="flex items-center justify-center gap-2.5 pt-2 text-[15px] md:text-[16px] font-medium text-foreground/80 hover:text-gold transition-colors"
                        >
                          <ReviewVoiceIcon className="w-7 h-7 text-gold shrink-0" />
                          <span>全国のお客様の声を見る</span>
                          <span aria-hidden>→</span>
                        </Link>
                      )}
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

            {/* よくあるご質問（購入判断 5 問・lib/faq-data 共用） */}
            <ProductFaq slug={slug} />

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

      {/* ── モバイル スティッキー合計バー（md 以上では出さない） ── */}
      <AnimatePresence>
        {stickyBarOn && !purchaseInView && !prices.shippingInquiry && (
          <motion.div
            initial={{ y: 88, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 88, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 bottom-0 z-40 md:hidden border-t border-border bg-white/95 backdrop-blur-sm shadow-[0_-4px_16px_rgba(0,0,0,0.08)] [padding-bottom:env(safe-area-inset-bottom)]"
          >
            <div className="flex items-center justify-between gap-3 px-4 py-2.5">
              <div className="min-w-0">
                <span className="block text-[12px] tracking-[0.15em] uppercase text-muted-foreground leading-tight">
                  合計（税込{prices.shipping > 0 ? "・送料込" : ""}）
                </span>
                <span className="font-serif text-[22px] font-bold text-foreground leading-tight">
                  ¥{prices.total.toLocaleString()}
                </span>
              </div>
              <PrimaryCTA onClick={scrollToPurchase} variant="gold" size="md" withArrow>
                ご購入へ
              </PrimaryCTA>
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
        washerType={washerType}
        lengths={isMultiOrder ? lengths : undefined}
      />

      <EmbeddedCheckoutModal
        open={!!checkoutClientSecret}
        clientSecret={checkoutClientSecret}
        onClose={() => setCheckoutClientSecret(null)}
        summary={checkoutSummary}
      />

      <BankOrderModal
        open={bankOrderOpen}
        onClose={() => setBankOrderOpen(false)}
        orderPayload={orderPayload}
        summary={checkoutSummary}
      />
    </>
  )
}
