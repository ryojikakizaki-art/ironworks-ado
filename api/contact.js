// api/contact.js — Vercel Serverless Function
// Required env vars:
//   RESEND_API_KEY   … Resend API key (https://resend.com)
//   CONTACT_TO_EMAIL … notification destination email
//   CONTACT_FROM     … verified sender address (e.g. noreply@tantetuzest.com)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, name_kana, email, category, product, message } = req.body || {};

  if (!name || !email || !category || !message)
    return res.status(400).json({ error: '必須項目が不足しています' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'メールアドレスの形式が正しくありません' });

  const categoryLabels = {
    product: '製品について', size: 'サイズ・採寸のご相談',
    custom: '特注・カスタムオーダー', order: 'ご注文・お届けについて', other: 'その他',
  };
  const productLabels = {
    rene: 'René ルネ（壁付け横型）', marie: 'Marie マリー（壁付け縦型）',
    leon: 'Leon レオン（笠木型）', other: 'その他・複数',
  };

  const categoryLabel = categoryLabels[category] || category;
  const productLabel  = productLabels[product]   || '—';
  const fromAddress   = process.env.CONTACT_FROM     || 'IRONWORKS ado <noreply@tantetuzest.com>';
  const toAddress     = process.env.CONTACT_TO_EMAIL || 'ryoji.kakizaki@gmail.com';

  const notifyHtml = `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8">
<style>body{font-family:'Helvetica Neue',Arial,sans-serif;background:#f9f9f9;color:#333;margin:0;padding:0;}
.wrap{max-width:600px;margin:40px auto;background:#fff;border:1px solid #e0e0e0;}
.header{background:#0e0e0e;color:#f5f5f5;padding:24px 32px;}
.header h1{font-size:13px;letter-spacing:0.3em;text-transform:uppercase;margin:0;font-weight:400;}
.header span{color:#c8a96e;}.body{padding:32px;}
.row{border-bottom:1px solid #eee;padding:12px 0;display:flex;gap:16px;}
.row:last-child{border-bottom:none;}.label{color:#888;font-size:12px;min-width:140px;padding-top:2px;}
.value{font-size:14px;color:#222;flex:1;}
.msg{background:#f9f9f9;border-left:3px solid #c8a96e;padding:16px 20px;margin-top:8px;font-size:14px;line-height:1.8;white-space:pre-wrap;}
.footer{background:#f5f5f5;border-top:1px solid #e0e0e0;padding:16px 32px;font-size:11px;color:#999;}</style>
</head><body><div class="wrap">
<div class="header"><h1>IRONWORKS <span>ado</span> — お問い合わせ通知</h1></div>
<div class="body">
<div class="row"><span class="label">お名前</span><span class="value">${esc(name)}${name_kana ? ` (${esc(name_kana)})` : ''}</span></div>
<div class="row"><span class="label">メール</span><span class="value"><a href="mailto:${esc(email)}">${esc(email)}</a></span></div>
<div class="row"><span class="label">種別</span><span class="value">${esc(categoryLabel)}</span></div>
<div class="row"><span class="label">対象製品</span><span class="value">${esc(productLabel)}</span></div>
<div class="row"><span class="label">内容</span><span class="value"><div class="msg">${esc(message)}</div></span></div>
</div>
<div class="footer">送信日時: ${new Date().toLocaleString('ja-JP',{timeZone:'Asia/Tokyo'})} JST</div>
</div></body></html>`;

  const autoReplyHtml = `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8">
<style>body{font-family:'Helvetica Neue',Arial,sans-serif;background:#f9f9f9;color:#333;margin:0;padding:0;}
.wrap{max-width:600px;margin:40px auto;background:#fff;border:1px solid #e0e0e0;}
.header{background:#0e0e0e;color:#f5f5f5;padding:24px 32px;}
.header h1{font-size:13px;letter-spacing:0.3em;text-transform:uppercase;margin:0;font-weight:400;}
.header span{color:#c8a96e;}.body{padding:32px;font-size:14px;line-height:1.9;color:#444;}
.body p{margin:0 0 16px;}.divider{border:none;border-top:1px solid #e0e0e0;margin:24px 0;}
.summary{background:#f9f9f9;border-left:3px solid #c8a96e;padding:16px 20px;font-size:13px;color:#555;}
.summary p{margin:4px 0;}
.footer{background:#0e0e0e;padding:20px 32px;text-align:center;}
.footer p{font-size:11px;color:#666;letter-spacing:0.15em;margin:0;}
.footer span{color:#c8a96e;}</style>
</head><body><div class="wrap">
<div class="header"><h1>IRONWORKS <span>ado</span></h1></div>
<div class="body">
<p>${esc(name)} 様</p>
<p>お問い合わせいただきありがとうございます。以下の内容でお問い合わせを承りました。</p>
<p>通常 <strong>2〜3営業日以内</strong> にご返信いたします。</p>
<hr class="divider">
<div class="summary">
<p><strong>種別：</strong>${esc(categoryLabel)}</p>
<p><strong>対象製品：</strong>${esc(productLabel)}</p>
<p style="margin-top:12px;white-space:pre-wrap;">${esc(message)}</p>
</div>
<hr class="divider">
<p style="font-size:12px;color:#888;">このメールは自動送信です。返信はできません。<br>
お問い合わせ: <a href="mailto:info@tantetuzest.com" style="color:#c8a96e;">info@tantetuzest.com</a></p>
</div>
<div class="footer"><p>© IRONWORKS <span>ado</span> — All rights reserved</p></div>
</div></body></html>`;

  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error('RESEND_API_KEY not set');

    const r1 = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: fromAddress, to: [toAddress], reply_to: email,
        subject: `[お問い合わせ] ${categoryLabel} — ${name} 様`, html: notifyHtml }),
    });
    if (!r1.ok) { const e = await r1.json().catch(()=>({})); throw new Error(e.message||'notify failed'); }

    const r2 = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: fromAddress, to: [email],
        subject: '【IRONWORKS ado】お問い合わせを承りました', html: autoReplyHtml }),
    });
    if (!r2.ok) { const e2 = await r2.json().catch(()=>({})); console.warn('auto-reply failed:', e2); }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Contact API error:', err);
    return res.status(500).json({ error: '送信に失敗しました。時間をおいて再度お試しください。' });
  }
}

function esc(str) {
  return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
