import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"

export const metadata = {
  title: "亜鉛メッキについて | IRONWORKS ado",
  description:
    "IRONWORKS ado の屋外用アイアン製品に採用している溶融亜鉛メッキと 2液型ウレタン塗装の二重防錆処理について解説します。",
}

const processSteps = [
  { no: "1", title: "製作・溶接", desc: "手すり・フェンスを鍛冶職人が製作" },
  { no: "2", title: "溶融亜鉛メッキ", desc: "450℃の亜鉛浴に浸漬し合金層を形成" },
  { no: "3", title: "素地調整", desc: "メッキ表面を研磨し塗料の密着性を確保" },
  { no: "4", title: "2液ウレタン塗装", desc: "プライマー＋上塗りで美しく仕上げ" },
]

const comparison = [
  { label: "屋外耐久性", a: "3〜5年", b: "10年以上" },
  { label: "傷からの錆", a: "傷口から錆が拡大", b: "犠牲防食で鉄を保護" },
  { label: "塩害耐性", a: "弱い", b: "強い（沿岸部でも使用可）" },
  { label: "紫外線", a: "塗膜劣化あり", b: "メッキ層が残り鉄を保護" },
  { label: "メンテナンス", a: "定期的な塗り直し必要", b: "ほぼメンテナンスフリー" },
  { label: "コスト", a: "安価", b: "初期費用は高いが長寿命" },
  { label: "見た目", a: "塗装色のみ", b: "塗装色（メッキは下地）" },
]

const layerStructure = [
  { label: "鉄素地", desc: "SS400 などの鋼材", tone: "base" },
  { label: "亜鉛-鉄 合金層", desc: "メッキ時に化学結合で形成", tone: "gold" },
  { label: "純亜鉛層", desc: "犠牲防食層（傷から鉄を守る）", tone: "gold" },
  { label: "プライマー", desc: "塗膜との密着層", tone: "muted" },
  { label: "2液ウレタン塗装", desc: "美観・紫外線防護の仕上げ層", tone: "muted" },
]

const applicableProducts = [
  "Simple -black- アプローチ手すり",
  "アプローチ手すり『蔦』",
  "Simple -white- アプローチ手すり",
  "屋外フェンス各種",
]

