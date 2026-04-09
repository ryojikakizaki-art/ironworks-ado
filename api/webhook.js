const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Vercel: bodyParser を無効化して raw body を取得
module.exports.config = { api: { bodyParser: false } };

async function createCalendarEvents(session) {
  // Google Calendar API（環境変数が設定されている場合のみ）
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY || !process.env.GOOGLE_CALENDAR_ID) {
    console.log('[webhook] Google Calendar not configured, skipping');
    return;
  }

  const { google } = require('googleapis');
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

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  let event;
  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('[webhook] checkout.session.completed for', session.metadata?.product_name);

    try {
      await createCalendarEvents(session);
    } catch (err) {
      console.error('[webhook] Calendar error:', err.message);
      // カレンダーエラーでもwebhookは成功応答を返す
    }
  }

  return res.status(200).json({ received: true });
};
