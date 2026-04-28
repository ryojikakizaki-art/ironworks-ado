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
      <main className="pt-20 lg:pt-24 pb-20 bg-background">
        {/* ════════════ Hero ════════════ */}
        <section className="border-b border-border">
          <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-16 lg:py-24">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">
              Hot-Dip Galvanizing
            </p>
            <h1 className="font-serif text-3xl lg:text-5xl text-foreground mb-6 leading-tight">
              雨ざらしでも、錆びずに 10 年。
              <br />
              <span className="text-gold">屋外用アイアンの「鎧」。</span>
            </h1>
            <p className="text-[14px] lg:text-[15px] text-foreground/80 leading-[1.9] max-w-[640px]">
              ado の屋外用手すり・フェンスには、橋や鉄塔と同じ「溶融亜鉛メッキ」で錆対策をしています。塗装の下に隠れた一層が、見えないところで鉄を守り続けます。
            </p>
          </div>
        </section>

        {/* ════════════ 数値で見る品質 ════════════ */}
        <section className="border-b border-border bg-card/40">
          <div className="max-w-[1100px] mx-auto px-4 lg:px-8 py-10 lg:py-14">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8">
              {stats.map((s, i) => (
                <div
                  key={i}
                  className={`text-center px-4 ${
                    i < stats.length - 1 ? "md:border-r border-border/40" : ""
                  }`}
                >
                  <div className="font-serif text-gold leading-none">
                    <span className="text-4xl lg:text-6xl">{s.value}</span>
                    <span className="text-xl lg:text-2xl ml-1">{s.unit}</span>
                  </div>
                  <p className="mt-3 text-[11px] tracking-[0.2em] uppercase text-foreground">
                    {s.label}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-[1000px] mx-auto px-4 lg:px-8 py-16 lg:py-20 space-y-20 lg:space-y-24">
          {/* ════════════ 1. 仕組み（犠牲防食） ════════════ */}
          <section>
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">How it works</p>
            <h2 className="font-serif text-2xl lg:text-3xl text-foreground mb-6">
              「メッキ」って何が違うの？
            </h2>
            <p className="text-[14px] leading-[1.9] text-foreground/80 mb-10 max-w-[760px]">
              塗装の上から傷がついたとき、塗装だけだと水が入って錆びてしまいます。でも、メッキの下地があると、亜鉛が鉄の身代わりになって溶けてくれる ─ それが「犠牲防食（ぎせいぼうしょく）」のしくみです。
            </p>

            <div className="border border-border bg-card/60 p-6 lg:p-8 rounded-sm">
              <SacrificialProtectionDiagram />
            </div>
          </section>

          {/* ════════════ 2. 二重防錆の構造 ════════════ */}
          <section>
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">Double Protection</p>
            <h2 className="font-serif text-2xl lg:text-3xl text-foreground mb-6">
              ado の二重防錆 ─ 4 層構造
            </h2>
            <p className="text-[14px] leading-[1.9] text-foreground/80 mb-8 max-w-[760px]">
              亜鉛メッキ層が「鉄を錆から守る鎧」、その上の 2 液型ウレタン塗装が「鎧を美しく保つコーティング」。両方を重ねて、屋外でも長く美しく、をかなえます。
            </p>

            <div className="border border-border bg-card/60 p-6 lg:p-8 rounded-sm">
              <CrossSectionDiagram />
            </div>

            <blockquote className="mt-10 border-l-2 border-gold pl-6 py-2 italic text-foreground/85 text-[14px] lg:text-[15px] leading-[1.95] max-w-[680px]">
              メッキだけでも、塗装だけでもない。両方を重ねることで、屋外でも 10 年以上の耐久性を実現しています。
              <footer className="mt-3 not-italic text-[11px] text-gold tracking-wider">
                — IRONWORKS ado 鍛冶職人
              </footer>
            </blockquote>
          </section>

          {/* ════════════ 3. 工程 ════════════ */}
          <section>
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">Process</p>
            <h2 className="font-serif text-2xl lg:text-3xl text-foreground mb-6">
              4 つの工程で仕上げます
            </h2>
            <p className="text-[14px] leading-[1.9] text-foreground/80 mb-10 max-w-[760px]">
              制作から仕上げまで、すべて一貫して職人が手を入れます。
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {processSteps.map((s, i) => (
                <div
                  key={s.no}
                  className="border border-border bg-card/60 p-6 rounded-sm relative"
                >
                  <div className="flex items-start justify-between mb-4">
                    <ProcessIcon kind={s.icon} />
                    <span className="font-mono text-[11px] tracking-[0.2em] text-gold/80">
                      {s.no}
                    </span>
                  </div>
                  <h3 className="font-serif text-base text-foreground mb-2">{s.title}</h3>
                  <p className="text-[12px] leading-[1.8] text-foreground/70">{s.desc}</p>

                  {/* 矢印（次のステップへ） */}
                  {i < processSteps.length - 1 && (
                    <span
                      aria-hidden
                      className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 text-gold/50 text-lg"
                    >
                      →
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ════════════ 4. タイムライン ════════════ */}
          <section>
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">Timeline</p>
            <h2 className="font-serif text-2xl lg:text-3xl text-foreground mb-6">
              10 年後、20 年後はどうなる？
            </h2>
            <p className="text-[14px] leading-[1.9] text-foreground/80 mb-10 max-w-[760px]">
              塗装のみと、ado の二重防錆では、屋外での経年変化がまったく違ってきます。
            </p>

            <div className="border border-border bg-card/60 p-6 lg:p-8 rounded-sm">
              <DurabilityTimeline />
            </div>
          </section>

          {/* ════════════ 5. レーダー比較 ════════════ */}
          <section className="grid lg:grid-cols-[1fr_1fr] gap-10 lg:gap-16 items-center">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">
                Performance
              </p>
              <h2 className="font-serif text-2xl lg:text-3xl text-foreground mb-6">
                5 つの軸で見る、屋内 vs 屋外仕様。
              </h2>
              <p className="text-[14px] leading-[1.9] text-foreground/80 mb-6">
                ado の塗装はもともとプロ仕様の 2 液型ウレタンなので、屋内・軒下なら塗装のみでもしっかり長持ちします。屋外で雨ざらしになる場所では、亜鉛メッキ層を加えることで、塩害・紫外線・傷からの保護がぐっと底上げされます。
              </p>
              <ul className="space-y-2 text-[13px] text-foreground/75">
                <li>● 沿岸部の塩害環境にも対応（メッキ層追加で）</li>
                <li>● 紫外線で塗膜が薄くなっても、メッキ層が下で保護継続</li>
                <li>● 屋外用途のメンテナンスは「ほぼ不要」、長期トータルで経済的</li>
              </ul>
            </div>
            <div className="border border-border bg-card/60 p-4 lg:p-6 rounded-sm">
              <PerformanceRadar />
            </div>
          </section>

          {/* ════════════ 6. 比較テーブル ════════════ */}
          <section>
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">Comparison</p>
            <h2 className="font-serif text-2xl lg:text-3xl text-foreground mb-4">
              塗装の種類で、こんなに変わります
            </h2>
            <p className="text-[14px] leading-[1.9] text-foreground/80 mb-8 max-w-[760px]">
              ado の屋内用は <strong className="text-foreground">2 液型ウレタン塗装</strong>（自動車塗装と同じグレード）を標準採用しているので、塗装のみでも軒下や室内階段ならしっかり長持ちします。屋外にがっつり雨ざらしになる場所では、さらに <strong className="text-foreground">亜鉛メッキ</strong> を重ねて 10 年以上の耐久性をかなえています。
            </p>

            <div className="overflow-x-auto border border-border rounded-sm">
              <table className="w-full text-[12px] lg:text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-card/40">
                    <th className="text-left p-4 text-muted-foreground font-normal w-[22%]">項目</th>
                    <th className="text-left p-4 text-muted-foreground font-normal">
                      <div className="font-medium text-foreground/80">1 液型のみ</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">DIY・ホームセンター</div>
                    </th>
                    <th className="text-left p-4 text-foreground font-normal">
                      <div className="font-medium text-foreground">2 液型ウレタンのみ</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">ado 屋内・軒下標準</div>
                    </th>
                    <th className="text-left p-4 text-gold font-normal bg-gold/5">
                      <div className="font-medium">2 液型 ＋ 亜鉛メッキ</div>
                      <div className="text-[10px] text-gold/70 mt-0.5">ado 屋外標準</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row) => (
                    <tr key={row.label} className="border-b border-border/40 last:border-b-0">
                      <td className="p-4 text-foreground/85">{row.label}</td>
                      <td className="p-4 text-foreground/65">
                        <div>{row.a}</div>
                        {row.aLevel !== undefined && (
                          <div className="mt-1.5">
                            <StarBar level={row.aLevel} color="muted" />
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-foreground/85">
                        <div>{row.b}</div>
                        {row.bLevel !== undefined && (
                          <div className="mt-1.5">
                            <StarBar level={row.bLevel} color="muted" />
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-foreground bg-gold/5">
                        <div>{row.c}</div>
                        {row.cLevel !== undefined && (
                          <div className="mt-1.5">
                            <StarBar level={row.cLevel} color="gold" />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[12px] text-muted-foreground">
              ※ 1 液型と 2 液型の違いの詳細は{" "}
              <Link href="/paint" className="text-gold border-b border-gold/40 hover:border-gold transition-colors">
                塗装ページ
              </Link>{" "}
              をご覧ください。
            </p>
          </section>

          {/* ════════════ 7. FAQ ════════════ */}
          <section>
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">FAQ</p>
            <h2 className="font-serif text-2xl lg:text-3xl text-foreground mb-6">
              よくいただくご質問
            </h2>

            <div className="border-t border-border">
              {faq.map((item, i) => (
                <details
                  key={i}
                  className="group border-b border-border [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex justify-between items-start gap-4 cursor-pointer py-5 text-foreground/90 hover:text-gold transition-colors list-none">
                    <span className="text-[14px] leading-[1.7]">
                      <span className="text-gold font-mono mr-3">Q.</span>
                      {item.q}
                    </span>
                    <span className="text-gold text-sm flex-none mt-1 transition-transform group-open:rotate-180">
                      ▼
                    </span>
                  </summary>
                  <div className="pb-6 pl-7 pr-2 text-[13px] leading-[2] text-foreground/75">
                    <span className="text-gold/70 font-mono mr-2">A.</span>
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* ════════════ 8. 対応製品 ════════════ */}
          <section>
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">Products</p>
            <h2 className="font-serif text-2xl lg:text-3xl text-foreground mb-6">
              亜鉛メッキ仕上げの製品
            </h2>
            <p className="text-[14px] leading-[1.9] text-foreground/80 mb-10 max-w-[760px]">
              ado の屋外設置製品はすべて二重防錆処理を標準装備。代表的なモデルをご紹介します。
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((p) => (
                <Link
                  key={p.slug}
                  href={`/products/${p.slug}`}
                  className="group block border border-border hover:border-gold transition-colors rounded-sm overflow-hidden bg-card/60"
                >
                  <div className="relative aspect-[4/3] bg-card overflow-hidden">
                    <Image
                      src={galleryUrl(`${p.imgId}.jpg`)}
                      alt={p.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-gold mb-1">
                      Outdoor Handrail
                    </p>
                    <h3 className="font-serif text-base text-foreground mb-1">{p.title}</h3>
                    <p className="text-[12px] text-foreground/65">{p.subtitle}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* ════════════ 9. 屋内向けへの導線 ════════════ */}
          <section className="border border-border bg-card/40 p-6 lg:p-8 rounded-sm flex flex-col lg:flex-row lg:items-center gap-5 justify-between">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-gold mb-1">Indoor</p>
              <h3 className="font-serif text-lg text-foreground mb-1">屋内用の塗装について</h3>
              <p className="text-[13px] text-foreground/70">
                屋内設置のアイアン製品は、2 液型ウレタン塗装で美しく仕上げています。
              </p>
            </div>
            <Link
              href="/paint"
              className="inline-block text-[11px] tracking-[0.2em] uppercase text-gold border-b border-gold hover:opacity-70 transition-opacity self-start lg:self-auto"
            >
              2 液型ウレタン塗装について →
            </Link>
          </section>

          {/* ════════════ 10. CTA ════════════ */}
          <section className="text-center pt-10 border-t border-border">
            <h2 className="font-serif text-2xl lg:text-3xl text-foreground mb-4">
              屋外設置のご相談はこちらから。
            </h2>
            <p className="text-[14px] text-foreground/75 leading-[1.9] mb-8 max-w-[560px] mx-auto">
              設置場所・サイズ・色味のご希望を教えてください。図面・お見積りを無料でご提案いたします。
            </p>
            <PrimaryCTA href="/contact" variant="gold" size="lg" withShimmer={true}>
              お問い合わせする
            </PrimaryCTA>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
