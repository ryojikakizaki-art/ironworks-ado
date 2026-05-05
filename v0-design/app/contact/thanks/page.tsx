"use client"

import { useEffect } from "react"
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

export default function ContactThanksPage() {
  useEffect(() => {
    // GA4: 見込み顧客獲得イベント
    fireGtagEvent("generate_lead", {
      event_category: "contact",
      event_label: "contact_form_submit",
    })

    // Google広告: お問い合わせコンバージョン
    const adsId = process.env.NEXT_PUBLIC_ADS_ID
    const cvLabel = process.env.NEXT_PUBLIC_ADS_CONTACT_CV_LABEL
    if (adsId && cvLabel) {
      fireGtagEvent("conversion", {
        send_to: `${adsId}/${cvLabel}`,
      })
    }
  }, [])

  return (
    <>
      <Header />
      <main className="pt-20 lg:pt-24 pb-20 bg-background">
        <div className="border-b border-border">
          <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-12 lg:py-16 text-center">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Thank You</p>
            <h1 className="font-serif text-3xl lg:text-5xl text-foreground mb-4">
              お問い合わせを承りました
            </h1>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              ご登録いただいたメールアドレス宛に自動返信メールをお送りしました。
              <br />
              通常 1〜2 営業日以内に担当よりご返信いたします。
            </p>
          </div>
        </div>

        <div className="max-w-[720px] mx-auto px-4 lg:px-8 py-16">
          <div className="border border-gold/40 bg-gold/5 p-8 text-center space-y-4">
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              自動返信メールが届かない場合は、迷惑メールフォルダをご確認ください。
              <br />
              それでも見当たらない場合は、お手数ですが
              <a
                href="mailto:ado@tantetuzest.com"
                className="text-gold hover:underline mx-1"
              >
                ado@tantetuzest.com
              </a>
              まで直接ご連絡ください。
            </p>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/products"
              className="inline-block px-8 py-4 border border-gold text-gold text-[10px] tracking-[0.3em] uppercase hover:bg-gold hover:text-dark transition-colors"
            >
              製品一覧を見る
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
