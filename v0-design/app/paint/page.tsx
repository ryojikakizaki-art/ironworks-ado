import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"

export const metadata = {
  title: "塗装について | IRONWORKS ado",
  description:
    "IRONWORKS ado の塗装工程と、プロ仕様の 2液型ウレタン塗装を採用する理由をご紹介します。",
}

const steps = [
  {
    no: "01",
    title: "素地調整",
    desc: "溶接跡の研磨、脱脂、サビ止め処理。塗料の密着性を高める最も重要な工程です。",
  },
  {
    no: "02",
    title: "下塗り（プライマー）",
    desc: "防錆効果のあるプライマーを塗布。鉄素地と上塗り塗膜の橋渡しとなり、密着性と耐久性を向上させます。",
  },
  {
    no: "03",
    title: "上塗り（2液ウレタン）",
    desc: "主剤と硬化剤を正確な比率で調合し塗布。化学反応による硬化で、強靭で美しい塗膜を形成します。",
  },
]

const comparison = [
  { label: "硬化方式", a: "溶剤の蒸発（自然乾燥）", b: "化学反応（架橋硬化）", c: "加熱硬化（150〜200℃）" },
  { label: "耐久性", a: "★★☆☆☆", b: "★★★★★", c: "★★★★★" },
  { label: "耐薬品性", a: "★★☆☆☆", b: "★★★★☆", c: "★★★★★" },
  { label: "密着性", a: "★★★☆☆", b: "★★★★★", c: "★★★★★" },
  { label: "仕上がり", a: "薄い塗膜、ムラが出やすい", b: "厚く均一、美しい光沢", c: "均一で硬い塗膜" },
  { label: "施工性", a: "簡単（そのまま塗れる）", b: "要技術（調合・可使時間あり）", c: "専用焼付炉が必要" },
  { label: "コスト", a: "安価", b: "高価（材料費 約3〜5倍）", c: "非常に高価（設備費）" },
  { label: "現場補修", a: "可能", b: "可能", c: "不可（炉が必要）" },
  { label: "主な用途", a: "DIY、仮塗装、補修", b: "自動車、工業製品、建築", c: "家電、自動車部品、量産品" },
]

