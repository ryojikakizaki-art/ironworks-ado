// 階段手摺（段数ベース価格）の価格・寸法計算の正本。
//
// 商品ページ表示・カード決済 (app/api/checkout)・銀行振込 (app/api/bank-order) の
// 3 ヶ所すべてがこのモジュールを参照し、表示価格と決済価格のズレを構造的に防ぐ
// （PR #347 で確立した order-pricing.ts と同じ考え方）。
//
// 既存の壁付け手すり（lib/products/order-pricing.ts）は「長さベース」の価格モデルだが、
// ここは「段数ベース」で計算式がまったく異なるため、独立したモジュールにしている。
// ※ DRAWING_PRODUCTS には登録しないこと。登録すると /trade の参考見積もりと
//   図面モーダルが長さベースの誤った価格で動いてしまう。
//
// 2026-09-27: Laurent 専用だったものを 2 商品対応にした。
// 商品ごとの差分はすべて StairProductConfig に寄せ、計算式は共通にしている。
// 関数はどれも商品設定を必須引数で受け取る（省略可にすると、新商品の追加時に
// 渡し忘れた箇所が黙って Laurent の価格で動いてしまうため）。

export type CrossbarMaterial = "flat" | "round"
export type StairColor = "black" | "white"

export const STAIR_PRODUCT_SLUGS = ["laurent", "tsuta-stair"] as const
export type StairProductSlug = (typeof STAIR_PRODUCT_SLUGS)[number]

/** 側面図での手すりの描き分け */
export type StairRailStyle =
  /** 直線のフラットバー（実形状を正確に描ける） */
  | "flatbar"
  /** 手仕事の有機的な曲線。実物は一本ずつ違うため図では簡略表示にする */
  | "vine"

export type StairPricingModel =
  /** 段数 × 単価 ＋ 追加柱 × 単価（Laurent） */
  | { model: "per-step"; pricePerStep: number; postUnitPrice: number }
  /** 基本料 ＋ 段数 × 単価（蔦・室内階段）。柱代は単価に含む */
  | { model: "base-plus-step"; basePrice: number; pricePerStep: number }

export interface StairProductConfig {
  slug: StairProductSlug
  nameEn: string
  nameJa: string
  /** 商品ページ・受注台帳に出す種別 */
  type: string
  minSteps: number
  maxSteps: number
  pricing: StairPricingModel
  /**
   * 柱の本数ルール: ceil(段数 / stepsPerPost) を minCount で下支えする。
   * atSteps があるときはそちらが優先＝その段の踏み板にだけ途中の柱を立てる（蔦）。
   * その場合の柱の合計本数＝握り手下端の床着地 1 ＋ 最上段より下にある atSteps の数。
   */
  post: { stepsPerPost: number; minCount: number; atSteps?: number[] }
  /** 白仕上げ（+x%）を選べるか。false なら黒のみ */
  colorOptions: boolean
  whiteRatePercent: number
  /** 横桟オプションを持つか。false なら本数は常に 0 */
  crossbarOptions: boolean
  crossbar: Record<CrossbarMaterial, { label: string; unitPrice: number }>
  maxCrossbars: number
  deliveryBusinessDays: number
  /** 佐川の梱包上限。手摺の斜め全長がこれを超えたら自動見積もりを止める */
  maxShipMm: number
  /** 送料は実寸によらずこの長さで計算する（常に最大サイズ） */
  shippingLengthMm: number
  railStyle: StairRailStyle
  /** 側面図の注記に足す一文（実物との差を明示する用途） */
  drawingNote?: string
  /** 設計図の表題欄。finish / accessories が null のときは塗装色・ビス本数から自動で書く */
  drawingTitle: {
    productName: string
    code: string
    material: string
    finish: string | null
    accessories: string | null
  }
  defaults: {
    riserMm: number
    treadMm: number
    kekomiMm: number
    lastTreadMm: number
    railHeightMm: number
  }
  limits: {
    riser: { min: number; max: number }
    tread: { min: number; max: number }
    kekomi: { min: number; max: number }
    lastTread: { min: number; max: number }
    railHeight: { min: number; max: number }
  }
}

// 全商品で共通の階段寸法の既定値・許容範囲
const STAIR_DEFAULTS = { riserMm: 200, treadMm: 240, kekomiMm: 20, lastTreadMm: 240, railHeightMm: 800 } as const
const STAIR_LIMITS = {
  riser: { min: 50, max: 500 }, // 蹴上げ (mm)
  tread: { min: 100, max: 500 }, // 踏み面 (mm)
  kekomi: { min: 0, max: 100 }, // 蹴込み (mm)
  lastTread: { min: 0, max: 1500 }, // 最終段の踏み面＝壁までの寸法 (mm)
  railHeight: { min: 600, max: 1100 }, // 手すり高さ (mm)
} as const

