import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Star } from "lucide-react"
import { TESTIMONIALS, OVERALL_RATING, TOTAL_REVIEWS } from "@/lib/testimonials"

export const metadata = {
  title: "お客様の声 | IRONWORKS ado",
  description:
    "IRONWORKS ado の手摺をご購入いただいたお客様からのレビュー・評価をご紹介しています。",
}

function Stars({ rating, className = "w-4 h-4" }: { rating: number; className?: string }) {
  return (
    <div className="flex gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          className={`${className} ${i < rating ? "fill-gold text-gold" : "fill-border text-border"}`}
        />
      ))}
    </div>
  )
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

            <div className="mt-6 flex items-center gap-4 bg-secondary rounded-full px-6 py-3 w-fit">
              <div className="flex items-baseline gap-1">
                <span className="text-[32px] font-light text-gold leading-none">
                  {OVERALL_RATING}
                </span>
                <span className="text-[13px] text-muted-foreground">/5</span>
              </div>
              <div className="flex flex-col gap-1">
                <Stars rating={Math.round(OVERALL_RATING)} className="w-4 h-4" />
                <span className="text-[11px] text-muted-foreground">
                  {TOTAL_REVIEWS}件以上のレビュー
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
          {TESTIMONIALS.length === 0 ? (
            <p className="text-[14px] text-muted-foreground text-center py-12">
              レビューはまだありません。
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {TESTIMONIALS.map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-xl p-6 border border-border shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold font-medium text-sm">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-[13px] text-foreground font-medium">{t.name}</p>
                      <p className="text-[11px] text-muted-foreground">{t.location}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <Stars rating={t.rating} className="w-3.5 h-3.5" />
                  </div>

                  <div className="mb-4">
                    <p className="text-[13px] font-medium text-foreground">{t.product}</p>
                    <p className="text-[11px] text-gold">{t.variant}</p>
                  </div>

                  <p className="text-[14px] text-muted-foreground leading-relaxed">
                    {t.text}
                  </p>
                </div>
              ))}
            </div>
          )}

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
