// Laurent（階段手摺・フラットバー 9×38）の価格・寸法計算の正本。
//
// 商品ページ表示・カード決済 (app/api/checkout)・銀行振込 (app/api/bank-order) の
// 3 ヶ所すべてがこのモジュールを参照し、表示価格と決済価格のズレを構造的に防ぐ
// （PR #347 で確立した order-pricing.ts と同じ考え方）。
//
// 既存の壁付け手すり（lib/products/order-pricing.ts）は「長さベース」の価格モデルだが、
// Laurent は「段数ベース」で計算式がまったく異なるため、独立したモジュールにしている。
// ※ DRAWING_PRODUCTS には登録しないこと。登録すると /trade の参考見積もりと
//   図面モーダルが長さベースの誤った価格で動いてしまう。

export const STAIR_PRODUCT_SLUGS = ["laurent"] as const

export type CrossbarMaterial = "flat" | "round"
export type StairColor = "black" | "white"

export const LAURENT = {
  slug: "laurent",
  nameEn: "Laurent",
  nameJa: "ローラン",
  type: "階段手摺",
  // ── 価格（すべて税込）──
  pricePerStep: 25000, // 1段あたり
  postUnitPrice: 15000, // 追加柱1本あたり
  stepsPerPost: 5, // 1段目を1本目と換算し、5段ごとに柱1本
  minSteps: 3,
  maxSteps: 20, // 入力ミス防止の上限（2026-07-04 蠣﨑さん確定）
  // 白仕上げ: (本体+横桟) 合計 × 1.15（1円未満切り捨て）。
  // 0.1 が二進で表せず 392,000×1.15 = 450,799.99… になるため百分率の整数で持つ。
  whiteRatePercent: 115,
  crossbar: {
    flat: { label: "6×25 フラットバー", unitPrice: 6000 },
    round: { label: "13φ 丸鋼", unitPrice: 4000 },
  } as Record<CrossbarMaterial, { label: string; unitPrice: number }>,
  maxCrossbars: 3,
  // ── 納期 ──
  // 大物のため既存商品の10営業日でなく15営業日（2026-07-04 蠣﨑さん確定）。特急なし。
  deliveryBusinessDays: 15,
  // ── 寸法 ──
  // 佐川急便の梱包上限（3,501mm 以上は要問合せ・lib/shipping/sagawa.ts）に合わせ、
  // 手摺の斜め全長がこれを超えたら自動見積もりを止めて「要問合せ」に切り替える
  // （2026-07-04 蠣﨑さん確定: 指示書の 4m 基準を配送実態に合わせ 3.5m に前倒し）。
  maxShipMm: 3500,
  defaults: { riserMm: 200, treadMm: 240, kekomiMm: 20, lastTreadMm: 240 },
  limits: {
    riser: { min: 50, max: 500 }, // 蹴上げ (mm)
    tread: { min: 100, max: 500 }, // 踏み面 (mm)
    kekomi: { min: 0, max: 100 }, // 蹴込み (mm)
    lastTread: { min: 0, max: 1500 }, // 最終段の踏み面＝壁までの寸法 (mm)
  },
} as const

export function clampSteps(n: number): number {
  const v = Math.round(Number(n) || LAURENT.minSteps)
  return Math.max(LAURENT.minSteps, Math.min(LAURENT.maxSteps, v))
}

export function clampRiser(n: number): number {
  const v = Math.round(Number(n) || LAURENT.defaults.riserMm)
  return Math.max(LAURENT.limits.riser.min, Math.min(LAURENT.limits.riser.max, v))
}

export function clampTread(n: number): number {
  const v = Math.round(Number(n) || LAURENT.defaults.treadMm)
  return Math.max(LAURENT.limits.tread.min, Math.min(LAURENT.limits.tread.max, v))
}

export function clampKekomi(n: number): number {
  const v = Math.round(Number(n) || 0)
  return Math.max(LAURENT.limits.kekomi.min, Math.min(LAURENT.limits.kekomi.max, v))
}

export function clampLastTread(n: number): number {
  const raw = Number(n)
  const v = Number.isFinite(raw) ? Math.round(raw) : LAURENT.defaults.lastTreadMm
  return Math.max(LAURENT.limits.lastTread.min, Math.min(LAURENT.limits.lastTread.max, v))
}

/** 柱の合計本数（1段目を1本目と換算し 5 段ごとに1本）。3〜5段=1本, 6〜10段=2本, ... */
export function calcPostCount(steps: number): number {
  return Math.max(1, Math.ceil(clampSteps(steps) / LAURENT.stepsPerPost))
}

export interface StairPriceInput {
  steps: number
  crossbarCount: number // 0〜3
  crossbarMaterial: CrossbarMaterial
  color: StairColor
}

export interface StairPriceResult {
  steps: number
  postCount: number // 柱の合計本数
  addPostCount: number // 追加柱の本数（= postCount - 1）
  body: number // 段数 × 25,000
  postAddon: number // 追加柱 × 15,000
  crossbarAddon: number // 横桟 本数 × 単価
  blackSubtotal: number // 黒仕上げでの合計（本体+柱+横桟）
  whiteSurcharge: number // 白仕上げ加算分（total - blackSubtotal）
  total: number // 税込合計
}

/**
 * 検算表（指示書 2-4・実装後に必ず一致確認）:
 * - 3段・黒・横桟なし          → ¥75,000
 * - 6段・黒・横桟なし          → ¥165,000
 * - 14段・黒・横桟なし         → ¥380,000
 * - 14段・黒・13φ×3本          → ¥392,000
 * - 14段・白・13φ×3本          → ¥450,800
 */
