import { useState, useEffect } from 'react';
import { todayISO } from '../lib/calculations';

export default function RecordModal({ cereals, initial, onClose, onSave, saving }) {
  const [form, setForm] = useState({
    record_date: todayISO(),
    cereal_id: cereals?.[0]?.id || '',
    buying_price: '',
    selling_price: '',
    quantity_bought: '',
    quantity_sold: '',
    notes: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initial) {
      setForm({
        record_date: initial.record_date || todayISO(),
        cereal_id: initial.cereal_id || cereals?.[0]?.id || '',
        buying_price: initial.buying_price ?? '',
        selling_price: initial.selling_price ?? '',
        quantity_bought: initial.quantity_bought ?? '',
        quantity_sold: initial.quantity_sold ?? '',
        notes: initial.notes || '',
      });
    }
  }, [initial, cereals]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.cereal_id) {
      setError('Please select a cereal.');
      return;
    }
    if (!form.record_date) {
      setError('Please select a date.');
      return;
    }
    setError('');
    onSave({
      ...form,
      buying_price: Number(form.buying_price) || 0,
      selling_price: Number(form.selling_price) || 0,
      quantity_bought: Number(form.quantity_bought) || 0,
      quantity_sold: Number(form.quantity_sold) || 0,
    });
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ margin: 0 }}>{initial ? 'Edit Cereal Record' : 'New Cereal Record'}</h3>
          <button className="close-x" onClick={onClose}>
            ✕
          </button>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                className="form-control"
                value={form.record_date}
                max={todayISO()}
                onChange={(e) => update('record_date', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Cereal</label>
              <select
                className="form-control"
                value={form.cereal_id}
                onChange={(e) => update('cereal_id', e.target.value)}
                required
              >
                {cereals?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Buying Price (per kg)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                placeholder="e.g. 140"
                value={form.buying_price}
                onChange={(e) => update('buying_price', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Selling Price (per kg)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                placeholder="e.g. 155"
                value={form.selling_price}
                onChange={(e) => update('selling_price', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Quantity Bought (kg)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                value={form.quantity_bought}
                onChange={(e) => update('quantity_bought', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Quantity Sold (kg)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                value={form.quantity_sold}
                onChange={(e) => update('quantity_sold', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Notes (optional)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Supplier name, quality grade..."
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
            {saving ? <span className="spinner" /> : initial ? 'Save Changes' : 'Add Record'}
          </button>
        </form>
      </div>
    </div>
  );
}
