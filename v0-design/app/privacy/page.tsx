import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "プライバシーポリシー | IRONWORKS ado",
  description: "IRONWORKS ado のプライバシーポリシー — お客様の個人情報の取扱いについて",
}

const sections = [
  {
    title: "1. 事業者情報",
    body: (
      <>
        屋号：鍛鉄工房ZEST／IRONWORKS ado
        <br />
        代表者：蠣崎 良治
        <br />
        所在地：〒265-0052 千葉県千葉市若葉区和泉町239-2
        <br />
        連絡先：ado@tantetuzest.com
      </>
    ),
  },
  {
    title: "2. 取得する個人情報",
    body: (
      <ul className="list-disc pl-5 space-y-2">
        <li>お名前・フリガナ</li>
        <li>ご住所・電話番号</li>
        <li>メールアドレス</li>
        <li>商品のお届け先情報</li>
        <li>クレジットカード決済に関する情報（※Stripeが取扱い、当方ではカード番号を保持しません）</li>
        <li>Cookie、アクセスログ、IPアドレス等のサイト利用情報</li>
      </ul>
    ),
  },
  {
    title: "3. 利用目的",
    body: (
      <ul className="list-disc pl-5 space-y-2">
        <li>商品の受注・製造・配送・アフターサービスの提供</li>
        <li>お問い合わせへの回答</li>
        <li>お客様への連絡（制作進捗、発送通知、請求書の発行等）</li>
        <li>本サービスの改善・分析</li>
        <li>法令に基づく対応</li>
      </ul>
    ),
  },
  {
    title: "4. 第三者への提供",
    body: (
      <>
        法令に基づく場合を除き、お客様の個人情報を第三者に提供することはありません。
        ただし、以下の業務委託先には、必要な範囲で情報を提供する場合があります。
        <ul className="list-disc pl-5 space-y-2 mt-3">
          <li>クレジットカード決済代行：Stripe, Inc.（米国）</li>
          <li>メール配信：Resend, Inc.（米国）</li>
          <li>配送業者：ヤマト運輸、佐川急便、西濃運輸 等</li>
          <li>ホスティング：Vercel Inc.（米国）</li>
        </ul>
      </>
    ),
  },
  {
    title: "5. 安全管理措置",
    body:
      "当店は取得した個人情報について、漏洩・滅失・毀損を防止するため、SSL/TLSによる通信暗号化、アクセス制御、定期的なセキュリティ対策の見直しなど、合理的な安全管理措置を講じます。",
  },
  {
    title: "6. 開示・訂正・削除のご請求",
    body:
      "お客様は、ご自身の個人情報について、開示・訂正・削除・利用停止を請求することができます。ご希望の場合は ado@tantetuzest.com までご連絡ください。ご本人確認後、合理的な期間内に対応いたします。",
  },
  {
    title: "7. Cookie の利用",
    body:
      "当サイトでは、サービスの品質向上・利用状況の分析のためにCookieを使用しています。ブラウザの設定によりCookieの受け取りを拒否することができますが、一部サービスが正常に動作しない場合があります。",
  },
  {
    title: "8. ポリシーの変更",
    body:
      "本ポリシーは、法令の改正やサービス内容の変更に応じて改定することがあります。重要な変更がある場合は、本ページ上でお知らせいたします。",
  },
  {
    title: "9. お問い合わせ窓口",
    body: (
      <>
        個人情報の取扱いに関するお問い合わせは、以下までお願いいたします。
        <br />
        鍛鉄工房ZEST（IRONWORKS ado）
        <br />
        Email: ado@tantetuzest.com
        <br />
        TEL: 080-5424-2221
      </>
    ),
  },
]

export default function PrivacyPage() {
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
              プライバシーポリシー
            </h1>
          </div>
        </div>

        <div className="max-w-[800px] mx-auto px-4 lg:px-8 py-16 space-y-12">
          <p className="text-[14px] leading-[1.9] text-muted-foreground">
            鍛鉄工房ZEST（IRONWORKS ado、以下「当店」）は、お客様の個人情報を適切に取り扱うことが重要な責務であると考え、個人情報保護法その他の関係法令を遵守するとともに、以下の方針に基づき、個人情報の保護に努めます。
          </p>

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
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
