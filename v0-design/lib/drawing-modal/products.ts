// 制作図モーダル用 商品マスター
// 既存 item/*.html の制作図タイトルブロックの値を集約

import type { ZakinRule } from "./rene-constants"

export type RailShape =
  | {
      // 丸パイプ (例: STKM φ25.4)
      type: "round"
      diameter: number // mm
      totalProjection: number // mm, 壁〜パイプ外端までの総距離 (= 40 + diameter)
    }
  | {
      // フラットバー (例: ss400 FB 9×32)
      type: "flat"
      width: number // mm, 壁面に平行な幅 (32)
      height: number // mm, 厚み (9)
      totalProjection: number // mm, 壁〜FB外端 (= 40 + width/2)
    }

export type RailCategory = "horizontal" | "vertical" | "fixed"
// "fixed" = 固定長の装飾商品 (scroll/fabrice/tsuchime)
// 長さ調整不可・制作図モーダルなし

export interface DrawingProductConfig {
  slug: string
  nameJa: string // 「René 横型手すり」など
  drawingCode: string // 図番プレフィックス "IW-REN"
  material: string
  finish: string
  category: RailCategory
  shape?: RailShape // 横型のみ使用 (縦型はシンプル schematic)
  basePrice: number
  stdLengthMm: number
  maxMm: number
  includedZakin: number
  // 座金計算ルール。未指定なら横型の旧式ルール (端100mm・最大ピッチ850mm・L<=1050で2個)
  zakinRule?: ZakinRule
}

const ROUND_25_4: RailShape = {
  type: "round",
  diameter: 25.4,
  totalProjection: 65.4,
}

const FLAT_9x32: RailShape = {
  type: "flat",
  width: 32,
  height: 9,
  totalProjection: 56,
}

// 縦型用: 支柱なし、壁 → 座金プレート(4.5) → バー外径
const VERT_ROUND_25_4: RailShape = {
  type: "round",
  diameter: 25.4,
  totalProjection: 29.9, // 4.5 + 25.4
}

const VERT_ROUND_31_8: RailShape = {
  type: "round",
  diameter: 31.8,
  totalProjection: 36.3, // 4.5 + 31.8
}

export const DRAWING_PRODUCTS: Record<string, DrawingProductConfig> = {
  rene: {
    slug: "rene",
    nameJa: "René 横型手すり",
    drawingCode: "IW-REN",
    material: "STKM φ25.4",
    finish: "2液型ウレタン マットブラック",
    category: "horizontal",
    shape: ROUND_25_4,
    basePrice: 36500,
    stdLengthMm: 1500,
    maxMm: 5000,
    includedZakin: 3,
  },
  claire: {
    slug: "claire",
    nameJa: "Claire 横型手すり",
    drawingCode: "IW-CLA",
    material: "STKM φ25.4",
    finish: "マットブラック",
    category: "horizontal",
    shape: ROUND_25_4,
    basePrice: 42000,
    stdLengthMm: 1500,
    maxMm: 5000,
    includedZakin: 3,
  },
  marcel: {
    slug: "marcel",
    nameJa: "Marcel 横型手すり",
    drawingCode: "IW-MAR",
    material: "ss400 FB 9×32",
    finish: "マットブラック",
    category: "horizontal",
    shape: FLAT_9x32,
    basePrice: 36000,
    stdLengthMm: 1500,
    maxMm: 5000,
    includedZakin: 3,
  },
  emile: {
    slug: "emile",
    nameJa: "Émile 横型手すり",
    drawingCode: "IW-EMI",
    material: "ss400 FB 9×32",
    finish: "鎚目仕上げ 銀古美",
    category: "horizontal",
    shape: FLAT_9x32,
    basePrice: 45800,
    stdLengthMm: 1500,
    maxMm: 5000,
    includedZakin: 3,
  },
}

// 縦型商品 (シンプル schematic - shape 不要)
// 縦型 Claude / Catherine 共通の座金ルール
// - 基本 2 個固定 (カスタムで中央追加可)、最大ピッチ 900mm
// - 端距離 = max(50, L × 0.1, (L − 900) / 2)
//   ・短尺時 (L ≤ 1000): L × 0.1 が支配 (L=1000 で端100/ピッチ800)
//   ・長尺時 (L ≥ 1125): (L − 900) / 2 が支配 (最大ピッチ 900 を保つ)
// - 長さ 500〜1500mm
const VERTICAL_STANDARD_RULE: ZakinRule = {
  defaultCount: 2,
  endMinMm: 50,
  endRatioOfLen: 0.1,
  maxSpanMm: 900,
  minLengthMm: 500,
  maxLengthMm: 1500,
}

