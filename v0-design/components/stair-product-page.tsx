"use client"

// Laurent（階段手摺・段数ベース見積計算機）専用ページ。
// 既存の壁付け手すりページ (app/products/[slug]/page.tsx) は長さベースの価格モデル
// 前提で作られているため、段数・階段寸法から計算する Laurent は専用コンポーネント
// にしている。価格・寸法計算の正本は lib/products/stair-pricing.ts（決済APIと共用）。

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Camera } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { KaigoNotice } from "@/components/kaigo-notice"
import { FinishCommitment } from "@/components/finish-commitment"
import { PrimaryCTA } from "@/components/ui/primary-cta"
import { EmbeddedCheckoutModal, type OrderSummary } from "@/components/checkout/embedded-checkout-modal"
import { BankOrderModal } from "@/components/checkout/bank-order-modal"
import { StairDrawingModal } from "@/components/drawing-modal/stair-drawing-modal"
import {
  LAURENT,
  calcStairPrice,
  calcStairGeometry,
  calcPostCount,
  clampSteps,
  clampRiser,
  clampTread,
  clampKekomi,
  clampLastTread,
  clampRailHeight,
  type CrossbarMaterial,
  type StairColor,
} from "@/lib/products/stair-pricing"
import { calcShipping, getShippingRange } from "@/lib/shipping/sagawa"

const prefectures = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
]

// 商品画像ギャラリー（横桟なし／横桟あり）。実物施工写真が撮れるまでの仮イメージ。
const GALLERY = [
  { src: "/images/products/laurent/hero.jpg", label: "横桟なし" },
  { src: "/images/products/laurent/hero-crossbar.jpg", label: "横桟あり" },
]

const SPECS = [
  { label: "タイプ", value: "階段手摺（直線階段専用）" },
  { label: "素材", value: "鉄 フラットバー 9×38" },
  { label: "仕上げ", value: "錆止め吹付塗装 + 2液型ウレタン塗装" },
  { label: "カラー", value: "マットブラック（標準）／マットホワイト（+15%）" },
  { label: "取付方式", value: "1本目の柱＝1段目の踏み板中央に固定・端部＝壁付け（5段ごとに柱を追加）" },
  { label: "手すり高さ", value: "標準800mm（段鼻から笠木上端まで・600〜1,100mmで変更可）" },
  { label: "横桟オプション", value: "0〜3本（6×25 フラットバー／13φ 丸鋼）" },
  { label: "対応段数", value: `${LAURENT.minSteps}〜${LAURENT.maxSteps}段（全長3.5mまで。超える場合は要問合せ）` },
]

const LONG_DESCRIPTION = `厚み9mm×幅38mmのフラットバー（平鋼）を主材にした、直線階段用のアイアン手摺です。無垢の鉄ならではの重厚な直線が階段まわりを美しく引き締め、握った瞬間にわかる剛性が毎日の上り下りを支えます。

柱は床固定、端部は壁付けで確実に固定する構造です。段数と階段の寸法を入力するだけで、その場で価格と手摺全長の目安がわかります。

足元には横桟（6×25 フラットバー または 13φ 丸鋼）を最大3本まで追加できます。小さなお子様やペットのいるご家庭の落下対策にもどうぞ。

色は標準のマットブラックのほか、マットホワイト（合計金額+15%）にも対応。仕上がりの美しさにこだわり、目立たない細部まで手を抜かず、長く愛用していただけるよう丁寧に制作しています。

※本商品は直線階段専用です。コーナー（曲がり）のある階段は別途お見積もりで対応しますので、お問い合わせください。`

// 段数ごとの価格目安（価格の目安カード用）
const PRICE_GUIDE_STEPS = [3, 6, 10]

/**
 * 寸法入力つき説明図の背景 SVG（CAD 風・静的）。
 * - 各寸法のテキストラベルは持たない。矢印の近くに DiagramInput（HTML の入力
 *   ボックス）を % 座標で重ねる — 図と入力欄が一体になり初見でも位置が分かる
 *   （2026-07-05 蠣﨑さん指示・楽天同種商品の入力フォーム重ね方式を参考）
 * - 笠木は段鼻から 800mm 相当の実際の手すり高さで描く（縮尺: 蹴上げ200mm=40px）
 * - 蹴込みは「拡大」インセットで説明する
 */
