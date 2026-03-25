'use client';
import { useEffect, useState } from 'react';
import { useViewAsUser, buildApiUrl } from '@/lib/useViewAsUser';
import ProgressSummary from '@/components/ProgressSummary';

const CATEGORIES = ['Ingeniero', 'Arquitecto', 'Compañía de Título', 'Abogado', 'Inspector de Limpieza', 'Inspector'];
import { US_STATES as STATES } from '@/lib/constants';
const PROF_FIELDS = ['category', 'name', 'phone', 'email', 'company', 'city', 'state', 'notes'];
function getCompletion(record, fields) {
  const filled = fields.filter(f => record[f] !== null && record[f] !== undefined && record[f] !== '').length;
  return Math.round((filled / fields.length) * 100);
}
function completionClass(pct) { return pct >= 80 ? 'high' : pct >= 50 ? 'mid' : 'low'; }

export default function ProfesionalesPage() {
  const [professionals, setProfessionals] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [selected, setSelected] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const viewAsUserId = useViewAsUser();
  const [form, setForm] = useState({ category: 'Ingeniero', name: '', phone: '', email: '', company: '', city: '', state: '', notes: '' });

  useEffect(() => { fetch('/api/auth/me').then(r => r.json()).then(data => setUser(data.user)); }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(buildApiUrl('/api/professionals', user.role, viewAsUserId)).then(r => r.json()).then(data => { setProfessionals(data.professionals || []); setLoading(false); });
  }, [user, viewAsUserId]);

  function updateField(key, value) { setForm(prev => ({ ...prev, [key]: value })); }
  function updateEditField(key, value) { setEditForm(prev => ({ ...prev, [key]: value })); }

  async function handleSave(e) {
    e.preventDefault(); setMessage(null);
    const payload = { ...form };
    if (viewAsUserId) payload.created_for = viewAsUserId;
    const res = await fetch('/api/professionals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) { setMessage({ type: 'error', text: data.error }); return; }
    setMessage({ type: 'success', text: `Profesional "${data.professional.name}" registrado exitosamente` });
    setProfessionals(prev => [data.professional, ...prev]);
    setForm({ category: 'Ingeniero', name: '', phone: '', email: '', company: '', city: '', state: '', notes: '' });
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este profesional?')) return;
    await fetch(`/api/professionals/${id}`, { method: 'DELETE' });
    setProfessionals(prev => prev.filter(p => p.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  function openDetail(pro) { setSelected(pro); setEditMode(false); setEditForm({ ...pro }); }
  function startEdit() { setEditMode(true); setEditForm({ ...selected }); }

  async function handleUpdate(e) {
    e.preventDefault();
    const res = await fetch(`/api/professionals/${selected.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) });
    if (!res.ok) { const data = await res.json(); setMessage({ type: 'error', text: data.error }); return; }
    setProfessionals(prev => prev.map(p => p.id === selected.id ? { ...p, ...editForm } : p));
    setSelected({ ...selected, ...editForm }); setEditMode(false);
    setMessage({ type: 'success', text: 'Profesional actualizado exitosamente' });
  }

  if (!user || loading) return <div className="empty-state"><div className="spinner" style={{ width: 24, height: 24, margin: '0 auto' }}></div></div>;
  const isViewingOther = user.role === 'admin' && viewAsUserId;

  return (
    <>
      <div className="page-header"><div><div className="page-title">Directorio de profesionales</div><div className="page-subtitle">Ingenieros, Arquitectos, Compañías de Título, Abogados, Inspectores</div></div>{isViewingOther && <ProgressSummary records={professionals} fields={PROF_FIELDS} label="Progreso profesionales" />}</div>

      {isViewingOther && (<div className="alert alert-info" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: 'var(--accent-amber)' }}>🔍 Viendo datos del usuario seleccionado.</div>)}
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="card">
        <div className="card-title" style={{ marginBottom: '16px' }}>Agregar profesional</div>
        <form onSubmit={handleSave}>
          <div className="grid-2">
            <div className="field"><label>Categoría</label><select value={form.category} onChange={e => updateField('category', e.target.value)}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
            <div className="field"><label>Nombre / Empresa</label><input type="text" placeholder="Nombre o razón social" value={form.name} onChange={e => updateField('name', e.target.value)} required /></div>
            <div className="field"><label>Teléfono</label><input type="text" placeholder="+1 (000) 000-0000" value={form.phone} onChange={e => updateField('phone', e.target.value)} /></div>
            <div className="field"><label>Email</label><input type="email" placeholder="correo@empresa.com" value={form.email} onChange={e => updateField('email', e.target.value)} /></div>
            <div className="field"><label>Compañía</label><input type="text" placeholder="Empresa (opcional)" value={form.company} onChange={e => updateField('company', e.target.value)} /></div>
            <div className="field"><label>Estado</label><select value={form.state} onChange={e => updateField('state', e.target.value)}><option value="">-- Seleccionar --</option>{STATES.map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="field"><label>Ciudad de servicio</label><input type="text" placeholder="Ej. Miami" value={form.city} onChange={e => updateField('city', e.target.value)} /></div>
          </div>
          <div className="field"><label>Notas</label><textarea rows="2" placeholder="Experiencia, referencias..." value={form.notes} onChange={e => updateField('notes', e.target.value)}></textarea></div>
          <div className="btn-group"><button type="submit" className="btn btn-primary">Guardar profesional</button></div>
        </form>
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: '16px' }}>Profesionales registrados</div>
        <div className="table-container"><table className="table">
          <thead><tr><th>Nombre</th><th>Categoría</th><th>Ciudad</th><th>Teléfono</th><th>Email</th><th>Completado</th><th>Acciones</th></tr></thead>
          <tbody>
            {professionals.map(pro => (<tr key={pro.id}><td style={{ cursor: 'pointer' }} onClick={() => openDetail(pro)}>{pro.name}</td><td><span className="tag">{pro.category}</span></td><td>{pro.city}{pro.state ? `, ${pro.state}` : ''}</td><td>{pro.phone || '—'}</td><td style={{ color: 'var(--text-secondary)' }}>{pro.email || '—'}</td><td><div className="completion-bar"><div className="completion-track"><div className={`completion-fill ${completionClass(getCompletion(pro, PROF_FIELDS))}`} style={{ width: `${getCompletion(pro, PROF_FIELDS)}%` }}></div></div><span className={`completion-text ${completionClass(getCompletion(pro, PROF_FIELDS))}`}>{getCompletion(pro, PROF_FIELDS)}%</span></div></td><td><div className="actions-cell"><button className="btn btn-sm" onClick={() => openDetail(pro)}>Ver</button><button className="btn btn-sm btn-danger" onClick={() => handleDelete(pro.id)}>Eliminar</button></div></td></tr>))}
            {professionals.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Sin profesionales registrados</td></tr>}
          </tbody>
        </table></div>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setSelected(null); setEditMode(false); } }}>
          <div className="modal">
            <div className="modal-header"><h2>{editMode ? 'Editar profesional' : 'Información del profesional'}</h2><button className="modal-close" onClick={() => { setSelected(null); setEditMode(false); }}>✕</button></div>
            {!editMode ? (
              <><div className="modal-body">
                <div className="detail-row"><span className="detail-label">Nombre</span><span className="detail-value">{selected.name}</span></div>
                <div className="detail-row"><span className="detail-label">Categoría</span><span className="detail-value"><span className="tag">{selected.category}</span></span></div>
                <div className="detail-row"><span className="detail-label">Teléfono</span><span className="detail-value">{selected.phone || '—'}</span></div>
                <div className="detail-row"><span className="detail-label">Email</span><span className="detail-value">{selected.email || '—'}</span></div>
                <div className="detail-row"><span className="detail-label">Compañía</span><span className="detail-value">{selected.company || '—'}</span></div>
                <div className="detail-row"><span className="detail-label">Ciudad</span><span className="detail-value">{selected.city}{selected.state ? `, ${selected.state}` : ''}</span></div>
                {selected.notes && <div className="detail-row"><span className="detail-label">Notas</span><span className="detail-value">{selected.notes}</span></div>}
              </div><div className="modal-footer"><button className="btn" onClick={() => { setSelected(null); setEditMode(false); }}>Cerrar</button><button className="btn btn-primary" onClick={startEdit}>Editar</button></div></>
            ) : (
              <form onSubmit={handleUpdate}><div className="modal-body"><div className="grid-2">
                <div className="field"><label>Categoría</label><select value={editForm.category || ''} onChange={e => updateEditField('category', e.target.value)}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
                <div className="field"><label>Nombre</label><input type="text" value={editForm.name || ''} onChange={e => updateEditField('name', e.target.value)} required /></div>
                <div className="field"><label>Teléfono</label><input type="text" value={editForm.phone || ''} onChange={e => updateEditField('phone', e.target.value)} /></div>
                <div className="field"><label>Email</label><input type="email" value={editForm.email || ''} onChange={e => updateEditField('email', e.target.value)} /></div>
                <div className="field"><label>Compañía</label><input type="text" value={editForm.company || ''} onChange={e => updateEditField('company', e.target.value)} /></div>
                <div className="field"><label>Estado</label><select value={editForm.state || ''} onChange={e => updateEditField('state', e.target.value)}><option value="">--</option>{STATES.map(s => <option key={s}>{s}</option>)}</select></div>
                <div className="field"><label>Ciudad</label><input type="text" value={editForm.city || ''} onChange={e => updateEditField('city', e.target.value)} /></div>
              </div><div className="field"><label>Notas</label><textarea rows="2" value={editForm.notes || ''} onChange={e => updateEditField('notes', e.target.value)}></textarea></div></div>
              <div className="modal-footer"><button type="button" className="btn" onClick={() => setEditMode(false)}>Cancelar</button><button type="submit" className="btn btn-primary">Guardar cambios</button></div></form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
