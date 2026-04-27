// お知らせデータ
// 新しいお知らせは先頭 (最新順) に追加する

export interface NewsItem {
  date: string // "2025.04.10" 形式
  isNew?: boolean // 明示指定がなければ date から自動判定 (60日以内)
  title: string
  body?: string // 詳細本文 (オプション)
}

// "YYYY.MM.DD" → 投稿日が過去 NEW_WINDOW_DAYS 以内なら true
const NEW_WINDOW_DAYS = 60
export function isRecentNews(date: string): boolean {
  const [y, m, d] = date.split(".").map((n) => parseInt(n, 10))
  if (!y || !m || !d) return false
  const posted = new Date(y, m - 1, d).getTime()
  const ageMs = Date.now() - posted
  return ageMs >= 0 && ageMs <= NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000
}

// 表示時の "New" バッジ判定: 明示フラグ優先、なければ日付ベース
export function shouldShowNewBadge(item: NewsItem): boolean {
  return item.isNew ?? isRecentNews(item.date)
}

export const NEWS: NewsItem[] = [
  {
    date: "2025.04.10",
    title: "【施工動画】階段手すりのオーダー制作例 — 職人の技と現場の息遣いをご紹介します。",
  },
  {
    date: "2025.04.01",
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
