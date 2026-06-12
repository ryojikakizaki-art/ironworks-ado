import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PrimaryCTA } from "@/components/ui/primary-cta"
import { COLUMN_ARTICLES, getColumnArticle } from "@/lib/column-data"

const SITE_URL = "https://ado.tantetuzest.com"

export function generateStaticParams() {
  return COLUMN_ARTICLES.map((a) => ({ slug: a.slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const a = getColumnArticle(slug)
  if (!a) return {}
  return {
    title: a.metaTitle,
    description: a.description,
    keywords: a.keywords,
    alternates: { canonical: `/column/${a.slug}` },
    openGraph: {
      type: "article",
      url: `${SITE_URL}/column/${a.slug}`,
      siteName: "IRONWORKS ado",
      title: a.metaTitle,
      description: a.description,
      locale: "ja_JP",
      images: a.hero.src.startsWith("http")
        ? [{ url: a.hero.src }]
        : [{ url: `${SITE_URL}${a.hero.src}` }],
    },
  }
}

/** body 文字列内の [テキスト](/path) を <Link> に変換する */
function renderInline(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = []
  const re = /\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0
  let m: RegExpExecArray | null
  let key = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index))
    out.push(
      <Link key={key++} href={m[2]} className="text-gold underline underline-offset-4 hover:opacity-70 transition-opacity">
        {m[1]}
      </Link>,
    )
    last = m.index + m[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

function MidCta() {
  return (
    <div className="my-10 rounded-lg border border-gold/30 bg-muted/60 p-6 md:p-8 text-center">
      <p className="font-serif text-[18px] md:text-xl text-foreground mb-2">
        設置場所のお写真から、無料でお見積もりできます
      </p>
      <p className="text-[13px] md:text-sm text-muted-foreground mb-5 leading-relaxed">
        「うちの玄関に合うか分からない」という段階で大丈夫です。鍛冶職人が直接お答えします。
      </p>
      <div className="flex justify-center">
        <PrimaryCTA href="/contact" variant="gold" size="md" withArrow>
          無料で相談する
        </PrimaryCTA>
      </div>
    </div>
  )
}

export default async function ColumnArticlePage({ params }: Props) {
  const { slug } = await params
  const a = getColumnArticle(slug)
  if (!a) notFound()

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: a.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    datePublished: a.date,
    author: { "@type": "Organization", name: "IRONWORKS ado" },
    publisher: { "@type": "Organization", name: "IRONWORKS ado" },
    mainEntityOfPage: `${SITE_URL}/column/${a.slug}`,
    image: a.hero.src.startsWith("http") ? a.hero.src : `${SITE_URL}${a.hero.src}`,
  }

  const ctaAfter = a.ctaMidAfterSection ?? 2

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <Header />
      <main className="pt-20 lg:pt-24 pb-20 bg-background">
        <article className="max-w-[760px] mx-auto px-4 lg:px-0">
          {/* パンくず */}
          <nav className="pt-8 text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
            <Link href="/" className="hover:text-gold transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/column" className="hover:text-gold transition-colors">読みもの</Link>
          </nav>

          {/* タイトル */}
          <header className="mt-6 mb-8">
            <p className="text-[11px] tracking-[0.15em] text-muted-foreground">{a.date.replaceAll("-", ".")}</p>
            <h1 className="mt-2 font-serif text-[26px] md:text-[34px] leading-snug text-foreground">{a.title}</h1>
            <p className="mt-4 text-[14px] md:text-[15px] text-muted-foreground leading-loose">{a.lead}</p>
          </header>

          {/* ヒーロー画像 */}
          <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-secondary mb-10">
            <Image src={a.hero.src} alt={a.hero.alt} fill priority sizes="(max-width: 760px) 100vw, 760px" className="object-cover" />
          </div>

          {/* 本文 */}
          {a.sections.map((s, i) => (
            <section key={i} className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-gold rounded-full shrink-0" />
                <h2 className="font-serif text-[20px] md:text-[24px] text-foreground leading-snug">{s.h2}</h2>
              </div>
              {s.body.map((p, j) => (
                <p key={j} className="text-[14px] md:text-[15px] text-foreground/85 leading-loose mb-4">
                  {renderInline(p)}
                </p>
              ))}
              {s.table && (
                <div className="overflow-x-auto rounded-lg border border-border bg-white my-5">
                  <table className="w-full border-collapse">
                    <thead className="border-b border-border bg-muted/50">
                      <tr>
                        {s.table.headers.map((h) => (
                          <th key={h} className="py-2.5 px-3 text-left text-[12px] text-muted-foreground font-medium whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {s.table.rows.map((r, ri) => (
                        <tr key={ri}>
                          {r.map((c, ci) => (
                            <td key={ci} className="py-2.5 px-3 text-[13px] md:text-[14px] text-foreground">
                              {renderInline(c)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {s.images?.map((img) => (
                <figure key={img.src} className="my-6">
                  <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-secondary">
                    <Image src={img.src} alt={img.alt} fill sizes="(max-width: 760px) 100vw, 760px" className="object-cover" />
                  </div>
                  <figcaption className="mt-2 text-[12px] text-muted-foreground text-center">{img.alt}</figcaption>
                </figure>
              ))}
              {i === ctaAfter && <MidCta />}
            </section>
          ))}

          {/* FAQ */}
          {a.faq.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-gold rounded-full shrink-0" />
                <h2 className="font-serif text-[20px] md:text-[24px] text-foreground">よくあるご質問</h2>
              </div>
              <div className="rounded-lg border border-border bg-white divide-y divide-border">
                {a.faq.map((f, i) => (
                  <div key={i} className="px-5 py-4">
                    <p className="text-[14px] md:text-[15px] font-medium text-foreground">Q. {f.q}</p>
                    <p className="mt-1.5 text-[13px] md:text-[14px] text-muted-foreground leading-relaxed">
                      {renderInline(f.a)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 末尾 CTA */}
          <section className="text-center border-t border-border pt-10 mb-12">
            <p className="font-serif text-xl md:text-2xl text-foreground mb-2">
              一本ずつ、鍛冶職人が手づくりしています。
            </p>
            <p className="text-[13px] md:text-sm text-muted-foreground mb-6 leading-relaxed">
              サイズも仕上げも、住まいに合わせて 1mm 単位でオーダーできます。
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
              <h2 className="text-[12px] tracking-[0.2em] uppercase text-muted-foreground mb-3">あわせて読む・見る</h2>
              <ul className="space-y-2">
                {a.related.map((r) => (
                  <li key={r.href}>
                    <Link href={r.href} className="text-[14px] text-gold hover:underline underline-offset-4">
                      {r.label} →
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      </main>
      <Footer />
    </>
  )
}