const CROSSBAR = {
  flat: { label: "6×25 フラットバー", unitPrice: 6000 },
  round: { label: "13φ 丸鋼", unitPrice: 4000 },
} as const satisfies Record<CrossbarMaterial, { label: string; unitPrice: number }>

export const LAURENT: StairProductConfig = {
  slug: "laurent",
  nameEn: "Laurent",
  nameJa: "ローラン",
  type: "階段手摺",
  minSteps: 3,
  maxSteps: 20, // 入力ミス防止の上限（2026-07-04 蠣﨑さん確定）
  // ── 価格（すべて税込）──
  pricing: { model: "per-step", pricePerStep: 25000, postUnitPrice: 15000 },
  post: { stepsPerPost: 5, minCount: 1 }, // 1段目を1本目と換算し、5段ごとに柱1本
  // 白仕上げ: (本体+横桟) 合計 × 1.15（1円未満切り捨て）。
  // 0.1 が二進で表せず 392,000×1.15 = 450,799.99… になるため百分率の整数で持つ。
  colorOptions: true,
  whiteRatePercent: 115,
  crossbarOptions: true,
  crossbar: CROSSBAR,
  maxCrossbars: 3,
  // ── 納期 ──
  // 大物のため既存商品の10営業日でなく15営業日（2026-07-04 蠣﨑さん確定）。特急なし。
  deliveryBusinessDays: 15,
  // ── 寸法 ──
  // 佐川急便の梱包上限（3,501mm 以上は要問合せ・lib/shipping/sagawa.ts）に合わせ、
  // 手摺の斜め全長がこれを超えたら自動見積もりを止めて「要問合せ」に切り替える
  // （2026-07-04 蠣﨑さん確定: 指示書の 4m 基準を配送実態に合わせ 3.5m に前倒し）。
  maxShipMm: 3500,
  // 送料は実寸によらず常に最大サイズ（佐川 260 サイズ）で計算する
  // （2026-07-05 蠣﨑さん指示）。柱・横桟を含む梱包が大きくなるため一律最大で見込む。
  // この長さを calcShipping に渡すと発送サイズ 3,600mm → 260 サイズ区分になる。
  shippingLengthMm: 3400,
  railStyle: "flatbar",
  drawingTitle: {
    productName: "Laurent ローラン 階段手摺",
    code: "IW-LAU",
    material: "フラットバー 9×38（無垢鉄）",
    finish: null,
    accessories: null,
  },
  // 手すり高さ＝段鼻から笠木上端まで。標準 800mm（2026-07-04 蠣﨑さん指示）。
  // 価格には影響しない製作仕様として注文に記録する。
  defaults: STAIR_DEFAULTS,
  limits: STAIR_LIMITS,
}

/**
 * 蔦（室内階段版）— 2026-09-27 蠣﨑さん指示で追加。
 *
 * 屋外版の蔦（lib/products/simple.ts の slug: "tsuta"）はアプローチ用の一品もので
 * 溶融亜鉛メッキ仕様。こちらは室内階段用に段数指定で注文できるようにしたもので、
 * 室内は雨風にさらされないため **メッキなし・塗装仕上げ（錆止め＋艶消し黒塗装＋古美）**（2026-10-11 蠣﨑さん回答）。
 *
 * 価格は「基本料＋段数」の 2 段構え（2026-09-27 蠣﨑さん選択）。
 * 型取り・端部造形など段数によらない固定工数を基本料で受け、段数ぶんを単価で足す。
 * 柱代は単価に含めており、Laurent のような追加柱の加算は行わない。
 *
 * 送料は Laurent と同じく実寸によらず常に最大サイズ（2026-09-27 蠣﨑さん指示:
 * 「梱包サイズは全て最大サイズ」）。
 */
