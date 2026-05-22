import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { LEDGER_SHEET_ID } from '@/lib/order-ledger';

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

function addBusinessDays(from: Date, days: number): Date {
  const d = new Date(from);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return d;
}

function toIsoDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

type StripeAddress = {
  postal_code?: string | null;
  state?: string | null;
  city?: string | null;
  line1?: string | null;
  line2?: string | null;
};

function formatJpAddress(addr: StripeAddress | null | undefined): string {
  if (!addr) return '—';
  const postal = addr.postal_code ? `〒${addr.postal_code} ` : '';
  const parts = [addr.state, addr.city, addr.line1, addr.line2].filter(Boolean).join('');
  return `${postal}${parts}` || '—';
}

/**
 * 多本長さ違い対応 (PR #3): metadata から長さ情報を解析。
 * - 新しい lengths_mm (CSV) があればそれを正
 * - 無ければ length_mm + quantity から導出 (後方互換)
 *
 * Returns:
 *   short: ラベル用短縮表記 (例 "1500mm" / "1500mm × 3本" / "3本（複数長さ）")
 *   full:  詳細表記 (例 "1500mm" / "1500mm × 3本" / "1本目 1500mm / 2本目 1800mm / 3本目 2000mm")
 *   perItemHtml: メール本文用 per-item 行 HTML (multi時のみ非空)
 *   isMulti: 違う長さの本が含まれるか
 *   lengths: 各本の長さ配列
 *   qty: 本数
 */
