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

// 顧客の声ケーススタディ — Vermicular RECRAFT 風吹き出し
const voiceCases = [
  {
    label: "Case 01",
    customerType: "屋外設置でお悩みの方",
    quote: "屋外の手すりが 2 年で錆びて困っています。",
    advice:
      "屋外設置には 2 液型ウレタン塗装に加えて溶融亜鉛メッキを重ねた二重防錆処理がおすすめです。塩害・紫外線・雨ざらしにも 10 年以上耐えます。",
    link: "/galvanizing",
    linkLabel: "亜鉛メッキについて",
  },
  {
    label: "Case 02",
    customerType: "色をオーダーしたい方",
    quote: "リビングの建具と合わせた色味でオーダーしたい。",
    advice:
      "標準色（マットブラック / マットホワイト）以外も調色可能です。色見本をお送りいただければ、お打ち合わせのうえご案内します。",
    link: "/contact",
    linkLabel: "色オーダーのご相談",
  },
]

// ご注文の流れ — Step 01 / 02 / 03（Vermicular RECRAFT 風）
const flowSteps = [
  {
    no: "Step 01",
    title: "オンラインでお見積もり依頼",
    desc: "サイズ・取付環境・希望色などをお問い合わせフォームでご相談ください。2 営業日以内に詳細をご返信いたします。",
  },
  {
    no: "Step 02",
    title: "採寸・お打ち合わせ",
    desc: "現場確認または図面確認のうえ、最終仕様を決定します。色見本のご提示や試作のご相談も可能です。",
  },
  {
    no: "Step 03",
    title: "制作・塗装・お届け",
    desc: "10 営業日でオーダー品を制作・塗装。配送（ご希望の場合は設置）まで一貫対応。在庫品は 2 営業日以内に発送します。",
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
      <main className="pt-16 lg:pt-20 pb-20 bg-background">
        {/* ════════════ Hero — Asymmetric (Vermicular RECRAFT pattern) ════════════ */}
        <section className="border-b border-border">
          <div className="grid lg:grid-cols-12 lg:min-h-[60vh]">
            {/* Left: Text */}
            <div className="lg:col-span-5 px-5 lg:px-12 py-12 lg:py-20 flex flex-col justify-center">
              <p className="text-[10px] tracking-[0.5em] uppercase text-gold mb-5">Finishing</p>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-foreground leading-[1.15] mb-3">
                IRONWORKS ado<br />の『塗装』
              </h1>
              <p className="font-serif text-[14px] lg:text-base text-foreground/70 mb-8">
                Pro-Grade 2-Component Urethane
              </p>
              <p className="text-[14px] lg:text-[15px] leading-[1.95] text-foreground/80 max-w-md">
                毎日手にする手すりだから、塗膜の強さ・手触り・美しさにこだわりたい。
                自動車塗装と同じ 2 液型ウレタンを採用しているのは、
                その願いにもっとも応えられる方法だからです。
              </p>
            </div>
            {/* Right: Hero photo */}
            <div className="lg:col-span-7 relative aspect-[3/2] lg:aspect-auto bg-secondary">
              <Image
                src="/images/process/hero-paint-spray.jpg"
                alt="鉄手すりにスプレーガンで 2 液型ウレタン塗装を施している様子"
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

        {/* ════════════ Sub-hero centered statement ════════════ */}
        <section className="relative max-w-[880px] mx-auto px-5 lg:px-8 py-20 lg:py-32 text-center overflow-hidden">
          {/* Decorative gold accent line */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[600px] aspect-square rounded-full bg-gold/[0.03] pointer-events-none" />
          <p className="relative font-serif text-base lg:text-2xl leading-[2.2] lg:leading-[2.4] text-foreground/90">
            一生使える手すりは、
            <br />
            塗装が決める。
            <br />
            <span className="text-gold">2 液型ウレタンと職人の手仕事</span>で、
            <br />
            10 年後も変わらない美しさを。
          </p>
        </section>

        {/* ════════════ Section 01 — Outline ════════════ */}
        <section id="outline" className="border-y border-border bg-card/20 py-20 lg:py-28">
          <div className="max-w-[1200px] mx-auto px-5 lg:px-8 grid lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Sticky side label */}
            <aside className="lg:col-span-3">
              <div className="lg:sticky lg:top-24">
                <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">Section 01</p>
                <h2 className="font-serif text-3xl lg:text-5xl text-foreground leading-none">Outline</h2>
                <p className="text-[12px] text-muted-foreground mt-3">2 液型ウレタン塗装とは</p>
              </div>
            </aside>
            {/* Body */}
            <div className="lg:col-span-9 scroll-mt-24">
              <h3 className="font-serif text-xl lg:text-3xl text-foreground mb-6 leading-snug">
                主剤 + 硬化剤の化学反応で<br className="hidden lg:block" />
                強靭な塗膜が形成される。
              </h3>
              <div className="space-y-5 mb-10 max-w-2xl">
                <p className="text-[15px] leading-[1.95] text-foreground/80">
                  2 液型ウレタン塗装は、<strong className="text-foreground">主剤</strong>（ポリオール樹脂）と
                  <strong className="text-foreground">硬化剤</strong>（イソシアネート）を使用直前に正確な比率で
                  混合する塗装方法です。混合した瞬間から化学反応（架橋反応）が始まり、
                  乾燥とともに非常に強靭な塗膜を形成します。
                </p>
                <p className="text-[15px] leading-[1.95] text-foreground/80">
                  自動車・工業製品・建築でも使われるプロ仕様の塗装で、
                  ホームセンターで売られている DIY 向け 1 液型塗料とは性能が大きく異なります。
                </p>
              </div>
              <div className="relative w-full aspect-[3/2] overflow-hidden rounded-md border border-border">
                <Image
                  src="/images/process/two-component-paint.jpg"
                  alt="2 液型ウレタン塗料のセットアップ"
                  fill
                  sizes="(max-width: 1024px) 100vw, 720px"
                  className="object-cover"
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-3 tracking-wide">
                主剤と硬化剤を正確な比率で混合 → 化学反応で強靭な塗膜が形成
              </p>
            </div>
          </div>
        </section>

        {/* ════════════ Section 02 — Process ════════════ */}
        <section id="process" className="py-20 lg:py-28">
          <div className="max-w-[1200px] mx-auto px-5 lg:px-8 grid lg:grid-cols-12 gap-8 lg:gap-12">
            <aside className="lg:col-span-3">
              <div className="lg:sticky lg:top-24">
                <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">Section 02</p>
                <h2 className="font-serif text-3xl lg:text-5xl text-foreground leading-none">Process</h2>
                <p className="text-[12px] text-muted-foreground mt-3">職人の手作業 4 工程</p>
              </div>
            </aside>
            <div className="lg:col-span-9 scroll-mt-24">
              <h3 className="font-serif text-xl lg:text-3xl text-foreground mb-6 leading-snug">
                素地づくりから検品まで、<br className="hidden lg:block" />
                すべて職人の手作業で。
              </h3>
              <p className="text-[15px] leading-[1.95] text-foreground/80 mb-8 max-w-2xl">
                ado の塗装は機械任せにはしません。素地調整から塗料の調合、
                スプレーガンによる吹き付け、最終検品まで、
                塗膜の良し悪しを決める各工程に妥協はありません。
              </p>

              {/* Hero process image */}
              <div className="relative w-full aspect-[3/2] overflow-hidden rounded-md mb-8 border border-border">
                <Image
                  src="/images/process/paint-process-3step.jpg"
                  alt="塗装工程 PREP / MIX / SPRAY"
                  fill
                  sizes="(max-width: 1024px) 100vw, 880px"
                  className="object-cover"
                />
              </div>

              {/* Process stage rows */}
              <div className="space-y-0">
                {processStages.map((s, i) => (
                  <div key={s.label} className="grid grid-cols-12 gap-3 lg:gap-6 py-5 border-t border-border first:border-t-0">
                    <div className="col-span-2 lg:col-span-2">
                      <p className="text-[10px] tracking-[0.3em] text-muted-foreground">{`STEP 0${i + 1}`}</p>
                      <p className="text-[11px] tracking-[0.2em] uppercase text-gold mt-1">{s.label}</p>
                    </div>
                    <div className="col-span-10 lg:col-span-10">
                      <h4 className="font-serif text-base lg:text-xl text-foreground mb-1.5 leading-snug">{s.titleJa}</h4>
                      <p className="text-[13px] lg:text-[14px] leading-[1.85] text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                ))}
                {/* STEP 04 — 検品 */}
                <div className="grid grid-cols-12 gap-3 lg:gap-6 py-5 border-t border-border">
                  <div className="col-span-2 lg:col-span-2">
                    <p className="text-[10px] tracking-[0.3em] text-muted-foreground">STEP 04</p>
                    <p className="text-[11px] tracking-[0.2em] uppercase text-gold mt-1">INSPECT</p>
                  </div>
                  <div className="col-span-10 lg:col-span-10">
                    <h4 className="font-serif text-base lg:text-xl text-foreground mb-1.5 leading-snug">仕上げ検品</h4>
                    <p className="text-[13px] lg:text-[14px] leading-[1.85] text-muted-foreground">
                      塗装後、ムラ・タレを目視確認のうえで納品します。微細な傷や色ムラがあれば、
                      職人の手で再仕上げを行います。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════ Section 03 — Stories (customer voices) ════════════ */}
        <section id="stories" className="border-y border-border bg-card/30 py-20 lg:py-28">
          <div className="max-w-[1200px] mx-auto px-5 lg:px-8 grid lg:grid-cols-12 gap-8 lg:gap-12">
            <aside className="lg:col-span-3">
              <div className="lg:sticky lg:top-24">
                <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">Section 03</p>
                <h2 className="font-serif text-3xl lg:text-5xl text-foreground leading-none">Stories</h2>
                <p className="text-[12px] text-muted-foreground mt-3">お客様の声と職人からの提案</p>
              </div>
            </aside>
            <div className="lg:col-span-9 scroll-mt-24 space-y-12">
              {voiceCases.map((c) => (
                <div key={c.label}>
                  {/* Case label */}
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-[12px] tracking-[0.3em] text-muted-foreground">{c.label}</span>
                    <span className="flex-1 h-px bg-border" />
                    <span className="text-[11px] text-muted-foreground">{c.customerType}</span>
                  </div>
                  {/* Speech bubble */}
                  <div className="relative bg-background border border-border rounded-2xl px-6 lg:px-10 py-7 lg:py-9 mb-6">
                    <p className="font-serif text-base lg:text-2xl leading-relaxed text-foreground/90 text-center">
                      “{c.quote}”
                    </p>
                    {/* Triangle pointer */}
                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-6 h-6 rotate-45 bg-background border-r border-b border-border" />
                  </div>
                  {/* Concierge advice */}
                  <div className="bg-background/50 border border-border rounded-md p-5 lg:p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-gold/40 text-gold text-xs">
                        ado
                      </span>
                      <p className="text-[12px] tracking-[0.2em] text-gold mt-1">職人からのアドバイス</p>
                    </div>
                    <p className="text-[14px] leading-[1.95] text-foreground/80 mb-4">{c.advice}</p>
                    <Link
                      href={c.link}
                      className="inline-flex items-center gap-2 text-[12px] tracking-[0.2em] uppercase text-gold border-b border-gold pb-1 hover:opacity-70 transition-opacity"
                    >
                      {c.linkLabel} →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════ Section 04 — Compare ════════════ */}
        <section id="compare" className="py-20 lg:py-28">
          <div className="max-w-[1200px] mx-auto px-5 lg:px-8 grid lg:grid-cols-12 gap-8 lg:gap-12">
            <aside className="lg:col-span-3">
              <div className="lg:sticky lg:top-24">
                <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">Section 04</p>
                <h2 className="font-serif text-3xl lg:text-5xl text-foreground leading-none">Compare</h2>
                <p className="text-[12px] text-muted-foreground mt-3">1液 / 2液 / 焼付塗装</p>
              </div>
            </aside>
            <div className="lg:col-span-9 scroll-mt-24">
              <h3 className="font-serif text-xl lg:text-3xl text-foreground mb-6 leading-snug">
                色の薄い 1 液型は施工の手軽さ以外で<br className="hidden lg:block" />
                大きく劣ります。
              </h3>
              <p className="text-[15px] leading-[1.95] text-foreground/80 mb-10 max-w-2xl">
                ado の採用する 2 液ウレタンは、塗膜厚・密着・耐久性・耐薬品性で
                焼付塗装に近い性能を、現場補修可能な扱いやすさで実現しています。
              </p>

              {/* Cross-section image */}
              <div className="mb-10">
                <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">塗膜断面の比較</p>
                <div className="relative w-full aspect-[16/9] overflow-hidden rounded-md border border-border mb-4">
                  <Image
                    src="/images/process/film-cross-section.jpg"
                    alt="1 液型 / 2 液ウレタン / 焼付塗装の塗膜断面比較"
                    fill
                    sizes="(max-width: 1024px) 100vw, 880px"
                    className="object-cover"
                  />
                </div>
                <details className="group border border-border bg-card rounded-md overflow-hidden">
                  <summary className="cursor-pointer list-none px-5 py-3 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                    <span className="text-[12px] tracking-wider text-foreground">簡易図解で見る塗膜厚と耐久性</span>
                    <span className="text-gold text-lg leading-none transition-transform group-open:rotate-45">＋</span>
                  </summary>
                  <div className="border-t border-border/40 p-4 lg:p-6 bg-secondary/30">
                    <FilmCrossSectionDiagram />
                  </div>
                </details>
              </div>

              {/* Aging timeline */}
              <div className="mb-12">
                <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">経年変化イメージ</p>
                <div className="relative w-full aspect-[3/1] overflow-hidden rounded-md border border-border mb-6">
                  <Image
                    src="/images/process/paint-aging-timeline.jpg"
                    alt="新品 / 1 年 / 5 年 / 10 年経過した手すりの経年変化"
                    fill
                    sizes="(max-width: 1024px) 100vw, 880px"
                    className="object-cover"
                  />
                </div>
                <div className="border border-border bg-secondary/30 rounded-md p-6 lg:p-8">
                  <FilmDurabilityTimeline />
                </div>
              </div>

              {/* Radar */}
              <div className="mb-10">
                <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">5 軸性能チャート</p>
                <div className="max-w-[520px] mx-auto">
                  <PaintRadar />
                  <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-5 text-[12px] md:text-[13px] font-bold">
                    <span className="inline-flex items-center gap-1.5 text-[#666]">
                      <span className="inline-block w-3 h-3 border border-[#888] bg-[#88888830]" />
                      1 液型
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-gold">
                      <span className="inline-block w-3 h-3 border border-gold bg-gold/20" />
                      2 液ウレタン
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[#dc2626]">
                      <span className="inline-block w-3 h-3 border border-[#dc2626] bg-[#dc262620]" />
                      焼付塗装
                    </span>
                  </div>
                </div>
              </div>

              {/* Comparison table */}
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">9 項目詳細比較表</p>
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
                          <td className="p-2 md:p-3 text-foreground font-medium whitespace-nowrap">{row.label}</td>
                          <td className="p-2 md:p-3 text-muted-foreground">
                            <div>{row.a}</div>
                            {row.aLevel != null && (
                              <div className="mt-1">
                                <StarBar level={row.aLevel} color="muted" />
                              </div>
                            )}
                          </td>
                          <td className="p-2 md:p-3 text-foreground bg-gold/[0.08]">
                            <div>{row.b}</div>
                            {row.bLevel != null && (
                              <div className="mt-1">
                                <StarBar level={row.bLevel} color="gold" />
                              </div>
                            )}
                          </td>
                          <td className="p-2 md:p-3 text-muted-foreground">
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
              </div>
            </div>
          </div>
        </section>

        {/* ════════════ Section 05 — Flow (order steps) ════════════ */}
        <section id="flow" className="border-y border-border bg-card/20 py-20 lg:py-28">
          <div className="max-w-[1200px] mx-auto px-5 lg:px-8 grid lg:grid-cols-12 gap-8 lg:gap-12">
            <aside className="lg:col-span-3">
              <div className="lg:sticky lg:top-24">
                <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">Section 05</p>
                <h2 className="font-serif text-3xl lg:text-5xl text-foreground leading-none">Flow</h2>
                <p className="text-[12px] text-muted-foreground mt-3">ご注文の簡単 3 ステップ</p>
              </div>
            </aside>
            <div className="lg:col-span-9 scroll-mt-24">
              <div className="space-y-0">
                {flowSteps.map((s, i) => (
                  <div
                    key={s.no}
                    className="grid grid-cols-12 gap-4 lg:gap-8 items-start py-8 border-t border-border first:border-t-0"
                  >
                    <div className="col-span-3 lg:col-span-2">
                      <p className="text-[12px] tracking-[0.3em] text-muted-foreground">{s.no}</p>
                    </div>
                    <div className="col-span-9 lg:col-span-7">
                      <h3 className="font-serif text-lg lg:text-2xl text-foreground mb-3 leading-snug">
                        {s.title}
                      </h3>
                      <p className="text-[14px] lg:text-[15px] leading-[1.95] text-foreground/75">
                        {s.desc}
                      </p>
                    </div>
                    <div className="col-span-12 lg:col-span-3 flex justify-center lg:justify-end">
                      <div className="w-20 h-20 lg:w-28 lg:h-28 rounded-full bg-card border border-gold/20 flex items-center justify-center">
                        <span className="font-serif text-3xl lg:text-5xl text-gold/40 leading-none">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Closing CTA inside Flow */}
              <div className="mt-12 text-center">
                <PrimaryCTA href="/contact" variant="gold" size="lg">
                  お見積もり・お申込み
                </PrimaryCTA>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════ FAQ ════════════ */}
        <section id="faq" className="py-20 lg:py-28">
          <div className="max-w-[1200px] mx-auto px-5 lg:px-8 grid lg:grid-cols-12 gap-8 lg:gap-12">
            <aside className="lg:col-span-3">
              <div className="lg:sticky lg:top-24">
                <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">FAQ</p>
                <h2 className="font-serif text-3xl lg:text-5xl text-foreground leading-none">Q&A</h2>
                <p className="text-[12px] text-muted-foreground mt-3">よくあるご質問</p>
              </div>
            </aside>
            <div className="lg:col-span-9 scroll-mt-24 space-y-3">
              {faq.map((item) => (
                <details
                  key={item.q}
                  className="group border border-border bg-card rounded-md overflow-hidden"
                >
                  <summary className="cursor-pointer list-none p-5 flex items-start gap-4 hover:bg-secondary/30 transition-colors">
                    <span className="text-gold font-serif text-base mt-0.5 shrink-0">Q.</span>
                    <span className="flex-1 text-[14px] lg:text-[15px] font-medium text-foreground">
                      {item.q}
                    </span>
                    <span className="text-gold text-xl leading-none transition-transform group-open:rotate-45 shrink-0">
                      ＋
                    </span>
                  </summary>
                  <div className="px-5 pb-5 pt-2 flex items-start gap-4 border-t border-border/40">
                    <span className="text-muted-foreground font-serif text-base mt-0.5 shrink-0">A.</span>
                    <p className="flex-1 text-[13px] lg:text-[14px] leading-[1.95] text-foreground/75">
                      {item.a}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════ Section 06 — Products ════════════ */}
        <section id="products" className="border-y border-border bg-card/20 py-20 lg:py-28">
          <div className="max-w-[1200px] mx-auto px-5 lg:px-8 grid lg:grid-cols-12 gap-8 lg:gap-12">
            <aside className="lg:col-span-3">
              <div className="lg:sticky lg:top-24">
                <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">Section 06</p>
                <h2 className="font-serif text-3xl lg:text-5xl text-foreground leading-none">Products</h2>
                <p className="text-[12px] text-muted-foreground mt-3">2 液型ウレタン採用製品</p>
              </div>
            </aside>
            <div className="lg:col-span-9 scroll-mt-24">
              <p className="text-[15px] leading-[1.95] text-foreground/80 mb-8 max-w-2xl">
                屋内設置の手すりは 2 液型ウレタン塗装で仕上げています。
                屋外設置をご希望の場合は、溶融亜鉛メッキを重ねた二重防錆処理に切り替わります。
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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
              {/* Outdoor CTA */}
              <div className="border border-border bg-card p-6 lg:p-8 rounded-md">
                <h3 className="font-serif text-base lg:text-lg text-foreground mb-2">
                  屋外で使用する場合の仕上げ
                </h3>
                <p className="text-[13px] leading-[1.95] text-foreground/75 mb-4">
                  屋外設置のアイアン製品には、溶融亜鉛メッキ ＋ 2 液型ウレタン塗装の二重防錆処理を施しています。
                </p>
                <Link
                  href="/galvanizing"
                  className="inline-block text-[11px] tracking-[0.2em] uppercase text-gold border-b border-gold hover:opacity-70 transition-opacity"
                >
                  亜鉛メッキについて →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════ Footer Banner CTA ════════════ */}
        <section className="py-16 lg:py-24 bg-dark text-white">
          <div className="max-w-[880px] mx-auto px-5 lg:px-8 text-center">
            <p className="text-[10px] tracking-[0.5em] uppercase text-gold mb-5">Get Started</p>
            <h2 className="font-serif text-2xl lg:text-4xl mb-6 leading-snug">
              一生使える、<br />
              触って気持ちいい手すりを。
            </h2>
            <p className="text-[14px] lg:text-[15px] leading-[1.95] text-white/70 mb-10 max-w-xl mx-auto">
              色のご相談・サイズ・取付環境について、お気軽にお問い合わせください。
              職人が直接ご返答いたします。
            </p>
            <PrimaryCTA href="/contact" variant="gold" size="lg">
              お問い合わせする
            </PrimaryCTA>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
