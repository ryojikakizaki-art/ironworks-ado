/**
 * 営業日計算モジュール（UMD: ブラウザ + Node.js 両対応）
 * 土日・祝日を除外した営業日ベースの納期計算
 */
(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BusinessDays = factory();
})(typeof self !== 'undefined' ? self : this, function() {
  'use strict';

  // ── 2026-2027 日本の祝日（振替休日含む）──
  var HOLIDAYS = [
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
    '2026-05-06', // 振替休日（5/5が火曜→5/6水曜ではない。5/3日曜→5/6水曜振替）
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
  var holidaySet = {};
  for (var i = 0; i < HOLIDAYS.length; i++) {
    holidaySet[HOLIDAYS[i]] = true;
  }

  function toDateStr(d) {
    var y = d.getFullYear();
    var m = ('0' + (d.getMonth() + 1)).slice(-2);
    var dd = ('0' + d.getDate()).slice(-2);
    return y + '-' + m + '-' + dd;
  }

  function cloneDate(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  /**
   * 営業日かどうか判定（土日・祝日 = false）
   */
  function isBusinessDay(date) {
    var dow = date.getDay();
    if (dow === 0 || dow === 6) return false; // 日曜・土曜
    return !holidaySet[toDateStr(date)];
  }

  /**
   * 指定日からN営業日後の日付を返す
   */
  function addBusinessDays(startDate, count) {
    var d = cloneDate(startDate);
    var added = 0;
    while (added < count) {
      d.setDate(d.getDate() + 1);
      if (isBusinessDay(d)) added++;
    }
    return d;
  }

  /**
   * 納品予定日を返す
   * @param {Date} orderDate - 注文日
   * @param {boolean} isRush - 特急配送かどうか
   * @returns {Date} 納品予定日
   */
  function getDeliveryDate(orderDate, isRush) {
    var days = isRush ? 5 : 10;
    return addBusinessDays(orderDate, days);
  }

  /**
   * 制作〜発送の全スケジュール日程を返す
   * @param {Date} orderDate - 注文日
   * @param {boolean} isRush - 特急配送かどうか
   * @returns {Object} { productionStart, productionComplete, shippingDate, arrivalDate }
   */
  function getScheduleDates(orderDate, isRush) {
    var productionStart = addBusinessDays(orderDate, 1);             // 翌営業日
    var productionComplete = addBusinessDays(productionStart, isRush ? 3 : 8); // 制作期間
    var shippingDate = addBusinessDays(productionComplete, 1);        // 制作完了翌営業日
    var arrivalDate = addBusinessDays(shippingDate, 1);               // 発送翌営業日（目安）
    return {
      productionStart: productionStart,
      productionComplete: productionComplete,
      shippingDate: shippingDate,
      arrivalDate: arrivalDate
    };
  }

  /**
   * 日付を日本語フォーマットで返す: YYYY年M月D日（曜日）
   */
  var WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];
  function formatDateJa(date) {
    return date.getFullYear() + '\u5E74' +
           (date.getMonth() + 1) + '\u6708' +
           date.getDate() + '\u65E5' +
           '\uFF08' + WEEKDAYS[date.getDay()] + '\uFF09';
  }

  /**
   * 日付をISO文字列 (YYYY-MM-DD) で返す
   */
  function formatDateISO(date) {
    return toDateStr(date);
  }

  /**
   * 地域別の配送所要日数（佐川急便、信越発）
   * 発送日からの暦日数（土日も配送あり）
   */
  var TRANSIT_DAYS = {
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
    okinawa: 5
  };

  /**
   * 発送日+配送日数から到着予定日を返す
   * @param {Date} shippingDate - 発送日
   * @param {string} region - 地域キー
   * @returns {Date} 到着予定日
   */
  function getArrivalDate(shippingDate, region) {
    var days = TRANSIT_DAYS[region] || 2;
    var d = cloneDate(shippingDate);
    d.setDate(d.getDate() + days);
    return d;
  }

  /**
   * 注文日・配送タイプ・地域から最短到着日を返す
   * @param {Date} orderDate
   * @param {boolean} isRush
   * @param {string} region - 地域キー（省略時はデフォルト2日）
   * @returns {Date}
   */
  function getEarliestArrival(orderDate, isRush, region) {
    var schedule = getScheduleDates(orderDate, isRush);
    return getArrivalDate(schedule.shippingDate, region);
  }

  return {
    isBusinessDay: isBusinessDay,
    addBusinessDays: addBusinessDays,
    getDeliveryDate: getDeliveryDate,
    getScheduleDates: getScheduleDates,
    getArrivalDate: getArrivalDate,
    getEarliestArrival: getEarliestArrival,
    formatDateJa: formatDateJa,
    formatDateISO: formatDateISO,
    TRANSIT_DAYS: TRANSIT_DAYS,
    HOLIDAYS: HOLIDAYS
  };
});
