import { todayISO, lastNDaysRange, currentMonthRange } from '../lib/calculations';

export default function DateRangePicker({ fromDate, toDate, onChange }) {
  function setRange(from, to) {
    onChange(from, to);
  }

  return (
    <div className="toolbar-filters">
      <div className="filter-field">
        <label>From</label>
        <input
          type="date"
          className="form-control"
          value={fromDate}
          max={toDate || todayISO()}
          onChange={(e) => setRange(e.target.value, toDate)}
        />
      </div>
      <div className="filter-field">
        <label>To</label>
        <input
          type="date"
          className="form-control"
          value={toDate}
          min={fromDate}
          max={todayISO()}
          onChange={(e) => setRange(fromDate, e.target.value)}
        />
      </div>
      <div className="filter-field">
        <label>&nbsp;</label>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setRange(todayISO(), todayISO())}
          >
            Today
          </button>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => {
              const [s, e] = lastNDaysRange(7);
              setRange(s, e);
            }}
          >
            7 Days
          </button>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => {
              const [s, e] = currentMonthRange();
              setRange(s, e);
            }}
          >
            This Month
          </button>
        </div>
      </div>
    </div>
  );
}
