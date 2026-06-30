// =====================================================================
// Calculation helpers shared across Dashboard & Reports
// =====================================================================

export function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Summarize a list of cereal_records rows.
 * totalBuying  = sum(buying_price * quantity_bought)
 * totalSelling = sum(selling_price * quantity_sold)
 * grossProfit  = totalSelling - totalBuying
 */
export function summarizeRecords(records = []) {
  let totalBuying = 0;
  let totalSelling = 0;
  let quantityBought = 0;
  let quantitySold = 0;

  records.forEach((r) => {
    totalBuying += toNum(r.buying_price) * toNum(r.quantity_bought);
    totalSelling += toNum(r.selling_price) * toNum(r.quantity_sold);
    quantityBought += toNum(r.quantity_bought);
    quantitySold += toNum(r.quantity_sold);
  });

  return {
    totalBuying,
    totalSelling,
    quantityBought,
    quantitySold,
    grossProfit: totalSelling - totalBuying,
  };
}

export function summarizeExpenses(expenses = []) {
  const total = expenses.reduce((sum, e) => sum + toNum(e.amount), 0);
  return { totalExpenses: total };
}

/**
 * Full report combining records + expenses for a given filtered set.
 */
export function buildReport(records = [], expenses = []) {
  const { totalBuying, totalSelling, quantityBought, quantitySold, grossProfit } =
    summarizeRecords(records);
  const { totalExpenses } = summarizeExpenses(expenses);
  const netProfit = grossProfit - totalExpenses;

  return {
    totalBuying,
    totalSelling,
    quantityBought,
    quantitySold,
    grossProfit,
    totalExpenses,
    netProfit,
  };
}

export function formatKES(amount) {
  const n = toNum(amount);
  return 'KES ' + n.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Returns YYYY-MM-DD for "today" in local time. */
export function todayISO() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

/** Returns [start, end] ISO date strings for the last N days including today. */
export function lastNDaysRange(n) {
  const end = todayISO();
  const d = new Date();
  d.setDate(d.getDate() - (n - 1));
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  const start = local.toISOString().slice(0, 10);
  return [start, end];
}

/** Returns [start, end] ISO date strings for current calendar month. */
export function currentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)];
}
