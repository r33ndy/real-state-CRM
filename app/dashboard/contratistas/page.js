'use client';
import { useEffect, useState } from 'react';
import { useViewAsUser, buildApiUrl } from '@/lib/useViewAsUser';
import ProgressSummary from '@/components/ProgressSummary';

const SPECIALTIES = ['Electricista', 'Plomero', 'Contratista General', 'Pintura', 'HVAC', 'Techos', 'Pisos', 'Carpintería', 'Demolición', 'Paisajismo'];
import { US_STATES as STATES } from '@/lib/constants';
const CONTRACTOR_FIELDS = ['name', 'company', 'phone', 'email', 'specialty', 'city', 'state', 'work_area', 'max_simultaneous_projects', 'permit_days', 'does_new_construction', 'has_license', 'has_insurance', 'has_own_team', 'notes'];
function getCompletion(record, fields) {
  const filled = fields.filter(f => {
    const v = record[f];
    if (typeof v === 'boolean') return true;
    return v !== null && v !== undefined && v !== '' && v !== 0;
  }).length;
  return Math.round((filled / fields.length) * 100);
}
function completionClass(pct) { return pct >= 80 ? 'high' : pct >= 50 ? 'mid' : 'low'; }

export default function ContratistasPage() {
  const [contractors, setContractors] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [selected, setSelected] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const viewAsUserId = useViewAsUser();
  const [form, setForm] = useState({
    name: '', company: '', phone: '', email: '',
    specialty: 'Electricista', city: '', state: '', work_area: '',
    max_simultaneous_projects: '', permit_days: '',
    does_new_construction: false, has_license: false,
    has_insurance: false, has_own_team: false, notes: ''
  });

  useEffect(() => { fetch('/api/auth/me').then(r => r.json()).then(data => setUser(data.user)); }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(buildApiUrl('/api/contractors', user.role, viewAsUserId))
      .then(r => r.json())
      .then(data => { setContractors(data.contractors || []); setLoading(false); });
  }, [user, viewAsUserId]);

  function updateField(key, value) { setForm(prev => ({ ...prev, [key]: value })); }
  function updateEditField(key, value) { setEditForm(prev => ({ ...prev, [key]: value })); }

  async function handleSave(e) {
    e.preventDefault();
    setMessage(null);
    const res = await fetch('/api/contractors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setMessage({ type: 'error', text: data.error }); return; }
    setMessage({ type: 'success', text: `Contratista "${data.contractor.name}" registrado exitosamente` });
    if (!viewAsUserId) setContractors(prev => [data.contractor, ...prev]);
    setForm({ name: '', company: '', phone: '', email: '', specialty: 'Electricista', city: '', state: '', work_area: '', max_simultaneous_projects: '', permit_days: '', does_new_construction: false, has_license: false, has_insurance: false, has_own_team: false, notes: '' });
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este contratista?')) return;
    await fetch(`/api/contractors/${id}`, { method: 'DELETE' });
    setContractors(prev => prev.filter(c => c.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  function openDetail(con) { setSelected(con); setEditMode(false); setEditForm({ ...con }); }
  function startEdit() { setEditMode(true); setEditForm({ ...selected }); }

  async function handleUpdate(e) {
    e.preventDefault();
    const res = await fetch(`/api/contractors/${selected.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    if (!res.ok) { const data = await res.json(); setMessage({ type: 'error', text: data.error }); return; }
    setContractors(prev => prev.map(c => c.id === selected.id ? { ...c, ...editForm } : c));
    setSelected({ ...selected, ...editForm });
    setEditMode(false);
    setMessage({ type: 'success', text: 'Contratista actualizado exitosamente' });
  }

  if (!user || loading) return <div className="empty-state"><div className="spinner" style={{ width: 24, height: 24, margin: '0 auto' }}></div></div>;
  const isViewingOther = user.role === 'admin' && viewAsUserId;

  return (
    <>
      <div className="page-header">
        <div><div className="page-title">Directorio de contratistas</div>
        <div className="page-subtitle">Especialidades, capacidad y disponibilidad</div></div>
        <ProgressSummary records={contractors} fields={CONTRACTOR_FIELDS} label="Progreso contratistas" />
      </div>

      {isViewingOther && (<div className="alert alert-info" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: 'var(--accent-amber)' }}>🔍 Viendo datos del usuario seleccionado.</div>)}
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="card">
        <div className="card-title" style={{ marginBottom: '16px' }}>Registrar contratista</div>
        <form onSubmit={handleSave}>
          <div className="grid-2">
            <div className="field"><label>Nombre</label><input type="text" placeholder="Nombre completo" value={form.name} onChange={e => updateField('name', e.target.value)} required /></div>
            <div className="field"><label>Compañía</label><input type="text" placeholder="Empresa (si aplica)" value={form.company} onChange={e => updateField('company', e.target.value)} /></div>
            <div className="field"><label>Teléfono</label><input type="text" placeholder="+1 (000) 000-0000" value={form.phone} onChange={e => updateField('phone', e.target.value)} /></div>
            <div className="field"><label>Email</label><input type="email" placeholder="correo@empresa.com" value={form.email} onChange={e => updateField('email', e.target.value)} /></div>
            <div className="field"><label>Especialidad</label><select value={form.specialty} onChange={e => updateField('specialty', e.target.value)}>{SPECIALTIES.map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="field"><label>Área de trabajo</label><input type="text" placeholder="Ej. Residencial, Comercial" value={form.work_area} onChange={e => updateField('work_area', e.target.value)} /></div>
            <div className="field"><label>Estado</label><select value={form.state} onChange={e => updateField('state', e.target.value)}><option value="">-- Seleccionar --</option>{STATES.map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="field"><label>Ciudad de trabajo</label><input type="text" placeholder="Ej. Miami" value={form.city} onChange={e => updateField('city', e.target.value)} /></div>
            <div className="field"><label>Proyectos simultáneos (máx.)</label><input type="number" placeholder="Ej. 3" value={form.max_simultaneous_projects} onChange={e => updateField('max_simultaneous_projects', e.target.value)} /></div>
            <div className="field"><label>Días prom. para permisos</label><input type="number" placeholder="Ej. 14" value={form.permit_days} onChange={e => updateField('permit_days', e.target.value)} /></div>
          </div>

          <div className="divider"></div>
          <div className="section-title" style={{ marginBottom: '12px' }}>Preguntas de evaluación</div>
          <div className="check-row"><input type="checkbox" checked={form.does_new_construction} onChange={e => updateField('does_new_construction', e.target.checked)} /><span>¿Hace nuevas construcciones?</span></div>
          <div className="check-row"><input type="checkbox" checked={form.has_license} onChange={e => updateField('has_license', e.target.checked)} /><span>¿Tiene licencia vigente?</span></div>
          <div className="check-row"><input type="checkbox" checked={form.has_insurance} onChange={e => updateField('has_insurance', e.target.checked)} /><span>¿Tiene seguro en el área?</span></div>
          <div className="check-row"><input type="checkbox" checked={form.has_own_team} onChange={e => updateField('has_own_team', e.target.checked)} /><span>¿Tiene equipo propio (no subcontrata)?</span></div>

          <div className="field" style={{ marginTop: '12px' }}><label>Notas adicionales</label><textarea rows="2" placeholder="Observaciones, referencias..." value={form.notes} onChange={e => updateField('notes', e.target.value)}></textarea></div>
          <div className="btn-group"><button type="submit" className="btn btn-primary">Guardar contratista</button></div>
        </form>
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: '16px' }}>Contratistas registrados</div>
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Nombre</th><th>Especialidad</th><th>Ciudad</th><th>Licencia</th><th>Seguro</th><th>Equipo propio</th><th>Proyectos</th><th>Completado</th><th>Acciones</th></tr></thead>
            <tbody>
              {contractors.map(con => (
                <tr key={con.id}>
                  <td style={{ cursor: 'pointer' }} onClick={() => openDetail(con)}>{con.name}{con.company && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{con.company}</div>}</td>
                  <td><span className="tag">{con.specialty}</span></td>
                  <td>{con.city}{con.state ? `, ${con.state}` : ''}</td>
                  <td><span className={`badge ${con.has_license ? 'badge-green' : 'badge-amber'}`}>{con.has_license ? 'Sí' : 'No'}</span></td>
                  <td><span className={`badge ${con.has_insurance ? 'badge-green' : 'badge-amber'}`}>{con.has_insurance ? 'Sí' : 'No'}</span></td>
                  <td><span className={`badge ${con.has_own_team ? 'badge-green' : 'badge-amber'}`}>{con.has_own_team ? 'Propio' : 'Sub'}</span></td>
                  <td>{con.max_simultaneous_projects || '—'}</td>
                  <td><div className="completion-bar"><div className="completion-track"><div className={`completion-fill ${completionClass(getCompletion(con, CONTRACTOR_FIELDS))}`} style={{ width: `${getCompletion(con, CONTRACTOR_FIELDS)}%` }}></div></div><span className={`completion-text ${completionClass(getCompletion(con, CONTRACTOR_FIELDS))}`}>{getCompletion(con, CONTRACTOR_FIELDS)}%</span></div></td>
                  <td><div className="actions-cell"><button className="btn btn-sm" onClick={() => openDetail(con)}>Ver</button><button className="btn btn-sm btn-danger" onClick={() => handleDelete(con.id)}>Eliminar</button></div></td>
                </tr>
              ))}
              {contractors.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Sin contratistas registrados</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setSelected(null); setEditMode(false); } }}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editMode ? 'Editar contratista' : 'Información del contratista'}</h2>
              <button className="modal-close" onClick={() => { setSelected(null); setEditMode(false); }}>✕</button>
            </div>
            {!editMode ? (
              <>
                <div className="modal-body">
                  <div className="detail-row"><span className="detail-label">Nombre</span><span className="detail-value">{selected.name}</span></div>
                  <div className="detail-row"><span className="detail-label">Compañía</span><span className="detail-value">{selected.company || '—'}</span></div>
                  <div className="detail-row"><span className="detail-label">Teléfono</span><span className="detail-value">{selected.phone || '—'}</span></div>
                  <div className="detail-row"><span className="detail-label">Email</span><span className="detail-value">{selected.email || '—'}</span></div>
                  <div className="detail-row"><span className="detail-label">Especialidad</span><span className="detail-value"><span className="tag">{selected.specialty}</span></span></div>
                  <div className="detail-row"><span className="detail-label">Área de trabajo</span><span className="detail-value">{selected.work_area || '—'}</span></div>
                  <div className="detail-row"><span className="detail-label">Ciudad</span><span className="detail-value">{selected.city}{selected.state ? `, ${selected.state}` : ''}</span></div>
                  <div style={{ margin: '16px 0 8px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Evaluación</div>
                  <div className="detail-row"><span className="detail-label">Proyectos simultáneos</span><span className="detail-value">{selected.max_simultaneous_projects || '—'}</span></div>
                  <div className="detail-row"><span className="detail-label">Días para permisos</span><span className="detail-value">{selected.permit_days || '—'}</span></div>
                  <div className="detail-row"><span className="detail-label">Nuevas construcciones</span><span className="detail-value"><span className={`badge ${selected.does_new_construction ? 'badge-green' : 'badge-amber'}`}>{selected.does_new_construction ? 'Sí' : 'No'}</span></span></div>
                  <div className="detail-row"><span className="detail-label">Licencia</span><span className="detail-value"><span className={`badge ${selected.has_license ? 'badge-green' : 'badge-amber'}`}>{selected.has_license ? 'Sí' : 'No'}</span></span></div>
                  <div className="detail-row"><span className="detail-label">Seguro</span><span className="detail-value"><span className={`badge ${selected.has_insurance ? 'badge-green' : 'badge-amber'}`}>{selected.has_insurance ? 'Sí' : 'No'}</span></span></div>
                  <div className="detail-row"><span className="detail-label">Equipo propio</span><span className="detail-value"><span className={`badge ${selected.has_own_team ? 'badge-green' : 'badge-amber'}`}>{selected.has_own_team ? 'Propio' : 'Subcontrata'}</span></span></div>
                  {selected.notes && <div className="detail-row"><span className="detail-label">Notas</span><span className="detail-value">{selected.notes}</span></div>}
                </div>
                <div className="modal-footer">
                  <button className="btn" onClick={() => { setSelected(null); setEditMode(false); }}>Cerrar</button>
                  <button className="btn btn-primary" onClick={startEdit}>Editar</button>
                </div>
              </>
            ) : (
              <form onSubmit={handleUpdate}>
                <div className="modal-body">
                  <div className="grid-2">
                    <div className="field"><label>Nombre</label><input type="text" value={editForm.name || ''} onChange={e => updateEditField('name', e.target.value)} required /></div>
                    <div className="field"><label>Compañía</label><input type="text" value={editForm.company || ''} onChange={e => updateEditField('company', e.target.value)} /></div>
                    <div className="field"><label>Teléfono</label><input type="text" value={editForm.phone || ''} onChange={e => updateEditField('phone', e.target.value)} /></div>
                    <div className="field"><label>Email</label><input type="email" value={editForm.email || ''} onChange={e => updateEditField('email', e.target.value)} /></div>
                    <div className="field"><label>Especialidad</label><select value={editForm.specialty || ''} onChange={e => updateEditField('specialty', e.target.value)}>{SPECIALTIES.map(s => <option key={s}>{s}</option>)}</select></div>
                    <div className="field"><label>Área de trabajo</label><input type="text" value={editForm.work_area || ''} onChange={e => updateEditField('work_area', e.target.value)} /></div>
                    <div className="field"><label>Estado</label><select value={editForm.state || ''} onChange={e => updateEditField('state', e.target.value)}><option value="">--</option>{STATES.map(s => <option key={s}>{s}</option>)}</select></div>
                    <div className="field"><label>Ciudad</label><input type="text" value={editForm.city || ''} onChange={e => updateEditField('city', e.target.value)} /></div>
                    <div className="field"><label>Proyectos simultáneos</label><input type="number" value={editForm.max_simultaneous_projects || ''} onChange={e => updateEditField('max_simultaneous_projects', e.target.value)} /></div>
                    <div className="field"><label>Días para permisos</label><input type="number" value={editForm.permit_days || ''} onChange={e => updateEditField('permit_days', e.target.value)} /></div>
                  </div>
                  <div className="divider"></div>
                  <div className="check-row"><input type="checkbox" checked={editForm.does_new_construction || false} onChange={e => updateEditField('does_new_construction', e.target.checked)} /><span>¿Hace nuevas construcciones?</span></div>
                  <div className="check-row"><input type="checkbox" checked={editForm.has_license || false} onChange={e => updateEditField('has_license', e.target.checked)} /><span>¿Tiene licencia vigente?</span></div>
                  <div className="check-row"><input type="checkbox" checked={editForm.has_insurance || false} onChange={e => updateEditField('has_insurance', e.target.checked)} /><span>¿Tiene seguro en el área?</span></div>
                  <div className="check-row"><input type="checkbox" checked={editForm.has_own_team || false} onChange={e => updateEditField('has_own_team', e.target.checked)} /><span>¿Tiene equipo propio?</span></div>
                  <div className="field" style={{ marginTop: '12px' }}><label>Notas</label><textarea rows="2" value={editForm.notes || ''} onChange={e => updateEditField('notes', e.target.value)}></textarea></div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn" onClick={() => setEditMode(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Guardar cambios</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
