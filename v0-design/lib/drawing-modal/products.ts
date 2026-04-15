// 制作図モーダル用 商品マスター
// 既存 item/*.html の制作図タイトルブロックの値を集約

export type RailType = "round" | "flat"

export interface DrawingProductConfig {
  slug: string
  nameJa: string // 「René 横型手すり」など
  drawingCode: string // 図番プレフィックス "IW-REN"
  material: string
  finish: string
  railType: RailType
  basePrice: number
  stdLengthMm: number
  maxMm: number
  includedZakin: number
}

export const DRAWING_PRODUCTS: Record<string, DrawingProductConfig> = {
  rene: {
    slug: "rene",
    nameJa: "René 横型手すり",
    drawingCode: "IW-REN",
    material: "STKM φ25.4",
    finish: "マットブラック",
    railType: "round",
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
    railType: "round",
    basePrice: 42000,
    stdLengthMm: 1500,
    maxMm: 5000,
    includedZakin: 3,
  },
}

export function getDrawingProduct(slug: string): DrawingProductConfig | null {
  return DRAWING_PRODUCTS[slug] ?? null
}
