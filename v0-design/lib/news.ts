// お知らせデータ
// 新しいお知らせは先頭 (最新順) に追加する

export interface NewsItem {
  date: string // "2025.04.10" 形式
  isNew?: boolean
  title: string
  body?: string // 詳細本文 (オプション)
}

export const NEWS: NewsItem[] = [
  {
    date: "2025.04.10",
    isNew: true,
    title: "【施工動画】階段手すりのオーダー制作例 — 職人の技と現場の息遣いをご紹介します。",
  },
  {
    date: "2025.04.01",
    isNew: true,
    title: "2025年4月 価格改定のお知らせ — 一部商品の価格を改定いたしました。",
  },
  {
    date: "2025.02.01",
    title: "新商品「Clémence クレマンス」横型フラットバー手すり 発売開始しました。",
  },
  {
    date: "2024.12.20",
    title: "年末年始の営業について — 12/28〜1/5は冬季休業とさせていただきます。",
  },
]
