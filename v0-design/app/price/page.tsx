import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { KaigoNotice } from "@/components/kaigo-notice"
import { PrimaryCTA } from "@/components/ui/primary-cta"
import { getQuoteUnitPrice } from "@/lib/products/quote-pricing"
import { CATALOG_PRODUCTS } from "@/lib/products/catalog"
import { galleryUrl } from "@/lib/products/display"

const SITE_URL = "https://ado.tantetuzest.com"

export const metadata: Metadata = {
  title: "アイアン手すり 価格一覧（税込）｜横型・縦型・ロートアイアン｜IRONWORKS ado",
  description:
    "鍛冶職人が一本ずつ手作りするアイアン手すりの価格一覧。横型 ¥36,000〜・縦型 ¥30,000〜・ロートアイアン ¥36,000/m〜（すべて税込・工房直販）。長さ別の目安と追加オプション料金をまとめました。商品ページの計算機で送料込みの総額がその場で分かります。",
  alternates: { canonical: "/price" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/price`,
    siteName: "IRONWORKS ado",
    title: "アイアン手すり 価格一覧（税込）｜IRONWORKS ado",
    description:
      "横型 ¥36,000〜・縦型 ¥30,000〜・ロートアイアン ¥36,000/m〜。すべて税込・工房直販。長さ別の価格目安一覧。",
    locale: "ja_JP",
  },
}

// 価格は checkout・/trade と同じ計算正本（lib/products/quote-pricing）から算出する
const yen = (n: number | null | undefined) =>
  n == null ? "—" : `¥${n.toLocaleString()}`
const at = (slug: string, m: number, maxM: number): number | null => {
  if (m > maxM) return null
  return getQuoteUnitPrice(slug, m)?.unitPrice ?? null
}

// 横型（基準 1.5m・最長 5m）
const HORIZONTAL = [
  { slug: "rene", name: "René ルネ", finish: "25φ 丸棒・マットブラック", maxM: 5 },
  { slug: "marcel", name: "Marcel マルセル", finish: "フラットバー・マットブラック", maxM: 5 },
  { slug: "claire", name: "Claire クレール", finish: "25φ 丸棒・マットホワイト", maxM: 5 },
  { slug: "emile", name: "Émile エミール", finish: "フラットバー・鎚目 銀古美", maxM: 5 },
]

// 縦型（基準長は商品により 1m / 1.5m）
const VERTICAL = [
  { slug: "claude", name: "Claude クロード", finish: "25φ・マットブラック", stdLabel: "〜1m", maxM: 1.5 },
  { slug: "catherine", name: "Catherine カトリーヌ", finish: "25φ・マットホワイト", stdLabel: "〜1m", maxM: 1.5 },
  { slug: "alexandre", name: "Alexandre アレクサンドル", finish: "31.8φ 太径・マットブラック", stdLabel: "〜1m", maxM: 3 },
  { slug: "antoine", name: "Antoine アントワーヌ", finish: "25φ ロング・マットブラック", stdLabel: "〜1.5m", maxM: 3 },
]

// 装飾・固定サイズ（一点物）
const FIXED = [
  { slug: "scroll16", name: "Scroll スクロール 16φ", size: "700mm", finish: "無垢鉄・ミツロウ仕上げ" },
  { slug: "scroll19", name: "Scroll スクロール 19φ", size: "700mm", finish: "無垢鉄・ミツロウ仕上げ" },
  { slug: "scroll22", name: "Scroll スクロール 22φ", size: "800mm", finish: "無垢鉄・ミツロウ仕上げ" },
  { slug: "tsuchime", name: "鎚目 TSUCHIME", size: "800mm", finish: "手打ち鎚目仕上げ" },
  { slug: "fabrice", name: "Fabrice ファブリス", size: "800mm", finish: "無垢鉄・火造り鍛造" },
]

// その他のオーダー製品（カタログの価格〜表示をそのまま使う）
const OTHER_CATEGORY_LABELS: Record<string, string> = {
  approach: "アプローチ手すり",
  fence: "フェンス",
  door: "ドア",
  stair: "階段",
  other: "その他",
}

const thCls =
  "py-3 px-3 text-left text-[12px] tracking-[0.12em] uppercase text-muted-foreground font-medium whitespace-nowrap"
const tdCls = "py-3.5 px-3 text-[14px] text-foreground whitespace-nowrap"
const priceCls = "py-3.5 px-3 text-[15px] font-serif text-foreground whitespace-nowrap"

// 価格表の商品セル用サムネイル。画像は必ず galleryUrl() 経由（LOCAL_IMAGE_OVERRIDES を効かせる）
const imgIdOf = (slug: string) =>
  CATALOG_PRODUCTS.find((p) => p.href === `/products/${slug}`)?.img

function ProductThumb({ slug, name }: { slug: string; name: string }) {
  const img = imgIdOf(slug)
  if (!img) return null
  return (
    <span className="relative w-11 h-11 shrink-0 overflow-hidden rounded-md bg-secondary">
      <Image
        src={galleryUrl(`${img}.jpg`)}
        alt={name}
        fill
        sizes="44px"
        className="object-cover"
      />
    </span>
  )
}

function SectionHeading({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <div className="w-1 h-7 bg-gold rounded-full" />
        <h2 className="font-serif text-2xl text-foreground">{title}</h2>
      </div>
      <p className="mt-2 text-[13px] md:text-sm text-muted-foreground">{sub}</p>
    </div>
  )
}

export default function PricePage() {
  const others = CATALOG_PRODUCTS.filter(
    (p) => !p.cat.startsWith("handrail") && p.href?.startsWith("/products/"),
  )

  return (
    <>
      <Header />
      <main className="pt-20 lg:pt-24 pb-20 bg-background">
        {/* ヘッダー */}
        <div className="border-b border-border">
          <div className="max-w-[1100px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Price List</p>
            <h1 className="font-serif text-3xl lg:text-5xl text-foreground">
              アイアン手すり 価格一覧
            </h1>
            <p className="text-[13px] md:text-sm text-muted-foreground mt-4 max-w-[680px] leading-relaxed">
              すべて税込・自社工房からの直販価格です。長さに応じた本体価格の目安をまとめました。
              各商品ページの計算機で、送料を含めた総額がその場で確認できます。
            </p>
          </div>
        </div>

        <div className="max-w-[1100px] mx-auto px-4 lg:px-8 mt-14 space-y-16">
          {/* 横型 */}
          <section>
            <SectionHeading
              title="横型手すり"
              sub="階段・廊下・吹き抜けの壁付けに。〜1.5m まで一律料金、最長 5m まで 1mm 単位でオーダーできます。"
            />
            <div className="overflow-x-auto rounded-lg border border-border bg-white">
              <table className="w-full border-collapse">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className={thCls}>商品</th>
                    <th className={thCls}>仕様</th>
                    <th className={thCls}>〜1.5m</th>
                    <th className={thCls}>2m</th>
                    <th className={thCls}>3m</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {HORIZONTAL.map((p) => (
                    <tr key={p.slug} className="hover:bg-muted/40 transition-colors">
                      <td className={tdCls}>
                        <Link href={`/products/${p.slug}`} className="inline-flex items-center gap-3 text-gold hover:underline font-medium">
                          <ProductThumb slug={p.slug} name={p.name} />
                          {p.name}
                        </Link>
                      </td>
                      <td className={`${tdCls} text-muted-foreground`}>{p.finish}</td>
                      <td className={priceCls}>{yen(at(p.slug, 1.5, p.maxM))}</td>
                      <td className={priceCls}>{yen(at(p.slug, 2, p.maxM))}</td>
                      <td className={priceCls}>{yen(at(p.slug, 3, p.maxM))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 縦型 */}
          <section>
            <SectionHeading
              title="縦型手すり"
              sub="玄関・勝手口・室内の立ち上がりに。基準の長さまで一律料金です（基準長は商品により異なります）。"
            />
            <div className="overflow-x-auto rounded-lg border border-border bg-white">
              <table className="w-full border-collapse">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className={thCls}>商品</th>
                    <th className={thCls}>仕様</th>
                    <th className={thCls}>基準価格</th>
                    <th className={thCls}>2m</th>
                    <th className={thCls}>3m</th>
                    <th className={thCls}>最長</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {VERTICAL.map((p) => (
                    <tr key={p.slug} className="hover:bg-muted/40 transition-colors">
                      <td className={tdCls}>
                        <Link href={`/products/${p.slug}`} className="inline-flex items-center gap-3 text-gold hover:underline font-medium">
                          <ProductThumb slug={p.slug} name={p.name} />
                          {p.name}
                        </Link>
                      </td>
                      <td className={`${tdCls} text-muted-foreground`}>{p.finish}</td>
                      <td className={priceCls}>
                        {yen(at(p.slug, 0.5, p.maxM))}
                        <span className="ml-1 text-[11px] text-muted-foreground font-sans">{p.stdLabel}</span>
                      </td>
                      <td className={priceCls}>{yen(at(p.slug, 2, p.maxM))}</td>
                      <td className={priceCls}>{yen(at(p.slug, 3, p.maxM))}</td>
                      <td className={`${tdCls} text-muted-foreground`}>{p.maxM}m</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6">
              <KaigoNotice />
            </div>
          </section>

          {/* 装飾・固定サイズ */}
          <section>
            <SectionHeading
              title="装飾手すり（固定サイズ・一点物）"
              sub="玄関・トイレ・洗面の縦手すりに。一本ずつ火造りで仕上げる装飾シリーズです。"
            />
            <div className="overflow-x-auto rounded-lg border border-border bg-white">
              <table className="w-full border-collapse">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className={thCls}>商品</th>
                    <th className={thCls}>サイズ</th>
                    <th className={thCls}>仕上げ</th>
                    <th className={thCls}>価格</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {FIXED.map((p) => (
                    <tr key={p.slug} className="hover:bg-muted/40 transition-colors">
                      <td className={tdCls}>
                        <Link href={`/products/${p.slug}`} className="inline-flex items-center gap-3 text-gold hover:underline font-medium">
                          <ProductThumb slug={p.slug} name={p.name} />
                          {p.name}
                        </Link>
                      </td>
                      <td className={`${tdCls} text-muted-foreground`}>{p.size}</td>
                      <td className={`${tdCls} text-muted-foreground`}>{p.finish}</td>
                      <td className={priceCls}>{yen(getQuoteUnitPrice(p.slug, 1)?.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ロートアイアン */}
          <section>
            <SectionHeading
              title="ロートアイアン手すり"
              sub="鍛冶職人が無垢鉄を叩いて成形する、本物の鍛鉄手すり。形状により価格が変わるため、図面やお写真から無料でお見積もりします。"
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-lg border border-border bg-white p-6">
                <div className="flex items-center gap-3">
                  <ProductThumb slug="elisabeth" name="Élisabeth エリザベート" />
                  <Link href="/products/elisabeth" className="font-serif text-[18px] text-gold hover:underline">
                    Élisabeth エリザベート
                  </Link>
                </div>
                <p className="mt-1 text-[13px] text-muted-foreground">アール・ヌーヴォー曲線・22φ 無垢鉄</p>
                <p className="mt-3 font-serif text-2xl text-foreground">
                  ¥36,000<span className="text-[14px]">/m〜</span>
                </p>
                <p className="text-[12px] text-muted-foreground mt-1">例: 3m 手すり・両端唐草 ¥168,000（税込）</p>
              </div>
              <div className="rounded-lg border border-border bg-white p-6">
                <div className="flex items-center gap-3">
                  <ProductThumb slug="clemence" name="Clémence クレマンス" />
                  <Link href="/products/clemence" className="font-serif text-[18px] text-gold hover:underline">
                    Clémence クレマンス
                  </Link>
                </div>
                <p className="mt-1 text-[13px] text-muted-foreground">L型・22φ 無垢鉄</p>
                <p className="mt-3 font-serif text-2xl text-foreground">
                  ¥88,000<span className="text-[14px]">〜</span>
                </p>
                <p className="text-[12px] text-muted-foreground mt-1">500×1000mm まで一律料金</p>
              </div>
            </div>
          </section>

          {/* その他のオーダー製品 */}
          <section>
            <SectionHeading
              title="その他のオーダー製品"
              sub="アプローチ・フェンス・面格子・アイアンドア・階段なども、同じ工房でオーダーいただけます。"
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {others.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="group rounded-lg border border-border bg-white px-5 py-4 hover:border-gold transition-colors"
                >
                  <p className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground">
                    {OTHER_CATEGORY_LABELS[p.cat] ?? "その他"}
                  </p>
                  <p className="mt-0.5 text-[14px] font-medium text-foreground group-hover:text-gold transition-colors">
                    {p.name}
                  </p>
                  <p className="mt-1 font-serif text-[16px] text-foreground">
                    ¥{p.price.toLocaleString()}
                    {p.priceFrom ? "〜" : ""}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          {/* 追加オプション・注記 */}
          <section>
            <SectionHeading title="追加オプション・ご注意" sub="本体価格に追加でかかる場合がある料金です。" />
            <div className="rounded-lg border border-border bg-white divide-y divide-border">
              {[
                ["送料", "配送先・サイズにより実費。各商品ページの計算機で配送先を選ぶと送料込みの総額が表示されます。"],
                ["特急配送", "通常 10 営業日 → 5 営業日で発送。本体価格 +20%（3 本まで）。"],
                ["ブラケット座金の追加", "1 個 ¥3,500（標準本数は商品・長さにより自動計算）。"],
                ["角度加工（横型）", "座金 1 箇所あたり ¥2,000。"],
                ["溶融亜鉛メッキ（屋外推奨）", "2m まで本体価格 +¥22,000。メッキ後に塗装仕上げする二重防錆です。"],
              ].map(([label, body]) => (
                <div key={label} className="flex flex-col sm:flex-row gap-1 sm:gap-6 px-5 py-4">
                  <p className="sm:w-56 shrink-0 text-[14px] font-medium text-foreground">{label}</p>
                  <p className="text-[13px] md:text-sm text-muted-foreground leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[13px] text-muted-foreground">
              屋外で 10 年以上錆びさせない二重防錆のしくみは
              <Link href="/galvanizing" className="text-gold hover:underline mx-1">
                溶融亜鉛メッキについて
              </Link>
              で図解しています。
            </p>
            <p className="mt-4 text-[12px] text-muted-foreground">
              価格はすべて税込です。仕様変更・原材料価格により改定する場合があります。業者様の継続お取引は
              <Link href="/trade" className="text-gold hover:underline mx-1">
                業者様窓口
              </Link>
              をご利用ください。
            </p>
          </section>

          {/* CTA */}
          <section className="text-center border-t border-border pt-12">
            <p className="font-serif text-xl md:text-2xl text-foreground mb-2">
              正確な金額は、商品ページの計算機で。
            </p>
            <p className="text-[13px] md:text-sm text-muted-foreground mb-8 leading-relaxed">
              長さと配送先を選ぶだけで、送料込みの総額がその場で分かります。
              <br className="hidden md:block" />
              迷ったら、設置場所のお写真を添えてお気軽にご相談ください。
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
        </div>
      </main>
      <Footer />
    </>
  )
}
