"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, ArrowRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PrimaryCTA } from "@/components/ui/primary-cta"

const faqs: { q: string; a: string }[] = [
  {
    q: "納期はどのくらいかかりますか？",
    a: "標準在庫品（座金付きストレートタイプ等）は通常配送 10 営業日 / 特急配送 5 営業日（+20%）で発送します。サイズ・形状をフルオーダーする場合は 2〜4 週間、階段やフェンス等の大型品は 4〜8 週間が目安です。お急ぎの場合はご相談ください。",
  },
  {
    q: "取り付けの強度は大丈夫ですか？",
    a: "本体は無垢鉄（25φ 丸棒や 12×32mm フラットバーなど商品ごとに最適な太さ）で、ブラケット座金 2〜4 点で壁にがっちり固定します。大人がもたれかかったり体重をかけたりしても十分耐える強度設計です。座金位置は壁の下地（柱・間柱）に合わせて指定可能で、補強板なしでも安全に固定できます。",
  },
  {
    q: "取り付けは自分でできますか？",
    a: "付属の取付ビス（M5×40mm 等）と、壁の下地確認ができれば DIY 可能です。製作図面と取付ガイドを商品に同梱します。施工に不安がある場合は、千葉県全域および関東一部エリアであれば ado による現地施工にも対応可能（別途お見積もり）。施工エリア外でも、お近くの工務店様向けに取付指示書をお渡しできます。",
  },
  {
    q: "オーダーメイドは可能ですか？",
    a: "もちろん可能です。サイズ・形状・色・仕上げまでフルオーダーに対応します。鍛冶で叩いた鎚目仕上げ、焼付塗装、レーザーカットによる装飾、機械加工による精密な接合など、他社では断られるような仕様も製作可能です。図面がなくても、現地のお写真と寸法スケッチで承れます。",
  },
  {
    q: "図面がなくてもオーダーできますか？",
    a: "可能です。「階段の長さがおおよそ 1.5m」「玄関ポーチの段差用」など、おおまかなサイズや設置場所のお写真をいただければお見積もりできます。建築図面がある場合は、より精度の高い見積りと取付検討が可能です。",
  },
  {
    q: "色や仕上げは選べますか？",
    a: "標準ではマットブラック / マットホワイトの 2 色を中心にご用意しています。焼付塗装によるカラーオーダー（ご指定の色番号での塗装）や、溶融亜鉛めっき、無塗装の黒皮蜜蝋仕上げなどにも対応可能です。屋外設置の場合は溶融亜鉛めっき + 焼付塗装の二重防錆をおすすめしています。",
  },
  {
    q: "メンテナンスは必要ですか？",
    a: "焼付塗装の手すりは耐久性が高く、室内設置であれば特別なお手入れは不要です。屋外設置の場合は、年 1〜2 回ほど柔らかい布で乾拭きしていただくと長くお使いいただけます。万が一塗装が剥がれた場合は、補修塗装も承ります。",
  },
  {
    q: "全国配送に対応していますか？",
    a: "はい、日本全国へ配送可能です。商品サイズに応じて宅配便もしくは大型品の専門便で発送します。送料は配送先・サイズにより実費でのご請求となります。お見積もり時に送料目安もお伝えします。詳しくは『送料・配送について』のページをご覧ください。",
  },
  {
    q: "屋外で使えますか？",
    a: "屋内用は下地に錆止め塗料を塗布し、上塗りに耐候性の強い塗料で仕上げております。屋外でご使用の場合、塗装だけでは内側から錆が発生し、塗装の見た目も悪くなり手すりとしての強度も落ちます。屋外設置では錆にとても強い『溶融亜鉛めっき処理』を強く推奨しております（溶融亜鉛めっき処理後に塗装仕上げ。2m までは本体価格 + ¥22,000）。",
  },
  {
    q: "『縦手すり』と『横手すり』の違いは？",
    a: "【縦手すり】立ち座りなどで体重が上下する場所に設置します。設置場所は主に玄関・トイレ・浴室です。手すりをつかむ箇所は限られた範囲ですので、ブラケットは棒に対して垂直に付いています。【横手すり】水平移動や姿勢保持の場所に設置します。設置場所は主に階段や廊下です。身体を移動させるときに手を滑らせながら使うため、ブラケットが手に当たらないように棒に対して L 字に付いています。価格差はブラケットの形状によります。",
  },
  {
    q: "取り付けに下地は必要ですか？",
    a: "はい、下地による補強を推奨しています。【階段手すり】40mm のビスを使用しています。MDF 材などの場合は踏板の下にコンパネ 12.5mm 以上の下地をお願いしています。ストリップ階段や 9 段以上の手すりには、補強の『バットレス加工』または『ふれ止め』をおすすめします。【壁付け手すり】下地 25mm 以上（構造用合板やコンパネ 2 枚張り）を推奨しています。広範囲に入れていただくと高さ調整がしやすくなります。",
  },
  {
    q: "傷がついたらどうしたらいいですか？",
    a: "万が一、鋭利なものなどがぶつかって塗装が剥がれてしまった場合、そこから錆が発生する原因となりますので、付属のタッチアップ剤で速やかに修復してください。タッチアップ剤の追加発送やリペアのご相談も承りますので、お気軽にお問い合わせください。",
  },
  {
    q: "手すり以外の制作は依頼できますか？",
    a: "はい、暮らしに関わるどのようなものでも制作いたします。屋内用・屋外用どちらにも対応可能で、フェンス、面格子、門扉、アイアンドア、装飾オブジェなど、フルオーダーの一点ものは姉妹工房『鍛鉄工房 ZEST』として承ります。お気軽にお問い合わせください。",
  },
  {
    q: "返品・交換はできますか？",
    a: "受注制作・オーダーメイドの性質上、お客様都合による返品・交換は原則お受けできません。製品に不良・破損があった場合は、商品到着後 7 日以内にご連絡ください。当店負担にて新品交換または修理対応いたします。",
  },
  {
    q: "支払い方法は？",
    a: "クレジットカード決済（Visa / Mastercard / American Express / JCB / Diners、決済代行 Stripe, Inc.）に対応しています。商品ページに価格が記載されているものは即時購入可能です。オーダー品はお見積もり後、メールでお支払いリンクをお送りします。",
  },
]

