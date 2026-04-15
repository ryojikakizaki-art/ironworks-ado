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
  }

  return NextResponse.json({ received: true });
}

// Next.js App Router: webhook で raw body を使うため bodyParser を無効化
export const runtime = 'nodejs';
