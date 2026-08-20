/**
 * 受注台帳への記帳が最終的に失敗したときのアラート通知。
 *
 * 受注台帳の書き込みは Google Sheets API の一過性障害（503 等）で落ちることがある。
 * webhook は Stripe に必ず 200 を返す設計（再送させない）のため、記帳が落ちても
 * 誰も気づけず注文が静かに欠落する事故が実際に起きた（2026-08-18・加藤様）。
 *
 * リトライを尽くしても書けなかった場合に、工房アドレスへ「記帳に失敗した」旨と
 * そのまま復旧に使える注文内容を送る。決済・受注そのものは成立しているため、
 * この通知の失敗で注文処理を止めてはいけない（この関数は決して throw しない）。
 */

const WORKSHOP_EMAIL = 'ado@tantetuzest.com';

/** 受注台帳 A〜L 列のラベル（メール本文と復旧用 JSON のキー対応）。 */
const COLUMN_LABELS = [
  '受注日', '区分', '顧客名', '都道府県', '住所', 'メール',
  '電話', '商品', '仕様', '金額', '注文番号', 'メモ',
] as const;

/** 復旧用 JSON（/api/manual-order のペイロード）のキー。 */
const PAYLOAD_KEYS = [
  'order_date', 'kubun', 'customer_name', 'prefecture', 'address', 'email',
  'phone', 'product', 'spec', 'total_yen', 'order_ref', 'note',
] as const;

/** 台帳書き込みのどの段階で落ちたか。 */
export type LedgerStage = '重複チェック' | '行挿入' | '本文書き込み' | '送料書き込み';

