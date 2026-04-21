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

export interface ShippingResult {
  /** 送料 (円)。inquiry モード時は 0 */
  shipping: number
  /** 単梱包単価 (円) */
  rate: number
  /** 梱包数 */
  bundles: number
  /** 注記 (例: "発送サイズ 1200mm → 140サイズ（3本まで同一梱包）") */
  note: string
  /** 要問合せモードか (沖縄・7本以上・3001mm以上) */
  inquiry: boolean
  /** 要問合せの理由 */
  inquiryReason?: string
}

/**
 * 送料を計算する。
 * - lengthMm: 製品長さ
 * - prefecture: 配送先都道府県 (空なら 未選択)
 * - quantity: 本数
 * - productType: 縦型/横型/固定
 */
export function calcShipping(
  lengthMm: number,
  prefecture: string,
  quantity: number,
  productType: ProductType
): ShippingResult {
  if (lengthMm > 3500) {
    return {
      shipping: 0, rate: 0, bundles: 0, note: "", inquiry: true,
      inquiryReason: "3,501mm以上のご注文は別途お見積もりとなります",
    }
  }
  if (quantity > 6) {
    return {
      shipping: 0, rate: 0, bundles: 0, note: "", inquiry: true,
      inquiryReason: "7本以上のご注文は別途お見積もりとなります",
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

  let rate = 0
  let note = ""
  if (lengthMm <= 1000) {
    rate = 1000
    note = "1,000mm以下: 全国一律 ¥1,000"
  } else if (productType === "fixed") {
    // 固定長装飾商品 (scroll等) は短いので一律 ¥1,000 で扱う
    rate = 1000
    note = "固定サイズ: 全国一律 ¥1,000"
  } else {
    // 縦型・横型ともに「長さ + 200mm」で発送サイズ区分を決定 (佐川急便3辺合計)
    const shipSize = lengthMm + 200
    const bracket = getSizeBracket(shipSize)
    if (!bracket) {
      return {
        shipping: 0, rate: 0, bundles: 0, note: "", inquiry: true,
        inquiryReason: "このサイズは通常配送できません。別途お見積もりとなります",
      }
    }
    rate = SHIPPING_RATES[bracket][region]
    note = `発送サイズ ${shipSize}mm → ${bracket}サイズ`
  }

  const bundles = quantity <= 3 ? 1 : 2
  const shipping = rate * bundles
  if (bundles > 1) note += `（${bundles}梱包・3本まで同一梱包）`

  return { shipping, rate, bundles, note, inquiry: false }
}
