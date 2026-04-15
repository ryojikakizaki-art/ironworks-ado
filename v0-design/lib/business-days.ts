/**
 * 営業日計算モジュール（TypeScript）
 * 土日・祝日を除外した営業日ベースの納期計算
 */

// ── 2026-2027 日本の祝日（振替休日含む）──
const HOLIDAYS: string[] = [
  // 2026
  '2026-01-01', // 元日
  '2026-01-02', // 年始休業
  '2026-01-03', // 年始休業
  '2026-01-12', // 成人の日（第2月曜）
  '2026-02-11', // 建国記念の日
  '2026-02-23', // 天皇誕生日
  '2026-03-20', // 春分の日
  '2026-04-29', // 昭和の日
  '2026-05-03', // 憲法記念日
  '2026-05-04', // みどりの日
  '2026-05-05', // こどもの日
  '2026-05-06', // 振替休日（5/3日曜→5/6水曜振替）
  '2026-07-20', // 海の日（第3月曜）
  '2026-08-11', // 山の日
  '2026-09-21', // 敬老の日（第3月曜）
  '2026-09-23', // 秋分の日
  '2026-10-12', // スポーツの日（第2月曜）
  '2026-11-03', // 文化の日
  '2026-11-23', // 勤労感謝の日
  // 2027
  '2027-01-01', // 元日
  '2027-01-02', // 年始休業
  '2027-01-03', // 年始休業
  '2027-01-11', // 成人の日（第2月曜）
  '2027-02-11', // 建国記念の日
  '2027-02-23', // 天皇誕生日
  '2027-03-21', // 春分の日
  '2027-03-22', // 振替休日（3/21が日曜）
  '2027-04-29', // 昭和の日
  '2027-05-03', // 憲法記念日
  '2027-05-04', // みどりの日
  '2027-05-05', // こどもの日
  '2027-07-19', // 海の日（第3月曜）
  '2027-08-11', // 山の日
  '2027-09-20', // 敬老の日（第3月曜）
  '2027-09-23', // 秋分の日
  '2027-10-11', // スポーツの日（第2月曜）
  '2027-11-03', // 文化の日
  '2027-11-23', // 勤労感謝の日
];

// YYYY-MM-DD文字列のSetに変換（高速ルックアップ用）
const holidaySet: Set<string> = new Set(HOLIDAYS);

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = ('0' + (d.getMonth() + 1)).slice(-2);
  const dd = ('0' + d.getDate()).slice(-2);
  return y + '-' + m + '-' + dd;
}

function cloneDate(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * 営業日かどうか判定（土日・祝日 = false）
 */
export function isBusinessDay(date: Date): boolean {
  const dow = date.getDay();
  if (dow === 0 || dow === 6) return false; // 日曜・土曜
  return !holidaySet.has(toDateStr(date));
}

/**
 * 指定日からN営業日後の日付を返す
 */
export function addBusinessDays(startDate: Date, count: number): Date {
  const d = cloneDate(startDate);
  let added = 0;
  while (added < count) {
    d.setDate(d.getDate() + 1);
    if (isBusinessDay(d)) added++;
  }
  return d;
}

/**
 * 納品予定日を返す
 */
export function getDeliveryDate(orderDate: Date, isRush: boolean): Date {
  const days = isRush ? 5 : 10;
  return addBusinessDays(orderDate, days);
}

export interface ScheduleDates {
  productionStart: Date;
  productionComplete: Date;
  shippingDate: Date;
  arrivalDate: Date;
}

/**
 * 制作〜発送の全スケジュール日程を返す
 */
export function getScheduleDates(orderDate: Date, isRush: boolean): ScheduleDates {
  const productionStart = addBusinessDays(orderDate, 1);             // 翌営業日
  const productionComplete = addBusinessDays(productionStart, isRush ? 3 : 8); // 制作期間
  const shippingDate = addBusinessDays(productionComplete, 1);        // 制作完了翌営業日
  const arrivalDate = addBusinessDays(shippingDate, 1);               // 発送翌営業日（目安）
  return { productionStart, productionComplete, shippingDate, arrivalDate };
}

/**
 * 日付を日本語フォーマットで返す: YYYY年M月D日（曜日）
 */
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'] as const;
export function formatDateJa(date: Date): string {
  return date.getFullYear() + '年' +
    (date.getMonth() + 1) + '月' +
    date.getDate() + '日' +
    '（' + WEEKDAYS[date.getDay()] + '）';
}

/**
 * 日付をISO文字列 (YYYY-MM-DD) で返す
 */
export function formatDateISO(date: Date): string {
  return toDateStr(date);
}

/**
 * 地域別の配送所要日数（佐川急便、信越発）
 * 発送日からの暦日数（土日も配送あり）
 */
export const TRANSIT_DAYS: Record<string, number> = {
  hokkaido: 3,
  kita_tohoku: 2,
  minami_tohoku: 2,
  kanto: 1,
  shinetsu: 1,
  hokuriku: 1,
  tokai: 1,
  kansai: 2,
  chugoku: 2,
  shikoku: 2,
  kita_kyushu: 2,
  minami_kyushu: 3,
  okinawa: 5,
};

/**
 * 発送日+配送日数から到着予定日を返す
 */
export function getArrivalDate(shippingDate: Date, region: string): Date {
  const days = TRANSIT_DAYS[region] || 2;
  const d = cloneDate(shippingDate);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * 注文日・配送タイプ・地域から最短到着日を返す
 */
export function getEarliestArrival(orderDate: Date, isRush: boolean, region?: string): Date {
  const schedule = getScheduleDates(orderDate, isRush);
  return getArrivalDate(schedule.shippingDate, region || '');
}

const BusinessDays = {
  isBusinessDay,
  addBusinessDays,
  getDeliveryDate,
  getScheduleDates,
  getArrivalDate,
  getEarliestArrival,
  formatDateJa,
  formatDateISO,
  TRANSIT_DAYS,
  HOLIDAYS,
};

export default BusinessDays;