function esc(str: string | undefined | null): string {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/**
 * 台帳の行から /api/manual-order にそのまま渡せる JSON を組み立てる。
 * 金額は数値、送料（税抜）は shipping_yen として復元する。
 */
function buildRecoveryPayload(
  row: string[],
  shipping?: { yen: number; taxYen: number },
): Record<string, string | number> {
  const payload: Record<string, string | number> = {};
  PAYLOAD_KEYS.forEach((key, i) => {
    const value = String(row[i] ?? '');
    if (key === 'total_yen') {
      payload[key] = Number(value.replace(/[^0-9.-]/g, '')) || 0;
    } else if (value) {
      payload[key] = value;
    }
  });
  if (shipping && shipping.yen > 0) payload.shipping_yen = Math.round(shipping.yen);
  return payload;
}

/**
 * 記帳失敗を工房アドレスへ通知する。失敗しても呼び出し元には影響させない。
 *
 * @param channel  受注チャネル（Stripeカード決済 / 銀行振込 / STORES / 手動受注）
 * @param orderKey K 列の注文番号（Stripe セッション ID など）
 * @param row      書き込もうとした A〜L の 12 要素
 * @param shipping 送料（税抜）・送料消費税
 * @param stage    失敗した段階
 * @param error    元のエラー
 */
export async function notifyLedgerFailure(params: {
  channel: string;
  orderKey: string;
  row: string[];
  shipping?: { yen: number; taxYen: number };
  stage: LedgerStage;
  error: unknown;
}): Promise<void> {
  const { channel, orderKey, row, shipping, stage, error } = params;
  const message = error instanceof Error ? error.message : String(error);
  const payload = buildRecoveryPayload(row, shipping);

  // Vercel のログにも 1 行で残す（メールが落ちても runtime errors から拾えるように）。
  console.error('[order-ledger] LEDGER_WRITE_FAILED', JSON.stringify({ channel, orderKey, stage, message, payload }));

  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('[order-ledger] RESEND_API_KEY not configured, skipping failure alert');
      return;
    }
    const fromAddress = process.env.CONTACT_FROM || 'IRONWORKS ado <noreply@tantetuzest.com>';
    const toAddress = process.env.CONTACT_TO_EMAIL || WORKSHOP_EMAIL;
    const customer = String(row[2] || '—');
    const product = String(row[7] || '—');
    const nowJst = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

    const rows = COLUMN_LABELS.map((label, i) => `
<tr><td style="padding:4px 12px 4px 0;color:#888;white-space:nowrap;">${esc(label)}</td>
<td style="padding:4px 0;color:#333;">${esc(row[i]) || '—'}</td></tr>`).join('');

    // 空行が残っている可能性があるのは、行挿入に成功した後で落ちた場合だけ。
    const blankRowWarning = stage === '本文書き込み' || stage === '送料書き込み'
      ? '<p style="margin:0 0 16px;color:#b45309;">※ 台帳の 2 行目に<strong>空行が残っている可能性</strong>があります。記帳前に確認して、空行があれば削除してください。</p>'
      : '';

    const html = `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8">
<meta name="color-scheme" content="light"></head>
<body style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f3f4f6;margin:0;padding:24px;color:#333;">
<div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;">
<div style="background:#0e0e0e;color:#f5f5f5;padding:20px 28px;">
<h1 style="font-size:13px;letter-spacing:0.2em;margin:0;font-weight:400;">IRONWORKS <span style="color:#c8a96e;">ado</span> — 受注台帳エラー</h1></div>
<div style="padding:28px;font-size:14px;line-height:1.8;">
<p style="margin:0 0 16px;"><strong>受注台帳への記帳に失敗しました。</strong><br>
ご注文（決済）は成立しています。<strong>台帳の行だけが欠けている状態</strong>なので、下記の内容で手動記帳してください。</p>
${blankRowWarning}
<table style="border-collapse:collapse;font-size:13px;margin:0 0 20px;">
<tr><td style="padding:4px 12px 4px 0;color:#888;">チャネル</td><td style="padding:4px 0;">${esc(channel)}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#888;">失敗した段階</td><td style="padding:4px 0;">${esc(stage)}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#888;">エラー</td><td style="padding:4px 0;color:#b91c1c;">${esc(message)}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#888;">発生時刻</td><td style="padding:4px 0;">${esc(nowJst)}</td></tr>
</table>
<div style="font-size:12px;letter-spacing:0.15em;color:#888;margin:0 0 8px;">注文内容</div>
<table style="border-collapse:collapse;font-size:13px;margin:0 0 8px;">${rows}</table>
${shipping ? `<p style="margin:0 0 20px;font-size:13px;color:#555;">送料 ¥${Math.round(shipping.yen).toLocaleString()}（税抜） / 送料消費税 ¥${Math.round(shipping.taxYen).toLocaleString()}</p>` : ''}
<div style="font-size:12px;letter-spacing:0.15em;color:#888;margin:24px 0 8px;">復旧のしかた</div>
<p style="margin:0 0 12px;">この JSON をそのまま Claude に渡してください（<code>/api/manual-order</code> で台帳に記帳します）。</p>
<pre style="background:#f3f4f6;border:1px solid #e5e7eb;padding:16px;font-size:12px;line-height:1.6;white-space:pre-wrap;word-break:break-all;margin:0 0 16px;">${esc(JSON.stringify(payload, null, 2))}</pre>
<p style="margin:0;font-size:13px;color:#555;">※ Stripe 側でイベントを再送しないでください。確認メールとカレンダー予定が二重になります。</p>
</div></div></body></html>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: fromAddress,
        to: [toAddress],
        subject: `⚠️ 受注台帳への記帳に失敗 — ${customer} 様 / ${product}`,
        html,
      }),
    });
    if (!res.ok) {
      console.error('[order-ledger] Failure alert email error:', res.status, await res.text());
      return;
    }
    console.log('[order-ledger] Failure alert sent for', orderKey);
  } catch (err) {
    // 通知の失敗は握りつぶす（元のエラーを呼び出し元に返すのが優先）。
    console.error('[order-ledger] Failure alert threw:', err instanceof Error ? err.message : err);
  }
}
