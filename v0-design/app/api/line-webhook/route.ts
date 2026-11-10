import { NextRequest, NextResponse, after } from 'next/server';
import crypto from 'crypto';

/**
 * LINE公式アカウント（@786sadcb）の Messaging API Webhook。
 *
 * お客様から届いたメッセージを ado@ 宛てのメール（Resend）に転送する。
 * 画像・ファイルはメールに添付する（Gmail添付→Drive自動保存でDriveにも残る）。
 *
 * - LINE から届いた通知かは x-line-signature（チャネルシークレットの HMAC-SHA256）で確かめる
 * - 返信は今までどおり LINE公式アカウントのチャット画面から手で送る（ここからは送信しない）
 * - こちらからの返信は Webhook に来ないので、メールに残るのはお客様からのメッセージだけ
 *
 * 環境変数：LINE_CHANNEL_SECRET / LINE_CHANNEL_ACCESS_TOKEN / RESEND_API_KEY
 *           CONTACT_FROM / CONTACT_TO_EMAIL（お問い合わせフォームと共用）
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const LINE_API = 'https://api.line.me/v2/bot';
const LINE_DATA_API = 'https://api-data.line.me/v2/bot';
// Resend の添付上限（合計40MB）に余裕を持たせる。超えた分は「LINEで確認」と書く
const MAX_ATTACH_BYTES = 25 * 1024 * 1024;

interface LineSource { type: string; userId?: string }
interface LineMessage {
  id: string;
  type: string;
  text?: string;
  fileName?: string;
  fileSize?: number;
  title?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}
interface LineEvent {
  type: string;
  timestamp: number;
  source?: LineSource;
  message?: LineMessage;
}
interface Attachment { filename: string; content: string }

function esc(str: string | undefined | null): string {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function verifySignature(body: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = Buffer.from(crypto.createHmac('sha256', secret).update(body).digest('base64'));
  const given = Buffer.from(signature);
  return expected.length === given.length && crypto.timingSafeEqual(expected, given);
}

function jstTime(ms: number): string {
  return new Date(ms).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

async function displayName(userId: string | undefined, token: string): Promise<string> {
  if (!userId) return '（名前不明）';
  try {
    const r = await fetch(`${LINE_API}/profile/${encodeURIComponent(userId)}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) { console.error('[line-webhook] profile', r.status); return '（名前不明）'; }
    const p = (await r.json()) as { displayName?: string };
    return p.displayName || '（名前不明）';
  } catch (e) {
    console.error('[line-webhook] profile error', e);
    return '（名前不明）';
  }
}

const EXT: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp',
  'video/mp4': 'mp4', 'audio/m4a': 'm4a', 'audio/x-m4a': 'm4a', 'application/pdf': 'pdf',
};

async function fetchContent(msg: LineMessage, token: string, ts: number): Promise<Attachment | string> {
  try {
    const r = await fetch(`${LINE_DATA_API}/message/${encodeURIComponent(msg.id)}/content`, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) return `添付を取り出せませんでした（${r.status}）。LINEのトークで確認してください。`;
    const len = Number(r.headers.get('content-length') || 0);
    if (len > MAX_ATTACH_BYTES) return `ファイルが大きいため添付していません（約${Math.round(len / 1024 / 1024)}MB）。LINEのトークで確認してください。`;
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length > MAX_ATTACH_BYTES) return `ファイルが大きいため添付していません（約${Math.round(buf.length / 1024 / 1024)}MB）。LINEのトークで確認してください。`;
    const ctype = (r.headers.get('content-type') || '').split(';')[0].trim();
    const stamp = new Date(ts + 9 * 3600 * 1000).toISOString().slice(0, 19).replace(/[-:T]/g, '');
    const filename = msg.fileName || `LINE_${msg.type}_${stamp}_${msg.id.slice(-4)}.${EXT[ctype] || 'bin'}`;
    return { filename, content: buf.toString('base64') };
  } catch (e) {
    console.error('[line-webhook] content error', e);
    return '添付を取り出せませんでした。LINEのトークで確認してください。';
  }
}

const TYPE_LABEL: Record<string, string> = {
  text: 'テキスト', image: '画像', video: '動画', audio: '音声', file: 'ファイル', sticker: 'スタンプ', location: '位置情報',
};

async function handleEvents(events: LineEvent[]): Promise<void> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const apiKey = process.env.RESEND_API_KEY;
  if (!token || !apiKey) { console.error('[line-webhook] LINE_CHANNEL_ACCESS_TOKEN or RESEND_API_KEY not set'); return; }

  // 同じ通知に入っている同じ人のメッセージは1通のメールにまとめる（画像を何枚も送られたとき用）
  const byUser = new Map<string, LineEvent[]>();
  for (const ev of events) {
    if (ev.type !== 'message' && ev.type !== 'follow') continue;
    const key = ev.source?.userId || 'unknown';
    byUser.set(key, [...(byUser.get(key) || []), ev]);
  }

  for (const [userId, evs] of byUser) {
    const name = await displayName(userId === 'unknown' ? undefined : userId, token);
    const rows: string[] = [];
    const attachments: Attachment[] = [];
    let snippet = '';

    for (const ev of evs) {
      const time = jstTime(ev.timestamp);
      if (ev.type === 'follow') {
        rows.push(`<p><strong>${esc(time)}</strong>　友だち追加されました</p>`);
        snippet ||= '友だち追加';
        continue;
      }
      const m = ev.message;
      if (!m) continue;
      const label = TYPE_LABEL[m.type] || m.type;
      if (m.type === 'text') {
        rows.push(`<p><strong>${esc(time)}</strong><br>${esc(m.text).replace(/\n/g, '<br>')}</p>`);
        snippet ||= (m.text || '').replace(/\s+/g, ' ').slice(0, 30);
      } else if (['image', 'video', 'audio', 'file'].includes(m.type)) {
        const got = await fetchContent(m, token, ev.timestamp);
        if (typeof got === 'string') {
          rows.push(`<p><strong>${esc(time)}</strong>　${esc(label)}：${esc(got)}</p>`);
        } else {
          attachments.push(got);
          rows.push(`<p><strong>${esc(time)}</strong>　${esc(label)}（添付：${esc(got.filename)}）</p>`);
        }
        snippet ||= label;
      } else if (m.type === 'location') {
        const map = m.latitude != null && m.longitude != null ? `https://www.google.com/maps?q=${m.latitude},${m.longitude}` : '';
        rows.push(`<p><strong>${esc(time)}</strong>　位置情報：${esc(m.title)} ${esc(m.address)}${map ? `<br><a href="${esc(map)}">${esc(map)}</a>` : ''}</p>`);
        snippet ||= '位置情報';
      } else {
        rows.push(`<p><strong>${esc(time)}</strong>　（${esc(label)}）</p>`);
        snippet ||= label;
      }
    }
    if (rows.length === 0) continue;

    const subject = `[LINE] ${name} 様：${snippet}${attachments.length > 0 ? `（添付${attachments.length}件）` : ''}`;
    const html = `<div style="font-family:sans-serif;font-size:14px;line-height:1.7;color:#222;">
<p style="color:#666;">LINE公式アカウント（@786sadcb）に届いたメッセージです。</p>
<p><strong>${esc(name)} 様</strong></p>
${rows.join('\n')}
<hr style="border:none;border-top:1px solid #ddd;">
<p style="color:#666;font-size:12px;">返信は LINE公式アカウントのチャット（<a href="https://chat.line.biz/">chat.line.biz</a>）から送ってください。このメールに返信してもお客様には届きません。<br>LINEユーザーID：${esc(userId)}</p>
</div>`;

    const payload: Record<string, unknown> = {
      from: process.env.CONTACT_FROM || 'IRONWORKS ado <onboarding@resend.dev>',
      to: [process.env.CONTACT_TO_EMAIL || 'ado@tantetuzest.com'],
      subject,
      html,
    };
    if (attachments.length > 0) payload.attachments = attachments;
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!r.ok) console.error('[line-webhook] resend', r.status, await r.text().catch(() => ''));
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret) {
    console.error('[line-webhook] LINE_CHANNEL_SECRET not set');
    return NextResponse.json({ error: 'not configured' }, { status: 500 });
  }
  const body = await req.text();
  if (!verifySignature(body, req.headers.get('x-line-signature'), secret)) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
  }
  let events: LineEvent[] = [];
  try {
    events = (JSON.parse(body) as { events?: LineEvent[] }).events || [];
  } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }
  // LINE には先に 200 を返し、メール送信は応答のあとで行う（「検証」は events が空）
  if (events.length > 0) after(() => handleEvents(events));
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
