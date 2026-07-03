"use client"

import { useState, FormEvent, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  Hammer,
  Layers,
  FileText,
  Zap,
  Award,
  Plus,
  Building2,
  ArrowRight,
  Banknote,
  Trash2,
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PrimaryCTA } from "@/components/ui/primary-cta"
import { CATALOG_PRODUCTS } from "@/lib/products/catalog"
import {
  getQuoteUnitPrice,
  isFixedLengthProduct,
  isQuotableProduct,
  getStandardLengthM,
  getMaxLengthM,
} from "@/lib/products/quote-pricing"

// /trade からの参考見積もり用：catalog から /products/{slug} 形式の商品のみ抜き出す。
// quotable=true の商品は商品ページ・本番決済と同じ価格ロジック (quote-pricing.ts) で
// 単価を計算する。quotable=false (Élisabeth/Clémence/長さ要相談商品) は「個別お見積もり」表示。
const QUOTE_PRODUCTS = CATALOG_PRODUCTS
  .filter((p) => p.href.startsWith("/products/"))
  .map((p) => {
    const slug = p.href.replace("/products/", "")
    const quotable = isQuotableProduct(slug)
    const fixedLength = quotable && isFixedLengthProduct(slug)
    return {
      slug,
      name: p.name,
      sub: p.sub,
      price: p.price,
      priceFrom: p.priceFrom ?? false,
      quotable,
      fixedLength,
      stdLengthM: quotable ? getStandardLengthM(slug) : 1.5,
      maxLengthM: quotable ? getMaxLengthM(slug) : 5.0,
    }
  })

type QuoteLine = {
  id: string
  slug: string // 空文字 = 未選択
  qty: number
  length: number // メートル。固定長商品・非 quotable 商品では未使用
}

function findQuoteProduct(slug: string) {
  return QUOTE_PRODUCTS.find((p) => p.slug === slug)
}

/**
 * 行の参考見積もり合計を返す。
 * - 非 quotable (Élisabeth/Clémence 等) は null → 「個別お見積もり」表示
 * - 固定価格商品 (price=0 以外で priceFrom=false) は basePrice × qty
 * - quotable 商品は quote-pricing.ts の getQuoteUnitPrice で単価を出して qty 倍
 */
function calcLineTotal(line: QuoteLine): number | null {
  const p = findQuoteProduct(line.slug)
  if (!p || p.price === 0) return null
  const qty = Math.max(1, Number(line.qty) || 0)
  if (!p.priceFrom) {
    return p.price * qty
  }
  if (!p.quotable) {
    // priceFrom だが計算機未対応 (Élisabeth/Clémence) → 個別お見積もり
    return null
  }
  const length = p.fixedLength ? p.stdLengthM : Math.max(0.1, Number(line.length) || 0)
  const result = getQuoteUnitPrice(p.slug, length)
  if (!result) return null
  return result.unitPrice * qty
}

function newQuoteLine(): QuoteLine {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  return { id, slug: "", qty: 1, length: 1.5 }
}

// ── 5 本の柱（業者向け訴求） ──
const pillars = [
  {
    icon: Hammer,
    title: "他では断られる仕様も製作可能",
    desc: "鍛冶による鎚目仕上げ・焼付塗装・レーザーカット・機械加工・溶融亜鉛メッキまで一貫対応。「これは無理」と言われた図面ほど、ぜひ一度ご相談ください。設計意図を汲んだ提案でお応えします。",
  },
  {
    icon: Award,
    title: "業者様向け割引・卸価格をご用意",
    desc: "継続取引のある工務店様・設計事務所様・リフォーム会社様には、数量と取引頻度に応じた卸価格 / 業者様向け割引を設定しています。初回お取引時にお見積もりとともにご案内します。",
  },
  {
    icon: FileText,
    title: "図面・CAD 対応",
    desc: "PDF / DWG / DXF / Vectorworks ファイルを直接受領し、現場寸法に合わせて再作図。ご支給の建築図面から取付検討・干渉チェックまで対応します。図面が手描きでも対応可能です。",
  },
  {
    icon: Zap,
    title: "納期短縮・特急対応",
    desc: "通常 2〜4 週間の制作を、現場工程に合わせて特急対応（+20%）も承ります。竣工立会いに間に合わせる、検査前に納品する、といった逆算スケジュールでの製作実績多数。",
  },
  {
    icon: Layers,
    title: "施工事例・取引実績",
    desc: "戸建て・店舗・カフェ・ホテル・公共施設など全国の現場に納品実績あり。同業他社では応えにくい難物件（曲面手すり・湾曲階段・大型門扉・装飾フェンス等）を含めて事例をご紹介できます。",
  },
] as const

