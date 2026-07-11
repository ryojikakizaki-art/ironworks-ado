// 佐川急便 送料計算ロジック
// 旧 item/*.html (PR #38) から移植。12地域 × 8サイズ区分のレート表。
//
// ルール:
// - 1000mm以下: 全国一律 ¥1,000
// - 縦型手すり: 260サイズ固定
// - 横型手すり: 長さ+200mm で発送サイズ区分を決定
// - 3本まで同一梱包(×1), 4-6本は×2
// - 沖縄 / 7本以上 / 3001mm以上 は要問合せ (inquiry モード)

export type ProductType = "yokogata" | "tategata" | "fixed"

export const PREF_TO_REGION: Record<string, string> = {
  "北海道": "hokkaido",
  "青森県": "kita_tohoku", "岩手県": "kita_tohoku", "秋田県": "kita_tohoku",
  "宮城県": "minami_tohoku", "山形県": "minami_tohoku", "福島県": "minami_tohoku",
  "茨城県": "kanto", "栃木県": "kanto", "群馬県": "kanto",
  "埼玉県": "kanto", "千葉県": "kanto", "東京都": "kanto", "神奈川県": "kanto",
  "山梨県": "kanto",
  "新潟県": "shinetsu", "長野県": "shinetsu",
  "富山県": "hokuriku", "石川県": "hokuriku", "福井県": "hokuriku",
  "岐阜県": "tokai", "静岡県": "tokai", "愛知県": "tokai", "三重県": "tokai",
  "滋賀県": "kansai", "京都府": "kansai", "大阪府": "kansai",
  "兵庫県": "kansai", "奈良県": "kansai", "和歌山県": "kansai",
  "鳥取県": "chugoku", "島根県": "chugoku", "岡山県": "chugoku",
  "広島県": "chugoku", "山口県": "chugoku",
  "徳島県": "shikoku", "香川県": "shikoku", "愛媛県": "shikoku", "高知県": "shikoku",
  "福岡県": "kita_kyushu", "佐賀県": "kita_kyushu", "長崎県": "kita_kyushu", "大分県": "kita_kyushu",
  "熊本県": "minami_kyushu", "宮崎県": "minami_kyushu", "鹿児島県": "minami_kyushu",
  "沖縄県": "okinawa",
}

type Region =
  | "hokkaido" | "kita_tohoku" | "minami_tohoku" | "kanto" | "shinetsu"
  | "hokuriku" | "tokai" | "kansai" | "chugoku" | "shikoku"
  | "kita_kyushu" | "minami_kyushu"

type SizeBracket = 140 | 160 | 170 | 180 | 200 | 220 | 240 | 260

export const SHIPPING_RATES: Record<SizeBracket, Record<Region, number>> = {
  140: { minami_kyushu: 1550, kita_kyushu: 1500, shikoku: 1400, chugoku: 1500, kansai: 1300, hokuriku: 1200, tokai: 1300, shinetsu: 1100, kanto: 1400, minami_tohoku: 1400, kita_tohoku: 1400, hokkaido: 1550 },
  160: { minami_kyushu: 2650, kita_kyushu: 2650, shikoku: 2550, chugoku: 2400, kansai: 2400, hokuriku: 2200, tokai: 2200, shinetsu: 2200, kanto: 2200, minami_tohoku: 2200, kita_tohoku: 2350, hokkaido: 2650 },
  170: { minami_kyushu: 4100, kita_kyushu: 3800, shikoku: 3550, chugoku: 3550, kansai: 3300, hokuriku: 3300, tokai: 3300, shinetsu: 2600, kanto: 3350, minami_tohoku: 3550, kita_tohoku: 3550, hokkaido: 4100 },
  180: { minami_kyushu: 4600, kita_kyushu: 4150, shikoku: 3900, chugoku: 3900, kansai: 3550, hokuriku: 3550, tokai: 3550, shinetsu: 2850, kanto: 3700, minami_tohoku: 3900, kita_tohoku: 3900, hokkaido: 4600 },
  200: { minami_kyushu: 5650, kita_kyushu: 5150, shikoku: 4700, chugoku: 4700, kansai: 4300, hokuriku: 4300, tokai: 4300, shinetsu: 3400, kanto: 4450, minami_tohoku: 4700, kita_tohoku: 4700, hokkaido: 5600 },
  220: { minami_kyushu: 6700, kita_kyushu: 6100, shikoku: 5600, chugoku: 5600, kansai: 5000, hokuriku: 5000, tokai: 5000, shinetsu: 4000, kanto: 5200, minami_tohoku: 5550, kita_tohoku: 5550, hokkaido: 7150 },
  240: { minami_kyushu: 8000, kita_kyushu: 8000, shikoku: 7200, chugoku: 7200, kansai: 6500, hokuriku: 6500, tokai: 6500, shinetsu: 5000, kanto: 6700, minami_tohoku: 7200, kita_tohoku: 7200, hokkaido: 8900 },
  260: { minami_kyushu: 11000, kita_kyushu: 9900, shikoku: 9000, chugoku: 9000, kansai: 8000, hokuriku: 8000, tokai: 8000, shinetsu: 6200, kanto: 8300, minami_tohoku: 9000, kita_tohoku: 9000, hokkaido: 11100 },
}

