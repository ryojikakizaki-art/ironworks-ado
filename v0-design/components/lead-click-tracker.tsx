"use client"

import { useEffect } from "react"

/**
 * LeadClickTracker — サイト全体のリード経路（LINE / 電話）クリックを計測する。
 *
 * なぜ必要か:
 *   ado は高単価・長検討のため、広告クリック後にフォーム送信（/contact/thanks）まで
 *   至るリードがほぼ無く、実際の相談は LINE・電話に流れている（計測外だった）。
 *   ここを計測しないと「お問い合わせ系 CV ≈ 0」となり、自動入札に使える信号が無い。
 *
 * 設計:
 *   - document への委譲リスナー 1 本で、現在・将来のすべての LINE / tel リンクを捕捉する
 *     （個別ページに onClick を撒かないので、リンクが増えても取りこぼさない）。
 *   - GA4 イベント（line_click / phone_click）は常に送る（G-KQWYMFV9GB 設定済み）。
 *     → GA4 でキーイベント化 → Google 広告へインポートで CV 化できる。
 *   - Google 広告 CV は env ラベルが設定されている時だけ追加で発火（直接 CV 化の経路）。
 *     ラベル未設定でも GA4 側は動くため no-op で安全。
 *   - gtag は arguments object を push（配列形式は無視される。PR #227 の教訓）。
 */

type GtagFn = (...args: unknown[]) => void
declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: GtagFn
  }
}

const ADS_ID = process.env.NEXT_PUBLIC_ADS_ID
const LINE_CV_LABEL = process.env.NEXT_PUBLIC_ADS_LINE_CV_LABEL
const TEL_CV_LABEL = process.env.NEXT_PUBLIC_ADS_TEL_CV_LABEL

function fireGtagEvent(name: string, params: Record<string, unknown>) {
  if (typeof window === "undefined") return
  window.dataLayer = window.dataLayer || []
  if (typeof window.gtag !== "function") {
    window.gtag = function () {
      window.dataLayer!.push(arguments)
    } as GtagFn
  }
  window.gtag("event", name, params)
}

export function LeadClickTracker() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null
      const anchor = target?.closest?.("a") as HTMLAnchorElement | null
      if (!anchor) return
      const href = anchor.getAttribute("href") || ""

      // LINE（lin.ee 短縮 / line.me 双方）
      if (/lin\.ee|line\.me/i.test(href)) {
        fireGtagEvent("line_click", {
          event_category: "contact",
          event_label: "line_click",
          link_url: href,
        })
        if (ADS_ID && LINE_CV_LABEL) {
          fireGtagEvent("conversion", { send_to: `${ADS_ID}/${LINE_CV_LABEL}` })
        }
        return
      }

      // 電話（tel: リンクのタップ）
      if (href.startsWith("tel:")) {
        fireGtagEvent("phone_click", {
          event_category: "contact",
          event_label: "phone_click",
          link_url: href,
        })
        if (ADS_ID && TEL_CV_LABEL) {
          fireGtagEvent("conversion", { send_to: `${ADS_ID}/${TEL_CV_LABEL}` })
        }
        return
      }
    }

    // capture フェーズ: tel: で即離脱する端末でも navigation 前に発火させる
    document.addEventListener("click", onClick, { capture: true })
    return () => document.removeEventListener("click", onClick, { capture: true })
  }, [])

  return null
}