export const TSUTA_STAIR: StairProductConfig = {
  slug: "tsuta-stair",
  nameEn: "Tsuta",
  nameJa: "蔦",
  type: "室内階段手摺",
  minSteps: 2,
  maxSteps: 7, // 2026-09-27 蠣﨑さん指示「基本は7段の階段まで」
  pricing: { model: "base-plus-step", basePrice: 80000, pricePerStep: 30000 },
  // 途中の柱は 3 段目と 5 段目の踏み板だけ（2026-10-11 蠣﨑さん指示「最上段に柱はいらない。3段目・5段目に入れる」）。
  // 握り手の下端は 1 段目の手前の床に着地する（写真4の形・設計図は stair-svg の vine 分岐）。
  post: { stepsPerPost: 3, minCount: 1, atSteps: [3, 5] },
  // 室内は艶消し黒塗装＋古美のみ（白仕上げの展開なし）
  colorOptions: false,
  whiteRatePercent: 100,
  crossbarOptions: false,
  crossbar: CROSSBAR,
  maxCrossbars: 0,
  // 手打ち鎚目＋蔦の造形のぶん Laurent より工数がかかる想定で長めに置いている
  deliveryBusinessDays: 25,
  maxShipMm: 3500,
  shippingLengthMm: 3400,
  railStyle: "vine",
  drawingTitle: {
    productName: "蔦 Tsuta 室内階段手摺",
    code: "IW-TSU",
    material: "無垢鉄 丸鋼（全面手打ち鎚目）",
    finish: "錆止め＋艶消し黒塗装＋古美（メッキなし）",
    accessories: "取付用ビス一式・タッチアップ剤",
  },
  drawingNote:
    "蔦の形は実物写真から起こした参考形状です。一本ずつ手仕事で造形するため、実際の曲がり方・絡み方・鎚目の出方は一点ごとに異なります。",
  defaults: STAIR_DEFAULTS,
  limits: STAIR_LIMITS,
}

const STAIR_PRODUCTS: Record<StairProductSlug, StairProductConfig> = {
  laurent: LAURENT,
  "tsuta-stair": TSUTA_STAIR,
}

export function isStairProductSlug(slug: string): slug is StairProductSlug {
  return Object.prototype.hasOwnProperty.call(STAIR_PRODUCTS, slug)
}

/** 階段商品の設定を引く。対象外の slug は null。 */
export function getStairProduct(slug: string): StairProductConfig | null {
  return isStairProductSlug(slug) ? STAIR_PRODUCTS[slug] : null
}

export function clampSteps(n: number, p: StairProductConfig): number {
  const v = Math.round(Number(n) || p.minSteps)
  return Math.max(p.minSteps, Math.min(p.maxSteps, v))
}

export function clampRiser(n: number, p: StairProductConfig): number {
  const v = Math.round(Number(n) || p.defaults.riserMm)
  return Math.max(p.limits.riser.min, Math.min(p.limits.riser.max, v))
}

export function clampTread(n: number, p: StairProductConfig): number {
  const v = Math.round(Number(n) || p.defaults.treadMm)
  return Math.max(p.limits.tread.min, Math.min(p.limits.tread.max, v))
}

export function clampKekomi(n: number, p: StairProductConfig): number {
  const v = Math.round(Number(n) || 0)
  return Math.max(p.limits.kekomi.min, Math.min(p.limits.kekomi.max, v))
}

export function clampLastTread(n: number, p: StairProductConfig): number {
  const raw = Number(n)
  const v = Number.isFinite(raw) ? Math.round(raw) : p.defaults.lastTreadMm
  return Math.max(p.limits.lastTread.min, Math.min(p.limits.lastTread.max, v))
}

export function clampRailHeight(n: number, p: StairProductConfig): number {
  const v = Math.round(Number(n) || p.defaults.railHeightMm)
  return Math.max(p.limits.railHeight.min, Math.min(p.limits.railHeight.max, v))
}

/** 途中の柱を立てる段（atSteps のある商品のみ）。最上段には立てない（10/11「最上段に柱はいらない」） */
export function postStepsFor(steps: number, p: StairProductConfig): number[] {
  const n = clampSteps(steps, p)
  return (p.post.atSteps ?? []).filter((s) => s < n)
}

export function calcPostCount(steps: number, p: StairProductConfig): number {
  if (p.post.atSteps) return 1 + postStepsFor(steps, p).length
  return Math.max(p.post.minCount, Math.ceil(clampSteps(steps, p) / p.post.stepsPerPost))
}

export interface StairPriceInput {
  steps: number
  crossbarCount: number // 0〜3（横桟なしの商品は常に 0）
  crossbarMaterial: CrossbarMaterial
  color: StairColor
}

export interface StairPriceResult {
  steps: number
  postCount: number // 柱の合計本数
  addPostCount: number // 追加柱の本数（= postCount - 1）
  /** 段数によらない基本料（base-plus-step のみ。per-step は 0） */
  baseFee: number
  body: number // 段数 × 単価
  postAddon: number // 追加柱 × 単価（base-plus-step は 0＝単価に含む）
  crossbarAddon: number // 横桟 本数 × 単価
  blackSubtotal: number // 黒仕上げでの合計
  whiteSurcharge: number // 白仕上げ加算分（total - blackSubtotal）
  total: number // 税込合計
}

