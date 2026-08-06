import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import Image from "next/image"
import { PrimaryCTA } from "@/components/ui/primary-cta"
import { galleryUrl } from "@/lib/products/display"

export const metadata = {
  title: "屋外アイアン手すりの亜鉛メッキ処理｜10 年以上錆びない二重防錆｜IRONWORKS ado",
  description:
    "屋外でも錆びない、ado のアイアン手すりの二重防錆処理。溶融亜鉛メッキ＋2液型ウレタン塗装で 10 年以上の耐久性を実現します。図解で分かる仕組みと対応製品をご紹介。",
  alternates: { canonical: "/galvanizing" },
}

const stats = [
  { value: "450", unit: "℃", label: "亜鉛浴温度", desc: "鉄を浸す液体亜鉛" },
  { value: "50", unit: "μm+", label: "亜鉛皮膜厚", desc: "JIS規格を上回る厚膜" },
  { value: "10", unit: "年+", label: "屋外耐久実績", desc: "塗装のみの 2〜3 倍" },
  { value: "JIS", unit: "H 8641", label: "準拠規格", desc: "建築・公共インフラ規格" },
]

const processSteps = [
  {
    no: "01",
    title: "鍛冶職人が製作",
    desc: "手すり・フェンスを一点ずつ手作業で",
    icon: "forge",
  },
  {
    no: "02",
    title: "溶融亜鉛メッキ",
    desc: "450℃ の亜鉛浴に丸ごと浸漬",
    icon: "dip",
  },
  {
    no: "03",
    title: "素地調整",
    desc: "メッキ表面を整え塗料の密着性を確保",
    icon: "polish",
  },
  {
    no: "04",
    title: "2 液型ウレタン塗装",
    desc: "プライマー＋上塗りで美しく仕上げ",
    icon: "spray",
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
  { label: "屋外耐久", a: "1〜3年", b: "5〜8年", c: "10年以上", aLevel: 1, bLevel: 4, cLevel: 5 },
  { label: "塩害（沿岸部）", a: "急速に錆", b: "やや弱い", c: "強い（沿岸部での採用実績あり）", aLevel: 1, bLevel: 3, cLevel: 5 },
  { label: "紫外線", a: "急速に色褪せ", b: "数年で薄くなる", c: "下地メッキが残る", aLevel: 1, bLevel: 3, cLevel: 5 },
  { label: "傷からの保護", a: "即座に錆", b: "部分的に錆", c: "犠牲防食で守る", aLevel: 1, bLevel: 3, cLevel: 5 },
  { label: "メンテナンス", a: "毎年補修", b: "5〜7年で部分補修", c: "ほぼ不要", aLevel: 1, bLevel: 3, cLevel: 5 },
  { label: "想定用途", a: "DIY・仮塗装", b: "屋内・軒下・室内階段", c: "屋外・アプローチ・沿岸部" },
]

const faq = [
  {
    q: "メッキで色がついちゃうんですか？",
    a: "メッキ自体は銀灰色ですが、その上から 2 液型ウレタン塗装で好みの色に仕上げます。お選びいただいた色味のまま、メッキされていない普通の鉄製品と見た目は変わりません。",
  },
  {
    q: "古い手すりにも後からメッキできますか？",
    a: "可能ですが、一度塗装を全て剥がしてから処理する必要があり、新規制作よりコストがかかります。リフォームのタイミングで新しく作り直すのがおすすめです。",
  },
  {
    q: "本当に 10 年もつんですか？",
    a: "はい。橋梁・鉄塔・ガードレールなど、過酷な屋外環境で長年使われてきた信頼性の高い技術です。住宅用途としては十分すぎる耐久性があります。沿岸部の塩害環境でも長期使用していただけます。",
  },
  {
    q: "メンテナンスは必要ですか？",
    a: "基本的には不要です。万が一塗装に大きな傷がついても、犠牲防食でメッキ層が鉄を守り続けます。設置時には初期補修用のタッチアップ剤をお付けしておりますが、こちらは塗料の性質上、時間が経つと硬化して使えなくなります。設置から年数が経ってから気になる傷を見つけられた場合は、再塗装でのお預かり対応や、タッチアップ剤を新たにお送りするなど、状況に応じて対応いたしますので、お気軽にお問い合わせください。",
  },
  {
    q: "屋内用の手すりとは何が違うんですか？",
    a: "屋内用は 2 液型ウレタン塗装で仕上げています。ado の塗装はもともと屋外耐久も視野に入れたプロ仕様（自動車塗装と同じ 2 液型ウレタン）なので、軒下・室内階段ならこれだけでも 10 年以上綺麗な状態を保てます。雨ざらしになる屋外用には、さらに亜鉛メッキ層を重ねて 10 年以上の耐久性を確保しています。",
  },
  {
    q: "ホームセンターの塗料との違いは？",
    a: (
      <>
        ホームセンターで売られているのは 1 液型（ラッカーや水性塗料）が中心で、屋外設置だと 1〜3
        年ほどで錆や色褪せが目立ってきます。ado は自動車塗装と同じ 2
        液型ウレタン塗料を主剤＋硬化剤の比率で正確に調合し、化学反応で硬化させているため、塗膜の強さがまったく違います。詳しくは
        <Link href="/paint" className="text-gold underline underline-offset-2 hover:opacity-70">
          塗装ページ
        </Link>
        をご覧ください。
      </>
    ),
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
    slug: "simple-black",
    title: "Simple -black-",
    subtitle: "アプローチ手すり / マットブラック",
    imgId: "579e79e794eed28d9ac7",
  },
  {
    slug: "tsuta",
    title: "蔦 Tsuta",
    subtitle: "アートアイアン / 無垢鉄",
    imgId: "051b216ddd9e64d0ae37",
  },
  {
    slug: "simple-white",
    title: "Simple -white-",
    subtitle: "アプローチ手すり / マットホワイト",
    imgId: "ef1a6b4999d530d6fb67",
  },
]

// 顧客の声ケーススタディ — 屋外設置の悩みに応える
const voiceCases = [
  {
    label: "Case 01",
    customerType: "沿岸部にお住まいの方",
    quote: "潮風で他社の手すりが 1 年で錆びました。",
    advice:
      "沿岸部の塩害環境では、塗装だけでは長期耐久が難しい場合があります。溶融亜鉛メッキ＋塗装の二重防錆処理なら、犠牲防食で塩害にも耐え、10 年以上美観を維持できます。",
    link: "/contact",
    linkLabel: "屋外設置のご相談",
  },
  {
    label: "Case 02",
    customerType: "アプローチ手すりをお考えの方",
    quote: "玄関アプローチに置く手すり、雨ざらしで本当に大丈夫？",
    advice:
      "ado のアプローチ手すり（Simple-black 等）はすべて二重防錆処理が標準仕様です。橋梁・鉄塔・ガードレールと同じ技術なので、住宅用途では十分すぎる耐久性があります。",
    link: "/products/simple-black",
    linkLabel: "Simple -black- を見る",
  },
]

// ご注文の流れ — 屋外用製品向け
const flowSteps = [
  {
    no: "Step 01",
    title: "オンラインでお見積もり依頼",
    desc: "サイズ・取付環境（屋外/屋内）・設置場所の写真などをお問い合わせフォームでご相談ください。2 営業日以内にご返信します。",
  },
  {
    no: "Step 02",
    title: "現場確認・お打ち合わせ",
    desc: "千葉県および周辺エリアは現場採寸も承ります。設置環境（沿岸部・直射日光・雨ざらし等）に応じて最適な防錆仕様をご提案します。",
  },
  {
    no: "Step 03",
    title: "制作 → メッキ → 塗装 → お届け",
    desc: "鍛冶職人が製作 → 専用工場で溶融亜鉛メッキ → 素地調整 → 2 液型ウレタン塗装 → 配送・設置（ご希望の場合）。標準納期 10 営業日。",
  },
]

// ════════════ 犠牲防食の仕組み — ad o 流ミニマル設計 v1 ════════════
// 設計方針：白基調・抽象イラスト・ポイント強調。整然と並ぶテーブル / 単調説明は避け、
// 「3 秒で塗装のみは錆びる／亜鉛メッキは守る」が伝わる構造。SVG ＋ Tailwind で
// レスポンシブ自然対応（横長 PC でも縦長スマホでも崩れない）。
function SacrificialProtectionDiagram() {
  return (
    <div className="w-full max-w-[920px] mx-auto py-2 sm:py-6 lg:py-10">
      {/* タイトル */}
      <div className="text-center mb-10 sm:mb-14 lg:mb-16">
        <div className="w-12 sm:w-16 h-px bg-gold mx-auto mb-4 sm:mb-5" />
        <p className="text-[10px] sm:text-[11px] tracking-[0.4em] text-gold mb-4 sm:mb-5">
          SACRIFICIAL PROTECTION
        </p>
        <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground leading-tight">
          犠牲防食のしくみ
        </h3>
        <p className="mt-5 sm:mt-6 text-[13px] sm:text-sm text-foreground/70 leading-relaxed max-w-xl mx-auto">
          なぜ塗装だけだと錆び、なぜメッキは守るのか。<br className="hidden sm:inline" />
          紫外線・水分・酸素にさらされる屋外で、何が起きているかを見てみましょう。
        </p>
      </div>

      {/* 左右対比：塗装側 / 亜鉛メッキ側 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-8">
        <PaintCorrosionDetail />
        <GalvanizedProtectionDetail />
      </div>

      {/* ボトムメッセージ */}
      <div className="text-center mt-12 sm:mt-16 lg:mt-20">
        <div className="w-12 sm:w-16 h-px bg-gold mx-auto mb-4 sm:mb-5" />
        <p className="text-[12px] sm:text-[13px] text-foreground/75 leading-relaxed">
          亜鉛が代わりに溶けて鉄を守り続ける
        </p>
        <p className="mt-2 font-serif text-base sm:text-lg text-gold tracking-wider">
          ＝ 犠牲防食
        </p>
      </div>
    </div>
  )
}

// ════════════ メカニズム詳細図解 — 塗装のみ ════════════
function PaintCorrosionDetail() {
  return (
    <div className="flex flex-col">
      <p className="text-center mb-4 sm:mb-5 text-[10px] sm:text-xs tracking-[0.3em] text-foreground/60 uppercase">
        塗装のみ
      </p>
      <div className="relative bg-white border border-border/50 rounded-md px-3 sm:px-5 py-4 sm:py-6">
        <svg
          viewBox="0 0 360 360"
          className="w-full h-auto"
          aria-label="塗装のみの場合：紫外線・水分・酸素が塗装を劣化させ、傷から鉄が錆びるメカニズム図解"
        >
          <defs>
            <marker id="paint-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0 0 L6 3 L0 6 Z" fill="#0E0E0E" />
            </marker>
            <radialGradient id="paint-sun" cx="0.45" cy="0.45" r="0.55">
              <stop offset="0%" stopColor="#FFF1A8" />
              <stop offset="50%" stopColor="#F2CC4D" />
              <stop offset="100%" stopColor="#E8A82C" />
            </radialGradient>
            <linearGradient id="paint-uv-beam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F2CC4D" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#F2CC4D" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="paint-iron" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3a4148" />
              <stop offset="40%" stopColor="#5a626a" />
              <stop offset="100%" stopColor="#262a30" />
            </linearGradient>
            <linearGradient id="paint-water" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7AC4E8" />
              <stop offset="60%" stopColor="#3F8FC0" />
              <stop offset="100%" stopColor="#1F5D8A" />
            </linearGradient>
            <radialGradient id="paint-oxygen" cx="0.32" cy="0.32" r="0.7">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="55%" stopColor="#DCEDF5" />
              <stop offset="100%" stopColor="#9CC5D9" />
            </radialGradient>
            <linearGradient id="paint-rust" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B2E20" />
              <stop offset="50%" stopColor="#A44434" />
              <stop offset="100%" stopColor="#6E2418" />
            </linearGradient>
            {/* 塗装（基本色：両ブロック共通。劣化の差はひび・斑点の量で表現） */}
            <linearGradient id="paint-layer" x1="0" y1="0" x2="0.3" y2="1">
              <stop offset="0%" stopColor="#DCDCD8" />
              <stop offset="45%" stopColor="#C8C6C0" />
              <stop offset="100%" stopColor="#A8A59F" />
            </linearGradient>
          </defs>

          {/* === 太陽（紫外線の発生源）+ 光線束 === */}
          {/* 太陽の放射スパイク（8 方向） */}
          <g stroke="#E8A82C" strokeWidth="2" strokeLinecap="round">
            <line x1="180" y1="2" x2="180" y2="10" />
            <line x1="180" y1="50" x2="180" y2="58" />
            <line x1="150" y1="30" x2="158" y2="30" />
            <line x1="202" y1="30" x2="210" y2="30" />
            <line x1="160" y1="10" x2="165" y2="15" />
            <line x1="195" y1="45" x2="200" y2="50" />
            <line x1="160" y1="50" x2="165" y2="45" />
            <line x1="195" y1="15" x2="200" y2="10" />
          </g>
          {/* 太陽本体 */}
          <circle cx="180" cy="30" r="22" fill="url(#paint-sun)" stroke="#C8A96E" strokeWidth="0.6" />
          {/* 紫外線の文字（太陽の上に重ねる） */}
          <text x="180" y="35" fontSize="13" textAnchor="middle" fill="#0E0E0E" fontWeight="700" letterSpacing="0.05em">
            紫外線
          </text>
          {/* 降り注ぐ光線束（太陽下端から塗装上面へ） */}
          <g stroke="#F2CC4D" strokeWidth="2.2" strokeLinecap="round" opacity="0.75">
            <line x1="166" y1="55" x2="160" y2="168" />
            <line x1="173" y1="55" x2="170" y2="168" />
            <line x1="180" y1="55" x2="180" y2="168" />
            <line x1="187" y1="55" x2="190" y2="168" />
            <line x1="194" y1="55" x2="200" y2="168" />
          </g>
          {/* 光線が当たる場所のフレア（塗装上面・薄い光の広がり） */}
          <ellipse cx="180" cy="172" rx="38" ry="4" fill="#F2CC4D" opacity="0.35" />

          {/* === 水分（左上、水滴 + 矢印で右下へ） === */}
          <text x="90" y="58" fontSize="13" textAnchor="middle" fill="#0E0E0E" fontWeight="600">
            水分
          </text>
          <path
            d="M90 75 Q78 90 78 105 Q78 122 90 122 Q102 122 102 105 Q102 90 90 75 Z"
            fill="url(#paint-water)"
            stroke="#1F5D8A"
            strokeWidth="0.8"
          />
          {/* 水滴ハイライト */}
          <ellipse cx="85" cy="94" rx="2.5" ry="5.5" fill="#FFFFFF" opacity="0.65" />
          <path d="M105 122 L155 168" stroke="#0E0E0E" strokeWidth="1.4" fill="none" markerEnd="url(#paint-arrow)" />

          {/* === 酸素（右上、O₂ 分子的に 2 つの球を連結） + 矢印で左下へ === */}
          <text x="270" y="58" fontSize="13" textAnchor="middle" fill="#0E0E0E" fontWeight="600">
            酸素
          </text>
          <circle cx="263" cy="98" r="13" fill="url(#paint-oxygen)" stroke="#5A8FAE" strokeWidth="0.8" />
          <circle cx="280" cy="108" r="11" fill="url(#paint-oxygen)" stroke="#5A8FAE" strokeWidth="0.8" />
          <path d="M260 120 L205 168" stroke="#0E0E0E" strokeWidth="1.4" fill="none" markerEnd="url(#paint-arrow)" />

          {/* === 塗装層（両ブロック共通の塗装基本色。劣化の差はひび・斑点の量で表現） === */}
          {/* 左ブロック：塗装層 fill（傷側エッジはギザギザに割れている。stroke なし） */}
          <path
            d="M30 175 L150 175 Q160 173 168 173 L162 180 L172 186 L162 193 L172 201 L160 209 L168 215 L30 215 Z"
            fill="url(#paint-layer)"
          />
          {/* 左ブロック：外周 stroke のみ（傷側のジグザグは除く） */}
          <path
            d="M168 173 Q160 173 150 175 L30 175 L30 215 L168 215"
            stroke="#0E0E0E"
            strokeWidth="0.8"
            fill="none"
          />
          {/* 左ブロック：微妙な劣化の斑点（軽度） */}
          <ellipse cx="60" cy="195" rx="14" ry="3" fill="#6B6660" opacity="0.15" />
          <ellipse cx="120" cy="200" rx="10" ry="2.5" fill="#6B6660" opacity="0.18" />
          <ellipse cx="90" cy="185" rx="7" ry="1.5" fill="#FFFFFF" opacity="0.25" />
          {/* 左ブロック：細いひび（少数） */}
          <path d="M70 180 L72 200" stroke="#6B6660" strokeWidth="0.4" opacity="0.55" fill="none" />
          <path d="M135 178 L140 205" stroke="#6B6660" strokeWidth="0.4" opacity="0.55" fill="none" />
          {/* 左ブロック：ラベル（左揃え） */}
          <text x="40" y="201" fontSize="13" textAnchor="start" fill="#1a1a1a" fontWeight="500">
            塗装層
          </text>

          {/* 右ブロック：塗装の劣化 fill（傷側エッジはギザギザに割れている。stroke なし） */}
          <path
            d="M192 173 Q200 173 210 175 L330 175 L330 215 L192 215 L184 209 L196 201 L186 193 L196 186 L186 180 Z"
            fill="url(#paint-layer)"
          />
          {/* 右ブロック：外周 stroke のみ（傷側のジグザグは除く） */}
          <path
            d="M192 173 Q200 173 210 175 L330 175 L330 215 L192 215"
            stroke="#0E0E0E"
            strokeWidth="0.8"
            fill="none"
          />
          {/* 右ブロック：劣化の斑点（多数・濃い） */}
          <ellipse cx="225" cy="185" rx="10" ry="2.5" fill="#3A3328" opacity="0.35" />
          <ellipse cx="260" cy="205" rx="14" ry="3" fill="#3A3328" opacity="0.32" />
          <ellipse cx="295" cy="190" rx="9" ry="2" fill="#3A3328" opacity="0.4" />
          <ellipse cx="240" cy="200" rx="6" ry="1.5" fill="#3A3328" opacity="0.35" />
          <ellipse cx="285" cy="208" rx="8" ry="1.8" fill="#3A3328" opacity="0.3" />
          {/* 右ブロック：ひびのネットワーク（密・深い） */}
          <path d="M210 180 L216 195 L213 210" stroke="#3A3328" strokeWidth="0.7" opacity="0.85" fill="none" />
          <path d="M245 178 L250 198 L246 213" stroke="#3A3328" strokeWidth="0.7" opacity="0.85" fill="none" />
          <path d="M280 176 L283 200 L286 212" stroke="#3A3328" strokeWidth="0.6" opacity="0.8" fill="none" />
          <path d="M312 180 L316 205" stroke="#3A3328" strokeWidth="0.6" opacity="0.75" fill="none" />
          {/* 右ブロック：枝分かれの細いひび */}
          <path d="M216 195 L222 198" stroke="#3A3328" strokeWidth="0.4" opacity="0.7" fill="none" />
          <path d="M250 198 L255 196" stroke="#3A3328" strokeWidth="0.4" opacity="0.7" fill="none" />
          <path d="M283 200 L289 198" stroke="#3A3328" strokeWidth="0.4" opacity="0.7" fill="none" />
          {/* 右ブロック：横方向のひび（剥がれかけ） */}
          <path d="M218 192 Q230 190 245 193 Q260 191 275 194 Q295 192 312 195" stroke="#3A3328" strokeWidth="0.5" opacity="0.65" fill="none" />
          <path d="M222 205 Q240 207 260 205 Q280 207 305 205" stroke="#3A3328" strokeWidth="0.4" opacity="0.55" fill="none" />
          {/* 右ブロック：ラベル（左揃え） */}
          <text x="200" y="201" fontSize="13" textAnchor="start" fill="#1a1a1a" fontWeight="500">
            塗装の劣化
          </text>

          {/* === 鉄層 === */}
          <rect x="30" y="218" width="300" height="80" fill="url(#paint-iron)" />
          {/* 鉄の光沢ハイライト（質感アップ） */}
          <line x1="30" y1="226" x2="330" y2="226" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.18" />
          <text x="40" y="270" fontSize="15" textAnchor="start" fill="#E5E7EB" fontWeight="500">
            鉄
          </text>

          {/* === 錆（塗装の表面に沿って広がる・塗装の中・鉄表面の 3 段構成） === */}
          {/* 1. 塗装の表面に沿って横に広がる錆（盛り上がりの周辺に絞る） */}
          {/* 1-a. 左半分：塗装層の上面・盛り上がり付近のみ */}
          <path
            d="M125 175 Q145 174 155 175 Q165 168 173 171 L173 177 Q165 173 155 177 Q145 178 125 177 Z"
            fill="#A44434"
            opacity="0.55"
          />
          {/* 1-b. 右半分：塗装の劣化の上面・盛り上がり付近のみ */}
          <path
            d="M187 171 Q195 168 205 174 Q215 174 235 175 Q235 178 215 178 Q195 178 187 177 Z"
            fill="#A44434"
            opacity="0.55"
          />
          {/* 1-c. 中央寄りの濃淡 */}
          <ellipse cx="145" cy="176" rx="14" ry="2" fill="#A44434" opacity="0.45" />
          <ellipse cx="215" cy="176" rx="14" ry="2" fill="#A44434" opacity="0.45" />
          {/* 1-d. 表面に染み出した小さな斑点（傷の周辺のみ） */}
          <circle cx="135" cy="175" r="1.4" fill="#A44434" opacity="0.7" />
          <circle cx="155" cy="174" r="1.5" fill="#A44434" opacity="0.75" />
          <circle cx="210" cy="174" r="1.5" fill="#A44434" opacity="0.75" />
          <circle cx="228" cy="175" r="1.4" fill="#A44434" opacity="0.7" />
          {/* 2. 割れたジグザグ塗装の隙間を通る錆（fill + 同色 stroke 2px でジグザグ境界を完全に覆う） */}
          <path
            d="M166 172 L160 180 L170 186 L160 193 L170 201 L158 209 L166 216 L194 216 L186 209 L198 201 L188 193 L198 186 L188 180 L194 172 Z"
            fill="url(#paint-rust)"
            stroke="#A44434"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* 3. 塗装の下端を錆色に変色（鉄との境界が腐食している証） */}
          <path
            d="M30 213 Q60 215 90 213 Q120 215 155 215 Q160 215 162 215 L155 218 L30 218 Z"
            fill="#7A2A20"
            opacity="0.65"
          />
          <path
            d="M198 215 Q200 215 205 215 Q240 215 270 213 Q300 215 330 213 L330 218 L205 218 Z"
            fill="#7A2A20"
            opacity="0.65"
          />
          {/* 4. 鉄表面に広がる錆の主体（上に上げて塗装下端の白い隙間を覆う） */}
          <path
            d="M138 214 Q145 209 158 211 Q170 208 185 210 Q200 208 215 211 Q228 209 240 214 Q250 220 248 232 Q244 246 232 250 Q215 256 200 254 Q180 258 162 252 Q142 246 134 234 Q130 222 138 214 Z"
            fill="url(#paint-rust)"
            stroke="#5C1E14"
            strokeWidth="0.6"
          />
          {/* 5. 鉄表面の凹凸（錆の盛り上がり線） */}
          <path
            d="M148 222 Q158 218 168 222 Q178 218 188 222 Q198 218 210 222 Q222 218 232 222"
            stroke="#5C1E14"
            strokeWidth="1"
            fill="none"
            opacity="0.6"
          />
          {/* 6. 錆の飛び散り（小さな斑点） */}
          <circle cx="128" cy="226" r="2.5" fill="#A44434" />
          <circle cx="124" cy="234" r="1.8" fill="#A44434" />
          <circle cx="254" cy="230" r="2.2" fill="#A44434" />
          <circle cx="258" cy="238" r="1.5" fill="#A44434" />
          <circle cx="115" cy="242" r="1.5" fill="#8B2E20" />
          <circle cx="265" cy="248" r="1.8" fill="#8B2E20" />
          {/* 7. 錆の縁の滲み（半透明の広がり） */}
          <ellipse cx="190" cy="235" rx="80" ry="22" fill="#A44434" opacity="0.15" />
          <text x="195" y="237" fontSize="13" textAnchor="middle" fill="#FFFFFF" fontWeight="700">
            さび
          </text>

          {/* === ボトムキャプション === */}
          <text x="180" y="332" fontSize="12" textAnchor="middle" fill="#A44434" fontWeight="600">
            塗膜が劣化 → 傷から水・酸素が侵入 → 鉄が錆びる
          </text>
        </svg>
      </div>
    </div>
  )
}

