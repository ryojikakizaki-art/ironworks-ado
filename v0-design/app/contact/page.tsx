"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

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
      <main className="pt-20 lg:pt-24 pb-20 bg-background">
        <div className="border-b border-border">
          <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Contact</p>
            <h1 className="font-serif text-3xl lg:text-5xl text-foreground">お問い合わせ</h1>
            <p className="mt-4 text-[13px] text-muted-foreground">
              ご質問・ご要望・お見積もりのご依頼などお気軽にお問い合わせください。通常 1〜2 営業日以内にご返信いたします。
            </p>
          </div>
        </div>

        <div className="max-w-[720px] mx-auto px-4 lg:px-8 py-16">
          <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
            <div>
              <label className="block text-[12px] tracking-wide text-foreground mb-2">
                お名前 <span className="text-gold">*</span>
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 bg-secondary border border-border text-foreground text-[14px] focus:outline-none focus:border-gold transition-colors"
              />
            </div>

            <div>
              <label className="block text-[12px] tracking-wide text-foreground mb-2">
                メールアドレス <span className="text-gold">*</span>
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 bg-secondary border border-border text-foreground text-[14px] focus:outline-none focus:border-gold transition-colors"
              />
            </div>

            <div>
              <label className="block text-[12px] tracking-wide text-foreground mb-2">
                お問い合わせ種別 <span className="text-gold">*</span>
              </label>
              <select
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-3 bg-secondary border border-border text-foreground text-[14px] focus:outline-none focus:border-gold transition-colors"
              >
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] tracking-wide text-foreground mb-2">
                ご興味のある商品
              </label>
              <select
                value={form.product}
                onChange={(e) => setForm({ ...form, product: e.target.value })}
                className="w-full px-4 py-3 bg-secondary border border-border text-foreground text-[14px] focus:outline-none focus:border-gold transition-colors"
              >
                {PRODUCT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] tracking-wide text-foreground mb-2">
                ご質問・ご要望 <span className="text-gold">*</span>
              </label>
              <textarea
                required
                rows={6}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="ご不明な点やご要望などをお気軽にお書きください。"
                className="w-full px-4 py-3 bg-secondary border border-border text-foreground text-[14px] focus:outline-none focus:border-gold transition-colors resize-vertical"
              />
            </div>

            {/* ファイル添付 */}
            <div>
              <label className="block text-[12px] tracking-wide text-foreground mb-2">
                ファイル添付 <span className="text-muted-foreground">（任意）</span>
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
                className="border border-dashed border-border bg-secondary/50 p-5 text-center transition-colors"
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
                  className="inline-block px-5 py-2 border border-gold text-gold text-[11px] tracking-[0.2em] uppercase cursor-pointer hover:bg-gold hover:text-dark transition-colors"
                >
                  ファイルを選択
                </label>
                <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
                  ドラッグ&ドロップでも追加できます<br />
                  画像（JPG / PNG / HEIC）または PDF / 1 ファイル {formatBytes(MAX_FILE_BYTES)} まで / 最大 {MAX_FILES} 件
                </p>
              </div>

              {/* ファイル一覧 */}
              {files.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {files.map((f, i) => (
                    <li
                      key={`${f.name}-${i}`}
                      className="flex items-center gap-3 px-3 py-2 bg-secondary border border-border text-[13px]"
                    >
                      <span className="text-gold text-[10px] tracking-wider uppercase shrink-0">
                        {f.type.startsWith("image/") ? "IMG" : f.type === "application/pdf" ? "PDF" : "FILE"}
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

              {/* 合計サイズ表示 */}
              {files.length > 0 && (
                <p className="text-[11px] text-muted-foreground mt-2">
                  合計 {files.length} 件 / {formatBytes(totalBytes)}（上限 {formatBytes(MAX_TOTAL_BYTES)}）
                </p>
              )}

              {fileError && (
                <p className="text-[12px] text-red-400 mt-2">{fileError}</p>
              )}
            </div>

            {status === "error" && (
              <p className="text-[13px] text-red-400">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full px-8 py-4 border border-gold text-gold text-[11px] tracking-[0.3em] uppercase hover:bg-gold hover:text-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "sending" ? "送信中..." : "送信する"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}
