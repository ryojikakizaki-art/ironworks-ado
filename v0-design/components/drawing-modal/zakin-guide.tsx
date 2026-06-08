"use client"

import { ShieldCheck } from "lucide-react"

interface ZakinGuideProps {
  /** 横型なら階段の傾き（角度）にも触れる */
  category?: "horizontal" | "vertical"
  className?: string
}

/**
 * 座金エディターの導入ガイド。
 * 初見のお客様向けに「ほとんどの方は自動でOK」「座金とは何か」を
 * 小さな断面図と平易な言葉で伝える。
 */
export function ZakinGuide({ category = "horizontal", className }: ZakinGuideProps) {
  return (
    <div className={className ?? ""}>
      {/* 安心コピー — まず「触らなくてOK」を伝える */}
      <div className="flex items-start gap-2.5 border border-gold/30 bg-gold/[0.06] rounded-md px-4 py-3">
        <ShieldCheck className="w-5 h-5 text-gold shrink-0 mt-0.5" />
        <p className="text-[13px] leading-relaxed text-foreground">
          <span className="font-semibold">ほとんどの方は、このまま自動設定のままでOKです。</span>
          {category === "horizontal"
            ? "壁の下地の位置や、階段の傾きに合わせてこだわりたい方だけ、下で調整してください。"
            : "壁の下地の位置に合わせてこだわりたい方だけ、下で調整してください。"}
        </p>
      </div>

      {/* 座金とは — 小さな断面図で一目で伝える */}
      <div className="mt-3 flex items-center gap-4 rounded-md bg-card border border-border px-4 py-3">
        <ZakinDiagram />
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          <span className="text-foreground font-semibold">座金</span>
          <span className="text-foreground">（ざがね）</span>
          は、手すりを壁にしっかり固定する土台の金具です。
          手すりが長いほど、<span className="text-foreground font-medium">多くの座金で支えます</span>。
        </p>
      </div>
    </div>
  )
}

/** 横から見た「手すり → 支柱 → 座金 → 壁」の取り付けイメージ（上のシミュレーターと同じ視点）*/
function ZakinDiagram() {
  return (
    <svg
      viewBox="0 0 150 92"
      className="w-[112px] h-auto shrink-0"
      role="img"
      aria-label="手すりを支柱と座金で壁に固定する側面イメージ"
    >
      {/* 壁（取付面） */}
      <rect x="0" y="78" width="150" height="14" fill="#e5e7eb" />
      <line x1="0" y1="78" x2="150" y2="78" stroke="#9ca3af" strokeWidth="1.5" />
      <g stroke="#cbd0d6" strokeWidth="1">
        <line x1="8" y1="92" x2="20" y2="78" />
        <line x1="32" y1="92" x2="44" y2="78" />
        <line x1="56" y1="92" x2="68" y2="78" />
        <line x1="80" y1="92" x2="92" y2="78" />
        <line x1="104" y1="92" x2="116" y2="78" />
        <line x1="128" y1="92" x2="140" y2="78" />
      </g>

      {/* 手すりバー */}
      <line x1="12" y1="20" x2="138" y2="20" stroke="#333" strokeWidth="6" strokeLinecap="round" />
      <line x1="15" y1="18" x2="135" y2="18" stroke="#fff" strokeOpacity="0.2" strokeWidth="1.4" strokeLinecap="round" />

      {/* 支柱（アーム）2本 */}
      <line x1="46" y1="23" x2="46" y2="76" stroke="#555" strokeWidth="3" />
      <line x1="104" y1="23" x2="104" y2="76" stroke="#555" strokeWidth="3" />

      {/* 座金（壁付けプレート） */}
      <rect x="37" y="72" width="18" height="7" rx="3" fill="#c8a96e" stroke="#b2925a" strokeWidth="0.8" />
      <rect x="95" y="72" width="18" height="7" rx="3" fill="#c8a96e" stroke="#b2925a" strokeWidth="0.8" />

      {/* ラベル */}
      <text x="75" y="12" fontSize="10" fill="#555" fontFamily="sans-serif" textAnchor="middle" fontWeight="600">手すり</text>
      <line x1="60" y1="66" x2="51" y2="73" stroke="#b2925a" strokeWidth="0.8" />
      <text x="62" y="64" fontSize="10" fill="#b2925a" fontFamily="sans-serif" fontWeight="700">座金</text>
      <text x="146" y="89" fontSize="9" fill="#6b7280" fontFamily="sans-serif" textAnchor="end">壁</text>
    </svg>
  )
}
