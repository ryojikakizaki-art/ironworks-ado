import { NextRequest, NextResponse } from 'next/server';

function esc(str: string | undefined | null): string {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const categoryLabels: Record<string, string> = {
  product: '製品について', size: 'サイズ・採寸のご相談',
  custom: '特注・カスタムオーダー', order: 'ご注文・お届けについて', other: 'その他',
};

const productLabels: Record<string, string> = {
  rene: 'René ルネ（横型 25φ 黒）', claire: 'Claire クレール（横型 25φ 白）',
  marcel: 'Marcel マルセル（横型 FB 黒）', emile: 'Émile エミール（横型 FB 鎚目）',
  claude: 'Claude クロード（縦型 25φ 黒）', catherine: 'Catherine カトリーヌ（縦型 25φ 白）',
  alexandre: 'Alexandre アレクサンドル（縦型 31.8φ）', antoine: 'Antoine アントワーヌ（縦型ロング）',
  other: 'その他・複数',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, name_kana, email, category, product, message } = body || {};

    if (!name || !email || !category || !message) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'メールアドレスの形式が正しくありません' }, { status: 400 });
    }

    const categoryLabel = categoryLabels[category] || category;
    const productLabel  = productLabels[product]   || '—';
    const fromAddress   = process.env.CONTACT_FROM     || 'IRONWORKS ado <onboarding@resend.dev>';
    const toAddress     = process.env.CONTACT_TO_EMAIL || 'ado@tantetuzest.com';

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
<div class="footer">送信日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })} JST</div>
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
お問い合わせ: <a href="mailto:ado@tantetuzest.com" style="color:#c8a96e;">ado@tantetuzest.com</a></p>
</div>
<div class="footer"><p>&copy; IRONWORKS <span>ado</span> — All rights reserved</p></div>
</div></body></html>`;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error('RESEND_API_KEY not set');

    const r1 = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: fromAddress, to: [toAddress], reply_to: email,
        subject: `[お問い合わせ] ${categoryLabel} — ${name} 様`, html: notifyHtml,
      }),
    });
    if (!r1.ok) {
      const e = await r1.json().catch(() => ({}));
      throw new Error((e as { message?: string }).message || 'notify failed');
    }

    const r2 = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: fromAddress, to: [email],
        subject: '【IRONWORKS ado】お問い合わせを承りました', html: autoReplyHtml,
      }),
    });
    if (!r2.ok) {
      const e2 = await r2.json().catch(() => ({}));
      console.warn('auto-reply failed:', e2);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Contact API error:', err);
    return NextResponse.json(
      { error: '送信に失敗しました。時間をおいて再度お試しください。' },
      { status: 500 }
    );
  }
}