function parseLengthsMeta(meta: Record<string, string>): {
  short: string;
  full: string;
  perItemPlain: string;
  isMulti: boolean;
  lengths: number[];
  qty: number;
} {
  const lengthsCsv = meta.lengths_mm || '';
  let lengths: number[] = [];
  if (lengthsCsv) {
    lengths = lengthsCsv
      .split(',')
      .map(s => Math.round(Number(s)))
      .filter(n => Number.isFinite(n) && n > 0);
  }
  if (lengths.length === 0) {
    // 後方互換: 旧 metadata 形式
    const L = Math.round(Number(meta.length_mm || 0));
    const qty = Math.max(1, Math.min(6, Math.round(Number(meta.quantity || 1)) || 1));
    if (L > 0) lengths = Array(qty).fill(L);
  }
  if (lengths.length === 0) {
    return { short: '—', full: '—', perItemPlain: '', isMulti: false, lengths: [], qty: 0 };
  }
  const qty = lengths.length;
  const allEqual = lengths.every(l => l === lengths[0]);
  if (qty === 1) {
    return { short: `${lengths[0]}mm`, full: `${lengths[0]}mm`, perItemPlain: '', isMulti: false, lengths, qty };
  }
  if (allEqual) {
    return {
      short: `${lengths[0]}mm × ${qty}本`,
      full: `${lengths[0]}mm × ${qty}本`,
      perItemPlain: '',
      isMulti: false,
      lengths,
      qty,
    };
  }
  // 多本長さ違い
  const perItemPlain = lengths.map((l, i) => `${i + 1}本目: ${l}mm`).join(' / ');
  return {
    short: `${qty}本（複数長さ）`,
    full: lengths.map((l, i) => `${i + 1}本目 ${l}mm`).join(' / '),
    perItemPlain,
    isMulti: true,
    lengths,
    qty,
  };
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
  // 多本長さ違い対応 (PR #3)
  const lengthsInfo = parseLengthsMeta(meta);
  const productLabel = `${meta.product_name || meta.product} 壁付け手すり ${lengthsInfo.short}`;
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
${lengthsInfo.isMulti ? `<div class="row"><span class="label">各本の長さ</span><span class="value">${esc(lengthsInfo.full)}</span></div>` : ''}
<div class="row"><span class="label">仕上げ・座金</span><span class="value">${lengthsInfo.isMulti ? `各本の長さに応じて自動配置${meta.washer_type ? ` / 座金${esc(meta.washer_type)}タイプ` : ''}` : `座金 ${esc(String(meta.zakin_count || '—'))}個${meta.washer_type ? `・${esc(meta.washer_type)}タイプ` : ''}`}</span></div>
<div class="row"><span class="label">配送区分</span><span class="value">${esc(deliveryLabel)}</span></div>
${lengthsInfo.isMulti ? '' : `<div class="row"><span class="label">基本金額</span><span class="value">¥${baseYen.toLocaleString()}</span></div>`}
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
<p>鍛鉄工房ZEST（蠣﨑 良治） / IRONWORKS <span>ado</span></p>
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
      // 工房（蠣﨑さん）への控えは sendWorkshopEmail が別途送るため BCC しない
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

async function sendSimpleOrderEmail(session: Stripe.Checkout.Session) {
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
  const productLabel = String(meta.product_name || meta.product || 'ご注文商品');
  const qty = Number(meta.quantity || 1);
  const unitYen = Number(meta.unit_yen || 0);
  const totalYen = Number(meta.total_yen || session.amount_total || 0);
  const shippingMethod = String(meta.shipping_method || 'クリックポスト（送料込）');
  const shipDate = toIsoDate(addBusinessDays(new Date(), 3));

  const shipping = (session as unknown as { shipping_details?: { address?: StripeAddress; name?: string } }).shipping_details;
  const addr = shipping?.address || (session.customer_details?.address as StripeAddress | undefined);
  const recipientName = shipping?.name || name;

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
<p>この度は IRONWORKS ado をご利用いただき、誠にありがとうございます。<br>下記の内容でご注文を承りました。</p>

<div class="section-title">ご注文内容</div>
<div class="summary">
<div class="row"><span class="label">商品</span><span class="value">${esc(productLabel)}</span></div>
<div class="row"><span class="label">数量</span><span class="value">${qty}個</span></div>
<div class="row"><span class="label">単価</span><span class="value">¥${unitYen.toLocaleString()}（税込・送料込）</span></div>
<div class="row"><span class="label">配送方法</span><span class="value">${esc(shippingMethod)}</span></div>
<div class="total">合計: ¥${totalYen.toLocaleString()}（税込）</div>
</div>

<div class="section-title">お届け先</div>
<div class="summary">
<div class="row"><span class="label">お名前</span><span class="value">${esc(recipientName)} 様</span></div>
<div class="row"><span class="label">ご住所</span><span class="value">${esc(formatJpAddress(addr))}</span></div>
<div class="row"><span class="label">発送予定</span><span class="value">${formatJpDate(shipDate)}頃（${esc(shippingMethod)}）</span></div>
</div>

<hr class="divider">
<p style="font-size:12px;color:#888;">
クリックポストは投函配達のため、お届け日時のご指定はできません。発送後 2〜3 日でお届け予定です。<br>
適格請求書（領収書PDF）は別途 Stripe よりメールにてお送りいたします。<br>
ご不明点はお気軽にお問い合わせください: <a href="mailto:ado@tantetuzest.com" style="color:#c8a96e;">ado@tantetuzest.com</a>
</p>
<p style="font-size:11px;color:#aaa;">注文番号: ${esc(session.id)}</p>
</div>
<div class="footer">
<p>鍛鉄工房ZEST（蠣﨑 良治） / IRONWORKS <span>ado</span></p>
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
      // 工房（蠣﨑さん）への控えは sendWorkshopEmail が別途送るため BCC しない
      subject: `【IRONWORKS ado】ご注文を承りました — ${productLabel} × ${qty}`,
      html,
    }),
  });

  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error((e as { message?: string }).message || 'order email failed');
  }

  console.log('[webhook] Simple order confirmation email sent to', email);
}

