"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Phone, ArrowRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

// ════════════════════════════════════════════════
// ado 実施工事例写真（自社撮影）とイメージ素材写真の混在
// イメージ素材（couple / emotion）は出典・ライセンス要確認のため credit は空欄
// ════════════════════════════════════════════════
const PHOTOS = {
  // HERO: ado 実施工の白い鍛鉄手すりを使って階段を上る場面（2026-07 タスク6-1で差し替え）
  // 「商品の美しさ」でなく「安全に階段を上れる結果」を見せる使用シーン写真
  hero: {
    url: "/images/kaigo/hero-staircase.jpg",
    alt: "ado が施工した白い鍛鉄手すりにつかまり、階段を上る男性（実際の施工事例）",
    credit: "Photo by ado",
  },
  // 比較セクションの ado 側ヒーロー（クローズアップ）
  adoCloseup: {
    url: "/images/products/elisabeth/03.jpg",
    alt: "Elisabeth の S 字スクロール意匠のクローズアップ。鍛冶職人手打ちの繊細な曲線",
    credit: "Photo by ado",
  },
  // 螺旋階段の俯瞰
  adoSpiral: {
    url: "/images/products/elisabeth/02.jpg",
    alt: "螺旋階段に沿って流れる Elisabeth のロートアイアン手すり",
    credit: "Photo by ado",
  },
  // ケアマネ向けセクション用：ご夫婦を象徴するミニチュア写真（出典・ライセンス要確認）
  careCouple: {
    url: "/images/kaigo/caremanager-couple-figurine.jpg",
    alt: "白背景に佇むミニチュアのご夫婦人形",
    credit: "",
  },
  // 中間のエモーショナルブレイク：ご夫婦とマイホームを象徴するミニチュア写真（出典・ライセンス要確認）
  emotion: {
    url: "/images/kaigo/couple-house-figurine.jpg",
    alt: "ミニチュアのご夫婦人形が、住まいの模型を見つめる後ろ姿",
    credit: "",
  },
}

// ════════════════════════════════════════════════
// やわらかい白基調＋セージグリーン系アクセント（riperun 参考／2026-07 タスク6-2で刷新）
// ════════════════════════════════════════════════
const C = {
  bg: "#FFFFFF",
  bgSoft: "#FAF7F2",
  text: "#2A2A26", // 真っ黒でなく温かみのある濃いグレー
  muted: "#6B6258",
  accent: "#5C7256", // 介護・ウェルネス感のセージグリーン
  accentDeep: "#3F5039",
  border: "#E4E4D6",
  highlight: "#EEF2EA", // アクセント淡（セージ寄り）
}

// 見出し・小見出し専用：本文の丸ゴシック（--font-rounded）に対して、優しい印象の細めの角ゴシック
const HEADING_FONT = 'var(--font-rounded-body), "Zen Kaku Gothic New", "Hiragino Sans", "Yu Gothic", sans-serif'

const eligibleWorks = [
  { t: "手すりの取付", d: "屋内（廊下・階段・トイレ・浴室）／屋外（玄関・アプローチ）", main: true },
  { t: "段差の解消", d: "玄関上がり框・敷居の段差・浴室出入口" },
  { t: "滑り防止床材への変更", d: "浴室・脱衣所・玄関タイルなど" },
  { t: "引き戸等への扉変更", d: "開き戸→引き戸・折戸など" },
  { t: "洋式便器への変更", d: "和式→洋式トイレへの取替" },
  { t: "付帯する補修工事", d: "上記に伴う下地補強・配線工事など" },
] as const

const flowSteps = [
  { num: "01", title: "ケアマネ様にご相談", desc: "介護認定（要支援 1 以上）が必要です。担当のケアマネ様または地域包括支援センターに「ado に頼みたい」とお伝えください。ado からケアマネ様への直接ご案内も承ります。" },
  { num: "02", title: "現地調査をご依頼", desc: "ご家族・ご本人・ケアマネ様、どなたからでもご連絡ください。原則 1 週間以内に職人本人が現地に伺い、取付位置と寸法を確認します。出張費は千葉市内無料です。" },
  { num: "03", title: "お見積もり・千葉市へ申請", desc: "鍛冶仕様・寸法・自己負担額を明記してお見積もりをお渡しします。ケアマネ様作成の理由書と一緒に、ado が千葉市へ事前申請を提出します（書類は当方で作成）。" },
  { num: "04", title: "承認後、工事", desc: "通常 2〜3 週間で承認が下ります。承認後、工房で製作（1〜3 週間）、現場取付は半日〜1 日。既存壁を傷めないよう養生と下地確認を丁寧に行います。" },
  { num: "05", title: "1 割のお支払いで完了", desc: "工事完了時に 1 割をお預かりします（例: 工事費 20 万円なら 2 万円）。残り 9 割は ado が千葉市へ申請し、市から ado へ直接振り込まれます。お客様の還付申請の手間はありません。" },
] as const

const targetAreas = [
  { name: "千葉市中央区", primary: true },
  { name: "千葉市美浜区", primary: true },
  { name: "千葉市花見川区", primary: true },
  { name: "千葉市若葉区", primary: true },
  { name: "千葉市緑区", primary: true },
  { name: "千葉市稲毛区", primary: true },
  { name: "千葉県内全域 応相談", primary: false },
] as const