// ── 業者向け FAQ ──
const tradeFaqs = [
  {
    q: "業者様の登録は必要ですか？",
    a: "事前登録は不要です。最初のお問い合わせ時に「業者様」とご記載いただければ、見積もり段階から業者様向けの価格・条件でご案内します。継続取引が見込まれる場合は、社判の入った会社情報を一度頂戴し、与信枠の設定も承ります。",
  },
  {
    q: "卸価格・割引率はどのくらいですか？",
    a: "数量・取引頻度・物件規模により個別にご提示します。一般小売価格に対して、初回案件で 10〜15% 程度、継続取引で 15〜25% 程度を目安としています。複数物件の年間契約・OEM 案件は別途ご相談ください。",
  },
  {
    q: "支払い条件は？",
    a: "業者様とのお取引は銀行振込のみでお願いしております（クレジットカード決済は承っておりません）。初回取引は前金または着金確認後の発送が原則です。継続取引のお客様には月末締め翌月末払い（請求書払い）の与信を設定可能です。法人・個人事業主どちらも対応します。適格請求書（インボイス）対応事業者です（登録番号 T7810771171765）。決済手数料を価格に上乗せせず卸価格を維持するため、業者様とのお取引は振込一本に絞っております。",
  },
  {
    q: "OEM・サンプル提供は可能ですか？",
    a: "OEM 対応可能です。タグ無し納品・施主様向け化粧箱対応・ロゴ刻印などもご相談ください。サンプルは仕上げ確認用の小片サンプル（鎚目・焼付塗装色見本等）を有償で提供可能です。完成品サンプルの貸出は応相談です。",
  },
  {
    q: "施工指導・現場サポートはありますか？",
    a: "千葉県および関東一部エリアは、ado による現地施工対応可能です（別途お見積もり）。エリア外でも、取付詳細図と施工マニュアルをお渡しし、現場対応のお電話サポートも行っています。難物件は現地下見からのお手伝いも可能です。",
  },
] as const

// ── 物件種別 ──
const PROJECT_TYPES = [
  { value: "", label: "- 選択してください -" },
  { value: "house", label: "戸建て住宅" },
  { value: "apartment", label: "集合住宅・マンション" },
  { value: "shop", label: "店舗・カフェ" },
  { value: "hotel", label: "ホテル・旅館" },
  { value: "office", label: "オフィス・公共施設" },
  { value: "other", label: "その他" },
] as const

// ── 依頼内容 ──
const INQUIRY_TYPES = [
  { value: "quote", label: "見積もり依頼" },
  { value: "drawing", label: "図面相談・CAD連携" },
  { value: "oem", label: "OEM 案件のご相談" },
  { value: "wholesale", label: "卸価格・継続取引のご相談" },
  { value: "rush", label: "特急納期のご相談" },
  { value: "other", label: "その他" },
] as const