function StairDimensionDiagram({ crossbarCount = 0 }: { crossbarCount?: number }) {
  // 笠木（rail）と段鼻ライン（nose）の直線式（y 下向き）。段鼻ラインを 140px 上へ平行移動。
  const railY = (x: number) => 259 - 0.4 * x
  // 横桟: 手すり〜踏み板の間を本数で等分した高さに平行に走る（1本=中央 / 2・3本=等間隔）
  const crossbars = Array.from({ length: crossbarCount }, (_, i) => {
    const f = (i + 1) / (crossbarCount + 1) // 手すりからの下げ割合
    const y1 = railY(175) + f * 140
    const y2 = railY(445) + f * 140
    return { y1, y2 }
  })
  return (
    <svg viewBox="0 0 560 470" role="img" aria-label="蹴上げ・踏み面・蹴込み・最終段の踏み面・手すり高さ・横桟の説明図" className="w-full h-auto">
      <rect x="0" y="0" width="560" height="470" fill="#ffffff" />
      {/* 床・壁 */}
      <line x1="15" y1="395" x2="545" y2="395" stroke="#9ca3af" strokeWidth="2" />
      <line x1="460" y1="40" x2="460" y2="395" stroke="#9ca3af" strokeWidth="2" />
      <text x="470" y="100" fontSize="13" fill="#6b7280">壁</text>
      {/* 階段（3段＋最上段の踏み面）— 段鼻が蹴込み分オーバーハングする実形状 */}
      <path
        d="M 120 395 V 361 H 110 V 355 H 220 V 321 H 210 V 315 H 320 V 281 H 310 V 275 H 460 V 395 Z"
        fill="#f3f4f6"
        stroke="#374151"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* 横桟（手すりと踏み板の間・本数で等分） */}
      {crossbars.map((c, i) => (
        <line key={i} x1="175" y1={c.y1} x2="445" y2={c.y2} stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
      ))}
      {/* 笠木（段鼻ラインに平行・上端は壁付け）。下端は 1 段目踏板中央で折り曲げて固定 */}
      <line x1="165" y1="193" x2="460" y2="75" stroke="#1f2937" strokeWidth="7" strokeLinecap="round" />
      {/* 1本目の柱＝折り曲げた下端（1段目踏み板の中央に立つ） */}
      <line x1="165" y1="193" x2="165" y2="355" stroke="#1f2937" strokeWidth="5" />
      <rect x="156" y="352" width="18" height="6" fill="#1f2937" />
      {/* 中間柱（最上段の段板中央） */}
      <line x1="390" y1="107" x2="390" y2="275" stroke="#1f2937" strokeWidth="5" />
      <rect x="381" y="272" width="18" height="6" fill="#1f2937" />
      <text x="468" y="64" fontSize="13" fill="#374151" textAnchor="end">端部は壁付け</text>
      {/* 手すり高さ: 段鼻から笠木上端まで（標準800mm） */}
      <line x1="212" y1="303" x2="252" y2="303" stroke="#b8860b" strokeWidth="0.75" strokeDasharray="3 3" />
      <line x1="240" y1="163" x2="240" y2="303" stroke="#b8860b" strokeWidth="1.5" />
      <path d="M 240 163 l -4 9 h 8 Z" fill="#b8860b" />
      <path d="M 240 303 l -4 -9 h 8 Z" fill="#b8860b" />
      {/* B 踏み面: 段鼻の先端から次の蹴込み板（立ち上がり）まで */}
      <line x1="110" y1="345" x2="220" y2="345" stroke="#b8860b" strokeWidth="1.5" />
      <path d="M 110 345 l 8 -4 v 8 Z" fill="#b8860b" />
      <path d="M 220 345 l -8 -4 v 8 Z" fill="#b8860b" />
      <line x1="110" y1="341" x2="110" y2="355" stroke="#b8860b" strokeWidth="0.75" />
      <line x1="220" y1="341" x2="220" y2="355" stroke="#b8860b" strokeWidth="0.75" />
      {/* C 蹴上げ（1段の高さ）: 段の上面から次の段の上面まで */}
      <line x1="300" y1="275" x2="300" y2="315" stroke="#b8860b" strokeWidth="1.5" />
      <path d="M 300 275 l -4 8 h 8 Z" fill="#b8860b" />
      <path d="M 300 315 l -4 -8 h 8 Z" fill="#b8860b" />
      <line x1="300" y1="275" x2="314" y2="275" stroke="#b8860b" strokeWidth="0.75" strokeDasharray="3 3" />
      <line x1="300" y1="315" x2="322" y2="315" stroke="#b8860b" strokeWidth="0.75" strokeDasharray="3 3" />
      {/* D 最終段の踏み面: 最上段の段鼻から壁まで */}
      <line x1="310" y1="263" x2="460" y2="263" stroke="#b8860b" strokeWidth="1.5" />
      <path d="M 310 263 l 8 -4 v 8 Z" fill="#b8860b" />
      <path d="M 460 263 l -8 -4 v 8 Z" fill="#b8860b" />
      <line x1="310" y1="259" x2="310" y2="277" stroke="#b8860b" strokeWidth="0.75" />
      {/* 蹴込みの拡大インセット（段鼻の下のへこみ） */}
      <circle cx="215" cy="318" r="16" fill="none" stroke="#b8860b" strokeWidth="1.2" strokeDasharray="4 3" />
      <circle cx="100" cy="72" r="58" fill="none" stroke="#b8860b" strokeWidth="1.2" strokeDasharray="4 3" />
      <text x="24" y="22" fontSize="13" fill="#92650a">拡大</text>
      <line x1="52" y1="48" x2="158" y2="48" stroke="#374151" strokeWidth="3" />
      <line x1="52" y1="48" x2="52" y2="64" stroke="#374151" strokeWidth="2" />
      <line x1="52" y1="64" x2="86" y2="64" stroke="#374151" strokeWidth="2" />
      <line x1="86" y1="64" x2="86" y2="116" stroke="#374151" strokeWidth="2" />
      <line x1="52" y1="64" x2="52" y2="96" stroke="#b8860b" strokeWidth="0.75" strokeDasharray="3 3" />
      <line x1="52" y1="90" x2="86" y2="90" stroke="#b8860b" strokeWidth="1.5" />
      <path d="M 52 90 l 7 -4 v 8 Z" fill="#b8860b" />
      <path d="M 86 90 l -7 -4 v 8 Z" fill="#b8860b" />
      {/* 手摺全長（笠木に平行・上側）— ラベルは水平＋引出線 */}
      <line x1="170" y1="178" x2="455" y2="63" stroke="#b8860b" strokeWidth="1.5" strokeDasharray="6 4" />
      <text x="196" y="28" fontSize="14" fill="#92650a">手摺全長（自動計算）</text>
      <line x1="262" y1="34" x2="300" y2="120" stroke="#b8860b" strokeWidth="1" />
      {/* A 設置範囲の総幅 */}
      <line x1="110" y1="446" x2="460" y2="446" stroke="#b8860b" strokeWidth="1.5" />
      <path d="M 110 446 l 8 -4 v 8 Z" fill="#b8860b" />
      <path d="M 460 446 l -8 -4 v 8 Z" fill="#b8860b" />
      <line x1="110" y1="398" x2="110" y2="450" stroke="#b8860b" strokeWidth="0.75" />
      <line x1="460" y1="398" x2="460" y2="450" stroke="#b8860b" strokeWidth="0.75" />
      <text x="100" y="466" fontSize="12" fill="#92650a">A 設置範囲の総幅（自動計算）＝(B−蹴込み)×(段数−1)＋D</text>
    </svg>
  )
}

