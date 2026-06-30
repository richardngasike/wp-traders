import { useEffect, useState, useCallback, useMemo } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import DateRangePicker from '../components/DateRangePicker';
import { supabase } from '../lib/supabaseClient';
import { buildReport, formatKES, formatDate, lastNDaysRange } from '../lib/calculations';
import { exportReportPDF } from '../lib/pdfExport';
import { useAuth } from '../context/AuthContext';

export default function ReportsPage() {
  const { profile } = useAuth();
  const [cereals, setCereals] = useState([]);
  const [records, setRecords] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [range, setRange] = useState(lastNDaysRange(7));

  const cerealsById = useMemo(() => {
    const map = {};
    cereals.forEach((c) => (map[c.id] = c));
    return map;
  }, [cereals]);

  const loadCereals = useCallback(async () => {
    const { data } = await supabase.from('cereals').select('*').order('name');
    setCereals(data || []);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [from, to] = range;
    const [{ data: recs }, { data: exps }] = await Promise.all([
      supabase
        .from('cereal_records')
        .select('*')
        .gte('record_date', from)
        .lte('record_date', to)
        .order('record_date', { ascending: true }),
      supabase
        .from('expenses')
        .select('*')
        .gte('expense_date', from)
        .lte('expense_date', to)
        .order('expense_date', { ascending: true }),
    ]);
    setRecords(recs || []);
    setExpenses(exps || []);
    setLoading(false);
  }, [range]);

  useEffect(() => {
    loadCereals();
  }, [loadCereals]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totals = buildReport(records, expenses);

  async function handleExport() {
    setExporting(true);
    try {
      await exportReportPDF({
        fromDate: range[0],
        toDate: range[1],
        records,
        expenses,
        totals,
        cerealsById,
        generatedBy: profile?.full_name,
      });
    } catch (err) {
      alert('Failed to generate PDF: ' + (err.message || err));
    } finally {
      setExporting(false);
    }
  }

  return (
    <ProtectedRoute>
      <Layout
        title="Reports"
        subtitle="Select any date range to view buying price, selling price, expenses & profit — then export as PDF."
      >
        <div className="toolbar">
          <DateRangePicker
            fromDate={range[0]}
            toDate={range[1]}
            onChange={(from, to) => setRange([from, to])}
          />
          <button className="btn btn-accent" onClick={handleExport} disabled={exporting || loading}>
            {exporting ? <span className="spinner" style={{ borderTopColor: '#2b2200' }} /> : '⬇ Export PDF Report'}
          </button>
        </div>

        <div className="stats-grid">
          <StatCard label="Total Buying Price" value={formatKES(totals.totalBuying)} />
          <StatCard label="Total Selling Price" value={formatKES(totals.totalSelling)} variant="accent" />
          <StatCard label="Gross Profit" value={formatKES(totals.grossProfit)} />
          <StatCard label="Total Expenses" value={formatKES(totals.totalExpenses)} variant="danger" />
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="stat-label">Net Profit ({formatDate(range[0])} — {formatDate(range[1])})</div>
          <div
            className="stat-value"
            style={{
              fontSize: 30,
              color: totals.netProfit >= 0 ? 'var(--color-primary)' : 'var(--color-danger)',
            }}
          >
            {formatKES(totals.netProfit)}
          </div>
        </div>

        <h3>Cereal Records</h3>
        <div className="table-wrap" style={{ marginBottom: 24 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Cereal</th>
                <th>Buying Price/kg</th>
                <th>Selling Price/kg</th>
                <th>Qty Bought</th>
                <th>Qty Sold</th>
                <th>Profit</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const profit =
                  Number(r.selling_price) * Number(r.quantity_sold) -
                  Number(r.buying_price) * Number(r.quantity_bought);
                return (
                  <tr key={r.id}>
                    <td>{formatDate(r.record_date)}</td>
                    <td>{cerealsById[r.cereal_id]?.name || '—'}</td>
                    <td>{formatKES(r.buying_price)}</td>
                    <td>{formatKES(r.selling_price)}</td>
                    <td>{r.quantity_bought} kg</td>
                    <td>{r.quantity_sold} kg</td>
                    <td>{formatKES(profit)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && records.length === 0 && (
            <div className="empty-state">No records in this period.</div>
          )}
        </div>

        <h3>Expenses</h3>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id}>
                  <td>{formatDate(e.expense_date)}</td>
                  <td>
                    <span className="badge">{e.category}</span>
                  </td>
                  <td>{e.description || '—'}</td>
                  <td>{formatKES(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && expenses.length === 0 && (
            <div className="empty-state">No expenses in this period.</div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