export default function TradePage() {
  const router = useRouter()
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // ── フォーム状態 ──
  const [company, setCompany] = useState("")
  const [contact, setContact] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [siteAddress, setSiteAddress] = useState("")
  const [projectType, setProjectType] = useState("")
  const [inquiryType, setInquiryType] = useState<string[]>([])
  const [deadline, setDeadline] = useState("")
  const [message, setMessage] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // ── ご相談中の商品（参考見積もり） ──
  const [quoteLines, setQuoteLines] = useState<QuoteLine[]>([])
  const addQuoteLine = () => setQuoteLines((prev) => [...prev, newQuoteLine()])
  const removeQuoteLine = (id: string) =>
    setQuoteLines((prev) => prev.filter((l) => l.id !== id))
  const updateQuoteLine = (id: string, patch: Partial<QuoteLine>) =>
    setQuoteLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))

  const quoteTotal = useMemo(
    () =>
      quoteLines.reduce((sum, l) => {
        const t = calcLineTotal(l)
        return sum + (t ?? 0)
      }, 0),
    [quoteLines]
  )
  const hasCustomLine = useMemo(
    () =>
      quoteLines.some((l) => {
        const p = findQuoteProduct(l.slug)
        // price=0 (Simple/フェンス/面格子等) と quotable=false の priceFrom 商品
        // (Élisabeth/Clémence) は機械計算できず個別見積もり扱いになる
        return p && (p.price === 0 || (p.priceFrom && !p.quotable))
      }),
    [quoteLines]
  )

  const toggleInquiry = (v: string) => {
    setInquiryType((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!company || !contact || !email || !message || !agreed) {
      setSubmitError("必須項目（*）をすべてご入力のうえ、同意のチェックをお願いします。")
      return
    }

    setSubmitting(true)
    try {
      // 業者向けフィールドを 1 通の問い合わせメッセージに統合して /api/contact に送信
      const inquiryLabels = INQUIRY_TYPES.filter((t) => inquiryType.includes(t.value))
        .map((t) => t.label)
        .join(" / ")
      const projectLabel =
        PROJECT_TYPES.find((t) => t.value === projectType)?.label || "未選択"

      // 商品ライン → 参考見積もり明細
      const filledLines = quoteLines.filter((l) => l.slug)
      const quoteBlock: string[] = []
      if (filledLines.length > 0) {
        quoteBlock.push("", "── ご相談中の商品（参考見積もり） ──")
        filledLines.forEach((l, i) => {
          const p = findQuoteProduct(l.slug)
          if (!p) return
          const lineNo = i + 1
          const total = calcLineTotal(l)
          if (p.price === 0 || total === null) {
            // 価格不定商品 / 計算機未対応商品 (Élisabeth/Clémence 等) は個別見積もり
            quoteBlock.push(
              `${lineNo}. ${p.name}（${p.sub}）`,
              `   個別お見積もり（数量 ${l.qty}${p.priceFrom && !p.quotable && l.length ? ` / ご希望長さ ${l.length}m` : ""}）`
            )
          } else if (p.priceFrom && p.quotable && !p.fixedLength) {
            const result = getQuoteUnitPrice(p.slug, Math.max(0.1, Number(l.length) || 0))
            const unit = result?.unitPrice ?? 0
            quoteBlock.push(
              `${lineNo}. ${p.name}（${p.sub}）`,
              `   数量 ${l.qty} 本 × 長さ ${l.length}m / 1 本あたり ¥${unit.toLocaleString()} → ¥${total.toLocaleString()}`
            )
          } else {
            // 固定価格商品 (priceFrom=false) または固定長商品 (Scroll/Fabrice/鎚目)
            quoteBlock.push(
              `${lineNo}. ${p.name}（${p.sub}）`,
              `   数量 ${l.qty} × 単価 ¥${p.price.toLocaleString()} → ¥${total.toLocaleString()}`
            )
          }
        })
        if (quoteTotal > 0) {
          quoteBlock.push(
            "",
            `参考見積もり合計（税込・業者様向け割引未適用）: ¥${quoteTotal.toLocaleString()}`,
            "※ 業者様向け割引・送料・取付費・特注対応費は別途算定。確定金額は折り返しの見積書にてご案内します。",
            "※ お支払いは銀行振込のみでお願いしております。"
          )
        }
      }

      const composed = [
        "【業者様からのお問い合わせ】",
        `会社名: ${company}`,
        `ご担当者: ${contact}`,
        `お電話: ${phone || "未入力"}`,
        `現場住所: ${siteAddress || "未入力"}`,
        `物件種別: ${projectLabel}`,
        `ご依頼内容: ${inquiryLabels || "未選択"}`,
        `希望納期: ${deadline || "未指定"}`,
        ...quoteBlock,
        "",
        "── ご相談内容 ──",
        message,
      ].join("\n")

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${company} / ${contact}`,
          email,
          phone,
          category: "trade",
          product: "trade",
          message: composed,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || `送信に失敗しました (HTTP ${res.status})`)
      }

      router.push("/contact/thanks?from=trade")
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "送信に失敗しました。時間をおいて再度お試しください。"
      )
      setSubmitting(false)
    }
  }

  return (
    <>
      <Header />
      <main className="pt-20 lg:pt-24 pb-0 bg-background">
        {/* ════════════ Hero ════════════ */}
        <section className="border-b border-border bg-dark text-white">
          <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-16 lg:py-24">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">For Builders</p>
            <h1 className="font-serif text-[26px] md:text-4xl lg:text-6xl leading-[1.35] md:leading-[1.25] mb-6">
              工務店様・設計事務所様へ。
              <br />
              <span className="text-gold">他では難しいご依頼</span>こそ、
              <br />
              鍛冶職人が
              <span className="md:hidden"><br /></span>
              お引き受けいたします。
            </h1>
            <p className="text-[14px] lg:text-[16px] leading-[1.95] text-white/80 max-w-2xl mb-6">
              鍛鉄・焼付塗装・レーザーカット・機械加工・溶融亜鉛メッキ。一般的な鉄工所では断られがちな仕様も、自社工房で職人本人が一貫して請け負います。卸価格・図面 / CAD 対応・特急納期にも対応。
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/40 bg-gold/10 text-gold text-[12px] tracking-wide mb-8">
              <Banknote className="w-4 h-4" strokeWidth={1.5} />
              <span>業者様とのお取引は銀行振込のみ・適格請求書（インボイス）対応</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <PrimaryCTA href="#trade-form" variant="gold" size="md" withArrow>
                業者様専用フォームへ
              </PrimaryCTA>
              <PrimaryCTA href="#trade-faq" variant="gold-glass" size="md">
                業者様向け FAQ を見る
              </PrimaryCTA>
            </div>
          </div>
        </section>

        {/* ════════════ Pillars ════════════ */}
        <section className="border-b border-border py-20 lg:py-28">
          <div className="max-w-[1200px] mx-auto px-4 lg:px-8">
            <div className="mb-14 lg:mb-16">
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Strengths</p>
              <h2 className="font-serif text-3xl lg:text-5xl text-foreground leading-tight">
                ado だから対応できる、5 つの強み
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-5 lg:gap-6">
              {pillars.map((p) => {
                const Icon = p.icon
                return (
                  <div
                    key={p.title}
                    className="border border-border rounded-xl bg-card p-7 lg:p-8 hover:border-gold/40 transition-colors"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 text-gold mb-5">
                      <Icon className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-serif text-lg lg:text-xl text-foreground mb-3 leading-snug">
                      {p.title}
                    </h3>
                    <p className="text-[14px] leading-[1.95] text-muted-foreground">
                      {p.desc}
                    </p>
                  </div>
                )
              })}
            </div>
            {/* 施工事例写真（トップの施工事例ギャラリーと共通素材・実写のみ） */}
            <div className="mt-10 grid grid-cols-3 gap-3 lg:gap-4">
              {[
                { src: "/images/gallery/case-1.jpg", alt: "コンクリート壁の廻り階段に取り付けた白い壁付け手すりの施工事例" },
                { src: "/images/gallery/case-5.jpg", alt: "白壁の階段に取り付けた曲線のロートアイアン手すりの施工事例" },
                { src: "/images/gallery/case-2.jpg", alt: "コンクリート外階段と黒いアプローチ手すりのある住宅外観の施工事例" },
              ].map((c) => (
                <div key={c.src} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-secondary">
                  <Image
                    src={c.src}
                    alt={c.alt}
                    fill
                    sizes="(max-width: 768px) 33vw, 300px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            <p className="mt-8 text-center text-[13px] text-muted-foreground">
              表面処理の技術詳細は
              <Link href="/galvanizing" className="text-gold hover:underline mx-1">
                溶融亜鉛メッキ
              </Link>
              ・
              <Link href="/paint" className="text-gold hover:underline mx-1">
                2 液型ウレタン塗装
              </Link>
              のページで図解しています。
            </p>
          </div>
        </section>

        {/* ════════════ Trade FAQ ════════════ */}
        <section
          id="trade-faq"
          className="border-b border-border bg-card/30 py-20 lg:py-28 scroll-mt-24"
        >
          <div className="max-w-[880px] mx-auto px-4 lg:px-8">
            <div className="mb-12 text-center">
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Trade FAQ</p>
              <h2 className="font-serif text-3xl lg:text-4xl text-foreground">
                業者様からよくいただく質問
              </h2>
            </div>
            <div className="space-y-3">
              {tradeFaqs.map((faq, index) => {
                const isOpen = openFaq === index
                return (
                  <div
                    key={index}
                    className="border border-border rounded-lg overflow-hidden bg-background"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
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
            <p className="text-center text-[13px] text-muted-foreground mt-8">
              個人のお客様向けの一般 FAQ は{" "}
              <Link href="/faq" className="text-gold underline-offset-2 hover:underline">
                よくあるご質問
              </Link>{" "}
              をご覧ください。
            </p>
          </div>
        </section>

        {/* ════════════ Trade Form ════════════ */}
        <section id="trade-form" className="py-20 lg:py-28 scroll-mt-24">
          <div className="max-w-[880px] mx-auto px-4 lg:px-8">
            <div className="mb-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 text-gold mb-4">
                <Building2 className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Contact</p>
              <h2 className="font-serif text-3xl lg:text-4xl text-foreground mb-4">
                業者様専用お問い合わせ
              </h2>
              <p className="text-[14px] leading-[1.95] text-muted-foreground max-w-[640px] mx-auto">
                通常 1〜2 営業日以内に職人が直接ご返答します。図面・現場写真の添付は、まずこちらから送信後の返信メールに添付してください。
                <br className="hidden md:inline" />
                お支払いは銀行振込のみ・適格請求書（インボイス）対応です。
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 会社・担当 */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-foreground mb-2">
                    会社名 / 屋号 <span className="text-gold">*</span>
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                    placeholder="株式会社○○工務店"
                    className="w-full px-4 py-3 border border-border rounded-md bg-background text-[14px] focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-foreground mb-2">
                    ご担当者名 <span className="text-gold">*</span>
                  </label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    required
                    placeholder="山田 太郎"
                    className="w-full px-4 py-3 border border-border rounded-md bg-background text-[14px] focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>

              {/* 連絡先 */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-foreground mb-2">
                    メールアドレス <span className="text-gold">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="info@example.com"
                    className="w-full px-4 py-3 border border-border rounded-md bg-background text-[14px] focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-foreground mb-2">
                    お電話
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="03-0000-0000"
                    className="w-full px-4 py-3 border border-border rounded-md bg-background text-[14px] focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>

              {/* 現場・物件 */}
              <div>
                <label className="block text-[12px] font-medium text-foreground mb-2">
                  現場住所（市区町村まででも可）
                </label>
                <input
                  type="text"
                  value={siteAddress}
                  onChange={(e) => setSiteAddress(e.target.value)}
                  placeholder="東京都世田谷区"
                  className="w-full px-4 py-3 border border-border rounded-md bg-background text-[14px] focus:outline-none focus:border-gold transition-colors"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-foreground mb-2">
                  物件種別
                </label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-md bg-background text-[14px] focus:outline-none focus:border-gold transition-colors"
                >
                  {PROJECT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 依頼内容（複数選択） */}
              <div>
                <label className="block text-[12px] font-medium text-foreground mb-3">
                  ご依頼内容（複数選択可）
                </label>
                <div className="grid sm:grid-cols-2 gap-2">
                  {INQUIRY_TYPES.map((t) => {
                    const checked = inquiryType.includes(t.value)
                    return (
                      <label
                        key={t.value}
                        className={`flex items-center gap-2 px-4 py-3 border rounded-md cursor-pointer text-[13px] transition-colors ${
                          checked
                            ? "border-gold bg-gold/5 text-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-gold/40"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleInquiry(t.value)}
                          className="w-4 h-4 accent-gold"
                        />
                        {t.label}
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* ご相談中の商品（参考見積もり） */}
              <div className="border border-border rounded-xl bg-card/40 p-5 lg:p-6">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div>
                    <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-1">Quote</p>
                    <h3 className="font-serif text-[16px] lg:text-[18px] text-foreground">
                      ご相談中の商品（参考見積もり）
                    </h3>
                  </div>
                </div>
                <p className="text-[12px] text-muted-foreground leading-[1.85] mb-5">
                  商品と数量・長さを選ぶと、参考金額を自動表示します。<span className="text-foreground">業者様向け割引・送料・取付費・特注対応費は別途</span>。確定金額は折り返しの見積書にてご案内します。
                </p>

                {quoteLines.length === 0 ? (
                  <button
                    type="button"
                    onClick={addQuoteLine}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-border rounded-md text-[13px] text-muted-foreground hover:border-gold hover:text-gold transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    商品を追加して参考金額を見る
                  </button>
                ) : (
                  <div className="space-y-4">
                    {quoteLines.map((line, index) => {
                      const product = findQuoteProduct(line.slug)
                      const lineTotal = calcLineTotal(line)
                      return (
                        <div
                          key={line.id}
                          className="border border-border rounded-lg bg-background p-4 lg:p-5"
                        >
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <span className="text-[11px] tracking-wide text-muted-foreground">
                              商品 #{index + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeQuoteLine(line.id)}
                              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-red-600 transition-colors"
                              aria-label="この商品を削除"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              削除
                            </button>
                          </div>
                          <select
                            value={line.slug}
                            onChange={(e) => updateQuoteLine(line.id, { slug: e.target.value })}
                            className="w-full px-4 py-3 border border-border rounded-md bg-background text-[13px] focus:outline-none focus:border-gold transition-colors mb-3"
                          >
                            <option value="">- 商品を選択してください -</option>
                            {QUOTE_PRODUCTS.map((p) => {
                              // 価格ラベル: priceFrom は商品ごとに表記が違う
                              // - 計算機未対応 (Élisabeth/Clémence): 「¥XX,000〜（個別お見積もり）」
                              // - 固定長 (Scroll/Fabrice/鎚目): 「¥XX,000」一律
                              // - 横型/縦型 quotable: 「〜N.Nm まで ¥XX,000〜」(N = stdLengthM)
                              let label: string
                              if (p.price === 0) {
                                label = "（個別お見積もり）"
                              } else if (!p.priceFrom) {
                                label = `（¥${p.price.toLocaleString()}）`
                              } else if (!p.quotable) {
                                label = `（¥${p.price.toLocaleString()}〜 / 個別お見積もり）`
                              } else if (p.fixedLength) {
                                label = `（¥${p.price.toLocaleString()}）`
                              } else {
                                label = `（〜${p.stdLengthM}m まで ¥${p.price.toLocaleString()}〜）`
                              }
                              return (
                                <option key={p.slug} value={p.slug}>
                                  {p.name} — {p.sub}{label}
                                </option>
                              )
                            })}
                          </select>
                          {product && (
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] text-muted-foreground mb-1">
                                  数量（本 / 台）
                                </label>
                                <input
                                  type="number"
                                  min={1}
                                  step={1}
                                  value={line.qty}
                                  onChange={(e) =>
                                    updateQuoteLine(line.id, {
                                      qty: Math.max(1, Number(e.target.value) || 1),
                                    })
                                  }
                                  className="w-full px-3 py-2.5 border border-border rounded-md bg-background text-[14px] focus:outline-none focus:border-gold transition-colors"
                                />
                              </div>
                              {product.priceFrom && !product.fixedLength && (
                                <div>
                                  <label className="block text-[11px] text-muted-foreground mb-1">
                                    長さ（m / 1 本あたり）
                                    {product.quotable && (
                                      <span className="text-muted-foreground/70">
                                        {" "}〜{product.stdLengthM}m まで一律
                                      </span>
                                    )}
                                  </label>
                                  <input
                                    type="number"
                                    min={0.5}
                                    max={product.maxLengthM}
                                    step={0.1}
                                    value={line.length}
                                    onChange={(e) =>
                                      updateQuoteLine(line.id, {
                                        length: Math.max(0.1, Number(e.target.value) || 0.1),
                                      })
                                    }
                                    className="w-full px-3 py-2.5 border border-border rounded-md bg-background text-[14px] focus:outline-none focus:border-gold transition-colors"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                          {product && (
                            <div className="mt-3 pt-3 border-t border-border text-[13px]">
                              {product.price === 0 || (product.priceFrom && !product.quotable) ? (
                                <span className="text-muted-foreground">
                                  個別お見積もり（折り返し見積書でご案内）
                                </span>
                              ) : (
                                <div className="flex items-baseline justify-between">
                                  <span className="text-[11px] text-muted-foreground">
                                    参考金額（税込）
                                  </span>
                                  <span className="font-serif text-[18px] text-foreground">
                                    ¥{lineTotal?.toLocaleString() ?? "—"}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}

                    <button
                      type="button"
                      onClick={addQuoteLine}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-border rounded-md text-[13px] text-muted-foreground hover:border-gold hover:text-gold transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      商品を追加
                    </button>

                    {quoteTotal > 0 && (
                      <div className="bg-gold/5 border border-gold/30 rounded-lg p-5">
                        <div className="flex items-baseline justify-between mb-2">
                          <span className="text-[11px] tracking-wide text-muted-foreground">
                            参考見積もり合計（税込）
                          </span>
                          <span className="font-serif text-[22px] lg:text-[26px] text-foreground">
                            ¥{quoteTotal.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[11px] leading-[1.85] text-muted-foreground">
                          ※ 業者様向け割引（10〜25%）・送料・取付費・特注対応費は別途算定します。
                          <br />
                          ※ 確定金額は折り返しの見積書にてご案内します。お支払いは銀行振込のみ。
                        </p>
                        {hasCustomLine && (
                          <p className="text-[11px] text-gold mt-2">
                            ※「個別お見積もり」商品は上記合計に含まれていません。
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 希望納期 */}
              <div>
                <label className="block text-[12px] font-medium text-foreground mb-2">
                  希望納期・現場工程
                </label>
                <input
                  type="text"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  placeholder="例: 2026年8月末竣工 / 7月中旬納品希望"
                  className="w-full px-4 py-3 border border-border rounded-md bg-background text-[14px] focus:outline-none focus:border-gold transition-colors"
                />
              </div>

              {/* 本文 */}
              <div>
                <label className="block text-[12px] font-medium text-foreground mb-2">
                  ご相談内容 <span className="text-gold">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={7}
                  placeholder="例: 玄関アプローチの手すり 2 連 (各 L=1.8m) を、12mm フラットバー鎚目仕上げで製作いただきたいです。図面ありますので返信メールに添付します。"
                  className="w-full px-4 py-3 border border-border rounded-md bg-background text-[14px] leading-[1.85] focus:outline-none focus:border-gold transition-colors resize-y"
                />
              </div>

              {/* 同意 */}
              <label className="flex items-start gap-3 text-[12px] text-muted-foreground leading-[1.85] cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-gold shrink-0"
                />
                <span>
                  <Link href="/privacy" className="text-gold underline-offset-2 hover:underline">
                    プライバシーポリシー
                  </Link>
                  の取扱いに同意します。 <span className="text-gold">*</span>
                </span>
              </label>

              {submitError && (
                <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-3">
                  {submitError}
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-dark text-white text-[14px] font-medium tracking-wide rounded-md hover:bg-foreground transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? "送信中..." : "送信する"}
                  {!submitting && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
