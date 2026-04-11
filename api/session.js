const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  if (!id || !id.startsWith('cs_')) {
    return res.status(400).json({ error: 'session_id が不正です' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(id, {
      expand: ['line_items', 'customer_details'],
    });

    return res.status(200).json({
      id:               session.id,
      payment_status:   session.payment_status,
      amount_total:     session.amount_total,
      currency:         session.currency,
      customer_details: session.customer_details || null,
      metadata:         session.metadata || {},
      line_items:       session.line_items?.data || [],
      created:          session.created,
    });
  } catch (err) {
    console.error('[session] Stripe error:', err.message);
    return res.status(500).json({ error: 'セッション情報の取得に失敗しました', detail: err.message });
  }
};
