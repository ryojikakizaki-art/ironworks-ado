import Link from 'next/link';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata = {
  title: 'Contact ｜ 鍛鉄工房 ZEST',
  description:
    '鍛鉄工房 ZEST へのお問い合わせ。フルオーダー制作のご相談・工房訪問のご予約。',
};

export default function ContactPage() {
  return (
    <main className="bg-paper text-ink">
      <SiteHeader variant="on-paper" />

      {/* ─── Title ─────────────────────────────────── */}
      <section className="px-8 md:px-12 pt-40 md:pt-48 pb-16 md:pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="font-en-sans text-[11px] tracking-[0.4em] uppercase text-rust mb-8">
            Contact — Inquiry & Visit
          </div>
          <h1 className="font-en font-light text-5xl md:text-7xl leading-[1.05] tracking-tight max-w-4xl">
            Tell us
            <br />
            <em className="italic font-normal">about the place.</em>
          </h1>
          <p className="mt-10 max-w-2xl text-[15px] leading-[2.0] tracking-[0.04em] text-ink-soft">
            設置場所の写真と、ご希望のイメージを添えてご連絡ください。
            鍛鉄でできること・できないこと、率直にお返事いたします。
          </p>
        </div>
      </section>

      {/* ─── Contact info ──────────────────────────── */}
      <section className="px-8 md:px-12 py-16 md:py-24 border-t border-line">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20">
          <div className="md:col-span-5">
            <div className="font-en-sans text-[11px] tracking-[0.4em] uppercase text-rust mb-6">
              01 — Direct
            </div>
            <h2 className="font-en font-light text-3xl md:text-4xl tracking-tight mb-12 italic">
              Email or phone.
            </h2>
            <dl className="space-y-10">
              <div>
                <dt className="font-en-sans text-[10px] tracking-[0.4em] uppercase text-ash mb-3">Email</dt>
                <dd className="text-2xl md:text-3xl tracking-tight font-en">
                  <a href="mailto:kaki@tantetuzest.com" className="border-b border-ink/40 hover:border-ink pb-1">
                    kaki@tantetuzest.com
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-en-sans text-[10px] tracking-[0.4em] uppercase text-ash mb-3">Phone</dt>
                <dd className="text-2xl md:text-3xl tracking-tight font-en">
                  <a href="tel:07038170659" className="border-b border-ink/40 hover:border-ink pb-1">
                    070 — 3817 — 0659
                  </a>
                </dd>
                <p className="mt-3 text-[13px] tracking-[0.04em] text-ash">
                  Mon — Fri　9:00 – 18:00
                </p>
              </div>
              <div>
                <dt className="font-en-sans text-[10px] tracking-[0.4em] uppercase text-ash mb-3">Studio</dt>
                <dd className="text-[15px] leading-[2.0] tracking-[0.04em] text-ink-soft">
                  〒265-0052<br />
                  千葉市若葉区和泉町 239-2<br />
                  <span className="text-ash text-[12px]">※工房訪問は事前のご連絡をお願いいたします</span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="md:col-span-6 md:col-start-7">
            <div className="font-en-sans text-[11px] tracking-[0.4em] uppercase text-rust mb-6">
              02 — Inquiry checklist
            </div>
            <h2 className="font-en font-light text-3xl md:text-4xl tracking-tight mb-12 italic">
              What to send.
            </h2>
            <ul className="space-y-8 text-[15px] leading-[2.0] tracking-[0.04em] text-ink-soft">
              <ChecklistItem
                num="01"
                title="設置場所の写真"
                body="正面・斜め・遠景の3カットを目安に。周辺の建材・床・壁の質感がわかると、合わせやすくなります。"
              />
              <ChecklistItem
                num="02"
                title="大まかな寸法"
                body="メジャーで測った概寸で構いません。確定寸法は現地確認でこちらが採寸します。"
              />
              <ChecklistItem
                num="03"
                title="ご希望のイメージ"
                body="参考画像（ピンタレスト・雑誌の切り抜き・ZEST の制作事例など）があれば、複数枚お送りください。「言葉では表現しにくい」を補えます。"
              />
              <ChecklistItem
                num="04"
                title="ご予算感（任意）"
                body="決まっていればお知らせください。決まっていなくても、提示する選択肢を絞り込めます。"
              />
              <ChecklistItem
                num="05"
                title="ご希望の時期"
                body="納期に合わせて、早めにご相談ください。"
              />
            </ul>
          </div>
        </div>
      </section>

      {/* ─── ado link ──────────────────────────────── */}
      <section className="px-8 md:px-12 py-24 md:py-32 bg-paper-deep">
        <div className="mx-auto max-w-3xl text-center">
          <div className="font-en-sans text-[11px] tracking-[0.4em] uppercase text-rust mb-4">
            Looking for ready-made?
          </div>
          <p className="text-[15px] leading-[2.0] tracking-[0.04em] text-ink-soft mb-8 max-w-xl mx-auto">
            規格化された手すりや小物は、姉妹ブランドの ironworks ado から直接ご注文いただけます。
          </p>
          <Link
            href="https://ado.tantetuzest.com"
            className="inline-block font-en-sans text-[12px] tracking-[0.32em] uppercase border-b border-ink pb-1"
          >
            Visit ironworks ado →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function ChecklistItem({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <li className="grid grid-cols-[44px_1fr] gap-5 pb-6 border-b border-line last:border-b-0 last:pb-0">
      <span className="font-en-sans text-[11px] tracking-[0.32em] text-ash pt-1">{num}</span>
      <div>
        <div className="font-ja text-[17px] tracking-[0.05em] mb-2">{title}</div>
        <p className="text-[14px] leading-[1.95] text-ink-soft">{body}</p>
      </div>
    </li>
  );
}
