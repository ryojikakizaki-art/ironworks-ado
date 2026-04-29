import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import Image from "next/image"
import { PrimaryCTA } from "@/components/ui/primary-cta"
import { galleryUrl } from "@/lib/products/display"

export const metadata = {
  title: "塗装について | IRONWORKS ado",
  description:
    "ado の手すりは自動車塗装と同じ 2 液型ウレタン塗装を標準採用。1 液型・焼付塗装との性能比較、工程、よくあるご質問を図解で詳しく解説します。",
}

const stats = [
  { value: "2", unit: "液型", label: "主剤＋硬化剤", desc: "化学反応で硬く強靭に" },
  { value: "10", unit: "年+", label: "美観持続", desc: "1 液型のおおよそ 2〜3 倍" },
  { value: "3〜5", unit: "倍", label: "材料費", desc: "1 液型対比 — それでも採用" },
  { value: "自動車", unit: "仕様", label: "プロ塗装グレード", desc: "工業製品と同じグレード" },
]

// 写真の 3 段階（PREP / MIX / SPRAY）に合わせた工程説明
const processStages = [
  {
    no: "01",
    label: "PREP",
    titleJa: "素地調整",
    desc: "サンドペーパーで脱脂・研磨。塗料の密着性を左右する最も重要な土台づくり。サビや油分を残したまま塗ると、どれだけ良い塗料でも数年で剥がれてしまいます。",
  },
  {
    no: "02",
    label: "MIX",
    titleJa: "主剤と硬化剤の調合",
    desc: "主剤（ポリオール樹脂）と硬化剤（イソシアネート）を正確な比率で混合。混合した瞬間から化学反応が始まり、可使時間内に塗り切る必要があります。",
  },
  {
    no: "03",
    label: "SPRAY",
    titleJa: "塗装（スプレーガン）",
    desc: "プロ仕様のスプレーガンで均一に吹き付け。プライマー → 中塗り → 上塗りと層を重ね、厚く強靭な塗膜を形成します。",
  },
] as const

type CompRow = {
  label: string
  a: string
  b: string
  c: string
  aLevel?: number
  bLevel?: number
  cLevel?: number
}

const comparison: CompRow[] = [
  { label: "硬化方式", a: "溶剤の蒸発（自然乾燥）", b: "化学反応（架橋硬化）", c: "加熱硬化（150〜200℃）" },
  { label: "耐久性", a: "1〜3 年で劣化", b: "10 年以上の美観", c: "10 年以上の美観", aLevel: 2, bLevel: 5, cLevel: 5 },
  { label: "耐薬品性", a: "弱い", b: "強い", c: "極めて強い", aLevel: 2, bLevel: 4, cLevel: 5 },
  { label: "密着性", a: "中程度", b: "極めて高い", c: "極めて高い", aLevel: 3, bLevel: 5, cLevel: 5 },
  { label: "仕上がり", a: "薄く、ムラが出やすい", b: "厚く均一・美しい光沢", c: "均一で硬い塗膜", aLevel: 2, bLevel: 5, cLevel: 5 },
  { label: "施工の手軽さ", a: "簡単（そのまま塗布）", b: "要技術（調合・可使時間）", c: "専用焼付炉が必要", aLevel: 5, bLevel: 3, cLevel: 1 },
  { label: "現場補修", a: "可", b: "可", c: "不可（炉が必要）" },
  { label: "主な用途", a: "DIY・仮塗装・補修", b: "自動車・工業製品・建築", c: "家電・自動車部品・量産" },
]

