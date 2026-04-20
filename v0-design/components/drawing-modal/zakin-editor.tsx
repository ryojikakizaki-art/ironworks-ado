"use client"

import { useEffect, useMemo, useState } from "react"
import { Minus, Plus, X, RotateCcw } from "lucide-react"
import { calcZakin, getZakinPositions, END_DIST_MM, MAX_SPAN_MM, type ZakinRule } from "@/lib/drawing-modal/rene-constants"

export interface ZakinState {
  positions: number[] // mm
  angleDeg: number // 0-60
  angleDir: "left" | "right"
  customMode: boolean // false = auto, true = manually edited
}

interface ZakinEditorProps {
  lengthMm: number
  state: ZakinState
  onChange: (next: ZakinState) => void
  className?: string
  zakinRule?: ZakinRule
}

/**
 * 簡易座金エディター (rene.html の zakin-custom-panel + ze-overlay の統合版)
 * - 数量 +/- / 直接入力
 * - 個別位置入力
 * - 角度 (0-60°) と方向 (left/right)
 * - 自動配置に戻すボタン
 * - 警告: 座金間隔が MAX_SPAN_MM を超えると表示
 */
export function ZakinEditor({
  lengthMm,
  state,
  onChange,
  className,
  zakinRule,
}: ZakinEditorProps) {
  const [open, setOpen] = useState(false)
  const ruleMaxSpan = zakinRule?.maxSpanMm ?? MAX_SPAN_MM
  const ruleEndMin = zakinRule?.endMinMm ?? END_DIST_MM

  // 長さが変わったとき、座金を再配置する。
  // - 自動モード: calcZakin(lengthMm) で座金数を再計算して等間隔配置
  // - カスタムモード: 現在の座金数を保って新しい長さで等間隔配置
  //   (これがないとドラッグした座金が新しい長さでバーから はみ出す)
  useEffect(() => {
    const count = state.customMode
      ? state.positions.length
      : calcZakin(lengthMm, zakinRule)
    const positions = getZakinPositions(lengthMm, count, zakinRule)
    onChange({ ...state, positions })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lengthMm])

  const maxSpan = useMemo(() => {
    const sorted = [...state.positions].sort((a, b) => a - b)
    const all = [0, ...sorted, lengthMm]
    let m = 0
    for (let i = 1; i < all.length; i++) m = Math.max(m, all[i] - all[i - 1])
    return m
  }, [state.positions, lengthMm])

  const warning = maxSpan > ruleMaxSpan

  const setCount = (count: number) => {
    const c = Math.max(2, Math.min(20, count))
    const positions = getZakinPositions(lengthMm, c, zakinRule)
    onChange({ ...state, positions, customMode: true })
  }

  const setPosition = (idx: number, val: number) => {
    const v = Math.max(0, Math.min(lengthMm, Math.round(val) || 0))
    const next = [...state.positions]
    next[idx] = v
    onChange({ ...state, positions: next, customMode: true })
  }

  const removePosition = (idx: number) => {
    if (state.positions.length <= 2) return
    const next = state.positions.filter((_, i) => i !== idx)
    onChange({ ...state, positions: next, customMode: true })
  }

  const reset = () => {
    const count = calcZakin(lengthMm, zakinRule)
    const positions = getZakinPositions(lengthMm, count, zakinRule)
    onChange({ positions, angleDeg: 0, angleDir: "left", customMode: false })
  }

  return (
    <div className={className ?? ""}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between gap-2 px-4 py-3 text-[11px] tracking-[0.1em] border transition-colors ${
          open || state.customMode
            ? "border-gold text-gold bg-gold/5"
            : "border-border text-muted-foreground hover:border-gold hover:text-gold"
        }`}
      >
        <span>▸ 座金位置・角度を設定する{state.customMode ? "（カスタム）" : ""}</span>
        <span className={`transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="border border-border bg-card p-4 mt-2 space-y-4">
          {/* Quantity */}
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <span className="text-[12px] text-foreground min-w-[60px]">座金数</span>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setCount(state.positions.length - 1)}
                className="w-8 h-8 border border-border text-gold hover:bg-gold/10 transition-colors rounded-l-md"
                aria-label="減らす"
              >
                <Minus className="w-4 h-4 mx-auto" />
              </button>
              <input
                type="number"
                min={2}
                max={20}
                value={state.positions.length}
                onChange={(e) => setCount(parseInt(e.target.value) || 2)}
                className="w-12 h-8 bg-background border-y border-border text-center text-foreground text-[13px] font-mono"
              />
              <button
                type="button"
                onClick={() => setCount(state.positions.length + 1)}
                className="w-8 h-8 border border-border text-gold hover:bg-gold/10 transition-colors rounded-r-md"
                aria-label="増やす"
              >
                <Plus className="w-4 h-4 mx-auto" />
              </button>
            </div>
            <span className="text-[10px] text-muted-foreground ml-2">
              推奨間隔 {ruleMaxSpan}mm 以内
            </span>
          </div>

          {/* Angle */}
          <div className="flex items-center gap-3 pb-3 border-b border-border flex-wrap">
            <span className="text-[12px] text-foreground min-w-[60px]">角度</span>
            <div className="flex">
              <button
                type="button"
                onClick={() =>
                  onChange({ ...state, angleDir: "left", customMode: true })
                }
                className={`px-3 py-1 text-[11px] border transition-colors rounded-l-md ${
                  state.angleDir === "left"
                    ? "bg-gold text-dark border-gold font-semibold"
                    : "border-border text-muted-foreground hover:border-gold"
                }`}
              >
                左
              </button>
              <button
                type="button"
                onClick={() =>
                  onChange({ ...state, angleDir: "right", customMode: true })
                }
                className={`px-3 py-1 text-[11px] border-y border-r transition-colors rounded-r-md ${
                  state.angleDir === "right"
                    ? "bg-gold text-dark border-gold font-semibold"
                    : "border-border text-muted-foreground hover:border-gold"
                }`}
              >
                右
              </button>
            </div>
            <input
              type="number"
              min={0}
              max={60}
              step={1}
              value={state.angleDeg}
              onChange={(e) =>
                onChange({
                  ...state,
                  angleDeg: Math.max(0, Math.min(60, parseInt(e.target.value) || 0)),
                  customMode: true,
                })
              }
              className="w-16 h-8 bg-background border border-border text-center text-foreground text-[13px]"
            />
            <span className="text-[11px] text-muted-foreground">°</span>
            <span className="text-[10px] text-muted-foreground ml-auto">+¥2,000/座金</span>
          </div>

          {/* Position list */}
          <div>
            <div className="text-[11px] text-muted-foreground mb-2">座金位置 (mm)</div>
            <div className="flex flex-wrap gap-2">
              {state.positions.map((pos, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <span className="text-[10px] text-gold font-semibold w-4">
                    {idx + 1}
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={lengthMm}
                    value={pos}
                    onChange={(e) => setPosition(idx, Number(e.target.value))}
                    className="w-20 h-8 bg-background border border-border text-center text-foreground text-[12px]"
                  />
                  {state.positions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removePosition(idx)}
                      className="text-muted-foreground hover:text-red-400 transition-colors"
                      aria-label="削除"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Reset */}
          <div className="flex items-center gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 px-3 py-2 text-[11px] text-muted-foreground border border-border hover:border-gold hover:text-gold transition-colors rounded-md"
            >
              <RotateCcw className="w-3 h-3" />
              自動配置に戻す
            </button>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              ※ 両端から {ruleEndMin}mm 以上の位置に配置してください
            </p>
          </div>

          {/* Warning */}
          {warning && (
            <div className="border border-yellow-500/40 bg-yellow-500/5 px-3 py-2 text-[11px] text-yellow-400">
              ⚠ 座金間隔が {ruleMaxSpan}mm を超えています（最大 {maxSpan}mm）。強度にご注意ください。
            </div>
          )}
        </div>
      )}
    </div>
  )
}
