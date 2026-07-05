// 見積もり状態の URL 共有シリアライズ（タスク1・2026-07-02）
//
// 既存の価格計算ロジック・座金自動配置には一切関与しない。UI 状態の保存・復元のみを担当する。
// 座金の「厳密なドラッグ位置」は zakin-editor.tsx のマウント時 effect が長さに応じて
// 常に評価し直す仕様（既存動作・変更不可）のため、位置そのものではなく「本数」のみを
// 保存・復元する。本数は getZakinPositions() で再展開すれば既存の自動配置と完全に一致する。

const KEYS = {
  lengths: "l",
  zakinCount: "zc",
  angleDeg: "za",
  angleDir: "zd",
  prefecture: "pref",
  deliveryType: "dt",
  washerType: "wt",
  orientation: "or",
  color: "c",
} as const

export interface QuoteShareInput {
  lengths: number[]
  /** 単品注文でカスタム本数の時のみ渡す。複数本注文・自動配置時は undefined。 */
  zakinCount?: number
  angleDeg?: number
  angleDir?: "left" | "right"
  prefecture: string
  deliveryType: "normal" | "express"
  washerType?: "A" | "B"
  orientation?: "left" | "right"
  /** 白仕上げ選択商品（Alexandre等）のみ。黒は既定値のため省略。 */
  color?: "black" | "white"
}

export function encodeQuoteState(input: QuoteShareInput): string {
  const params = new URLSearchParams()
  params.set(KEYS.lengths, input.lengths.join(","))
  if (input.zakinCount && input.zakinCount > 0) {
    params.set(KEYS.zakinCount, String(Math.round(input.zakinCount)))
  }
  if (input.angleDeg && input.angleDeg > 0) {
    params.set(KEYS.angleDeg, String(Math.round(input.angleDeg)))
    params.set(KEYS.angleDir, input.angleDir === "right" ? "r" : "l")
  }
  if (input.prefecture) params.set(KEYS.prefecture, input.prefecture)
  if (input.deliveryType === "express") params.set(KEYS.deliveryType, "e")
  if (input.washerType === "B") params.set(KEYS.washerType, "B")
  if (input.orientation === "right") params.set(KEYS.orientation, "r")
  if (input.color === "white") params.set(KEYS.color, "w")
  return params.toString()
}

export interface DecodedQuoteState {
  lengths?: number[]
  zakinCount?: number
  angleDeg?: number
  angleDir?: "left" | "right"
  prefecture?: string
  deliveryType?: "normal" | "express"
  washerType?: "A" | "B"
  orientation?: "left" | "right"
  color?: "black" | "white"
}

/** 不正・改変された URL でも安全にフォールバックできるよう、値を軽く検証してから返す。 */
export function decodeQuoteState(searchParams: URLSearchParams): DecodedQuoteState {
  const result: DecodedQuoteState = {}

  const lengthsRaw = searchParams.get(KEYS.lengths)
  if (lengthsRaw) {
    const parsed = lengthsRaw
      .split(",")
      .map(Number)
      .filter((n) => Number.isFinite(n) && n > 0)
    if (parsed.length > 0 && parsed.length <= 12) result.lengths = parsed
  }

  const zakinCountRaw = Number(searchParams.get(KEYS.zakinCount))
  if (Number.isFinite(zakinCountRaw) && zakinCountRaw > 0 && zakinCountRaw <= 30) {
    result.zakinCount = Math.round(zakinCountRaw)
  }

  const angleDegRaw = Number(searchParams.get(KEYS.angleDeg))
  if (Number.isFinite(angleDegRaw) && angleDegRaw > 0 && angleDegRaw <= 60) {
    result.angleDeg = Math.round(angleDegRaw)
    result.angleDir = searchParams.get(KEYS.angleDir) === "r" ? "right" : "left"
  }

  const prefecture = searchParams.get(KEYS.prefecture)
  if (prefecture) result.prefecture = prefecture

  if (searchParams.get(KEYS.deliveryType) === "e") result.deliveryType = "express"

  if (searchParams.get(KEYS.washerType) === "B") result.washerType = "B"

  if (searchParams.get(KEYS.orientation) === "r") result.orientation = "right"

  if (searchParams.get(KEYS.color) === "w") result.color = "white"

  return result
}

export function hasSharedQuote(searchParams: URLSearchParams): boolean {
  return searchParams.has(KEYS.lengths)
}

/** navigator.clipboard が使えない環境（古い WebView 等）向けのフォールバック付きコピー */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // フォールバックへ
    }
  }
  try {
    const textarea = document.createElement("textarea")
    textarea.value = text
    textarea.style.position = "fixed"
    textarea.style.opacity = "0"
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    const ok = document.execCommand("copy")
    document.body.removeChild(textarea)
    return ok
  } catch {
    return false
  }
}
