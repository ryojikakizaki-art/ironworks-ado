import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import Image from "next/image"
import { PrimaryCTA } from "@/components/ui/primary-cta"
import { galleryUrl } from "@/lib/products/display"

export const metadata = {
  title: "亜鉛メッキについて | IRONWORKS ado",
  description:
    "屋外でも錆びない、ado の二重防錆処理。溶融亜鉛メッキ＋2液型ウレタン塗装で 10 年以上の耐久性を実現します。図解で分かる仕組みと対応製品をご紹介。",
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
  { label: "塩害（沿岸部）", a: "急速に錆", b: "やや弱い", c: "問題なく使用可", aLevel: 1, bLevel: 3, cLevel: 5 },
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
    a: "屋内用は 2 液型ウレタン塗装で仕上げています。ado の塗装はもともと屋外耐久も視野に入れたプロ仕様（自動車塗装と同じ 2 液型ウレタン）なので、軒下・室内階段ならこれだけでも 5〜8 年は綺麗な状態を保てます。雨ざらしになる屋外用には、さらに亜鉛メッキ層を重ねて 10 年以上の耐久性を確保しています。",
  },
  {
    q: "ホームセンターの塗料との違いは？",
    a: "ホームセンターで売られているのは 1 液型（ラッカーや水性塗料）が中心で、屋外設置だと 1〜3 年ほどで錆や色褪せが目立ってきます。ado は自動車塗装と同じ 2 液型ウレタン塗料を主剤＋硬化剤の比率で正確に調合し、化学反応で硬化させているため、塗膜の強さがまったく違います。詳しくは塗装ページをご覧ください。",
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

// ════════════ SVG: 犠牲防食の仕組み ════════════
function SacrificialProtectionDiagram() {
  return (
    <svg viewBox="0 0 800 320" className="w-full h-auto">
      <defs>
        <marker id="arrow-zinc" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="#8ab5cf" />
        </marker>
        <linearGradient id="rust-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a44" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#722" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="zinc-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a8d4ec" />
          <stop offset="100%" stopColor="#6a8a9f" />
        </linearGradient>
      </defs>

      {/* === 左：塗装のみ === */}
      <text x="180" y="38" textAnchor="middle" fill="#888" fontSize="13" fontWeight="500">
        塗装のみの場合
      </text>

      {/* 鉄素地 */}
      <rect x="40" y="140" width="280" height="70" rx="3" fill="#4a4a4a" stroke="#666" strokeWidth="1" />
      <text x="180" y="180" textAnchor="middle" fill="#bbb" fontSize="14" letterSpacing="0.3em">
        鉄  素  地
      </text>

      {/* 塗膜 */}
      <rect x="40" y="115" width="280" height="25" rx="2" fill="#3a3a3a" stroke="#888" strokeWidth="0.8" />
      <text x="180" y="131" textAnchor="middle" fill="#aaa" fontSize="11">塗膜</text>

      {/* 傷 */}
      <rect x="160" y="108" width="40" height="40" fill="#0e0e0e" stroke="none" />
      <text x="180" y="98" textAnchor="middle" fill="#e55" fontSize="11">傷・剥がれ</text>

      {/* 錆 */}
      <ellipse cx="180" cy="232" rx="80" ry="14" fill="url(#rust-gradient)" opacity="0.7" />
      <path
        d="M120,235 Q140,225 160,238 Q180,222 200,238 Q220,225 240,235"
        fill="url(#rust-gradient)"
        opacity="0.9"
      />
      <text x="180" y="270" textAnchor="middle" fill="#c55" fontSize="12">
        傷から水が入って錆びてしまう
      </text>
      <text x="180" y="290" textAnchor="middle" fill="#a55" fontSize="11">
        塗膜が剥がれた瞬間にカウントダウン
      </text>

      {/* === 中央分割 === */}
      <line x1="400" y1="20" x2="400" y2="300" stroke="#333" strokeDasharray="3 4" />

      {/* === 右：溶融亜鉛メッキ === */}
      <text x="600" y="38" textAnchor="middle" fill="#8ab5cf" fontSize="13" fontWeight="500">
        溶融亜鉛メッキの場合
      </text>

      {/* 鉄素地 */}
      <rect x="460" y="140" width="280" height="70" rx="3" fill="#4a4a4a" stroke="#666" strokeWidth="1" />
      <text x="600" y="180" textAnchor="middle" fill="#bbb" fontSize="14" letterSpacing="0.3em">
        鉄  素  地
      </text>

      {/* 合金層 */}
      <rect x="460" y="125" width="280" height="15" rx="1" fill="#6a8a9f" />
      <text x="450" y="135" textAnchor="end" fill="#8ab5cf" fontSize="10">合金層 →</text>

      {/* 純亜鉛層 */}
      <rect x="460" y="108" width="280" height="17" rx="1" fill="url(#zinc-gradient)" />
      <text x="450" y="119" textAnchor="end" fill="#a8d4ec" fontSize="10">純亜鉛層 →</text>

      {/* 傷 */}
      <rect x="580" y="103" width="40" height="40" fill="#0e0e0e" stroke="none" />
      <text x="600" y="93" textAnchor="middle" fill="#a8d4ec" fontSize="11">傷がついても</text>

      {/* 犠牲防食の動き：亜鉛が傷に流れ込む */}
      <path
        d="M555,128 Q580,118 580,112"
        stroke="#8ab5cf"
        strokeWidth="1.5"
        fill="none"
        markerEnd="url(#arrow-zinc)"
      />
      <path
        d="M645,128 Q620,118 620,112"
        stroke="#8ab5cf"
        strokeWidth="1.5"
        fill="none"
        markerEnd="url(#arrow-zinc)"
      />

      {/* 鉄が無傷であることを示す ✓ */}
      <text x="600" y="195" textAnchor="middle" fill="#8ab5cf" fontSize="20" fontWeight="500">✓</text>

      <text x="600" y="270" textAnchor="middle" fill="#8ab5cf" fontSize="12">
        亜鉛が代わりに溶けて、鉄を守り続ける
      </text>
      <text x="600" y="290" textAnchor="middle" fill="#7a9bb5" fontSize="11">
        ＝「犠牲防食（ぎせいぼうしょく）」のしくみ
      </text>
    </svg>
  )
}

// ════════════ SVG: 4 層断面構造 ════════════
function CrossSectionDiagram() {
  // 各層: layer.y(中央) と stripeY/H(視覚的な厚み)
  const layers = [
    { y: 80,  stripeY: 70,  stripeH: 22, fill: "url(#cs-paint)", border: "#c8a96e", label: "2 液型ウレタン塗装", thickness: "約 40μm", desc: "美観 ＋ 紫外線防護", color: "#c8a96e" },
    { y: 116, stripeY: 105, stripeH: 14, fill: "#666", border: undefined,           label: "プライマー",         thickness: "約 20μm", desc: "塗料の密着層",       color: "#aaa" },
    { y: 152, stripeY: 140, stripeH: 22, fill: "url(#cs-zinc-pure)", border: undefined, label: "純亜鉛層",       thickness: "約 50μm", desc: "犠牲防食（鉄を守る）", color: "#a8d4ec" },
    { y: 188, stripeY: 175, stripeH: 22, fill: "#6a8a9f", border: undefined,        label: "亜鉛 - 鉄 合金層",   thickness: "約 30μm", desc: "化学結合で剥がれない", color: "#8ab5cf" },
    { y: 246, stripeY: 200, stripeH: 70, fill: "#4a4a4a", border: "#5a5a5a",        label: "鉄素地（SS400）",   thickness: "鋼材",     desc: "ado の手すり本体",   color: "#bbb" },
  ]
  return (
    <svg viewBox="0 0 760 320" className="w-full h-auto">
      <defs>
        <linearGradient id="cs-zinc-pure" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a8d4ec" />
          <stop offset="100%" stopColor="#7a9bb5" />
        </linearGradient>
        <linearGradient id="cs-paint" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a3a3a" />
          <stop offset="100%" stopColor="#1f1f1f" />
        </linearGradient>
      </defs>

      {/* 各層の帯 */}
      {layers.map((l, i) => (
        <rect
          key={i}
          x="80"
          y={l.stripeY}
          width="380"
          height={l.stripeH}
          rx={l.border ? 2 : 0}
          fill={l.fill}
          stroke={l.border}
          strokeWidth={l.border ? 1 : 0}
        />
      ))}

      {/* 鉄素地ラベル（帯の中央） */}
      <text x="270" y="245" textAnchor="middle" fill="#bbb" fontSize="14" letterSpacing="0.3em">
        鉄  素  地
      </text>

      {/* 引き出し線 + ラベル（右側） */}
      {layers.map((l, i) => (
        <g key={`lbl-${i}`}>
          <line x1="460" y1={l.y} x2="490" y2={l.y} stroke={l.color} strokeWidth="0.6" />
          <text x="498" y={l.y - 2} fill={l.color} fontSize="12" fontWeight="500">
            {l.label}
          </text>
          <text x="498" y={l.y + 14} fill="#888" fontSize="11">
            {l.thickness}・{l.desc}
          </text>
        </g>
      ))}

      {/* 左側ブレース：塗装層 (ウレタン+プライマー) */}
      <path d="M 70,70 L 60,70 L 60,119 L 70,119" fill="none" stroke="#c8a96e" strokeWidth="1" />
      <text x="55" y="98" textAnchor="end" fill="#c8a96e" fontSize="11" fontWeight="500">
        塗装層
      </text>

      {/* 左側ブレース：メッキ層 (純亜鉛+合金) */}
      <path d="M 70,140 L 60,140 L 60,197 L 70,197" fill="none" stroke="#a8d4ec" strokeWidth="1" />
      <text x="55" y="172" textAnchor="end" fill="#a8d4ec" fontSize="11" fontWeight="500">
        メッキ層
      </text>

      {/* 凡例 */}
      <text x="380" y="298" textAnchor="middle" fill="#888" fontSize="11">
        ＝ 鉄を錆から守る「鎧」と、それを美しく保つ「コーティング」の二重構造
      </text>
    </svg>
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

      <text x="400" y="30" textAnchor="middle" fill="#e8e8e8" fontSize="13" fontWeight="500">
        屋外設置から経過年数別のコンディション
      </text>

      {/* 年マーカー（背景） */}
      {[0, 5, 10, 15, 20].map((y) => {
        const x = 80 + (y / 20) * 640
        return (
          <g key={y}>
            <line x1={x} y1="60" x2={x} y2="240" stroke="#333" strokeDasharray="2 4" strokeWidth="0.5" />
            <text x={x} y="258" textAnchor="middle" fill="#888" fontSize="11">
              {y}年
            </text>
          </g>
        )
      })}

      {/* === レーン1: 2 液型のみ === */}
      <text x="76" y="92" textAnchor="end" fill="#c89060" fontSize="11" fontWeight="500">2 液型のみ</text>
      <text x="76" y="106" textAnchor="end" fill="#888" fontSize="9">（ado 屋内標準）</text>
      <rect x="80" y="80" width="640" height="32" rx="4" fill="url(#paint-gradient)" opacity="0.85" />
      {/* マイルストーン */}
      <g>
        <circle cx="80" cy="96" r="4" fill="#6a9a6a" stroke="#0e0e0e" strokeWidth="2" />
        <text x="80" y="74" textAnchor="middle" fill="#7aa05a" fontSize="10">設置直後</text>

        <circle cx={80 + 640 * 5 / 20} cy="96" r="4" fill="#7aa05a" stroke="#0e0e0e" strokeWidth="2" />
        <text x={80 + 640 * 5 / 20} y="74" textAnchor="middle" fill="#7aa05a" fontSize="10">5年・問題なし</text>

        <circle cx={80 + 640 * 8 / 20} cy="96" r="4" fill="#a89040" stroke="#0e0e0e" strokeWidth="2" />
        <text x={80 + 640 * 8 / 20} y="74" textAnchor="middle" fill="#a89040" fontSize="10">部分補修を始めるころ</text>

        <circle cx={80 + 640 * 14 / 20} cy="96" r="4" fill="#b06840" stroke="#0e0e0e" strokeWidth="2" />
        <text x={80 + 640 * 14 / 20} y="74" textAnchor="middle" fill="#c87040" fontSize="10">塗り直しを検討</text>
      </g>

      {/* === レーン2: 2 液型 + メッキ === */}
      <text x="76" y="162" textAnchor="end" fill="#c8a96e" fontSize="11" fontWeight="500">2 液型 ＋ メッキ</text>
      <text x="76" y="176" textAnchor="end" fill="#888" fontSize="9">（ado 屋外標準）</text>
      <rect x="80" y="150" width="640" height="32" rx="4" fill="url(#ado-gradient)" opacity="0.9" />
      {/* マイルストーン */}
      <g>
        <circle cx="80" cy="166" r="4" fill="#6a9a6a" stroke="#0e0e0e" strokeWidth="2" />
        <text x="80" y="208" textAnchor="middle" fill="#7aa07a" fontSize="10">設置直後</text>

        <circle cx={80 + 640 * 10 / 20} cy="166" r="4" fill="#7aa07a" stroke="#0e0e0e" strokeWidth="2" />
        <text x={80 + 640 * 10 / 20} y="208" textAnchor="middle" fill="#7aa07a" fontSize="10">10年経過、まだ綺麗</text>

        <circle cx={80 + 640 * 15 / 20} cy="166" r="4" fill="#a09060" stroke="#0e0e0e" strokeWidth="2" />
        <text x={80 + 640 * 15 / 20} y="208" textAnchor="middle" fill="#a09060" fontSize="10">塗装の小傷を補修</text>

        <circle cx={80 + 640 * 20 / 20} cy="166" r="4" fill="#b08050" stroke="#0e0e0e" strokeWidth="2" />
        <text x={80 + 640 * 20 / 20} y="208" textAnchor="middle" fill="#b08050" fontSize="10">メッキ層で保護継続</text>
      </g>

      {/* 参考線・凡例 */}
      <text x="400" y="232" textAnchor="middle" fill="#666" fontSize="10">
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
    <svg viewBox="0 0 400 400" className="w-full h-auto max-w-md mx-auto">
      <text x="200" y="24" textAnchor="middle" fill="#f5f5f5" fontSize="13" fontWeight="500">
        屋外用途での性能比較
      </text>

      {/* グリッド（5重ペンタゴン） */}
      {[1, 2, 3, 4, 5].map((step) => {
        const r = (step / 5) * maxR
        const points = angles
          .map((a) => `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`)
          .join(" ")
        return <polygon key={step} points={points} fill="none" stroke="#333" strokeWidth="0.5" />
      })}

      {/* 軸線 */}
      {angles.map((a, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={cx + maxR * Math.cos(a)}
          y2={cy + maxR * Math.sin(a)}
          stroke="#333"
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
            fill="#aaa"
            fontSize="11"
          >
            {label}
          </text>
        )
      })}

      {/* 凡例 */}
      <g transform="translate(20 370)">
        <rect x="0" y="-10" width="14" height="14" fill="#c8a96e" fillOpacity="0.25" stroke="#c8a96e" strokeWidth="1.5" />
        <text x="22" y="0" fill="#c8a96e" fontSize="10">2液型 ＋ メッキ（屋外）</text>
        <rect x="200" y="-10" width="14" height="14" fill="#a07840" fillOpacity="0.22" stroke="#c89060" strokeWidth="1.5" />
        <text x="222" y="0" fill="#c89060" fontSize="10">2液型のみ（屋内）</text>
      </g>
    </svg>
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
            <div className="lg:col-span-5 px-5 lg:px-12 py-12 lg:py-20 flex flex-col justify-center">
              <p className="text-[10px] tracking-[0.5em] uppercase text-gold mb-5">Hot-Dip Galvanizing</p>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-foreground leading-[1.15] mb-3">
                屋外用アイアンの<br />
                『亜鉛メッキ』
              </h1>
              <p className="font-serif text-[14px] lg:text-base text-foreground/70 mb-8">
                Double Anti-Rust Treatment
              </p>
              <p className="text-[14px] lg:text-[15px] leading-[1.95] text-foreground/80 max-w-md">
                450℃ の亜鉛浴に浸して鉄を化学的に守る、橋梁・鉄塔と同じ防錆技術。
                ado の屋外製品はすべて 2 液型ウレタン塗装と組み合わせた
                二重防錆処理で、10 年以上の耐久性を実現します。
              </p>
            </div>
            {/* Right: Hero photo (placeholder until ChatGPT image arrives) */}
            <div className="lg:col-span-7 relative aspect-[3/2] lg:aspect-auto bg-secondary">
              <Image
                src="/images/process/galvanizing-hero.jpg"
                alt="450℃ の亜鉛浴に鉄製手すりを浸漬している様子"
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
                const isWord = /[぀-ヿ一-鿿A-Z]/.test(s.value)
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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[600px] aspect-square rounded-full bg-gold/[0.03] pointer-events-none" />
          <p className="relative font-serif text-base lg:text-2xl leading-[2.2] lg:leading-[2.4] text-foreground/90">
            屋外でも、塩害でも、紫外線でも、
            <br />
            錆びない手すりを。
            <br />
            <span className="text-gold">メッキ ＋ 塗装の二重防錆</span>で、
            <br />
            10 年以上の安心をお届けします。
          </p>
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
            <div className="lg:col-span-9 scroll-mt-24">
              <h3 className="font-serif text-xl lg:text-3xl text-foreground mb-6 leading-snug">
                亜鉛が鉄と化学結合し、<br className="hidden lg:block" />
                犠牲防食で守り続ける。
              </h3>
              <div className="space-y-5 mb-10 max-w-2xl">
                <p className="text-[15px] leading-[1.95] text-foreground/80">
                  溶融亜鉛メッキ（ドブ漬けメッキ）は、約 450℃ に溶かした亜鉛の浴槽に
                  鉄製品を丸ごと浸漬する処理です。鉄表面に
                  <strong className="text-gold">亜鉛と鉄の合金層</strong>が形成され、
                  化学結合により剥がれにくく耐久性に優れます。
                </p>
                <p className="text-[15px] leading-[1.95] text-foreground/80">
                  単なる塗装と異なり、傷がついても周囲の亜鉛が先に溶けて鉄を守る
                  <strong className="text-gold">「犠牲防食」</strong>が働きます。
                  橋梁・鉄塔・ガードレールなど、屋外インフラで広く採用されている信頼性の高い技術です。
                </p>
              </div>
              <div className="border border-border bg-secondary/30 rounded-md p-5 lg:p-8 mb-6">
                <SacrificialProtectionDiagram />
                <p className="text-[11px] text-muted-foreground mt-3 text-center tracking-wide">
                  犠牲防食のしくみ — 傷がついても亜鉛が鉄を守り続けます
                </p>
              </div>
              <div className="border border-border bg-secondary/30 rounded-md p-5 lg:p-8">
                <CrossSectionDiagram />
                <p className="text-[11px] text-muted-foreground mt-3 text-center tracking-wide">
                  ado の二重防錆 — 4 層構造で長期耐久を実現
                </p>
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
            <div className="lg:col-span-9 scroll-mt-24">
              <h3 className="font-serif text-xl lg:text-3xl text-foreground mb-6 leading-snug">
                製作からお届けまで、<br className="hidden lg:block" />
                すべて一貫して行います。
              </h3>
              <p className="text-[15px] leading-[1.95] text-foreground/80 mb-8 max-w-2xl">
                鍛冶職人が一点ずつ手作業で製作した手すりを、専用工場で溶融亜鉛メッキ処理。
                その上から 2 液型ウレタン塗装で美しく仕上げます。
              </p>

              {/* Process stage rows */}
              <div className="space-y-0">
                {processSteps.map((s) => (
                  <div key={s.no} className="grid grid-cols-12 gap-3 lg:gap-6 py-5 border-t border-border first:border-t-0">
                    <div className="col-span-2 lg:col-span-2">
                      <p className="text-[10px] tracking-[0.3em] text-muted-foreground">{`STEP ${s.no}`}</p>
                    </div>
                    <div className="col-span-7 lg:col-span-7">
                      <h4 className="font-serif text-base lg:text-xl text-foreground mb-1.5 leading-snug">{s.title}</h4>
                      <p className="text-[13px] lg:text-[14px] leading-[1.85] text-muted-foreground">{s.desc}</p>
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
                <p className="text-[12px] text-white/50 mt-3">千葉の工房・実映像</p>
              </div>
            </aside>
            <div className="lg:col-span-9 scroll-mt-24">
              <p className="text-[15px] leading-[1.95] text-white/80 mb-8 max-w-2xl">
                ado の屋外用手すりが、千葉の工房で 1 本ずつ手作業で生まれていく様子。
                製作 → メッキ工場 → 戻し作業 → 塗装の各工程を、実際の動画と作業写真でご覧いただけます。
              </p>

              {/* Craft note — post-galvanizing grinding technique */}
              <div className="border-l-2 border-gold pl-5 lg:pl-6 py-1 mb-8 max-w-2xl">
                <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">Craft Note</p>
                <p className="text-[13px] lg:text-[14px] leading-[1.95] text-white/75">
                  動画のグラインダー作業は、<strong className="text-white">メッキ工場から戻ってきた直後</strong>の手すりを仕上げる工程です。
                  亜鉛メッキ後はどうしてもバリや表面の凹凸が残るため、
                  <strong className="text-gold">メッキ層を削りすぎないよう注意しながら</strong>平らに整えています。
                  一見地味ですが、塗装の密着と仕上がりの美しさを左右する繊細な作業です。
                </p>
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
                  { src: "P1700610", caption: "防塵マスクでの塗装作業" },
                  { src: "P1700608", caption: "完成直前の手すり枠" },
                  { src: "P1700611", caption: "スプレーガンで均一に吹き付け" },
                  { src: "P1700609", caption: "鉄の馬と作業台" },
                  { src: "P1700600", caption: "メッキ仕上げ面のテクスチャ" },
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
                      <p className="text-[10px] lg:text-[11px] text-white/90 leading-tight">
                        {still.caption}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-white/50 mt-4 leading-relaxed">
                ※ 千葉の工房での実際の制作工程動画より抜粋。
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
            <div className="lg:col-span-9 scroll-mt-24 space-y-12">
              {voiceCases.map((c) => (
                <div key={c.label}>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-[12px] tracking-[0.3em] text-muted-foreground">{c.label}</span>
                    <span className="flex-1 h-px bg-border" />
                    <span className="text-[11px] text-muted-foreground">{c.customerType}</span>
                  </div>
                  <div className="relative bg-background border border-border rounded-2xl px-6 lg:px-10 py-7 lg:py-9 mb-6">
                    <p className="font-serif text-base lg:text-2xl leading-relaxed text-foreground/90 text-center">
                      "{c.quote}"
                    </p>
                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-6 h-6 rotate-45 bg-background border-r border-b border-border" />
                  </div>
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
                <p className="text-[12px] text-muted-foreground mt-3">屋外耐久・塩害・紫外線</p>
              </div>
            </aside>
            <div className="lg:col-span-9 scroll-mt-24">
              <h3 className="font-serif text-xl lg:text-3xl text-foreground mb-6 leading-snug">
                塗装のみでは屋外で 1〜3 年。<br className="hidden lg:block" />
                メッキ ＋ 塗装で 10 年以上。
              </h3>
              <p className="text-[15px] leading-[1.95] text-foreground/80 mb-10 max-w-2xl">
                沿岸部の塩害、強い紫外線、雨ざらしの環境でも、
                ado の二重防錆処理なら長期にわたって美観と強度を保ちます。
              </p>

              {/* Timeline */}
              <div className="mb-10">
                <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">経年変化イメージ</p>
                <div className="border border-border bg-secondary/30 rounded-md p-6 lg:p-8">
                  <DurabilityTimeline />
                </div>
              </div>

              {/* Radar */}
              <div className="mb-10">
                <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">5 軸性能チャート</p>
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
                <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">屋外性能 6 項目比較</p>
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
                <p className="text-[12px] text-muted-foreground mt-3">二重防錆処理 採用製品</p>
              </div>
            </aside>
            <div className="lg:col-span-9 scroll-mt-24">
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