const faq = [
  {
    q: "塗装はどのくらいもちますか？",
    a: "屋内・軒下・室内階段で 10 年以上美観を保てます。屋外（雨ざらし・直射日光）の場合でも、ado の 2 液型ウレタンなら 5〜8 年は綺麗な状態が続きます。雨ざらしになる屋外設置にはさらに溶融亜鉛メッキを重ねた二重防錆処理（10 年以上の耐久）をおすすめしています。",
  },
  {
    q: "ホームセンターの塗料と何が違いますか？",
    a: "ホームセンターで売られているのは 1 液型（ラッカーや水性塗料）が中心で、屋外設置だと 1〜3 年ほどで錆や色褪せが目立ってきます。ado は自動車塗装と同じ 2 液型ウレタン塗料を主剤＋硬化剤の比率で正確に調合し、化学反応で硬化させているため、塗膜の強さ・厚み・光沢がまったく違います。",
  },
  {
    q: "タッチアップや塗り直しはできますか？",
    a: "はい。設置時に初期補修用のタッチアップ剤をお付けしておりますので、設置直後の小さな傷はご自身で補修いただけます。塗料の性質上、開封後しばらくすると硬化して使えなくなりますので、その場合は新しいタッチアップ剤を改めてお送りいたします。再塗装でのお預かり対応も承っておりますので、傷が大きくなった場合はお気軽にお問い合わせください。",
  },
  {
    q: "色のオーダーはできますか？",
    a: "標準色（マットブラック / マットホワイト）以外もご相談いただけます。お打ち合わせの際にイメージや色見本をお送りいただければ、可能な範囲で調色いたします。なお、調色の有無や色の難易度によって追加費用が発生する場合がございますので、見積もり時にご案内いたします。",
  },
  {
    q: "子どもやペットがいる家庭でも安全ですか？",
    a: "完全硬化後の塗膜は化学的に安定し、塗料成分が表面に出てくることはありません。引き渡しは塗装後しばらく置いて完全硬化を確認したうえで行いますので、お子さまやペットが触れても問題ありません。施工直後に独特のにおいを感じる場合がありますが、数日で気にならなくなります。",
  },
  {
    q: "メンテナンスは必要ですか？",
    a: "屋内設置であれば、特別なメンテナンスは基本的に不要です。汚れが気になる場合は、固く絞った布で水拭きしていただくだけで十分です。研磨剤入りの洗剤や有機溶剤での清掃は塗膜を傷める可能性があるため避けてください。",
  },
]

type ProductCard = {
  slug: string
  title: string
  subtitle: string
  imgId: string
}

const products: ProductCard[] = [
  {
    slug: "rene",
    title: "René ルネ",
    subtitle: "壁付け 横型 / 25φ マットブラック",
    imgId: "d0f5f0e83d40a4d29044",
  },
  {
    slug: "claude",
    title: "Claude クロード",
    subtitle: "壁付け 縦型 / 25φ マットブラック",
    imgId: "86278edb68c21957e339",
  },
  {
    slug: "marcel",
    title: "Marcel マルセル",
    subtitle: "壁付け 横型 / フラットバー マットブラック",
    imgId: "939d0690971c550c1dd9",
  },
]

// ════════════ SVG: 塗膜断面比較 1液 vs 2液 vs 焼付 ════════════
function FilmCrossSectionDiagram() {
  return (
    <svg viewBox="0 0 800 320" className="w-full h-auto">
      <defs>
        <linearGradient id="film-1k" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cfcfcf" />
          <stop offset="100%" stopColor="#9d9d9d" />
        </linearGradient>
        <linearGradient id="film-2k" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e6c878" />
          <stop offset="100%" stopColor="#b8860b" />
        </linearGradient>
        <linearGradient id="film-baked" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef5b5b" />
          <stop offset="100%" stopColor="#a82a2a" />
        </linearGradient>
      </defs>

      {/* タイトル */}
      <text x="400" y="28" textAnchor="middle" fill="#1a1a1a" fontSize="14" fontWeight="500">
        塗膜断面イメージ — 厚みと密着の違い
      </text>

      {/* === 左：1液型 === */}
      <text x="135" y="62" textAnchor="middle" fill="#666" fontSize="14" fontWeight="700">1 液型</text>
      <text x="135" y="80" textAnchor="middle" fill="#888" fontSize="11">ホームセンター塗料</text>
      <rect x="40" y="180" width="190" height="60" fill="#4a4a4a" stroke="#666" />
      <text x="135" y="218" textAnchor="middle" fill="#bbb" fontSize="13" letterSpacing="0.2em">鉄  素  地</text>
      <rect x="40" y="170" width="190" height="10" fill="url(#film-1k)" />
      <text x="135" y="160" textAnchor="middle" fill="#666" fontSize="11" fontWeight="500">塗膜（薄め・ムラ）</text>
      <text x="135" y="270" textAnchor="middle" fill="#666" fontSize="11" fontWeight="500">屋外で 1〜3 年で劣化</text>

      {/* === 中央：2液ウレタン === */}
      <text x="400" y="62" textAnchor="middle" fill="#b8860b" fontSize="14" fontWeight="700">2 液ウレタン</text>
      <text x="400" y="80" textAnchor="middle" fill="#b8860b" fontSize="11" fontWeight="600">ado 標準採用</text>
      <rect x="305" y="180" width="190" height="60" fill="#4a4a4a" stroke="#666" />
      <text x="400" y="218" textAnchor="middle" fill="#bbb" fontSize="13" letterSpacing="0.2em">鉄  素  地</text>
      <rect x="305" y="170" width="190" height="10" fill="#b8b8b8" />
      <text x="400" y="167" textAnchor="middle" fill="#666" fontSize="9">プライマー</text>
      <rect x="305" y="150" width="190" height="20" fill="url(#film-2k)" />
      <text x="400" y="138" textAnchor="middle" fill="#b8860b" fontSize="11" fontWeight="600">2 液ウレタン上塗り（厚膜）</text>
      <text x="400" y="270" textAnchor="middle" fill="#b8860b" fontSize="11" fontWeight="600">屋内 10 年以上美観持続</text>

      {/* === 右：焼付塗装 === */}
      <text x="665" y="62" textAnchor="middle" fill="#c33" fontSize="14" fontWeight="700">焼付塗装</text>
      <text x="665" y="80" textAnchor="middle" fill="#c33" fontSize="11">家電・量産品</text>
      <rect x="570" y="180" width="190" height="60" fill="#4a4a4a" stroke="#666" />
      <text x="665" y="218" textAnchor="middle" fill="#bbb" fontSize="13" letterSpacing="0.2em">鉄  素  地</text>
      <rect x="570" y="160" width="190" height="20" fill="url(#film-baked)" />
      <text x="665" y="150" textAnchor="middle" fill="#c33" fontSize="11" fontWeight="500">焼付塗膜（極薄・極硬）</text>
      <text x="665" y="270" textAnchor="middle" fill="#c33" fontSize="11" fontWeight="500">専用炉が必要・現場補修不可</text>

      {/* ベースライン */}
      <line x1="40" y1="295" x2="760" y2="295" stroke="#444" strokeWidth="0.5" strokeDasharray="3 3" />
      <text x="400" y="312" textAnchor="middle" fill="#666" fontSize="10">
        ado は自動車塗装と同じ 2 液型ウレタンを採用
      </text>
    </svg>
  )
}

