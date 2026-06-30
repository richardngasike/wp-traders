import { useEffect, useState, useCallback, useMemo } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import RecordModal from '../components/RecordModal';
import DateRangePicker from '../components/DateRangePicker';
import { supabase } from '../lib/supabaseClient';
import { formatKES, formatDate, todayISO, lastNDaysRange } from '../lib/calculations';
import { useAuth } from '../context/AuthContext';

export default function RecordsPage() {
  const { user } = useAuth();
  const [cereals, setCereals] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [range, setRange] = useState(lastNDaysRange(30));

  const cerealsById = useMemo(() => {
    const map = {};
    cereals.forEach((c) => (map[c.id] = c));
    return map;
  }, [cereals]);

  const loadCereals = useCallback(async () => {
    const { data } = await supabase.from('cereals').select('*').order('name');
    setCereals(data || []);
  }, []);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    const [from, to] = range;
    const { data, error } = await supabase
      .from('cereal_records')
      .select('*')
      .gte('record_date', from)
      .lte('record_date', to)
      .order('record_date', { ascending: false });
    if (!error) setRecords(data || []);
    setLoading(false);
  }, [range]);

  useEffect(() => {
    loadCereals();
  }, [loadCereals]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  async function handleSave(form) {
    setSaving(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from('cereal_records')
          .update(form)
          .eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cereal_records')
          .insert([{ ...form, created_by: user?.id }]);
        if (error) throw error;
      }
      setShowModal(false);
      setEditing(null);
      await loadRecords();
    } catch (err) {
      alert(err.message || 'Failed to save record.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this record permanently?')) return;
    const { error } = await supabase.from('cereal_records').delete().eq('id', id);
    if (error) {
      alert(error.message);
    } else {
      loadRecords();
    }
  }

  return (
    <ProtectedRoute>
      <Layout title="Cereal Records" subtitle="Daily buying & selling prices per cereal type.">
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
            + Add Record
          </button>
        </div>

        <div className="table-wrap">
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
                <th>Notes</th>
                <th>Actions</th>
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
                    <td style={{ color: profit >= 0 ? 'var(--color-primary)' : 'var(--color-danger)', fontWeight: 700 }}>
                      {formatKES(profit)}
                    </td>
                    <td>{r.notes || '—'}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => {
                            setEditing(r);
                            setShowModal(true);
                          }}
                        >
                          Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && records.length === 0 && (
            <div className="empty-state">No cereal records found for this date range.</div>
          )}
          {loading && <div className="empty-state">Loading records…</div>}
        </div>

        {showModal && (
          <RecordModal
            cereals={cereals}
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
