import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { VOICE_IMAGES } from "@/lib/testimonials"

export const metadata = {
  title: "お客様の声 | IRONWORKS ado",
  description:
    "IRONWORKS ado の手摺をご購入いただいたお客様からのレビュー・評価をご紹介しています。",
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
          </div>
        </div>

        <div className="max-w-[1000px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
          {VOICE_IMAGES.length === 0 ? (
            <p className="text-[14px] text-muted-foreground text-center py-12">
              レビューはまだありません。
            </p>
          ) : (
            <div className="flex flex-col gap-6 lg:gap-8">
              {VOICE_IMAGES.map((voice) => (
                <div
                  key={voice.id}
                  className="bg-white rounded-xl overflow-hidden border border-border shadow-sm"
                >
                  <img
                    src={voice.src}
                    alt={voice.alt}
                    className="w-full h-auto block"
                    loading="lazy"
                  />
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
