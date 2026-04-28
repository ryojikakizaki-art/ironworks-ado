"use client"

import * as React from "react"
import Link from "next/link"
import { motion, type HTMLMotionProps } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * IRONWORKS ado 共通 主要 CTA ボタン
 *
 * サイト全体で「主要なアクション」（購入・お問い合わせ・主要ナビ）に使う唯一のボタン。
 * 立体感（shadow + scale）とゴールドのシマー演出で、職人ものに相応しい高級感を担保する。
 * 新しいページ・セクションを作るときは必ずこのコンポーネントを使うこと（inline スタイルで CTA を書かない）。
 *
 * @variant gold       - メイン購入ボタン・主要 CTA（金背景・白文字・シマー）
 * @variant dark       - セカンダリ CTA（黒背景・白文字・シマー）
 * @variant outline    - 軽量 CTA（黒枠・黒文字・hover で塗り）
 * @variant ghost-light - 暗い背景（ヒーロー等）の上で使う薄い枠 CTA
 * @variant line       - LINE 公式アカウントへ誘導する CTA（LINE 公式グリーン）
 *
 * @size lg - 主要 CTA（py-5 text-[17px] font-bold）
 * @size md - セクション末尾の遷移ボタン（py-4 text-[14px] medium）
 * @size sm - 細リンク（py-2.5 text-[12px]）
 *
 * 表示テキストには自動で右矢印 ▸ が付く（withArrow=false で消せる）。
 * 左に Lucide アイコンを足したい場合は icon プロップに渡す。
 */

type CTAVariant = "gold" | "dark" | "outline" | "ghost-light" | "purchase" | "line"
type CTASize = "lg" | "md" | "sm"

const baseStyles =
  "group relative overflow-hidden inline-flex items-center justify-center gap-2 font-serif font-bold tracking-wider rounded-md transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"

const variantStyles: Record<CTAVariant, string> = {
  gold: "bg-gold text-white shadow-lg hover:shadow-xl",
  dark: "bg-dark text-white shadow-lg hover:shadow-xl",
  outline:
    "border-2 border-dark text-dark bg-white shadow-sm hover:bg-dark hover:text-white hover:shadow-lg",
  "ghost-light":
    "border-2 border-white/40 text-white bg-white/5 hover:bg-white hover:text-dark hover:border-white",
  // LINE 公式アカウントへの誘導専用 — LINE ブランドカラー (#06C755)
  line: "bg-[#06C755] text-white shadow-lg hover:bg-[#05B048] hover:shadow-xl",
  /**
   * 購入確定ボタン専用 — 内側ハイライト/シャドウと多重ベース影を重ねた「本物の金属ボタン」表現。
   * 商品ページの「購入手続きへ進む」とフローティング CTA バーだけに使う。
   *
   * 構成:
   * - 3 段グラデーション (top: 明るい黄金 → mid: 標準金 → bottom: 暗い金) で球面の陰影
   * - inset-top の白いハイライト (光源反射) + inset-bottom の暗線 (奥行き)
   * - inset-top の specular（光のテカリ）と inset-bottom の影
   * - 多層ベース影 (1px 明エッジ → 5px 暗線 = 立体的なリム) + ふんわりとした投影で浮遊感
   * - active で 5px 沈み、土台影もほぼ消える物理ボタン press フィードバック
   * - ピル型（!rounded-full）で形そのものも差別化
   */
  purchase: [
    "text-white",
    // 形: 両脇丸めたピル型（baseStyles の rounded-md を上書き）
    "!rounded-full",
    // 上面: 3 段グラデーション (上端: 明るい黄金 → 中央: 標準金 → 下端: 暗い金) で球面の陰影感
    "bg-gradient-to-b from-[#e6b94a] via-[#b6892a] to-[#6e4f10]",
    // 内外多層シャドウ:
    //   inset_0_1px_0_rgba(255,255,255,0.55)            ← 上端 1px 白ハイライト (光源反射)
    //   inset_0_-1px_0_rgba(0,0,0,0.35)                 ← 下端 1px 暗線 (奥行きエッジ)
    //   inset_0_8px_10px_-8px_rgba(255,255,255,0.45)    ← 上半 inner specular (光のテカリ)
    //   inset_0_-6px_8px_-6px_rgba(0,0,0,0.35)          ← 下半 inner shadow (球面の影)
    //   0_2px_0_-1px_#7a5d20                             ← ベース 1 段目 (薄茶)
    //   0_5px_0_-2px_#3d2f0f                             ← ベース 2 段目 (深茶) でリムを作る
    //   0_10px_16px_-4px_rgba(0,0,0,0.45)                ← 中ぼかし投影 (テーブルへの影)
    //   0_18px_30px_-8px_rgba(0,0,0,0.35)                ← 大ぼかし投影 (ふわっと浮遊感)
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-1px_0_rgba(0,0,0,0.35),inset_0_8px_10px_-8px_rgba(255,255,255,0.45),inset_0_-6px_8px_-6px_rgba(0,0,0,0.35),0_2px_0_-1px_#7a5d20,0_5px_0_-2px_#3d2f0f,0_10px_16px_-4px_rgba(0,0,0,0.45),0_18px_30px_-8px_rgba(0,0,0,0.35)]",
    // ホバー: わずかに明るく + 1px 浮き上がる + 投影が広がる
    "hover:from-[#f0c459] hover:via-[#c1942f] hover:to-[#785818]",
    "hover:-translate-y-[1px]",
    "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_0_rgba(0,0,0,0.35),inset_0_10px_12px_-8px_rgba(255,255,255,0.5),inset_0_-7px_9px_-7px_rgba(0,0,0,0.35),0_3px_0_-1px_#7a5d20,0_7px_0_-2px_#3d2f0f,0_14px_22px_-4px_rgba(0,0,0,0.5),0_22px_36px_-8px_rgba(0,0,0,0.4)]",
    // 押下: ボタンが土台にめり込み、リム影がほぼ消えて大ぼかし投影も縮む
    "active:translate-y-[5px]",
    "active:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_0_rgba(0,0,0,0.3),inset_0_4px_6px_-4px_rgba(255,255,255,0.3),inset_0_-3px_4px_-3px_rgba(0,0,0,0.3),0_0_0_-1px_#7a5d20,0_1px_0_-2px_#3d2f0f,0_2px_4px_-2px_rgba(0,0,0,0.3),0_4px_8px_-4px_rgba(0,0,0,0.25)]",
  ].join(" "),
}

