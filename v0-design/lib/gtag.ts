// gtag イベント送信の共有ヘルパー（新規の計測箇所はここを使う）。
// gtag.js は dataLayer に push された arguments object のみ認識する
// （プレーン配列・オブジェクトの push は無視される。PR #227 の教訓）。
// 既存の lead-click-tracker.tsx / thanks/page.tsx は同一実装を内包しており挙動は同じ。

type GtagFn = (...args: unknown[]) => void

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: GtagFn
  }
}

export function fireGtagEvent(name: string, params: Record<string, unknown>) {
  if (typeof window === "undefined") return
  window.dataLayer = window.dataLayer || []
  if (typeof window.gtag !== "function") {
    window.gtag = function () {
      window.dataLayer!.push(arguments)
    } as GtagFn
  }
  window.gtag("event", name, params)
}
