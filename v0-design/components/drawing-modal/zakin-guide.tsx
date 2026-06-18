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

/** 実物写真に引き出し線注釈を重ねた「手すり・支柱・座金」の取り付けイメージ */
function ZakinDiagram() {
  return (
    <img
      src="/images/zakin-diagram.jpg"
      alt="手すりを支柱と座金で壁に固定する側面イメージ"
      className="w-[112px] h-auto shrink-0 rounded"
    />
  )
}