/**
 * 検算表（実装後に必ず一致確認）:
 *
 * Laurent（指示書 2-4）:
 * - 3段・黒・横桟なし          → ¥75,000
 * - 6段・黒・横桟なし          → ¥165,000
 * - 14段・黒・横桟なし         → ¥380,000
 * - 14段・黒・13φ×3本          → ¥392,000
 * - 14段・白・13φ×3本          → ¥450,800
 *
 * 蔦（室内階段・基本料¥80,000＋段数×¥30,000）:
 * - 2段 → ¥140,000 / 4段 → ¥200,000 / 7段 → ¥290,000
 */
export function calcStairPrice(input: StairPriceInput, p: StairProductConfig): StairPriceResult {
  const steps = clampSteps(input.steps, p)
  const crossbarCount = p.crossbarOptions
    ? Math.max(0, Math.min(p.maxCrossbars, Math.round(Number(input.crossbarCount) || 0)))
    : 0
  const postCount = calcPostCount(steps, p)
  const addPostCount = postCount - 1

  const baseFee = p.pricing.model === "base-plus-step" ? p.pricing.basePrice : 0
  const body = steps * p.pricing.pricePerStep
  // 柱代は per-step のみ別建て。base-plus-step は段数単価に含む
  const postAddon = p.pricing.model === "per-step" ? addPostCount * p.pricing.postUnitPrice : 0
  const crossbarAddon = crossbarCount * p.crossbar[input.crossbarMaterial].unitPrice

  const blackSubtotal = baseFee + body + postAddon + crossbarAddon
  const useWhite = p.colorOptions && input.color === "white"
  const total = useWhite ? Math.floor((blackSubtotal * p.whiteRatePercent) / 100) : blackSubtotal

  return {
    steps,
    postCount,
    addPostCount,
    baseFee,
    body,
    postAddon,
    crossbarAddon,
    blackSubtotal,
    whiteSurcharge: total - blackSubtotal,
    total,
  }
}

export interface StairGeometry {
  /** 床から最上段までの高さ = 各段の蹴上げの合計 (mm) */
  totalRiseMm: number
  /** A: 設置範囲の総幅 = (踏み面 - 蹴込み) × (段数 - 1) + 最終段の踏み面 (mm) */
  runMm: number
  /** 手摺の斜め全長 = √(高さ² + 総幅²) (mm) */
  diagonalMm: number
  /** 3,500mm 超 → 自動見積もり対象外（要問合せ） */
  inquiry: boolean
}

/**
 * 計算式は 2026-07-04 蠣﨑さん確定（指示書 3-2 の案）＋同日追加指示:
 * 端部が壁付けのため「D: 最終段の踏み面（壁までの寸法）」を総幅に加える
 * （楽天の同種商品の入力項目 A=B×(段数-1)+D を参考にした拡張）。
 */
export function calcStairGeometry(
  risersMm: number[],
  treadMm: number,
  kekomiMm: number,
  lastTreadMm: number,
  p: StairProductConfig,
): StairGeometry {
  const n = risersMm.length
  const totalRiseMm = risersMm.reduce((s, r) => s + r, 0)
  const runMm = Math.max(0, (n - 1) * (treadMm - kekomiMm)) + clampLastTread(lastTreadMm, p)
  const diagonalMm = Math.round(Math.hypot(totalRiseMm, runMm))
  return { totalRiseMm, runMm, diagonalMm, inquiry: diagonalMm > p.maxShipMm }
}

// ── 注文ボディの解析（カード決済・銀行振込のサーバ側で共用）──

export interface StairOrderParsed {
  product: StairProductConfig
  steps: number
  risersMm: number[]
  treadMm: number
  kekomiMm: number
  lastTreadMm: number
  railHeightMm: number
  crossbarCount: number
  crossbarMaterial: CrossbarMaterial
  color: StairColor
  geometry: StairGeometry
  price: StairPriceResult
  /** 台帳・メール・Stripe 表示用の商品ラベル */
  productLabel: string
  /** 仕様の内訳（台帳 I 列・Stripe description 用） */
  specParts: string[]
  /** Stripe metadata に載せる仕様キー */
  metadata: Record<string, string>
}

export type StairOrderParseResult =
  | { ok: true; order: StairOrderParsed }
  | { ok: false; error: string; inquiry?: boolean }

/**
 * クライアントから送られた注文ボディをサーバ側で再解釈・再計算する。
 * クライアントの金額は一切信用しない（bank-order と同じ方針）。
 */