// ════════════ タイムライン: 1液 vs 2液の経年変化 ════════════
function FilmDurabilityTimeline() {
  // 0年 ── 3年 ── 5年 ── 8年 ── 10年
  const years = [0, 1, 3, 5, 8, 10]
  const xFor = (y: number) => 60 + (y / 10) * 660
  return (
    <svg viewBox="0 0 800 260" className="w-full h-auto">
      <defs>
        <linearGradient id="bar-1k" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#9d9d9d" />
          <stop offset="40%" stopColor="#cfcfcf" />
          <stop offset="60%" stopColor="#a44" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#5a2a2a" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="bar-2k" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e6c878" />
          <stop offset="60%" stopColor="#d4a84b" />
          <stop offset="90%" stopColor="#b8860b" />
          <stop offset="100%" stopColor="#8a6c0d" />
        </linearGradient>
      </defs>

      <text x="400" y="26" textAnchor="middle" fill="#1a1a1a" fontSize="13" fontWeight="500">
        経年変化イメージ — 屋外設置の場合
      </text>

      {/* 1液型 行 */}
      <text x="50" y="80" textAnchor="end" fill="#666" fontSize="13" fontWeight="700">1液型</text>
      <rect x={xFor(0)} y="60" width={xFor(3) - xFor(0)} height="30" fill="url(#bar-1k)" rx="3" />
      <text x={(xFor(0) + xFor(3)) / 2} y="80" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="500">1〜3 年で劣化</text>

      {/* 2液ウレタン 行 */}
      <text x="50" y="135" textAnchor="end" fill="#b8860b" fontSize="13" fontWeight="700">2液ウレタン</text>
      <rect x={xFor(0)} y="115" width={xFor(8) - xFor(0)} height="30" fill="url(#bar-2k)" rx="3" />
      <text x={(xFor(0) + xFor(8)) / 2} y="135" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="500">5〜8 年は美観維持</text>

      {/* 2液+メッキ */}
      <text x="50" y="190" textAnchor="end" fill="#b8860b" fontSize="13" fontWeight="700">2液 ＋ メッキ</text>
      <rect x={xFor(0)} y="170" width={xFor(10) - xFor(0)} height="30" fill="url(#bar-2k)" rx="3" />
      <text x={(xFor(0) + xFor(10)) / 2} y="190" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="500">10 年以上の耐久</text>

      {/* 軸 */}
      <line x1="60" y1="220" x2="720" y2="220" stroke="#888" strokeWidth="1" />
      {years.map((y) => (
        <g key={y}>
          <line x1={xFor(y)} y1="220" x2={xFor(y)} y2="226" stroke="#888" strokeWidth="1" />
          <text x={xFor(y)} y="240" textAnchor="middle" fill="#888" fontSize="10">
            {y}年
          </text>
        </g>
      ))}
    </svg>
  )
}

