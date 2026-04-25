# 本番公開前 Stripe 決済テスト手順書

**対象サイト:** `ado.tantetuzest.com` (Next.js / Vercel)
**テスト商品:** Scroll スクロール 16φ (`/products/scroll16`) — 基本 ¥18,000
**発行日:** 2026-04-19

## 事前準備 (Stripe ダッシュボード)

- [ ] **[本番]** 設定 → Emails → 「Successful payments」のメール受領確認 ON
- [ ] **[本番]** 設定 → Invoice → 「Email finalized invoices to customers」ON（これで `invoice_creation` で作った領収書PDFが自動送信される）
- [ ] **[本番]** Webhook エンドポイント `https://ado.tantetuzest.com/api/webhook` が登録済・`checkout.session.completed` 受信
- [ ] Vercel 環境変数
  - [ ] `STRIPE_SECRET_KEY` (sk_live_...)
  - [ ] `STRIPE_WEBHOOK_SECRET` (whsec_...)
  - [ ] `RESEND_API_KEY`
  - [ ] `CONTACT_FROM=IRONWORKS ado <noreply@tantetuzest.com>`

## 手順 1: 実購入

1. `https://ado.tantetuzest.com/products/scroll16` を開く
2. シミュレーター等で長さ選択後、購入ボタン → Stripe Checkout へ遷移
3. **本番カード**で決済（例: 蠣崎さん個人カード）
   - メールアドレスは自分が受信確認できるアドレス
   - 氏名・住所は正しく入力

**確認:**
- [ ] `/thanks?session_id=cs_...` に遷移し、注文内容が表示される
- [ ] 決済金額: ¥18,000 (長さ 700mm・追加座金なし想定)

## 手順 2: メール受信確認

購入後 5 分以内に受信箱を確認:

- [ ] **Stripe 領収書**（件名 "Your receipt from ..."）受信
- [ ] **Stripe 請求書 PDF**（`invoice_creation` 由来、件名 "Invoice from IRONWORKS ado"）受信
  - [ ] PDF フッターに「適格請求書発行事業者登録番号: T7810771171765」記載
  - [ ] 発行者「鍛鉄工房ZEST」住所記載
- [ ] **Resend 注文確認メール**（件名 "【IRONWORKS ado】ご注文を承りました — Scroll..."）受信
  - [ ] 制作・配送スケジュールが正しい日付
  - [ ] 合計金額が Stripe 領収書と一致
  - [ ] `ado@tantetuzest.com` にも BCC で届く
- [ ] 迷惑メールフォルダに振り分けられていないか確認（spam判定されている場合は Resend の配信設定見直し）

## 手順 3: Google カレンダー連携確認

- [ ] IRONWORKS ado 制作カレンダーに 4 件のイベント追加
  - [ ] 制作開始
  - [ ] 制作完了予定
  - [ ] 発送予定
  - [ ] 到着予定

## 手順 4: 返金

1. Stripe ダッシュボード → 支払い → 対象の取引を開く
2. 「返金」ボタン → 全額返金
3. 返金理由: "requested_by_customer" (テスト後)

**確認:**
- [ ] カード明細で返金処理が進行中
- [ ] 購入メールアドレスに「Your refund from ...」メール受信
- [ ] 数日以内にカードへ返金反映

## 手順 5: 後処理

- [ ] Google カレンダーから追加された 4 イベントを削除
- [ ] Stripe 側の請求書ステータスを確認（voided に変更するかは任意）
- [ ] 本手順書の結果を memory に反映

## トラブル時

| 症状 | 原因・対処 |
|---|---|
| `/thanks` に遷移後 session データ取れず | Webhook未到達。Vercel ログ `/api/webhook` 確認 |
| Stripe 領収書来ない | 設定 → Emails → Successful payments ON を再確認 |
| 請求書 PDF 来ない | 設定 → Invoice → Email finalized invoices ON を確認 |
| Resend 注文確認メール来ない | Vercel ログ `[webhook] Order email` エラー確認、RESEND_API_KEY 確認 |
| カレンダーイベント作成されない | GOOGLE_SERVICE_ACCOUNT_KEY / GOOGLE_CALENDAR_ID 環境変数確認 |

## 関連ファイル

- [app/api/checkout/route.ts](../app/api/checkout/route.ts) — `invoice_creation` 設定・footer
- [app/api/webhook/route.ts](../app/api/webhook/route.ts) — `sendOrderConfirmationEmail` / `createCalendarEvents`
