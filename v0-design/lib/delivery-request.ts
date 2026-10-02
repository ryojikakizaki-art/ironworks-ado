/**
 * お届け希望日時・備考（カート画面で任意入力 → カード決済 / 銀行振込の両方へ渡す）。
 *
 * 選択肢・サーバ側の検証・メール / 受注台帳 / カレンダーの表記をここに集約する。
 * Stripe metadata のキーは旧サイトからの互換で preferred_arrival_date /
 * preferred_time_slot をそのまま使い、備考だけ customer_note を新設している。
 */
import { getEarliestArrival, isBusinessDay, formatDateISO, TRANSIT_DAYS } from '@/lib/business-days'
import { PREF_TO_REGION } from '@/lib/shipping/sagawa'

/** 佐川急便の時間帯区分（2026-10 蠣﨑さん確認・6区分） */
export const DELIVERY_TIME_SLOTS = [
  '午前中',
  '12〜14時',
  '14〜16時',
  '16〜18時',
  '18〜20時',
  '19〜21時',
] as const

/** 希望日を選べる範囲（最短お届け予定日から何日先まで） */
export const PREFERRED_DATE_RANGE_DAYS = 60

/** 備考の最大文字数（Stripe metadata の値は 500 文字まで） */
export const CUSTOMER_NOTE_MAX = 300

export interface DeliveryRequest {
  /** YYYY-MM-DD。空 = 指定なし（最短でお届け） */
  preferredArrivalDate: string
  /** DELIVERY_TIME_SLOTS のいずれか。空 = 指定なし */
  preferredTimeSlot: string
  /** お客様の備考（自由記入） */
  customerNote: string
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'] as const

function parseIsoDate(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return isNaN(d.getTime()) || formatDateISO(d) !== iso ? null : d
}

/** 「10月20日（火）」 */
export function formatPreferredDateJa(iso: string): string {
  const d = parseIsoDate(iso)
  if (!d) return iso
  return `${d.getMonth() + 1}月${d.getDate()}日（${WEEKDAYS[d.getDay()]}）`
}

/** 配送先都道府県まで加味した最短お届け予定日（未選択なら全国の目安） */
export function earliestArrivalFor(now: Date, rush: boolean, prefecture: string): Date {
  return getEarliestArrival(now, rush, PREF_TO_REGION[prefecture])
}

/** 希望日の選択肢（最短お届け予定日 〜 PREFERRED_DATE_RANGE_DAYS 日後） */
export function preferredDateOptions(
  now: Date,
  rush: boolean,
  prefecture: string,
): Array<{ value: string; label: string }> {
  const start = earliestArrivalFor(now, rush, prefecture)
  const options: Array<{ value: string; label: string }> = []
  for (let i = 0; i <= PREFERRED_DATE_RANGE_DAYS; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    const value = formatDateISO(d)
    options.push({ value, label: formatPreferredDateJa(value) })
  }
  return options
}

/** 改行は残し、制御文字を落として上限で切る */
export function sanitizeCustomerNote(raw: unknown): string {
  return String(raw ?? '')
    .replace(/\r\n?/g, '\n')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, CUSTOMER_NOTE_MAX)
}

/**
 * クライアント申告のお届け希望をサーバ側で検証する。
 *
 * - 時間帯は区分にない値を捨てる
 * - 希望日は最短予定日の前後に余裕を持たせて受ける。サーバ（UTC）とお客様の端末（JST）で
 *   日付がずれる・カート画面を開いたまま日をまたぐ、の両方で数日ずれうるため。
 *   ご希望に添えない場合は工房から連絡する運用（カート画面に明記）。
 */
export function sanitizeDeliveryRequest(
  body: { preferredArrivalDate?: unknown; preferredTimeSlot?: unknown; customerNote?: unknown } | null | undefined,
  ctx: { rush: boolean; prefecture: string; now?: Date },
): DeliveryRequest {
  const slotRaw = String(body?.preferredTimeSlot ?? '')
  const preferredTimeSlot = (DELIVERY_TIME_SLOTS as readonly string[]).includes(slotRaw) ? slotRaw : ''

  let preferredArrivalDate = ''
  const date = parseIsoDate(String(body?.preferredArrivalDate ?? ''))
  if (date) {
    const earliest = earliestArrivalFor(ctx.now ?? new Date(), ctx.rush, ctx.prefecture)
    const min = new Date(earliest.getFullYear(), earliest.getMonth(), earliest.getDate() - 3)
    const max = new Date(earliest.getFullYear(), earliest.getMonth(), earliest.getDate() + PREFERRED_DATE_RANGE_DAYS + 3)
    if (date >= min && date <= max) preferredArrivalDate = formatDateISO(date)
  }

  return { preferredArrivalDate, preferredTimeSlot, customerNote: sanitizeCustomerNote(body?.customerNote) }
}

/**
 * 希望日に合わせた発送予定日。
 * 希望日 − 配送日数 以前の直近の営業日に発送する（最短の発送予定日より前にはしない）。
 */
export function shippingDateForPreferred(
  earliestShipping: Date,
  preferredArrivalDate: string,
  prefecture: string,
): Date {
  const preferred = parseIsoDate(preferredArrivalDate)
  if (!preferred) return earliestShipping
  const transit = TRANSIT_DAYS[PREF_TO_REGION[prefecture] || ''] || 2
  const d = new Date(preferred.getFullYear(), preferred.getMonth(), preferred.getDate() - transit)
  while (!isBusinessDay(d)) d.setDate(d.getDate() - 1)
  return d > earliestShipping ? d : earliestShipping
}

/** 「10月20日（火） 18〜20時」。どちらも指定なしなら空文字 */
export function formatDeliveryWish(preferredArrivalDate?: string, preferredTimeSlot?: string): string {
  if (!preferredArrivalDate && !preferredTimeSlot) return ''
  const datePart = preferredArrivalDate ? formatPreferredDateJa(preferredArrivalDate) : '日付指定なし'
  return [datePart, preferredTimeSlot].filter(Boolean).join(' ')
}

/** 受注台帳 L 列・カレンダー用の 1 行表記（改行は「／」に置き換える） */
export function deliveryRequestMemo(req: {
  preferredArrivalDate?: string
  preferredTimeSlot?: string
  customerNote?: string
}): string {
  const wish = formatDeliveryWish(req.preferredArrivalDate, req.preferredTimeSlot)
  const note = (req.customerNote || '').replace(/\n+/g, ' ／ ')
  return [wish ? `お届け希望 ${wish}` : '', note ? `備考: ${note}` : ''].filter(Boolean).join(' / ')
}

/** Stripe metadata → DeliveryRequest */
export function deliveryRequestFromMetadata(meta: Record<string, string | undefined>): DeliveryRequest {
  return {
    preferredArrivalDate: meta.preferred_arrival_date || '',
    preferredTimeSlot: meta.preferred_time_slot || '',
    customerNote: meta.customer_note || '',
  }
}
