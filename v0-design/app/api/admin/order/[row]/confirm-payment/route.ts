import { NextRequest, NextResponse } from 'next/server';
import { LEDGER_SHEET_ID, updateOrderNote } from '@/lib/order-ledger';
import { getScheduleDates, formatDateISO, formatDateJa } from '@/lib/business-days';

export const runtime = 'nodejs';

/**
 * 銀行振込注文の「入金確認」処理（Phase 2）。/admin/orders の入金確認ボタンが呼ぶ。
 *
 * 処理:
 *   ① 受注台帳の該当行を読む
 *   ② 入金確認日を起点に制作スケジュールを計算し、Google カレンダーに 4 イベント登録
 *      （制作開始 / 制作完了予定 / 発送予定 / 到着予定）— カード決済 webhook と同じ粒度
 *   ③ L 列「入金待ち」→「入金確認 YYYY/MM/DD」に更新（他列・数式列には触れない）
 *   ④ お客様へ「制作開始のご案内」メールを送信（Resend・ベストエフォート）
 *
 * 認証は middleware.ts の Basic 認証で済むためここでは追加チェックしない。
 * 発送済み(O列)はこのボタンでは触らない（入金確認 = 制作着手であり発送ではないため）。
 */

function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function todayJST(): string {
  return new Date()
    .toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' })
    .replace(/-/g, '/');
}

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ row: string }> },
) {
  const { row: rowParam } = await context.params;
  const row = Number(rowParam);
  if (!Number.isInteger(row) || row < 2) {
    return NextResponse.json({ ok: false, error: 'row must be an integer >= 2' }, { status: 400 });
  }

  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!keyJson) {
    return NextResponse.json({ ok: false, error: 'ledger not configured' }, { status: 503 });
  }

  const { google } = await import('googleapis');

  // ── ① 行を読む ──
  let r: string[];
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(keyJson),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: LEDGER_SHEET_ID,
      range: `A${row}:O${row}`,
    });
    const got = res.data.values?.[0];
    if (!got) {
      return NextResponse.json({ ok: false, error: `row ${row} is empty` }, { status: 404 });
    }
    r = got.map((v) => String(v ?? ''));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[confirm-payment] read error:', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }

  const channel = r[1] ?? '';   // B 区分
  const customer = r[2] ?? '';  // C 顧客名
  const email = r[5] ?? '';     // F メール
  const product = r[7] ?? '';   // H 商品
  const spec = r[8] ?? '';      // I 仕様
  const orderRef = r[10] ?? ''; // K 注文番号
  const note = r[11] ?? '';     // L メモ

  // 銀行振込以外、または既に入金確認済みの行は誤操作防止のため弾く。
  if (!channel.includes('銀行振込')) {
    return NextResponse.json({ ok: false, error: 'この注文は銀行振込ではありません' }, { status: 400 });
  }
  if (!note.includes('入金待ち')) {
    return NextResponse.json({ ok: false, error: 'この注文は入金待ちではありません（確認済みの可能性）' }, { status: 400 });
  }

  // 特急かどうかは仕様欄から判定（bank-order が「特急配送/通常配送」を記録）。
  const isRush = /特急/.test(spec);
  const confirmedDate = todayJST();

  // ── ② カレンダー登録（入金確認日を起点）──
  const now = new Date();
  const schedule = getScheduleDates(now, isRush);
  let eventsCreated = 0;
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (calendarId) {
    try {
      const calAuth = new google.auth.GoogleAuth({
        credentials: JSON.parse(keyJson),
        scopes: ['https://www.googleapis.com/auth/calendar'],
      });
      const calendar = google.calendar({ version: 'v3', auth: calAuth });
      const rush = isRush ? '【特急】' : '';
      const description = [
        `商品: ${product}`,
        `仕様: ${spec}`,
        `お客様: ${customer}`,
        `注文番号: ${orderRef}`,
        `区分: 銀行振込（入金確認 ${confirmedDate}）`,
      ].join('\n');
      const events = [
        { summary: `${rush}制作開始 — ${product}`, date: formatDateISO(schedule.productionStart) },
        { summary: `${rush}制作完了予定 — ${product}`, date: formatDateISO(schedule.productionComplete) },
        { summary: `${rush}発送予定 — ${product}`, date: formatDateISO(schedule.shippingDate) },
        { summary: `${rush}到着予定 — ${product}`, date: formatDateISO(schedule.arrivalDate) },
      ];
      await Promise.all(events.map((ev) =>
        calendar.events.insert({
          calendarId,
          requestBody: {
            summary: ev.summary,
            description,
            start: { date: ev.date },
            end: { date: ev.date },
          },
        }),
      ));
      eventsCreated = events.length;
    } catch (err) {
      console.error('[confirm-payment] calendar error:', err instanceof Error ? err.message : err);
      // カレンダー失敗でも台帳更新・メールは続行（後で手動登録できる）
    }
  } else {
    console.log('[confirm-payment] GOOGLE_CALENDAR_ID not set, skipping calendar');
  }

  // ── ③ L 列を「入金待ち」→「入金確認 日付」に更新（他のメモは残す）──
  const newNote = note.replace(/入金待ち/g, `入金確認 ${confirmedDate}`);
  try {
    await updateOrderNote(row, newNote);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[confirm-payment] note update error:', message);
    return NextResponse.json(
      { ok: false, error: `台帳の更新に失敗しました: ${message}` },
      { status: 500 },
    );
  }

  // ── ④ お客様へ制作開始メール（ベストエフォート）──
  let emailSent = false;
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (validEmail) {
    try {
      const apiKey = process.env.RESEND_API_KEY;
      const fromAddress = process.env.CONTACT_FROM || 'IRONWORKS ado <onboarding@resend.dev>';
      if (!apiKey) throw new Error('RESEND_API_KEY not set');

      const html = `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><style>
body{font-family:'Helvetica Neue',Arial,sans-serif;background:#f3f4f6;color:#333;margin:0;padding:0;}
.wrap{max-width:600px;margin:32px auto;background:#fff;border:1px solid #e5e7eb;}
.header{background:#1a1612;color:#f5f5f5;padding:24px 32px;}
.header h1{font-size:13px;letter-spacing:0.3em;text-transform:uppercase;margin:0;font-weight:400;}
.header span{color:#b8860b;}.body{padding:32px;font-size:14px;line-height:1.9;color:#444;}
.body p{margin:0 0 16px;}.card{border:1px solid #e5e7eb;border-left:3px solid #b8860b;border-radius:6px;padding:8px 20px;margin:16px 0;}
.row{border-bottom:1px solid #f0ebe4;padding:10px 0;display:flex;gap:16px;}
.row:last-child{border-bottom:none;}.label{color:#888;font-size:12px;min-width:120px;}.value{font-size:14px;color:#222;flex:1;}
.footer{background:#1a1612;padding:18px 32px;text-align:center;}.footer p{font-size:11px;color:#888;margin:0;}</style>
</head><body><div class="wrap">
<div class="header"><h1>IRONWORKS <span>ado</span> — 制作開始のご案内</h1></div>
<div class="body">
<p>${esc(customer)} 様</p>
<p>ご入金を確認いたしました。誠にありがとうございます。これより制作・発送の手配を開始いたします。</p>
<div class="card">
<div class="row"><span class="label">ご注文番号</span><span class="value">${esc(orderRef)}</span></div>
<div class="row"><span class="label">商品</span><span class="value">${esc(product)}</span></div>
<div class="row"><span class="label">制作完了予定</span><span class="value">${esc(formatDateJa(schedule.productionComplete))}</span></div>
<div class="row"><span class="label">発送予定</span><span class="value">${esc(formatDateJa(schedule.shippingDate))}</span></div>
<div class="row"><span class="label">到着予定（目安）</span><span class="value">${esc(formatDateJa(schedule.arrivalDate))}</span></div>
</div>
<p>発送の際は、追跡番号を添えて改めてご連絡いたします。<br>※日程は目安です。制作状況により前後する場合がございます。</p>
</div>
<div class="footer"><p>© IRONWORKS ado / 鍛鉄工房ZEST — ado@tantetuzest.com</p></div>
</div></body></html>`;

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: fromAddress,
          to: [email],
          subject: `【IRONWORKS ado】ご入金を確認しました（制作開始のご案内）${orderRef}`,
          html,
        }),
      });
      emailSent = res.ok;
    } catch (err) {
      console.error('[confirm-payment] email error (台帳は更新済み):', err instanceof Error ? err.message : err);
    }
  }

  console.log(`[confirm-payment] row ${row} ${orderRef} confirmed: events=${eventsCreated} email=${emailSent}`);
  return NextResponse.json(
    { ok: true, row, status: newNote, eventsCreated, emailSent },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