const kaigoFaqs = [
  { q: "介護認定がまだないのですが、相談だけでもできますか？", a: "もちろん可能です。むしろ「これから介護認定を受ける予定」「親の足腰が弱ってきたので備えたい」段階でのご相談を歓迎します。介護認定の申請手順、想定される支給枠、手すりの位置検討まで一緒にお考えします。介護保険を使わない通常工事としてのお見積もりも併せてご提示できます。" },
  { q: "受領委任払を使うと自己負担は本当に 1 割だけですか？", a: "はい、介護保険住宅改修費の支給対象 20 万円までは 1 割（または所得により 2〜3 割）のご負担で結構です。20 万円を超える工事の場合、超過分は全額自己負担となります（例: 工事費 25 万円・1 割負担の方は、20 万円までの 2 万円 + 超過 5 万円 = 計 7 万円が自己負担）。お見積もり時に自己負担額を明記してご提示します。" },
  { q: "賃貸住宅でも介護保険の手すり工事はできますか？", a: "可能ですが、家主様（大家・管理会社）の書面同意が必要です。退去時の原状回復義務についても事前に書面で取り決めいただきます。ado は「ビス穴最小・撤去後の補修代行可」の取付仕様にて、原状回復しやすい構造をご提案できます。家主様への説明資料が必要であればお作りします。" },
  { q: "工事は何日かかりますか？", a: "現場取付自体は半日〜1 日です。製作期間は仕様により 1〜3 週間、介護保険の事前申請承認に 2〜3 週間かかるため、ご相談から工事完了まで通常 4〜6 週間が目安です。退院に合わせて急ぐ場合は、市役所と相談のうえ書類を急いで進めることも可能ですので、その旨ご相談時にお伝えください。" },
  { q: "千葉市以外でも対応してもらえますか？", a: "千葉県内全域に出張対応可能です。ただし「受領委任払」は千葉市の制度のため、千葉市民以外の方はご自身で立替え→市役所へ還付申請いただく流れとなります（書類作成は当方が代行）。手すり工事自体の品質・価格は千葉市民の方と全く同じです。" },
  { q: "他社の見積もりと比較してから決めても大丈夫ですか？", a: "もちろんです。介護保険工事は事業者ごとに対応範囲や仕様が大きく異なります。ado は「鍛冶職人手仕事の鍛鉄手すり」が強み、白いプラ手すりが必要であれば福祉用具レンタル業者のほうがコスト的に有利です。一度現地を見させていただき、適切な選択肢を含めてご提案します。無理な営業はいたしません。" },
] as const

const KAIGO_INQUIRY_TYPES = [
  { value: "self", label: "ご自身・ご家族のご相談" },
  { value: "caremgr", label: "ケアマネ様 / 地域包括支援センターからの紹介" },
  { value: "welfare", label: "福祉用具事業者・リフォーム業者からのお取り次ぎ" },
  { value: "survey", label: "現地調査のご依頼" },
  { value: "general", label: "資料・パンフレット請求のみ" },
] as const

