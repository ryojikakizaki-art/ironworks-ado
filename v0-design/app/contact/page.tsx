"use client"

import { useState } from "react"
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

export default function ContactPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "product",
    product: "",
    message: "",
  })
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("sending")
    setErrorMsg("")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
          <form onSubmit={handleSubmit} className="space-y-6">
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
