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

export interface OrderSummaryLine {
  label: string
  amount: number // 円（税込/税抜は呼び出し側で吸収）
  note?: string
  emphasize?: boolean
}

export interface OrderSummary {
  productName: string
  productNote?: string
  lines: OrderSummaryLine[]
  totalLabel: string
  totalAmount: number
}

interface Props {
  clientSecret: string | null
  open: boolean
  onClose: () => void
  /** ado 側で表示する注文内訳（モーダル左側に固定表示） */
  summary?: OrderSummary
}

/**
 * Stripe Embedded Checkout を ado サイト内に表示するモーダル
 *
 * - clientSecret は /api/checkout 系エンドポイントが返す `client_secret`
 * - 決済完了時は Stripe が自動で session.return_url に遷移する
 * - ユーザーが × で閉じた場合は onClose で session を破棄
 * - summary を渡すと左側に固定の注文内訳パネルを表示する（Stripe 側の折りたたみ表示の代替）
 */
export function EmbeddedCheckoutModal({ clientSecret, open, onClose, summary }: Props) {
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
        className="relative w-full max-w-5xl my-4 bg-white rounded-xl shadow-2xl overflow-hidden"
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

        {/* 本体: 左 = ado 注文内訳, 右 = Stripe 決済フォーム */}
        <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-0">
          {/* 左: 自前の注文内訳（Stripe 側の折りたたみ表示の代替） */}
          {summary && (
            <aside className="bg-secondary/20 border-b md:border-b-0 md:border-r border-border p-5 md:p-7 text-sm">
              <p className="text-[11px] tracking-[0.25em] uppercase text-muted-foreground mb-3">
                ご注文内容
              </p>
              <h3 className="font-serif text-base text-dark leading-snug mb-1">
                {summary.productName}
              </h3>
              {summary.productNote && (
                <p className="text-[12px] text-muted-foreground mb-5 leading-relaxed">
                  {summary.productNote}
                </p>
              )}

              <dl className="space-y-2.5 mb-5">
                {summary.lines.map((line, i) => (
                  <div key={i} className="flex items-baseline justify-between gap-3">
                    <dt className="text-[13px] text-muted-foreground">
                      {line.label}
                      {line.note && (
                        <span className="block text-[11px] mt-0.5 opacity-80">{line.note}</span>
                      )}
                    </dt>
                    <dd className={`font-mono text-[13px] tabular-nums ${line.emphasize ? "text-dark font-semibold" : "text-dark"}`}>
                      ¥{line.amount.toLocaleString()}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="border-t-2 border-gold/40 pt-4 flex items-baseline justify-between gap-3">
                <span className="text-[12px] tracking-[0.15em] uppercase text-muted-foreground">
                  {summary.totalLabel}
                </span>
                <span className="font-serif text-2xl text-dark tabular-nums">
                  ¥{summary.totalAmount.toLocaleString()}
                </span>
              </div>
            </aside>
          )}

          {/* 右: Stripe Embedded Checkout */}
          <div className="p-3 sm:p-5 min-h-[480px]">
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
    </div>
  )
}
