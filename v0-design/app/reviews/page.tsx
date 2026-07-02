import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { REVIEW_QUOTES } from "@/lib/testimonials"
import { VoiceBubble } from "@/components/voice-bubble"
import { ReviewForm } from "@/components/review-form"

export const metadata = {
  title: "お客様の声｜アイアン手すり購入レビュー｜IRONWORKS ado",
  description:
    "IRONWORKS ado のアイアン手すりをご購入いただいたお客様から頂いた嬉しいお言葉をご紹介しています。",
  alternates: { canonical: "/reviews" },
}

export default function ReviewsPage() {
  return (
    <>
      <Header />
      <main className="pt-20 lg:pt-24 pb-20 bg-background">
        <div className="border-b border-border">
          <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">
              IRONWORKS Lover&apos;s Voice
            </p>
            <h1 className="font-serif text-3xl lg:text-5xl text-foreground">お客様の声</h1>
            <p className="text-[13px] text-muted-foreground mt-3 max-w-[640px]">
              IRONWORKS ado の手すりをお選びいただいた全国のお客様から、
              嬉しいお言葉を頂戴しております。その一部をご紹介いたします。
            </p>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
          {REVIEW_QUOTES.length === 0 ? (
            <p className="text-[14px] text-muted-foreground text-center py-12">
              お客様の声はまだありません。
            </p>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
              {REVIEW_QUOTES.map((q) => (
                <VoiceBubble key={q.id} voice={q} />
              ))}
            </div>
          )}

          {/* レビュー投稿フォーム（2026-06-13 監査 C群⑱） */}
          <section className="mt-20 pt-12 border-t border-border max-w-[760px] mx-auto">
            <div className="text-center mb-8">
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Your Voice</p>
              <h2 className="font-serif text-2xl lg:text-3xl text-foreground">
                あなたの声をお聞かせください
              </h2>
              <p className="text-[13px] md:text-sm text-muted-foreground mt-3 leading-relaxed">
                ご購入いただいた手すりの使い心地はいかがですか。
                <br className="hidden md:block" />
                お写真を添えたご感想は、これから選ぶ方の何よりの参考になります。
              </p>
            </div>
            <ReviewForm />
          </section>

          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-block px-8 py-4 border border-border text-muted-foreground text-[10px] tracking-[0.3em] uppercase hover:border-gold hover:text-gold transition-colors"
            >
              トップへ戻る
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
