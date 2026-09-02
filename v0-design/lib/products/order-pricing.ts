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
  EUROPEAN_PRICE_TABLE,
  TSUCHIME_PRICE_TABLE,
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
  /** 自動配置の座金間隔が maxSpanMm を超えるとき、座金 1 点追加を「おすすめ」として案内する
   *  (自動では増やさない)。価格計算には影響しない。
   *  UI 側の案内は components/drawing-modal/zakin-editor.tsx。 */
  recommendExtraOverSpan?: boolean;
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
  // 白仕上げの選択を許可する商品のみ true（2026-07-05 Alexandre 追加。合計 +15%）。
  // René/Claire・Claude/Catherine のような黒白別商品ではなく、1 ページ内トグルで色を選ぶ方式。
  colorOptions?: boolean;
  // false の商品は座金の位置・角度をお客様が指定できない（未指定=true=従来通り指定可）。
  // Gaston（極太32φ）専用: 現場での取り付け精度確保のため自動配置のみに固定
  // （2026-08-02 蠣﨑さん指定）。sanitizeCartItem 側で position/angle 申告を無視する。
  zakinCustomizable?: boolean;
  // true の商品は 2.5m 以上でジョイント代を自動加算する（Gaston 専用）。
  jointFeeEnabled?: boolean;
}

// Gaston専用: 極太32φは2.5m以上になると現場での取り付けが重すぎるため、分割
// ジョイントを推奨（必須・自動加算）。2500〜3999mm=1箇所・4000〜4999mm=2箇所。
// 5000mm（上限）はジョイント込みで現場条件の確認が要るため自動計算せず
// 要問い合わせとする（2026-08-02 蠣﨑さん指定）。
export const GASTON_JOINT_FEE_PER_UNIT = 20000;
export const GASTON_JOINT_INQUIRY_ABOVE_MM = 5000;
export function calcGastonJointCount(L_mm: number): number {
  if (L_mm >= GASTON_JOINT_INQUIRY_ABOVE_MM) return 0;
  if (L_mm >= 4000) return 2;
  if (L_mm >= 2500) return 1;
  return 0;
}
// Gaston専用: 極太32φは発送時に木枠梱包が必要なため、通常の送料計算に加えて
// 1本あたり定額で加算する（2026-08-02 蠣﨑さん指定）。
export const GASTON_CRATE_FEE_PER_UNIT = 10000;

// 白仕上げの割増率。0.1 が二進で正確に表せず 392,000×1.15 = 450,799.99… になる
// 浮動小数点の罠があるため、Laurent（stair-pricing.ts）と同じく百分率の整数で持つ。
export const WHITE_RATE_PERCENT = 115;

const VERTICAL_STANDARD_RULE: ZakinRule = {
  defaultCount: 2, endMinMm: 50, maxSpanMm: 900, minLengthMm: 500,
};
const ANTOINE_RULE: ZakinRule = {
  defaultCount: 2, endMinMm: 250, maxSpanMm: 1450, minLengthMm: 1500,
  // 2026-09-03: 2400 超の自動 3 点化を廃止し、常に 2 点を基本とする。
  // 3 点は商品ページで「おすすめ」案内 → お客様が任意で選ぶ (drawing-modal/products.ts と同期)。
  recommendExtraOverSpan: true,
};
// Alexandre (31.8φ 太径) — 500〜3000mm フルレンジ、常に 2 点が基本
const ALEXANDRE_RULE: ZakinRule = {
  defaultCount: 2, endMinMm: 50, maxSpanMm: 1500, minLengthMm: 500,
  // 2026-09-03: 2500mm 以上の自動 3 点化を廃止 (drawing-modal/products.ts と同期)。
  recommendExtraOverSpan: true,
};
// European — L600〜800mmの範囲内は一律料金。defaultCount 固定のため座金は常に2本。
const EUROPEAN_RULE: ZakinRule = {
  defaultCount: 2, endMinMm: 50, maxSpanMm: 900, minLengthMm: 600,
};

