import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-12-18.acacia',
    });
  }
  return _stripe;
}

function esc(str: string | undefined | null): string {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function formatJpDate(iso: string | undefined | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return esc(iso);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

async function sendOrderConfirmationEmail(session: Stripe.Checkout.Session) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log('[webhook] RESEND_API_KEY not configured, skipping order email');
    return;
  }

  const email = session.customer_details?.email;
  if (!email) {
    console.warn('[webhook] No customer email on session, skipping order email');
    return;
  }

  const meta = session.metadata || {};
  const name = session.customer_details?.name || 'お客様';
  const productLabel = `${meta.product_name || meta.product} 壁付け手すり ${meta.length_mm}mm`;
  const isRush = meta.rush_delivery === 'true';
  const deliveryLabel = isRush ? '特急配送（5営業日）' : '通常配送（10営業日）';
  const baseYen = Number(meta.base_total_yen || 0);
  const rushYen = Number(meta.rush_surcharge_yen || 0);
  const totalYen = Number(meta.total_yen || session.amount_total || 0);
  const arrivalDate = meta.preferred_arrival_date || meta.arrival_estimate;

  const fromAddress = process.env.CONTACT_FROM || 'IRONWORKS ado <noreply@tantetuzest.com>';

  const html = `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8">
<style>body{font-family:'Helvetica Neue',Arial,sans-serif;background:#f9f9f9;color:#333;margin:0;padding:0;}
.wrap{max-width:600px;margin:40px auto;background:#fff;border:1px solid #e0e0e0;}
.header{background:#0e0e0e;color:#f5f5f5;padding:24px 32px;}
.header h1{font-size:13px;letter-spacing:0.3em;text-transform:uppercase;margin:0;font-weight:400;}
.header span{color:#c8a96e;}.body{padding:32px;font-size:14px;line-height:1.9;color:#444;}
.body p{margin:0 0 16px;}.divider{border:none;border-top:1px solid #e0e0e0;margin:24px 0;}
.section-title{font-size:12px;letter-spacing:0.2em;color:#888;text-transform:uppercase;margin:24px 0 12px;}
.summary{background:#f9f9f9;border-left:3px solid #c8a96e;padding:16px 20px;font-size:13px;color:#555;}
.summary p{margin:4px 0;}
.row{display:flex;gap:12px;padding:8px 0;border-bottom:1px solid #f0f0f0;}
.row:last-child{border-bottom:none;}
.label{color:#888;font-size:12px;min-width:130px;}
.value{color:#222;font-size:13px;flex:1;}
.total{font-size:18px;color:#0e0e0e;font-weight:600;text-align:right;padding:16px 0;border-top:2px solid #0e0e0e;margin-top:12px;}
.footer{background:#0e0e0e;padding:20px 32px;text-align:center;}
.footer p{font-size:11px;color:#999;letter-spacing:0.1em;margin:0 0 6px;line-height:1.8;}
.footer span{color:#c8a96e;}</style>
</head><body><div class="wrap">
<div class="header"><h1>IRONWORKS <span>ado</span> — ご注文ありがとうございます</h1></div>
<div class="body">
<p>${esc(name)} 様</p>
<p>この度は IRONWORKS ado をご利用いただき、誠にありがとうございます。<br>下記の内容でご注文を承りました。制作完了まで今しばらくお待ちください。</p>

<div class="section-title">ご注文内容</div>
<div class="summary">
<div class="row"><span class="label">商品</span><span class="value">${esc(productLabel)}</span></div>
<div class="row"><span class="label">仕上げ・座金</span><span class="value">座金 ${esc(String(meta.zakin_count || '—'))}個</span></div>
<div class="row"><span class="label">配送区分</span><span class="value">${esc(deliveryLabel)}</span></div>
<div class="row"><span class="label">基本金額</span><span class="value">¥${baseYen.toLocaleString()}</span></div>
${isRush ? `<div class="row"><span class="label">特急割増</span><span class="value">¥${rushYen.toLocaleString()}</span></div>` : ''}
<div class="total">合計: ¥${totalYen.toLocaleString()}（税込）</div>
</div>

<div class="section-title">制作・配送スケジュール</div>
<div class="summary">
<div class="row"><span class="label">制作開始</span><span class="value">${formatJpDate(meta.production_start)}</span></div>
<div class="row"><span class="label">制作完了予定</span><span class="value">${formatJpDate(meta.production_complete)}</span></div>
<div class="row"><span class="label">発送予定</span><span class="value">${formatJpDate(meta.shipping_date)}</span></div>
<div class="row"><span class="label">お届け予定</span><span class="value">${formatJpDate(arrivalDate)}${meta.preferred_time_slot ? ` / ${esc(meta.preferred_time_slot)}` : ''}</span></div>
</div>

<hr class="divider">
<p style="font-size:12px;color:#888;">
適格請求書（領収書PDF）は別途 Stripe よりメールにてお送りいたします。<br>
ご不明点はお気軽にお問い合わせください: <a href="mailto:ado@tantetuzest.com" style="color:#c8a96e;">ado@tantetuzest.com</a>
</p>
<p style="font-size:11px;color:#aaa;">注文番号: ${esc(session.id)}</p>
</div>
<div class="footer">
<p>鍛鉄工房ZEST（蠣崎 良治） / IRONWORKS <span>ado</span></p>
<p>〒265-0052 千葉県千葉市若葉区和泉町239-2 / TEL 070-3817-0659</p>
<p>適格請求書発行事業者登録番号: T7810771171765</p>
</div>
</div></body></html>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: fromAddress,
      to: [email],
      bcc: ['ado@tantetuzest.com'],
      subject: `【IRONWORKS ado】ご注文を承りました — ${productLabel}`,
      html,
    }),
  });

  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error((e as { message?: string }).message || 'order email failed');
  }

  console.log('[webhook] Order confirmation email sent to', email);
}

async function createCalendarEvents(session: Stripe.Checkout.Session) {
  // Google Calendar API（環境変数が設定されている場合のみ）
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY || !process.env.GOOGLE_CALENDAR_ID) {
    console.log('[webhook] Google Calendar not configured, skipping');
    return;
  }

  const { google } = await import('googleapis');
  const meta = session.metadata || {};
  const email = session.customer_details?.email || '不明';

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
  const calendar = google.calendar({ version: 'v3', auth });
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  const productLabel = `${meta.product_name || meta.product} ${meta.length_mm}mm`;
  const rushLabel = meta.rush_delivery === 'true' ? '【特急】' : '';
  const arrivalPref = meta.preferred_arrival_date
    ? `\n到着希望日: ${meta.preferred_arrival_date} ${meta.preferred_time_slot || '指定なし'}`
    : '';

  const description = [
    `商品: ${productLabel}`,
    `タイプ: ${meta.type}`,
    `座金: ${meta.zakin_count}個`,
    `合計: ¥${Number(meta.total_yen || 0).toLocaleString()}`,
    meta.rush_delivery === 'true' ? `特急割増: ¥${Number(meta.rush_surcharge_yen || 0).toLocaleString()}` : '',
    `お客様: ${email}`,
    arrivalPref,
    `\nStripe Session: ${session.id}`,
  ].filter(Boolean).join('\n');

  const events = [
    { summary: `${rushLabel}制作開始 — ${productLabel}`, date: meta.production_start },
    { summary: `${rushLabel}制作完了予定 — ${productLabel}`, date: meta.production_complete },
    { summary: `${rushLabel}発送予定 — ${productLabel}`, date: meta.shipping_date },
    { summary: `${rushLabel}到着予定 — ${productLabel}`, date: meta.preferred_arrival_date || meta.arrival_estimate },
  ];

  await Promise.all(events.map(function(ev) {
    if (!ev.date) return Promise.resolve();
    return calendar.events.insert({
      calendarId: calendarId,
      requestBody: {
        summary: ev.summary,
        description: description,
        start: { date: ev.date },
        end: { date: ev.date },
      },
    });
  }));

  console.log('[webhook] Created ' + events.length + ' calendar events for ' + productLabel);
}

export async function POST(request: NextRequest) {
  const sig = request.headers.get('stripe-signature');
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    // Next.js App Router: raw body を取得するために arrayBuffer() を使用
    const rawBody = await request.text();
    event = getStripe().webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[webhook] Signature verification failed:', message);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log('[webhook] checkout.session.completed for', session.metadata?.product_name);

    try {
      await createCalendarEvents(session);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[webhook] Calendar error:', message);
      // カレンダーエラーでもwebhookは成功応答を返す
    }

    try {
      await sendOrderConfirmationEmail(session);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[webhook] Order email error:', message);
      // メール送信エラーでもwebhookは成功応答を返す
    }
  }

  return NextResponse.json({ received: true });
}

// Next.js App Router: webhook で raw body を使うため bodyParser を無効化
export const runtime = 'nodejs';