// ════════════ メカニズム詳細図解 — 亜鉛メッキ ════════════
function GalvanizedProtectionDetail() {
  return (
    <div className="flex flex-col">
      <p className="text-center mb-4 sm:mb-5 text-[10px] sm:text-xs tracking-[0.3em] text-foreground/60 uppercase">
        亜鉛メッキ
      </p>
      <div className="relative bg-white border border-border/50 rounded-md px-3 sm:px-5 py-4 sm:py-6">
        <svg
          viewBox="0 0 360 360"
          className="w-full h-auto"
          aria-label="亜鉛メッキの場合：紫外線・水分・酸素が降り注いでも、亜鉛が犠牲となって鉄を守るメカニズム図解"
        >
          <defs>
            <marker id="gal-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0 0 L6 3 L0 6 Z" fill="#0E0E0E" />
            </marker>
            <marker id="gal-gold-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0 0 L6 3 L0 6 Z" fill="#C8A96E" />
            </marker>
            <radialGradient id="gal-sun" cx="0.45" cy="0.45" r="0.55">
              <stop offset="0%" stopColor="#FFF1A8" />
              <stop offset="50%" stopColor="#F2CC4D" />
              <stop offset="100%" stopColor="#E8A82C" />
            </radialGradient>
            <linearGradient id="gal-iron" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3a4148" />
              <stop offset="40%" stopColor="#5a626a" />
              <stop offset="100%" stopColor="#262a30" />
            </linearGradient>
            <linearGradient id="gal-water" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7AC4E8" />
              <stop offset="60%" stopColor="#3F8FC0" />
              <stop offset="100%" stopColor="#1F5D8A" />
            </linearGradient>
            <radialGradient id="gal-oxygen" cx="0.32" cy="0.32" r="0.7">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="55%" stopColor="#DCEDF5" />
              <stop offset="100%" stopColor="#9CC5D9" />
            </radialGradient>
            {/* 塗装（亜鉛メッキ側も同じ塗装基本色） */}
            <linearGradient id="gal-paint-layer" x1="0" y1="0" x2="0.3" y2="1">
              <stop offset="0%" stopColor="#DCDCD8" />
              <stop offset="45%" stopColor="#C8C6C0" />
              <stop offset="100%" stopColor="#A8A59F" />
            </linearGradient>
          </defs>

          {/* === 太陽（紫外線の発生源）+ 光線束 === */}
          <g stroke="#E8A82C" strokeWidth="2" strokeLinecap="round">
            <line x1="180" y1="2" x2="180" y2="10" />
            <line x1="180" y1="50" x2="180" y2="58" />
            <line x1="150" y1="30" x2="158" y2="30" />
            <line x1="202" y1="30" x2="210" y2="30" />
            <line x1="160" y1="10" x2="165" y2="15" />
            <line x1="195" y1="45" x2="200" y2="50" />
            <line x1="160" y1="50" x2="165" y2="45" />
            <line x1="195" y1="15" x2="200" y2="10" />
          </g>
          <circle cx="180" cy="30" r="22" fill="url(#gal-sun)" stroke="#C8A96E" strokeWidth="0.6" />
          <text x="180" y="35" fontSize="13" textAnchor="middle" fill="#0E0E0E" fontWeight="700" letterSpacing="0.05em">
            紫外線
          </text>
          {/* 降り注ぐ光線束（太陽下端から純亜鉛層上面へ） */}
          <g stroke="#F2CC4D" strokeWidth="2.2" strokeLinecap="round" opacity="0.75">
            <line x1="166" y1="55" x2="160" y2="168" />
            <line x1="173" y1="55" x2="170" y2="168" />
            <line x1="180" y1="55" x2="180" y2="168" />
            <line x1="187" y1="55" x2="190" y2="168" />
            <line x1="194" y1="55" x2="200" y2="168" />
          </g>
          {/* 光線が当たる場所のフレア（塗装層上面） */}
          <ellipse cx="180" cy="173" rx="38" ry="4" fill="#F2CC4D" opacity="0.35" />

          {/* === 水分（左上） === */}
          <text x="90" y="58" fontSize="13" textAnchor="middle" fill="#0E0E0E" fontWeight="600">
            水分
          </text>
          <path
            d="M90 75 Q78 90 78 105 Q78 122 90 122 Q102 122 102 105 Q102 90 90 75 Z"
            fill="url(#gal-water)"
            stroke="#1F5D8A"
            strokeWidth="0.8"
          />
          {/* 水滴ハイライト */}
          <ellipse cx="85" cy="94" rx="2.5" ry="5.5" fill="#FFFFFF" opacity="0.65" />
          <path d="M105 122 L155 168" stroke="#0E0E0E" strokeWidth="1.4" fill="none" markerEnd="url(#gal-arrow)" />

          {/* === 酸素（右上、O₂ 分子的に 2 つの球を連結） === */}
          <text x="270" y="58" fontSize="13" textAnchor="middle" fill="#0E0E0E" fontWeight="600">
            酸素
          </text>
          <circle cx="263" cy="98" r="13" fill="url(#gal-oxygen)" stroke="#5A8FAE" strokeWidth="0.8" />
          <circle cx="280" cy="108" r="11" fill="url(#gal-oxygen)" stroke="#5A8FAE" strokeWidth="0.8" />
          <path d="M260 120 L205 168" stroke="#0E0E0E" strokeWidth="1.4" fill="none" markerEnd="url(#gal-arrow)" />

          {/* === 純亜鉛層（薄青グレー、塗装層が割れた部分でも露出するため上方向に伸ばす） === */}
          <rect x="30" y="189" width="300" height="14" fill="#B8C5D1" stroke="#0E0E0E" strokeWidth="0.8" />
          <text x="40" y="199" fontSize="11" textAnchor="start" fill="#0E0E0E">
            純亜鉛層
          </text>

          {/* === 鉄-亜鉛合金層（中青グレー） === */}
          <rect x="30" y="203" width="300" height="14" fill="#6F7A8A" stroke="#0E0E0E" strokeWidth="0.8" />
          <text x="40" y="213" fontSize="11" textAnchor="start" fill="#FFFFFF">
            合金層
          </text>

          {/* === 塗装層左ブロック fill（傷側エッジはジグザグに割れている） === */}
          <path
            d="M30 175 L155 175 Q163 173 170 173 L165 179 L173 185 L168 189 L30 189 Z"
            fill="url(#gal-paint-layer)"
          />
          {/* 塗装層左ブロック：外周のみ stroke（傷側ジグザグは除く） */}
          <path
            d="M170 173 Q163 173 155 175 L30 175 L30 189 L168 189"
            stroke="#0E0E0E"
            strokeWidth="0.8"
            fill="none"
          />

          {/* === 塗装層右ブロック fill === */}
          <path
            d="M190 173 Q197 173 205 175 L330 175 L330 189 L192 189 L187 185 L195 179 Z"
            fill="url(#gal-paint-layer)"
          />
          {/* 塗装層右ブロック：外周のみ stroke */}
          <path
            d="M190 173 Q197 173 205 175 L330 175 L330 189 L192 189"
            stroke="#0E0E0E"
            strokeWidth="0.8"
            fill="none"
          />

          {/* 塗装層の隙間に純亜鉛層が露出（割れた隙間。塗装エッジに 1px 食い込ませて隙間を消す） */}
          <path
            d="M168 172 L163 179 L171 185 L166 190 L194 190 L189 185 L197 179 L192 172 Z"
            fill="#B8C5D1"
          />

          {/* 塗装層の劣化（薄い斑点：左右ブロック内のみ） */}
          <ellipse cx="80" cy="183" rx="10" ry="1.5" fill="#6B6660" opacity="0.2" />
          <ellipse cx="130" cy="184" rx="12" ry="1.6" fill="#6B6660" opacity="0.2" />
          <ellipse cx="225" cy="183" rx="11" ry="1.5" fill="#6B6660" opacity="0.2" />
          <ellipse cx="285" cy="184" rx="10" ry="1.5" fill="#6B6660" opacity="0.2" />
          {/* 塗装層の細いひび（左右ブロック内のみ） */}
          <path d="M55 177 L57 188" stroke="#6B6660" strokeWidth="0.4" opacity="0.55" fill="none" />
          <path d="M105 177 L107 188" stroke="#6B6660" strokeWidth="0.4" opacity="0.55" fill="none" />
          <path d="M210 177 L213 188" stroke="#6B6660" strokeWidth="0.4" opacity="0.55" fill="none" />
          <path d="M260 177 L263 188" stroke="#6B6660" strokeWidth="0.4" opacity="0.55" fill="none" />
          <text x="40" y="185" fontSize="11" textAnchor="start" fill="#1a1a1a">
            塗装層
          </text>


          {/* === 鉄層（無傷、合金層と隙間なく接続 y=217） === */}
          <rect x="30" y="217" width="300" height="81" fill="url(#gal-iron)" />
          {/* 鉄の光沢ハイライト（質感アップ） */}
          <line x1="30" y1="225" x2="330" y2="225" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.18" />
          <text x="40" y="265" fontSize="15" textAnchor="start" fill="#E5E7EB" fontWeight="500">
            鉄
          </text>
          {/* ✓ チェックマーク（鉄が守られている証） */}
          <text x="270" y="265" fontSize="32" textAnchor="middle" fill="#C8A96E" fontWeight="600">
            ✓
          </text>

          {/* === ボトムキャプション === */}
          <text x="180" y="332" fontSize="12" textAnchor="middle" fill="#C8A96E" fontWeight="600">
            亜鉛が先に犠牲となる → 鉄は錆びない
          </text>
        </svg>
      </div>
    </div>
  )
}

