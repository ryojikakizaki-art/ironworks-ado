/**
 * 手すり注文の価格・座金計算（サーバ側の正本）。
 *
 * カード決済 `app/api/checkout/route.ts` と銀行振込 `app/api/bank-order/route.ts`
 * の双方がこのモジュールを参照する。過去に /trade の参考見積もりが checkout と
 * 別ロジックを持っていて価格がズレた事故（PR #347）があったため、価格計算は
 * 必ずこの 1 箇所に集約し、複製しないこと。
 *
 * ※ 元は checkout/route.ts 内に直書きされていたものを、銀行振込フロー追加に
 *    あたり verbatim で切り出した（挙動は変えていない）。
 */

import {
  RENE_PRICE_TABLE,
  CLAIRE_PRICE_TABLE,
  MARCEL_PRICE_TABLE,
  EMILE_PRICE_TABLE,
  lookupPriceFromTable,
  type PricePoint,
} from '@/lib/drawing-modal/products';

// ── 商品マスター（stdLengthMm: 基本料金に含まれる長さ, maxMm: 最大長さ）──
// 座金計算ルール (縦型は product 固有、横型は未指定=旧式)
export interface ZakinRule {
  defaultCount?: number;
  endMinMm: number;
  maxSpanMm: number;
  minLengthMm?: number;
  addWasherAboveMm?: number;
}
export interface Product {
  name: string;
  type: string;
  basePrice: number;
  stdLengthMm: number;
  maxMm: number;
  finish: string;
  includedZakin: number;
  zakinRule?: ZakinRule;
  pricePerMm?: number; // 商品別オーバーライド (未指定なら全商品共通 25)
  priceTable?: PricePoint[]; // 長さ別固定価格テーブル (横型 4 商品)
}

const VERTICAL_STANDARD_RULE: ZakinRule = {
  defaultCount: 2, endMinMm: 50, maxSpanMm: 900, minLengthMm: 500,
};
const ANTOINE_RULE: ZakinRule = {
  defaultCount: 2, endMinMm: 250, maxSpanMm: 1450, minLengthMm: 1500,
  // L>2400 で座金 3 個に切替 (中央追加)
  addWasherAboveMm: 2400,
};
// Alexandre (31.8φ 太径) — 500〜3000mm フルレンジ、L>=2500 で 3 個に切替
const ALEXANDRE_RULE: ZakinRule = {
  defaultCount: 2, endMinMm: 50, maxSpanMm: 1500, minLengthMm: 500,
  addWasherAboveMm: 2499,
};

export const PRODUCTS: Record<string, Product> = {
  rene:       { name: 'René ルネ',               type: '横型', basePrice: 36500, stdLengthMm: 1500, maxMm: 5000, finish: 'マットブラック', includedZakin: 3, priceTable: RENE_PRICE_TABLE },
  claire:     { name: 'Claire クレール',          type: '横型', basePrice: 42000, stdLengthMm: 1500, maxMm: 5000, finish: 'マットホワイト', includedZakin: 3, priceTable: CLAIRE_PRICE_TABLE },
  emile:      { name: 'Émile エミール',           type: '横型', basePrice: 45800, stdLengthMm: 1500, maxMm: 5000, finish: '鎚目仕上げ 銀古美', includedZakin: 3, priceTable: EMILE_PRICE_TABLE },
  marcel:     { name: 'Marcel マルセル',          type: '横型', basePrice: 36000, stdLengthMm: 1500, maxMm: 5000, finish: 'マットブラック', includedZakin: 3, priceTable: MARCEL_PRICE_TABLE },
  alexandre:  { name: 'Alexandre アレクサンドル', type: '縦型', basePrice: 32000, stdLengthMm: 1000, maxMm: 3000, finish: 'マットブラック', includedZakin: 3, zakinRule: ALEXANDRE_RULE, pricePerMm: 30 },
  catherine:  { name: 'Catherine カトリーヌ',     type: '縦型', basePrice: 34500, stdLengthMm: 1000, maxMm: 1500, finish: 'マットホワイト', includedZakin: 3, zakinRule: VERTICAL_STANDARD_RULE },
  claude:     { name: 'Claude クロード',          type: '縦型', basePrice: 30000, stdLengthMm: 1000, maxMm: 1500, finish: 'マットブラック', includedZakin: 3, zakinRule: VERTICAL_STANDARD_RULE },
  antoine:    { name: 'Antoine アントワーヌ',      type: '縦型ロング', basePrice: 45000, stdLengthMm: 1500, maxMm: 3000, finish: 'マットブラック', includedZakin: 4, zakinRule: ANTOINE_RULE, pricePerMm: 30 },
  scroll16:   { name: 'Scroll スクロール 16φ',    type: '縦型', basePrice: 18000, stdLengthMm: 700,  maxMm: 700,  finish: 'ミツロウ仕上げ', includedZakin: 2 },
  scroll19:   { name: 'Scroll スクロール 19φ',    type: '縦型', basePrice: 32000, stdLengthMm: 700,  maxMm: 700,  finish: 'ミツロウ仕上げ', includedZakin: 2 },
  scroll22:   { name: 'Scroll スクロール 22φ',    type: '縦型', basePrice: 60000, stdLengthMm: 800,  maxMm: 800,  finish: 'ミツロウ仕上げ', includedZakin: 2 },
  fabrice:    { name: 'Fabrice ファブリス',        type: '縦型', basePrice: 100000, stdLengthMm: 800, maxMm: 800,  finish: '無垢鉄 火造り鍛造', includedZakin: 2 },
  tsuchime:   { name: '鎚目 TSUCHIME',            type: '縦型', basePrice: 70000, stdLengthMm: 800,  maxMm: 800,  finish: '手打ち鎚目仕上げ', includedZakin: 2 },
};

