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
// 支柱は座金A と同じ 9φ が既定。太い商品だけ商品側の washerPostDiameter で 13φ に上書きする。
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

// 座金の支柱径 (mm)。既定は座金A・B とも 9φ で、
// 商品の washerPostDiameter に指定があるタイプだけその値を使う。
export function getWasherPostDiameter(
  product: Pick<DrawingProductConfig, "washerPostDiameter">,
  washerType: WasherTypeId
): number {
  return product.washerPostDiameter?.[washerType] ?? getWasherSpec(washerType).postDiameter
}

// CAD精密図のタイトルブロック (縦型で使用)
export interface TitleBlockSpec {
  productName: string // "Claude"
  color: string // "マットブラック"
  material: string // "stkm25.4 t2.3"
}

// 長さ別固定価格テーブル。指定された商品は (basePrice + addon + surcharge) ではなく
// テーブル内挿で本体価格を決める (STORES era 方式)。標準座金本数は含む価格。
// 中間長は隣接2点間で線形補間。表外 (>最終 mm) は最終値で頭打ち。
export interface PricePoint {
  mm: number
  price: number
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
  // 長さ別固定価格テーブル。指定すると addon/surcharge の式計算をスキップしテーブル参照に。
  priceTable?: PricePoint[]
  // 白仕上げの選択を許可する商品のみ true（2026-07-05 Alexandre 追加。合計 +15%）。
  colorOptions?: boolean
  // false の商品は座金の位置・角度をお客様が指定できない（未指定=true=従来通り指定可）。
  // Gaston（極太32φ）専用: 商品ページの編集 UI を非表示にする（2026-08-02 蠣﨑さん指定）。
  zakinCustomizable?: boolean
  // true の商品は 2.5m 以上でジョイント代を自動加算する（Gaston 専用）。
  jointFeeEnabled?: boolean
  // false の商品は座金タイプ A/B の選択欄を出さない（washerSpec のタイプで固定）。
  // 鎚目は φ25×60mm の座金B のみで製作するため false（2026-08-17 蠣﨑さん指定）。
  washerTypeSelectable?: boolean
  // 座金の本数上限。未指定なら縦型3・横型20（従来通り）。
  // 鎚目は 2 本のみで製作するため 2（2026-08-17 蠣﨑さん指定）。
  maxZakinCount?: number
  // 座金支柱径 mm の商品別上書き。指定の無いタイプは既定の 9φ。
  //   Antoine … 座金A・B とも 13φ（2026-09-06 蠣﨑さん指示）
  //   Alexandre(31.8φ) / 鎚目(FB32×12) … 座金B のみ 13φ
  washerPostDiameter?: Partial<Record<WasherTypeId, number>>
  // 座金ガイドの説明写真。未指定なら共通の黒い手すりの写真。
  // 白仕上げの商品で写真の色を商品に合わせたいときだけ指定する（2026-08-28 Catherine から）。
  zakinGuidePhoto?: string
}

