"use client"

import { useEffect, useRef } from "react"
import { loadStripe, type Stripe } from "@stripe/stripe-js"
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js"
import { X } from "lucide-react"

// Stripe SDK は 1 回だけ初期化してアプリ全体で再利用する
let _stripePromise: Promise<Stripe | null> | null = null
function getStripePromise(): Promise<Stripe | null> {
  if (!_stripePromise) {
    const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!pk) {
      console.error(
        "[EmbeddedCheckoutModal] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set"
      )
      _stripePromise = Promise.resolve(null)
    } else {
      _stripePromise = loadStripe(pk)
    }
  }
  return _stripePromise
}

interface Props {
  clientSecret: string | null
  open: boolean
  onClose: () => void
}

/**
 * Stripe Embedded Checkout を ado サイト内に表示するモーダル
 *
 * - clientSecret は /api/checkout 系エンドポイントが返す `client_secret`
 * - 決済完了時は Stripe が自動で session.return_url に遷移する
 * - ユーザーが × で閉じた場合は onClose で session を破棄
 */
export function EmbeddedCheckoutModal({ clientSecret, open, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null)

  // body スクロールロック + Esc で閉じる
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener("keydown", onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto p-3 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label="お支払い"
    >
      <div
        ref={dialogRef}
        className="relative w-full max-w-2xl my-4 bg-white rounded-xl shadow-2xl overflow-hidden"
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-secondary/40">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
              IRONWORKS ado
            </p>
            <h2 className="font-serif text-lg text-dark mt-0.5">
              お支払い手続き
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="閉じる"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stripe Embedded Checkout */}
        <div className="p-3 sm:p-5 min-h-[400px]">
          {clientSecret ? (
            <EmbeddedCheckoutProvider
              key={clientSecret}
              stripe={getStripePromise()}
              options={{ clientSecret }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          ) : (
            <div className="flex items-center justify-center min-h-[400px]">
              <p className="text-sm text-muted-foreground">
                決済画面を読み込み中…
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