DRAWING_PRODUCTS.claude = {
  slug: "claude",
  nameJa: "Claude 縦型手すり",
  drawingCode: "IW-CLD",
  material: "SS400 STKM 25.4φ",
  finish: "マットブラック",
  category: "vertical",
  shape: VERT_ROUND_25_4,
  basePrice: 30000,
  stdLengthMm: 1000,
  maxMm: 1500,
  includedZakin: 3,
  zakinRule: VERTICAL_STANDARD_RULE,
}

DRAWING_PRODUCTS.catherine = {
  slug: "catherine",
  nameJa: "Catherine 縦型手すり",
  drawingCode: "IW-CAT",
  material: "SS400 STKM 25.4φ",
  finish: "マットホワイト",
  category: "vertical",
  shape: VERT_ROUND_25_4,
  basePrice: 34500,
  stdLengthMm: 1000,
  maxMm: 1500,
  includedZakin: 3,
  zakinRule: VERTICAL_STANDARD_RULE,
}

DRAWING_PRODUCTS.alexandre = {
  slug: "alexandre",
  nameJa: "Alexandre 縦型手すり",
  drawingCode: "IW-ALX",
  material: "SS400 STKM 31.8φ",
  finish: "マットブラック",
  category: "vertical",
  shape: VERT_ROUND_31_8,
  basePrice: 32000,
  stdLengthMm: 1000,
  maxMm: 3000,
  includedZakin: 3,
}

DRAWING_PRODUCTS.antoine = {
  slug: "antoine",
  nameJa: "Antoine 縦型ロング手すり",
  drawingCode: "IW-ANT",
  material: "SS400 STKM 25.4φ",
  finish: "マットブラック",
  category: "vertical",
  shape: VERT_ROUND_25_4,
  basePrice: 56000,
  stdLengthMm: 2500,
  maxMm: 3000,
  includedZakin: 4,
  // 基本 2 個固定、最大ピッチ 1200mm、端最小 250mm、長さ 1500〜3000mm
  zakinRule: {
    defaultCount: 2,
    endMinMm: 250,
    maxSpanMm: 1200,
    minLengthMm: 1500,
    maxLengthMm: 3000,
  },
}

// 固定長装飾商品 (scroll/fabrice/tsuchime) - 制作図モーダル非対応
DRAWING_PRODUCTS.scroll16 = {
  slug: "scroll16",
  nameJa: "Scroll 16φ",
  drawingCode: "IW-SC16",
  material: "無垢鉄 16φ",
  finish: "ミツロウ仕上げ",
  category: "fixed",
  basePrice: 18000,
  stdLengthMm: 700,
  maxMm: 700,
  includedZakin: 2,
}

DRAWING_PRODUCTS.scroll19 = {
  slug: "scroll19",
  nameJa: "Scroll 19φ",
  drawingCode: "IW-SC19",
  material: "無垢鉄 19φ",
  finish: "ミツロウ仕上げ",
  category: "fixed",
  basePrice: 32000,
  stdLengthMm: 700,
  maxMm: 700,
  includedZakin: 2,
}

DRAWING_PRODUCTS.scroll22 = {
  slug: "scroll22",
  nameJa: "Scroll 22φ",
  drawingCode: "IW-SC22",
  material: "無垢鉄 22φ",
  finish: "ミツロウ仕上げ",
  category: "fixed",
  basePrice: 60000,
  stdLengthMm: 800,
  maxMm: 800,
  includedZakin: 2,
}

DRAWING_PRODUCTS.fabrice = {
  slug: "fabrice",
  nameJa: "Fabrice 無垢鉄手すり",
  drawingCode: "IW-FAB",
  material: "純無垢鉄",
  finish: "ミツロウ仕上げ",
  category: "fixed",
  basePrice: 100000,
  stdLengthMm: 800,
  maxMm: 800,
  includedZakin: 2,
}

DRAWING_PRODUCTS.tsuchime = {
  slug: "tsuchime",
  nameJa: "鎚目 TSUCHIME",
  drawingCode: "IW-TCH",
  material: "純無垢鉄",
  finish: "手打ち鎚目仕上げ",
  category: "fixed",
  basePrice: 70000,
  stdLengthMm: 800,
  maxMm: 800,
  includedZakin: 2,
}

export function getDrawingProduct(slug: string): DrawingProductConfig | null {
  return DRAWING_PRODUCTS[slug] ?? null
}
