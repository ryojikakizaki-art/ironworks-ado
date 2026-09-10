// お知らせデータ
//
// 追加の仕方（このファイルだけ触れば済むようにしてある）:
//   1. 見出しだけのお知らせ  → NEWS の先頭に 1 件足す（href に飛ばしたいページを書く）
//   2. 本文を持つ記事        → NEWS_ARTICLES に足し、NEWS 側の href を "/news/<slug>" にする
//   3. SNS 投稿             → category: "SNS" + href に投稿 URL（外部 URL は自動で別タブ）

export type NewsCategory = "お知らせ" | "新商品" | "施工事例" | "SNS" | "メディア"

export interface NewsItem {
  date: string // "2026.09.10" 形式
  isNew?: boolean // 明示指定がなければ date から自動判定 (60日以内)
  /** 見出しの手前に出す分類タグ。省略時は「お知らせ」扱い */
  category?: NewsCategory
  title: string
  body?: string // 一覧ページでの補足 (オプション)
  /**
   * 見出しのリンク先。
   * - 内部ページ: "/products/clemence" "/news/shipping-revision-2026-10"
   * - 外部 URL:   "https://www.instagram.com/ironworks_ado/" → 別タブで開く
   * 省略するとリンクなしのテキストとして表示される。
   */
  href?: string
}

/** href が外部 URL か（SNS 投稿など。別タブ + rel="noopener" で開く） */
export function isExternalHref(href?: string): href is string {
  return typeof href === "string" && /^https?:\/\//.test(href)
}

/** 表示用の分類タグ（未指定は「お知らせ」） */
export function newsCategory(item: NewsItem): NewsCategory {
  return item.category ?? "お知らせ"
}

/**
 * 帯・一覧で使う短い見出し。
 * title が「見出し ── 説明文」の形なら区切りの手前だけを返す
 * （お知らせの本文は長くなりがちなので、並べたときに 1 行で読めるようにする）。
 */
export function newsHeadline(item: NewsItem): string {
  return item.title.split(/\s*(?:\u2500\u2500|\u2014)\s*/)[0]
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
    date: "2026.09.10",
    category: "お知らせ",
    title:
      "2026年10月1日ご注文分より、送料を一律 300円 改定させていただきます ── 商品本体の価格は据え置きです。",
    body: "運賃・梱包資材の値上がりを受け、1 梱包あたり一律 300 円（税抜）の改定をお願いいたします。9月30日までのご注文は現行の送料です。",
    href: "/news/shipping-revision-2026-10",
  },
  {
    date: "2026.04.28",
    category: "新商品",
    title: "Creema で人気の「レンジフードフック」を ado オンラインショップでもお取り扱い開始しました — 鍛冶職人による鍛造アイアンフック。在庫あり、2 営業日以内に発送いたします。",
    href: "/products/range-hood-hook",
  },
  {
    date: "2026.04.27",
    category: "お知らせ",
    title: "「代表あいさつ」「工房について」ページを刷新いたしました — 鍛冶職人 蠣﨑良治の歩みと工房の想いを丁寧にご紹介しています。",
    href: "/greeting",
  },
  {
    date: "2026.04.15",
    category: "お知らせ",
    title: "納期目安のご案内 — オーダーメイド製品はご注文確定から 10 営業日が標準納期です。在庫品（レンジフードフック等）は 2 営業日以内に発送いたします。",
    href: "/faq",
  },
  {
    // 2026-07-02: 「2025.04.10」は年の誤記だったため 2026 に修正（蠣﨑さん確認済み）
    date: "2026.04.10",
    category: "施工事例",
    title: "【施工動画】階段手すりのオーダー制作例 — 職人の技と現場の息遣いをご紹介します。",
    href: "/construction",
  },
  {
    date: "2025.04.01",
    category: "お知らせ",
    title: "2025年4月 価格改定のお知らせ — 一部商品の価格を改定いたしました。",
  },
  {
    date: "2025.02.01",
    category: "新商品",
    title: "新商品「Clémence クレマンス」横型フラットバー手すり 発売開始しました。",
    href: "/products/clemence",
  },
  {
    date: "2024.12.20",
    category: "お知らせ",
    title: "年末年始の営業について — 12/28〜1/5は冬季休業とさせていただきます。",
  },
]