export function calcStairPrice(input: StairPriceInput): StairPriceResult {
  const steps = clampSteps(input.steps)
  const crossbarCount = Math.max(0, Math.min(LAURENT.maxCrossbars, Math.round(Number(input.crossbarCount) || 0)))
  const postCount = calcPostCount(steps)
  const addPostCount = postCount - 1
  const body = steps * LAURENT.pricePerStep
  const postAddon = addPostCount * LAURENT.postUnitPrice
  const crossbarAddon = crossbarCount * LAURENT.crossbar[input.crossbarMaterial].unitPrice
  const blackSubtotal = body + postAddon + crossbarAddon
  const total =
    input.color === "white" ? Math.floor((blackSubtotal * LAURENT.whiteRatePercent) / 100) : blackSubtotal
  return {
    steps,
    postCount,
    addPostCount,
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
): StairGeometry {
  const n = risersMm.length
  const totalRiseMm = risersMm.reduce((s, r) => s + r, 0)
  const runMm = Math.max(0, (n - 1) * (treadMm - kekomiMm)) + clampLastTread(lastTreadMm)
  const diagonalMm = Math.round(Math.hypot(totalRiseMm, runMm))
  return { totalRiseMm, runMm, diagonalMm, inquiry: diagonalMm > LAURENT.maxShipMm }
}

// ── 注文ボディの解析（カード決済・銀行振込のサーバ側で共用）──

export interface StairOrderParsed {
  steps: number
  risersMm: number[]
  treadMm: number
  kekomiMm: number
  lastTreadMm: number
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
export function parseStairOrderBody(body: Record<string, unknown>): StairOrderParseResult {
  const steps = clampSteps(Number(body?.steps))
  const riserMm = clampRiser(Number(body?.riserMm))
  const treadMm = clampTread(Number(body?.treadMm))
  const kekomiMm = clampKekomi(Number(body?.kekomiMm))
  const lastTreadMm = clampLastTread(Number(body?.lastTreadMm))

  // 段ごとの蹴上げ個別指定（省略時は一括値で埋める）
  const risersMm: number[] =
    Array.isArray(body?.risersMm) && (body.risersMm as unknown[]).length === steps
      ? (body.risersMm as unknown[]).map((v) => clampRiser(Number(v)))
      : Array(steps).fill(riserMm)

  const crossbarMaterial: CrossbarMaterial = body?.crossbarMaterial === "flat" ? "flat" : "round"
  const crossbarCount = Math.max(0, Math.min(LAURENT.maxCrossbars, Math.round(Number(body?.crossbarCount) || 0)))
  const color: StairColor = body?.color === "white" ? "white" : "black"

  const geometry = calcStairGeometry(risersMm, treadMm, kekomiMm, lastTreadMm)
  if (geometry.inquiry) {
    return {
      ok: false,
      inquiry: true,
      error:
        `手摺の全長が約${geometry.diagonalMm.toLocaleString()}mmとなり、3.5mを超えるためオンライン購入の対象外です。` +
        "配送方法の確認が必要なため、お問い合わせフォームからご相談ください。",
    }
  }

  const price = calcStairPrice({ steps, crossbarCount, crossbarMaterial, color })

  const uniformRiser = risersMm.every((r) => r === risersMm[0])
  const riserLabel = uniformRiser ? `蹴上げ${risersMm[0]}mm` : `蹴上げ段別指定（${risersMm.join("/")}mm）`
  const colorLabel = color === "white" ? "マットホワイト（+15%）" : "マットブラック"
  const crossbarLabel =
    crossbarCount > 0 ? `横桟${crossbarCount}本（${LAURENT.crossbar[crossbarMaterial].label}）` : "横桟なし"

  const productLabel = `${LAURENT.nameEn} ${LAURENT.nameJa} 階段手摺 ${steps}段（全長約${geometry.diagonalMm.toLocaleString()}mm）`
  const specParts = [
    `${steps}段・柱${price.postCount}本`,
    `${riserLabel} / 踏み面${treadMm}mm / 蹴込み${kekomiMm}mm / 最終段の踏み面${lastTreadMm}mm`,
    `高さ${geometry.totalRiseMm}mm × 総幅${geometry.runMm}mm`,
    crossbarLabel,
    colorLabel,
  ]

  const metadata: Record<string, string> = {
    product: LAURENT.slug,
    product_name: `${LAURENT.nameEn} ${LAURENT.nameJa}`,
    product_label: productLabel,
    spec_text: specParts.join(" / "),
    type: LAURENT.type,
    steps: String(steps),
    risers_mm: risersMm.join(","),
    tread_mm: String(treadMm),
    kekomi_mm: String(kekomiMm),
    last_tread_mm: String(lastTreadMm),
    crossbar_count: String(crossbarCount),
    ...(crossbarCount > 0 ? { crossbar_material: LAURENT.crossbar[crossbarMaterial].label } : {}),
    color: colorLabel,
    delivery_label: `通常配送（${LAURENT.deliveryBusinessDays}営業日）`,
    diagonal_mm: String(geometry.diagonalMm),
    // 既存 webhook (parseLengthsMeta) 互換: 発送サイズの基準になる斜め全長を長さとして記録
    length_mm: String(geometry.diagonalMm),
    lengths_mm: String(geometry.diagonalMm),
    quantity: "1",
  }

  return {
    ok: true,
    order: {
      steps,
      risersMm,
      treadMm,
      kekomiMm,
      lastTreadMm,
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
