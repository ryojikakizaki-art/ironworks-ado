# ironworks-ado（ZESTグループ ECサイト）

このリポジトリはアイアン手すりECサイト「ironworks ado」の本番コードです。

## 知識・ルールの参照先

蠣﨑さんの全業務の知識・ルールは **`~/Desktop/zest/_shared-memory/`** に集約されています。
このリポジトリで作業するときも、必ず該当ファイルを読んでから着手してください。

| 作業内容 | 読むファイル |
|---|---|
| ECサイト全般（技術・構成・保存ルール） | `~/Desktop/zest/_shared-memory/ec-site-overview.md` |
| UI・デザイン変更 | `~/Desktop/zest/_shared-memory/ec-rules-ui-design.md` |
| PR・デプロイ・Git操作 | `~/Desktop/zest/_shared-memory/ec-rules-git-deploy.md` |
| skill呼び出し方 | `~/Desktop/zest/_shared-memory/ec-rules-skills.md` |
| 商品仕様・価格 | `~/Desktop/zest/_shared-memory/ec-knowledge-products.md` |
| 会社・工房の基本情報 | `~/Desktop/zest/_shared-memory/company-profile.md` |
| 広告・マーケティング | `~/Desktop/zest/_shared-memory/marketing.md` |

セッション全体の窓口・行動ルールは `~/Desktop/zest/CLAUDE.md` を参照。

## 絶対遵守ルール（安全網・詳細は上記ファイル）

1. **許可確認なしで進める** — 編集・Bash・PR作成・マージまで自動。視覚変更のみPR前にプレビュー確認を取る。
2. **指示していない箇所は触らない** — 「整理」「簡素化」名目でも指示外の削除禁止。
3. **UI変更前に必ず skill を起動** — `anthropic-skills:ado-ui-change-review`（落とし穴チェック）、新規ページ・刷新は `anthropic-skills:ec-site-handmade-art` を併用。
4. **React管理下のSSR DOMを vanilla JS で操作しない** — `.remove()` 厳禁。CSS class/attribute トグルで隠す。破るとナビゲーションが壊れる。
5. **背景・カード地色は薄いグレー** — ベージュ系（`#f9f7f4` `#f0eeeb`）禁止。`#f3f4f6` / `#e5e7eb` に統一。
6. **触らないもの** — `ironworks-ado-calendar-*.json`（鍵）、`item/`・`_archive_legacy/`（旧版）。

## ファイル構成（概要）
- `v0-design/` — 本番コード（Next.js App Router / Tailwind v4）
- `api/` — Vercel Functions（checkout/webhook/contact/session）
- `js/` — API共有ライブラリ
- `_drafts/` — メモ・草案
- デプロイ: main へ push で Vercel 自動デプロイ
