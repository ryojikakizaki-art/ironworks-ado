import Link from 'next/link';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata = {
  title: 'Order ｜ 鍛鉄工房 ZEST',
  description:
    'フルオーダー制作の流れ。お問い合わせから現地打ち合わせ・図案・鍛造・取り付けまで、鍛冶師・蠣﨑良治が一貫して手がけます。',
};

const steps: { en: string; ja: string; body: string }[] = [
  {
    en: 'Inquiry',
    ja: 'お問い合わせ',
    body: 'メールフォームから、設置場所の写真・大まかな寸法・ご要望をお送りください。',
  },
  {
    en: 'Hearing',
    ja: 'ヒアリング',
    body: '現地にお伺いするか、工房での打ち合わせ、もしくはオンラインで詳細をお聞きします。住まいの空気感、生活動線、隣接素材の質感まで含めて。',
  },
  {
    en: 'Sketch & Quote',
    ja: '手描き図案・お見積り',
    body: '蠣﨑が直接、手描きの図案をお返しします。同時に、素材・仕上げ・寸法に基づいたお見積りをお出しします。',
  },
  {
    en: 'Agreement',
    ja: 'ご契約・着手金',
    body: '内容にご同意いただけたら、契約書を交わし、着手金をお預かりします。納期はこの時点で確定します。',
  },
  {
    en: 'Forging',
    ja: '鍛造・制作',
    body: '工房で、鉄を熱しながら一打ずつ打ち上げていきます。制作の途中経過は、ご希望に応じて写真でお伝えします。',
  },
  {
    en: 'Finishing',
    ja: '仕上げ・塗装',
    body: '錆止めの後、黒皮仕上げ・蜜蝋・粉体塗装などご指定の塗装を施します。屋外用は耐候性を考慮した仕様で。',
  },
  {
    en: 'Delivery & Install',
    ja: '配送・取り付け',
    body: 'ご自宅まで配送し、取り付けまで責任を持ってお引き受けします。設置後の小さな調整も含めて。',
  },
];

export default function OrderPage() {
  return (
    <main className="bg-paper text-ink">
      <SiteHeader variant="on-paper" />

      {/* ─── Title ─────────────────────────────────── */}
      <section className="px-8 md:px-12 pt-40 md:pt-48 pb-16 md:pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="font-en-sans text-[11px] tracking-[0.4em] uppercase text-rust mb-8">
            Order — Custom forging process
          </div>
          <h1 className="font-en font-light text-5xl md:text-7xl leading-[1.05] tracking-tight max-w-4xl">
            Made to order,
            <br />
            <em className="italic font-normal">forged for the place.</em>
          </h1>
          <p className="mt-12 max-w-2xl text-[15px] md:text-[16px] leading-[2.0] tracking-[0.04em] text-ink-soft">
            お問い合わせから取り付けまでの 7 ステップ。
            ZEST のフルオーダーは、図案も鍛造も仕上げも、すべて職人本人が一貫して手がけます。
          </p>
        </div>
      </section>

      {/* ─── Steps ─────────────────────────────────── */}
      <section className="px-8 md:px-12 pb-24 md:pb-32 border-t border-line">
        <div className="mx-auto max-w-5xl divide-y divide-line">
          {steps.map((s, i) => (
            <article key={s.en} className="py-12 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
              <div className="md:col-span-3">
                <div className="font-en-sans text-[10px] tracking-[0.4em] uppercase text-ash mb-3">
                  Step {String(i + 1).padStart(2, '0')}
                </div>
                <h2 className="font-en text-2xl md:text-3xl tracking-tight italic">{s.en}</h2>
                <div className="font-ja text-[15px] mt-2 tracking-[0.05em] text-ink-soft">{s.ja}</div>
              </div>
              <div className="md:col-span-9 md:pt-2">
                <p className="text-[15px] md:text-[16px] leading-[2.1] tracking-[0.04em] text-ink-soft max-w-2xl">
                  {s.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ─── Notes ─────────────────────────────────── */}
      <section className="px-8 md:px-12 py-24 md:py-32 bg-paper-deep">
        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
          <div>
            <div className="font-en-sans text-[11px] tracking-[0.4em] uppercase text-rust mb-4">Lead time</div>
            <h3 className="font-en text-2xl md:text-3xl tracking-tight mb-6">納期の目安</h3>
            <p className="text-[15px] leading-[2.0] tracking-[0.04em] text-ink-soft">
              小物・表札で 1〜2ヶ月。手すり・面格子で 2〜3ヶ月。門扉・大型のフェンスは 4ヶ月〜。
              繁忙期や素材調達状況によって前後します。
            </p>
          </div>
          <div>
            <div className="font-en-sans text-[11px] tracking-[0.4em] uppercase text-rust mb-4">Pricing</div>
            <h3 className="font-en text-2xl md:text-3xl tracking-tight mb-6">価格について</h3>
            <p className="text-[15px] leading-[2.0] tracking-[0.04em] text-ink-soft">
              一点ものにつき定価はありません。素材・寸法・装飾の密度・取り付け条件により都度お見積り。
              規格化された手すりは、姉妹ブランド <Link href="https://ado.tantetuzest.com" className="border-b border-ink/40 hover:border-ink">ironworks ado</Link> でご覧いただけます。
            </p>
          </div>
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────── */}
      <section className="px-8 md:px-12 py-24 md:py-32 bg-ink text-paper">
        <div className="mx-auto max-w-3xl text-center">
          <div className="font-en-sans text-[11px] tracking-[0.4em] uppercase text-paper/60 mb-6">
            Begin
          </div>
          <h2 className="font-en font-light text-3xl md:text-5xl leading-[1.15] tracking-tight mb-10">
            <em className="italic">Tell us</em> about the place.
          </h2>
          <p className="text-[15px] leading-[2.0] tracking-[0.04em] text-paper/75 mb-12">
            設置場所の写真と、ご希望のイメージを添えてご連絡ください。
            鍛鉄でできること・できないこと、率直にお返事いたします。
          </p>
          <Link
            href="/contact"
            className="inline-block font-en-sans text-[12px] tracking-[0.32em] uppercase border-b border-paper pb-1"
          >
            Start an inquiry →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