// ════════════ SVG: 工程アイコン（4種） ════════════
function ProcessIcon({ kind }: { kind: "forge" | "dip" | "polish" | "spray" }) {
  const stroke = "#c8a96e"
  if (kind === "forge") {
    return (
      <svg viewBox="0 0 64 64" className="w-12 h-12">
        {/* 火花 */}
        <circle cx="42" cy="14" r="1.5" fill={stroke} />
        <circle cx="48" cy="20" r="1" fill={stroke} opacity="0.7" />
        <circle cx="38" cy="22" r="1" fill={stroke} opacity="0.5" />
        {/* ハンマーの柄 */}
        <line x1="14" y1="56" x2="36" y2="22" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        {/* ハンマーの頭 */}
        <rect x="30" y="14" width="20" height="10" rx="1.5" fill="none" stroke={stroke} strokeWidth="2" transform="rotate(40 40 19)" />
        {/* 鉄床 */}
        <path d="M8,52 L20,40 L48,40 L60,52 Z" fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
        <line x1="8" y1="52" x2="60" y2="52" stroke={stroke} strokeWidth="2" />
      </svg>
    )
  }
  if (kind === "dip") {
    return (
      <svg viewBox="0 0 64 64" className="w-12 h-12">
        {/* 浴槽 */}
        <path d="M10,30 L10,52 Q10,56 14,56 L50,56 Q54,56 54,52 L54,30" fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
        <line x1="6" y1="30" x2="58" y2="30" stroke={stroke} strokeWidth="2" />
        {/* 液体亜鉛（波） */}
        <path d="M14,38 Q20,35 26,38 T38,38 T50,38" fill="none" stroke={stroke} strokeWidth="1.2" opacity="0.7" />
        {/* フックで降ろす鉄 */}
        <line x1="32" y1="6" x2="32" y2="22" stroke={stroke} strokeWidth="1.5" />
        <path d="M32,22 L28,26 L36,26 Z" fill={stroke} />
        <rect x="28" y="26" width="8" height="8" fill="none" stroke={stroke} strokeWidth="1.5" />
        {/* 温度表記 */}
        <text x="56" y="22" textAnchor="end" fill={stroke} fontSize="8" fontWeight="600">450℃</text>
      </svg>
    )
  }
  if (kind === "polish") {
    return (
      <svg viewBox="0 0 64 64" className="w-12 h-12">
        {/* 研磨パッド */}
        <rect x="14" y="22" width="36" height="14" rx="3" fill="none" stroke={stroke} strokeWidth="2" />
        <line x1="20" y1="29" x2="44" y2="29" stroke={stroke} strokeWidth="1" opacity="0.5" />
        {/* 持ち手 */}
        <line x1="32" y1="22" x2="32" y2="12" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        <circle cx="32" cy="10" r="3" fill="none" stroke={stroke} strokeWidth="1.5" />
        {/* 研磨対象（板） */}
        <line x1="6" y1="44" x2="58" y2="44" stroke={stroke} strokeWidth="2" />
        {/* 動きの線 */}
        <path d="M16,52 L22,52" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        <path d="M28,52 L34,52" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        <path d="M40,52 L46,52" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      </svg>
    )
  }
  // spray
  return (
    <svg viewBox="0 0 64 64" className="w-12 h-12">
      {/* スプレーガン本体 */}
      <rect x="10" y="20" width="22" height="14" rx="2" fill="none" stroke={stroke} strokeWidth="2" />
      <path d="M22,34 L22,46 L26,46 L26,34" fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="14" cy="14" r="4" fill="none" stroke={stroke} strokeWidth="1.5" />
      <line x1="14" y1="18" x2="14" y2="20" stroke={stroke} strokeWidth="1.5" />
      {/* ノズル */}
      <line x1="32" y1="27" x2="38" y2="27" stroke={stroke} strokeWidth="2" />
      {/* 噴射 */}
      <path d="M40,22 L52,18 M40,27 L54,27 M40,32 L52,36" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <circle cx="50" cy="20" r="0.8" fill={stroke} />
      <circle cx="56" cy="27" r="0.8" fill={stroke} />
      <circle cx="50" cy="34" r="0.8" fill={stroke} />
    </svg>
  )
}