export default function KaigoPage() {
  const router = useRouter()
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [careLevel, setCareLevel] = useState("")
  const [inquiryType, setInquiryType] = useState<string[]>([])
  const [message, setMessage] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const toggleInquiry = (v: string) => {
    setInquiryType((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    if (!name || !email || !message || !agreed) {
      setSubmitError("必須項目（*）をすべてご入力のうえ、同意のチェックをお願いします。")
      return
    }
    setSubmitting(true)
    try {
      const inquiryLabels = KAIGO_INQUIRY_TYPES.filter((t) => inquiryType.includes(t.value))
        .map((t) => t.label)
        .join(" / ")
      const composed = [
        "【介護保険対応のお問い合わせ】",
        `お名前: ${name}`,
        `お電話: ${phone || "未入力"}`,
        `お住まい: ${address || "未入力"}`,
        `介護認定状況: ${careLevel || "未入力"}`,
        `ご相談区分: ${inquiryLabels || "未選択"}`,
        "",
        "── ご相談内容 ──",
        message,
      ].join("\n")
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, category: "kaigo", product: "kaigo", message: composed }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || `送信に失敗しました (HTTP ${res.status})`)
      }
      router.push("/contact/thanks?from=kaigo")
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "送信に失敗しました。時間をおいて再度お試しください。")
      setSubmitting(false)
    }
  }

  return (
    <>
      <Header forceDark />
      <main style={{ backgroundColor: C.bg, color: C.text, fontFamily: 'var(--font-rounded), "Yu Gothic UI", "Hiragino Sans", system-ui, sans-serif' }}>
        {/* ════════════ HERO: 写真全面 + 白パネル（モバイルは写真の下に重ねる2段構成） ════════════ */}
        <section className="relative overflow-hidden">
          <div className="relative h-[46vh] min-h-[340px] md:h-[88vh] md:min-h-[600px] md:max-h-[820px] w-full">
            <img
              src={PHOTOS.hero.url}
              alt={PHOTOS.hero.alt}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: "60% 58%" }}
            />
            <span className="absolute bottom-3 right-4 text-[10px] tracking-wider" style={{ color: "rgba(42,42,38,0.45)" }}>{PHOTOS.hero.credit}</span>
          </div>
          <div className="relative max-w-[1200px] mx-auto px-4 lg:px-8 -mt-20 pb-6 md:mt-0 md:pb-0 md:absolute md:inset-0 md:flex md:items-center">
              <div
                className="max-w-[620px] rounded-2xl p-6 sm:p-8 lg:p-10"
                style={{
                  backgroundColor: "rgba(255,255,255,0.88)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.65)",
                  boxShadow: "0 8px 40px rgba(30,34,26,0.10)",
                  color: C.text,
                }}
              >
                <p className="text-[11px] tracking-[0.4em] uppercase mb-5" style={{ color: C.accent }}>
                  Long-term Care Insurance
                </p>
                <h1 className="text-[26px] md:text-4xl lg:text-[3rem] leading-[1.4] mb-6" style={{ fontFamily: HEADING_FONT, fontWeight: 500 }}>
                  介護保険<span style={{ color: C.accentDeep, marginLeft: "0.2em" }}>1 割負担</span>で、
                  <br />
                  本物の鍛鉄手すりを。
                </h1>
                <p className="text-[16px] md:text-[17px] leading-[2] mb-4 max-w-[520px]" style={{ color: C.muted }}>
                  「玄関の段差がつらい」「親の家を介護仕様にしたくない」──そんな声にお応えする、住まいに馴染む鍛鉄の手すりです。
                </p>
                <p className="text-[16px] md:text-[17px] leading-[2] mb-8 max-w-[520px]" style={{ color: C.muted }}>
                  千葉市の住宅改修費 <strong style={{ color: C.text }}>受領委任払取扱事業者</strong>として登録済み（2026 年 4 月）。<strong style={{ color: C.text }}>立替え不要・自己負担 1 割のみ</strong>で取付できます。
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="#kaigo-form"
                    className="inline-flex items-center justify-center px-6 py-3.5 text-[16px] font-medium rounded-lg transition-all hover:translate-y-[-1px]"
                    style={{ backgroundColor: C.accent, color: "#FFF" }}
                  >
                    介護保険対応のご相談
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                  <a
                    href="https://lin.ee/Tnjukrf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3.5 text-[16px] font-medium rounded-lg transition-all hover:translate-y-[-1px]"
                    style={{ backgroundColor: "#06C755", color: "#FFF" }}
                  >
                    LINE で相談する
                  </a>
                  <a
                    href="tel:070-3817-0659"
                    className="inline-flex items-center justify-center px-6 py-3.5 text-[16px] font-medium rounded-lg transition-colors"
                    style={{ backgroundColor: "rgba(255,255,255,0.95)", color: C.text, border: `1px solid ${C.border}` }}
                  >
                    <Phone className="w-4 h-4 mr-2" style={{ color: C.accent }} />
                    070-3817-0659
                  </a>
                </div>
                <p className="text-[14px] leading-[1.8] mt-4" style={{ color: C.muted }}>
                  LINE なら個人情報の入力なしで、写真を送るだけでご相談いただけます。
                </p>
              </div>
          </div>
        </section>

        {/* ════════════ INTRO: 共感→制度→記事の価値（riperun イントロ） ════════════ */}
        <section className="py-16 lg:py-24" style={{ backgroundColor: C.bg }}>
          <div className="max-w-[760px] mx-auto px-4 lg:px-8">
            <p className="text-[20px] md:text-[23px] leading-[2.1] mb-6 font-medium" style={{ color: C.text, fontFamily: HEADING_FONT }}>
              「玄関の段差がつらくなってきた」<br />
              「浴室での転倒が心配」<br />
              「親の家を介護仕様にしたくない」
            </p>
            <p className="text-[16px] md:text-[17px] leading-[2] mb-5" style={{ color: C.muted }}>
              ご高齢のご家族が安心して暮らせるよう、住まいに手すりを付けたい。けれど、「白いプラスチック製は嫌」「全額立替えは大変」──そんな声を、職人として何度もお聞きしてきました。
            </p>
            <p className="text-[16px] md:text-[17px] leading-[2] mb-9" style={{ color: C.muted }}>
              介護保険には住宅改修費の支給制度（上限 20 万円・1 割負担）があり、ado は 2026 年 4 月から
              <strong style={{ color: C.text }}>千葉市の住宅改修費 受領委任払取扱事業者</strong>
              として登録されました。<strong style={{ color: C.text }}>立替え不要・1 割負担のみ</strong>で、鉄職人歴 25 年の手仕事による鍛鉄手すりをお取付できます。
            </p>

            <div className="rounded-xl p-6 lg:p-8" style={{ backgroundColor: C.highlight, border: `1px solid ${C.border}` }}>
              <p className="text-[14px] mb-4 tracking-wider" style={{ color: C.accent }}>
                ─ このページでわかること
              </p>
              <ul className="space-y-3 text-[16px] md:text-[17px]" style={{ color: C.text }}>
                <li>• 受領委任払と通常払いの違い（自己負担額の差）</li>
                <li>• 介護保険でカバーされる工事の種類</li>
                <li>• ご相談から工事完了までの 5 ステップの流れ</li>
                <li>• 自己負担額のシミュレーション（3 ケース）</li>
                <li>• ケアマネ様・福祉用具事業者様向け紹介ルート</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ════════════ ado vs 一般的な介護手すり 比較 ════════════ */}
        <section className="py-20 lg:py-28" style={{ backgroundColor: C.bgSoft }}>
          <div className="max-w-[1200px] mx-auto px-4 lg:px-8">
            <div className="mb-12">
              <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: C.accent }}>
                ado vs Generic
              </p>
              <h2 className="text-3xl lg:text-[2rem] leading-[1.5] mb-4" style={{ color: C.text, fontFamily: HEADING_FONT, fontWeight: 500 }}>
                「介護用」に見えない手すり、という選択。
              </h2>
              <p className="text-[16px] md:text-[17px] leading-[2] max-w-[680px]" style={{ color: C.muted }}>
                住宅に標準的に使われる既製の手すりは、扱いやすく実用的な道具です。そのうえで「家の雰囲気に合うものがいい」という方に、ado はもう一つの選択肢をご用意しています。鍛鉄手すりは、お住まいの意匠と調和しながら同じ安全性を提供します。
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-5 lg:gap-7">
              {/* ado 側 */}
              <div className="rounded-xl overflow-hidden" style={{ backgroundColor: C.bg, border: `2px solid ${C.accent}` }}>
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={PHOTOS.adoCloseup.url} alt={PHOTOS.adoCloseup.alt} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-medium" style={{ backgroundColor: C.accent, color: "#FFF" }}>
                    ado
                  </div>
                </div>
                <div className="p-6 lg:p-7">
                  <h3 className="text-lg lg:text-xl mb-4" style={{ color: C.text, fontWeight: 500, fontFamily: HEADING_FONT }}>
                    鍛鉄手すり・鍛冶職人手仕事
                  </h3>
                  <dl className="space-y-3 text-[16px] md:text-[17px]">
                    {[
                      { l: "素材", v: "鍛鉄（無垢の鉄を熱して打つ）" },
                      { l: "意匠性", v: "S字スクロール／鎚目／曲線──住まいに馴染む" },
                      { l: "触り心地", v: "鉄の質感・しっとり" },
                      { l: "耐久性", v: "30 年以上・経年で味が増す" },
                      { l: "取付方法", v: "現場寸法に合わせて 1 本ずつ手仕事" },
                      { l: "価格目安", v: "¥30,000〜（介護保険適用で 1 割負担）" },
                    ].map((row) => (
                      <div key={row.l} className="grid grid-cols-[90px_1fr] gap-3" style={{ borderBottom: `1px dashed ${C.border}`, paddingBottom: "12px" }}>
                        <dt style={{ color: C.muted }}>{row.l}</dt>
                        <dd style={{ color: C.text, fontWeight: 500 }}>{row.v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              {/* 一般的な既製手すり 側 */}
              <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#F4F4F4", border: `1px solid ${C.border}` }}>
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src="/images/kaigo/generic-handrail-comparison.jpg" alt="住宅でよく見られる既製の木製手すりの例" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-medium" style={{ backgroundColor: "#999", color: "#FFF" }}>
                    住宅の既製手すり
                  </div>
                </div>
                <div className="p-6 lg:p-7">
                  <h3 className="text-lg lg:text-xl mb-4" style={{ color: "#555", fontWeight: 500, fontFamily: HEADING_FONT }}>
                    既製サイズの手すり・量産品
                  </h3>
                  <dl className="space-y-3 text-[16px] md:text-[17px]">
                    {[
                      { l: "素材", v: "木材・樹脂・スチールなど既製品" },
                      { l: "意匠性", v: "規格サイズ・シンプルな直線形状" },
                      { l: "触り心地", v: "軽く扱いやすい・お手入れも簡単" },
                      { l: "耐久性", v: "製品や使用環境による" },
                      { l: "取付方法", v: "既製サイズから選ぶ（現場に合わせた調整は限定的）" },
                      { l: "価格目安", v: "¥3,000〜¥20,000（同制度で 1 割負担）" },
                    ].map((row) => (
                      <div key={row.l} className="grid grid-cols-[90px_1fr] gap-3" style={{ borderBottom: `1px dashed #DDD`, paddingBottom: "12px" }}>
                        <dt style={{ color: "#888" }}>{row.l}</dt>
                        <dd style={{ color: "#555" }}>{row.v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>

            <p className="text-[14px] leading-[1.9] mt-8 text-center" style={{ color: C.muted }}>
              ※ 介護保険の支給対象は両者とも同じ。同じ「1 割負担」で、住まいに合った道具を選べます。
            </p>
          </div>
        </section>

        {/* ════════════ 受領委任払 比較（テーブル形式） ════════════ */}
        <section className="py-20 lg:py-28" style={{ backgroundColor: C.bgSoft }}>
          <div className="max-w-[1100px] mx-auto px-4 lg:px-8">
            <div className="mb-12 text-center">
              <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: C.accent }}>
                Two ways
              </p>
              <h2 className="text-3xl lg:text-[2rem] leading-[1.5] mb-4" style={{ color: C.text, fontFamily: HEADING_FONT, fontWeight: 500 }}>
                通常・受領委任払──この差は大きい。
              </h2>
              <p className="text-[16px] md:text-[17px] leading-[2] max-w-[640px] mx-auto" style={{ color: C.muted }}>
                介護保険住宅改修費の受け取り方には 2 通りあります。受領委任払事業者を選ぶと、お客様は窓口で 1 割分だけお支払いいただければ完了します。
              </p>
            </div>

            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
              <table className="w-full text-[16px] md:text-[17px]">
                <thead>
                  <tr style={{ backgroundColor: "#EDEFE6" }}>
                    <th className="text-left px-5 py-4 font-medium" style={{ color: C.muted, width: "28%" }}>項目</th>
                    <th className="text-left px-5 py-4 font-medium" style={{ color: C.muted }}>通常払い</th>
                    <th className="text-left px-5 py-4 font-medium" style={{ color: C.accentDeep, backgroundColor: C.highlight }}>受領委任払（ado）</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { l: "工事費 20 万円の場合 お客様お支払い", n: "20 万円（全額立替）", a: "2 万円（1 割のみ）" },
                    { l: "残り 9 割の受け取り方", n: "後日、口座へ還付（数週間）", a: "ado が市から直接受領" },
                    { l: "申請書類の作成", n: "お客様または家族が作成", a: "ado が代行作成・提出" },
                    { l: "事業者の資格要件", n: "登録不要", a: "千葉市が認定した事業者のみ" },
                    { l: "対象となる市民", n: "全国（市区町村による）", a: "千葉市民のみ（市の制度）" },
                  ].map((row, i) => (
                    <tr key={row.l} style={{ borderTop: `1px solid ${C.border}` }}>
                      <td className="px-5 py-4 align-top font-serif" style={{ color: C.text }}>{row.l}</td>
                      <td className="px-5 py-4 align-top" style={{ color: C.muted }}>{row.n}</td>
                      <td className="px-5 py-4 align-top font-medium" style={{ color: C.text, backgroundColor: i % 2 ? "#FFFCF6" : C.highlight }}>{row.a}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[14px] leading-[1.9] mt-5 text-center" style={{ color: C.muted }}>
              ※ 1 割負担の方の例です。所得により負担割合は 2〜3 割となる方もいらっしゃいます。
            </p>
          </div>
        </section>

        {/* ════════════ Photo break + emotional caption ════════════ */}
        <section className="relative">
          <div className="relative h-[420px] md:h-[520px] w-full overflow-hidden">
            <img src={PHOTOS.emotion.url} alt={PHOTOS.emotion.alt} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(30,34,26,0.60) 0%, rgba(30,34,26,0.18) 60%, rgba(30,34,26,0) 100%)" }} />
            <div className="absolute inset-x-0 bottom-0 max-w-[1100px] mx-auto px-4 lg:px-8 pb-10 lg:pb-14">
              <p className="text-white text-xl md:text-2xl leading-[1.7] max-w-[600px]" style={{ fontWeight: 500, fontFamily: HEADING_FONT }}>
                ご夫婦の毎日を、<br />
                住まいに馴染む道具で支える。
              </p>
            </div>
            {PHOTOS.emotion.credit && (
              <span className="absolute bottom-3 right-4 text-[10px] text-white/60 tracking-wider">{PHOTOS.emotion.credit}</span>
            )}
          </div>
        </section>

        {/* ════════════ 対応工事 ════════════ */}
        <section className="py-20 lg:py-28" style={{ backgroundColor: C.bg }}>
          <div className="max-w-[1100px] mx-auto px-4 lg:px-8">
            <div className="mb-12">
              <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: C.accent }}>
                Eligible Work
              </p>
              <h2 className="text-3xl lg:text-[2rem] leading-[1.5] mb-4" style={{ color: C.text, fontFamily: HEADING_FONT, fontWeight: 500 }}>
                介護保険でカバーされる工事
              </h2>
              <p className="text-[16px] md:text-[17px] leading-[2] max-w-2xl" style={{ color: C.muted }}>
                住宅改修費の支給対象は法令で定められた 6 種類です。ado は手すり取付を主力に、玄関段差解消等も承ります。
              </p>
            </div>

            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
              <table className="w-full text-[16px] md:text-[17px]">
                <thead>
                  <tr style={{ backgroundColor: "#EDEFE6" }}>
                    <th className="text-left px-5 py-4 font-medium" style={{ color: C.muted, width: "32%" }}>工事種別</th>
                    <th className="text-left px-5 py-4 font-medium" style={{ color: C.muted }}>具体例</th>
                    <th className="text-left px-5 py-4 font-medium hidden md:table-cell" style={{ color: C.muted, width: "14%" }}>ado 主力</th>
                  </tr>
                </thead>
                <tbody>
                  {eligibleWorks.map((w, i) => (
                    <tr key={w.t} style={{ borderTop: `1px solid ${C.border}`, backgroundColor: w.main ? C.highlight : (i % 2 ? "#FCFAF6" : C.bg) }}>
                      <td className="px-5 py-4 align-top font-serif" style={{ color: C.text }}>{w.t}</td>
                      <td className="px-5 py-4 align-top" style={{ color: C.muted }}>{w.d}</td>
                      <td className="px-5 py-4 align-top hidden md:table-cell">
                        {w.main && (
                          <span className="inline-block px-2.5 py-0.5 text-[11px] rounded-full font-medium" style={{ backgroundColor: C.accent, color: "#FFF" }}>
                            主力
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ════════════ 自己負担シミュレーション（テーブル） ════════════ */}
        <section className="py-20 lg:py-28" style={{ backgroundColor: C.bgSoft }}>
          <div className="max-w-[1100px] mx-auto px-4 lg:px-8">
            <div className="mb-12 text-center">
              <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: C.accent }}>
                Cost Simulation
              </p>
              <h2 className="text-3xl lg:text-[2rem] leading-[1.5] mb-4" style={{ color: C.text, fontFamily: HEADING_FONT, fontWeight: 500 }}>
                自己負担額の目安
              </h2>
              <p className="text-[16px] md:text-[17px] leading-[2] max-w-[640px] mx-auto" style={{ color: C.muted }}>
                ※ 介護保険住宅改修費の支給上限は 1 人につき生涯 20 万円。下記は 1 割負担の方の例です。
              </p>
            </div>

            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
              <table className="w-full text-[16px] md:text-[17px]">
                <thead>
                  <tr style={{ backgroundColor: "#EDEFE6" }}>
                    <th className="text-left px-5 py-4 font-medium" style={{ color: C.muted, width: "30%" }}>工事内容</th>
                    <th className="text-right px-5 py-4 font-medium" style={{ color: C.muted }}>工事費 総額</th>
                    <th className="text-right px-5 py-4 font-medium" style={{ color: C.accentDeep, backgroundColor: C.highlight }}>お客様 負担</th>
                    <th className="text-right px-5 py-4 font-medium hidden md:table-cell" style={{ color: C.muted }}>市から ado へ</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { c: "玄関手すり 1 本", desc: "Scroll 19φ 鍛造仕様・外階段 3 段対応", total: "¥80,000", self: "¥8,000", city: "¥72,000" },
                    { c: "玄関 + 階段 + トイレ", desc: "鍛鉄縦型手すりを 3 ヶ所", total: "¥180,000", self: "¥18,000", city: "¥162,000" },
                    { c: "フル介護仕様", desc: "玄関・廊下・階段・浴室・トイレに手すり一式", total: "¥200,000", self: "¥20,000", city: "¥180,000" },
                  ].map((sim, i) => (
                    <tr key={sim.c} style={{ borderTop: `1px solid ${C.border}` }}>
                      <td className="px-5 py-4 align-top">
                        <div className="text-[16px] md:text-[17px] mb-1" style={{ color: C.text }}>{sim.c}</div>
                        <div className="text-[14px]" style={{ color: C.muted }}>{sim.desc}</div>
                      </td>
                      <td className="px-5 py-4 align-top text-right font-mono" style={{ color: C.muted }}>{sim.total}</td>
                      <td className="px-5 py-4 align-top text-right" style={{ backgroundColor: i % 2 ? "#FFFCF6" : C.highlight }}>
                        <span className="text-xl md:text-2xl font-medium" style={{ color: C.accent }}>{sim.self}</span>
                      </td>
                      <td className="px-5 py-4 align-top text-right font-mono hidden md:table-cell" style={{ color: C.muted }}>{sim.city}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[14px] leading-[1.9] mt-5" style={{ color: C.muted }}>
              ※ 実際の金額は現場寸法・取付下地条件・仕様により変動します。正式なお見積もりは現地調査後にご提示します。
            </p>
          </div>
        </section>

        {/* ════════════ ado 施工事例ギャラリー ════════════ */}
        <section className="py-20 lg:py-28" style={{ backgroundColor: C.bg }}>
          <div className="max-w-[1200px] mx-auto px-4 lg:px-8">
            <div className="mb-12">
              <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: C.accent }}>
                Real installations
              </p>
              <h2 className="text-3xl lg:text-[2rem] leading-[1.5] mb-4" style={{ color: C.text, fontFamily: HEADING_FONT, fontWeight: 500 }}>
                ado の手すりが、ご自宅に流れる。
              </h2>
              <p className="text-[16px] md:text-[17px] leading-[2] max-w-[680px]" style={{ color: C.muted }}>
                白壁・無垢の階段・自然光──ご自宅の意匠に溶け込むように、鍛冶職人が一本ずつ現場寸法に合わせて手仕事で曲げ・溶接・塗装まで仕上げます。
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-3 md:gap-4">
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                <img src="/images/products/elisabeth/02.jpg" alt="螺旋階段に流れる Elisabeth の鍛鉄手すり" className="absolute inset-0 w-full h-full object-cover" />
              </div>
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                <img src="/images/products/elisabeth/03.jpg" alt="Elisabeth の S 字スクロール意匠のクローズアップ" className="absolute inset-0 w-full h-full object-cover" />
              </div>
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                <img src="/images/products/elisabeth/04.jpg" alt="Elisabeth の手仕事の鍛鉄手すり" className="absolute inset-0 w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* ════════════ ご利用の流れ（STEP ラベル形式 - riperun スタイル） ════════════ */}
        <section className="py-20 lg:py-28" style={{ backgroundColor: C.bg }}>
          <div className="max-w-[920px] mx-auto px-4 lg:px-8">
            <div className="mb-14">
              <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: C.accent }}>
                Flow
              </p>
              <h2 className="text-3xl lg:text-[2rem] leading-[1.5] mb-4" style={{ color: C.text, fontFamily: HEADING_FONT, fontWeight: 500 }}>
                ご相談から工事完了まで、5 ステップ。
              </h2>
              <p className="text-[16px] md:text-[17px] leading-[2] max-w-2xl" style={{ color: C.muted }}>
                ご相談から工事完了まで通常 4〜6 週間が目安です。退院に合わせて急ぐ場合は、市役所と相談のうえ書類を急いで進めることも可能です。
              </p>
            </div>
            <div>
              {flowSteps.map((s, i) => (
                <div key={s.num} className="grid md:grid-cols-[180px_1fr] gap-4 md:gap-10 py-8" style={{ borderTop: i === 0 ? "none" : `1px solid ${C.border}` }}>
                  <div>
                    <div className="text-[11px] tracking-[0.3em] font-medium mb-2" style={{ color: C.accent }}>STEP</div>
                    <div className="text-4xl md:text-5xl leading-none" style={{ color: C.text, fontWeight: 300 }}>{s.num}</div>
                  </div>
                  <div>
                    <h3 className="text-lg lg:text-xl mb-3" style={{ color: C.text, fontFamily: HEADING_FONT, fontWeight: 500 }}>
                      {s.title}
                    </h3>
                    <p className="text-[16px] md:text-[17px] leading-[2]" style={{ color: C.muted }}>
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════ Photo + Care managers section ════════════ */}
        <section className="py-20 lg:py-28" style={{ backgroundColor: C.bgSoft }}>
          <div className="max-w-[1100px] mx-auto px-4 lg:px-8">
            <div className="grid md:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16 items-center">
              <div className="relative h-[360px] md:h-[460px] rounded-xl overflow-hidden">
                <img
                  src={PHOTOS.careCouple.url}
                  alt={PHOTOS.careCouple.alt}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ objectPosition: "15% 55%" }}
                />
              </div>
              <div>
                <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: C.accent }}>
                  For Care Professionals
                </p>
                <h2 className="text-2xl lg:text-3xl leading-[1.6] mb-5" style={{ color: C.text, fontFamily: HEADING_FONT, fontWeight: 500 }}>
                  ケアマネ様・福祉用具事業者様へ
                </h2>
                <p className="text-[16px] md:text-[17px] leading-[2] mb-6" style={{ color: C.muted }}>
                  「白いプラではなく意匠性のある手すりが欲しい」というご家族のニーズにお応えできる事業者として、千葉市内の地域包括支援センター・福祉用具事業者様からの紹介を承っております。
                </p>
                <ul className="space-y-3 text-[16px] md:text-[17px] mb-7" style={{ color: C.text }}>
                  <li className="flex items-start gap-2.5">
                    <span style={{ color: C.accent }}>●</span>
                    <span>ケアマネ様の理由書作成サポート・現地下見の同行</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span style={{ color: C.accent }}>●</span>
                    <span>ご利用者様への説明資料（PDF）のご提供</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span style={{ color: C.accent }}>●</span>
                    <span>担当者直通の連絡先と紹介手数料のご案内</span>
                  </li>
                </ul>
                <Link href="#kaigo-form" className="inline-flex items-center gap-2 text-[16px] font-medium hover:underline" style={{ color: C.accent }}>
                  フォームから「ケアマネ」を選択してご連絡
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════ 対応エリア ════════════ */}
        <section className="py-20 lg:py-28" style={{ backgroundColor: C.bg }}>
          <div className="max-w-[1000px] mx-auto px-4 lg:px-8">
            <div className="mb-10">
              <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: C.accent }}>
                Area
              </p>
              <h2 className="text-3xl lg:text-[2rem] leading-[1.5] mb-4" style={{ color: C.text, fontFamily: HEADING_FONT, fontWeight: 500 }}>
                対応エリア
              </h2>
              <p className="text-[16px] md:text-[17px] leading-[2] max-w-2xl" style={{ color: C.muted }}>
                受領委任払が使えるのは千葉市民のみです（市の制度のため）。千葉市以外の方は通常の還付制度をご利用いただきます（書類代行は同様に承ります）。
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {targetAreas.map((a) => (
                <span
                  key={a.name}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-[14px] rounded-lg"
                  style={{
                    backgroundColor: a.primary ? C.highlight : C.bg,
                    border: `1px solid ${a.primary ? C.accent : C.border}`,
                    color: C.text,
                  }}
                >
                  <span style={{ color: a.primary ? C.accent : C.muted }}>●</span>
                  {a.name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════ FAQ ════════════ */}
        <section className="py-20 lg:py-28 scroll-mt-24" id="kaigo-faq" style={{ backgroundColor: C.bgSoft }}>
          <div className="max-w-[880px] mx-auto px-4 lg:px-8">
            <div className="mb-12">
              <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: C.accent }}>
                FAQ
              </p>
              <h2 className="text-3xl lg:text-[2rem]" style={{ color: C.text, fontFamily: HEADING_FONT, fontWeight: 500 }}>
                よくいただくご質問
              </h2>
            </div>
            <div className="space-y-3">
              {kaigoFaqs.map((faq, index) => {
                const isOpen = openFaq === index
                return (
                  <div
                    key={index}
                    className="rounded-xl overflow-hidden"
                    style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full flex items-start justify-between gap-4 p-5 lg:p-6 text-left transition-colors hover:bg-[#FCFAF6]"
                      aria-expanded={isOpen}
                    >
                      <span className="text-[16px] lg:text-[17px] font-medium leading-relaxed" style={{ color: C.text, fontFamily: HEADING_FONT, fontWeight: 500 }}>
                        {faq.q}
                      </span>
                      <span
                        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-transform ${isOpen ? "rotate-45" : ""}`}
                        style={{ border: `1px solid ${isOpen ? C.accent : C.border}`, color: isOpen ? C.accent : C.muted }}
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
                          <p className="text-[16px] md:text-[17px] leading-[2] px-5 lg:px-6 pb-5 lg:pb-6 whitespace-pre-line" style={{ color: C.muted }}>
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ════════════ お問い合わせフォーム ════════════ */}
        <section id="kaigo-form" className="py-20 lg:py-28 scroll-mt-24" style={{ backgroundColor: C.bg }}>
          <div className="max-w-[820px] mx-auto px-4 lg:px-8">
            <div className="mb-12 text-center">
              <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: C.accent }}>
                Contact
              </p>
              <h2 className="text-3xl lg:text-[2rem] mb-4" style={{ color: C.text, fontFamily: HEADING_FONT, fontWeight: 500 }}>
                介護保険対応のご相談
              </h2>
              <p className="text-[16px] md:text-[17px] leading-[2] max-w-[640px] mx-auto" style={{ color: C.muted }}>
                ご本人・ご家族・ケアマネージャー様・福祉用具事業者様、どなたからでもどうぞ。通常 1〜2 営業日以内に職人本人からご返答いたします。
              </p>
            </div>

            {/* LINE 相談導線（フォームより気軽な選択肢を先に提示） */}
            <div className="flex flex-col items-center gap-3 mb-12 rounded-xl p-6 lg:p-7" style={{ backgroundColor: C.highlight, border: `1px solid ${C.border}` }}>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a
                  href="https://lin.ee/Tnjukrf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-8 py-4 text-[16px] font-medium rounded-lg transition-all hover:translate-y-[-1px]"
                  style={{ backgroundColor: "#06C755", color: "#FFF" }}
                >
                  LINE で相談する
                </a>
                <a
                  href="tel:070-3817-0659"
                  className="inline-flex items-center justify-center px-8 py-4 text-[16px] font-medium rounded-lg transition-colors"
                  style={{ backgroundColor: C.bg, color: C.text, border: `1px solid ${C.border}` }}
                >
                  <Phone className="w-4 h-4 mr-2" style={{ color: C.accent }} />
                  070-3817-0659
                </a>
              </div>
              <p className="text-[15px] leading-[1.9] text-center" style={{ color: C.muted }}>
                LINE なら個人情報の入力なしで、現場の写真を送るだけでご相談いただけます。
                <br className="hidden sm:block" />
                じっくり書きたい方は、下のフォームをご利用ください。
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 rounded-xl p-6 lg:p-8" style={{ backgroundColor: C.bgSoft, border: `1px solid ${C.border}` }}>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[15px] font-medium mb-2" style={{ color: C.text }}>
                    お名前 <span style={{ color: C.accent }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="山田 花子"
                    className="w-full px-4 py-3.5 rounded-lg text-[16px] focus:outline-none transition-colors"
                    style={{ border: `1px solid ${C.border}`, backgroundColor: C.bg }}
                  />
                </div>
                <div>
                  <label className="block text-[15px] font-medium mb-2" style={{ color: C.text }}>
                    メールアドレス <span style={{ color: C.accent }}>*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="example@email.com"
                    className="w-full px-4 py-3.5 rounded-lg text-[16px] focus:outline-none transition-colors"
                    style={{ border: `1px solid ${C.border}`, backgroundColor: C.bg }}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[15px] font-medium mb-2" style={{ color: C.text }}>
                    お電話
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="090-0000-0000"
                    className="w-full px-4 py-3.5 rounded-lg text-[16px] focus:outline-none transition-colors"
                    style={{ border: `1px solid ${C.border}`, backgroundColor: C.bg }}
                  />
                </div>
                <div>
                  <label className="block text-[15px] font-medium mb-2" style={{ color: C.text }}>
                    お住まい（市区町村まででも可）
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="千葉市美浜区"
                    className="w-full px-4 py-3.5 rounded-lg text-[16px] focus:outline-none transition-colors"
                    style={{ border: `1px solid ${C.border}`, backgroundColor: C.bg }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[15px] font-medium mb-2" style={{ color: C.text }}>
                  介護認定の状況（わかる範囲で）
                </label>
                <input
                  type="text"
                  value={careLevel}
                  onChange={(e) => setCareLevel(e.target.value)}
                  placeholder="例: 要支援 1 / 要介護 2 / これから申請予定 など"
                  className="w-full px-4 py-3.5 rounded-lg text-[16px] focus:outline-none transition-colors"
                  style={{ border: `1px solid ${C.border}`, backgroundColor: C.bg }}
                />
              </div>

              <div>
                <label className="block text-[15px] font-medium mb-3" style={{ color: C.text }}>
                  ご相談区分（複数選択可）
                </label>
                <div className="grid sm:grid-cols-2 gap-2">
                  {KAIGO_INQUIRY_TYPES.map((t) => {
                    const checked = inquiryType.includes(t.value)
                    return (
                      <label
                        key={t.value}
                        className="flex items-center gap-2 px-4 py-3 rounded-lg cursor-pointer text-[15px] transition-colors"
                        style={{
                          border: `1px solid ${checked ? C.accent : C.border}`,
                          backgroundColor: checked ? C.highlight : C.bg,
                          color: checked ? C.text : C.muted,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleInquiry(t.value)}
                          className="w-4 h-4"
                          style={{ accentColor: C.accent }}
                        />
                        {t.label}
                      </label>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[15px] font-medium mb-2" style={{ color: C.text }}>
                  ご相談内容 <span style={{ color: C.accent }}>*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={6}
                  placeholder="例: 80 代の母が暮らす実家（千葉市美浜区）の玄関と階段に手すりをつけたいです。介護認定は要支援 2 が出ています。"
                  className="w-full px-4 py-3.5 rounded-lg text-[16px] leading-[1.85] focus:outline-none transition-colors resize-y"
                  style={{ border: `1px solid ${C.border}`, backgroundColor: C.bg }}
                />
              </div>

              <label className="flex items-start gap-3 text-[15px] leading-[1.85] cursor-pointer" style={{ color: C.muted }}>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 shrink-0"
                  style={{ accentColor: C.accent }}
                />
                <span>
                  <Link href="/privacy" className="underline-offset-2 hover:underline" style={{ color: C.accent }}>
                    プライバシーポリシー
                  </Link>
                  の取扱いに同意します。 <span style={{ color: C.accent }}>*</span>
                </span>
              </label>

              {submitError && (
                <p className="text-[15px] rounded-lg px-4 py-3" style={{ color: "#A33", backgroundColor: "#FCEAEA", border: "1px solid #F2C2C2" }}>
                  {submitError}
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-[16px] font-medium rounded-lg transition-all hover:translate-y-[-1px] disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ backgroundColor: C.accent, color: "#FFF" }}
                >
                  {submitting ? "送信中..." : "送信する"}
                  {!submitting && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </form>

            <p className="text-[11px] mt-8 text-center" style={{ color: C.muted }}>
              ※ 一部の写真はイメージ素材を使用しています。実際の施工事例写真は撮影次第差し替えます。
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