export default function GalvanizingPage() {
  return (
    <>
      <Header />
      <main className="pt-20 lg:pt-24 pb-20 bg-background">
        {/* Hero */}
        <div className="border-b border-border">
          <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-12 lg:py-20">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">
              Hot-Dip Galvanizing
            </p>
            <h1 className="font-serif text-3xl lg:text-5xl text-foreground mb-4">
              屋外用アイアンの『亜鉛メッキ』
            </h1>
            <p className="text-[14px] text-muted-foreground">
              錆びない仕上げで、屋外でも永く美しく
            </p>
          </div>
        </div>

        <div className="max-w-[880px] mx-auto px-4 lg:px-8 py-16 space-y-16">
          {/* What is it */}
          <section className="space-y-4">
            <h2 className="font-serif text-xl lg:text-2xl text-foreground">
              溶融亜鉛メッキとは？
            </h2>
            <p className="text-[14px] leading-[1.9] text-muted-foreground">
              溶融亜鉛メッキ（ドブ漬けメッキ）とは、約 450℃ に溶かした亜鉛の浴槽に鉄製品を丸ごと浸漬し、鉄の表面に亜鉛と鉄の合金層を形成させる防錆処理です。
            </p>
            <p className="text-[14px] leading-[1.9] text-muted-foreground">
              単なる塗装と異なり、亜鉛が鉄と化学的に結合するため、剥がれにくく、傷がついても「犠牲防食」の効果で周囲の亜鉛が鉄を守り続けます。橋梁・鉄塔・ガードレールなど、屋外インフラで広く採用されている信頼性の高い防錆技術です。
            </p>
          </section>

          {/* Sacrificial protection */}
          <section className="grid md:grid-cols-2 gap-4">
            <div className="border border-border bg-card p-6">
              <h3 className="text-[12px] tracking-[0.2em] uppercase text-muted-foreground mb-4">
                塗装のみの場合
              </h3>
              <div className="space-y-2 text-[13px]">
                <div className="py-2 border-b border-border/50 text-foreground">鉄 素地</div>
                <div className="py-2 border-b border-border/50 text-foreground">塗膜</div>
                <div className="py-2 text-red-400">× 傷・剥がれ</div>
                <p className="text-[11px] text-muted-foreground mt-3">
                  → 傷から水が浸入し錆が拡大
                </p>
              </div>
            </div>
            <div className="border border-gold/40 bg-gold/5 p-6">
              <h3 className="text-[12px] tracking-[0.2em] uppercase text-gold mb-4">
                溶融亜鉛メッキの場合
              </h3>
              <div className="space-y-2 text-[13px]">
                <div className="py-2 border-b border-border/50 text-foreground">鉄 素地</div>
                <div className="py-2 border-b border-border/50 text-foreground">亜鉛-鉄 合金層</div>
                <div className="py-2 border-b border-border/50 text-foreground">純亜鉛層</div>
                <p className="text-[11px] text-gold mt-3">
                  → 犠牲防食で亜鉛が先に溶けて鉄を守る
                </p>
              </div>
            </div>
          </section>

          {/* Double protection */}
          <section className="space-y-4">
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold">
              Double Protection
            </p>
            <h2 className="font-serif text-xl lg:text-2xl text-foreground">
              ado の二重防錆処理
            </h2>
            <p className="text-[14px] leading-[1.9] text-muted-foreground">
              IRONWORKS ado では、屋外設置のアイアン製品に<strong className="text-foreground">溶融亜鉛メッキ ＋ 2液型ウレタン塗装</strong>の二重防錆処理を標準で施しています。メッキだけでも、塗装だけでもない。両方を重ねることで、屋外でも 10 年以上の耐久性を実現します。
            </p>
            <blockquote className="border-l-2 border-gold pl-6 italic text-muted-foreground text-[14px] leading-[1.9]">
              亜鉛メッキが「鉄を錆から守る鎧」なら、2液型ウレタン塗装は「鎧を美しく保つコーティング」。この二重構造により、雨・紫外線・塩害にさらされる環境でも、美しさと耐久性を両立します。
              <footer className="mt-3 not-italic text-[11px] text-gold">
                — IRONWORKS ado 鍛冶職人
              </footer>
            </blockquote>

            {/* Layer cross-section */}
            <div className="border border-border bg-card p-6">
              <p className="text-[11px] tracking-[0.2em] uppercase text-gold mb-4">
                二重防錆 断面構造
              </p>
              <div className="space-y-0">
                {layerStructure.map((layer, i) => (
                  <div
                    key={i}
                    className={`flex justify-between items-baseline py-3 ${
                      i < layerStructure.length - 1 ? "border-b border-border/30" : ""
                    }`}
                  >
                    <span className="text-[13px] text-foreground">
                      ← {layer.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {layer.desc}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground text-center mt-4">
                溶融亜鉛メッキ ＋ 2液型ウレタン塗装の 4 層構造
              </p>
            </div>
          </section>

          {/* Process */}
          <section>
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">Process</p>
            <h2 className="font-serif text-xl lg:text-2xl text-foreground mb-2">
              二重防錆の処理工程
            </h2>
            <p className="text-[13px] text-muted-foreground mb-6">
              製作から仕上げまで、すべて一貫して行います。
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {processSteps.map((s) => (
                <div key={s.no} className="border border-border bg-card p-5">
                  <div className="font-mono text-xl text-gold mb-2">{s.no}</div>
                  <h3 className="text-[13px] font-medium text-foreground mb-2">
                    {s.title}
                  </h3>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Comparison */}
          <section>
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">
              Comparison
            </p>
            <h2 className="font-serif text-xl lg:text-2xl text-foreground mb-2">
              塗装のみ vs メッキ＋塗装
            </h2>
            <p className="text-[13px] leading-relaxed text-muted-foreground mb-6">
              屋外設置の場合、塗装だけでは数年で錆が発生します。メッキ＋塗装の二重処理で耐久性が大幅に向上します。
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[12px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-muted-foreground font-normal">項目</th>
                    <th className="text-left p-3 text-muted-foreground font-normal">塗装のみ</th>
                    <th className="text-left p-3 text-gold font-normal">
                      メッキ＋塗装（ado 標準）
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row) => (
                    <tr key={row.label} className="border-b border-border/50">
                      <td className="p-3 text-muted-foreground">{row.label}</td>
                      <td className="p-3 text-foreground">{row.a}</td>
                      <td className="p-3 text-foreground bg-gold/5">{row.b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Applicable products */}
          <section>
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">Products</p>
            <h2 className="font-serif text-xl lg:text-2xl text-foreground mb-2">
              亜鉛メッキ対応製品
            </h2>
            <p className="text-[13px] leading-relaxed text-muted-foreground mb-6">
              以下の屋外設置製品に溶融亜鉛メッキ＋塗装の二重防錆処理を施しています。
            </p>
            <ul className="space-y-2">
              {applicableProducts.map((p) => (
                <li
                  key={p}
                  className="border border-border bg-card px-5 py-3 text-[13px] text-foreground"
                >
                  {p}
                </li>
              ))}
            </ul>
          </section>

          {/* Paint CTA */}
          <section className="border border-border bg-card p-6 lg:p-8">
            <h3 className="font-serif text-lg text-foreground mb-3">
              屋内用製品の塗装について
            </h3>
            <p className="text-[13px] leading-relaxed text-muted-foreground mb-4">
              屋内設置のアイアン製品には、2液型ウレタン塗装による仕上げを施しています。
            </p>
            <Link
              href="/paint"
              className="inline-block text-[11px] tracking-[0.2em] uppercase text-gold border-b border-gold hover:opacity-70 transition-opacity"
            >
              2液型ウレタン塗装について →
            </Link>
          </section>

          <div className="pt-8 border-t border-border text-center">
            <Link
              href="/contact"
              className="inline-block px-8 py-4 border border-gold text-gold text-[10px] tracking-[0.3em] uppercase hover:bg-gold hover:text-dark transition-colors"
            >
              お問い合わせする
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
