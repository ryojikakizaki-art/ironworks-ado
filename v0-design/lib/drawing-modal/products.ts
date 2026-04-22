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

// 座金タイプ ID (A=55×35 標準 / B=60×25 幅広)
export type WasherTypeId = "A" | "B"

// 座金詳細仕様 (縦型CAD精密図で詳細ビューに描画)
export interface WasherSpec {
  id: WasherTypeId
  label: string // "座金A" / "座金B"
  postDiameter: number // 支柱径 mm (例: 9)
  plateThickness: number // 座金板厚 mm (例: 4.5)
  plateWidth: number // 楕円長径 mm (A=55, B=60)
  plateHeight: number // 楕円短径 mm (A=35, B=25)
  holeSpacing: number // 段付き穴中心間距離 mm (例: 40)
  holeLabel: string // 穴ラベル (例: "4.5φ-7φ段付き穴")
  wallGap: number // 壁〜バー外端 mm (例: 40)
}

// 座金A: 標準 楕円 55×35mm
export const WASHER_SPEC_A: WasherSpec = {
  id: "A",
  label: "座金A",
  postDiameter: 9,
  plateThickness: 4.5,
  plateWidth: 55,
  plateHeight: 35,
  holeSpacing: 40,
  holeLabel: "4.5φ-7φ段付き穴",
  wallGap: 40,
}

// 座金B: 幅広薄型 楕円 60×25mm
export const WASHER_SPEC_B: WasherSpec = {
  id: "B",
  label: "座金B",
  postDiameter: 9,
  plateThickness: 4.5,
  plateWidth: 60,
  plateHeight: 25,
  holeSpacing: 40,
  holeLabel: "4.5φ-7φ段付き穴",
  wallGap: 40,
}

export function getWasherSpec(id: WasherTypeId): WasherSpec {
  return id === "B" ? WASHER_SPEC_B : WASHER_SPEC_A
}

// CAD精密図のタイトルブロック (縦型で使用)
export interface TitleBlockSpec {
  productName: string // "Claude"
  color: string // "マットブラック"
  material: string // "stkm25.4 t2.3"
}

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
  // 長さ追加料金 (円/mm)。未指定なら全商品共通 25 円/mm。Antoine は 19 円/mm
  pricePerMm?: number
  // 座金計算ルール。未指定なら横型の旧式ルール (端100mm・最大ピッチ850mm・L<=1050で2個)
  zakinRule?: ZakinRule
  // 縦型CAD精密図用 (未指定なら旧シンプル schematic にフォールバック)
  washerSpec?: WasherSpec
  titleBlock?: TitleBlockSpec
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
// 縦型 Claude / Catherine 共通の座金ルール
// - 基本 2 個固定 (カスタムで中央追加可)、最大ピッチ 900mm
// - 端距離 = max(50, L×0.1, (L−900)/2)
//   - L=600 → 端60/ピッチ480
//   - L=1000 → 端100/ピッチ800
//   - L=1200 → 端150/ピッチ900 (ピッチ上限)
//   - L=1500 → 端300/ピッチ900
// - 長さ 500〜1500mm
const VERTICAL_STANDARD_RULE: ZakinRule = {
  defaultCount: 2,
  endMinMm: 50,
  endProportion: 0.1,
  maxSpanMm: 900,
  minLengthMm: 500,
  maxLengthMm: 1500,
}

DRAWING_PRODUCTS.claude = {
  slug: "claude",
  nameJa: "Claude 縦型手すり",
  drawingCode: "IW-CLD",
  material: "STKM 25.4φ",
  finish: "マットブラック",
  category: "vertical",
  basePrice: 30000,
  stdLengthMm: 1000,
  maxMm: 1500,
  includedZakin: 3,
  zakinRule: VERTICAL_STANDARD_RULE,
  washerSpec: WASHER_SPEC_A,
  titleBlock: {
    productName: "Claude",
    color: "マットブラック",
    material: "stkm25.4 t2.3",
  },
}