// 長さ L_mm に対する本体価格をテーブルから線形補間で取得。
// L が範囲外なら最近端の値を返す (extrapolate しない)。
export function lookupPriceFromTable(L_mm: number, table: PricePoint[]): number {
  if (table.length === 0) return 0
  const sorted = [...table].sort((a, b) => a.mm - b.mm)
  if (L_mm <= sorted[0].mm) return sorted[0].price
  if (L_mm >= sorted[sorted.length - 1].mm) return sorted[sorted.length - 1].price
  for (let i = 1; i < sorted.length; i++) {
    if (L_mm <= sorted[i].mm) {
      const lo = sorted[i - 1]
      const hi = sorted[i]
      const t = (L_mm - lo.mm) / (hi.mm - lo.mm)
      return Math.round(lo.price + t * (hi.price - lo.price))
    }
  }
  return sorted[sorted.length - 1].price
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

const ROUND_32: RailShape = {
  type: "round",
  diameter: 32,
  totalProjection: 72,
}

// 横型 4 商品の長さ別価格テーブル (2026-05-18 改定・STORES era 方式復活)。
// 旧 ado サイトは「basePrice + 25円/mm + 2m超で指数サーチャージ」の式計算で
// 長尺になるほど価格が急騰していた (例: René 5m ≒ ¥31.2 万円)。
// 旧 STORES の段階式テーブルに近い価格に戻し、お客様に予測可能な価格を提示する。
// 標準座金本数 (includedZakin=3) は含む。カスタム座金追加分は別途加算。
export const RENE_PRICE_TABLE: PricePoint[] = [
  { mm: 1500, price: 36500 },
  { mm: 2000, price: 50000 },
  { mm: 2500, price: 60000 },
  { mm: 3000, price: 75000 },
  { mm: 3500, price: 88000 },
  { mm: 4000, price: 102000 },
  { mm: 4500, price: 118000 },
  { mm: 5000, price: 135000 },
]

export const CLAIRE_PRICE_TABLE: PricePoint[] = [
  { mm: 1500, price: 42000 },
  { mm: 2000, price: 55000 },
  { mm: 2500, price: 65000 },
  { mm: 3000, price: 82000 },
  { mm: 3500, price: 95000 },
  { mm: 4000, price: 110000 },
  { mm: 4500, price: 127000 },
  { mm: 5000, price: 145000 },
]

export const MARCEL_PRICE_TABLE: PricePoint[] = [
  { mm: 1500, price: 36000 },
  { mm: 2000, price: 50000 },
  { mm: 2500, price: 60000 },
  { mm: 3000, price: 75000 },
  { mm: 3500, price: 88000 },
  { mm: 4000, price: 102000 },
  { mm: 4500, price: 118000 },
  { mm: 5000, price: 135000 },
]

export const EMILE_PRICE_TABLE: PricePoint[] = [
  { mm: 1500, price: 45800 },
  { mm: 2000, price: 58000 },
  { mm: 2500, price: 73000 },
  { mm: 3000, price: 92000 },
  { mm: 3500, price: 122000 },
  { mm: 4000, price: 150000 },
  { mm: 4500, price: 178000 },
  { mm: 5000, price: 210000 },
]

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
    priceTable: RENE_PRICE_TABLE,
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
    priceTable: CLAIRE_PRICE_TABLE,
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
    priceTable: MARCEL_PRICE_TABLE,
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
    priceTable: EMILE_PRICE_TABLE,
  },
  gaston: {
    slug: "gaston",
    nameJa: "Gaston 横型手すり",
    drawingCode: "IW-GAS",
    material: "無垢丸鉄 32φ",
    finish: "ハンマー鍛造 鎚目仕上げ",
    category: "horizontal",
    shape: ROUND_32,
    basePrice: 150000,
    stdLengthMm: 1500,
    maxMm: 5000,
    includedZakin: 2,
    // 極太32φは他の横型4商品（端100mm・最大ピッチ850mm）より座金間隔を広く取れる
    // （2026-08-02 蠣﨑さん指定: 端250mmスタート・最大ピッチ1000mm）
    zakinRule: { endMinMm: 250, maxSpanMm: 1000 },
    // 1500mm ¥150,000 / 3500mm ¥400,000（2026-08-02 蠣﨑さん指定・当初3000mm案は
    // 高すぎるとの指摘で3500mmに変更）になるよう逆算した加算単価。3500mm では
    // 自動座金4本（込み2本超過分 ¥7,000）＋2m超サーチャージ(1.2^((L-2000)/500))を
    // 含めてちょうど ¥400,000 になる値。
    pricePerMm: 70.3125,
    // 極太32φは現場での取り付け精度確保のため座金位置・角度の編集を不可にする
    // （2026-08-02 蠣﨑さん指定）
    zakinCustomizable: false,
    // 2.5m以上はジョイント代を自動加算（詳細は order-pricing.ts の
    // calcGastonJointCount / GASTON_JOINT_FEE_PER_UNIT を参照）
    jointFeeEnabled: true,
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
  zakinGuidePhoto: "/images/zakin-diagram-black.jpg",
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
  zakinGuidePhoto: "/images/zakin-diagram-white.jpg",
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
  washerSpec: WASHER_SPEC_A,
  titleBlock: {
    productName: "Catherine",
    color: "マットホワイト",
    material: "stkm25.4 t2.3",
  },
}

