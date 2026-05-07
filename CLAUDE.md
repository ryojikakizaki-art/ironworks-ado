# ironworks-ado プロジェクト概要

## サイト概要
アイアンワーク（鉄製手すり）のECサイト。
商品ページで価格計算・SVG生成・Stripe決済を行う。

## 技術スタック
- 本番: v0-design/ (Next.js)
- API: api/ (Vercel Functions / Stripe / Google Calendar / Resend)
- 旧版: item/, _archive_legacy/ (next.config.mjs の 301 redirects で吸収済み)

## インフラ
- ホスティング: Vercel
- デプロイ: GitHubのmainブランチにpushで自動デプロイ
- 決済: Stripe

## ファイル構成
```
ironworks-ado/
├── CLAUDE.md
├── package.json, vercel.json     ← デプロイ設定
├── v0-design/                    ← 本番コード（Next.js）
├── api/                          ← Vercel Functions (checkout/webhook/contact/session)
├── js/                           ← API共有ライブラリ (vercel.json から参照)
├── images/                       ← 旧版時代の共通画像（参照は限定的）
├── item/                         ← 旧版静的HTML（編集不可・next.config.mjsで301リダイレクト）
├── _archive_legacy/              ← 旧版静的サイト（編集不要・301で吸収済み）
├── drafting-agent/               ← 別サービス (FastAPI + MCP, Railway デプロイ)
├── node_modules/                 ← npm依存 (stripe / googleapis)
└── ironworks-ado-calendar-*.json ← Google Calendar 鍵 (.gitignore済み・触らない)
```

## 新規ファイル保存ルール

新しいファイルを作る前に、用途に応じた保存先を判断する。直下に「とりあえず」置かない。

| 用途 | 保存先 |
|---|---|
| 本番コード (Next.js) | `v0-design/app/` `components/` `lib/` `hooks/` |
| 画像・アイコン (Web用) | `v0-design/public/images/` |
| Vercel Functions | `api/` |
| API 共有ロジック | `js/` |
| drafting-agent (FastAPI) | `drafting-agent/` |
| メモ・草案・実験 | `_drafts/`（なければ作る） |
| 大型メディア (>10MB の画像/動画) | リポジトリ外。外付けHDD `/Volumes/Elements/ironworks-ado_アーカイブ/` へ |
| 機密 (鍵 / API key / パスワード) | リポジトリ外。やむを得ず置くときは `.gitignore` に必ず追加 |

NG パターン：
- 直下に「とりあえず」HTML や画像を置く → 散らばり化
- 大型メディア（.mov, 大量の .jpg）を repo に置く → fsevents 負荷でフリーズの原因
- 機密 JSON を直下にコミット → 即取り消し対応が必要

---

# Claudeへの行動ルール（全セッション共通・必ず守ること）

## 1. 許可を求めず進める
- ファイル編集・Bash実行・PR作成・マージ、すべて許可確認なしで実行する
- 「やっていいですか？」と聞かない。指示を受けたら即実行する

## 2. PR・マージは全自動
- gh CLI（~/bin/gh）を使い、PR作成 → squash merge → ブランチ削除 まで全自動で行う
- ブラウザ操作は不要。コマンド一本で完結させる
- 「任せます」と言われたら最後（マージ完了）まで止まらない

## 3. 視覚変更はPR前にプレビュー確認を取る
- 図面・SVG・レイアウト・文字・色・価格表示 に影響する変更は：
  1. コード編集 → プレビュー起動 → URLをユーザーに案内
  2. ユーザーから「OK」をもらってから commit → push → PR → merge
- 純粋なロジック・API・設定のみの変更（視覚に出ない）は確認不要で自動進行してよい
- 判断に迷うときは確認を優先する

## 4. 苦手な作業は止まって代替案を提示する
- SVG精密図面・複雑なCAD描写など、精度が出にくいと判断したら無理に進めない
- 「この作業は得意でないため、別の方法を提案します」と正直に伝える
- 代替案を提示する（外部ツール連携、既存SVGの活用、スケッチのコード化 など）
- 得意分野（コードロジック・計算・レイアウト構成）に集中する

## 5. 指示していない機能を削除・変更しない
- ユーザーが指示した箇所のみ変更する
- 「整理」「簡素化」の名目でも、指示されていない要素の削除は禁止
- DOM要素を削除するときは、そのid/classを参照するJSを必ず全検索してから対応する
- CSS変更後・コンフリクト解決後は括弧の対応を確認する

## 6. 変更前チェックリスト
1. 変更対象の関数・要素を参照している箇所を把握する
2. DOM削除時はJSの参照を全検索し、nullエラーが出ないよう対応する
3. ロジック変更時は増加・減少の両方向でテストする
4. 変更後はプレビューで既存機能（モーダル・価格計算・座金自動追加）の動作を確認する