// 長さを指定できる手すり = 工房控えメールに制作図リンクを付ける対象。
// Scroll / Fabrice / 鎚目（固定長）と SimpleProduct は制作図モーダルの対象外。
const DRAWING_LINK_PRODUCTS = new Set([
  'rene', 'claire', 'emile', 'marcel',
  'alexandre', 'catherine', 'claude', 'antoine',
]);
const SITE_ORIGIN = 'https://ado.tantetuzest.com';
const WORKSHOP_EMAIL = 'ado@tantetuzest.com';

/**
 * 工房（蠣﨑さん）宛の受注控えメール。全注文で送る。お客様宛の確認メールとは別物で、
 * ご注文内容・お客様情報（氏名/メール/電話/お届け先住所）・スケジュールをまとめる。
 * 長さ可変の手すりには、この注文の制作図ページ /seizu へのリンクボタンを付ける。
 * 顧客には届かない（to は工房のみ）。
 */
async function sendWorkshopEmail(session: Stripe.Checkout.Session, isSimple: boolean) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log('[webhook] RESEND_API_KEY not configured, skipping workshop email');
    return;
  }

  const meta = session.metadata || {};
  const productKey = String(meta.product || '').toLowerCase();
  const productName = String(meta.product_name || meta.product || 'ご注文商品');

  // お客様情報（発送・連絡用）
  const shipping = (session as unknown as { shipping_details?: { address?: StripeAddress; name?: string } }).shipping_details;
  const addr = shipping?.address || (session.customer_details?.address as StripeAddress | undefined);
  const recipientName = shipping?.name || session.customer_details?.name || '—';
  const email = session.customer_details?.email || '—';
  const phone = session.customer_details?.phone || '—';
  const totalYen = Number(meta.total_yen || session.amount_total || 0);

  // ── 注文内容・スケジュール・制作図リンクを商品種別で組み立てる ──
  const orderRows: Array<[string, string]> = [];
  const scheduleRows: Array<[string, string]> = [];
  let drawingUrl = '';
  let productLabel = productName;

  if (isSimple) {
    const qty = Number(meta.quantity || 1);
    const unitYen = Number(meta.unit_yen || 0);
    const shippingMethod = String(meta.shipping_method || 'クリックポスト（送料込）');
    const shipDate = toIsoDate(addBusinessDays(new Date(), 3));
    productLabel = `${productName} × ${qty}`;
    orderRows.push(['商品', productName], ['数量', `${qty}個`]);
    orderRows.push(['単価', `¥${unitYen.toLocaleString()}（税込・送料込）`]);
    orderRows.push(['配送方法', shippingMethod]);
    scheduleRows.push(['発送予定', `${formatJpDate(shipDate)}頃`]);
  } else {
    const lengthsInfo = parseLengthsMeta(meta);
    productLabel = `${productName} ${lengthsInfo.short}`;
    const isRush = meta.rush_delivery === 'true';
    orderRows.push(['商品', productName], ['長さ', lengthsInfo.full]);
    orderRows.push(['座金', lengthsInfo.isMulti
      ? `各本の長さに応じて自動配置${meta.washer_type ? ` / ${meta.washer_type}タイプ` : ''}`
      : `${meta.zakin_count || '—'}個${meta.washer_type ? ` / ${meta.washer_type}タイプ` : ''}`]);
    if (meta.angle_deg) {
      orderRows.push(['角度加工', `${meta.angle_dir === 'right' ? '右' : '左'}${meta.angle_deg}°`]);
    }
    orderRows.push(['配送区分', isRush ? '特急配送（5営業日）' : '通常配送（10営業日）']);
    scheduleRows.push(['制作開始', formatJpDate(meta.production_start)]);
    scheduleRows.push(['制作完了予定', formatJpDate(meta.production_complete)]);
    scheduleRows.push(['発送予定', formatJpDate(meta.shipping_date)]);
    scheduleRows.push(['お届け予定', formatJpDate(meta.preferred_arrival_date || meta.arrival_estimate)]);
    // 長さ可変の手すりだけ /seizu 制作図リンクを付ける
    if (DRAWING_LINK_PRODUCTS.has(productKey) && lengthsInfo.lengths.length > 0) {
      const params = new URLSearchParams();
      params.set('product', productKey);
      params.set('lengths', lengthsInfo.lengths.join(','));
      if (meta.washer_type) params.set('washer', meta.washer_type);
      if (meta.positions_mm) params.set('positions', meta.positions_mm);
      if (meta.angle_deg) {
        params.set('angle', meta.angle_deg);
        params.set('dir', meta.angle_dir || 'left');
      }
      params.set('order', session.id);
      drawingUrl = `${SITE_ORIGIN}/seizu?${params.toString()}`;
    }
  }

  const customerRows: Array<[string, string]> = [
    ['お名前', `${recipientName} 様`],
    ['メール', email],
    ['電話', phone],
    ['お届け先', formatJpAddress(addr)],
  ];

  const renderRows = (rows: Array<[string, string]>) =>
    rows
      .map(([l, v]) => `<div class="row"><span class="label">${esc(l)}</span><span class="value">${esc(v)}</span></div>`)
      .join('');

  const fromAddress = process.env.CONTACT_FROM || 'IRONWORKS ado <noreply@tantetuzest.com>';

  const html = `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8">
<style>body{font-family:'Helvetica Neue',Arial,sans-serif;background:#f3f4f6;color:#333;margin:0;padding:0;}
.wrap{max-width:600px;margin:32px auto;background:#fff;border:1px solid #e5e7eb;}
.header{background:#0e0e0e;color:#f5f5f5;padding:22px 32px;}
.header h1{font-size:13px;letter-spacing:0.25em;margin:0;font-weight:400;}
.header span{color:#c8a96e;}
.body{padding:28px 32px;font-size:14px;line-height:1.9;color:#444;}
.body p{margin:0 0 16px;}
.section-title{font-size:12px;letter-spacing:0.15em;color:#888;margin:22px 0 10px;}
.summary{background:#f3f4f6;border-left:3px solid #c8a96e;padding:12px 20px;font-size:13px;color:#555;}
.row{display:flex;gap:12px;padding:7px 0;border-bottom:1px solid #e5e7eb;}
.row:last-child{border-bottom:none;}
.label{color:#888;font-size:12px;min-width:96px;}
.value{color:#222;font-size:13px;flex:1;}
.total{font-size:17px;color:#0e0e0e;font-weight:600;text-align:right;padding:14px 4px 2px;}
.btn-wrap{text-align:center;margin:24px 0 4px;}
.btn{display:inline-block;background:#0e0e0e;color:#f5f5f5;text-decoration:none;
padding:15px 36px;font-size:14px;letter-spacing:0.06em;}
.btn span{color:#c8a96e;}
.note{font-size:11px;color:#999;line-height:1.8;margin-top:18px;}
.footer{background:#0e0e0e;padding:16px 32px;text-align:center;}
.footer p{font-size:11px;color:#999;letter-spacing:0.08em;margin:0;}
.footer span{color:#c8a96e;}</style>
</head><body><div class="wrap">
<div class="header"><h1>IRONWORKS <span>ado</span> — 受注（工房控え）</h1></div>
<div class="body">
<p>EC サイトから新しいご注文が入りました。</p>

<div class="section-title">ご注文内容</div>
<div class="summary">
${renderRows(orderRows)}
<div class="total">合計: ¥${totalYen.toLocaleString()}（税込）</div>
</div>

<div class="section-title">${isSimple ? '発送' : '制作・配送スケジュール'}</div>
<div class="summary">${renderRows(scheduleRows)}</div>

<div class="section-title">お客様情報</div>
<div class="summary">${renderRows(customerRows)}</div>

${drawingUrl
  ? `<div class="btn-wrap"><a class="btn" href="${esc(drawingUrl)}">▶ 制作図を開く</a></div>
