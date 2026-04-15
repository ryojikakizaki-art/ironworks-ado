// 制作図モーダル用 商品マスター
// 既存 item/*.html の制作図タイトルブロックの値を集約

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
DRAWING_PRODUCTS.claude = {
  slug: "claude",
  nameJa: "Claude 縦型手すり",
  drawingCode: "IW-CLD",
  material: "SS400 STKM 25.4φ",
  finish: "マットブラック",
  category: "vertical",
  basePrice: 30000,
  stdLengthMm: 1000,
  maxMm: 3000,
  includedZakin: 3,
}

DRAWING_PRODUCTS.catherine = {
  slug: "catherine",
  nameJa: "Catherine 縦型手すり",
  drawingCode: "IW-CAT",
  material: "SS400 STKM 25.4φ",
  finish: "マットホワイト",
  category: "vertical",
  basePrice: 34500,
  stdLengthMm: 1000,
  maxMm: 3000,
  includedZakin: 3,
}

DRAWING_PRODUCTS.alexandre = {
  slug: "alexandre",
  nameJa: "Alexandre 縦型手すり",
  drawingCode: "IW-ALX",
  material: "SS400 STKM 31.8φ",
  finish: "マットブラック",
  category: "vertical",
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
  basePrice: 56000,
  stdLengthMm: 2500,
  maxMm: 2500,
  includedZakin: 4,
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
