"use client"

import { useEffect, useState } from "react"
import { X, Check } from "lucide-react"
import { BankTransferDetails } from "@/app/bank-transfer/bank-transfer-details"
import type { OrderSummary } from "./embedded-checkout-modal"

interface Props {
  open: boolean
  onClose: () => void
  /** /api/checkout に送るのと同じ注文ペイロード（価格を一致させるため流用） */
  orderPayload: Record<string, unknown>
  /** 左側に表示する注文内訳（カード決済モーダルと共用の型） */
  summary?: OrderSummary
}

type SuccessData = { orderRef: string; totalYen: number; emailSent: boolean }

/**
 * 銀行振込での注文フォーム（ado サイト内モーダル）。
 *
 * お客様情報を入力 → /api/bank-order が受注台帳に「銀行振込・入金待ち」で記帳し、
 * 振込先案内メールを送信。成功後はこのモーダル内に振込先口座と注文番号を表示する。
 * 価格はサーバ側で再計算されるため、ここでは表示用 summary のみ受け取る。
 */
export function BankOrderModal({ open, onClose, orderPayload, summary }: Props) {
  const [form, setForm] = useState({
    customerName: "",
    customerKana: "",
    postalCode: "",
    address: "",
    phone: "",
    email: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<SuccessData | null>(null)

  // body スクロールロック + Esc / 戻るで閉じる
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    let poppedByBack = false
    window.history.pushState({ bankOrderOpen: true }, "")
    const onPop = () => { poppedByBack = true; onClose() }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("popstate", onPop)
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("popstate", onPop)
      window.removeEventListener("keydown", onKey)
      if (!poppedByBack) window.history.back()
    }
  }, [open, onClose])

  if (!open) return null

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch("/api/bank-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...orderPayload, ...form }),
      })
      const data = await res.json()
      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "ご注文を受け付けできませんでした。時間をおいて再度お試しください。")
        setSubmitting(false)
        return
      }
      setSuccess({ orderRef: data.orderRef, totalYen: data.totalYen, emailSent: data.emailSent })
      setSubmitting(false)
    } catch {
      setError("ネットワークエラーが発生しました。時間をおいて再度お試しください。")
      setSubmitting(false)
    }
  }

  const inputCls =
    "w-full rounded-md border border-border bg-white px-3.5 py-3 text-[15px] text-foreground outline-none transition-colors focus:border-gold"
  const labelCls = "mb-1.5 block text-[13px] font-medium text-foreground"

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-sm sm:p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label="銀行振込でのご注文"
    >
      <div className="relative my-4 w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-5 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              IRONWORKS ado
            </p>
            <h2 className="mt-0.5 font-serif text-lg text-dark">
              {success ? "ご注文を承りました" : "銀行振込でのご注文"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-muted"
            aria-label="閉じる"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 sm:p-7">
          {success ? (
            /* ── 完了画面 ── */
            <div className="space-y-6">
              <div className="flex items-start gap-3 rounded-lg border border-border border-l-4 border-l-gold bg-secondary/50 px-5 py-4">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold" />
                <div className="text-[14px] leading-[1.9] text-foreground/80">
                  ご注文ありがとうございます。下記口座へ
                  <strong className="font-bold text-foreground"> ¥{success.totalYen.toLocaleString()}</strong>
                  （税込・送料込）をお振込みください。
                  {success.emailSent && <>ご入力のメールアドレスにも、本内容と振込先をお送りしました。</>}
                </div>
              </div>

              <div className="flex items-baseline justify-between border-b border-border pb-3">
                <span className="text-[13px] text-muted-foreground">ご注文番号</span>
                <span className="font-serif text-lg font-bold tracking-wide text-foreground">
                  {success.orderRef}
                </span>
              </div>

              <BankTransferDetails />

              <p className="text-[13px] leading-[1.9] text-muted-foreground">
                振込手数料はお客様のご負担となります。ご入金の確認が取れ次第、メールにてご連絡し、
                制作・発送の手配を開始いたします。
              </p>

              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-md bg-dark py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-dark/90"
              >
                閉じる
              </button>
            </div>
          ) : (
            /* ── 入力フォーム ── */
            <form onSubmit={handleSubmit} className="space-y-5">
              {summary && (
                <div className="rounded-lg border border-border bg-secondary/30 px-4 py-3">
                  <p className="text-[13px] text-foreground">{summary.productName}</p>
                  <p className="mt-1 flex items-baseline justify-between">
                    <span className="text-[12px] text-muted-foreground">{summary.totalLabel}</span>
                    <span className="font-serif text-xl text-dark tabular-nums">
                      ¥{summary.totalAmount.toLocaleString()}
                    </span>
                  </p>
                </div>
              )}

              <p className="text-[13px] leading-[1.8] text-muted-foreground">
                お届け先とご連絡先をご入力ください。送信後、お振込み先の口座をご案内します。
                <br />（金額は入力内容をもとにサーバー側で確定します）
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <label className={labelCls}>お名前 <span className="text-gold">*</span></label>
                  <input className={inputCls} value={form.customerName} onChange={set("customerName")} required autoComplete="name" />
                </div>
                <div className="sm:col-span-1">
                  <label className={labelCls}>フリガナ</label>
                  <input className={inputCls} value={form.customerKana} onChange={set("customerKana")} />
                </div>
                <div className="sm:col-span-1">
                  <label className={labelCls}>郵便番号</label>
                  <input className={inputCls} value={form.postalCode} onChange={set("postalCode")} inputMode="numeric" placeholder="265-0052" autoComplete="postal-code" />
                </div>
                <div className="sm:col-span-1">
                  <label className={labelCls}>電話番号 <span className="text-gold">*</span></label>
                  <input className={inputCls} value={form.phone} onChange={set("phone")} type="tel" required autoComplete="tel" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>
                    ご住所（都道府県より下）<span className="text-gold">*</span>
                  </label>
                  <input className={inputCls} value={form.address} onChange={set("address")} required autoComplete="street-address" placeholder="千葉市若葉区和泉町239-2" />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    都道府県は商品ページでお選びいただいた内容で送信されます。
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>メールアドレス <span className="text-gold">*</span></label>
                  <input className={inputCls} value={form.email} onChange={set("email")} type="email" required autoComplete="email" />
                </div>
              </div>

              {error && (
                <div className="rounded-md border-2 border-red-500/60 bg-red-50 p-3 text-[13px] text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-md bg-gold py-4 font-serif text-[16px] font-bold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-wait disabled:opacity-60"
              >
                {submitting ? "送信中…" : "この内容で注文する（振込先を表示）"}
              </button>
              <p className="text-center text-[11px] text-muted-foreground">
                送信した時点ではまだお支払いは発生しません。次の画面の口座へお振込みください。
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
