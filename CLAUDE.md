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

## 8. 縦型手すりの仕様
- Claude / Catherine / Alexandre / Antoine は縦型手すり
- 角度指定なし（常に垂直取付）
- UIは「長さ」表記（「高さ」ではない）
- 座金取付角度の変更機能は非表示
- 図面はCAD風（外枠・タイトルブロック・寸法矢印あり）
- René / Claire / Marcel / Émile は横型手すり（別仕様）
