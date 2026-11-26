"use client"

// 「立体で見る（3D）」ボタンと、その窓。three.js（rail-3d-viewer）は押したときだけ読み込む。
// 窓の開閉は React の state だけで行う（SSR の DOM には触らない）。

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import dynamic from "next/dynamic"
import { Box, X } from "lucide-react"
import type { Rail3DViewerProps } from "./rail-3d-viewer"

const Rail3DViewer = dynamic(() => import("./rail-3d-viewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-[13px] text-muted-foreground">読み込み中…</div>
  ),
})

interface Rail3DButtonProps extends Rail3DViewerProps {
  productName: string
  note?: string // 3D に入っていない仕様があるときの断り書き（例: Marcel のエンド）
}

export function Rail3DButton({ productName, note, ...viewer }: Rail3DButtonProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  const angleText =
    viewer.angleDeg > 0 ? `・支柱の角度 ${viewer.angleDeg}°（${viewer.angleDir === "left" ? "左" : "右"}）` : ""

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md border-2 border-gold/60 bg-white px-4 py-3 text-[14px] font-semibold tracking-wider text-foreground transition-colors hover:bg-gold/5"
      >
        <Box className="h-4 w-4 text-gold" aria-hidden />
        この長さを立体で見る（3D）
      </button>

      {/* 商品ページ内の重なり順（transform 等）に巻き込まれてヘッダーの下に潜らないよう body 直下へ出す */}
      {open && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} を立体で見る`}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-0 md:p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex h-full w-full flex-col overflow-hidden bg-white md:h-[82vh] md:max-w-5xl md:rounded-lg md:shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 [padding-top:max(0.75rem,env(safe-area-inset-top))]">
              <div className="min-w-0">
                <p className="text-[15px] font-semibold tracking-wider text-foreground">{productName} を立体で見る</p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                  全長 {viewer.lengthMm.toLocaleString()}mm・座金 {viewer.positions.length} 点{angleText}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                autoFocus
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-[#f3f4f6]"
                aria-label="閉じる"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative min-h-0 flex-1">
              <Rail3DViewer {...viewer} />
            </div>
            <p className="border-t border-border bg-white px-4 py-3 text-[13px] leading-relaxed text-muted-foreground [padding-bottom:max(0.75rem,env(safe-area-inset-bottom))]">
              {note && <span className="mb-1 block text-foreground">{note}</span>}
              指でなぞると回転、2本指で拡大・移動できます。CGによるイメージです。色や質感は商品写真をご覧ください。
            </p>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