export const dynamic = "force-static"

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <>
      <Header />
      <main className="pt-20 lg:pt-24 pb-20 bg-background">
        {/* ── ページヘッダー ── */}
        <div className="border-b border-border">
          <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">FAQ</p>
            <h1 className="font-serif text-3xl lg:text-5xl text-foreground mb-4">
              よくあるご質問
            </h1>
            <p className="text-[14px] leading-[1.95] text-muted-foreground max-w-[640px]">
              納期・取り付け・オーダーメイド・お支払いなど、ご注文前にお寄せいただくことの多いご質問をまとめました。記載のない内容はお気軽にお問い合わせください。
            </p>
          </div>
        </div>

        {/* ── FAQ アコーディオン ── */}
        <section className="max-w-[880px] mx-auto px-4 lg:px-8 py-16">
          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index
              return (
                <div
                  key={index}
                  className="border border-border rounded-lg overflow-hidden bg-card"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex items-start justify-between gap-4 p-5 lg:p-6 text-left hover:bg-secondary/40 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="font-serif text-[15px] lg:text-[17px] font-medium text-foreground leading-relaxed">
                      {faq.q}
                    </span>
                    <span
                      className={`shrink-0 w-7 h-7 rounded-full border border-border flex items-center justify-center transition-transform ${
                        isOpen ? "rotate-45 border-gold text-gold" : ""
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <p className="text-[14px] leading-[1.95] text-muted-foreground px-5 lg:px-6 pb-5 lg:pb-6 whitespace-pre-line">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── 業者の方への導線 ── */}
        <section className="max-w-[880px] mx-auto px-4 lg:px-8 pb-12">
          <div className="border border-border rounded-xl bg-card p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-[1fr_auto] items-center gap-5">
            <div>
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">For Builders</p>
              <h2 className="font-serif text-xl lg:text-2xl text-foreground mb-2">
                工務店様・設計事務所様へ
              </h2>
              <p className="text-[13px] leading-[1.85] text-muted-foreground">
                業者様向けの卸価格・図面 / CAD 対応・特急納期・施工事例については、業者様専用ページをご用意しております。
              </p>
            </div>
            <PrimaryCTA href="/trade" variant="dark" size="md" withArrow>
              業者様専用ページへ
            </PrimaryCTA>
          </div>
        </section>

        {/* ── 解決しなかった場合の CTA ── */}
        <section className="max-w-[880px] mx-auto px-4 lg:px-8 pb-16 text-center">
          <p className="text-[14px] text-muted-foreground mb-5">
            その他のご質問は、お気軽にお問い合わせください。
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-[14px] text-foreground hover:text-gold transition-colors"
          >
            お問い合わせフォームへ
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>
      <Footer />
    </>
  )
}