## 7. 選択肢の提示方法
- 複数の選択肢をユーザーに提示する場合は AskUserQuestion ツールを使う
- Markdownの `- [ ]` チェックボックスは使わない（クリックできないため）
- 推奨案は先頭に配置し (Recommended) を付ける

## 8. デザイン作業はデザイン特化 skill を必ず呼び出す
**【最優先・繰り返し指摘】** UI / レイアウト / グラフィック / トップページ刷新 / バナー / ロゴ など「デザイン性を求める作業」のときは、必ずデザイン特化 skill を呼び出してから着手する。素の Edit/Write だけで進めない（何度もやり直しになる）。

### 8a. ado サイト本体（v0-design/）の UI 変更は ado-ui-change-review を最優先で起動

**【最重要・繰り返し指摘】** ado サイトの UI / ヒーロー / ヘッダー / スプラッシュ / カテゴリードック / レイアウト / 配色 / 文字サイズ / モバイル対応 を触る作業では、まず：

```
anthropic-skills:ado-ui-change-review
```

を必ず起動する。`ironworks-ado-skills/ado-ui-change-review.skill` に格納され、**過去 4 セッションで踏んだ落とし穴（Tailwind v4 layer 落ち / viewport-fit 抜け / Next/Image fill / ado_logo_W/K 切替 / contrast / safe-area-inset / CSS バンドル落ち / 文字サイズ過小）を全部チェックリスト化** している。これを通さずに修正すると「修正の修正」のループになるので、視覚に出る変更では必ず先頭で呼ぶ。

その上で、より「デザイン性を求める作業」（新規ページ作成 / トップ刷新 / バナー / ロゴ）では下記 skill も併用する。

該当 skill 例：
- `anthropic-skills:web-artifacts-builder` — Web ページ／React アートワーク（**新規 artifact 用。既存 Next.js 修正には使えない**）
- `anthropic-skills:canvas-design` — ポスター・静的アート・PDF
- `anthropic-skills:theme-factory` — テーマ／配色適用
- `anthropic-skills:brand-guidelines` — Anthropic ブランド系
- `anthropic-skills:ec-site-handmade-art` — ハンドメイド EC（ワイヤー／レイアウト／ロゴ／バナー／請求書）
- `anthropic-skills:algorithmic-art` — p5.js 生成アート
- `anthropic-skills:slack-gif-creator` — アニメ GIF
- `anthropic-skills:pptx` / `docx` / `xlsx` / `pdf` — 各種ドキュメント整形

ロジック・API・設定など「視覚に出ない作業」は通常通りで OK。

## 9. SEO 作業は SEO 特化 skill を必ず呼び出す
SEO に関わる作業のときは、以下の skill を先に呼び出してから着手する。素の Edit/Write + 手動確認だけで進めない。

| skill | 使う場面 |
|---|---|
| `searchfit-seo:seo-auditor` | サイト全体の SEO 監査（canonical / sitemap / 構造化データ一括確認） |
| `searchfit-seo:technical-seo` | canonical タグ・robots.txt・Core Web Vitals などの技術的 SEO |
| `searchfit-seo:on-page-seo` | 商品ページ・コンテンツページのタイトル／description／見出し品質チェック |
| `searchfit-seo:keyword-clustering` | 「アイアン手すり」「鍛鉄手すり」周辺キーワードの整理・優先度付け |
| `searchfit-seo:content-strategy` | ストーリー・ブログ・LP の記事計画を立てるとき |

## 10. エンジニアリング系の定型作業は engineering skill を使う
以下の場面では対応する engineering skill を呼び出す。

| skill | 使う場面 |
|---|---|
| `engineering:deploy-checklist` | main への merge 直前・Vercel デプロイ後の確認 |
| **`engineering:code-review`** | **UI に関わる PR は必ず**、それ以外も大きめ PR は必須でマージ前に通す |
| `engineering:standup` | セッション冒頭で「今日の状況は？」を整理するとき |
| `engineering:debug` | 本番バグ・502/404/画像消失などインシデント対応時 |

## 11. 広告作業は adspirer skill を使う
Google 広告の確認・最適化は adspirer skill で実行する。Chrome MCP の手動操作だけで終わらせない。

| skill | 使う場面 |
|---|---|
| `adspirer-ads-agent:campaign-performance` | キャンペーン別クリック数・CV数・CPA の確認 |
| `adspirer-ads-agent:keyword-research` | 入札キーワードの調査・競合比較 |
| `adspirer-ads-agent:ad-campaign-best-practices` | 広告文・アセット改善の方針を立てるとき |

## 13. 縦型手すりの仕様
- Claude / Catherine / Alexandre / Antoine は縦型手すり
- 角度指定なし（常に垂直取付）
- UIは「長さ」表記（「高さ」ではない）
- 座金取付角度の変更機能は非表示
- 図面はCAD風（外枠・タイトルブロック・寸法矢印あり）
- René / Claire / Marcel / Émile は横型手すり（別仕様）