// ── 本文を持つお知らせ記事（/news/<slug>） ────────────────────────────

export interface NewsArticleSection {
  h2: string
  /** 段落の配列。各要素が <p> になる。[テキスト](/path) で内部リンクを書ける */
  body: string[]
  table?: { headers: string[]; rows: string[][] }
}

export interface NewsArticle {
  slug: string
  /** "2026.09.10" 形式。NEWS 側の date と揃える */
  date: string
  category: NewsCategory
  /** ページ内 h1 */
  title: string
  /** <title> タグ */
  metaTitle: string
  description: string
  lead: string
  sections: NewsArticleSection[]
  related: { label: string; href: string }[]
}

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    slug: "shipping-revision-2026-10",
    date: "2026.09.10",
    category: "お知らせ",
    title: "2026年10月1日ご注文分より 送料を一律 300円 改定させていただきます",
    metaTitle: "送料改定のお知らせ（2026年10月1日ご注文分より）｜IRONWORKS ado",
    description:
      "IRONWORKS ado は 2026年10月1日（木）のご注文分より、送料を 1 梱包あたり一律 300 円（税抜）改定させていただきます。商品本体の価格は据え置きです。9月30日までのご注文は現行の送料でお承りします。",
    lead:
      "いつも IRONWORKS ado をご覧いただき、ありがとうございます。2026年10月1日（木）のご注文分より、送料を 1 梱包あたり一律 300 円（税抜）改定させていただきます。商品本体の価格、採寸費・取付費は据え置きです。",
    sections: [
      {
        h2: "改定の内容",
        body: [
          "対象は 2026年10月1日（木）以降にご注文いただいた分です。9月30日（水）までにご注文いただいた分は、現行の送料でお承りします。",
          "値上げ幅は配送先・商品サイズにかかわらず、1 梱包あたり一律 300 円（税抜）です。手すりを 3 本まで 1 梱包にまとめてお送りする運用は今までどおりで、まとめてご注文いただいたときの梱包数は変わりません。",
          "送料は商品ページでお届け先の都道府県を選んでいただくと自動で計算されます。10月1日以降は改定後の金額が表示されます。",
        ],
        table: {
          headers: ["区分", "〜 9/30 のご注文", "10/1 以降のご注文"],
          rows: [
            ["1,000mm 以下・小物（全国一律）", "¥1,000", "¥1,300"],
            ["例）関東・2,000mm の手すり 1 本", "¥5,200", "¥5,500"],
            ["例）関西・3,000mm の手すり 1 本", "¥8,000", "¥8,300"],
          ],
        },
      },
      {
        h2: "なぜ改定させていただくのか",
        body: [
          "手すりは最長 5m の長尺物で、佐川急便の 260 サイズまでを使う特殊な荷物です。運送会社の運賃改定に加えて、木枠や緩衝材といった梱包資材の価格も上がり続けています。",
          "これまでは値上がり分を工房で吸収してきましたが、梱包を簡素にすると輸送中の変形や塗装の擦れにつながります。一本ずつ火造りで仕上げた手すりが、届いた時点で傷んでいるのが職人としては一番つらいところです。",
          "仕上げの質と梱包の強度を落とさずにお届けするために、今回の改定をお願いすることにしました。何とぞご理解いただけますようお願い申し上げます。",
        ],
      },
      {
        h2: "ご注文をお考えのお客さまへ",
        body: [
          "現行の送料でのご注文は 2026年9月30日（水）まで受け付けます。",
          "オーダーメイドの手すりは、寸法を決めてご注文いただくまでに数日かかることがあります。9月中のご注文をお考えの方は、早めに[お問い合わせ](/contact)ください。図面や設置場所のお写真をお送りいただければ、鍛冶職人が直接お答えします。",
          "送料の考え方や配送できない地域については[送料・配送について](/shipping)のページをご覧ください。",
        ],
      },
    ],
    related: [
      { label: "送料・配送について", href: "/shipping" },
      { label: "製品一覧を見る", href: "/products" },
      { label: "お問い合わせ", href: "/contact" },
    ],
  },
]

export function getNewsArticle(slug: string): NewsArticle | null {
  return NEWS_ARTICLES.find((a) => a.slug === slug) ?? null
}
