import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import Image from "next/image"

export const metadata = {
  title: "送料・配送について｜IRONWORKS ado アイアン手すり",
  description:
    "全国へ佐川急便にて配送いたします。沖縄県・離島はお見積もり、4t 車制限などお届けできないエリアもございます。納品先住所を添えてお問い合わせください。",
  alternates: { canonical: "/shipping" },
}

export default function ShippingPage() {
  return (
    <>
      <Header />
      <main className="pt-20 lg:pt-24 pb-20 bg-background">
        <div className="border-b border-border">
          <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">
              Shipping
            </p>
            <h1 className="font-serif text-3xl lg:text-5xl text-foreground mb-4">
              送料・配送について
            </h1>
            <p className="text-[14px] leading-[1.95] text-muted-foreground max-w-[640px]">
              全国へ佐川急便にて丁寧に梱包してお届けいたします。配送先と商品サイズによっては
              お見積もりまたは配送不可となる地域がございます。
            </p>
          </div>
        </div>

        <div className="max-w-[800px] mx-auto px-4 lg:px-8 py-16">
          <div className="space-y-14">
            {/* 配送方法 */}
            <section>
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">
                Method
              </p>
              <h2 className="font-serif text-xl lg:text-2xl text-foreground mb-6 pb-3 border-b border-border">
                配送方法
              </h2>
              <div className="space-y-5">
                <p className="text-[14px] leading-[2] text-foreground/80">
                  遠方のお客さま、または業者さまによる取付の際には、丁寧に梱包のうえ 佐川急便
                  にて全国へ配送いたします。
                </p>
                <p className="text-[14px] leading-[2] text-foreground/80">
                  送料は配送先・商品サイズに応じた実費でのご請求となり、お見積もり時に目安を
                  お伝えします。
                </p>
              </div>
            </section>

            {/* 沖縄・離島 */}
            <section>
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">
                Quote
              </p>
              <h2 className="font-serif text-xl lg:text-2xl text-foreground mb-6 pb-3 border-b border-border">
                沖縄県・離島へのお届け
              </h2>
              <div className="space-y-5">
                <p className="text-[14px] leading-[2] text-foreground/80">
                  沖縄県・離島へのお届けは別途お見積もりとなります。お問い合わせの際に
                  配送先住所をお知らせください。
                </p>
              </div>
            </section>

            {/* 配送不可エリア */}
            <section>
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">
                Restricted
              </p>
              <h2 className="font-serif text-xl lg:text-2xl text-foreground mb-6 pb-3 border-b border-border">
                配送できない地域について
              </h2>
              <div className="relative w-full mb-7 overflow-hidden rounded-md bg-secondary aspect-[3/2]">
                <Image
                  src="/images/info/shipping-no-go-area.jpg"
                  alt="アイアン手すりを配送できない地域の参考マップ"
                  fill
                  sizes="(max-width: 800px) 100vw, 800px"
                  className="object-contain bg-white"
                />
              </div>
              <div className="space-y-5">
                <p className="text-[14px] leading-[2] text-foreground/80">
                  4t 車制限や道路状況などにより、お届けができない地域がございます。
                  上記マップ以外の地域でも発送可否の確認が必要となる場合がありますので、
                  お問い合わせの際は <strong className="text-foreground">納品先住所</strong>{" "}
                  を必ずお知らせいただきますようお願いいたします。
                </p>
              </div>
            </section>

            {/* 関連リンク */}
            <section>
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">
                Related
              </p>
              <h2 className="font-serif text-xl lg:text-2xl text-foreground mb-6 pb-3 border-b border-border">
                ご注文関連のご案内
              </h2>
              <ul className="space-y-3 text-[14px] text-foreground/80">
                <li>
                  <Link href="/measurement" className="text-gold hover:underline">
                    採寸・取付費について（千葉県千葉市から 120km 圏内）
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-gold hover:underline">
                    よくあるご質問（FAQ）
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gold hover:underline">
                    お問い合わせフォーム
                  </Link>
                </li>
              </ul>
            </section>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/contact"
              className="inline-block px-8 py-4 border border-gold text-gold text-[10px] tracking-[0.3em] uppercase hover:bg-gold hover:text-dark transition-colors"
            >
              お問い合わせする
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
