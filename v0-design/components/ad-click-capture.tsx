"use client"

import { useEffect } from "react"
import { captureAdClickFromUrl } from "@/lib/ad-click"

/**
 * 広告クリックで着地したかを記録するだけの見えない部品（lib/ad-click.ts 参照）。
 * 着地ページは何でもありうるので layout に置く。
 */
export function AdClickCapture() {
  useEffect(() => {
    captureAdClickFromUrl(window.location.search)
  }, [])
  return null
}
