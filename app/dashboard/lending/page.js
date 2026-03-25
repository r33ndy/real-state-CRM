'use client';
import { useEffect, useState } from 'react';
import { useViewAsUser, buildApiUrl } from '@/lib/useViewAsUser';
import ProgressSummary from '@/components/ProgressSummary';

const LOAN_TYPES = ['Hard Money', 'Convencional', 'FHA', 'VA', 'USDA', 'Bridge Loan', 'DSCR', 'Comercial', 'Otro'];
const LENDING_FIELDS = ['company', 'phone', 'email', 'loan_type', 'max_loan_amount', 'ltv_percentage', 'estimated_closing_time', 'interest_rate', 'max_loan_term', 'min_loan_term', 'min_loan_amount', 'origination_points', 'work_states', 'notes'];

function getCompletion(record, fields) {
  const filled = fields.filter(f => record[f] !== null && record[f] !== undefined && record[f] !== '').length;
  return Math.round((filled / fields.length) * 100);
}
function completionClass(pct) { return pct >= 80 ? 'high' : pct >= 50 ? 'mid' : 'low'; }

export default function LendingPage() {
  const [records, setRecords] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [selected, setSelected] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const viewAsUserId = useViewAsUser();
  const [form, setForm] = useState({
    company: '', phone: '', email: '', loan_type: 'Hard Money',
    max_loan_amount: '', ltv_percentage: '', estimated_closing_time: '',
    interest_rate: '', max_loan_term: '', min_loan_term: '',
    min_loan_amount: '', origination_points: '', work_states: '', notes: ''
  });

  useEffect(() => { fetch('/api/auth/me').then(r => r.json()).then(data => setUser(data.user)); }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(buildApiUrl('/api/lending', user.role, viewAsUserId)).then(r => r.json()).then(data => { setRecords(data.lending || []); setLoading(false); });
  }, [user, viewAsUserId]);

  function updateField(key, value) { setForm(prev => ({ ...prev, [key]: value })); }
  function updateEditField(key, value) { setEditForm(prev => ({ ...prev, [key]: value })); }

  async function handleSave(e) {
    e.preventDefault(); setMessage(null);
    const payload = { ...form };
    if (viewAsUserId) payload.created_for = viewAsUserId;
    const res = await fetch('/api/lending', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) { setMessage({ type: 'error', text: data.error }); return; }
    setMessage({ type: 'success', text: `Lending "${data.lending.company}" registrado exitosamente` });
    setRecords(prev => [data.lending, ...prev]);
    setForm({ company: '', phone: '', email: '', loan_type: 'Hard Money', max_loan_amount: '', ltv_percentage: '', estimated_closing_time: '', interest_rate: '', max_loan_term: '', min_loan_term: '', min_loan_amount: '', origination_points: '', work_states: '', notes: '' });
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este registro?')) return;
    await fetch(`/api/lending/${id}`, { method: 'DELETE' });
    setRecords(prev => prev.filter(r => r.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  function openDetail(rec) { setSelected(rec); setEditMode(false); setEditForm({ ...rec }); }
  function startEdit() { setEditMode(true); setEditForm({ ...selected }); }

  async function handleUpdate(e) {
    e.preventDefault();
    const res = await fetch(`/api/lending/${selected.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) });
    if (!res.ok) { const data = await res.json(); setMessage({ type: 'error', text: data.error }); return; }
    setRecords(prev => prev.map(r => r.id === selected.id ? { ...r, ...editForm } : r));
    setSelected({ ...selected, ...editForm }); setEditMode(false);
    setMessage({ type: 'success', text: 'Registro actualizado exitosamente' });
  }

  if (!user || loading) return <div className="empty-state"><div className="spinner" style={{ width: 24, height: 24, margin: '0 auto' }}></div></div>;
  const isViewingOther = user.role === 'admin' && viewAsUserId;

  return (
    <>
      <div className="page-header"><div><div className="page-title">Lending</div><div className="page-subtitle">Directorio de compañías de préstamos</div></div>{isViewingOther && <ProgressSummary records={records} fields={LENDING_FIELDS} label="Progreso lending" />}</div>

      {isViewingOther && (<div className="alert alert-info" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: 'var(--accent-amber)' }}>🔍 Viendo datos del usuario seleccionado.</div>)}
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="card">
        <div className="card-title" style={{ marginBottom: '16px' }}>Agregar Lending</div>
        <form onSubmit={handleSave}>
          <div className="grid-2">
            <div className="field"><label>Compañía</label><input type="text" placeholder="Nombre de la compañía" value={form.company} onChange={e => updateField('company', e.target.value)} required /></div>
            <div className="field"><label>Teléfono</label><input type="text" placeholder="+1 (000) 000-0000" value={form.phone} onChange={e => updateField('phone', e.target.value)} /></div>
            <div className="field"><label>Correo</label><input type="email" placeholder="correo@empresa.com" value={form.email} onChange={e => updateField('email', e.target.value)} /></div>
            <div className="field"><label>Tipo de Préstamo</label><select value={form.loan_type} onChange={e => updateField('loan_type', e.target.value)}>{LOAN_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
            <div className="field"><label>Monto Máximo que Presta</label><input type="text" placeholder="Ej. $500,000" value={form.max_loan_amount} onChange={e => updateField('max_loan_amount', e.target.value)} /></div>
            <div className="field"><label>LTV Loan Amount (%)</label><input type="text" placeholder="Ej. 80%" value={form.ltv_percentage} onChange={e => updateField('ltv_percentage', e.target.value)} /></div>
            <div className="field"><label>Tiempo Estimado para Cierre</label><input type="text" placeholder="Ej. 30 días" value={form.estimated_closing_time} onChange={e => updateField('estimated_closing_time', e.target.value)} /></div>
          </div>
          <div className="divider"></div>
          <div className="section-title" style={{ marginBottom: '12px' }}>Términos</div>
          <div className="grid-2">
            <div className="field"><label>Intereses</label><input type="text" placeholder="Ej. 8.5%" value={form.interest_rate} onChange={e => updateField('interest_rate', e.target.value)} /></div>
            <div className="field"><label>Tiempo Máximo de Préstamo</label><input type="text" placeholder="Ej. 30 años" value={form.max_loan_term} onChange={e => updateField('max_loan_term', e.target.value)} /></div>
            <div className="field"><label>Tiempo Mínimo de Préstamo</label><input type="text" placeholder="Ej. 6 meses" value={form.min_loan_term} onChange={e => updateField('min_loan_term', e.target.value)} /></div>
            <div className="field"><label>Monto Mínimo de Préstamo</label><input type="text" placeholder="Ej. $50,000" value={form.min_loan_amount} onChange={e => updateField('min_loan_amount', e.target.value)} /></div>
            <div className="field"><label>Punto de Originario</label><input type="text" placeholder="Ej. 2 puntos" value={form.origination_points} onChange={e => updateField('origination_points', e.target.value)} /></div>
          </div>
          <div className="field"><label>Estados donde Trabajan</label><input type="text" placeholder="Ej. Florida, Texas, New York" value={form.work_states} onChange={e => updateField('work_states', e.target.value)} /></div>
          <div className="field"><label>Notas</label><textarea rows="2" placeholder="Observaciones adicionales..." value={form.notes} onChange={e => updateField('notes', e.target.value)}></textarea></div>
          <div className="btn-group"><button type="submit" className="btn btn-primary">Guardar lending</button></div>
        </form>
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: '16px' }}>Lending registrados</div>
        <div className="table-container"><table className="table">
          <thead><tr><th>Compañía</th><th>Tipo</th><th>Monto Máx.</th><th>LTV</th><th>Interés</th><th>Cierre</th><th>Completado</th><th>Acciones</th></tr></thead>
          <tbody>
            {records.map(rec => (
              <tr key={rec.id}>
                <td style={{ cursor: 'pointer' }} onClick={() => openDetail(rec)}>{rec.company}</td>
                <td><span className="tag">{rec.loan_type || '—'}</span></td>
                <td>{rec.max_loan_amount || '—'}</td>
                <td>{rec.ltv_percentage || '—'}</td>
                <td>{rec.interest_rate || '—'}</td>
                <td>{rec.estimated_closing_time || '—'}</td>
                <td><div className="completion-bar"><div className="completion-track"><div className={`completion-fill ${completionClass(getCompletion(rec, LENDING_FIELDS))}`} style={{ width: `${getCompletion(rec, LENDING_FIELDS)}%` }}></div></div><span className={`completion-text ${completionClass(getCompletion(rec, LENDING_FIELDS))}`}>{getCompletion(rec, LENDING_FIELDS)}%</span></div></td>
                <td><div className="actions-cell"><button className="btn btn-sm" onClick={() => openDetail(rec)}>Ver</button><button className="btn btn-sm btn-danger" onClick={() => handleDelete(rec.id)}>Eliminar</button></div></td>
              </tr>
            ))}
            {records.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Sin registros de lending</td></tr>}
          </tbody>
        </table></div>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setSelected(null); setEditMode(false); } }}>
          <div className="modal">
            <div className="modal-header"><h2>{editMode ? 'Editar lending' : 'Información del lending'}</h2><button className="modal-close" onClick={() => { setSelected(null); setEditMode(false); }}>✕</button></div>
            {!editMode ? (
              <>
                <div className="modal-body">
                  <div className="detail-row"><span className="detail-label">Compañía</span><span className="detail-value">{selected.company}</span></div>
                  <div className="detail-row"><span className="detail-label">Teléfono</span><span className="detail-value">{selected.phone || '—'}</span></div>
                  <div className="detail-row"><span className="detail-label">Correo</span><span className="detail-value">{selected.email || '—'}</span></div>
                  <div className="detail-row"><span className="detail-label">Tipo de Préstamo</span><span className="detail-value"><span className="tag">{selected.loan_type || '—'}</span></span></div>
                  <div className="detail-row"><span className="detail-label">Monto Máximo</span><span className="detail-value">{selected.max_loan_amount || '—'}</span></div>
                  <div className="detail-row"><span className="detail-label">LTV (%)</span><span className="detail-value">{selected.ltv_percentage || '—'}</span></div>
                  <div className="detail-row"><span className="detail-label">Tiempo de Cierre</span><span className="detail-value">{selected.estimated_closing_time || '—'}</span></div>
                  <div style={{ margin: '16px 0 8px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Términos</div>
                  <div className="detail-row"><span className="detail-label">Intereses</span><span className="detail-value">{selected.interest_rate || '—'}</span></div>
                  <div className="detail-row"><span className="detail-label">Plazo Máximo</span><span className="detail-value">{selected.max_loan_term || '—'}</span></div>
                  <div className="detail-row"><span className="detail-label">Plazo Mínimo</span><span className="detail-value">{selected.min_loan_term || '—'}</span></div>
                  <div className="detail-row"><span className="detail-label">Monto Mínimo</span><span className="detail-value">{selected.min_loan_amount || '—'}</span></div>
                  <div className="detail-row"><span className="detail-label">Puntos Originarios</span><span className="detail-value">{selected.origination_points || '—'}</span></div>
                  <div className="detail-row"><span className="detail-label">Estados donde Trabajan</span><span className="detail-value">{selected.work_states || '—'}</span></div>
                  {selected.notes && <div className="detail-row"><span className="detail-label">Notas</span><span className="detail-value">{selected.notes}</span></div>}
                </div>
                <div className="modal-footer"><button className="btn" onClick={() => { setSelected(null); setEditMode(false); }}>Cerrar</button><button className="btn btn-primary" onClick={startEdit}>Editar</button></div>
              </>
            ) : (
              <form onSubmit={handleUpdate}><div className="modal-body"><div className="grid-2">
                <div className="field"><label>Compañía</label><input type="text" value={editForm.company || ''} onChange={e => updateEditField('company', e.target.value)} required /></div>
                <div className="field"><label>Teléfono</label><input type="text" value={editForm.phone || ''} onChange={e => updateEditField('phone', e.target.value)} /></div>
                <div className="field"><label>Correo</label><input type="email" value={editForm.email || ''} onChange={e => updateEditField('email', e.target.value)} /></div>
                <div className="field"><label>Tipo de Préstamo</label><select value={editForm.loan_type || ''} onChange={e => updateEditField('loan_type', e.target.value)}>{LOAN_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                <div className="field"><label>Monto Máximo</label><input type="text" value={editForm.max_loan_amount || ''} onChange={e => updateEditField('max_loan_amount', e.target.value)} /></div>
                <div className="field"><label>LTV (%)</label><input type="text" value={editForm.ltv_percentage || ''} onChange={e => updateEditField('ltv_percentage', e.target.value)} /></div>
                <div className="field"><label>Tiempo de Cierre</label><input type="text" value={editForm.estimated_closing_time || ''} onChange={e => updateEditField('estimated_closing_time', e.target.value)} /></div>
                <div className="field"><label>Intereses</label><input type="text" value={editForm.interest_rate || ''} onChange={e => updateEditField('interest_rate', e.target.value)} /></div>
                <div className="field"><label>Plazo Máximo</label><input type="text" value={editForm.max_loan_term || ''} onChange={e => updateEditField('max_loan_term', e.target.value)} /></div>
                <div className="field"><label>Plazo Mínimo</label><input type="text" value={editForm.min_loan_term || ''} onChange={e => updateEditField('min_loan_term', e.target.value)} /></div>
                <div className="field"><label>Monto Mínimo</label><input type="text" value={editForm.min_loan_amount || ''} onChange={e => updateEditField('min_loan_amount', e.target.value)} /></div>
                <div className="field"><label>Puntos Originarios</label><input type="text" value={editForm.origination_points || ''} onChange={e => updateEditField('origination_points', e.target.value)} /></div>
              </div><div className="field"><label>Estados donde Trabajan</label><input type="text" value={editForm.work_states || ''} onChange={e => updateEditField('work_states', e.target.value)} /></div><div className="field"><label>Notas</label><textarea rows="2" value={editForm.notes || ''} onChange={e => updateEditField('notes', e.target.value)}></textarea></div></div>
              <div className="modal-footer"><button type="button" className="btn" onClick={() => setEditMode(false)}>Cancelar</button><button type="submit" className="btn btn-primary">Guardar cambios</button></div></form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
