'use client';
import { useEffect, useState } from 'react';
import { useViewAsUser, buildApiUrl } from '@/lib/useViewAsUser';
import ProgressSummary from '@/components/ProgressSummary';
import { US_STATES as STATES } from '@/lib/constants';
const CRIME_LEVELS = ['Bajo', 'Moderado', 'Alto'];
const MARKET_FIELDS = ['state', 'city', 'population', 'avg_price', 'days_on_market', 'crime_index'];

function getCompletion(record, fields) {
  const filled = fields.filter(f => record[f] !== null && record[f] !== undefined && record[f] !== '').length;
  return Math.round((filled / fields.length) * 100);
}
function completionClass(pct) { return pct >= 80 ? 'high' : pct >= 50 ? 'mid' : 'low'; }

export default function MercadoPage() {
  const [evaluations, setEvaluations] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [selected, setSelected] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const viewAsUserId = useViewAsUser();
  const [form, setForm] = useState({
    state: '', city: '', population: '', avg_price: '',
    days_on_market: '', crime_index: 'Bajo'
  });

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => setUser(data.user));
  }, []);

  // Reload data when viewAsUserId changes
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const url = buildApiUrl('/api/market', user.role, viewAsUserId);
    fetch(url).then(r => r.json()).then(data => {
      setEvaluations(data.evaluations || []);
      setLoading(false);
    });
  }, [user, viewAsUserId]);

  function updateField(key, value) { setForm(prev => ({ ...prev, [key]: value })); }
  function updateEditField(key, value) { setEditForm(prev => ({ ...prev, [key]: value })); }

  async function handleSave(e) {
    e.preventDefault();
    setMessage(null);
    const payload = { ...form };
    if (viewAsUserId) payload.created_for = viewAsUserId;
    const res = await fetch('/api/market', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) { setMessage({ type: 'error', text: data.error }); return; }
    setMessage({ type: 'success', text: 'Evaluación guardada exitosamente' });
    setEvaluations(prev => [data.evaluation, ...prev]);
    setForm({ state: '', city: '', population: '', avg_price: '', days_on_market: '', crime_index: 'Bajo' });
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta evaluación?')) return;
    await fetch(`/api/market/${id}`, { method: 'DELETE' });
    setEvaluations(prev => prev.filter(e => e.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  function openDetail(ev) { setSelected(ev); setEditMode(false); setEditForm({ ...ev }); }
  function startEdit() { setEditMode(true); setEditForm({ ...selected }); }

  async function handleUpdate(e) {
    e.preventDefault();
    const res = await fetch(`/api/market/${selected.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    if (!res.ok) { const data = await res.json(); setMessage({ type: 'error', text: data.error }); return; }
    setEvaluations(prev => prev.map(e => e.id === selected.id ? { ...e, ...editForm } : e));
    setSelected({ ...selected, ...editForm });
    setEditMode(false);
    setMessage({ type: 'success', text: 'Evaluación actualizada exitosamente' });
  }

  function getCrimeBadge(index) {
    if (index === 'Bajo') return 'badge-green';
    if (index === 'Moderado') return 'badge-amber';
    return 'badge-red';
  }

  if (!user || loading) return <div className="empty-state"><div className="spinner" style={{ width: 24, height: 24, margin: '0 auto' }}></div></div>;

  const isViewingOther = user.role === 'admin' && viewAsUserId;

  return (
    <>
      <div className="page-header">
        <div><div className="page-title">Evaluación de mercado</div>
        <div className="page-subtitle">Registrar y consultar datos por ciudad</div></div>
        {isViewingOther && <ProgressSummary records={evaluations} fields={MARKET_FIELDS} label="Progreso mercado" />}
      </div>

      {isViewingOther && (
        <div className="alert alert-info" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: 'var(--accent-amber)' }}>
          🔍 Viendo datos del usuario seleccionado. Los registros nuevos se crearán bajo tu cuenta de admin.
        </div>
      )}

      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="card">
        <div className="card-title" style={{ marginBottom: '16px' }}>Registrar ciudad</div>
        <form onSubmit={handleSave}>
          <div className="grid-2">
            <div className="field"><label>Estado</label><select value={form.state} onChange={e => updateField('state', e.target.value)} required><option value="">-- Seleccionar --</option>{STATES.map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="field"><label>Ciudad</label><input type="text" placeholder="Ej. Miami" value={form.city} onChange={e => updateField('city', e.target.value)} required /></div>
            <div className="field"><label>Población estimada</label><input type="text" placeholder="Ej. 450,000" value={form.population} onChange={e => updateField('population', e.target.value)} /></div>
            <div className="field"><label>Precio promedio de vivienda</label><input type="text" placeholder="$ USD" value={form.avg_price} onChange={e => updateField('avg_price', e.target.value)} /></div>
            <div className="field"><label>Tiempo promedio en mercado (días)</label><input type="number" placeholder="Ej. 45" value={form.days_on_market} onChange={e => updateField('days_on_market', e.target.value)} /></div>
            <div className="field"><label>Índice de crimen</label><select value={form.crime_index} onChange={e => updateField('crime_index', e.target.value)}>{CRIME_LEVELS.map(c => <option key={c}>{c}</option>)}</select></div>
          </div>
          <div className="btn-group"><button type="submit" className="btn btn-primary">Guardar evaluación</button></div>
        </form>
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: '16px' }}>Ciudades registradas</div>
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Ciudad</th><th>Estado</th><th>Población</th><th>Precio prom.</th><th>Días</th><th>Crimen</th><th>Completado</th><th>Acciones</th></tr></thead>
            <tbody>
              {evaluations.map(ev => (
                <tr key={ev.id}>
                  <td style={{ cursor: 'pointer' }} onClick={() => openDetail(ev)}>{ev.city}</td>
                  <td>{ev.state}</td><td>{ev.population || '—'}</td><td>{ev.avg_price || '—'}</td><td>{ev.days_on_market || '—'}</td>
                  <td><span className={`badge ${getCrimeBadge(ev.crime_index)}`}>{ev.crime_index}</span></td>
                  <td><div className="completion-bar"><div className="completion-track"><div className={`completion-fill ${completionClass(getCompletion(ev, MARKET_FIELDS))}`} style={{ width: `${getCompletion(ev, MARKET_FIELDS)}%` }}></div></div><span className={`completion-text ${completionClass(getCompletion(ev, MARKET_FIELDS))}`}>{getCompletion(ev, MARKET_FIELDS)}%</span></div></td>
                  <td><div className="actions-cell"><button className="btn btn-sm" onClick={() => openDetail(ev)}>Ver</button><button className="btn btn-sm btn-danger" onClick={() => handleDelete(ev.id)}>Eliminar</button></div></td>
                </tr>
              ))}
              {evaluations.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Sin evaluaciones registradas</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setSelected(null); setEditMode(false); } }}>
          <div className="modal">
            <div className="modal-header"><h2>{editMode ? 'Editar evaluación' : 'Información de mercado'}</h2><button className="modal-close" onClick={() => { setSelected(null); setEditMode(false); }}>✕</button></div>
            {!editMode ? (
              <>
                <div className="modal-body">
                  <div className="detail-row"><span className="detail-label">Ciudad</span><span className="detail-value">{selected.city}</span></div>
                  <div className="detail-row"><span className="detail-label">Estado</span><span className="detail-value">{selected.state}</span></div>
                  <div className="detail-row"><span className="detail-label">Población</span><span className="detail-value">{selected.population || '—'}</span></div>
                  <div className="detail-row"><span className="detail-label">Precio promedio</span><span className="detail-value">{selected.avg_price || '—'}</span></div>
                  <div className="detail-row"><span className="detail-label">Días en mercado</span><span className="detail-value">{selected.days_on_market || '—'}</span></div>
                  <div className="detail-row"><span className="detail-label">Índice de crimen</span><span className="detail-value"><span className={`badge ${getCrimeBadge(selected.crime_index)}`}>{selected.crime_index}</span></span></div>
                </div>
                <div className="modal-footer"><button className="btn" onClick={() => { setSelected(null); setEditMode(false); }}>Cerrar</button><button className="btn btn-primary" onClick={startEdit}>Editar</button></div>
              </>
            ) : (
              <form onSubmit={handleUpdate}><div className="modal-body"><div className="grid-2">
                <div className="field"><label>Ciudad</label><input type="text" value={editForm.city || ''} onChange={e => updateEditField('city', e.target.value)} required /></div>
                <div className="field"><label>Estado</label><select value={editForm.state || ''} onChange={e => updateEditField('state', e.target.value)}><option value="">--</option>{STATES.map(s => <option key={s}>{s}</option>)}</select></div>
                <div className="field"><label>Población</label><input type="text" value={editForm.population || ''} onChange={e => updateEditField('population', e.target.value)} /></div>
                <div className="field"><label>Precio promedio</label><input type="text" value={editForm.avg_price || ''} onChange={e => updateEditField('avg_price', e.target.value)} /></div>
                <div className="field"><label>Días en mercado</label><input type="number" value={editForm.days_on_market || ''} onChange={e => updateEditField('days_on_market', e.target.value)} /></div>
                <div className="field"><label>Índice de crimen</label><select value={editForm.crime_index || 'Bajo'} onChange={e => updateEditField('crime_index', e.target.value)}>{CRIME_LEVELS.map(c => <option key={c}>{c}</option>)}</select></div>
              </div></div><div className="modal-footer"><button type="button" className="btn" onClick={() => setEditMode(false)}>Cancelar</button><button type="submit" className="btn btn-primary">Guardar cambios</button></div></form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