/**
 * 図中に浮かべる寸法入力ボックス。位置は図コンテナに対する % 指定 —
 * SVG の viewBox と同じ比率でアンカーが動くため、どの画面幅でも
 * 対応する寸法矢印の近くに表示される。
 */
function DiagramInput({
  label,
  left,
  top,
  value,
  onChange,
  onBlur,
}: {
  label: React.ReactNode
  left: string
  top: string
  value: string
  onChange: (v: string) => void
  onBlur: () => void
}) {
  return (
    <div
      className="absolute z-10 flex items-center gap-1 rounded-md border border-gold/50 bg-white/95 px-1.5 py-1 shadow-sm"
      style={{ left, top }}
    >
      <label className="whitespace-nowrap text-[13px] leading-tight text-muted-foreground">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className="w-14 rounded border border-border bg-white px-1 py-0.5 text-[15px] text-right text-foreground focus:border-gold focus:outline-none"
      />
      <span className="text-[11px] text-muted-foreground">mm</span>
    </div>
  )
}

export function StairProductPage() {
  // ── 階段の寸法 ──
  const [steps, setSteps] = useState(4)
  const [riserInput, setRiserInput] = useState(String(LAURENT.defaults.riserMm))
  const [treadInput, setTreadInput] = useState(String(LAURENT.defaults.treadMm))
  const [kekomiInput, setKekomiInput] = useState(String(LAURENT.defaults.kekomiMm))
  const [lastTreadInput, setLastTreadInput] = useState(String(LAURENT.defaults.lastTreadMm))
  const [railHeightInput, setRailHeightInput] = useState(String(LAURENT.defaults.railHeightMm))
  // 段ごとの蹴上げ（個別調整用）。一括値の変更・段数変更で作り直す。
  const [riserInputs, setRiserInputs] = useState<string[]>(Array(4).fill(String(LAURENT.defaults.riserMm)))

  // ── オプション ──
  const [crossbarCount, setCrossbarCount] = useState(0)
  const [crossbarMaterial, setCrossbarMaterial] = useState<CrossbarMaterial>("round")
  const [color, setColor] = useState<StairColor>("black")
  const [prefecture, setPrefecture] = useState("")

  // ── 決済 ──
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [checkoutClientSecret, setCheckoutClientSecret] = useState<string | null>(null)
  const [bankOrderOpen, setBankOrderOpen] = useState(false)
  const [drawingOpen, setDrawingOpen] = useState(false)
  // 手動で選んだ画像 index（null のときは横桟選択に自動連動）
  const [pickedImage, setPickedImage] = useState<number | null>(null)

  const riserMm = clampRiser(Number(riserInput))
  const treadMm = clampTread(Number(treadInput))
  const kekomiMm = clampKekomi(Number(kekomiInput))
  const lastTreadMm = clampLastTread(Number(lastTreadInput))
  const railHeightMm = clampRailHeight(Number(railHeightInput))
  const risersMm = riserInputs.map((s) => clampRiser(Number(s)))

  const handleStepsChange = (raw: number) => {
    const n = clampSteps(raw)
    setSteps(n)
    setRiserInputs((prev) => {
      const next = prev.slice(0, n)
      while (next.length < n) next.push(riserInput)
      return next
    })
  }

  const handleRiserAllChange = (value: string) => {
    setRiserInput(value)
    setRiserInputs(Array(steps).fill(value))
  }

  const price = useMemo(
    () => calcStairPrice({ steps, crossbarCount, crossbarMaterial, color }),
    [steps, crossbarCount, crossbarMaterial, color],
  )
  const geometry = useMemo(
    () => calcStairGeometry(risersMm, treadMm, kekomiMm, lastTreadMm),
    [risersMm, treadMm, kekomiMm, lastTreadMm],
  )

  // 送料は実寸によらず常に最大サイズで計算（2026-07-05 蠣﨑さん指示・柱/横桟込みで大型のため）
  const shippingResult = useMemo(
    () => (prefecture && !geometry.inquiry ? calcShipping([LAURENT.shippingLengthMm], prefecture, "yokogata") : null),
    [prefecture, geometry.inquiry],
  )
  const shipping = shippingResult && !shippingResult.inquiry ? shippingResult.shipping : 0
  const shippingTax = Math.round(shipping * 0.1)
  const total = price.total + shipping + shippingTax

  // 配送先未選択時の「送料込み目安」（既存商品ページと同じ方式・こちらも最大サイズ）
  const shippingRange = useMemo(
    () => (!prefecture && !geometry.inquiry ? getShippingRange([LAURENT.shippingLengthMm], "yokogata") : null),
    [prefecture, geometry.inquiry],
  )

  const colorLabel = color === "white" ? "マットホワイト" : "マットブラック"
  const crossbarLabel =
    crossbarCount > 0 ? `横桟${crossbarCount}本（${LAURENT.crossbar[crossbarMaterial].label}）` : "横桟なし"

  // メイン画像: 手動選択があればそれを、なければ横桟の有無に連動（0本=なし / 1本以上=あり）
  const shownImage = pickedImage ?? (crossbarCount > 0 ? 1 : 0)

  // 設計図（PDF）用の入力データ。実寸を反映した側面図をモーダルで描画する。
  const drawingOpts = useMemo(
    () => ({
      steps,
      risersMm,
      treadMm,
      kekomiMm,
      lastTreadMm,
      railHeightMm,
      crossbarCount,
      crossbarMaterial,
      color,
      postCount: calcPostCount(steps),
      totalRiseMm: geometry.totalRiseMm,
      runMm: geometry.runMm,
      diagonalMm: geometry.diagonalMm,
    }),
    [steps, risersMm, treadMm, kekomiMm, lastTreadMm, railHeightMm, crossbarCount, crossbarMaterial, color, geometry],
  )

  // カード決済・銀行振込で共有する注文ペイロード（サーバ側で再計算される）
  const orderPayload = {
    product: LAURENT.slug,
    steps,
    riserMm,
    risersMm,
    treadMm,
    kekomiMm,
    lastTreadMm,
    railHeightMm,
    crossbarCount,
    crossbarMaterial,
    color,
    prefecture,
  }

  const checkoutSummary: OrderSummary = {
    productName: `Laurent ローラン 階段手摺 ${steps}段（全長約${geometry.diagonalMm.toLocaleString()}mm）`,
    productNote: `${crossbarLabel} / ${colorLabel} / 通常配送 ${LAURENT.deliveryBusinessDays}営業日`,
    lines: [
      { label: `本体価格（${steps}段 × ¥${LAURENT.pricePerStep.toLocaleString()}）`, amount: price.body },
      ...(price.postAddon > 0
        ? [{ label: `追加柱（${price.addPostCount}本 × ¥${LAURENT.postUnitPrice.toLocaleString()}）`, amount: price.postAddon }]
        : []),
      ...(price.crossbarAddon > 0
        ? [{
            label: `横桟（${crossbarCount}本 × ¥${LAURENT.crossbar[crossbarMaterial].unitPrice.toLocaleString()}）`,
            note: LAURENT.crossbar[crossbarMaterial].label,
            amount: price.crossbarAddon,
          }]
        : []),
      ...(price.whiteSurcharge > 0 ? [{ label: "白仕上げ（合計 +15%）", amount: price.whiteSurcharge }] : []),
      ...(shipping > 0 ? [{ label: `送料（佐川急便・${prefecture}・税抜）`, amount: shipping }] : []),
      ...(shippingTax > 0 ? [{ label: "送料消費税（10%）", amount: shippingTax }] : []),
    ],
    totalLabel: "合計（税込）",
    totalAmount: total,
  }

  const canPurchase = !geometry.inquiry && !!prefecture && !(shippingResult?.inquiry)

  const handleCheckout = async () => {
    if (!canPurchase || isCheckingOut) return
    setIsCheckingOut(true)
    setCheckoutError(null)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      })
      const data = await res.json()
      if (!res.ok || !data?.clientSecret) {
        setCheckoutError(data?.error ?? "購入手続きを開始できませんでした")
        return
      }
      setCheckoutClientSecret(data.clientSecret)
    } catch {
      setCheckoutError("通信エラーが発生しました。時間をおいてお試しください")
    } finally {
      setIsCheckingOut(false)
    }
  }

  // 要問合せ時にフォームへ引き継ぐクエリ
  const contactHref =
    `/contact?type=stair&steps=${steps}&length=${geometry.diagonalMm}` +
    `&crossbar=${encodeURIComponent(crossbarLabel)}&color=${encodeURIComponent(colorLabel)}`

  const inputClass =
    "w-full rounded-md border border-border bg-white px-3 py-2.5 text-[15px] text-foreground focus:border-gold focus:outline-none"
  const stepCircle =
    "absolute left-0 top-0 w-11 h-11 flex items-center justify-center rounded-full border-2 border-gold/60 bg-white font-serif text-[17px] text-gold"

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 lg:pt-24 pb-20 bg-background">
        {/* Breadcrumb */}
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-[11px] font-mono tracking-wide text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-foreground transition-colors">階段手摺</Link>
            <span>/</span>
            <span className="text-foreground">Laurent ローラン</span>
          </nav>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            {/* LEFT COLUMN — 画像・説明図 */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-secondary rounded-lg overflow-hidden">
                <Image
                  src={GALLERY[shownImage].src}
                  alt={`Laurent ローラン 階段手摺（${GALLERY[shownImage].label}）`}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              {/* サムネイル（横桟なし／あり）— タップでメイン画像を切替 */}
              <div className="grid grid-cols-4 gap-2">
                {GALLERY.map((g, i) => (
                  <button
                    key={g.src}
                    type="button"
                    onClick={() => setPickedImage(i)}
                    aria-label={`${g.label}の画像を表示`}
                    className={`relative aspect-square overflow-hidden rounded-md transition-all ${
                      shownImage === i ? "ring-2 ring-gold ring-offset-2" : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={g.src} alt={g.label} fill className="object-cover" sizes="120px" />
                    <span className="absolute inset-x-0 bottom-0 bg-dark/60 py-0.5 text-center text-[10px] text-white">
                      {g.label}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-[12px] md:text-[13px] text-muted-foreground">
                ※画像は完成イメージです。実物の施工写真は準備中です。横桟の有無で見え方が変わります。
              </p>

              {/* 寸法の説明図は右カラムの見積計算機（STEP01）に入力欄ごと統合した */}
            </div>

            {/* RIGHT COLUMN — 商品情報・計算機 */}
            <div className="space-y-7">
              <div className="flex items-center gap-3">
                <div className="w-1 h-7 bg-gold rounded-full" />
                <span className="text-[14px] tracking-wide text-muted-foreground">
                  階段手摺・フラットバー 9×38
                </span>
              </div>

              <div>
                <h1 className="font-serif text-4xl lg:text-5xl text-foreground mb-3 leading-tight">
                  Laurent ローラン
                </h1>
                <p className="text-[16px] text-muted-foreground leading-relaxed">
                  鍛冶職人制作 階段手摺 フラットバー 9×38 マットブラック
                </p>
                <p className="mt-2 text-[13px] md:text-[14px] text-muted-foreground">
                  箱階段・オープン側の階段に。無垢鉄の直線が空間を引き締める、床固定式の階段手摺です。
                </p>
              </div>

              {/* 価格の目安 */}
              <div className="rounded-lg border border-gold/20 bg-card p-6">
                <p className="mb-2 text-[12px] tracking-[0.2em] text-gold font-semibold">価格の目安</p>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-serif text-3xl lg:text-4xl text-foreground">
                    ¥{(LAURENT.minSteps * LAURENT.pricePerStep).toLocaleString()}
                    <span className="text-2xl lg:text-3xl">〜</span>
                  </span>
                  <span className="text-[13px] text-muted-foreground">本体価格・税込（{LAURENT.minSteps}段）</span>
                </div>
                <p className="mt-2 text-[13px] md:text-[14px] text-muted-foreground leading-relaxed">
                  1段 ¥{LAURENT.pricePerStep.toLocaleString()} × 段数で計算します（5段ごとに柱1本・追加柱は1本 ¥{LAURENT.postUnitPrice.toLocaleString()}）。
                </p>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-3">
                  {PRICE_GUIDE_STEPS.map((n) => (
                    <div key={n} className="flex items-baseline gap-1.5">
                      <span className="text-[13px] text-muted-foreground">{n}段</span>
                      <span className="font-serif text-[17px] md:text-[19px] text-foreground">
                        ¥{calcStairPrice({ steps: n, crossbarCount: 0, crossbarMaterial: "round", color: "black" }).total.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[13px] md:text-[14px] text-muted-foreground leading-relaxed">
                  別途送料がかかります。下の計算機で配送先を選ぶと
                  <span className="text-foreground font-medium">送料込みの総額がその場で</span>分かります。
                </p>
              </div>

              <KaigoNotice />

              <FinishCommitment specs={SPECS} />

              <div>
                <p className="text-[15px] leading-relaxed text-foreground whitespace-pre-line">{LONG_DESCRIPTION}</p>
              </div>

              {/* 相談誘導 CTA */}
              <div className="rounded-lg border-2 border-gold/50 bg-gold/[0.05] p-6 shadow-sm">
                <p className="mb-1 flex items-center gap-2 text-[12px] tracking-[0.2em] uppercase text-gold font-semibold">
                  <Camera className="w-4 h-4 shrink-0" />
                  Before you order
                </p>
                <p className="mb-3 font-serif text-[18px] font-bold text-foreground">
                  うちの階段に合うか、まず確認してみませんか？
                </p>
                <p className="mb-5 text-[14px] leading-relaxed text-muted-foreground">
                  「寸法の測り方がわからない」「コーナーのある階段だけど大丈夫？」──
                  そんな疑問でも大歓迎です。階段の写真 1 枚送るだけで職人が直接確認します。
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

              <div className="border-t-2 border-gold/30 pt-6" />

              {/* ===== 見積計算機 ===== */}
              <div className="space-y-7">
                <div className="flex items-center gap-3">
                  <span className="text-[13px] tracking-[0.2em] uppercase text-gold font-semibold">
                    PRICE CALCULATOR
                  </span>
                  <div className="flex-1 h-px bg-gold/30" />
                </div>

                {/* STEP 01 — 階段の寸法 */}
                <div className="relative pl-14">
                  <div className={stepCircle}>01</div>
                  <p className="mb-1 text-[15px] font-semibold text-foreground">階段の寸法を入力する</p>
                  <p className="mb-4 text-[13px] md:text-[14px] text-muted-foreground">
                    それぞれの寸法は下の図の中でそのまま入力できます。だいたいの値でも、高さ・全長の目安がその場で分かります。
                  </p>

                  <label className="mb-1 block text-[13px] text-muted-foreground">段数（{LAURENT.minSteps}〜{LAURENT.maxSteps}段）</label>
                  <div className="mb-4 flex items-center gap-4">
                    <input
                      type="range"
                      min={LAURENT.minSteps}
                      max={LAURENT.maxSteps}
                      value={steps}
                      onChange={(e) => handleStepsChange(Number(e.target.value))}
                      className="flex-1 accent-[#b8860b]"
                      aria-label="段数"
                    />
                    <div className="flex items-baseline gap-1">
                      <input
                        type="number"
                        min={LAURENT.minSteps}
                        max={LAURENT.maxSteps}
                        value={steps}
                        onChange={(e) => handleStepsChange(Number(e.target.value))}
                        className="w-20 rounded-md border border-border bg-white px-3 py-2.5 text-[16px] text-foreground text-right focus:border-gold focus:outline-none"
                      />
                      <span className="text-[14px] text-muted-foreground">段</span>
                    </div>
                  </div>

                  {/* 寸法は図の中で直接入力する（初見でも位置が直感的に分かるように・2026-07-05 蠣﨑さん指示）。
                      モバイルはステップ番号のインデントを抜けて全幅で表示する（-ml-14） */}
                  <div className="-ml-14 md:ml-0 rounded-lg border border-border bg-white p-2 md:p-3">
                    <p className="mb-1 px-2 pt-1 text-[12px] tracking-[0.2em] text-gold font-semibold">
                      DIMENSIONS — 図の位置にそのまま入力
                    </p>
                    <div className="relative">
                      <StairDimensionDiagram crossbarCount={crossbarCount} />
                      <DiagramInput
                        label="蹴込み"
                        left="6%"
                        top="28%"
                        value={kekomiInput}
                        onChange={setKekomiInput}
                        onBlur={() => setKekomiInput(String(kekomiMm))}
                      />
                      <DiagramInput
                        label="手すり高さ"
                        left="8%"
                        top="47%"
                        value={railHeightInput}
                        onChange={setRailHeightInput}
                        onBlur={() => setRailHeightInput(String(railHeightMm))}
                      />
                      <DiagramInput
                        label={<><span className="hidden md:inline">D 最終段の踏み面</span><span className="md:hidden">D 壁まで</span></>}
                        left="48%"
                        top="32%"
                        value={lastTreadInput}
                        onChange={setLastTreadInput}
                        onBlur={() => setLastTreadInput(String(lastTreadMm))}
                      />
                      <DiagramInput
                        label="C 蹴上げ"
                        left="52%"
                        top="68%"
                        value={riserInput}
                        onChange={handleRiserAllChange}
                        onBlur={() => handleRiserAllChange(String(riserMm))}
                      />
                      <DiagramInput
                        label="B 踏み面"
                        left="6%"
                        top="76%"
                        value={treadInput}
                        onChange={setTreadInput}
                        onBlur={() => setTreadInput(String(treadMm))}
                      />
                    </div>
                    <p className="px-2 pb-1 text-[12px] md:text-[13px] text-muted-foreground leading-relaxed">
                      C 蹴上げ＝1段の高さ・D＝最上段の段鼻から壁まで・手すり高さ＝段鼻から笠木上端まで（標準800mm・価格は変わりません）。
                    </p>
                  </div>

                  {/* 自動計算の確認表示 */}
                  <div className="mt-4 rounded-md border border-gold/30 bg-gold/[0.04] p-4">
                    <p className="mb-2 text-[12px] tracking-[0.15em] text-gold font-semibold">入力内容の確認（自動計算）</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <p className="text-[12px] text-muted-foreground">床から最上段までの高さ</p>
                        <p className="font-serif text-[19px] text-foreground">{geometry.totalRiseMm.toLocaleString()}<span className="text-[13px] ml-0.5">mm</span></p>
                      </div>
                      <div>
                        <p className="text-[12px] text-muted-foreground">A 設置範囲の総幅</p>
                        <p className="font-serif text-[19px] text-foreground">{geometry.runMm.toLocaleString()}<span className="text-[13px] ml-0.5">mm</span></p>
                      </div>
                      <div>
                        <p className="text-[12px] text-muted-foreground">手摺の全長（斜め）</p>
                        <p className={`font-serif text-[19px] ${geometry.inquiry ? "text-red-600" : "text-foreground"}`}>
                          約{geometry.diagonalMm.toLocaleString()}<span className="text-[13px] ml-0.5">mm</span>
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-[12px] md:text-[13px] text-muted-foreground leading-relaxed">
                      A＝(B−蹴込み)×(段数−1)＋D で計算しています。実際の階段と大きくズレる場合は、下の「段ごとの蹴上げを調整する」で1段ずつ直せます。
                    </p>
                  </div>

                  {/* 段ごとの蹴上げ個別調整 */}
                  <details className="group mt-3 rounded-md border border-border bg-white">
                    <summary className="cursor-pointer select-none px-4 py-3 text-[14px] font-medium text-foreground">
                      段ごとの蹴上げを調整する（1段目だけ高さが違う場合など）
                    </summary>
                    <div className="border-t border-border px-4 py-4">
                      <p className="mb-3 text-[13px] text-muted-foreground leading-relaxed">
                        各段の高さ（蹴上げ）を個別に入力できます。上の「蹴上げ」を変更すると全段がその値に戻ります。
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {riserInputs.map((v, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="w-12 shrink-0 text-[13px] text-muted-foreground">{i + 1}段目</span>
                            <input
                              type="number"
                              value={v}
                              onChange={(e) =>
                                setRiserInputs((prev) => prev.map((p, j) => (j === i ? e.target.value : p)))
                              }
                              onBlur={() =>
                                setRiserInputs((prev) => prev.map((p, j) => (j === i ? String(clampRiser(Number(p))) : p)))
                              }
                              className="w-full rounded-md border border-border bg-white px-2 py-2 text-[14px] text-foreground text-right focus:border-gold focus:outline-none"
                              aria-label={`${i + 1}段目の蹴上げ`}
                            />
                            <span className="text-[12px] text-muted-foreground">mm</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </details>
                </div>

                {/* STEP 02 — 横桟 */}
                <div className="relative pl-14">
                  <div className={stepCircle}>02</div>
                  <p className="mb-1 text-[15px] font-semibold text-foreground">横桟（足元の桟）を選ぶ</p>
                  <p className="mb-4 text-[13px] md:text-[14px] text-muted-foreground">
                    手摺の下に通す桟です。お子様・ペットの落下対策に。なしでもご注文いただけます。
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[0, 1, 2, 3].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setCrossbarCount(n)}
                        className={`rounded-md border-2 px-5 py-2.5 text-[14px] font-medium transition ${
                          crossbarCount === n
                            ? "border-gold bg-gold/10 text-foreground"
                            : "border-border bg-white text-muted-foreground hover:border-gold/50"
                        }`}
                      >
                        {n === 0 ? "なし" : `${n}本`}
                      </button>
                    ))}
                  </div>
                  {crossbarCount > 0 && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCrossbarMaterial("round")}
                        className={`rounded-md border-2 px-4 py-3 text-left transition ${
                          crossbarMaterial === "round"
                            ? "border-gold bg-gold/10"
                            : "border-border bg-white hover:border-gold/50"
                        }`}
                      >
                        <span className="block text-[14px] font-medium text-foreground">
                          13φ 丸鋼
                          <span className="ml-2 rounded bg-gold/15 px-1.5 py-0.5 text-[11px] text-gold font-semibold">お求めやすい</span>
                        </span>
                        <span className="block text-[13px] text-muted-foreground">1本 ¥{LAURENT.crossbar.round.unitPrice.toLocaleString()}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCrossbarMaterial("flat")}
                        className={`rounded-md border-2 px-4 py-3 text-left transition ${
                          crossbarMaterial === "flat"
                            ? "border-gold bg-gold/10"
                            : "border-border bg-white hover:border-gold/50"
                        }`}
                      >
                        <span className="block text-[14px] font-medium text-foreground">6×25 フラットバー</span>
                        <span className="block text-[13px] text-muted-foreground">1本 ¥{LAURENT.crossbar.flat.unitPrice.toLocaleString()}・本体と揃う平鋼</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* STEP 03 — 色 */}
                <div className="relative pl-14">
                  <div className={stepCircle}>03</div>
                  <p className="mb-4 text-[15px] font-semibold text-foreground">色を選ぶ</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setColor("black")}
                      className={`rounded-md border-2 px-4 py-3 text-left transition ${
                        color === "black" ? "border-gold bg-gold/10" : "border-border bg-white hover:border-gold/50"
                      }`}
                    >
                      <span className="flex items-center gap-2 text-[14px] font-medium text-foreground">
                        <span className="inline-block h-4 w-4 rounded-full bg-[#1f1f1f] border border-border" />
                        マットブラック（標準）
                      </span>
                      <span className="block text-[13px] text-muted-foreground mt-0.5">追加料金なし</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setColor("white")}
                      className={`rounded-md border-2 px-4 py-3 text-left transition ${
                        color === "white" ? "border-gold bg-gold/10" : "border-border bg-white hover:border-gold/50"
                      }`}
                    >
                      <span className="flex items-center gap-2 text-[14px] font-medium text-foreground">
                        <span className="inline-block h-4 w-4 rounded-full bg-white border border-border" />
                        マットホワイト
                      </span>
                      <span className="block text-[13px] text-muted-foreground mt-0.5">合計金額 +15%</span>
                    </button>
                  </div>
                </div>

                {/* STEP 04 — 配送先 */}
                <div className="relative pl-14">
                  <div className={stepCircle}>04</div>
                  <p className="mb-4 text-[15px] font-semibold text-foreground">配送先の都道府県を選ぶ</p>
                  <select
                    value={prefecture}
                    onChange={(e) => setPrefecture(e.target.value)}
                    className={inputClass}
                    aria-label="配送先都道府県"
                  >
                    <option value="">選択してください</option>
                    {prefectures.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  {shippingResult?.inquiry && (
                    <p className="mt-2 text-[13px] text-red-600">{shippingResult.inquiryReason}</p>
                  )}
                </div>

                {/* ===== 価格表示 or 要問合せ ===== */}
                {geometry.inquiry ? (
                  <div className="rounded-lg border-2 border-gold/50 bg-gold/[0.05] p-6">
                    <p className="mb-2 text-[12px] tracking-[0.2em] text-gold font-semibold">お問い合わせください</p>
                    <p className="mb-3 font-serif text-[20px] text-foreground">
                      この寸法は要問合せです（全長 約{geometry.diagonalMm.toLocaleString()}mm）
                    </p>
                    <p className="mb-5 text-[14px] leading-relaxed text-muted-foreground">
                      全長3.5mを超える製品は通常の宅配便で発送できません。配送先の営業所止め、
                      または4トントラックで搬入可能かの確認が必要なため、お問い合わせください。
                      入力いただいた段数・寸法はお問い合わせフォームに引き継がれます。
                    </p>
                    <PrimaryCTA variant="gold" href={contactHref} withArrow>
                      この内容で問い合わせる
                    </PrimaryCTA>
                  </div>
                ) : (
                  <>
                    {/* 内訳と合計 */}
                    <div className="rounded-lg border border-border bg-card p-6">
                      <p className="mb-3 text-[12px] tracking-[0.2em] text-gold font-semibold">お見積もり内訳</p>
                      <div className="space-y-2">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-[14px] text-muted-foreground">本体価格（{steps}段 × ¥{LAURENT.pricePerStep.toLocaleString()}）</span>
                          <span className="text-[15px] text-foreground">¥{price.body.toLocaleString()}</span>
                        </div>
                        {price.postAddon > 0 && (
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="text-[14px] text-muted-foreground">追加柱（{price.addPostCount}本 × ¥{LAURENT.postUnitPrice.toLocaleString()}）</span>
                            <span className="text-[15px] text-foreground">¥{price.postAddon.toLocaleString()}</span>
                          </div>
                        )}
                        {price.crossbarAddon > 0 && (
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="text-[14px] text-muted-foreground">{crossbarLabel}</span>
                            <span className="text-[15px] text-foreground">¥{price.crossbarAddon.toLocaleString()}</span>
                          </div>
                        )}
                        {price.whiteSurcharge > 0 && (
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="text-[14px] text-muted-foreground">白仕上げ（合計 +15%）</span>
                            <span className="text-[15px] text-foreground">¥{price.whiteSurcharge.toLocaleString()}</span>
                          </div>
                        )}
                        {prefecture && shipping > 0 && (
                          <>
                            <div className="flex items-baseline justify-between gap-3">
                              <span className="text-[14px] text-muted-foreground">送料（佐川急便・{prefecture}・税抜）</span>
                              <span className="text-[15px] text-foreground">¥{shipping.toLocaleString()}</span>
                            </div>
                            <div className="flex items-baseline justify-between gap-3">
                              <span className="text-[14px] text-muted-foreground">送料消費税（10%）</span>
                              <span className="text-[15px] text-foreground">¥{shippingTax.toLocaleString()}</span>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="mt-4 flex items-baseline justify-between gap-3 border-t-2 border-gold/40 pt-3">
                        <span className="text-[15px] font-semibold text-foreground">
                          {prefecture ? "合計（税込・送料込）" : "本体合計（税込）"}
                        </span>
                        <span className="font-serif text-3xl text-foreground">
                          ¥{(prefecture ? total : price.total).toLocaleString()}
                        </span>
                      </div>
                      {!prefecture && shippingRange && (
                        <p className="mt-2 text-[13px] text-muted-foreground">
                          送料込み目安: ¥{(price.total + Math.round(shippingRange.minShipping * 1.1)).toLocaleString()}
                          〜¥{(price.total + Math.round(shippingRange.maxShipping * 1.1)).toLocaleString()}
                          （配送先を選ぶと確定します）
                        </p>
                      )}
                      {/* 入力寸法から設計図（PDF）を生成 */}
                      <button
                        type="button"
                        onClick={() => setDrawingOpen(true)}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border-2 border-gold/50 bg-white px-4 py-3 text-[14px] font-semibold text-foreground transition hover:border-gold hover:text-gold"
                      >
                        入力内容の設計図（PDF）を見る
                      </button>
                      <p className="mt-1.5 text-center text-[12px] text-muted-foreground">
                        段数・寸法・横桟・柱の位置を反映した図面をその場で確認・印刷できます。
                      </p>
                    </div>

                    {/* STEP 05 — 購入 */}
                    <div className="relative pl-14">
                      <div className={stepCircle}>05</div>
                      <p className="mb-1 text-[15px] font-semibold text-foreground">ご購入手続き</p>
                      <p className="mb-4 text-[13px] md:text-[14px] text-muted-foreground">
                        通常配送（{LAURENT.deliveryBusinessDays}営業日）でお届けします。カード決済・銀行振込のどちらでもご注文いただけます。
                      </p>
                      {checkoutError && (
                        <p className="mb-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
                          {checkoutError}
                        </p>
                      )}
                      <div className="flex flex-col gap-3">
                        <PrimaryCTA
                          variant="purchase"
                          onClick={handleCheckout}
                          disabled={!canPurchase || isCheckingOut}
                        >
                          {isCheckingOut ? "手続きを準備中…" : "お支払い手続きへ進む"}
                        </PrimaryCTA>
                        <PrimaryCTA
                          variant="purchase-steel"
                          onClick={() => canPurchase && setBankOrderOpen(true)}
                          disabled={!canPurchase}
                        >
                          銀行振込でご注文する
                        </PrimaryCTA>
                        {!prefecture && (
                          <p className="text-[13px] text-muted-foreground">配送先の都道府県を選ぶとご購入いただけます。</p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ===== SPECIFICATIONS ===== */}
          <div className="mt-16 max-w-3xl">
            <div className="mb-5 flex items-center gap-3">
              <span className="text-[13px] tracking-[0.2em] uppercase text-gold font-semibold">Specifications</span>
              <div className="flex-1 h-px bg-gold/30" />
            </div>
            <dl className="divide-y divide-border rounded-lg border border-border bg-white">
              {SPECS.map((s) => (
                <div key={s.label} className="grid grid-cols-[110px_1fr] md:grid-cols-[160px_1fr] gap-3 px-4 py-3">
                  <dt className="text-[13px] md:text-[14px] text-muted-foreground">{s.label}</dt>
                  <dd className="text-[14px] md:text-[15px] text-foreground">{s.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[13px] md:text-[14px] text-muted-foreground leading-relaxed">
              コーナー（曲がり）のある階段、全長3.5mを超える階段は
              <Link href="/contact" className="text-gold underline underline-offset-2">お問い合わせ</Link>
              から別途お見積もりで対応します。
            </p>
          </div>
        </div>
      </main>

      <Footer />

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

      <StairDrawingModal open={drawingOpen} onClose={() => setDrawingOpen(false)} drawing={drawingOpts} />
    </div>
  )
}
