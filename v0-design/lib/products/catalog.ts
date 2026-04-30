// 製品一覧用カタログデータ
// 既存 item.html の PRODUCTS 配列を harvest
// 内部詳細ページがある商品は href が /products/{slug}、他は外部 stores.jp URL

export type CategoryKey =
  | "handrail_h"
  | "handrail_v"
  | "approach"
  | "fence"
  | "door"
  | "stair"
  | "other"

export interface CategoryDef {
  key: CategoryKey | "all"
  label: string
}

export const CATEGORIES: CategoryDef[] = [
  { key: "all", label: "All" },
  { key: "handrail_h", label: "手すり 横型" },
  { key: "handrail_v", label: "手すり 縦型" },
  { key: "approach", label: "アプローチ" },
  { key: "fence", label: "フェンス" },
  { key: "door", label: "ドア" },
  { key: "stair", label: "階段" },
  { key: "other", label: "その他" },
]

export interface CatalogProduct {
  cat: CategoryKey
  label: string // "壁付け手すり ・ 横型" など
  name: string // "René ルネ"
  sub: string // "25φ マットブラック"
  price: number // 0 = 要見積もり
  badge?: string // "Best Seller" | "Artisan" など
  img: string // CDN image ID (拡張子なし)
  href: string // 遷移先 (内部: /products/{slug}, 外部: https://...)
  external?: boolean // 外部リンクフラグ
}