<p class="note" style="text-align:center;margin-top:8px;">ブラウザで表示 → PDF保存 / 印刷できます。座金位置・角度はご注文時の設定で作図されます。</p>`
  : ''}

<p class="note">
注文番号: ${esc(session.id)}<br>
※ このメールは工房用の控えです。お客様には届きません。
</p>
</div>
<div class="footer"><p>鍛鉄工房ZEST（蠣﨑 良治） / IRONWORKS <span>ado</span></p></div>
</div></body></html>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: fromAddress,
      to: [WORKSHOP_EMAIL],
      subject: `【受注${drawingUrl ? '・制作図' : ''}】${productLabel} — ${recipientName}様`,
      html,
    }),
  });

  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error((e as { message?: string }).message || 'workshop email failed');
  }

  console.log('[webhook] Workshop email sent for', session.id);
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

  // 多本長さ違い対応 (PR #3)
  const lengthsInfo = parseLengthsMeta(meta);
  const productLabel = `${meta.product_name || meta.product} ${lengthsInfo.short}`;
  const rushLabel = meta.rush_delivery === 'true' ? '【特急】' : '';
  const arrivalPref = meta.preferred_arrival_date
    ? `\n到着希望日: ${meta.preferred_arrival_date} ${meta.preferred_time_slot || '指定なし'}`
    : '';

  const description = [
    `商品: ${productLabel}`,
    `タイプ: ${meta.type}`,
    // 多本の場合は per-item 長さを別行で明示（蠣﨑さんの制作指示用）
    lengthsInfo.isMulti ? `本数内訳: ${lengthsInfo.perItemPlain}` : '',
    lengthsInfo.isMulti
      ? `座金: 各本の長さに応じて自動配置${meta.washer_type ? ` / 座金${meta.washer_type}タイプ` : ''}`
      : `座金: ${meta.zakin_count}個${meta.washer_type ? `・${meta.washer_type}タイプ` : ''}`,
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

async function createSimpleCalendarEvent(session: Stripe.Checkout.Session) {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY || !process.env.GOOGLE_CALENDAR_ID) {
    console.log('[webhook] Google Calendar not configured, skipping');
    return;
  }

  const { google } = await import('googleapis');
  const meta = session.metadata || {};
  const email = session.customer_details?.email || '不明';
  const name = session.customer_details?.name || '—';

  const shipping = (session as unknown as { shipping_details?: { address?: StripeAddress; name?: string } }).shipping_details;
  const addr = shipping?.address || (session.customer_details?.address as StripeAddress | undefined);
  const recipientName = shipping?.name || name;

  const productLabel = String(meta.product_name || meta.product || 'ご注文商品');
  const qty = Number(meta.quantity || 1);
  const totalYen = Number(meta.total_yen || session.amount_total || 0);
  const shippingMethod = String(meta.shipping_method || 'クリックポスト（送料込）');
  const shipDate = toIsoDate(addBusinessDays(new Date(), 3));

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
  const calendar = google.calendar({ version: 'v3', auth });

  const description = [
    `商品: ${productLabel} × ${qty}`,
    `合計: ¥${totalYen.toLocaleString()}（税込・送料込）`,
    `配送: ${shippingMethod}`,
    `お客様: ${recipientName} <${email}>`,
    `住所: ${formatJpAddress(addr)}`,
    `\nStripe Session: ${session.id}`,
  ].filter(Boolean).join('\n');

  await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    requestBody: {
      summary: `発送TODO — ${productLabel} × ${qty}`,
      description,
      start: { date: shipDate },
      end: { date: shipDate },
    },
  });

  console.log('[webhook] Created shipping TODO calendar event for ' + productLabel + ' on ' + shipDate);
}

/**
 * 受注台帳（Google スプレッドシート）の 2 行目に注文を 1 行挿入する。
 * 1 行目はヘッダー。新しい注文ほど上に来るよう、末尾追記ではなく 2 行目への挿入にしている。
 * ORDER_LEDGER_SHEET_ID 未設定なら何もしない（Calendar 連携と同じ任意機能扱い）。
 * 列順: 受注日 / 区分 / 顧客名 / 都道府県 / 住所 / メール / 電話 / 商品 / 仕様 / 金額 / 注文番号 / メモ
 */
async function prependOrderToLedger(session: Stripe.Checkout.Session) {
  const sheetId = LEDGER_SHEET_ID;
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    console.log('[webhook] Order ledger not configured, skipping');
    return;
  }

  const { google } = await import('googleapis');
  const meta = session.metadata || {};
  const isSimple = meta.product_type === 'simple';
  const lengthsInfo = parseLengthsMeta(meta);

  const shipping = (session as unknown as { shipping_details?: { address?: StripeAddress; name?: string } }).shipping_details;
  const addr = shipping?.address || (session.customer_details?.address as StripeAddress | undefined);

  const orderDate = new Date((session.created ?? Math.floor(Date.now() / 1000)) * 1000)
    .toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' });
  const productName = String(meta.product_name || meta.product || 'ご注文商品');
  const spec = isSimple
    ? `数量 ${meta.quantity || 1}`
    : [lengthsInfo.full, meta.zakin_count ? `座金${meta.zakin_count}個` : '', meta.washer_type ? `座金${meta.washer_type}タイプ` : '', meta.rush_delivery === 'true' ? '特急' : '']
        .filter(Boolean).join(' / ');

  const row = [
    orderDate,                                                        // 受注日
    '個人',                                                            // 区分（Stripe 決済は個人）
    shipping?.name || session.customer_details?.name || '—',          // 顧客名
    addr?.state || meta.prefecture || '',                             // 都道府県
    formatJpAddress(addr),                                            // 住所
    session.customer_details?.email || '',                            // メール
    session.customer_details?.phone || '',                            // 電話
    productName,                                                      // 商品
    spec,                                                             // 仕様
    String(meta.total_yen || session.amount_total || 0),              // 金額
    session.id,                                                       // 注文番号
    '',                                                               // メモ
  ];

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // 1 行目（ヘッダー）の直下に空行を 1 行挿入してから書き込む = 新しい注文を常に一番上に。
  // sheetId 0 = 先頭シート（受注台帳は単一シート運用のため固定で問題ない）。
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: sheetId,
    requestBody: {
      requests: [{
        insertDimension: {
          range: { sheetId: 0, dimension: 'ROWS', startIndex: 1, endIndex: 2 },
          inheritFromBefore: false,
        },
      }],
    },
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: 'A2:L2',
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  });

  console.log('[webhook] Order ledger row inserted at row 2 for', session.id);
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
    const meta = session.metadata || {};
    const isSimpleProduct = meta.product_type === 'simple';
    console.log(
      '[webhook] checkout.session.completed for',
      meta.product_name,
      isSimpleProduct ? '[SimpleProduct]' : '[手すり]'
    );

    try {
      if (isSimpleProduct) {
        await createSimpleCalendarEvent(session);
      } else {
        await createCalendarEvents(session);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[webhook] Calendar error:', message);
      // カレンダーエラーでもwebhookは成功応答を返す
    }

    try {
      if (isSimpleProduct) {
        await sendSimpleOrderEmail(session);
      } else {
        await sendOrderConfirmationEmail(session);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[webhook] Order email error:', message);
      // メール送信エラーでもwebhookは成功応答を返す
    }

    try {
      await sendWorkshopEmail(session, isSimpleProduct);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[webhook] Workshop email error:', message);
      // 工房控えメールのエラーでも webhook は成功応答を返す
    }

    try {
      await prependOrderToLedger(session);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[webhook] Order ledger error:', message);
      // 台帳追記エラーでもwebhookは成功応答を返す
    }
  }

  return NextResponse.json({ received: true });
}

// Next.js App Router: webhook で raw body を使うため bodyParser を無効化
export const runtime = 'nodejs';
