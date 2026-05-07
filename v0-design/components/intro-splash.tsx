"use client"

import { useEffect, useRef, useState } from "react"

const STORAGE_KEY = "ado-intro-seen"

/* タイムライン（PNG フェードイン版）
 *  0.00s   黒画面
 *  0.20s   ado_logo_W.png が 1.5 秒かけてフェードイン
 *  1.70s   完成形（PNG ロゴと完全一致）でホールド
 *  2.60s   フェードアウト（0.8s）
 *  3.40s   splash 消滅
 */
const TOTAL_MS = 2600
const FADE_OUT_MS = 800

export function IntroSplash() {
  const [stage, setStage] = useState<"idle" | "visible" | "exiting" | "gone">("idle")
  const dismissedRef = useRef(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    let alreadySeen = false
    try {
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined
      if (nav?.type === "reload") {
        sessionStorage.removeItem(STORAGE_KEY)
      } else {
        alreadySeen = sessionStorage.getItem(STORAGE_KEY) === "1"
      }
    } catch {}
    if (alreadySeen) {
      setStage("gone")
      return
    }
    setStage("visible")
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const auto = window.setTimeout(() => dismiss(), TOTAL_MS)
    return () => {
      window.clearTimeout(auto)
      document.body.style.overflow = prevOverflow
    }
  }, [])

  function dismiss() {
    if (dismissedRef.current) return
    dismissedRef.current = true
    sessionStorage.setItem(STORAGE_KEY, "1")
    setStage("exiting")
    window.setTimeout(() => {
      document.body.style.overflow = ""
      setStage("gone")
    }, FADE_OUT_MS)
  }

  // Esc / クリック / スクロールでスキップ
  useEffect(() => {
    if (stage !== "visible") return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault()
        dismiss()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [stage])

  if (stage === "idle" || stage === "gone") return null

  return (
    <div
      onClick={dismiss}
      role="button"
      tabIndex={0}
      aria-label="サイトに入る"
      className={`ado-splash ${stage === "exiting" ? "ado-splash--exit" : ""}`}
    >
      <div className="ado-splash__center">
        {/* PNG 完成形のフェードイン（アウトライン描画は今後再着手予定 — handoff 参照） */}
        <img
          className="ado-splash__png-img"
          src="/images/ado_logo_W.png"
          alt="ado IRONWORKS"
          width={1378}
          height={1598}
        />
      </div>
    </div>
  )
}