// ════════════ SVG: 耐久性タイムライン ════════════
function DurabilityTimeline() {
  // 各レーンの状態を 0-20 年でセグメント化
  return (
    <svg viewBox="0 0 800 280" className="w-full h-auto">
      <defs>
        <linearGradient id="paint-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6a9a6a" />
          <stop offset="40%" stopColor="#7aa05a" />
          <stop offset="55%" stopColor="#a89040" />
          <stop offset="80%" stopColor="#b06840" />
          <stop offset="100%" stopColor="#a04030" />
        </linearGradient>
        <linearGradient id="ado-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6a9a6a" />
          <stop offset="60%" stopColor="#7aa07a" />
          <stop offset="80%" stopColor="#a09060" />
          <stop offset="100%" stopColor="#b08050" />
        </linearGradient>
      </defs>

      <text x="400" y="30" textAnchor="middle" fill="#1a1a1a" fontSize="15" fontWeight="700">
        屋外設置から経過年数別のコンディション
      </text>

      {/* 年マーカー（背景） */}
      {[0, 5, 10, 15, 20].map((y) => {
        const x = 80 + (y / 20) * 640
        return (
          <g key={y}>
            <line x1={x} y1="60" x2={x} y2="240" stroke="#999" strokeDasharray="2 4" strokeWidth="0.5" />
            <text x={x} y="258" textAnchor="middle" fill="#1a1a1a" fontSize="13" fontWeight="600">
              {y}年
            </text>
          </g>
        )
      })}

      {/* === レーン1: 2 液型のみ === */}
      <text x="76" y="92" textAnchor="end" fill="#1a1a1a" fontSize="13" fontWeight="700">2 液型のみ</text>
      <text x="76" y="107" textAnchor="end" fill="#555" fontSize="11">（ado 屋内標準）</text>
      <rect x="80" y="80" width="640" height="32" rx="4" fill="url(#paint-gradient)" opacity="0.85" />
      {/* マイルストーン */}
      <g>
        <circle cx="80" cy="96" r="4" fill="#6a9a6a" stroke="#0e0e0e" strokeWidth="2" />
        <text x="80" y="72" textAnchor="middle" fill="#1a1a1a" fontSize="12" fontWeight="600">設置直後</text>

        <circle cx={80 + 640 * 5 / 20} cy="96" r="4" fill="#7aa05a" stroke="#0e0e0e" strokeWidth="2" />
        <text x={80 + 640 * 5 / 20} y="72" textAnchor="middle" fill="#1a1a1a" fontSize="12" fontWeight="600">5年・問題なし</text>

        <circle cx={80 + 640 * 8 / 20} cy="96" r="4" fill="#a89040" stroke="#0e0e0e" strokeWidth="2" />
        <text x={80 + 640 * 8 / 20} y="72" textAnchor="middle" fill="#1a1a1a" fontSize="12" fontWeight="600">部分補修を始めるころ</text>

        <circle cx={80 + 640 * 14 / 20} cy="96" r="4" fill="#b06840" stroke="#0e0e0e" strokeWidth="2" />
        <text x={80 + 640 * 14 / 20} y="72" textAnchor="middle" fill="#a04030" fontSize="12" fontWeight="700">塗り直しを検討</text>
      </g>

      {/* === レーン2: 2 液型 + メッキ === */}
      <text x="76" y="162" textAnchor="end" fill="#1a1a1a" fontSize="13" fontWeight="700">2 液型 ＋ メッキ</text>
      <text x="76" y="177" textAnchor="end" fill="#555" fontSize="11">（ado 屋外標準）</text>
      <rect x="80" y="150" width="640" height="32" rx="4" fill="url(#ado-gradient)" opacity="0.9" />
      {/* マイルストーン */}
      <g>
        <circle cx="80" cy="166" r="4" fill="#6a9a6a" stroke="#0e0e0e" strokeWidth="2" />
        <text x="80" y="208" textAnchor="middle" fill="#1a1a1a" fontSize="12" fontWeight="600">設置直後</text>

        <circle cx={80 + 640 * 10 / 20} cy="166" r="4" fill="#7aa07a" stroke="#0e0e0e" strokeWidth="2" />
        <text x={80 + 640 * 10 / 20} y="208" textAnchor="middle" fill="#1a6a3a" fontSize="12" fontWeight="700">10年経過、まだ綺麗</text>

        <circle cx={80 + 640 * 15 / 20} cy="166" r="4" fill="#a09060" stroke="#0e0e0e" strokeWidth="2" />
        <text x={80 + 640 * 15 / 20} y="208" textAnchor="middle" fill="#1a1a1a" fontSize="12" fontWeight="600">塗装の小傷を補修</text>

        <circle cx={80 + 640 * 20 / 20} cy="166" r="4" fill="#b08050" stroke="#0e0e0e" strokeWidth="2" />
        <text x={80 + 640 * 20 / 20} y="208" textAnchor="middle" fill="#1a1a1a" fontSize="12" fontWeight="600">メッキ層で保護継続</text>
      </g>

      {/* 参考線・凡例 */}
      <text x="400" y="232" textAnchor="middle" fill="#333" fontSize="12" fontWeight="500">
        ※ 設置環境・気候により実績は変動します。1 液型塗装の場合は 1〜3 年で錆発生
      </text>
    </svg>
  )
}

