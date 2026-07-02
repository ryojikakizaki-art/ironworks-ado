import { Hammer, Ruler, Truck, CreditCard, ArrowUpRight } from "lucide-react"
import { LineIcon } from "@/components/ui/line-icon"

/**
 * 「IRONWORKS ado が選ばれる理由」。
 * 2026-07-02 タスク5-2: tap-to-flip カルーセルを廃止し、静的なリストに変更（蠣﨑さん承認済み）。
 * 旧フリップの表裏テキストは統合して全文表示（backTitle は見出し横のゴールドラベル、
 * backDescription は本文に連結）。装飾は番号・アイコンのみ、アニメーションなし。
 */

const services = [
  {
    icon: Hammer,
    title: "職人手作り",
    subtitle: "こだわりの技術",
    body: "一本一本、熟練の鍛冶職人が丹精込めて手作り。機械では出せない温かみと個性。熟練の職人が伝統の技法で一本ずつ仕上げます。",
  },
  {
    icon: Ruler,
    title: "サイズオーダー対応",
    subtitle: "完璧なフィット",
    body: "お住まいの階段に合わせて、1mm単位でオーダー。採寸から製作まで一貫対応。複雑な形状や特殊サイズも承ります。",
  },
  {
    icon: Truck,
    title: "送料見積り",
    subtitle: "個別にお見積もり",
    body: "北海道から沖縄まで、ご希望の配送先までお届けいたします。サイズ・配送先により送料が変動するため、ご依頼内容に応じて個別にご案内します。",
  },
  {
    icon: LineIcon,
    title: "LINEで簡単相談",
    subtitle: "",
    body: "個人情報の入力なしで、写真と一言から無料見積もり。職人が直接ご返答いたします。",
    href: "https://lin.ee/Tnjukrf",
  },
  {
    icon: CreditCard,
    title: "クレジットカード決済",
    subtitle: "お支払いも安心",
    body: "各種クレジットカードに対応。分割払いもご利用可能。請求書払い、銀行振込にも対応しています。",
  },
]

export function LimitedServiceSection() {
  return (
    <section id="services" className="py-16 md:py-24 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        {/* Section Header */}
        <div>
          <span className="inline-block text-[11px] tracking-[0.25em] text-muted-foreground uppercase mb-2">
            Limited Service
          </span>
          <h2 className="font-serif text-[24px] md:text-[28px] text-foreground">
            IRONWORKS ado が選ばれる理由
          </h2>
        </div>

        <ol className="mt-10 border-y border-border divide-y divide-border">
          {services.map((service, index) => {
            const Icon = service.icon
            const isLine = "href" in service && service.href

            const inner = (
              <div className="flex items-start gap-4 md:gap-7">
                <span className="w-7 md:w-9 shrink-0 pt-3 font-serif text-[13px] md:text-[15px] text-gold select-none">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={`w-11 h-11 md:w-12 md:h-12 shrink-0 rounded-full flex items-center justify-center ${
                    isLine ? "bg-[#06C755]" : "bg-secondary"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${isLine ? "text-white" : "text-gold"}`}
                    strokeWidth={1.5}
                  />
                </span>
                <div className="min-w-0 pt-0.5">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                    <h3 className="font-serif text-[17px] md:text-[18px] text-foreground">
                      {service.title}
                    </h3>
                    {service.subtitle && (
                      <span className="text-[11px] tracking-[0.15em] text-gold">
                        {service.subtitle}
                      </span>
                    )}
                    {isLine && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#06C755]">
                        友だち追加
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-[13px] md:text-[14px] leading-[1.9] text-muted-foreground max-w-[640px]">
                    {service.body}
                  </p>
                </div>
              </div>
            )

            return (
              <li key={service.title}>
                {isLine ? (
                  <a
                    href={service.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block py-6 md:py-7 hover:bg-secondary/40 transition-colors"
                  >
                    {inner}
                  </a>
                ) : (
                  <div className="py-6 md:py-7">{inner}</div>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
