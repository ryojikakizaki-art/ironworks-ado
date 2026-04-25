import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import Image from "next/image"
import { VOICE_SLIDES, TOTAL_VOICE_COUNT } from "@/lib/testimonials"

export const metadata = {
  title: "お客様の声 | IRONWORKS ado",
  description:
    "IRONWORKS ado の手摺をご購入いただいたお客様から頂いた嬉しいお言葉をご紹介しています。",
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
              全国 {TOTAL_VOICE_COUNT} 名以上のお客様から、IRONWORKS ado の手摺について
              嬉しいお言葉を頂戴しております。その一部をご紹介いたします。
            </p>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
          {VOICE_SLIDES.length === 0 ? (
            <p className="text-[14px] text-muted-foreground text-center py-12">
              お客様の声はまだありません。
            </p>
          ) : (
            <div className="space-y-8">
              {VOICE_SLIDES.map((slide) => (
                <figure
                  key={slide.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden border border-border"
                >
                  <div className="relative aspect-[1600/650] w-full">
                    <Image
                      src={slide.src}
                      alt={slide.alt}
                      fill
                      sizes="(max-width: 1200px) 100vw, 1200px"
                      className="object-contain"
                    />
                  </div>
                  <figcaption className="sr-only">{slide.alt}</figcaption>
                </figure>
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