// ── 共通価格パラメータ（mm単位）──
export const PRICE_PER_MM    = 25;
export const ZAKIN_PRICE     = 3500;
export const ANGLE_PRICE     = 2000;
export const END_DIST_MM     = 100;
export const MAX_SPAN_MM     = 850;
export const SURGE_START_MM  = 2000;
export const SURGE_BASE      = 1.2;
export const SURGE_INTERVAL_MM = 500;
export const RUSH_RATE       = 0.2;

export function calcZakin(L_mm: number, rule?: ZakinRule): number {
  if (rule?.defaultCount !== undefined) {
    let count = rule.defaultCount;
    if (rule.addWasherAboveMm !== undefined && L_mm > rule.addWasherAboveMm) {
      count += 1;
    }
    return count;
  }
  if (L_mm <= 1050) return 2;
  const end = rule?.endMinMm ?? END_DIST_MM;
  const span = rule?.maxSpanMm ?? MAX_SPAN_MM;
  const inner = L_mm - 2 * end;
  return 1 + Math.ceil(inner / span);
}

export function calcPrice(
  L_mm: number,
  prod: Product,
  opts?: { zakinCount?: number; angleDeg?: number }
) {
  // 価格テーブル指定商品 (René/Claire/Marcel/Émile) はテーブル参照、それ以外は式計算。
  let addon: number;
  let surcharge: number;
  if (prod.priceTable) {
    const tablePrice = lookupPriceFromTable(L_mm, prod.priceTable);
    addon = tablePrice - prod.basePrice;
    surcharge = 0;
  } else {
    const pricePerMm = prod.pricePerMm ?? PRICE_PER_MM;
    addon = Math.max(0, L_mm - prod.stdLengthMm) * pricePerMm;
    const longM = L_mm > SURGE_START_MM
                ? Math.pow(SURGE_BASE, (L_mm - SURGE_START_MM) / SURGE_INTERVAL_MM)
                : 1;
    surcharge = L_mm > SURGE_START_MM ? addon * (longM - 1) : 0;
  }
  const autoZakin = calcZakin(L_mm, prod.zakinRule);
  // お客様が座金本数をカスタムした場合はその本数を使う (商品ページ calculatePrice と一致させる)。
  const zakin = opts?.zakinCount && opts.zakinCount > 0 ? opts.zakinCount : autoZakin;
  // 価格テーブル指定商品はテーブルに標準座金本数が含まれる → auto を超えた追加分のみ加算。
  // 式計算商品は INCLUDED_ZAKIN を超えた本数を加算 (従来通り)。
  const addZakin = prod.priceTable
    ? Math.max(0, zakin - autoZakin) * ZAKIN_PRICE
    : Math.max(0, zakin - prod.includedZakin) * ZAKIN_PRICE;
  // 角度加工料金: 座金1箇所あたり ANGLE_PRICE (単品・横型のみ。商品ページ準拠)。
  const angleCost = opts?.angleDeg && opts.angleDeg > 0 ? zakin * ANGLE_PRICE : 0;
  const total    = prod.basePrice + addon + addZakin + surcharge + angleCost;
  return { addon, surcharge, addZakin, angleCost, zakin, total };
}