export default function PaintPage() {
  return (
    <>
      <Header />
      <main className="pt-20 lg:pt-24 pb-20 bg-background">
        {/* Hero */}
        <div className="border-b border-border">
          <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-12 lg:py-20">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Finishing</p>
            <h1 className="font-serif text-3xl lg:text-5xl text-foreground mb-4">
              IRONWORKS ado の『塗装』
            </h1>
            <p className="text-[14px] text-muted-foreground">
              良い状態で永く使っていただきたい
            </p>
          </div>
        </div>

        <div className="max-w-[880px] mx-auto px-4 lg:px-8 py-16 space-y-16">
          {/* Intro */}
          <section className="space-y-4">
            <h2 className="font-serif text-xl lg:text-2xl text-foreground">
              毎日手にするものだから、手触りのいいものを。
            </h2>
            <p className="text-[14px] leading-[1.9] text-muted-foreground">
              当工房はオーダーから制作・発送までを一貫して行っているため、スピーディー・ハイクオリティ・リーズナブルにお届けいたします。
            </p>
            <p className="text-[14px] leading-[1.9] text-muted-foreground">
              塗装においても妥協せず、素地調整から下塗り、仕上げ塗装まで、すべての工程を丁寧に手作業で行っています。一般的な1液型塗料ではなく、プロ仕様の 2液型ウレタン塗装を標準採用することで、長く美しい状態を保てる仕上がりを実現しています。
            </p>
          </section>

          {/* 3 Steps */}
          <section>
            <h2 className="font-serif text-xl lg:text-2xl text-foreground mb-6">
              塗装工程
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {steps.map((s) => (
                <div key={s.no} className="border border-border bg-card p-6">
                  <div className="font-mono text-xl text-gold mb-3">{s.no}</div>
                  <h3 className="text-[14px] font-medium text-foreground mb-3">
                    {s.title}
                  </h3>
                  <p className="text-[12px] leading-relaxed text-muted-foreground">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 2液型ウレタン */}
          <section className="space-y-4">
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold">
              2-Component Urethane
            </p>
            <h2 className="font-serif text-xl lg:text-2xl text-foreground">
              2液型ウレタン塗装とは？
            </h2>
            <p className="text-[14px] leading-[1.9] text-muted-foreground">
              2液型ウレタン塗装は、主剤と硬化剤の 2つの液を使用直前に混合して塗る塗装方法です。混合後に化学反応（架橋反応）が始まり、乾燥とともに非常に強靭な塗膜を形成します。
            </p>
            <p className="text-[14px] leading-[1.9] text-muted-foreground">
              自動車の塗装や工業製品にも使われるプロ仕様の塗装で、一般的な DIY 向け1液型塗料とは性能が大きく異なります。
            </p>
            <div className="border border-border bg-card p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-gold mb-1">主剤</p>
                <p className="text-[13px] text-foreground">ポリオール樹脂</p>
                <p className="text-[10px] text-muted-foreground">（ベース成分）</p>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-gold mb-1">硬化剤</p>
                <p className="text-[13px] text-foreground">イソシアネート</p>
                <p className="text-[10px] text-muted-foreground">（反応成分）</p>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-gold mb-1">結果</p>
                <p className="text-[13px] text-foreground">強靭な塗膜</p>
                <p className="text-[10px] text-muted-foreground">高耐久・高光沢・耐候性</p>
              </div>
            </div>
          </section>

          {/* Comparison Table */}
          <section>
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">Comparison</p>
            <h2 className="font-serif text-xl lg:text-2xl text-foreground mb-4">
              1液型と 2液型の違い
            </h2>
            <p className="text-[14px] leading-[1.9] text-muted-foreground mb-6">
              ホームセンターで手に入る1液型塗料と、ado が使用する2液型ウレタン塗料。同じ「塗装」でも、性能と仕上がりには大きな差があります。
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[12px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-muted-foreground font-normal">項目</th>
                    <th className="text-left p-3 text-muted-foreground font-normal">1液型（ラッカー等）</th>
                    <th className="text-left p-3 text-gold font-normal">2液型ウレタン</th>
                    <th className="text-left p-3 text-muted-foreground font-normal">焼付塗装</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row) => (
                    <tr key={row.label} className="border-b border-border/50">
                      <td className="p-3 text-muted-foreground">{row.label}</td>
                      <td className="p-3 text-foreground">{row.a}</td>
                      <td className="p-3 text-foreground bg-gold/5">{row.b}</td>
                      <td className="p-3 text-foreground">{row.c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Philosophy */}
          <section className="space-y-4">
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold">
              Our Philosophy
            </p>
            <h2 className="font-serif text-xl lg:text-2xl text-foreground">
              なぜ ado は 2液型を選ぶのか
            </h2>
            <blockquote className="border-l-2 border-gold pl-6 italic text-muted-foreground text-[14px] leading-[1.9]">
              手間もコストもかかります。それでも 2液型を選ぶのは、お客様に「10年後も変わらない美しさ」を届けたいから。
              <footer className="mt-3 not-italic text-[11px] text-gold">
                — IRONWORKS ado 鍛冶職人
              </footer>
            </blockquote>
            <p className="text-[14px] leading-[1.9] text-muted-foreground">
              2液型ウレタン塗装は、主剤と硬化剤を正確な比率で混合する必要があり、混合後は数時間以内に使い切らなければなりません。材料費も 1液型の 3〜5 倍。決して「効率的」とは言えない塗装方法です。
            </p>
            <p className="text-[14px] leading-[1.9] text-muted-foreground">
              しかし、毎日手に触れる手すりだからこそ、塗膜の強さ・手触りの良さ・美しさにこだわりたい。1液型では実現できない「触って気持ちいい、見て美しい」仕上がりが、2液型ウレタンにはあります。素地調整から最終仕上げまで、すべての工程に手を抜かない。それが IRONWORKS ado の塗装です。
            </p>
          </section>

          {/* Outdoor CTA */}
          <section className="border border-border bg-card p-6 lg:p-8">
            <h3 className="font-serif text-lg text-foreground mb-3">
              屋外で使用する場合の仕上げ
            </h3>
            <p className="text-[13px] leading-relaxed text-muted-foreground mb-4">
              屋外設置のアイアン製品には、溶融亜鉛メッキ ＋ 塗装の二重防錆処理を施しています。
            </p>
            <Link
              href="/galvanizing"
              className="inline-block text-[11px] tracking-[0.2em] uppercase text-gold border-b border-gold hover:opacity-70 transition-opacity"
            >
              亜鉛メッキについて →
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