export function parseStairOrderBody(body: Record<string, unknown>, p: StairProductConfig): StairOrderParseResult {
  const steps = clampSteps(Number(body?.steps), p)
  const riserMm = clampRiser(Number(body?.riserMm), p)
  const treadMm = clampTread(Number(body?.treadMm), p)
  const kekomiMm = clampKekomi(Number(body?.kekomiMm), p)
  const lastTreadMm = clampLastTread(Number(body?.lastTreadMm), p)
  const railHeightMm = clampRailHeight(Number(body?.railHeightMm), p)

  // 段ごとの蹴上げ個別指定（省略時は一括値で埋める）
  const risersMm: number[] =
    Array.isArray(body?.risersMm) && (body.risersMm as unknown[]).length === steps
      ? (body.risersMm as unknown[]).map((v) => clampRiser(Number(v), p))
      : Array(steps).fill(riserMm)

  const crossbarMaterial: CrossbarMaterial = body?.crossbarMaterial === "flat" ? "flat" : "round"
  const crossbarCount = p.crossbarOptions
    ? Math.max(0, Math.min(p.maxCrossbars, Math.round(Number(body?.crossbarCount) || 0)))
    : 0
  const color: StairColor = p.colorOptions && body?.color === "white" ? "white" : "black"

  const geometry = calcStairGeometry(risersMm, treadMm, kekomiMm, lastTreadMm, p)
  if (geometry.inquiry) {
    return {
      ok: false,
      inquiry: true,
      error:
        `手摺の全長が約${geometry.diagonalMm.toLocaleString()}mmとなり、3.5mを超えるためオンライン購入の対象外です。` +
        "配送方法の確認が必要なため、お問い合わせフォームからご相談ください。",
    }
  }

  const price = calcStairPrice({ steps, crossbarCount, crossbarMaterial, color }, p)

  const uniformRiser = risersMm.every((r) => r === risersMm[0])
  const riserLabel = uniformRiser ? `蹴上げ${risersMm[0]}mm` : `蹴上げ段別指定（${risersMm.join("/")}mm）`
  const colorLabel = p.colorOptions
    ? color === "white"
      ? "マットホワイト（+15%）"
      : "マットブラック"
    : "錆止め＋艶消し黒塗装＋古美仕上げ（メッキなし・室内用）"
  const crossbarLabel = p.crossbarOptions
    ? crossbarCount > 0
      ? `横桟${crossbarCount}本（${p.crossbar[crossbarMaterial].label}）`
      : "横桟なし"
    : ""

  const productLabel = `${p.nameEn} ${p.nameJa} ${p.type} ${steps}段（全長約${geometry.diagonalMm.toLocaleString()}mm）`
  const specParts = [
    p.post.atSteps
      ? (() => {
          const ps = postStepsFor(steps, p)
          return `${steps}段・途中の柱${ps.length}本${ps.length ? `（${ps.join("・")}段目）` : ""}・下端は床に着地`
        })()
      : `${steps}段・柱${price.postCount}本`,
    `${riserLabel} / 踏み面${treadMm}mm / 蹴込み${kekomiMm}mm / 最終段の踏み面${lastTreadMm}mm`,
    `手すり高さ${railHeightMm}mm（段鼻から） / 高さ${geometry.totalRiseMm}mm × 総幅${geometry.runMm}mm`,
    crossbarLabel,
    colorLabel,
  ].filter(Boolean)

  const metadata: Record<string, string> = {
    product: p.slug,
    product_name: `${p.nameEn} ${p.nameJa}`,
    product_label: productLabel,
    spec_text: specParts.join(" / "),
    type: p.type,
    steps: String(steps),
    risers_mm: risersMm.join(","),
    tread_mm: String(treadMm),
    kekomi_mm: String(kekomiMm),
    last_tread_mm: String(lastTreadMm),
    rail_height_mm: String(railHeightMm),
    crossbar_count: String(crossbarCount),
    ...(crossbarCount > 0 ? { crossbar_material: p.crossbar[crossbarMaterial].label } : {}),
    color: colorLabel,
    delivery_label: `通常配送（${p.deliveryBusinessDays}営業日）`,
    diagonal_mm: String(geometry.diagonalMm),
    // 既存 webhook (parseLengthsMeta) 互換: 発送サイズの基準になる斜め全長を長さとして記録
    length_mm: String(geometry.diagonalMm),
    lengths_mm: String(geometry.diagonalMm),
    quantity: "1",
  }

  return {
    ok: true,
    order: {
      product: p,
      steps,
      risersMm,
      treadMm,
      kekomiMm,
      lastTreadMm,
      railHeightMm,
      crossbarCount,
      crossbarMaterial,
      color,
      geometry,
      price,
      productLabel,
      specParts,
      metadata,
    },
  }
}