// ════════════ レーダーチャート 5軸 ════════════
function PaintRadar() {
  // 5 軸: 耐久性, 耐薬品性, 光沢/仕上がり, 施工の手軽さ, 密着性
  const axes = ["耐久性", "耐薬品性", "光沢・仕上がり", "施工の手軽さ", "密着性"]
  const data = {
    "1液": [2, 2, 3, 5, 3],
    "2液ウレタン": [5, 4, 5, 3, 5],
    "焼付塗装": [5, 5, 4, 1, 5],
  }
  const center = { x: 200, y: 200 }
  const radius = 150
  const angleFor = (i: number) => (Math.PI * 2 * i) / 5 - Math.PI / 2
  const pointFor = (i: number, level: number) => {
    const r = (radius * level) / 5
    const a = angleFor(i)
    return [center.x + Math.cos(a) * r, center.y + Math.sin(a) * r] as const
  }
  const polygon = (levels: number[]) =>
    levels.map((l, i) => pointFor(i, l).join(",")).join(" ")
  const labelPos = (i: number) => {
    const a = angleFor(i)
    const r = radius + 28
    return [center.x + Math.cos(a) * r, center.y + Math.sin(a) * r] as const
  }
  return (
    <svg viewBox="0 0 400 400" className="w-full h-auto">
      {/* グリッド */}
      {[1, 2, 3, 4, 5].map((g) => (
        <polygon
          key={g}
          fill="none"
          stroke={g === 5 ? "#cccccc" : "#e5e5e5"}
          strokeWidth="1"
          points={[0, 1, 2, 3, 4]
            .map((i) => pointFor(i, g).join(","))
            .join(" ")}
        />
      ))}
      {/* 軸 */}
      {[0, 1, 2, 3, 4].map((i) => {
        const [x, y] = pointFor(i, 5)
        return <line key={i} x1={center.x} y1={center.y} x2={x} y2={y} stroke="#d4d4d4" strokeWidth="1" />
      })}

      {/* 1液 (gray) */}
      <polygon
        fill="rgba(140,140,140,0.18)"
        stroke="#888"
        strokeWidth="1.5"
        points={polygon(data["1液"])}
      />
      {/* 焼付塗装 (red dashed) */}
      <polygon
        fill="rgba(220,38,38,0.10)"
        stroke="#dc2626"
        strokeWidth="1.5"
        strokeDasharray="6,3"
        points={polygon(data["焼付塗装"])}
      />
      {/* 2液 (gold solid) */}
      <polygon
        fill="rgba(184,134,11,0.22)"
        stroke="#b8860b"
        strokeWidth="2"
        points={polygon(data["2液ウレタン"])}
      />
      {/* 2液 のデータ点 */}
      {data["2液ウレタン"].map((l, i) => {
        const [x, y] = pointFor(i, l)
        return <circle key={i} cx={x} cy={y} r="4" fill="#b8860b" />
      })}

      {/* 軸ラベル */}
      {axes.map((ax, i) => {
        const [x, y] = labelPos(i)
        return (
          <text key={ax} x={x} y={y} textAnchor="middle" fill="#1a1a1a" fontSize="13" dominantBaseline="middle">
            {ax}
          </text>
        )
      })}
    </svg>
  )
}

