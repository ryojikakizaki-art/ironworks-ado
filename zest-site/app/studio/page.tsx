import Image from 'next/image';
import Link from 'next/link';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata = {
  title: 'Studio ｜ 鍛鉄工房 ZEST',
  description:
    '千葉市若葉区の鍛鉄工房 ZEST、職人・蠣﨑良治の工房と仕事の紹介。鍛鉄職人歴15年、西洋鍛冶の技術で住まいの一点ものを制作しています。',
};

const workshopImage = 'https://i0.wp.com/tantetuzest.com/wp-content/uploads/2021/04/DSCF5067.jpg';
const portraitImage = 'https://i0.wp.com/tantetuzest.com/wp-content/uploads/2021/04/1100203.jpg';
const toolImage = 'https://i0.wp.com/tantetuzest.com/wp-content/uploads/2021/04/1140312.jpg';

export default function StudioPage() {
  return (
    <main className="bg-paper text-ink">
      <SiteHeader variant="over-image" />

      {/* ─── Hero ─────────────────────────────────── */}
      <section className="relative h-[80svh] w-full overflow-hidden">
        <Image
          src={workshopImage}
          alt="鍛鉄工房 ZEST の工房"
          fill
          priority
          sizes="100vw"
          className="object-cover grayscale-[20%] brightness-[0.78]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/55" />
        <div className="relative z-10 flex h-full flex-col justify-end px-8 pb-20 md:px-12 md:pb-28 text-paper">
          <div className="font-en-sans text-[11px] tracking-[0.4em] uppercase opacity-80 mb-6">
            Studio &nbsp;·&nbsp; Wakaba, Chiba
          </div>
          <h1 className="font-en font-light text-5xl md:text-7xl leading-[1.05] tracking-tight max-w-4xl">
            The forge,
            <br />
            <em className="italic font-normal">in the woods of Chiba.</em>
          </h1>
        </div>
      </section>

      {/* ─── Profile ──────────────────────────────── */}
      <section className="px-8 md:px-12 py-32 md:py-44">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20 items-start">
          <div className="md:col-span-5 relative aspect-[4/5] order-1 md:order-2">
            <Image
              src={portraitImage}
              alt="鍛冶師・蠣﨑良治"
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover grayscale-[10%]"
            />
          </div>
          <div className="md:col-span-7 order-2 md:order-1">
            <div className="font-en-sans text-[11px] tracking-[0.4em] uppercase text-rust mb-8">
              01 — Blacksmith
            </div>
            <h2 className="font-en font-light text-3xl md:text-5xl leading-[1.15] tracking-tight mb-12">
              <em className="italic">Kakizaki Ryoji</em>
              <br />
              鍛冶師・蠣﨑良治
            </h2>
            <div className="hairline mb-12 max-w-md" />
            <div className="space-y-7 text-[15px] md:text-[16px] leading-[2.1] tracking-[0.04em] text-ink-soft max-w-xl">
              <p>
                千葉市若葉区にて鍛鉄工房 ZEST を主宰。
                西洋鍛冶（フォージング）の技術で、住まいの門扉・手すり・表札・家具・小物を、フルオーダーで制作しています。
              </p>
              <p>
                鍛鉄職人として15年。
                独立してからは、ご依頼主と直接お話して図面と素材を決め、火造り・鍛造から仕上げ・取り付けまで、一貫して手がけてきました。
              </p>
              <p>
                鍛鉄は、日本の鍛冶とは少し違う技術です。
                赤らむまで熱した鉄を、ハンマーで叩き、引き伸ばし、ねじり、唐草や葉のかたちに造形していく。
                産業革命より前から続いてきた西洋の手仕事を、千葉の小さな工房で今も同じように続けています。
              </p>
              <p>
                住まいで毎日触れる金物だからこそ、握ったときに手がよろこぶものを作りたい — それがこの仕事を始めてから変わらない、ものづくりの原点です。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Workshop ─────────────────────────────── */}
      <section className="px-8 md:px-12 py-24 md:py-32 bg-paper-deep">
        <div className="mx-auto max-w-7xl">
          <div className="font-en-sans text-[11px] tracking-[0.4em] uppercase text-rust mb-6">
            02 — Workshop
          </div>
          <h2 className="font-en font-light text-3xl md:text-5xl leading-[1.15] tracking-tight mb-16 max-w-3xl">
            A small forge,<br />
            <em className="italic">filled with smoke and iron.</em>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-start">
            <div className="md:col-span-7 relative aspect-[4/3]">
              <Image
                src={toolImage}
                alt="工房の道具"
                fill
                sizes="(min-width: 768px) 58vw, 100vw"
                className="object-cover grayscale-[15%]"
              />
            </div>
            <div className="md:col-span-5">
              <div className="space-y-6 text-[15px] leading-[2.0] tracking-[0.04em] text-ink-soft">
                <p>
                  千葉市若葉区和泉町。住宅地の外れ、林に近い小さな工房です。
                  ガス炉、アンビル（金床）、スプリングハンマー、ベルトサンダー。
                  火を扱う仕事道具が、無造作に並んでいます。
                </p>
                <p>
                  決まったショールームはありません。打ち合わせは現地・工房・オンラインのいずれでも。
                  ご相談の際は、お問い合わせフォームからお気軽にどうぞ。
                </p>
              </div>
              <dl className="mt-12 space-y-6 text-[13px] leading-[1.7] tracking-[0.04em]">
                <SpecRow label="Address" value="〒265-0052 千葉市若葉区和泉町 239-2" />
                <SpecRow label="Hours" value="Mon — Fri  9:00 – 18:00（要事前連絡）" />
                <SpecRow label="Founded" value="2010" />
                <SpecRow label="Tel" value="070-3817-0659" />
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────── */}
      <section className="px-8 md:px-12 py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="font-en-sans text-[11px] tracking-[0.4em] uppercase text-rust mb-6">
            Visit & Inquiry
          </div>
          <h2 className="font-en font-light text-3xl md:text-4xl leading-[1.2] tracking-tight mb-10">
            <em className="italic">Welcome</em> — to the forge.
          </h2>
          <p className="text-[15px] leading-[2.0] tracking-[0.04em] text-ink-soft mb-12">
            工房での打ち合わせは事前のご連絡をお願いしています。
            ご相談の段階から、図面・素材・予算まで、お気軽にどうぞ。
          </p>
          <Link
            href="/contact"
            className="inline-block font-en-sans text-[12px] tracking-[0.32em] uppercase border-b border-ink pb-1"
          >
            Get in touch →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function SpecRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-4">
      <dt className="font-en-sans text-[10px] tracking-[0.32em] uppercase text-ash">{label}</dt>
      <dd className="text-ink-soft">{value}</dd>
    </div>
  );
}
