'use client';

export default function ProgressSummary({ records, fields, label }) {
  if (!records || records.length === 0) return null;

  const getCompletion = (record) => {
    const filled = fields.filter(f => {
      const v = record[f];
      if (typeof v === 'boolean') return true;
      return v !== null && v !== undefined && v !== '' && v !== 0;
    }).length;
    return Math.round((filled / fields.length) * 100);
  };

  const completions = records.map(r => getCompletion(r));
  const avg = Math.round(completions.reduce((a, b) => a + b, 0) / completions.length);
  const complete = completions.filter(c => c === 100).length;
  const partial = completions.filter(c => c > 0 && c < 100).length;

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (avg / 100) * circumference;
  const color = avg >= 80 ? '#22c55e' : avg >= 50 ? '#f59e0b' : '#f43f5e';

  return (
    <div className="progress-summary">
      <div className="progress-ring-container">
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
          <circle cx="36" cy="36" r={radius} fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round" transform="rotate(-90 36 36)"
            style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }} />
        </svg>
        <div className="progress-ring-text" style={{ color }}>{avg}%</div>
      </div>
      <div className="progress-info">
        <div className="progress-info-title">{label}</div>
        <div className="progress-info-stat"><span style={{ color: '#22c55e' }}>●</span> {complete} completos</div>
        <div className="progress-info-stat"><span style={{ color: '#f59e0b' }}>●</span> {partial} parciales</div>
        <div className="progress-info-stat">{records.length} registros total</div>
      </div>
    </div>
  );
}
