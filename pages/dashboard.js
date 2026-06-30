import { useEffect, useState, useCallback } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { supabase } from '../lib/supabaseClient';
import {
  buildReport,
  formatKES,
  todayISO,
  lastNDaysRange,
  currentMonthRange,
} from '../lib/calculations';

function PeriodBlock({ title, range, cereals }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [from, to] = range;
    const [{ data: records }, { data: expenses }] = await Promise.all([
      supabase.from('cereal_records').select('*').gte('record_date', from).lte('record_date', to),
      supabase.from('expenses').select('*').gte('expense_date', from).lte('expense_date', to),
    ]);
    setReport(buildReport(records || [], expenses || []));
    setLoading(false);
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="card" style={{ marginBottom: 18 }}>
      <h3 style={{ marginBottom: 14 }}>{title}</h3>
      {loading || !report ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <div className="stats-grid" style={{ marginBottom: 0 }}>
          <StatCard label="Buying Price Total" value={formatKES(report.totalBuying)} />
          <StatCard label="Selling Price Total" value={formatKES(report.totalSelling)} variant="accent" />
          <StatCard label="Total Expenses" value={formatKES(report.totalExpenses)} variant="danger" />
          <StatCard label="Net Profit" value={formatKES(report.netProfit)} />
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const today = todayISO();
  const weekRange = lastNDaysRange(7);
  const monthRange = currentMonthRange();

  return (
    <ProtectedRoute>
      <Layout
        title="Dashboard"
        subtitle="Live overview of buying price, selling price, expenses and profit."
      >
        <PeriodBlock title={`📅 Today (${today})`} range={[today, today]} />
        <PeriodBlock title="🗓️ This Week (Last 7 Days)" range={weekRange} />
        <PeriodBlock title="📆 This Month" range={monthRange} />

        <div className="card">
          <h3>Quick Tips</h3>
          <p>
            • Cereal buying &amp; selling prices fluctuate daily — always add a fresh record each day
            for accurate calculations.
          </p>
          <p>• Add all daily expenses (transport, labour, rent, etc.) under the Expenses tab.</p>
          <p>
            • Use the Reports tab to select any custom date range and export a branded PDF report.
          </p>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
