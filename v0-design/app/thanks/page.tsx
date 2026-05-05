"use client"

import { useEffect, useRef, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

type GtagFn = (...args: unknown[]) => void
declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: GtagFn
  }
}

// gtag 本体（next/script afterInteractive）が未ロードの場合は
// arguments 互換の配列形式で dataLayer にキューする。
// オブジェクト形式 ({0:..., 1:..., 2:...}) では gtag が認識しないので注意。
function fireGtagEvent(name: string, params: Record<string, unknown>) {
  if (typeof window === "undefined") return
  if (typeof window.gtag === "function") {
    window.gtag("event", name, params)
    return
  }
  window.dataLayer = window.dataLayer || []
  const queued: GtagFn = function (...a: unknown[]) {
    window.dataLayer!.push(a)
  }
  queued("event", name, params)
}

interface SessionData {
  id: string
  payment_status: string
  amount_total: number | null
  currency: string
  customer_details: { email?: string; name?: string } | null
  metadata: Record<string, string>
  line_items: Array<{ description?: string; quantity?: number; amount_total?: number }>
  created: number
}

function formatYen(n: number | null | undefined) {
  if (n == null) return "—"
  return `¥${n.toLocaleString("ja-JP")}`
}

function formatOrderId(id: string) {
  return id ? id.slice(-10).toUpperCase() : "—"
}

function formatTimestamp(ts: number) {
  if (!ts) return "—"
  const d = new Date(ts * 1000)
  return d.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })
}

function ThanksContent() {
  const params = useSearchParams()
  const sessionId = params.get("session_id") || ""
  const [data, setData] = useState<SessionData | null>(null)
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const cvFiredRef = useRef(false)

  useEffect(() => {
    if (!sessionId) {
      setError("セッションIDが見つかりませんでした")
      setLoading(false)
      return
    }
    ;(async () => {
      try {
        const res = await fetch(`/api/session?id=${encodeURIComponent(sessionId)}`)
        if (!res.ok) {
          const e = await res.json().catch(() => ({}))
          throw new Error(e.error || `情報の取得に失敗しました (${res.status})`)
        }
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : "情報の取得に失敗しました")
      } finally {
        setLoading(false)
      }
    })()
  }, [sessionId])

  useEffect(() => {
    if (!data || data.payment_status !== "paid" || cvFiredRef.current) return
    cvFiredRef.current = true

    const value = data.amount_total ?? 0
    const currency = (data.currency || "JPY").toUpperCase()

    fireGtagEvent("purchase", {
      transaction_id: data.id,
      value,
      currency,
      items: data.line_items?.map((it) => ({
        item_name: it.description,
        quantity: it.quantity,
        price:
          it.amount_total != null && it.quantity ? it.amount_total / it.quantity : undefined,
      })),
    })

    const adsId = process.env.NEXT_PUBLIC_ADS_ID
    const cvLabel = process.env.NEXT_PUBLIC_ADS_PURCHASE_CV_LABEL
    if (adsId && cvLabel) {
      fireGtagEvent("conversion", {
        send_to: `${adsId}/${cvLabel}`,
        transaction_id: data.id,
        value,
        currency,
      })
    }
  }, [data])

  return (
    <main className="pt-20 lg:pt-24 pb-20 bg-background">
      <div className="border-b border-border">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-12 lg:py-16 text-center">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Thank You</p>
          <h1 className="font-serif text-3xl lg:text-5xl text-foreground mb-4">
            ご注文ありがとうございます
          </h1>
          <p className="text-[13px] text-muted-foreground">
            ご注文内容を下記にてご確認ください。確認メールをお送りしました。
          </p>
        </div>
      </div>

      <div className="max-w-[720px] mx-auto px-4 lg:px-8 py-16">
        {loading ? (
          <p className="text-center text-[13px] text-muted-foreground">
            注文情報を読み込んでいます...
          </p>
        ) : error ? (
          <div className="border border-red-500/40 bg-red-500/5 p-8 text-center">
            <p className="text-[14px] text-red-400">{error}</p>
            <p className="text-[12px] text-muted-foreground mt-4">
              ご注文は正常に処理されている可能性があります。ご確認のためお問い合わせください。
            </p>
          </div>
        ) : data ? (
          <div className="space-y-8">
            {/* Status */}
            <div className="border border-gold/40 bg-gold/5 p-6 text-center">
              <p className="text-[11px] tracking-[0.2em] uppercase text-gold mb-2">
                Payment Status
              </p>
              <p className="text-lg font-light text-foreground">
                {data.payment_status === "paid" ? "お支払い完了" : data.payment_status}
              </p>
            </div>

            {/* Meta */}
            <div className="border border-border p-6 space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-[11px] tracking-wide text-muted-foreground uppercase">
                  注文番号
                </span>
                <span className="font-mono text-[13px] text-foreground">
                  {formatOrderId(data.id)}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[11px] tracking-wide text-muted-foreground uppercase">
                  注文日
                </span>
                <span className="text-[13px] text-foreground">
                  {formatTimestamp(data.created)}
                </span>
              </div>
              {data.customer_details?.email && (
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] tracking-wide text-muted-foreground uppercase">
                    メール
                  </span>
                  <span className="text-[13px] text-foreground">
                    {data.customer_details.email}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-4 border-t border-border">
                <span className="text-[11px] tracking-wide text-muted-foreground uppercase">
                  合計金額
                </span>
                <span className="text-xl font-light text-foreground">
                  {formatYen(data.amount_total)}
                </span>
              </div>
            </div>

            {/* Line items */}
            {data.line_items && data.line_items.length > 0 && (
              <div className="border border-border p-6">
                <h2 className="text-[11px] tracking-[0.2em] uppercase text-gold mb-4">
                  Items
                </h2>
                <div className="space-y-4">
                  {data.line_items.map((item, i) => (
                    <div key={i} className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="text-[13px] text-foreground">
                          {item.description || "—"}
                        </p>
                        {item.quantity && (
                          <p className="text-[11px] text-muted-foreground mt-1">
                            数量: {item.quantity}
                          </p>
                        )}
                      </div>
                      <span className="text-[13px] text-foreground whitespace-nowrap">
                        {formatYen(item.amount_total)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Schedule (from metadata) */}
            {data.metadata?.production_start && (
              <div className="border border-border p-6">
                <h2 className="text-[11px] tracking-[0.2em] uppercase text-gold mb-4">
                  制作・配送スケジュール
                </h2>
                <div className="space-y-3 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">制作開始</span>
                    <span className="text-foreground">{data.metadata.production_start}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">制作完了予定</span>
                    <span className="text-foreground">{data.metadata.production_complete}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">発送予定</span>
                    <span className="text-foreground">{data.metadata.shipping_date}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-border">
                    <span className="text-muted-foreground">到着予定</span>
                    <span className="text-foreground font-medium">
                      {data.metadata.preferred_arrival_date || data.metadata.arrival_estimate}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}

        <div className="mt-12 text-center">
          <Link
            href="/products"
            className="inline-block px-8 py-4 border border-gold text-gold text-[10px] tracking-[0.3em] uppercase hover:bg-gold hover:text-dark transition-colors"
          >
            製品一覧に戻る
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function ThanksPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="pt-32 text-center text-muted-foreground">読み込み中...</div>}>
        <ThanksContent />
      </Suspense>
      <Footer />
    </>
  )
}
