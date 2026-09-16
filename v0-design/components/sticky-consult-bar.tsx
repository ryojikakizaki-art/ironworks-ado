"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { PrimaryCTA } from "@/components/ui/primary-cta"

/**
 * StickyConsultBar — モバイル専用の常駐相談バー。
 *
 * なぜ必要か:
 *   検索広告の着地ページ（/products・/price）は本文が縦に長く、スクロールして中身を
 *   読んでいる間は相談導線が画面から完全に消えていた。一番聞きたいタイミングで
 *   聞く先が無いのが、広告経由の問い合わせが立たない構造的な理由のひとつだった（2026-09-16）。
 *   LINE / 電話は layout の LeadClickTracker が拾うので、そのまま CV 計測にも乗る。
 *
 * 出し分けの考え方:
 *   「◯◯を通り過ぎたか」という遷移ではなく、対象要素の“今の可視状態”だけで決める。
 *   遷移ベースだと、ページ内リンクのスクロールジャンプや慣性スクロールで中間状態が
 *   一度も観測されず、バーが出ないまま終わることがある。
 *
 *   IntersectionObserver のコールバックは描画更新に紐づくため、タブが非表示・非描画の
 *   環境（Claude の Browser pane 等）では発火しない。実機では問題にならないが、
 *   自動検証でバーが出ないときは「描画が止まっているだけ」の可能性をまず疑うこと。
 *
 * @param showWhile この CSS セレクタの要素が画面内にある間だけ出す（本文エリアを指定する）
 * @param hideWhile この CSS セレクタ（カンマ区切り可）の要素が画面内にある間は出さない。
 *                  ページ内の相談ブロックを指定して、相談口が画面に二重で並ぶのを防ぐ。
 */
export function StickyConsultBar({
  showWhile,
  hideWhile,
  lead = ["写真 1 枚で", "お見積もりまで"],
}: {
  showWhile: string
  hideWhile?: string
  lead?: [string, string]
}) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const zone = document.querySelector(showWhile)
    if (!zone) return
    const blockers = hideWhile ? Array.from(document.querySelectorAll(hideWhile)) : []

    let inZone = false
    const blocked = new Set<Element>()

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === zone) {
          inZone = e.isIntersecting
        } else if (e.isIntersecting) {
          blocked.add(e.target)
        } else {
          blocked.delete(e.target)
        }
      }
      setShow(inZone && blocked.size === 0)
    })

    io.observe(zone)
    blockers.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [showWhile, hideWhile])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 88, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 88, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-x-0 bottom-0 z-40 md:hidden border-t border-border bg-white/95 backdrop-blur-sm shadow-[0_-4px_16px_rgba(0,0,0,0.08)] [padding-bottom:env(safe-area-inset-bottom)]"
        >
          <div className="flex items-center gap-2.5 px-4 py-2.5">
            <p className="min-w-0 flex-1 font-serif text-[13px] font-bold text-foreground leading-[1.45]">
              {lead[0]}
              <br />
              {lead[1]}
            </p>
            <PrimaryCTA
              href="tel:07038170659"
              variant="dark"
              size="md"
              className="px-5"
              withArrow={false}
            >
              電話
            </PrimaryCTA>
            <PrimaryCTA
              href="https://lin.ee/Tnjukrf"
              external
              variant="line"
              size="md"
              className="px-5"
              withArrow={false}
            >
              LINE で相談
            </PrimaryCTA>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