// ════════════ SVG: 性能レーダーチャート ════════════
function PerformanceRadar() {
  const cx = 200
  const cy = 200
  const axes = ["耐久性", "塩害耐性", "紫外線耐性", "メンテ性", "10年トータル経済性"]
  const angles = axes.map((_, i) => -Math.PI / 2 + (2 * Math.PI * i) / axes.length)
  // 2 液型ウレタンのみ（ado 屋内・軒下標準）
  const paintScores = [4, 3, 3, 3, 4]
  // 2 液型 ＋ 亜鉛メッキ（ado 屋外標準）
  const adoScores = [5, 5, 4, 5, 5]
  const maxR = 130

  const polygonPoints = (scores: number[]) =>
    scores
      .map((s, i) => {
        const r = (s / 5) * maxR
        const x = cx + r * Math.cos(angles[i])
        const y = cy + r * Math.sin(angles[i])
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(" ")

  return (
    <svg viewBox="-40 0 480 400" className="w-full h-auto max-w-md mx-auto">
      <text x="200" y="24" textAnchor="middle" fill="#1a1a1a" fontSize="15" fontWeight="700">
        屋外用途での性能比較
      </text>

      {/* グリッド（5重ペンタゴン） */}
      {[1, 2, 3, 4, 5].map((step) => {
        const r = (step / 5) * maxR
        const points = angles
          .map((a) => `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`)
          .join(" ")
        return <polygon key={step} points={points} fill="none" stroke="#bbb" strokeWidth="0.5" />
      })}

      {/* 軸線 */}
      {angles.map((a, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={cx + maxR * Math.cos(a)}
          y2={cy + maxR * Math.sin(a)}
          stroke="#bbb"
          strokeWidth="0.5"
        />
      ))}

      {/* 2 液型のみ（屋内・軒下） */}
      <polygon
        points={polygonPoints(paintScores)}
        fill="#a07840"
        fillOpacity="0.22"
        stroke="#c89060"
        strokeWidth="1.5"
      />

      {/* ado 二重防錆 */}
      <polygon
        points={polygonPoints(adoScores)}
        fill="#c8a96e"
        fillOpacity="0.25"
        stroke="#c8a96e"
        strokeWidth="2"
      />

      {/* 軸ラベル */}
      {axes.map((label, i) => {
        const a = angles[i]
        const r = maxR + 24
        const x = cx + r * Math.cos(a)
        const y = cy + r * Math.sin(a)
        return (
          <text
            key={label}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#1a1a1a"
            fontSize="13"
            fontWeight="700"
          >
            {label}
          </text>
        )
      })}

      {/* 凡例 */}
      <g transform="translate(20 370)">
        <rect x="0" y="-10" width="14" height="14" fill="#c8a96e" fillOpacity="0.25" stroke="#c8a96e" strokeWidth="1.5" />
        <text x="22" y="0" fill="#1a1a1a" fontSize="12" fontWeight="600">2液型 ＋ メッキ（屋外）</text>
        <rect x="200" y="-10" width="14" height="14" fill="#a07840" fillOpacity="0.22" stroke="#c89060" strokeWidth="1.5" />
        <text x="222" y="0" fill="#555" fontSize="12" fontWeight="600">2液型のみ（屋内）</text>
      </g>
    </svg>
  )
}

// ════════════ お客様アバター（Case ごとに違う人物） ════════════
function PersonAvatar({ kind }: { kind: number }) {
  if (kind === 0) {
    // Case 01: 沿岸部のシニア男性風（青ベース）
    return (
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#DDE9F0] border-2 border-[#5A8FAE] overflow-hidden shrink-0">
        <svg viewBox="0 0 40 40" className="w-full h-full" aria-hidden="true">
          {/* 髪（白髪短髪） */}
          <ellipse cx="20" cy="13" rx="9" ry="5" fill="#B8C5D1" />
          {/* 顔 */}
          <circle cx="20" cy="19" r="8.5" fill="#F5DCC0" />
          {/* 目 */}
          <circle cx="17" cy="19" r="0.9" fill="#333" />
          <circle cx="23" cy="19" r="0.9" fill="#333" />
          {/* 眉 */}
          <line x1="15.5" y1="16.5" x2="18.2" y2="16.8" stroke="#666" strokeWidth="0.8" strokeLinecap="round" />
          <line x1="21.8" y1="16.8" x2="24.5" y2="16.5" stroke="#666" strokeWidth="0.8" strokeLinecap="round" />
          {/* 口（軽い笑顔） */}
          <path d="M17 23 Q20 24.5 23 23" stroke="#333" strokeWidth="0.8" fill="none" strokeLinecap="round" />
          {/* 首・肩（青いシャツ） */}
          <path d="M11 33 Q12 28 15 27.5 L25 27.5 Q28 28 29 33 L29 40 L11 40 Z" fill="#5A8FAE" />
        </svg>
      </div>
    )
  }
  // Case 02: アプローチ手すりを検討する女性（暖色ベース）
  return (
    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#F5E8D8] border-2 border-[#C97B5A] overflow-hidden shrink-0">
      <svg viewBox="0 0 40 40" className="w-full h-full" aria-hidden="true">
        {/* 髪（黒髪ロング） */}
        <path d="M11 14 Q11 8 20 8 Q29 8 29 14 L29 28 L26 26 L26 19 L14 19 L14 26 L11 28 Z" fill="#3A2A1F" />
        {/* 顔 */}
        <circle cx="20" cy="20" r="8" fill="#FAE3C9" />
        {/* 目 */}
        <ellipse cx="17" cy="20" rx="0.9" ry="1.2" fill="#333" />
        <ellipse cx="23" cy="20" rx="0.9" ry="1.2" fill="#333" />
        {/* 眉（細い） */}
        <path d="M15.5 17.5 Q17 17 18.2 17.3" stroke="#3A2A1F" strokeWidth="0.6" fill="none" strokeLinecap="round" />
        <path d="M21.8 17.3 Q23 17 24.5 17.5" stroke="#3A2A1F" strokeWidth="0.6" fill="none" strokeLinecap="round" />
        {/* 口（笑顔・口紅） */}
        <path d="M17.5 23.5 Q20 25 22.5 23.5" stroke="#A04030" strokeWidth="1" fill="none" strokeLinecap="round" />
        {/* 首・肩（オレンジトップス） */}
        <path d="M11 33 Q12 28 15 27.5 L25 27.5 Q28 28 29 33 L29 40 L11 40 Z" fill="#C97B5A" />
      </svg>
    </div>
  )
}

// ════════════ ●○ 評価バー ════════════
function StarBar({ level, color }: { level: number; color: "muted" | "gold" }) {
  return (
    <span className={`inline-flex gap-0.5 ${color === "gold" ? "text-gold" : "text-muted-foreground/60"}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className="text-[10px]">{n <= level ? "●" : "○"}</span>
      ))}
    </span>
  )
}


export default function GalvanizingPage() {
  return (
    <>
      <Header />
      <main className="pt-16 lg:pt-20 pb-20 bg-background">
        {/* ════════════ Hero — Asymmetric ════════════ */}
        <section className="border-b border-border">
          <div className="grid lg:grid-cols-12 lg:min-h-[60vh]">
            {/* Left: Text */}
            <div className="lg:col-span-6 px-5 lg:px-12 py-14 lg:py-24 flex flex-col justify-center">
              <p className="text-[11px] tracking-[0.5em] uppercase text-gold mb-6">Why Galvanizing?</p>
              <h1 className="font-serif font-light leading-tight mb-6 tracking-tight">
                <span className="block text-3xl sm:text-4xl lg:text-5xl text-foreground mb-2">
                  あなたの暮らしを、
                </span>
                <span className="flex items-baseline">
                  <span className="text-6xl sm:text-7xl lg:text-[6.5rem] xl:text-[7.5rem] text-gold leading-none tracking-[-0.04em]">
                    長く
                  </span>
                  <span className="text-3xl sm:text-4xl lg:text-[2.5rem] xl:text-5xl text-foreground ml-1 sm:ml-1.5 lg:ml-2">
                    守るために。
                  </span>
                </span>
              </h1>
              <div className="mb-8 flex items-center gap-3">
                <span className="relative inline-block shrink-0">
                  {/* ゴールド外枠（少しオフセット） */}
                  <span className="absolute -top-1 -left-1 -bottom-1 -right-1 border-2 border-gold pointer-events-none" aria-hidden="true" />
                  {/* 黒ベタ + 白文字 */}
                  <span className="relative inline-block bg-foreground text-white font-bold text-base sm:text-lg lg:text-xl px-4 sm:px-5 py-2 sm:py-2.5 leading-snug tracking-wide">
                    屋外でも錆びない、<span className="text-white">ado の</span><span className="text-gold">二重防錆。</span>
                  </span>
                </span>
                {/* 右側に伸びるゴールド装飾線（白空白の解消） */}
                <span className="flex-1 h-px bg-gold/40" aria-hidden="true" />
              </div>
              <p className="text-[15px] lg:text-[16px] leading-[1.9] text-foreground/80 max-w-md">
                橋梁・鉄塔と同じ防錆技術 — 溶融亜鉛メッキ ＋ 2 液型ウレタン塗装。
                <br className="hidden lg:block" />
                10 年以上、屋外で錆びずに、暮らしを支え続けます。
              </p>
            </div>
            {/* Right: Hero photo */}
            <div className="lg:col-span-6 relative aspect-[3/2] lg:aspect-auto bg-secondary">
              <Image
                src="/images/process/galvanizing-hero.jpg"
                alt="450℃ の亜鉛浴に鉄製フレームを浸漬している様子"
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
          <div className="max-w-[1200px] mx-auto px-5 lg:px-8 py-12 lg:py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-10">
              {stats.map((s) => {
                const isWord = /[぀-ヿ一-鿿A-Z]/.test(s.value)
                return (
                  <div key={s.label} className="text-center md:text-left">
                    <div className="flex items-baseline justify-center md:justify-start gap-1">
                      <span className={`font-serif text-gold leading-none ${isWord ? "text-3xl lg:text-4xl" : "text-5xl lg:text-6xl"}`}>
                        {s.value}
                      </span>
                      <span className="text-[14px] lg:text-base text-gold/80 font-semibold">{s.unit}</span>
                    </div>
                    <p className="text-[13px] lg:text-sm font-bold text-foreground mt-2">{s.label}</p>
                    <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">{s.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ════════════ Sub-hero centered statement ════════════ */}
        <section className="relative max-w-[880px] mx-auto px-5 lg:px-8 py-20 lg:py-32 text-center overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[600px] aspect-square rounded-full bg-gold/[0.05] pointer-events-none" />
          <p className="relative font-serif text-xl sm:text-2xl lg:text-4xl leading-[1.75] lg:leading-[1.7] text-foreground">
            屋外でも、塩害でも、紫外線でも、
            <br />
            錆びない手すりを。
          </p>
          <div className="relative mt-8 lg:mt-10 flex flex-col items-center gap-5">
            {/* マーカー風アンダーライン（薄ゴールド、少し斜め） */}
            <span className="relative inline-block font-serif text-lg sm:text-xl lg:text-2xl text-foreground">
              <span className="absolute inset-x-0 bottom-0 h-[0.5em] bg-gold/40 -skew-x-3 -z-0" aria-hidden="true" />
              <span className="relative z-10">
                <span className="text-gold">メッキ ＋ 塗装</span>の二重防錆で
              </span>
            </span>
            <p className="text-lg sm:text-xl lg:text-2xl font-serif text-foreground leading-[1.5]">
              <span className="font-serif text-gold text-5xl sm:text-6xl lg:text-7xl align-middle leading-none">10 年以上</span>
              <span className="ml-1.5">の安心を、お届け。</span>
            </p>
          </div>
        </section>

        {/* ════════════ Story — メッキを内側から知る職人 ════════════ */}
        <section id="craftsman" className="border-y border-border bg-background py-20 lg:py-28">
          <div className="max-w-[1200px] mx-auto px-5 lg:px-8 grid lg:grid-cols-12 gap-8 lg:gap-12">
            <aside className="lg:col-span-3">
              <div className="lg:sticky lg:top-24">
                <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">Story</p>
                <h2 className="font-serif text-3xl lg:text-5xl text-foreground leading-none">
                  メッキを<br />内側から
                </h2>
                <p className="text-[12px] text-muted-foreground mt-3">なぜ鍛冶屋がメッキを語れるのか</p>
              </div>
            </aside>
            <div className="lg:col-span-9 scroll-mt-24 min-w-0">
              <h3 className="font-serif text-xl lg:text-3xl text-foreground mb-6 leading-snug">
                メッキ工程を 10 年、現場監督として。
              </h3>
              <div className="space-y-5 mb-8 max-w-2xl">
                <p className="text-[15px] leading-[1.95] text-foreground/80">
                  表面処理の自動機械を手がける会社で十年、現場監督として、設計・製造から、実際にメッキが施される工程までを統括してきました。鉄を錆から守る「メッキ」を、装置の内側から知り尽くしています。
                </p>
                <p className="text-[15px] leading-[1.95] text-foreground/80">
                  だから ado は、設置場所の環境から「何年先まで守るか」を逆算し、メッキと塗装の仕様を商品ごとに選び抜きます。作って終わりにしない。それが、防錆を知る鍛冶屋のものづくりです。
                </p>
              </div>
              <Link
                href="/paint"
                className="inline-block text-[11px] tracking-[0.2em] uppercase text-gold border-b border-gold hover:opacity-70 transition-opacity"
              >
                塗装のこだわりについて →
              </Link>
            </div>
          </div>
        </section>

        {/* ════════════ Section 01 — Outline ════════════ */}
        <section id="outline" className="border-y border-border bg-card/20 py-20 lg:py-28">
          <div className="max-w-[1200px] mx-auto px-5 lg:px-8 grid lg:grid-cols-12 gap-8 lg:gap-12">
            <aside className="lg:col-span-3">
              <div className="lg:sticky lg:top-24">
                <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">Section 01</p>
                <h2 className="font-serif text-3xl lg:text-5xl text-foreground leading-none">Outline</h2>
                <p className="text-[12px] text-muted-foreground mt-3">溶融亜鉛メッキとは</p>
              </div>
            </aside>
            <div className="lg:col-span-9 scroll-mt-24 min-w-0">
              <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground mb-8 leading-[1.3]">
                亜鉛が鉄と<span className="text-gold">化学結合</span>し、<br className="hidden lg:block" />
                犠牲防食で守り続ける。
              </h3>
              <div className="space-y-5 mb-10 max-w-2xl">
                <p className="text-[15px] lg:text-base leading-[1.9] text-foreground/85">
                  溶融亜鉛メッキ（ドブ漬けメッキ）は、約 <strong className="text-gold font-bold">450℃</strong> に溶かした亜鉛の浴槽に
                  鉄製品を丸ごと浸漬する処理です。鉄表面に
                  <strong className="text-gold">亜鉛と鉄の合金層</strong>が形成され、
                  化学結合により剥がれにくく耐久性に優れます。
                </p>
                <p className="text-[15px] lg:text-base leading-[1.9] text-foreground/85">
                  単なる塗装と異なり、傷がついても周囲の亜鉛が先に溶けて鉄を守る
                  <strong className="text-gold">「犠牲防食」</strong>が働きます。
                  <strong className="text-foreground">橋梁・鉄塔・ガードレール</strong>など、屋外インフラで広く採用されている信頼性の高い技術です。
                </p>
              </div>
              {/* 結論を印鑑風円形バッジで強調 */}
              <div className="mb-10 flex items-center gap-4">
                <span className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gold/15 border-2 border-gold shrink-0">
                  <span className="font-black text-gold text-base sm:text-lg leading-tight text-center">
                    剥がれ<br />ない
                  </span>
                </span>
                <p className="text-[15px] sm:text-base lg:text-lg font-bold text-foreground leading-snug">
                  化学結合した亜鉛は<br className="sm:hidden" />
                  <span className="text-gold">物理的に剥がせない</span>
                </p>
              </div>
              <div className="border border-border bg-white rounded-md p-5 sm:p-8 lg:p-10">
                <SacrificialProtectionDiagram />
              </div>
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
                <p className="text-[12px] text-muted-foreground mt-3">二重防錆の 4 工程</p>
              </div>
            </aside>
            <div className="lg:col-span-9 scroll-mt-24 min-w-0">
              <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground mb-8 leading-[1.3]">
                製作からお届けまで、<br className="hidden lg:block" />
                すべて<span className="relative inline-block">
                  <span className="absolute inset-x-0 bottom-0 h-[0.45em] bg-gold/40 -skew-x-3 -z-0" aria-hidden="true" />
                  <span className="relative z-10 text-gold">一貫</span>
                </span>して行います。
              </h3>
              <p className="text-[15px] lg:text-base leading-[1.9] text-foreground/85 mb-10 max-w-2xl">
                <strong className="text-foreground">鍛冶職人が一点ずつ手作業</strong>で製作した手すりを、専用工場で溶融亜鉛メッキ処理。
                その上から 2 液型ウレタン塗装で美しく仕上げます。
              </p>

              {/* Process stage rows */}
              <div className="space-y-0">
                {processSteps.map((s) => (
                  <div key={s.no} className="grid grid-cols-12 gap-3 lg:gap-6 py-6 border-t border-border first:border-t-0">
                    <div className="col-span-2 lg:col-span-2 flex items-start justify-center lg:justify-start pt-1">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-11 h-11 lg:w-14 lg:h-14 rounded-full bg-gold/15 border-2 border-gold flex items-center justify-center">
                          <span className="font-serif text-gold text-lg lg:text-xl leading-none">{s.no}</span>
                        </div>
                        <span className="text-[9px] lg:text-[10px] tracking-[0.25em] font-bold text-gold/70">STEP</span>
                      </div>
                    </div>
                    <div className="col-span-7 lg:col-span-7">
                      <h4 className="font-serif text-lg lg:text-2xl text-foreground mb-2 leading-snug">{s.title}</h4>
                      <p className="text-[14px] lg:text-[15px] leading-[1.85] text-muted-foreground">{s.desc}</p>
                    </div>
                    <div className="col-span-3 lg:col-span-3 flex items-center justify-end">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full border border-gold/30 bg-card flex items-center justify-center text-gold">
                        <ProcessIcon kind={s.icon} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ════════════ Section 02.5 — Atelier (real production footage) ════════════ */}
        <section id="atelier" className="bg-dark text-white py-20 lg:py-28">
          <div className="max-w-[1200px] mx-auto px-5 lg:px-8 grid lg:grid-cols-12 gap-8 lg:gap-12">
            <aside className="lg:col-span-3">
              <div className="lg:sticky lg:top-24">
                <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">Atelier</p>
                <h2 className="font-serif text-3xl lg:text-5xl text-white leading-none">制作風景</h2>
                <p className="text-[12px] text-white/50 mt-3">自社工房・実映像</p>
              </div>
            </aside>
            <div className="lg:col-span-9 scroll-mt-24 min-w-0">
              <p className="text-[15px] leading-[1.95] text-white/80 mb-8 max-w-2xl">
                ado の屋外用手すりが、自社工房で 1 本ずつ手作業で生まれていく様子。
                製作 → メッキ工場 → 戻し作業 → 塗装の各工程を、実際の動画と作業写真でご覧いただけます。
              </p>

              {/* Craft notes — post-galvanizing grinding technique + primer application */}
              <div className="space-y-5 mb-8 max-w-2xl">
                <div className="border-l-2 border-gold pl-5 lg:pl-6 py-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gold/20 border border-gold text-gold font-black text-xs leading-none">01</span>
                    <p className="text-xs sm:text-sm tracking-[0.25em] uppercase font-bold text-white">Craft Note — グラインダー</p>
                  </div>
                  <p className="text-[13px] lg:text-[14px] leading-[1.95] text-white/75">
                    動画のグラインダー作業は、<strong className="text-white">メッキ工場から戻ってきた直後</strong>の手すりを仕上げる工程です。
                    亜鉛メッキ後はどうしてもバリや表面の凹凸が残るため、
                    <strong className="text-gold">メッキ層を削りすぎないよう注意しながら</strong>平らに整えています。
                    一見地味ですが、塗装の密着と仕上がりの美しさを左右する繊細な作業です。
                  </p>
                </div>
                <div className="border-l-2 border-gold pl-5 lg:pl-6 py-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gold/20 border border-gold text-gold font-black text-xs leading-none">02</span>
                    <p className="text-xs sm:text-sm tracking-[0.25em] uppercase font-bold text-white">Craft Note — 密着剤</p>
                  </div>
                  <p className="text-[13px] lg:text-[14px] leading-[1.95] text-white/75">
                    動画でスプレーガンから吹き付けている<strong className="text-white">無色の液体は「密着剤」</strong>です。
                    亜鉛メッキの表面と上塗りウレタン塗膜の橋渡しとなる下処理で、
                    <strong className="text-gold">メッキ層と塗装の密着性を高め</strong>、屋外での長期耐久を確保します。
                    色がつかないため一見何をしているか分かりにくいですが、二重防錆処理の要になる工程です。
                  </p>
                </div>
              </div>

              {/* Digest video — autoplay, muted, looped */}
              <div className="relative w-full aspect-video overflow-hidden rounded-md bg-secondary mb-8">
                <video
                  src="/videos/galvanizing-digest.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              {/* 6-still gallery — production process */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                {[
                  { src: "P1700603", caption: "メッキ後のバリ取り・表面平滑化（メッキ層を削りすぎないよう注意）" },
                  { src: "P1700610", caption: "防塵マスクで密着剤を塗布" },
                  { src: "P1700608", caption: "完成直前の手すり枠" },
                  { src: "P1700611", caption: "無色の密着剤をスプレーガンで均一に吹き付け" },
                  { src: "P1700609", caption: "鉄の馬と作業台" },
                  { src: "P1700606", caption: "メッキ仕上げ面のテクスチャ" },
                ].map((still) => (
                  <div
                    key={still.src}
                    className="relative aspect-[4/3] overflow-hidden rounded-sm bg-black"
                  >
                    <Image
                      src={`/images/process/galvanizing-stills/${still.src}.jpg`}
                      alt={still.caption}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 lg:p-3">
                      <p className="text-[12px] lg:text-[13px] text-white/90 leading-tight">
                        {still.caption}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-white/50 mt-4 leading-relaxed">
                ※ 自社工房での実際の制作工程動画より抜粋。
                すべての屋外用手すりはこの工程を経て、溶融亜鉛メッキ後にお届けします。
              </p>
            </div>
          </div>
        </section>

        {/* ════════════ Section 03 — Stories ════════════ */}
        <section id="stories" className="border-y border-border bg-card/30 py-20 lg:py-28">
          <div className="max-w-[1200px] mx-auto px-5 lg:px-8 grid lg:grid-cols-12 gap-8 lg:gap-12">
            <aside className="lg:col-span-3">
              <div className="lg:sticky lg:top-24">
                <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">Section 03</p>
                <h2 className="font-serif text-3xl lg:text-5xl text-foreground leading-none">Stories</h2>
                <p className="text-[12px] text-muted-foreground mt-3">屋外設置のお悩みに応えます</p>
              </div>
            </aside>
            <div className="lg:col-span-9 scroll-mt-24 min-w-0 space-y-14">
              {voiceCases.map((c, idx) => (
                <div key={c.label}>
                  {/* Case ラベル：番号バッジ + 顧客タイプ */}
                  <div className="flex items-center gap-3 mb-6">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gold/15 border border-gold text-gold font-black text-xs leading-none">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="text-xs sm:text-sm tracking-[0.25em] font-bold text-foreground">{c.label}</span>
                    <span className="flex-1 h-px bg-border" />
                    <span className="text-[11px] sm:text-xs font-medium text-muted-foreground">{c.customerType}</span>
                  </div>

                  {/* お客様の声：人物アバター（Caseごとに違う） + 丸い吹き出し */}
                  <div className="flex items-start gap-3 sm:gap-4 mb-6">
                    <PersonAvatar kind={idx} />

                    {/* 丸い speech bubble + 左 tail */}
                    <div className="relative flex-1 bg-background border-2 border-border rounded-[1.75rem] px-5 sm:px-7 py-4 sm:py-6">
                      {/* 左 tail（吹き出し三角・正方形を 45 度回転） */}
                      <div className="absolute -left-[7px] top-5 w-3 h-3 rotate-45 bg-background border-l-2 border-b-2 border-border" aria-hidden="true" />
                      <p className="font-sans text-[15px] sm:text-base lg:text-lg leading-[1.75] text-foreground">
                        {c.quote}
                      </p>
                    </div>
                  </div>

                  {/* 職人からのアドバイス：ado ロゴ + カード */}
                  <div className="flex items-start gap-3 sm:gap-4 ml-6 sm:ml-8">
                    {/* ado ロゴアバター */}
                    <div className="shrink-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border-2 border-gold flex items-center justify-center overflow-hidden p-1.5">
                        <Image
                          src="/images/ado_logo_K.png"
                          alt="ado"
                          width={40}
                          height={40}
                          className="w-full h-auto object-contain"
                        />
                      </div>
                    </div>

                    {/* アドバイスカード */}
                    <div className="flex-1 bg-gold/[0.05] border border-gold/30 rounded-[1.5rem] px-5 sm:px-6 py-4 sm:py-5">
                      <p className="text-[11px] sm:text-xs tracking-[0.2em] font-bold text-gold mb-2">職人からのアドバイス</p>
                      <p className="text-[14px] sm:text-[15px] leading-[1.85] text-foreground/85 mb-3">{c.advice}</p>
                      <Link
                        href={c.link}
                        className="inline-flex items-center gap-2 text-[12px] sm:text-[13px] font-bold tracking-[0.15em] uppercase text-gold border-b border-gold pb-1 hover:opacity-70 transition-opacity"
                      >
                        {c.linkLabel} →
                      </Link>
                    </div>
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
                <p className="text-[12px] text-muted-foreground mt-3">屋外耐久・塩害・紫外線</p>
              </div>
            </aside>
            <div className="lg:col-span-9 scroll-mt-24 min-w-0">
              <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground mb-8 leading-[1.3]">
                塗装のみでは屋外で <span className="text-foreground/60">1〜3 年</span>。<br className="hidden lg:block" />
                メッキ ＋ 塗装で <span className="text-gold text-3xl sm:text-4xl lg:text-5xl">10 年以上</span>。
              </h3>
              <p className="text-[15px] lg:text-base leading-[1.9] text-foreground/85 mb-10 max-w-2xl">
                <strong className="text-foreground">沿岸部の塩害、強い紫外線、雨ざらし</strong>の環境でも、
                ado の二重防錆処理なら長期にわたって美観と強度を保ちます。
              </p>

              {/* Timeline */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gold/15 border border-gold text-gold font-black text-xs leading-none">01</span>
                  <p className="text-xs sm:text-sm tracking-[0.25em] uppercase font-bold text-foreground">経年変化イメージ</p>
                </div>
                <div className="border border-border bg-secondary/30 rounded-md p-6 lg:p-8">
                  <div className="overflow-x-auto">
                    <div className="min-w-[680px]">
                      <DurabilityTimeline />
                    </div>
                  </div>
                </div>
              </div>

              {/* Radar */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gold/15 border border-gold text-gold font-black text-xs leading-none">02</span>
                  <p className="text-xs sm:text-sm tracking-[0.25em] uppercase font-bold text-foreground">5 軸性能チャート</p>
                </div>
                <div className="max-w-[520px] mx-auto">
                  <PerformanceRadar />
                  <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-5 text-[12px] md:text-[13px] font-bold">
                    <span className="inline-flex items-center gap-1.5 text-[#666]">
                      <span className="inline-block w-3 h-3 border border-[#888] bg-[#88888830]" />
                      塗装のみ（1液）
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-foreground/70">
                      <span className="inline-block w-3 h-3 border border-foreground/40 bg-foreground/[0.08]" />
                      塗装のみ（2液）
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-gold">
                      <span className="inline-block w-3 h-3 border border-gold bg-gold/20" />
                      メッキ＋塗装
                    </span>
                  </div>
                </div>
              </div>

              {/* Comparison table */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gold/15 border border-gold text-gold font-black text-xs leading-none">03</span>
                  <p className="text-xs sm:text-sm tracking-[0.25em] uppercase font-bold text-foreground">屋外性能 6 項目比較</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-[12px] min-w-[560px]">
                    <thead>
                      <tr className="border-b-2 border-gold">
                        <th className="text-left p-2 md:p-3 text-muted-foreground font-normal whitespace-nowrap">項目</th>
                        <th className="text-left p-2 md:p-3 text-[#666] font-bold whitespace-nowrap">塗装のみ（1液）</th>
                        <th className="text-left p-2 md:p-3 text-foreground/70 font-bold whitespace-nowrap">塗装のみ（2液）</th>
                        <th className="text-left p-2 md:p-3 text-gold font-bold bg-gold/[0.08] whitespace-nowrap">メッキ＋塗装</th>
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
                          <td className="p-2 md:p-3 text-foreground/80">
                            <div>{row.b}</div>
                            {row.bLevel != null && (
                              <div className="mt-1">
                                <StarBar level={row.bLevel} color="muted" />
                              </div>
                            )}
                          </td>
                          <td className="p-2 md:p-3 text-foreground bg-gold/[0.08]">
                            <div>{row.c}</div>
                            {row.cLevel != null && (
                              <div className="mt-1">
                                <StarBar level={row.cLevel} color="gold" />
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

        {/* ════════════ Section 05 — Flow ════════════ */}
        <section id="flow" className="border-y border-border bg-card/20 py-20 lg:py-28">
          <div className="max-w-[1200px] mx-auto px-5 lg:px-8 grid lg:grid-cols-12 gap-8 lg:gap-12">
            <aside className="lg:col-span-3">
              <div className="lg:sticky lg:top-24">
                <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">Section 05</p>
                <h2 className="font-serif text-3xl lg:text-5xl text-foreground leading-none">Flow</h2>
                <p className="text-[12px] text-muted-foreground mt-3">ご注文から設置までの 3 ステップ</p>
              </div>
            </aside>
            <div className="lg:col-span-9 scroll-mt-24 min-w-0">
              <div className="space-y-0">
                {flowSteps.map((s, i) => (
                  <div
                    key={s.no}
                    className="grid grid-cols-12 gap-4 lg:gap-8 items-start py-8 border-t border-border first:border-t-0"
                  >
                    <div className="col-span-3 lg:col-span-2 flex items-start justify-center lg:justify-start">
                      <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gold/10 border-2 border-gold flex items-center justify-center shrink-0">
                        <span className="font-serif text-gold text-lg lg:text-xl leading-none">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-9 lg:col-span-10">
                      <h3 className="font-serif text-xl lg:text-3xl text-foreground mb-3 leading-snug">
                        {s.title}
                      </h3>
                      <p className="text-[14px] lg:text-[15px] leading-[1.85] text-foreground/80">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-12 text-center">
                <PrimaryCTA href="/contact" variant="gold" size="lg">
                  屋外手すりのお見積もり
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
            <div className="lg:col-span-9 scroll-mt-24 min-w-0 space-y-3">
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
                <p className="text-[12px] text-muted-foreground mt-3">二重防錆処理 採用製品</p>
              </div>
            </aside>
            <div className="lg:col-span-9 scroll-mt-24 min-w-0">
              <p className="text-[15px] leading-[1.95] text-foreground/80 mb-8 max-w-2xl">
                屋外設置のアイアン製品には、溶融亜鉛メッキ ＋ 2 液型ウレタン塗装の二重防錆処理を施しています。
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
              {/* Indoor cross-link */}
              <div className="border border-border bg-card p-6 lg:p-8 rounded-md">
                <h3 className="font-serif text-base lg:text-lg text-foreground mb-2">
                  屋内用製品の塗装について
                </h3>
                <p className="text-[13px] leading-[1.95] text-foreground/75 mb-4">
                  屋内設置の手すりは 2 液型ウレタン塗装で仕上げています。
                </p>
                <Link
                  href="/paint"
                  className="inline-block text-[11px] tracking-[0.2em] uppercase text-gold border-b border-gold hover:opacity-70 transition-opacity"
                >
                  2 液型ウレタン塗装について →
                </Link>
              </div>
              {/* 全商品導線 */}
              <div className="mt-8 text-center">
                <PrimaryCTA href="/products" variant="outline" size="md">
                  全商品を見る
                </PrimaryCTA>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════ Footer Banner CTA ════════════ */}
        <section className="py-16 lg:py-24 bg-dark text-white">
          <div className="max-w-[880px] mx-auto px-5 lg:px-8 text-center">
            <p className="text-[10px] tracking-[0.5em] uppercase text-gold mb-5">Get Started</p>
            <h2 className="font-serif text-2xl lg:text-4xl mb-6 leading-snug">
              屋外でも、塩害でも、<br />
              10 年以上の安心を。
            </h2>
            <p className="text-[14px] lg:text-[15px] leading-[1.95] text-white/70 mb-10 max-w-xl mx-auto">
              設置場所・サイズ・現状のお悩みについて、お気軽にお問い合わせください。
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
