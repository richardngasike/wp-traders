import { useEffect, useState, useCallback } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import ExpenseModal from '../components/ExpenseModal';
import DateRangePicker from '../components/DateRangePicker';
import { supabase } from '../lib/supabaseClient';
import { formatKES, formatDate, lastNDaysRange } from '../lib/calculations';
import { useAuth } from '../context/AuthContext';

export default function ExpensesPage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [range, setRange] = useState(lastNDaysRange(30));

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    const [from, to] = range;
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .gte('expense_date', from)
      .lte('expense_date', to)
      .order('expense_date', { ascending: false });
    if (!error) setExpenses(data || []);
    setLoading(false);
  }, [range]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  async function handleSave(form) {
    setSaving(true);
    try {
      if (editing) {
        const { error } = await supabase.from('expenses').update(form).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('expenses').insert([{ ...form, created_by: user?.id }]);
        if (error) throw error;
      }
      setShowModal(false);
      setEditing(null);
      await loadExpenses();
    } catch (err) {
      alert(err.message || 'Failed to save expense.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this expense permanently?')) return;
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) {
      alert(error.message);
    } else {
      loadExpenses();
    }
  }

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <ProtectedRoute>
      <Layout title="Daily Expenses" subtitle="Track all operating expenses by date.">
        <div className="toolbar">
          <DateRangePicker
            fromDate={range[0]}
            toDate={range[1]}
            onChange={(from, to) => setRange([from, to])}
          />
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditing(null);
              setShowModal(true);
            }}
          >
            + Add Expense
          </button>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div className="stat-label">Total Expenses in Range</div>
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>
            {formatKES(total)}
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Actions</th>
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
                  <td>
                    <div className="row-actions">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          setEditing(e);
                          setShowModal(true);
                        }}
                      >
                        Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(e.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && expenses.length === 0 && (
            <div className="empty-state">No expenses recorded for this date range.</div>
          )}
          {loading && <div className="empty-state">Loading expenses…</div>}
        </div>

        {showModal && (
          <ExpenseModal
            initial={editing}
            saving={saving}
            onClose={() => {
              setShowModal(false);
              setEditing(null);
            }}
            onSave={handleSave}
          />
        )}
      </Layout>
    </ProtectedRoute>
  );
}