const sizeStyles: Record<CTASize, string> = {
  lg: "px-8 py-5 text-[17px]",
  md: "px-8 py-4 text-[14px] font-medium",
  sm: "px-6 py-2.5 text-[12px] tracking-[0.2em] uppercase",
}

interface BaseProps {
  variant?: CTAVariant
  size?: CTASize
  withArrow?: boolean
  withShimmer?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}

interface CTALinkProps extends BaseProps {
  href: string
  external?: boolean
  type?: never
  onClick?: never
  disabled?: never
}

interface CTAButtonProps extends BaseProps {
  href?: never
  external?: never
  type?: "button" | "submit" | "reset"
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
}

type PrimaryCTAProps = CTALinkProps | CTAButtonProps

/**
 * Renders the inner content (icon + label + arrow + shimmer overlay).
 */
function CTAInner({
  icon,
  withArrow,
  withShimmer,
  variant,
  children,
}: {
  icon?: React.ReactNode
  withArrow: boolean
  withShimmer: boolean
  variant: CTAVariant
  children: React.ReactNode
}) {
  const isSolid =
    variant === "gold" ||
    variant === "dark" ||
    variant === "purchase" ||
    variant === "line"
  return (
    <>
      <span className="relative z-10 inline-flex items-center justify-center gap-2">
        {icon}
        {children}
        {withArrow && (
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        )}
      </span>
      {withShimmer && isSolid && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      )}
    </>
  )
}

export function PrimaryCTA(props: PrimaryCTAProps) {
  const {
    variant = "gold",
    size = "lg",
    withArrow = true,
    withShimmer = true,
    icon,
    children,
    className,
  } = props

  const classes = cn(baseStyles, variantStyles[variant], sizeStyles[size], className)

  // motion props (scale animation on hover/tap)
  const motionInteractions = {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
  } as const

  // Link variant
  if ("href" in props && props.href) {
    const { href, external } = props
    if (external) {
      return (
        <motion.a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
          {...motionInteractions}
        >
          <CTAInner
            icon={icon}
            withArrow={withArrow}
            withShimmer={withShimmer}
            variant={variant}
          >
            {children}
          </CTAInner>
        </motion.a>
      )
    }
    return (
      <motion.div className="inline-block" {...motionInteractions}>
        <Link href={href} className={classes}>
          <CTAInner
            icon={icon}
            withArrow={withArrow}
            withShimmer={withShimmer}
            variant={variant}
          >
            {children}
          </CTAInner>
        </Link>
      </motion.div>
    )
  }

  // Button variant
  const { type = "button", onClick, disabled } = props as CTAButtonProps
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
    >
      <CTAInner
        icon={icon}
        withArrow={withArrow}
        withShimmer={withShimmer}
        variant={variant}
      >
        {children}
      </CTAInner>
    </motion.button>
  )
}
