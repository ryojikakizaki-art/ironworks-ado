import { LEDGER_SHEET_ID } from '@/lib/order-ledger';
import { CARRIERS, DEFAULT_CARRIER, isCarrierCode, type CarrierCode } from '@/lib/carriers';

/**
 * 発送通知の中核処理。
 *
 * 受注台帳の指定行から顧客情報を読み、お客様に「発送しました + 追跡番号」メールを送り、
 * 同時に O 列に「発送済み YYYY-MM-DD 佐川急便 NNNN」を書き込む。
 *
 * 認証は各エンドポイント側で行う（ここでは行わない）:
 *   - app/api/shipment-notify/route.ts        … ORDER_ENTRY_SECRET ヘッダー（Claude / CLI 経路）
 *   - app/api/admin/order/[row]/notify/route.ts … middleware の Basic 認証（/admin ダッシュボード経路）
 *
 * 両経路でメール本文・台帳記録が一字一句同じになるよう、ロジックはこの 1 箇所に集約する。
 */

export type ShipmentNotifyInput = {
  row: number;
  trackingNumber: string;
  carrier?: string;
};

export type ShipmentNotifyResult =
  | {
      ok: true;
      row: number;
      sentTo: string;
      customer: string;
      product: string;
      carrier: string;
      trackingNumber: string;
      shippedAt: string;
    }
  | { ok: false; status: number; error: string };

const esc = (s: string): string =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function todayJpDate(): { iso: string; display: string } {
  const now = new Date();
  const iso = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Tokyo' });
  const [y, m, d] = iso.split('-').map(Number);
  return { iso, display: `${y}年${m}月${d}日` };
}

function buildHtml(args: {
  customer: string;
  productLabel: string;
  spec: string;
  carrierName: string;
  trackingNumber: string;
  trackingUrl: string;
  shippedDisplay: string;
}): string {
  const { customer, productLabel, spec, carrierName, trackingNumber, trackingUrl, shippedDisplay } = args;
  return `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8">
<style>body{font-family:'Helvetica Neue',Arial,sans-serif;background:#f9f9f9;color:#333;margin:0;padding:0;}
.wrap{max-width:600px;margin:40px auto;background:#fff;border:1px solid #e0e0e0;}
.header{background:#0e0e0e;color:#f5f5f5;padding:24px 32px;}
.header h1{font-size:13px;letter-spacing:0.3em;text-transform:uppercase;margin:0;font-weight:400;}
.header span{color:#c8a96e;}.body{padding:32px;font-size:14px;line-height:1.9;color:#444;}
.body p{margin:0 0 16px;}.divider{border:none;border-top:1px solid #e0e0e0;margin:24px 0;}
.section-title{font-size:12px;letter-spacing:0.2em;color:#888;text-transform:uppercase;margin:24px 0 12px;}
.summary{background:#f9f9f9;border-left:3px solid #c8a96e;padding:16px 20px;font-size:13px;color:#555;}
.row{display:flex;gap:12px;padding:8px 0;border-bottom:1px solid #f0f0f0;}
.row:last-child{border-bottom:none;}
.label{color:#888;font-size:12px;min-width:130px;}
.value{color:#222;font-size:13px;flex:1;}
.cta{display:inline-block;background:#0e0e0e;color:#f5f5f5;text-decoration:none;padding:12px 24px;font-size:12px;letter-spacing:0.15em;margin-top:8px;}
.cta span{color:#c8a96e;}
.footer{background:#0e0e0e;padding:20px 32px;text-align:center;}
.footer p{font-size:11px;color:#999;letter-spacing:0.1em;margin:0 0 6px;line-height:1.8;}
.footer span{color:#c8a96e;}</style>
</head><body><div class="wrap">
<div class="header"><h1>IRONWORKS <span>ado</span> — 商品を発送いたしました</h1></div>
<div class="body">
<p>${esc(customer)} 様</p>
<p>この度はIRONWORKS adoをご利用いただき、誠にありがとうございます。<br>本日、ご注文の商品を発送いたしましたのでご案内申し上げます。</p>

<div class="section-title">発送内容</div>
<div class="summary">
<div class="row"><span class="label">商品</span><span class="value">${esc(productLabel)}</span></div>
${spec ? `<div class="row"><span class="label">仕様</span><span class="value">${esc(spec)}</span></div>` : ''}
<div class="row"><span class="label">発送日</span><span class="value">${esc(shippedDisplay)}</span></div>
</div>

<div class="section-title">配送・追跡</div>
<div class="summary">
<div class="row"><span class="label">配送業者</span><span class="value">${esc(carrierName)}</span></div>
<div class="row"><span class="label">お問い合わせ番号</span><span class="value" style="font-family:monospace;font-size:14px;color:#0e0e0e;font-weight:600;">${esc(trackingNumber)}</span></div>
</div>
<p style="margin-top:16px;"><a class="cta" href="${esc(trackingUrl)}">追跡ページを<span>開く</span></a></p>

<hr class="divider">
<p style="font-size:13px;color:#555;">お受け取り後、万一商品に不具合がございましたら遠慮なくご連絡ください。<br>追跡ページから再配達のご依頼も承れます。</p>
<p style="font-size:13px;color:#555;">引き続きどうぞよろしくお願いいたします。</p>
<p style="font-size:12px;color:#888;">ご不明点は <a href="mailto:ado@tantetuzest.com" style="color:#c8a96e;">ado@tantetuzest.com</a> までお気軽にお問い合わせください。</p>
</div>
<div class="footer">
<p>鍛鉄工房ZEST（蠣﨑 良治） / IRONWORKS <span>ado</span></p>
<p>〒265-0052 千葉県千葉市若葉区和泉町239-2 / TEL 070-3817-0659</p>
<p>適格請求書発行事業者登録番号: T7810771171765</p>
</div>
</div></body></html>`;
}