// Alexandre (太径 31.8φ) 座金ルール:
// - 常に 2 点が基本 (サムネイル・商品写真と同じ見え方に揃える)。3 点は任意選択。
// - 端距離は段階式 (endSteps) で長さ帯ごとに固定値
// - 最大ピッチ 1500mm（超える長さでは 3 点を「おすすめ」として案内するだけ）
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
    [2500, 450],  // 2500〜3000
  ],
  maxSpanMm: 1500,
  minLengthMm: 500,
  maxLengthMm: 3000,
  // 2026-09-03 蠣﨑さん指定: 2500mm 以上の自動 3 点化を廃止し、常に 2 点を基本とする
  // (Antoine と同じ理由 — サムネイルが 2 点留めで勘違いされやすかった)。
  // 端距離が段階式のため座金間が 1500mm を超える長さ帯は飛び飛び
  // (2101〜2199 は超過・2200〜2300 は適正・2301 以降は超過) になる。
  // 長さのしきい値では正しく表せないので、実際の間隔で判定する。
  recommendExtraOverSpan: true,
}

DRAWING_PRODUCTS.alexandre = {
  slug: "alexandre",
  zakinGuidePhoto: "/images/zakin-diagram-black.jpg",
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
  washerPostDiameter: { B: 13 }, // 31.8φ の太径バーに合わせ座金Bの支柱のみ 13φ（座金A は 9φ）
  colorOptions: true, // 白仕上げ選択可（2026-07-05 追加・合計+15%）
  titleBlock: {
    productName: "Alexandre",
    color: "マットブラック",
    material: "stkm31.8 t2.3",
  },
}

DRAWING_PRODUCTS.antoine = {
  slug: "antoine",
  zakinGuidePhoto: "/images/zakin-diagram-black.jpg",
  nameJa: "Antoine 縦型ロング手すり",
  drawingCode: "IW-ANT",
  material: "STKM 25.4φ",
  finish: "マットブラック",
  category: "vertical",
  // 1500mm ¥56,000 → 2000mm ¥71,000 → 3000mm 約¥120,800 (長尺割増適用)
  // カタログ・Merchant フィードの ¥56,000〜 と統一（2026-06-12 蠣﨑さん判断）
  basePrice: 56000,
  stdLengthMm: 1500,
  maxMm: 3000,
  includedZakin: 4,
  pricePerMm: 30, // Claude(t2.3)より厚い素材(t3.2)のため割増レート
  // 座金ルール:
  // - 常に 2 点が基本 (サムネイル・写真と同じ見え方に揃える)。3 点は任意選択。
  // - 端距離: anchors [1500→250, 2000→350, 2400→475] で線形補間、上限 475mm
  // - 最大ピッチ 1450mm（超える長さでは 3 点を「おすすめ」として案内するだけ）
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
    // 2026-09-03 蠣﨑さん指定: 2400 超で自動 3 点にするのをやめ、2 点のまま座金間を広く取る。
    // 端 475mm 固定のため 2500mm→座金間 1550mm / 3000mm→2050mm と自然に広がる。
    // 3 点は「おすすめ」として案内し、お客様がワンタップで選べるようにする。
    // (座金間が 1450mm を超える = L>2400 のときだけ案内。従来のしきい値指定と結果は同一)
    recommendExtraOverSpan: true,
  },
  // Claude 同様の CAD 精密図を有効化 (座金A 標準)
  washerSpec: WASHER_SPEC_A,
  // 支柱は座金A・B どちらを選んでも 13φ（2026-09-06 蠣﨑さん指示）。
  // t3.2 の厚肉バーのため Claude/Catherine (9φ) より太い支柱で製作する。
  washerPostDiameter: { A: 13, B: 13 },
  colorOptions: true, // 白仕上げ選択可（2026-07-08 追加・合計+15%）
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

