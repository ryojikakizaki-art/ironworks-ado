// 商品ページの「この長さを立体で見る（3D）」に使う、商品ごとの形の設定。
// ここに載っている商品だけにボタンが出る（2026-11-26 René から開始・同日 6 商品を追加）。
//
// 部品の分担:
//   - 座金＋支柱 … SolidCraft で作図した GLB（public/models/*.glb）。原本は _drafts/3d/*.solidcraft（git 対象外）
//   - バー本体   … 長さが毎回変わるので rail-3d-viewer.tsx がその場で作る
// 寸法の出どころ:
//   - 横型 … rene-svg.ts の座金側面詳細図（丸パイプは壁〜パイプ背面 40mm、FB は壁〜FB 中心 40mm。
//            支柱の水平部はバー下面から 20mm 下・R9 で上へ曲げる）。座金は丸 φ45・表の角テーパー C1.5・段付き穴3つ
//   - 縦型 … vertical-cad-svg.ts の側面図（壁〜バー背面 40mm・支柱はまっすぐ）。座金A 55×35／B 60×25 の楕円を
//            横長に付け、段付き穴2つ（40mm 間隔）。支柱径は商品の washerPostDiameter（既定 9φ）
//
// 3D にしていない商品と理由（2026-11-26）:
//   - Émile・Gaston・鎚目 … 鎚目の質感と鍛造の端が見どころで、CG ではかえって安っぽく見えるため
//   - Scroll・Fabrice・European … 渦巻きなど鍛造の形で、長さも固定のため

import { getWasherPostDiameter, type DrawingProductConfig, type WasherTypeId } from "./products"

export type Rail3DProfile =
  | { type: "round"; diameter: number }
  | { type: "flat"; width: number; thickness: number } // width＝壁から手前へ向かう幅（寝かせて付ける）

export type Rail3DColor = "black" | "white"

export interface Rail3DSpec {
  orientation: "horizontal" | "vertical"
  profile: Rail3DProfile
  color: Rail3DColor
  bracketGlb: string
}

interface ModelDef {
  orientation: "horizontal" | "vertical"
  profile: Rail3DProfile
  color: Rail3DColor
  // 横型は商品ごとに 1 種類。縦型は座金タイプ×支柱径で決まるので null
  bracketGlb: string | null
}

const ROUND_25: Rail3DProfile = { type: "round", diameter: 25.4 }

const MODELS: Record<string, ModelDef> = {
  rene: { orientation: "horizontal", profile: ROUND_25, color: "black", bracketGlb: "/models/rene-bracket.glb" },
  claire: { orientation: "horizontal", profile: ROUND_25, color: "white", bracketGlb: "/models/rene-bracket.glb" },
  marcel: {
    orientation: "horizontal",
    profile: { type: "flat", width: 32, thickness: 9 },
    color: "black",
    bracketGlb: "/models/marcel-bracket.glb",
  },
  claude: { orientation: "vertical", profile: ROUND_25, color: "black", bracketGlb: null },
  catherine: { orientation: "vertical", profile: ROUND_25, color: "white", bracketGlb: null },
  antoine: { orientation: "vertical", profile: ROUND_25, color: "black", bracketGlb: null },
  alexandre: { orientation: "vertical", profile: { type: "round", diameter: 31.8 }, color: "black", bracketGlb: null },
}

/** 縦型の座金＋支柱の GLB（作ってあるのは座金A/B × 支柱 9φ/13φ の 4 種類） */
function verticalBracketGlb(washerType: WasherTypeId, postDiameter: number): string | null {
  if (postDiameter !== 9 && postDiameter !== 13) return null
  return `/models/washer-${washerType === "B" ? "b" : "a"}-${postDiameter}.glb`
}

/**
 * 3D 表示の設定。3D にしていない商品は null（ボタンを出さない）。
 * color は白仕上げを選べる商品（Alexandre）でお客様が選んだ色。
 */
export function getRail3DSpec(
  product: DrawingProductConfig,
  opts: { washerType: WasherTypeId; color?: Rail3DColor }
): Rail3DSpec | null {
  const def = MODELS[product.slug]
  if (!def) return null
  const washerType = product.washerSpec ? opts.washerType : "A"
  const bracketGlb =
    def.bracketGlb ?? verticalBracketGlb(washerType, getWasherPostDiameter(product, washerType))
  if (!bracketGlb) return null
  return {
    orientation: def.orientation,
    profile: def.profile,
    color: product.colorOptions && opts.color ? opts.color : def.color,
    bracketGlb,
  }
}
