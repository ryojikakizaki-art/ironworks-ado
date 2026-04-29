"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PrimaryCTA } from "@/components/ui/primary-cta"
import { LineIcon } from "@/components/ui/line-icon"
import { Mail, FileText } from "lucide-react"

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "product", label: "製品について" },
  { value: "size", label: "サイズ・採寸のご相談" },
  { value: "custom", label: "特注・カスタムオーダー" },
  { value: "order", label: "ご注文・お届けについて" },
  { value: "other", label: "その他" },
]

const PRODUCT_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "- 選択してください -" },
  { value: "rene", label: "René ルネ" },
  { value: "claire", label: "Claire クレール" },
  { value: "marcel", label: "Marcel マルセル" },
  { value: "emile", label: "Émile エミール" },
  { value: "claude", label: "Claude クロード" },
  { value: "catherine", label: "Catherine カトリーヌ" },
  { value: "alexandre", label: "Alexandre アレクサンドル" },
  { value: "antoine", label: "Antoine アントワーヌ" },
  { value: "other", label: "その他・複数" },
]

// ── ファイル添付制約 ──
const MAX_FILES = 5
const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10MB / file
const MAX_TOTAL_BYTES = 25 * 1024 * 1024 // 25MB total
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
]
const ALLOWED_EXT_HINT = ".jpg, .jpeg, .png, .webp, .heic, .pdf"

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1024 / 1024).toFixed(1)} MB`
}

// ── ヒーロー横の指標 ──
const stats = [
  { value: "1〜2", unit: "営業日", label: "返信目安", desc: "通常はおおよそこの目安でご返信" },
  { value: "個別", unit: "対応", label: "見積り方式", desc: "サイズ・配送先で内容変動のため" },
  { value: "3", unit: "経路", label: "ご相談手段", desc: "フォーム / LINE / メール" },
  { value: "無料", unit: "相談", label: "見積り費用", desc: "ご相談・お見積りは無料" },
]

// ── お問い合わせ後の流れ ──
const flowSteps = [
  {
    no: "Step 01",
    label: "RECEIVE",
    titleJa: "お問い合わせ受付",
    desc: "フォーム送信後、自動返信メールを即時お送りします。届かない場合は迷惑メールフォルダもご確認ください。",
  },
  {
    no: "Step 02",
    label: "REVIEW",
    titleJa: "内容確認",
    desc: "ご相談内容を職人が確認します。寸法・取り付け環境・色などの追加質問が必要な場合はメールでお伺いします。",
  },
  {
    no: "Step 03",
    label: "QUOTE",
    titleJa: "お見積もり・ご提案",
    desc: "標準仕様か特注かに応じて、概算もしくは詳細見積りをご返信。送料・施工費は依頼内容に応じて個別にご案内します。",
  },
  {
    no: "Step 04",
    label: "ORDER",
    titleJa: "ご注文・制作",
    desc: "仕様確定後にお支払いのご案内。標準在庫品は 2 営業日以内に発送、オーダー品は約 10 営業日で制作のうえ発送します。",
  },
] as const

// ── ご相談の手段 ──
const channels = [
  {
    icon: FileText,
    label: "Form",
    title: "お問い合わせフォーム",
    desc: "詳細な仕様や寸法、図面・写真を添付してご相談されたい方に。",
    note: "本ページ下部",
    accent: "gold" as const,
  },
  {
    icon: LineIcon,
    label: "LINE",
    title: "LINE で簡単相談",
    desc: "個人情報の入力なしで、写真と一言から無料見積もり。職人が直接ご返答します。",
    note: "@ironworks-ado",
    href: "https://lin.ee/Tnjukrf",
    accent: "line" as const,
  },
  {
    icon: Mail,
    label: "Mail",
    title: "メールで直接連絡",
    desc: "既にやり取りがある場合や、フォームでカバーしきれない長文相談に。",
    note: "ado@tantetuzest.com",
    href: "mailto:ado@tantetuzest.com",
    accent: "neutral" as const,
  },
]

export default function ContactPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "product",
    product: "",
    message: "",
  })
  const [files, setFiles] = useState<File[]>([])
  const [fileError, setFileError] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const totalBytes = files.reduce((acc, f) => acc + f.size, 0)

  const handleFiles = (newFiles: FileList | null) => {
    setFileError("")
    if (!newFiles || newFiles.length === 0) return

    const incoming = Array.from(newFiles)
    let next = [...files]
    let err = ""

    for (const f of incoming) {
      if (next.length >= MAX_FILES) {
        err = `添付ファイルは最大 ${MAX_FILES} 件までです。`
        break
      }
      const isImage = f.type.startsWith("image/")
      const isPdf = f.type === "application/pdf"
      if (!isImage && !isPdf && !ALLOWED_TYPES.includes(f.type)) {
        err = `「${f.name}」はサポート外の形式です（${ALLOWED_EXT_HINT} のみ）`
        continue
      }
      if (f.size > MAX_FILE_BYTES) {
        err = `「${f.name}」は ${formatBytes(MAX_FILE_BYTES)} を超えています`
        continue
      }
      const projectedTotal = next.reduce((a, x) => a + x.size, 0) + f.size
      if (projectedTotal > MAX_TOTAL_BYTES) {
        err = `合計サイズが ${formatBytes(MAX_TOTAL_BYTES)} を超えます`
        break
      }
      next.push(f)
    }

    setFiles(next)
    setFileError(err)
    // Reset input so the same file can be re-selected if removed
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
    setFileError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("sending")
    setErrorMsg("")
    try {
      const fd = new FormData()
      fd.append("name", form.name)
      fd.append("email", form.email)
      fd.append("category", form.category)
      fd.append("product", form.product)
      fd.append("message", form.message)
      files.forEach((f) => fd.append("attachments", f))

      const res = await fetch("/api/contact", {
        method: "POST",
        body: fd,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `送信に失敗しました (${res.status})`)
      }
      router.push("/contact/thanks")
    } catch (err) {
      setStatus("error")
      setErrorMsg(err instanceof Error ? err.message : "送信に失敗しました")
    }
  }

  return (
    <>
      <Header />
      <main className="pt-16 lg:pt-20 pb-20 bg-background">
        {/* ════════════ Hero — Asymmetric (Vermicular RECRAFT pattern) ════════════ */}
        <section className="border-b border-border">
          <div className="grid lg:grid-cols-12 lg:min-h-[60vh]">
            {/* Left: Text */}
            <div className="lg:col-span-5 px-5 lg:px-12 py-12 lg:py-20 flex flex-col justify-center">
              <p className="text-[10px] tracking-[0.5em] uppercase text-gold mb-5">Contact</p>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-foreground leading-[1.15] mb-3">
                お問い合わせ
              </h1>
              <p className="font-serif text-[14px] lg:text-base text-foreground/70 mb-8">
                Get in touch with the workshop
              </p>
              <p className="text-[14px] lg:text-[15px] leading-[1.95] text-foreground/80 max-w-md">
                ご質問・ご要望・お見積もりのご依頼など、お気軽にご相談ください。
                通常 1〜2 営業日以内に、職人より直接ご返信いたします。
                寸法や取り付け環境のお写真があると、より具体的にご案内できます。
              </p>
            </div>
            {/* Right: workshop photo */}
            <div className="lg:col-span-7 relative aspect-[3/2] lg:aspect-auto bg-secondary">
              <Image
                src="/images/greeting-craft.jpg"
                alt="千葉の工房で鉄を打つ職人"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* ════════════ Stats banner ════════════ */}
        <section className="border-b border-border bg-card/30">
          <div className="max-w-[1200px] mx-auto px-5 lg:px-8 py-10 lg:py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
              {stats.map((s) => {
                const isWord = /[぀-ヿ一-鿿]/.test(s.value)
                return (
                  <div key={s.label} className="text-center md:text-left">
                    <div className="flex items-baseline justify-center md:justify-start gap-1">
                      <span
                        className={`font-serif text-gold ${
                          isWord ? "text-xl lg:text-2xl" : "text-3xl lg:text-4xl"
                        }`}
                      >
                        {s.value}
                      </span>
                      <span className="text-[12px] text-gold/80">{s.unit}</span>
                    </div>
                    <p className="text-[12px] font-medium text-foreground mt-1">{s.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ════════════ Sub-hero centered statement ════════════ */}
        <section className="relative max-w-[880px] mx-auto px-5 lg:px-8 py-16 lg:py-24 text-center overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[600px] aspect-square rounded-full bg-gold/[0.03] pointer-events-none" />
          <p className="relative font-serif text-base lg:text-2xl leading-[2.2] lg:leading-[2.4] text-foreground/90">
            一本の手すりを決めるのは、
            <br />
            <span className="text-gold">小さな対話の積み重ね</span>です。
            <br />
            気になる点はすべて、お気軽にお聞かせください。
          </p>
        </section>

        {/* ════════════ Section 01 — Channels ════════════ */}
        <section id="channels" className="border-y border-border bg-card/20 py-20 lg:py-28">
          <div className="max-w-[1200px] mx-auto px-5 lg:px-8 grid lg:grid-cols-12 gap-8 lg:gap-12">
            <aside className="lg:col-span-3">
              <div className="lg:sticky lg:top-24">
                <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">Section 01</p>
                <h2 className="font-serif text-3xl lg:text-5xl text-foreground leading-none">
                  Channels
                </h2>
                <p className="text-[12px] text-muted-foreground mt-3">3 つのご相談手段</p>
              </div>
            </aside>
            <div className="lg:col-span-9 scroll-mt-24">
              <h3 className="font-serif text-xl lg:text-3xl text-foreground mb-6 leading-snug">
                どの経路でも、職人が直接ご返答します。
              </h3>
              <p className="text-[15px] leading-[1.95] text-foreground/80 mb-10 max-w-2xl">
                ご相談の内容や手元にある資料に応じて、最適な経路をお選びください。
                どの経路から頂いても、対応する職人は同じです。
              </p>

              <div className="grid md:grid-cols-3 gap-4 lg:gap-5">
                {channels.map((c) => {
                  const Icon = c.icon
                  const accentBg =
                    c.accent === "gold"
                      ? "bg-gold/10 text-gold"
                      : c.accent === "line"
                      ? "bg-[#06C755]/10 text-[#06C755]"
                      : "bg-foreground/5 text-foreground"
                  const inner = (
                    <div className="h-full bg-background border border-border rounded-md p-6 lg:p-7 hover:border-gold/40 transition-colors">
                      <div
                        className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${accentBg} mb-5`}
                      >
                        <Icon className="w-5 h-5" strokeWidth={1.5} />
                      </div>
                      <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-1">
                        {c.label}
                      </p>
                      <h4 className="font-serif text-lg text-foreground mb-2 leading-snug">
                        {c.title}
                      </h4>
                      <p className="text-[13px] leading-[1.85] text-muted-foreground mb-4">
                        {c.desc}
                      </p>
                      <p className="text-[11px] tracking-wide text-foreground/60 border-t border-border pt-3">
                        {c.note}
                      </p>
                    </div>
                  )
                  return c.href ? (
                    <a
                      key={c.label}
                      href={c.href}
                      target={c.href.startsWith("http") ? "_blank" : undefined}
                      rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="block h-full"
                    >
                      {inner}
                    </a>
                  ) : (
                    <a key={c.label} href="#form" className="block h-full">
                      {inner}
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ════════════ Section 02 — Form ════════════ */}
        <section id="form" className="py-20 lg:py-28">
          <div className="max-w-[1200px] mx-auto px-5 lg:px-8 grid lg:grid-cols-12 gap-8 lg:gap-12">
            <aside className="lg:col-span-3">
              <div className="lg:sticky lg:top-24">
                <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">Section 02</p>
                <h2 className="font-serif text-3xl lg:text-5xl text-foreground leading-none">
                  Form
                </h2>
                <p className="text-[12px] text-muted-foreground mt-3">お問い合わせフォーム</p>

                {/* 記入のヒント */}
                <div className="hidden lg:block mt-10 pt-6 border-t border-border">
                  <p className="text-[11px] tracking-[0.25em] uppercase text-gold mb-3">
                    記入のヒント
                  </p>
                  <ul className="space-y-3 text-[12px] text-muted-foreground leading-[1.85]">
                    <li className="flex gap-2">
                      <span className="text-gold/70 shrink-0">—</span>
                      取り付け先（屋内 / 屋外、壁 / 階段）
                    </li>
                    <li className="flex gap-2">
                      <span className="text-gold/70 shrink-0">—</span>
                      希望サイズ・長さ（おおよそで可）
                    </li>
                    <li className="flex gap-2">
                      <span className="text-gold/70 shrink-0">—</span>
                      設置予定場所のお写真
                    </li>
                    <li className="flex gap-2">
                      <span className="text-gold/70 shrink-0">—</span>
                      ご希望のお届け時期
                    </li>
                  </ul>
                </div>
              </div>
            </aside>

            <div className="lg:col-span-9 scroll-mt-24">
              <h3 className="font-serif text-xl lg:text-3xl text-foreground mb-6 leading-snug">
                お気軽に、わかる範囲でご記入ください。
              </h3>
              <p className="text-[15px] leading-[1.95] text-foreground/80 mb-10 max-w-2xl">
                未記入の項目があっても、職人からの折り返しでお伺いします。
                寸法・配置のお写真や図面があれば添付いただけるとスムーズです。
              </p>

              <form onSubmit={handleSubmit} className="space-y-8" encType="multipart/form-data">
                {/* お名前 */}
                <div>
                  <label className="flex items-baseline justify-between mb-2">
                    <span className="text-[12px] tracking-[0.15em] text-foreground">お名前</span>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-gold">Required</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-0 py-3 bg-transparent border-0 border-b border-border text-foreground text-[15px] focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                {/* メールアドレス */}
                <div>
                  <label className="flex items-baseline justify-between mb-2">
                    <span className="text-[12px] tracking-[0.15em] text-foreground">メールアドレス</span>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-gold">Required</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-0 py-3 bg-transparent border-0 border-b border-border text-foreground text-[15px] focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                {/* お問い合わせ種別 — pill チップ式 */}
                <div>
                  <label className="flex items-baseline justify-between mb-3">
                    <span className="text-[12px] tracking-[0.15em] text-foreground">お問い合わせ種別</span>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-gold">Required</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_OPTIONS.map((o) => {
                      const active = form.category === o.value
                      return (
                        <button
                          key={o.value}
                          type="button"
                          onClick={() => setForm({ ...form, category: o.value })}
                          className={`px-4 py-2 rounded-full text-[12px] tracking-wide transition-colors border ${
                            active
                              ? "bg-foreground text-background border-foreground"
                              : "bg-transparent text-foreground/70 border-border hover:border-gold hover:text-foreground"
                          }`}
                        >
                          {o.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* ご興味のある商品 */}
                <div>
                  <label className="flex items-baseline justify-between mb-2">
                    <span className="text-[12px] tracking-[0.15em] text-foreground">
                      ご興味のある商品
                    </span>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                      Optional
                    </span>
                  </label>
                  <select
                    value={form.product}
                    onChange={(e) => setForm({ ...form, product: e.target.value })}
                    className="w-full px-0 py-3 bg-transparent border-0 border-b border-border text-foreground text-[15px] focus:outline-none focus:border-gold transition-colors"
                  >
                    {PRODUCT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ご質問・ご要望 */}
                <div>
                  <label className="flex items-baseline justify-between mb-2">
                    <span className="text-[12px] tracking-[0.15em] text-foreground">
                      ご質問・ご要望
                    </span>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-gold">Required</span>
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="ご不明な点やご要望などをお気軽にお書きください。"
                    className="w-full px-0 py-3 bg-transparent border-0 border-b border-border text-foreground text-[15px] focus:outline-none focus:border-gold transition-colors resize-vertical"
                  />
                </div>

                {/* ファイル添付 */}
                <div>
                  <label className="flex items-baseline justify-between mb-3">
                    <span className="text-[12px] tracking-[0.15em] text-foreground">ファイル添付</span>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                      Optional
                    </span>
                  </label>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.currentTarget.classList.add("border-gold")
                    }}
                    onDragLeave={(e) => e.currentTarget.classList.remove("border-gold")}
                    onDrop={(e) => {
                      e.preventDefault()
                      e.currentTarget.classList.remove("border-gold")
                      handleFiles(e.dataTransfer.files)
                    }}
                    className="border border-dashed border-border bg-card/30 rounded-md p-7 text-center transition-colors"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,.pdf,.heic"
                      onChange={(e) => handleFiles(e.target.files)}
                      className="hidden"
                      id="contact-files"
                    />
                    <label
                      htmlFor="contact-files"
                      className="inline-block px-5 py-2 rounded-full border border-gold text-gold text-[11px] tracking-[0.2em] uppercase cursor-pointer hover:bg-gold hover:text-white transition-colors"
                    >
                      ファイルを選択
                    </label>
                    <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
                      ドラッグ&ドロップでも追加できます
                      <br />
                      画像（JPG / PNG / HEIC）または PDF / 1 ファイル{" "}
                      {formatBytes(MAX_FILE_BYTES)} まで / 最大 {MAX_FILES} 件
                    </p>
                  </div>

                  {/* ファイル一覧 */}
                  {files.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {files.map((f, i) => (
                        <li
                          key={`${f.name}-${i}`}
                          className="flex items-center gap-3 px-4 py-2.5 bg-card/40 border border-border rounded-md text-[13px]"
                        >
                          <span className="text-gold text-[10px] tracking-wider uppercase shrink-0">
                            {f.type.startsWith("image/")
                              ? "IMG"
                              : f.type === "application/pdf"
                              ? "PDF"
                              : "FILE"}
                          </span>
                          <span className="flex-1 truncate text-foreground">{f.name}</span>
                          <span className="text-muted-foreground text-[11px] shrink-0">
                            {formatBytes(f.size)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            className="text-muted-foreground hover:text-red-400 text-lg leading-none px-2 shrink-0"
                            aria-label={`${f.name} を削除`}
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {files.length > 0 && (
                    <p className="text-[11px] text-muted-foreground mt-3">
                      合計 {files.length} 件 / {formatBytes(totalBytes)}（上限{" "}
                      {formatBytes(MAX_TOTAL_BYTES)}）
                    </p>
                  )}

                  {fileError && <p className="text-[12px] text-red-400 mt-2">{fileError}</p>}
                </div>

                {status === "error" && <p className="text-[13px] text-red-400">{errorMsg}</p>}

                <div className="pt-4">
                  <PrimaryCTA
                    type="submit"
                    variant="gold"
                    size="lg"
                    disabled={status === "sending"}
                    className="w-full"
                    withArrow={status !== "sending"}
                  >
                    {status === "sending" ? "送信中..." : "送信する"}
                  </PrimaryCTA>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* ════════════ Section 03 — Flow ════════════ */}
        <section id="flow" className="border-y border-border bg-card/30 py-20 lg:py-28">
          <div className="max-w-[1200px] mx-auto px-5 lg:px-8 grid lg:grid-cols-12 gap-8 lg:gap-12">
            <aside className="lg:col-span-3">
              <div className="lg:sticky lg:top-24">
                <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">Section 03</p>
                <h2 className="font-serif text-3xl lg:text-5xl text-foreground leading-none">
                  Flow
                </h2>
                <p className="text-[12px] text-muted-foreground mt-3">お問い合わせ後の流れ</p>
              </div>
            </aside>
            <div className="lg:col-span-9 scroll-mt-24">
              <h3 className="font-serif text-xl lg:text-3xl text-foreground mb-6 leading-snug">
                受付からお届けまで、4 ステップでご案内します。
              </h3>
              <p className="text-[15px] leading-[1.95] text-foreground/80 mb-10 max-w-2xl">
                送信後すぐに自動返信メールをお送りします。職人からの正式な返信は通常
                1〜2 営業日以内です。
              </p>

              <div className="space-y-0">
                {flowSteps.map((s) => (
                  <div
                    key={s.label}
                    className="grid grid-cols-12 gap-3 lg:gap-6 py-5 border-t border-border first:border-t-0"
                  >
                    <div className="col-span-3 lg:col-span-2">
                      <p className="text-[10px] tracking-[0.3em] text-muted-foreground">{s.no}</p>
                      <p className="text-[11px] tracking-[0.2em] uppercase text-gold mt-1">
                        {s.label}
                      </p>
                    </div>
                    <div className="col-span-9 lg:col-span-10">
                      <h4 className="font-serif text-base lg:text-xl text-foreground mb-1.5 leading-snug">
                        {s.titleJa}
                      </h4>
                      <p className="text-[13px] lg:text-[14px] leading-[1.85] text-muted-foreground">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