export const CATALOG_PRODUCTS: CatalogProduct[] = [
  // 横型手すり (4 商品 — 内部詳細ページあり)
  { cat: "handrail_h", label: "壁付け手すり ・ 横型", name: "René ルネ", sub: "25φ マットブラック", price: 36500, badge: "Best Seller", img: "d0f5f0e83d40a4d29044", href: "/products/rene" },
  { cat: "handrail_h", label: "壁付け手すり ・ 横型", name: "Claire クレール", sub: "25φ マットホワイト", price: 42000, img: "0a0c0c78f9f636cca733", href: "/products/claire" },
  { cat: "handrail_h", label: "壁付け手すり ・ 横型", name: "Marcel マルセル", sub: "フラットバー マットブラック", price: 36000, img: "939d0690971c550c1dd9", href: "/products/marcel" },
  { cat: "handrail_h", label: "壁付け手すり ・ 横型", name: "Émile エミール", sub: "フラットバー 鎚目 銀古美仕上げ", price: 45800, img: "fa95f550baa05216d291", href: "/products/emile" },

  // 横型ロートアイアン (2 商品 — 外部)
  { cat: "handrail_h", label: "ロートアイアン ・ 横型", name: "Élisabeth エリザベート", sub: "鍛冶職人手打ち ロートアイアン 22φ", price: 149000, badge: "Artisan", img: "9a24b2c661dea08ef6f4", href: "/products/elisabeth" },
  { cat: "handrail_h", label: "ロートアイアン ・ L型", name: "Clémence クレマンス", sub: "L型 22φ 無垢鉄", price: 88000, img: "9c1e7cf67204880a41e2", href: "/products/clemence" },

  // 縦型手すり (4 商品 — 内部詳細ページあり)
  { cat: "handrail_v", label: "壁付け手すり ・ 縦型", name: "Claude クロード", sub: "25φ マットブラック", price: 30000, img: "86278edb68c21957e339", href: "/products/claude" },
  { cat: "handrail_v", label: "壁付け手すり ・ 縦型", name: "Catherine カトリーヌ", sub: "25φ マットホワイト", price: 34500, img: "8775cfcb40298257834a", href: "/products/catherine" },
  { cat: "handrail_v", label: "壁付け手すり ・ 縦型", name: "Alexandre アレクサンドル", sub: "太 31.8φ マットブラック", price: 32000, img: "759848de1a99945b4d90", href: "/products/alexandre" },
  { cat: "handrail_v", label: "壁付け手すり ・ 縦型", name: "Antoine アントワーヌ", sub: "ロング 25φ マットブラック", price: 56000, img: "2d1043dcd7658a96e5f3", href: "/products/antoine" },

  // 縦型ロートアイアン (5 商品 — 外部)
  { cat: "handrail_v", label: "ロートアイアン ・ 縦型", name: "Scroll スクロール 16φ", sub: "70cm 無垢鉄 火造り鍛造", price: 18000, img: "2a64ecfb5e50e78cb374", href: "/products/scroll16" },
  { cat: "handrail_v", label: "ロートアイアン ・ 縦型", name: "Scroll スクロール 19φ", sub: "70cm 無垢鉄 火造り鍛造", price: 32000, img: "25b6438ea6a9393aa027", href: "/products/scroll19" },
  { cat: "handrail_v", label: "ロートアイアン ・ 縦型", name: "Scroll スクロール 22φ", sub: "80cm 無垢鉄 火造り鍛造", price: 60000, img: "d09c9426e8510d2ca152", href: "/products/scroll22" },
  { cat: "handrail_v", label: "ロートアイアン ・ 縦型", name: "Fabrice ファブリス", sub: "80cm 無垢鉄 火造り鍛造", price: 100000, badge: "Artisan", img: "66a699b295bcdb8f3598", href: "/products/fabrice" },
  { cat: "handrail_v", label: "ロートアイアン ・ 縦型", name: "鎚目 TSUCHIME", sub: "80cm 無垢鉄 火造り鍛造", price: 70000, badge: "Artisan", img: "569af3ee76a1999863e7", href: "/products/tsuchime" },

  // アプローチ (3 商品)
  { cat: "approach", label: "アプローチ手すり", name: "Simple -black-", sub: "フラットバー マットブラック", price: 0, img: "579e79e794eed28d9ac7", href: "/products/simple-black" },
  { cat: "approach", label: "アプローチ手すり", name: "アプローチ手すり『蔦』", sub: "アートアイアン 亜鉛メッキ", price: 132000, badge: "Artisan", img: "051b216ddd9e64d0ae37", href: "/products/tsuta" },
  { cat: "approach", label: "アプローチ手すり", name: "Simple -white-", sub: "フラットバー マットホワイト", price: 0, img: "ef1a6b4999d530d6fb67", href: "/products/simple-white" },

  // フェンス (3 商品)
  { cat: "fence", label: "アイアンフェンス", name: "吹き抜けアイアンフェンス", sub: "オーダーメイド", price: 0, img: "1aaca5578d6e1f890e31", href: "/products/fence-fukinuke" },
  { cat: "fence", label: "アイアンフェンス", name: "屋外フェンス『zigzag』", sub: "外構 フェンス オーダーメイド", price: 0, img: "ff214d4dd6a4e6f0b3b1", href: "/products/fence-zigzag" },
  { cat: "fence", label: "ロートアイアン面格子", name: "面格子 -simple-", sub: "窓 防犯 後付け", price: 0, img: "9a7ccb077d6627266f13", href: "/products/mengoshi" },

  // ドア (2 商品)
  { cat: "door", label: "アイアンドア", name: "Barn Door バーンドア", sub: "室内スライドドア マットブラック", price: 275000, img: "ef8821265072eeb099dc", href: "/products/barn-door" },
  { cat: "door", label: "ロートアイアンドア", name: "Arabesque Gate", sub: "室内扉 マットブラック", price: 253000, badge: "Artisan", img: "b8269f71f7c7462e47a1", href: "/products/arabesque" },

  // 階段 (3 商品)
  { cat: "stair", label: "スケルトン階段", name: "スケルトン階段 -直線-", sub: "オーダーメイド", price: 0, img: "7a3358b5d7a86318eda1", href: "/products/stair-straight" },
  { cat: "stair", label: "スケルトン階段", name: "スケルトン階段 -廻り階段-", sub: "力桁1本型 オーダーメイド", price: 1400000, img: "853fb7dae26475eee4a0", href: "/products/stair-spiral" },
  { cat: "stair", label: "鉄骨外階段", name: "鉄骨外階段 -かね折れ-", sub: "外階段 オーダーメイド", price: 0, img: "6957d69de71788107932", href: "/products/stair-outdoor" },

  // その他 (4 商品)
  { cat: "other", label: "ペット用品", name: "ドッグゲート", sub: "H95×W70〜80cm", price: 130000, img: "f91ef98ec5690d2f9562", href: "/products/dog-gate" },
  { cat: "other", label: "インテリア", name: "パーテーション", sub: "アイアンフレーム アクリルパネル", price: 0, img: "162201d592318f444a98", href: "/products/partition" },
  { cat: "other", label: "家具", name: "横揺れしないテーブル脚", sub: "アイアンレッグ サイズオーダー", price: 0, img: "720c42cc222961d0c4f7", href: "/products/table-leg" },
  { cat: "other", label: "家具・インテリア", name: "アイアンラック", sub: "アイアンシェルフ 棚 什器", price: 0, img: "2aecc4e6b289986d9859", href: "/products/iron-rack" },
]

/**
 * 同カテゴリ内の関連商品を返す（自分自身は除外）
 * 足りない場合は件数が少ないまま返す（最大 count 件）
 */
export function getRelatedProducts(slug: string, count = 3): CatalogProduct[] {
  const selfHref = `/products/${slug}`
  const self = CATALOG_PRODUCTS.find((p) => p.href === selfHref)
  if (!self) return []
  return CATALOG_PRODUCTS.filter((p) => p.cat === self.cat && p.href !== selfHref).slice(0, count)
}
