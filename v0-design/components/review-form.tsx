"use client"

import { useState } from "react"
import { Camera, Send } from "lucide-react"
import { PrimaryCTA } from "@/components/ui/primary-cta"
import { CATALOG_PRODUCTS } from "@/lib/products/catalog"

const MAX_FILES = 3
const MAX_FILE_BYTES = 10 * 1024 * 1024

// カタログ全商品（内部ページを持つもの）から選択肢を自動生成（/contact と同方式）
const PRODUCT_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "- 選択してください（任意） -" },
  ...Array.from(
    new Map(
      CATALOG_PRODUCTS.filter((p) => p.href?.startsWith("/products/")).map((p) => {
        const slug = p.href.split("/").pop() as string
        return [slug, { value: slug, label: p.name }]
      }),
    ).values(),
  ),
  { value: "other", label: "その他・複数" },
]

const inputCls =
  "w-full rounded-md border border-border bg-white px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold transition-colors"

/**
 * お客様の声 投稿フォーム（2026-06-13 監査 C群⑱）。
 * 送信は既存の /api/contact（category=review）に相乗りし、掲載は蠣﨑さんが
 * メールで内容を確認してから手動で行う（自動公開はしない）。
 */
export function ReviewForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [product, setProduct] = useState("")
  const [message, setMessage] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle")

  const handleFiles = (list: FileList | null) => {
    if (!list) return
    const next = [...files]
    for (const f of Array.from(list)) {
      if (next.length >= MAX_FILES) break
      if (f.size > MAX_FILE_BYTES) continue
      if (!f.type.startsWith("image/")) continue
      next.push(f)
    }
    setFiles(next)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === "sending") return
    setStatus("sending")
    try {
      const fd = new FormData()
      fd.append("name", name)
      fd.append("email", email)
      fd.append("category", "review")
      fd.append("product", product || "other")
      fd.append("message", message)
      files.forEach((f) => fd.append("attachments", f))
      const res = await fetch("/api/contact", { method: "POST", body: fd })
      setStatus(res.ok ? "done" : "error")
    } catch {
      setStatus("error")
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-lg border border-gold/30 bg-muted/60 p-8 text-center">
        <p className="font-serif text-xl text-foreground mb-2">ありがとうございます。</p>
        <p className="text-[13px] md:text-sm text-muted-foreground leading-relaxed">
          いただいたお声は職人が一通ずつ読ませていただき、
          <br className="hidden md:block" />
          確認のうえ本ページでご紹介させていただく場合があります。
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-border bg-white p-6 md:p-8 space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-[13px] font-medium text-foreground mb-1.5">
            お名前 <span className="text-gold">必須</span>
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: K.T（イニシャル可・掲載時は一部のみ表示）"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-foreground mb-1.5">
            メールアドレス <span className="text-gold">必須</span>
            <span className="ml-2 text-[11px] text-muted-foreground font-normal">公開されません</span>
          </label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="例: example@email.com"
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className="block text-[13px] font-medium text-foreground mb-1.5">ご購入いただいた商品</label>
        <select value={product} onChange={(e) => setProduct(e.target.value)} className={inputCls}>
          {PRODUCT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[13px] font-medium text-foreground mb-1.5">
          ご感想 <span className="text-gold">必須</span>
        </label>
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="使い心地・取り付けてみての変化・職人とのやり取りなど、自由にお書きください"
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-[13px] font-medium text-foreground mb-1.5">
          お写真（任意・{MAX_FILES} 枚まで）
          <span className="ml-2 text-[11px] text-muted-foreground font-normal">
            設置後のお写真を添えていただけると嬉しいです
          </span>
        </label>
        <label className="flex items-center gap-3 rounded-md border border-dashed border-border bg-muted/40 px-4 py-3 cursor-pointer hover:border-gold transition-colors">
          <Camera className="w-4 h-4 text-gold shrink-0" />
          <span className="text-[13px] text-muted-foreground">
            {files.length > 0 ? files.map((f) => f.name).join(" / ") : "クリックして画像を選択"}
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>

      {status === "error" && (
        <div className="border-2 border-red-500/60 bg-red-50 rounded-md p-3 text-[13px] text-red-700">
          送信に失敗しました。お手数ですが時間をおいて再度お試しください。
        </div>
      )}

      <div className="flex justify-center pt-2">
        <PrimaryCTA
          type="submit"
          variant="gold"
          size="lg"
          icon={<Send className="w-4 h-4" />}
          withArrow
          disabled={status === "sending"}
        >
          {status === "sending" ? "送信中…" : "感想を送る"}
        </PrimaryCTA>
      </div>
      <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
        ご投稿いただいた内容は、確認のうえ本ページや商品ページでご紹介させていただく場合があります。
        <br className="hidden md:block" />
        掲載時はお名前の一部のみ表示します。
      </p>
    </form>
  )
}