// 鎚目: 全長を手打ちするため長さに比例して手間が増える。Claude と同じ縦型可変長だが、
// 「std まで一律 + 超過分 pricePerMm」ではなく priceTable の線形補間で価格を出す。
// アンカーは 600mm=¥60,000 / 1500mm=¥130,000（2026-08-16 蠣﨑さん指定）。
// 100mm 刻みですべて千円単位の丸い数字になるよう、1mm 単価を 100→90→80→70 円と
// 段階的に逓減させている。中間長は隣接2点の線形補間なので端数は出るが、
// 100mm 刻みで選ぶ限り必ず丸い金額になる。
export const TSUCHIME_PRICE_TABLE: PricePoint[] = [
  { mm: 500, price: 50000 },
  { mm: 600, price: 60000 },
  { mm: 700, price: 69000 },
  { mm: 800, price: 78000 },
  { mm: 900, price: 86000 },
  { mm: 1000, price: 94000 },
  { mm: 1100, price: 102000 },
  { mm: 1200, price: 109000 },
  { mm: 1300, price: 116000 },
  { mm: 1400, price: 123000 },
  { mm: 1500, price: 130000 },
]

DRAWING_PRODUCTS.tsuchime = {
  slug: "tsuchime",
  nameJa: "鎚目 TSUCHIME",
  drawingCode: "IW-TCH",
  material: "純無垢鉄",
  finish: "手打ち鎚目仕上げ",
  category: "vertical",
  basePrice: 50000,
  stdLengthMm: 500,
  maxMm: 1500,
  includedZakin: 2,
  zakinRule: VERTICAL_STANDARD_RULE,
  priceTable: TSUCHIME_PRICE_TABLE,
  // 仕様書の「ブラケット座金 φ25×60mm」に合わせて座金Bで固定（支柱13φ）。
  // washerSpec を持つ縦型商品は簡易 schematic ではなく CAD 精密図で制作図を描く。
  washerSpec: WASHER_SPEC_B,
  washerPostDiameter: { B: 13 }, // 仕様書どおり支柱 13φ（FB32×12 の太いバー）
  washerTypeSelectable: false,
  maxZakinCount: 2,
  titleBlock: {
    productName: "TSUCHIME",
    color: "マットブラック",
    material: "無垢鉄 FB32×12",
  },
}

// European: L600〜800mmの範囲内は一律料金（範囲外は別途相談）。
// 2点とも同額の priceTable にすることで、範囲内のどの長さでも lookupPriceFromTable が
// 常に同じ価格を返す（線形補間の性質を利用したフラット価格の実現）。
export const EUROPEAN_PRICE_TABLE: PricePoint[] = [
  { mm: 600, price: 110000 },
  { mm: 800, price: 110000 },
]

DRAWING_PRODUCTS.european = {
  slug: "european",
  nameJa: "European ヨーロピアン",
  drawingCode: "IW-EUR",
  material: "無垢丸鉄 22φ",
  finish: "ハンマー鍛造仕上げ（ブラック）",
  category: "fixed",
  basePrice: 110000,
  stdLengthMm: 600,
  maxMm: 800,
  includedZakin: 2,
  // defaultCount 固定のため座金本数は常に2（自動加算なし）。minLengthMm で長さ入力の下限を600mmに。
  zakinRule: { defaultCount: 2, endMinMm: 50, maxSpanMm: 900, minLengthMm: 600 },
  priceTable: EUROPEAN_PRICE_TABLE,
}

export function getDrawingProduct(slug: string): DrawingProductConfig | null {
  return DRAWING_PRODUCTS[slug] ?? null
}