DRAWING_PRODUCTS.catherine = {
  slug: "catherine",
  nameJa: "Catherine 縦型手すり",
  drawingCode: "IW-CAT",
  material: "STKM 25.4φ",
  finish: "マットホワイト",
  category: "vertical",
  basePrice: 34500,
  stdLengthMm: 1000,
  maxMm: 1500,
  includedZakin: 3,
  zakinRule: VERTICAL_STANDARD_RULE,
}

// Alexandre (太径 31.8φ) 座金ルール:
// - 基本 2 個、L>=2500 で 3 個 (中央追加)
// - 端距離は段階式 (endSteps) で長さ帯ごとに固定値
// - 最大ピッチ 1500mm
// - 長さ 500〜3000mm フルレンジ
const ALEXANDRE_RULE: ZakinRule = {
  defaultCount: 2,
  endMinMm: 50,
  endMaxMm: 450,
  endSteps: [
    [500,  50],   // 500〜999
    [1000, 100],  // 1000〜1199
    [1200, 130],  // 1200〜1399
    [1400, 150],  // 1400〜1499
    [1500, 175],  // 1500〜1599
    [1600, 200],  // 1600〜1699
    [1700, 225],  // 1700〜1799
    [1800, 250],  // 1800〜1899
    [1900, 275],  // 1900〜1999
    [2000, 300],  // 2000〜2199
    [2200, 350],  // 2200〜2299
    [2300, 400],  // 2300〜2499
    [2500, 450],  // 2500〜3000 (座金3点)
  ],
  maxSpanMm: 1500,
  minLengthMm: 500,
  maxLengthMm: 3000,
  addWasherAboveMm: 2499,
}

DRAWING_PRODUCTS.alexandre = {
  slug: "alexandre",
  nameJa: "Alexandre 縦型手すり",
  drawingCode: "IW-ALX",
  material: "STKM 31.8φ",
  finish: "マットブラック",
  category: "vertical",
  basePrice: 32000,
  stdLengthMm: 1000,
  maxMm: 3000,
  includedZakin: 3,
  pricePerMm: 30, // 31.8φ 太径は Antoine(t3.2) と同率
  zakinRule: ALEXANDRE_RULE,
  washerSpec: WASHER_SPEC_B, // 太径用に幅広薄型 60×25mm
  titleBlock: {
    productName: "Alexandre",
    color: "マットブラック",
    material: "stkm31.8 t2.3",
  },
}

DRAWING_PRODUCTS.antoine = {
  slug: "antoine",
  nameJa: "Antoine 縦型ロング手すり",
  drawingCode: "IW-ANT",
  material: "STKM 25.4φ",
  finish: "マットブラック",
  category: "vertical",
  // 1500mm ¥45,000 → 2000mm ¥60,000 (緩やか) → 3000mm 約¥86,000 (長尺割増適用)
  basePrice: 45000,
  stdLengthMm: 1500,
  maxMm: 3000,
  includedZakin: 4,
  pricePerMm: 30, // Claude(t2.3)より厚い素材(t3.2)のため割増レート
  // 座金ルール:
  // - 基本 2 個、L>2400 で 3 個 (中央追加)
  // - 端距離: anchors [1500→250, 2000→350, 2400→475] で線形補間、上限 475mm
  // - 最大ピッチ 1450mm
  zakinRule: {
    defaultCount: 2,
    endMinMm: 250,
    endMaxMm: 475,
    endAnchors: [
      [1500, 250],
      [2000, 350],
      [2400, 475],
    ],
    maxSpanMm: 1450,
    minLengthMm: 1500,
    maxLengthMm: 3000,
    addWasherAboveMm: 2400, // L>2400 で 3 個配置
  },
  // Claude 同様の CAD 精密図を有効化 (座金A 標準)
  washerSpec: WASHER_SPEC_A,
  titleBlock: {
    productName: "Antoine",
    color: "マットブラック",
    material: "stkm25.4 t3.2",
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
