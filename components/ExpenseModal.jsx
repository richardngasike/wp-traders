import { useState, useEffect } from 'react';
import { todayISO } from '../lib/calculations';

const CATEGORIES = ['Transport', 'Labour', 'Rent', 'Packaging', 'Utilities', 'Loading/Offloading', 'Other'];

export default function ExpenseModal({ initial, onClose, onSave, saving }) {
  const [form, setForm] = useState({
    expense_date: todayISO(),
    category: CATEGORIES[0],
    description: '',
    amount: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initial) {
      setForm({
        expense_date: initial.expense_date || todayISO(),
        category: initial.category || CATEGORIES[0],
        description: initial.description || '',
        amount: initial.amount ?? '',
      });
    }
  }, [initial]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    setError('');
    onSave({ ...form, amount: Number(form.amount) });
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ margin: 0 }}>{initial ? 'Edit Expense' : 'New Expense'}</h3>
          <button className="close-x" onClick={onClose}>
            ✕
          </button>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              className="form-control"
              value={form.expense_date}
              max={todayISO()}
              onChange={(e) => update('expense_date', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              className="form-control"
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Fuel for delivery truck"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Amount (KES)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="form-control"
              value={form.amount}
              onChange={(e) => update('amount', e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
            {saving ? <span className="spinner" /> : initial ? 'Save Changes' : 'Add Expense'}
          </button>
        </form>
      </div>
    </div>
  );
}