function StarBar({ level, color }: { level: number; color: "muted" | "gold" }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`評価 ${level}/5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={
            n <= level
              ? color === "gold"
                ? "text-gold"
                : "text-foreground/70"
              : "text-foreground/15"
          }
        >
          ●
        </span>
      ))}
    </span>
  )
}

export default function PaintPage() {
  return (
    <>
      <Header />
      <main className="pt-20 lg:pt-24 pb-20 bg-background">
        {/* Title */}
        <div className="border-b border-border">
          <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Finishing</p>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-5xl text-foreground mb-2">
              IRONWORKS ado の『塗装』
            </h1>
            <p className="text-[13px] lg:text-[14px] text-muted-foreground leading-relaxed">
              良い状態で永く使っていただきたい — だから自動車塗装と同じ 2 液型ウレタンを使う
            </p>
          </div>
        </div>

        {/* Stats */}
        <section className="border-b border-border bg-card/40">
          <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((s) => {
                // 数値型と文字型でフォントサイズを差別化（"自動車" のような全角文字は小さく）
                const isWord = /[぀-ヿ一-鿿]/.test(s.value)
                return (
                  <div key={s.label} className="text-center md:text-left">
                    <div className="flex items-baseline justify-center md:justify-start gap-1">
                      <span className={`font-serif text-gold ${isWord ? "text-xl lg:text-2xl" : "text-3xl lg:text-4xl"}`}>
                        {s.value}
                      </span>
                      <span className="text-[12px] text-gold/80">{s.unit}</span>
                    </div>
                    <p className="text-[12px] font-medium text-foreground mt-1">{s.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <div className="max-w-[880px] mx-auto px-4 lg:px-8 py-16 space-y-14 md:space-y-20">
          {/* Hero image — 鉄手すりへスプレーガンで 2 液型ウレタン塗装中 */}
          <section>
            <div className="relative w-full aspect-[3/2] overflow-hidden rounded-md bg-secondary">
              <Image
                src="/images/process/hero-paint-spray.jpg"
                alt="鉄手すりにスプレーガンで 2 液型ウレタン塗装を施している様子"
                fill
                sizes="(max-width: 880px) 100vw, 880px"
                priority
                className="object-cover"
              />
            </div>
          </section>

          {/* Intro */}
          <section>
            <h2 className="font-serif text-2xl lg:text-3xl text-foreground mb-6 scroll-mt-24">
              毎日手にするものだから、手触りのいいものを。
            </h2>
            <div className="space-y-5">
              <p className="text-[15px] leading-[1.95] text-foreground/80">
                当工房はオーダーから制作・発送までを一貫して行っているため、スピーディー・ハイクオリティ・リーズナブルにお届けいたします。
              </p>
              <p className="text-[15px] leading-[1.95] text-foreground/80">
                塗装においても妥協せず、素地調整から下塗り、仕上げ塗装まで、すべての工程を丁寧に手作業で行っています。一般的な 1 液型塗料ではなく、プロ仕様の{" "}
                <strong className="text-gold">2 液型ウレタン塗装</strong>を標準採用することで、長く美しい状態を保てる仕上がりを実現しています。
              </p>
            </div>
          </section>

          {/* Process Steps — 写真ベース PREP / MIX / SPRAY */}
          <section>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">Process</p>
            <h2 className="font-serif text-2xl lg:text-3xl text-foreground mb-4 pb-3 border-b border-border scroll-mt-24">
              塗装工程
            </h2>
            <p className="text-[15px] leading-[1.95] text-foreground/80 mb-6">
              ado の塗装は、すべて鍛冶職人の手作業。素地の調整から塗料の調合、スプレーガンによる吹き付け、最終検品まで、塗膜の良し悪しを決める各工程に妥協はありません。
            </p>

            {/* 3-step photo */}
            <div className="relative w-full aspect-[3/2] overflow-hidden rounded-md bg-secondary mb-6">
              <Image
                src="/images/process/paint-process-3step.jpg"
                alt="塗装工程 PREP / MIX / SPRAY の 3 段階"
                fill
                sizes="(max-width: 880px) 100vw, 880px"
                className="object-cover"
              />
            </div>

            {/* 3 stage descriptions — 写真と同じ 3 列レイアウトを維持（モバイル含む） */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4">
              {processStages.map((s) => (
                <div
                  key={s.label}
                  className="border border-border bg-card rounded-md p-3 md:p-5"
                >
                  <div className="flex items-baseline gap-1 md:gap-2 mb-2">
                    <span className="font-serif text-lg md:text-2xl text-gold leading-none">{s.no}</span>
                    <span className="text-[9px] md:text-[10px] tracking-[0.15em] md:tracking-[0.2em] uppercase text-gold">{s.label}</span>
                  </div>
                  <h3 className="font-serif text-[13px] md:text-base text-foreground mb-2 leading-snug">{s.titleJa}</h3>
                  <p className="text-[11px] md:text-[12px] leading-[1.7] md:leading-[1.85] text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>

            {/* 4th step — 同じカードスタイルで統一（インラインからカード化） */}
            <div className="border border-border bg-secondary/30 rounded-md p-4 md:p-5 border-l-4 border-l-gold">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-serif text-lg md:text-xl text-gold leading-none">04</span>
                <span className="text-[10px] tracking-[0.2em] uppercase text-gold">INSPECT</span>
              </div>
              <h3 className="font-serif text-[14px] md:text-base text-foreground mb-2 leading-snug">仕上げ検品</h3>
              <p className="text-[12px] md:text-[13px] leading-[1.85] text-foreground/80">
                塗装後、ムラ・タレを目視確認のうえで納品します。微細な傷や色ムラがあれば、職人の手で再仕上げを行います。
              </p>
            </div>
          </section>

          {/* 2-Component diagram */}
          <section>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">2-Component Urethane</p>
            <h2 className="font-serif text-2xl lg:text-3xl text-foreground mb-6 pb-3 border-b border-border scroll-mt-24">
              2 液型ウレタン塗装とは？
            </h2>
            <div className="space-y-5 mb-8">
              <p className="text-[15px] leading-[1.95] text-foreground/80">
                2 液型ウレタン塗装は、<strong className="text-foreground">主剤</strong>と
                <strong className="text-foreground">硬化剤</strong>の 2 つの液を使用直前に混合して塗る塗装方法です。混合後に化学反応（架橋反応）が始まり、乾燥とともに非常に強靭な塗膜を形成します。
              </p>
              <p className="text-[15px] leading-[1.95] text-foreground/80">
                自動車の塗装や工業製品にも使われるプロ仕様の塗装で、一般的な DIY 向け 1 液型塗料とは性能が大きく異なります。
              </p>
            </div>
            {/*
              主剤+硬化剤 → 強靭な塗膜の実品写真風画像
              ─────────────────────────────────────
              生成プロンプト（ChatGPT/DALL-E 3 推奨）:
              "2 液型ウレタン塗料のセットアップを写真風に：左にラベル付き
               主剤の塗料缶（"ポリオール樹脂"）、右にラベル付き硬化剤の缶
               （"イソシアネート"）、中央に計量・混合カップと攪拌棒、奥に
               光沢のある黒い完成塗膜サンプル。プロの工房作業台、暖色照明、
               木目の作業台、フォトリアリスティック、3:2、暗めトーン"
              生成後、v0-design/public/images/process/two-component-paint.jpg
              に上書き保存すれば即反映されます。
              ※ 現在は paint-process-3step.jpg のコピーをプレースホルダー
            */}
            <div className="relative w-full aspect-[3/2] overflow-hidden rounded-md border border-border">
              <Image
                src="/images/process/two-component-paint.jpg"
                alt="2 液型ウレタン塗料の主剤・硬化剤と完成塗膜"
                fill
                sizes="(max-width: 880px) 100vw, 880px"
                className="object-cover"
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-3 text-center tracking-wide">
              主剤と硬化剤を正確な比率で混合 → 化学反応で強靭な塗膜が形成される
            </p>
          </section>

          {/* Cross-section comparison */}
          <section>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">Film Thickness</p>
            <h2 className="font-serif text-2xl lg:text-3xl text-foreground mb-6 pb-3 border-b border-border scroll-mt-24">
              塗膜の厚みと密着の違い
            </h2>
            <p className="text-[15px] leading-[1.95] text-foreground/80 mb-6">
              同じ「塗装」でも、塗料の種類によって塗膜の厚み・密着・耐久性は大きく異なります。ado は屋内製品にもプロ仕様の 2 液型ウレタンを採用し、十分な厚膜と密着力で長く美しい仕上がりを実現します。
            </p>

            {/*
              塗膜断面 3D レンダリング画像
              ─────────────────────────
              生成プロンプト（ChatGPT/DALL-E 3 推奨）:
              "3 種類の塗料の塗膜断面を比較した 3D レンダリング、横並びの
               比較図：左『1液型』薄く不均一なグレー塗膜（約 20μm）にひび、
               中央『2液ウレタン』厚く均一な光沢塗膜（約 60μm）にプライマー
               下層、右『焼付塗装』極薄極硬の塗膜（約 10μm）。それぞれ鉄の
               素地（暗グレー鋼材）の上に乗っている断面ビュー。
               スタジオライティング、上左から光、暗いワークショップ背景、
               16:9、フォトリアリスティック、工業デザインイラスト"
              生成後、v0-design/public/images/process/film-cross-section.jpg
              に上書き保存。
              ※ 現状はプレースホルダー
            */}
            <div className="relative w-full aspect-[16/9] overflow-hidden rounded-md border border-border mb-6">
              <Image
                src="/images/process/film-cross-section.jpg"
                alt="1 液型 / 2 液ウレタン / 焼付塗装の塗膜断面比較"
                fill
                sizes="(max-width: 880px) 100vw, 880px"
                className="object-cover"
              />
            </div>

            {/* 補足: 数値情報を補強する SVG */}
            <details className="group border border-border bg-card rounded-md overflow-hidden">
              <summary className="cursor-pointer list-none px-5 py-3 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                <span className="text-[12px] tracking-wider text-foreground">
                  簡易図解で見る塗膜厚と耐久性
                </span>
                <span className="text-gold text-lg leading-none transition-transform group-open:rotate-45">＋</span>
              </summary>
              <div className="border-t border-border/40 p-4 lg:p-6 bg-secondary/30">
                <FilmCrossSectionDiagram />
              </div>
            </details>
          </section>

          {/* Durability timeline */}
          <section>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">Timeline</p>
            <h2 className="font-serif text-2xl lg:text-3xl text-foreground mb-6 pb-3 border-b border-border scroll-mt-24">
              経年変化イメージ
            </h2>
            <p className="text-[15px] leading-[1.95] text-foreground/80 mb-6">
              ホームセンター塗料（1 液型）は屋外で 1〜3 年で劣化が目立ちますが、ado の 2 液型ウレタンは美観を長く維持します。屋外設置にはさらに溶融亜鉛メッキを重ねることで、10 年以上の耐久性を実現できます。
            </p>

            {/*
              経年変化 4 段階写真風画像
              ────────────────────────
              生成プロンプト（ChatGPT/DALL-E 3 推奨）:
              "屋外設置のアイアン手すり 4 つを横並びに比較したフォトリアル
               な合成画像：①新品（光沢のある完璧な黒）②1年経過（ほぼ同じ、
               わずかに艶引け）③5年経過（軽い艶引け、まだ綺麗）④10年経過
               （微細な傷あり、まだ十分美しい）。すべて同じ角度・同じ
               ライティング・同じアングル、屋外日中、自然光、3:1 ワイド、
               下部に各段階のラベル『新品/1年/5年/10年』。
               2 液ウレタン塗装の長期耐久性を伝える比較ビジュアル"
              生成後、v0-design/public/images/process/paint-aging-timeline.jpg
              に上書き保存。
              ※ 現状はプレースホルダー
            */}
            <div className="relative w-full aspect-[3/1] overflow-hidden rounded-md border border-border mb-6">
              <Image
                src="/images/process/paint-aging-timeline.jpg"
                alt="新品 / 1 年 / 5 年 / 10 年経過した手すりの経年変化"
                fill
                sizes="(max-width: 880px) 100vw, 880px"
                className="object-cover"
              />
            </div>

            {/* 数値棒グラフ — 写真の補足として */}
            <div className="border border-border bg-secondary/30 rounded-md p-6 lg:p-8">
              <FilmDurabilityTimeline />
            </div>
          </section>

          {/* Radar + Comparison */}
          <section>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">Comparison</p>
            <h2 className="font-serif text-2xl lg:text-3xl text-foreground mb-6 pb-3 border-b border-border scroll-mt-24">
              1 液型 / 2 液ウレタン / 焼付塗装 の比較
            </h2>
            <p className="text-[15px] leading-[1.95] text-foreground/80 mb-6">
              5 軸での性能比較と、9 項目の詳細比較表でご紹介します。色の薄い 1 液型は施工の手軽さ以外で大きく劣り、ado の採用する 2 液ウレタンは焼付塗装に近い耐久性能を、現場補修可能な扱いやすさで実現しています。
            </p>

            <div className="mb-10 max-w-[520px] mx-auto">
              <PaintRadar />
              <div className="flex flex-wrap gap-x-4 md:gap-x-6 gap-y-2 justify-center mt-5 text-[12px] md:text-[13px] font-bold">
                <span className="inline-flex items-center gap-1.5 md:gap-2 text-[#666]">
                  <span className="inline-block w-3 h-3 border border-[#888] bg-[#88888830]"></span>
                  1 液型
                </span>
                <span className="inline-flex items-center gap-1.5 md:gap-2 text-gold">
                  <span className="inline-block w-3 h-3 border border-gold bg-gold/20"></span>
                  2 液ウレタン
                </span>
                <span className="inline-flex items-center gap-1.5 md:gap-2 text-[#dc2626]">
                  <span className="inline-block w-3 h-3 border border-[#dc2626] bg-[#dc262620]"></span>
                  焼付塗装
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[12px] min-w-[560px]">
                <thead>
                  <tr className="border-b-2 border-gold">
                    <th className="text-left p-2 md:p-3 text-muted-foreground font-normal whitespace-nowrap">項目</th>
                    <th className="text-left p-2 md:p-3 text-[#666] font-bold whitespace-nowrap">1 液型</th>
                    <th className="text-left p-2 md:p-3 text-gold font-bold bg-gold/[0.08] whitespace-nowrap">2 液ウレタン</th>
                    <th className="text-left p-2 md:p-3 text-[#dc2626] font-bold whitespace-nowrap">焼付塗装</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row) => (
                    <tr key={row.label} className="border-b border-border/50 align-top">
                      <td className="p-3 text-foreground font-medium whitespace-nowrap">{row.label}</td>
                      <td className="p-3 text-muted-foreground">
                        <div>{row.a}</div>
                        {row.aLevel != null && (
                          <div className="mt-1">
                            <StarBar level={row.aLevel} color="muted" />
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-foreground bg-gold/[0.08]">
                        <div>{row.b}</div>
                        {row.bLevel != null && (
                          <div className="mt-1">
                            <StarBar level={row.bLevel} color="gold" />
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        <div>{row.c}</div>
                        {row.cLevel != null && (
                          <div className="mt-1">
                            <StarBar level={row.cLevel} color="muted" />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Philosophy */}
          <section>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">Our Philosophy</p>
            <h2 className="font-serif text-2xl lg:text-3xl text-foreground mb-6 pb-3 border-b border-border scroll-mt-24">
              なぜ ado は 2 液型を選ぶのか
            </h2>
            <blockquote className="border-l-2 border-gold pl-6 py-5 mb-7 bg-secondary/30">
              <p className="font-serif text-base lg:text-lg leading-[1.85] text-foreground mb-3">
                手間もコストもかかります。
                <br />
                それでも 2 液型を選ぶのは、
                <br />
                お客様に「10 年後も変わらない美しさ」を届けたいから。
              </p>
              <footer className="text-[11px] text-gold tracking-wider">— IRONWORKS ado 鍛冶職人</footer>
            </blockquote>
            <div className="space-y-5">
              <p className="text-[15px] leading-[1.95] text-foreground/80">
                2 液型ウレタン塗装は、主剤と硬化剤を正確な比率で混合する必要があり、混合後は数時間以内に使い切らなければなりません。材料費も 1 液型の 3〜5 倍。決して「効率的」とは言えない塗装方法です。
              </p>
              <p className="text-[15px] leading-[1.95] text-foreground/80">
                しかし、毎日手に触れる手すりだからこそ、塗膜の強さ・手触りの良さ・美しさにこだわりたい。1 液型では実現できない
                <strong className="text-gold">「触って気持ちいい、見て美しい」</strong>仕上がりが、2 液型ウレタンにはあります。素地調整から最終仕上げまで、すべての工程に手を抜かない。それが IRONWORKS ado の塗装です。
              </p>
            </div>
          </section>

          {/* FAQ */}
          <section>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">FAQ</p>
            <h2 className="font-serif text-2xl lg:text-3xl text-foreground mb-6 pb-3 border-b border-border scroll-mt-24">
              よくあるご質問
            </h2>
            <div className="space-y-3">
              {faq.map((item) => (
                <details
                  key={item.q}
                  className="group border border-border bg-card rounded-md overflow-hidden"
                >
                  <summary className="cursor-pointer list-none p-5 flex items-start gap-4 hover:bg-secondary/30 transition-colors">
                    <span className="text-gold font-serif text-base mt-0.5 shrink-0">Q.</span>
                    <span className="flex-1 text-[14px] font-medium text-foreground">{item.q}</span>
                    <span className="text-gold text-xl leading-none transition-transform group-open:rotate-45 shrink-0">＋</span>
                  </summary>
                  <div className="px-5 pb-5 pt-2 flex items-start gap-4 border-t border-border/40">
                    <span className="text-muted-foreground font-serif text-base mt-0.5 shrink-0">A.</span>
                    <p className="flex-1 text-[13px] leading-[1.95] text-foreground/75">{item.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Applicable products */}
          <section>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">Products</p>
            <h2 className="font-serif text-2xl lg:text-3xl text-foreground mb-6 pb-3 border-b border-border scroll-mt-24">
              主な対応製品（屋内用）
            </h2>
            <p className="text-[15px] leading-[1.95] text-foreground/80 mb-8">
              屋内設置の手すりは 2 液型ウレタン塗装で仕上げます。屋外設置の場合は溶融亜鉛メッキ＋塗装の二重防錆処理を施しています。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {products.map((p) => (
                <Link
                  key={p.slug}
                  href={`/products/${p.slug}`}
                  className="group block border border-border bg-card overflow-hidden transition-all duration-300 hover:border-gold hover:-translate-y-1"
                >
                  <div className="relative aspect-square bg-secondary overflow-hidden">
                    <Image
                      src={galleryUrl(`${p.imgId}.jpg`)}
                      alt={p.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-[13px] font-medium text-foreground mb-1">{p.title}</h3>
                    <p className="text-[12px] text-muted-foreground">{p.subtitle}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Outdoor CTA */}
          <section className="border border-border bg-card p-6 lg:p-8">
            <h3 className="font-serif text-lg text-foreground mb-3">屋外で使用する場合の仕上げ</h3>
            <p className="text-[13px] leading-[1.95] text-foreground/75 mb-4">
              屋外設置のアイアン製品には、溶融亜鉛メッキ ＋ 2 液型ウレタン塗装の二重防錆処理を施しています。
            </p>
            <Link
              href="/galvanizing"
              className="inline-block text-[11px] tracking-[0.2em] uppercase text-gold border-b border-gold hover:opacity-70 transition-opacity"
            >
              亜鉛メッキについて →
            </Link>
          </section>
        </div>

        {/* Bottom Contact CTA */}
        <div className="max-w-[880px] mx-auto px-4 lg:px-8 pb-16">
          <div className="pt-10 border-t border-border text-center">
            <p className="text-[12px] text-muted-foreground mb-5">
              色のご相談・サイズ・取付環境について、お気軽にお問い合わせください。
            </p>
            <PrimaryCTA href="/contact" variant="gold" size="md">
              お問い合わせする
            </PrimaryCTA>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