// 発送サイズ(mm) → サイズ区分
const SIZE_BRACKETS: Array<[number, SizeBracket]> = [
  [1400, 140], [1600, 160], [1700, 170], [1800, 180],
  [2000, 200], [2200, 220], [2400, 240], [3700, 260],
]

function getSizeBracket(shipMm: number): SizeBracket | null {
  for (const [limit, size] of SIZE_BRACKETS) {
    if (shipMm <= limit) return size
  }
  return null
}

export interface BundleDetail {
  /** この梱包の最長サイズ (mm) */
  maxLength: number
  /** この梱包に含まれる本数 */
  count: number
  /** この梱包の送料単価 (円) */
  rate: number
}

export interface ShippingResult {
  /** 送料合計 (円)。inquiry モード時は 0 */
  shipping: number
  /** 第一梱包の rate (後方互換用、aggregateNote/bundleDetails で詳細確認推奨) */
  rate: number
  /** 梱包数 */
  bundles: number
  /** 注記 (例: "梱包1 (3本・最長 2500mm) ¥3,300 + 梱包2 (1本・最長 1500mm) ¥2,200") */
  note: string
  /** 要問合せモードか (沖縄・7本以上・3501mm以上) */
  inquiry: boolean
  /** 要問合せの理由 */
  inquiryReason?: string
  /** 梱包ごとの詳細 (多本注文時の per-bundle 内訳) */
  bundleDetails?: BundleDetail[]
}

/**
 * 1 梱包あたりの送料単価を計算する（内部用 helper）。
 */
function calcSingleBundleRate(
  maxLengthMm: number,
  region: Region,
  productType: ProductType
): { rate: number; note: string } | { inquiry: true; reason: string } {
  if (maxLengthMm <= 1000) {
    return { rate: 1000, note: "1,000mm以下: 全国一律 ¥1,000" }
  }
  if (productType === "fixed") {
    // 固定長装飾商品 (scroll等) は短いので一律 ¥1,000 で扱う
    return { rate: 1000, note: "固定サイズ: 全国一律 ¥1,000" }
  }
  // 縦型・横型ともに「長さ + 200mm」で発送サイズ区分を決定 (佐川急便3辺合計)
  const shipSize = maxLengthMm + 200
  const bracket = getSizeBracket(shipSize)
  if (!bracket) {
    return { inquiry: true, reason: "このサイズは通常配送できません。別途お見積もりとなります" }
  }
  return {
    rate: SHIPPING_RATES[bracket][region],
    note: `発送サイズ ${shipSize}mm → ${bracket}サイズ`,
  }
}

/**
 * 送料を計算する (多本対応 / 梱包ごとに最長サイズで rate 決定)。
 *
 * ルール:
 * - 各本の長さは長い順にソートして 3 本ずつ梱包
 * - 各梱包の最長サイズで rate を計算 → 合算
 * - 1-3 本: 1 梱包、4-6 本: 2 梱包
 * - 7 本以上: 要問合せ (invoice 振込フローへ)
 *
 * 例: lengths=[1500, 1800, 3000, 4000] →
 *   ソート [4000, 3000, 1800, 1500] →
 *   梱包1 [4000, 3000, 1800] → rate(4000mm) →
 *   梱包2 [1500] → rate(1500mm) →
 *   合計送料 = rate(4000mm) + rate(1500mm)
 */
