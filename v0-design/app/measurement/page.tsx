import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import Image from "next/image"

export const metadata = {
  title: "採寸費・取付費について｜IRONWORKS ado アイアン手すり",
  description:
    "千葉県千葉市の工房から片道 120km 圏内であれば、工房スタッフによる採寸・取付作業を承ります。エリア区分と料金の目安をご案内します。",
  alternates: { canonical: "/measurement" },
}

export default function MeasurementPage() {
  return (
    <>
      <Header />
      <main className="pt-20 lg:pt-24 pb-20 bg-background">
        <div className="border-b border-border">
          <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">
              Measurement &amp; Installation
            </p>
            <h1 className="font-serif text-3xl lg:text-5xl text-foreground mb-4">
              採寸費・取付費について
            </h1>
            <p className="text-[14px] leading-[1.95] text-muted-foreground max-w-[640px]">
              通常は佐川急便にてお届けしておりますが、当工房（千葉県千葉市）から片道 120km
              圏内であれば、工房スタッフによる採寸および取付作業を承っています。費用は工房
              からの距離によって異なります。
            </p>
          </div>
        </div>

        <div className="max-w-[800px] mx-auto px-4 lg:px-8 py-16">
          <div className="space-y-14">
            {/* 対応エリア */}
            <section>
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">
                Area
              </p>
              <h2 className="font-serif text-xl lg:text-2xl text-foreground mb-6 pb-3 border-b border-border">
                採寸・取付にお伺いできるエリア
              </h2>
              <div className="relative w-full mb-7 overflow-hidden rounded-md bg-secondary aspect-[4/3]">
                <Image
                  src="/images/info/measurement-area-map.jpg"
                  alt="IRONWORKS ado 採寸・取付対応エリアマップ（千葉県千葉市から片道 120km 圏内）"
                  fill
                  sizes="(max-width: 800px) 100vw, 800px"
                  className="object-contain bg-white"
                />
              </div>
              <div className="space-y-5">
                <p className="text-[14px] leading-[2] text-foreground/80">
                  当工房は <strong className="text-foreground">千葉県千葉市</strong>{" "}
                  にあります。片道走行距離 120km 圏内であれば、工房スタッフによる出張採寸・
                  取付作業を承ります。
                </p>
                <p className="text-[14px] leading-[2] text-foreground/80">
                  エリア外への配送は、通常通り佐川急便にて承ります。お近くの施工業者さま
                  への取付指示書もご用意できますので、お気軽にご相談ください。
                </p>
              </div>
            </section>

            {/* 料金表（標準） */}
            <section>
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">
                Pricing — Standard
              </p>
              <h2 className="font-serif text-xl lg:text-2xl text-foreground mb-6 pb-3 border-b border-border">
                採寸・取付料金一覧（目安）
              </h2>
              <div className="relative w-full mb-7 overflow-hidden rounded-md bg-secondary aspect-[4/3]">
                <Image
                  src="/images/info/measurement-pricelist-standard.jpg"
                  alt="採寸・取付料金一覧（標準サイズの目安）"
                  fill
                  sizes="(max-width: 800px) 100vw, 800px"
                  className="object-contain bg-white"
                />
              </div>
            </section>

            {/* 料金表（大型） */}
            <section>
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">
                Pricing — Large
              </p>
              <h2 className="font-serif text-xl lg:text-2xl text-foreground mb-6 pb-3 border-b border-border">
                大型サイズの料金一覧（目安）
              </h2>
              <div className="relative w-full mb-7 overflow-hidden rounded-md bg-secondary aspect-[4/3]">
                <Image
                  src="/images/info/measurement-pricelist-large.jpg"
                  alt="採寸・取付料金一覧（大型サイズの目安）"
                  fill
                  sizes="(max-width: 800px) 100vw, 800px"
                  className="object-contain bg-white"
                />
              </div>
              <div className="space-y-5">
                <p className="text-[14px] leading-[2] text-foreground/80">
                  <strong className="text-foreground">大型サイズの目安：</strong>{" "}
                  手すり 9 段以上とフェンスがセットになった場合、単体でも手すり 11
                  段以上など 1 つの大きさが大きい場合、ほかにも作業が困難など特殊な
                  ケースが該当することがあります。
                </p>
              </div>
            </section>

            {/* 注意事項 */}
            <section>
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">
                Notes
              </p>
              <h2 className="font-serif text-xl lg:text-2xl text-foreground mb-6 pb-3 border-b border-border">
                ご注意ください
              </h2>
              <ul className="space-y-4 text-[14px] leading-[2] text-foreground/80 list-disc pl-5">
                <li>
                  首都高・アクアラインを使用する場合は、別途料金が加算されます。
                </li>
                <li>
                  エリア区分・料金はあくまで目安です。お見積もりの際は、実際の距離を
                  もとに採寸費・取付費をご提示いたします。
                </li>
                <li>
                  120km 圏外でも、ご相談のうえ対応できる場合があります。お気軽に
                  お問い合わせください。
                </li>
              </ul>
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
                  <Link href="/shipping" className="text-gold hover:underline">
                    送料・配送について
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-gold hover:underline">
                    よくあるご質問（FAQ）
                  </Link>
                </li>
                <li>
                  <Link href="/trade" className="text-gold hover:underline">
                    工務店・設計事務所の方へ
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
              採寸・取付のご相談をする
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
