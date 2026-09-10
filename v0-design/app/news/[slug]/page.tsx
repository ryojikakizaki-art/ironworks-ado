import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PrimaryCTA } from "@/components/ui/primary-cta"
import { NEWS_ARTICLES, getNewsArticle } from "@/lib/news"

const SITE_URL = "https://ado.tantetuzest.com"

export function generateStaticParams() {
  return NEWS_ARTICLES.map((a) => ({ slug: a.slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const a = getNewsArticle(slug)
  if (!a) return {}
  return {
    title: a.metaTitle,
    description: a.description,
    alternates: { canonical: `/news/${a.slug}` },
    openGraph: {
      type: "article",
      url: `${SITE_URL}/news/${a.slug}`,
      siteName: "IRONWORKS ado",
      title: a.metaTitle,
      description: a.description,
      locale: "ja_JP",
    },
  }
}

/** 本文中の [テキスト](/path) を <Link> に変換する（/column と同じ書き方） */
function renderInline(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = []
  const re = /\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0
  let m: RegExpExecArray | null
  let key = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index))
    out.push(
      <Link
        key={key++}
        href={m[2]}
        className="text-gold underline underline-offset-4 hover:opacity-70 transition-opacity"
      >
        {m[1]}
      </Link>,
    )
    last = m.index + m[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params
  const a = getNewsArticle(slug)
  if (!a) notFound()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: a.title,
    description: a.description,
    datePublished: a.date.replaceAll(".", "-"),
    author: { "@type": "Organization", name: "IRONWORKS ado" },
    publisher: { "@type": "Organization", name: "IRONWORKS ado" },
    mainEntityOfPage: `${SITE_URL}/news/${a.slug}`,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main className="pt-20 lg:pt-24 pb-20 bg-background">
        <article className="max-w-[760px] mx-auto px-5 lg:px-0">
          {/* パンくず */}
          <nav className="pt-8 text-[12px] tracking-[0.12em] text-muted-foreground uppercase">
            <Link href="/" className="hover:text-gold transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/news" className="hover:text-gold transition-colors">お知らせ</Link>
          </nav>

          {/* タイトル */}
          <header className="mt-6 mb-10 pb-8 border-b border-border">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 bg-white border border-black/10 rounded text-[11px] tracking-wide text-muted-foreground">
                {a.category}
              </span>
              <span className="text-[13px] text-muted-foreground tabular-nums">{a.date}</span>
            </div>
            <h1 className="mt-3 font-serif text-[24px] md:text-[32px] leading-snug text-foreground">
              {a.title}
            </h1>
            <p className="mt-5 text-[15px] md:text-[16px] text-foreground/85 leading-loose">
              {a.lead}
            </p>
          </header>

          {/* 本文 */}
          {a.sections.map((s, i) => (
            <section key={i} className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-gold rounded-full shrink-0" />
                <h2 className="font-serif text-[20px] md:text-[24px] text-foreground leading-snug">
                  {s.h2}
                </h2>
              </div>
              {s.body.map((p, j) => (
                <p key={j} className="text-[15px] md:text-[16px] text-foreground/85 leading-loose mb-4">
                  {renderInline(p)}
                </p>
              ))}
              {s.table && (
                <div className="overflow-x-auto rounded-lg border border-border bg-white my-6">
                  <table className="w-full border-collapse">
                    <thead className="border-b border-border bg-secondary">
                      <tr>
                        {s.table.headers.map((h) => (
                          <th
                            key={h}
                            className="py-3 px-4 text-left text-[13px] text-muted-foreground font-medium whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {s.table.rows.map((r, ri) => (
                        <tr key={ri}>
                          {r.map((c, ci) => (
                            <td
                              key={ci}
                              className={`py-3 px-4 text-[14px] md:text-[15px] whitespace-nowrap ${
                                ci === r.length - 1 ? "text-gold font-medium" : "text-foreground"
                              }`}
                            >
                              {c}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}

          {/* CTA */}
          <section className="text-center border-t border-border pt-10 mb-12">
            <p className="font-serif text-xl md:text-2xl text-foreground mb-2">
              寸法のご相談から、お気軽にどうぞ。
            </p>
            <p className="text-[14px] md:text-[15px] text-muted-foreground mb-6 leading-relaxed">
              設置場所のお写真や図面をお送りいただければ、鍛冶職人が直接お答えします。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <PrimaryCTA href="/products" variant="dark" size="lg" withArrow>
                製品一覧を見る
              </PrimaryCTA>
              <PrimaryCTA href="/contact" variant="gold" size="lg" withArrow>
                無料で相談する
              </PrimaryCTA>
            </div>
          </section>

          {/* 関連リンク */}
          {a.related.length > 0 && (
            <section>
              <h2 className="text-[12px] tracking-[0.2em] uppercase text-muted-foreground mb-3">
                関連ページ
              </h2>
              <ul className="space-y-2.5">
                {a.related.map((r) => (
                  <li key={r.href}>
                    <Link href={r.href} className="text-[15px] text-gold hover:underline underline-offset-4">
                      {r.label} →
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="mt-12 text-center">
            <Link
              href="/news"
              className="inline-block px-8 py-4 border border-border text-muted-foreground text-[11px] tracking-[0.3em] uppercase hover:border-gold hover:text-gold transition-colors"
            >
              お知らせ一覧へ戻る
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