export function calcShipping(
  lengths: number[],
  prefecture: string,
  productType: ProductType
): ShippingResult {
  if (lengths.length === 0) {
    return { shipping: 0, rate: 0, bundles: 0, note: "本数が指定されていません", inquiry: false }
  }
  // 7 本以上は invoice 振込フローへ
  if (lengths.length > 6) {
    return {
      shipping: 0, rate: 0, bundles: 0, note: "", inquiry: true,
      inquiryReason: "7本以上のご注文は送料を別途お見積もりとなるため、請求書振込でのご注文をお願いしております",
    }
  }
  // どれか 1 本でも 3501mm 以上は要問合せ (梱包サイズ上限)
  const overSize = lengths.find(L => L > 3500)
  if (overSize !== undefined) {
    return {
      shipping: 0, rate: 0, bundles: 0, note: "", inquiry: true,
      inquiryReason: `${overSize}mm のご注文は別途お見積もりとなります（3,501mm以上）`,
    }
  }

  const region = PREF_TO_REGION[prefecture] as Region | undefined
  if (region === "okinawa" as Region) {
    return {
      shipping: 0, rate: 0, bundles: 0, note: "", inquiry: true,
      inquiryReason: "沖縄県への配送は別途お見積もりとなります",
    }
  }
  if (!region) {
    return { shipping: 0, rate: 0, bundles: 0, note: "配送先都道府県を選択してください", inquiry: false }
  }

  // 長い順にソートして 3 本ずつ梱包
  const sorted = [...lengths].sort((a, b) => b - a)
  const bundleChunks: number[][] = []
  for (let i = 0; i < sorted.length; i += 3) {
    bundleChunks.push(sorted.slice(i, i + 3))
  }

  // 各梱包の rate を計算
  const bundleDetails: BundleDetail[] = []
  const noteParts: string[] = []
  let totalShipping = 0
  for (let i = 0; i < bundleChunks.length; i++) {
    const chunk = bundleChunks[i]
    const maxL = Math.max(...chunk)
    const result = calcSingleBundleRate(maxL, region, productType)
    if ("inquiry" in result) {
      return {
        shipping: 0, rate: 0, bundles: 0, note: "", inquiry: true,
        inquiryReason: result.reason,
      }
    }
    bundleDetails.push({ maxLength: maxL, count: chunk.length, rate: result.rate })
    totalShipping += result.rate
    if (bundleChunks.length === 1) {
      // 1 梱包のみ: シンプルな note
      noteParts.push(result.note)
    } else {
      noteParts.push(`梱包${i + 1} (${chunk.length}本・最長 ${maxL}mm) ¥${result.rate.toLocaleString()}`)
    }
  }

  return {
    shipping: totalShipping,
    rate: bundleDetails[0]?.rate ?? 0,
    bundles: bundleChunks.length,
    note: noteParts.join(" + "),
    inquiry: false,
    bundleDetails,
  }
}

// 全12地域を代表する都道府県（沖縄は要問合せ地域のため除く）。地域ごとに送料は
// 都道府県によらず同一なので、代表1件ずつで全地域の最安・最高を把握できる。
const REGION_SAMPLE_PREFECTURES = [
  "北海道", "青森県", "宮城県", "東京都", "新潟県", "富山県",
  "岐阜県", "大阪府", "鳥取県", "徳島県", "福岡県", "熊本県",
]

export interface ShippingRangeResult {
  minShipping: number
  maxShipping: number
}

/**
 * 配送先未選択時の「送料込み目安」表示用（タスク3・2026-07-02）。
 * 既存の calcShipping をそのまま全地域分呼び出して集計するだけで、
 * 送料レート表・計算式は一切変更しない。
 * 全地域が要問合せ（7本以上・3501mm以上等）の場合は null を返す。
 */
export function getShippingRange(lengths: number[], productType: ProductType): ShippingRangeResult | null {
  let min = Infinity
  let max = -Infinity
  for (const pref of REGION_SAMPLE_PREFECTURES) {
    const result = calcShipping(lengths, pref, productType)
    if (result.inquiry) continue
    min = Math.min(min, result.shipping)
    max = Math.max(max, result.shipping)
  }
  if (min === Infinity) return null
  return { minShipping: min, maxShipping: max }
}

/**
 * Clémence（トイレ手すり）専用の送料計算。
 *
 * L 型に固定梱包される商品のため、他の手すりのように長さ(mm)からサイズ区分を
 * 自動判定する calcShipping の仕組みは合わない。蠣﨑さん確認済みの固定区分
 * （基本=160サイズ・③側延長時=170サイズ／2026-07-11 確認）を直接引く。
 * レート表・地域判定は calcShipping と同じ SHIPPING_RATES / PREF_TO_REGION を共有し、
 * 金額を二重管理しない。
 */
export function calcClemenceShipping(prefecture: string, extensionMm: number): ShippingResult {
  const region = PREF_TO_REGION[prefecture] as Region | undefined
  if (region === ("okinawa" as Region)) {
    return {
      shipping: 0, rate: 0, bundles: 0, note: "", inquiry: true,
      inquiryReason: "沖縄県への配送は別途お見積もりとなります",
    }
  }
  if (!region) {
    return { shipping: 0, rate: 0, bundles: 0, note: "配送先都道府県を選択してください", inquiry: false }
  }
  const bracket: SizeBracket = extensionMm > 0 ? 170 : 160
  const rate = SHIPPING_RATES[bracket][region]
  return {
    shipping: rate,
    rate,
    bundles: 1,
    note: `${bracket}サイズ（佐川急便）`,
    inquiry: false,
  }
}
