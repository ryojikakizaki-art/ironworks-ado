import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "利用規約 | IRONWORKS ado",
  description: "IRONWORKS ado の利用規約 — サイト・商品のご利用について",
}

const sections = [
  {
    title: "第1条（適用）",
    body:
      "本規約は、鍛鉄工房ZEST（IRONWORKS ado、以下「当店」）がウェブサイト ado.tantetuzest.com 上で提供する商品の販売およびサービスに関し、お客様と当店との間の一切の関係に適用されます。",
  },
  {
    title: "第2条（お申込みおよび契約の成立）",
    body: (
      <>
        1. 商品のご注文は、所定のフォームに必要事項を入力し送信することで成立します。
        <br />
        2. 受注制作の特性上、ご注文確定後の仕様変更・キャンセルは原則としてお受けできません。
        <br />
        3. 在庫切れ・制作不可等の事由により、ご注文をお受けできない場合があります。
      </>
    ),
  },
  {
    title: "第3条（代金のお支払い）",
    body:
      "商品代金は、ご注文時にクレジットカード決済（Stripe）にてお支払いいただきます。商品代金以外に送料・特急配送料金（ご希望の場合）が発生いたします。",
  },
  {
    title: "第4条（商品の引渡し）",
    body:
      "商品の引渡しは、お客様指定の配送先住所への配送をもって行います。通常配送は約10営業日、特急配送は約5営業日を目安としております。制作状況により前後する場合があります。",
  },
  {
    title: "第5条（返品・交換）",
    body:
      "お客様ご都合による返品・交換は受注制作のためお受けできません。商品に不良・破損がある場合は、商品到着後 7日以内にご連絡いただければ、当店負担にて交換・修理いたします。",
  },
  {
    title: "第6条（禁止事項）",
    body: (
      <>
        お客様は、本サービスの利用にあたり、以下の行為をしてはなりません。
        <ul className="list-disc pl-5 space-y-1 mt-3">
          <li>法令または公序良俗に違反する行為</li>
          <li>当店または第三者の知的財産権、肖像権、プライバシー権等を侵害する行為</li>
          <li>当店のサーバーまたはネットワークの機能を破壊・妨害する行為</li>
          <li>不正アクセス、なりすまし、虚偽情報の入力</li>
          <li>転売目的での購入、その他当店が不適切と判断する行為</li>
        </ul>
      </>
    ),
  },
  {
    title: "第7条（知的財産権）",
    body:
      "本サイトに掲載されている写真・文章・デザイン・ロゴ・商品形状等、一切のコンテンツに関する著作権・意匠権その他の知的財産権は、当店または正当な権利者に帰属します。無断転載・複製・商用利用を固く禁じます。",
  },
  {
    title: "第8条（免責事項）",
    body: (
      <>
        1. 当店は、本サービスの内容・正確性・有用性について、いかなる保証も行いません。
        <br />
        2. 本サービスに起因または関連して生じた損害について、当店の責めに帰すべき事由による場合を除き、責任を負いません。
        <br />
        3. 天災・戦争・通信障害その他不可抗力による商品の遅延・不達については、当店は責任を負いません。
      </>
    ),
  },
  {
    title: "第9条（規約の変更）",
    body:
      "当店は、必要と判断した場合には、お客様に通知することなく本規約を変更することができます。変更後の規約は、本サイトに掲載された時点から効力を生じます。",
  },
  {
    title: "第10条（準拠法・裁判管轄）",
    body:
      "本規約の解釈・適用には日本法が適用されるものとし、本サービスに関して紛争が生じた場合は、千葉地方裁判所を第一審の専属的合意管轄裁判所とします。",
  },
]

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="pt-20 lg:pt-24 pb-20 bg-background">
        <div className="border-b border-border">
          <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">
              Legal
            </p>
            <h1 className="font-serif text-3xl lg:text-5xl text-foreground">
              利用規約
            </h1>
          </div>
        </div>

        <div className="max-w-[800px] mx-auto px-4 lg:px-8 py-16 space-y-10">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="font-serif text-xl lg:text-2xl mb-4 text-foreground">
                {s.title}
              </h2>
              <div className="text-[14px] leading-[1.9] text-muted-foreground">
                {s.body}
              </div>
            </section>
          ))}

          <p className="pt-8 border-t border-border text-[12px] text-muted-foreground">
            最終更新日: 2026年4月20日
            <br />
            鍛鉄工房ZEST（IRONWORKS ado）
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