/**
 * 受注台帳の 1 行に対して発送通知メールを送り、O 列に発送済み記録を書く。
 * row は 2 始まりのシート行番号。trackingNumber は必須。
 */
export async function sendShipmentNotification(
  input: ShipmentNotifyInput,
): Promise<ShipmentNotifyResult> {
  const row = Number(input.row);
  const trackingNumber = String(input.trackingNumber ?? '').trim();
  if (!Number.isInteger(row) || row < 2) {
    return { ok: false, status: 400, error: 'row must be an integer >= 2' };
  }
  if (!trackingNumber) {
    return { ok: false, status: 400, error: 'trackingNumber is required' };
  }
  const carrier: CarrierCode = isCarrierCode(input.carrier) ? input.carrier : DEFAULT_CARRIER;
  const carrierMeta = CARRIERS[carrier];

  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!keyJson) {
    return { ok: false, status: 503, error: 'ledger not configured' };
  }
  if (!resendKey) {
    return { ok: false, status: 503, error: 'resend not configured' };
  }

  const { google } = await import('googleapis');
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(keyJson),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // 受注台帳から該当行の A〜L を取得。
  // A=日付 / B=区分 / C=顧客名 / D=都道府県 / E=住所 / F=メール / G=電話 / H=商品 / I=仕様 / J=金額 / K=注文番号 / L=メモ
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: LEDGER_SHEET_ID,
    range: `A${row}:L${row}`,
  });
  const r = res.data.values?.[0];
  if (!r) {
    return { ok: false, status: 404, error: `row ${row} is empty` };
  }
  const customer = String(r[2] ?? '').trim();
  const email = String(r[5] ?? '').trim();
  const product = String(r[7] ?? '').trim();
  const spec = String(r[8] ?? '').trim();
  if (!email) {
    return { ok: false, status: 422, error: `row ${row} has no email` };
  }
  if (!customer || !product) {
    return { ok: false, status: 422, error: `row ${row} missing customer or product` };
  }

  const today = todayJpDate();
  const trackingUrl = carrierMeta.trackingUrl(trackingNumber);

  const html = buildHtml({
    customer,
    productLabel: product,
    spec,
    carrierName: carrierMeta.name,
    trackingNumber,
    trackingUrl,
    shippedDisplay: today.display,
  });

  const fromAddress = process.env.CONTACT_FROM || 'IRONWORKS ado <noreply@tantetuzest.com>';
  const subject = `【IRONWORKS ado】商品を発送いたしました — ${product}`;

  const sendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: fromAddress, to: [email], subject, html }),
  });
  if (!sendRes.ok) {
    const e = (await sendRes.json().catch(() => ({}))) as { message?: string };
    return { ok: false, status: 502, error: e.message || 'resend send failed' };
  }

  // O 列を「発送済み YYYY-MM-DD 佐川急便 NNNN」で上書き。
  // メール送信が成功した後にだけ書くことで、台帳の発送済み記録 = 顧客通知済みを保証する。
  await sheets.spreadsheets.values.update({
    spreadsheetId: LEDGER_SHEET_ID,
    range: `O${row}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[`発送済み ${today.iso} ${carrierMeta.name} ${trackingNumber}`]],
    },
  });

  return {
    ok: true,
    row,
    sentTo: email,
    customer,
    product,
    carrier: carrierMeta.name,
    trackingNumber,
    shippedAt: today.iso,
  };
}