export const PRODUCTS: Record<string, Product> = {
  rene:       { name: 'René ルネ',               type: '横型', basePrice: 36500, stdLengthMm: 1500, maxMm: 5000, finish: 'マットブラック', includedZakin: 3, priceTable: RENE_PRICE_TABLE },
  claire:     { name: 'Claire クレール',          type: '横型', basePrice: 42000, stdLengthMm: 1500, maxMm: 5000, finish: 'マットホワイト', includedZakin: 3, priceTable: CLAIRE_PRICE_TABLE },
  emile:      { name: 'Émile エミール',           type: '横型', basePrice: 45800, stdLengthMm: 1500, maxMm: 5000, finish: '鎚目仕上げ 銀古美', includedZakin: 3, priceTable: EMILE_PRICE_TABLE },
  marcel:     { name: 'Marcel マルセル',          type: '横型', basePrice: 36000, stdLengthMm: 1500, maxMm: 5000, finish: 'マットブラック', includedZakin: 3, priceTable: MARCEL_PRICE_TABLE },
  // 1500mm ¥150,000 / 3500mm ¥400,000（2026-08-02 蠣﨑さん指定）から逆算した pricePerMm。詳細は drawing-modal/products.ts 参照
  gaston:     { name: 'Gaston ガストン',          type: '横型', basePrice: 150000, stdLengthMm: 1500, maxMm: 5000, finish: 'ハンマー鍛造 鎚目仕上げ', includedZakin: 2, zakinRule: { endMinMm: 250, maxSpanMm: 1000 }, pricePerMm: 70.3125, zakinCustomizable: false, jointFeeEnabled: true },
  alexandre:  { name: 'Alexandre アレクサンドル', type: '縦型', basePrice: 32000, stdLengthMm: 1000, maxMm: 3000, finish: 'マットブラック', includedZakin: 3, zakinRule: ALEXANDRE_RULE, pricePerMm: 30, colorOptions: true },
  catherine:  { name: 'Catherine カトリーヌ',     type: '縦型', basePrice: 34500, stdLengthMm: 1000, maxMm: 1500, finish: 'マットホワイト', includedZakin: 3, zakinRule: VERTICAL_STANDARD_RULE },
  claude:     { name: 'Claude クロード',          type: '縦型', basePrice: 30000, stdLengthMm: 1000, maxMm: 1500, finish: 'マットブラック', includedZakin: 3, zakinRule: VERTICAL_STANDARD_RULE },
  antoine:    { name: 'Antoine アントワーヌ',      type: '縦型ロング', basePrice: 56000, stdLengthMm: 1500, maxMm: 3000, finish: 'マットブラック', includedZakin: 4, zakinRule: ANTOINE_RULE, pricePerMm: 30, colorOptions: true },
  scroll16:   { name: 'Scroll スクロール 16φ',    type: '縦型', basePrice: 18000, stdLengthMm: 700,  maxMm: 700,  finish: 'ミツロウ仕上げ', includedZakin: 2 },
  scroll19:   { name: 'Scroll スクロール 19φ',    type: '縦型', basePrice: 32000, stdLengthMm: 700,  maxMm: 700,  finish: 'ミツロウ仕上げ', includedZakin: 2 },
  scroll22:   { name: 'Scroll スクロール 22φ',    type: '縦型', basePrice: 60000, stdLengthMm: 800,  maxMm: 800,  finish: 'ミツロウ仕上げ', includedZakin: 2 },
  fabrice:    { name: 'Fabrice ファブリス',        type: '縦型', basePrice: 100000, stdLengthMm: 800, maxMm: 800,  finish: '無垢鉄 火造り鍛造', includedZakin: 2 },
  tsuchime:   { name: '鎚目 TSUCHIME',            type: '縦型', basePrice: 50000, stdLengthMm: 500,  maxMm: 1500, finish: '手打ち鎚目仕上げ', includedZakin: 2, zakinRule: VERTICAL_STANDARD_RULE, priceTable: TSUCHIME_PRICE_TABLE },
  european:   { name: 'European ヨーロピアン',     type: '縦型', basePrice: 110000, stdLengthMm: 600, maxMm: 800, finish: 'ハンマー鍛造仕上げ（ブラック）', includedZakin: 2, zakinRule: EUROPEAN_RULE, priceTable: EUROPEAN_PRICE_TABLE },
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
  opts?: { zakinCount?: number; angleDeg?: number; color?: 'black' | 'white' }
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
  // ジョイント代 (Gaston専用・必須自動加算)。5000mm(上限)は要問い合わせ扱いのため 0 のまま
  // （calcShipping が同じ長さ帯を "3,501mm以上は要問合せ" として扱うため実際の決済には進めない）。
  const jointCount = prod.jointFeeEnabled ? calcGastonJointCount(L_mm) : 0;
  const jointFee = jointCount * GASTON_JOINT_FEE_PER_UNIT;
  const blackTotal = prod.basePrice + addon + addZakin + surcharge + angleCost + jointFee;
  // 白仕上げ (colorOptions を持つ商品のみ・2026-07-05 Alexandre 追加): 合計 +15%。
  const total = prod.colorOptions && opts?.color === 'white'
    ? Math.floor((blackTotal * WHITE_RATE_PERCENT) / 100)
    : blackTotal;
  const colorSurcharge = total - blackTotal;
  return { addon, surcharge, addZakin, angleCost, jointCount, jointFee, colorSurcharge, zakin, total };
}
