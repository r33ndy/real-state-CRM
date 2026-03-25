'use client';
import { useEffect, useState } from 'react';
import { useViewAsUser, buildApiUrl } from '@/lib/useViewAsUser';
import ProgressSummary from '@/components/ProgressSummary';
import { US_STATES as STATES } from '@/lib/constants';

const AGENT_TYPES = ['Listing Agent', 'Buyer Agent', 'Investor Agent'];
const AGENT_FIELDS = ['name', 'phone', 'email', 'state', 'city', 'agent_type', 'notes'];

function getCompletion(record, fields) {
  const filled = fields.filter(f => record[f] !== null && record[f] !== undefined && record[f] !== '').length;
  return Math.round((filled / fields.length) * 100);
}
function completionClass(pct) { return pct >= 80 ? 'high' : pct >= 50 ? 'mid' : 'low'; }

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [selected, setSelected] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const viewAsUserId = useViewAsUser();
  const [filterType, setFilterType] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', state: '', city: '', agent_type: 'Listing Agent', notes: '' });

  useEffect(() => { fetch('/api/auth/me').then(r => r.json()).then(data => setUser(data.user)); }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(buildApiUrl('/api/agents', user.role, viewAsUserId)).then(r => r.json()).then(data => { setAgents(data.agents || []); setLoading(false); });
  }, [user, viewAsUserId]);

  function updateField(key, value) { setForm(prev => ({ ...prev, [key]: value })); }
  function updateEditField(key, value) { setEditForm(prev => ({ ...prev, [key]: value })); }

  async function handleSave(e) {
    e.preventDefault(); setMessage(null);
    const payload = { ...form };
    if (viewAsUserId) payload.created_for = viewAsUserId;
    const res = await fetch('/api/agents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) { setMessage({ type: 'error', text: data.error }); return; }
    setMessage({ type: 'success', text: `Agente "${data.agent.name}" registrado exitosamente` });
    setAgents(prev => [data.agent, ...prev]);
    setForm({ name: '', phone: '', email: '', state: '', city: '', agent_type: 'Listing Agent', notes: '' });
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este agente?')) return;
    await fetch(`/api/agents/${id}`, { method: 'DELETE' });
    setAgents(prev => prev.filter(a => a.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  function openDetail(agent) { setSelected(agent); setEditMode(false); setEditForm({ ...agent }); }
  function startEdit() { setEditMode(true); setEditForm({ ...selected }); }

  async function handleUpdate(e) {
    e.preventDefault();
    const res = await fetch(`/api/agents/${selected.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) });
    if (!res.ok) { const data = await res.json(); setMessage({ type: 'error', text: data.error }); return; }
    setAgents(prev => prev.map(a => a.id === selected.id ? { ...a, ...editForm } : a));
    setSelected({ ...selected, ...editForm }); setEditMode(false);
    setMessage({ type: 'success', text: 'Agente actualizado exitosamente' });
  }

  function getTypeBadge(type) {
    if (type === 'Listing Agent') return 'badge-green';
    if (type === 'Buyer Agent') return 'badge-amber';
    return 'badge-blue';
  }

  if (!user || loading) return <div className="empty-state"><div className="spinner" style={{ width: 24, height: 24, margin: '0 auto' }}></div></div>;
  const isViewingOther = user.role === 'admin' && viewAsUserId;

  const filteredAgents = filterType ? agents.filter(a => a.agent_type === filterType) : agents;

  return (
    <>
      <div className="page-header"><div><div className="page-title">Agents</div><div className="page-subtitle">Directorio de agentes inmobiliarios</div></div>{isViewingOther && <ProgressSummary records={agents} fields={AGENT_FIELDS} label="Progreso agents" />}</div>

      {isViewingOther && (<div className="alert alert-info" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: 'var(--accent-amber)' }}>🔍 Viendo datos del usuario seleccionado.</div>)}
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="card">
        <div className="card-title" style={{ marginBottom: '16px' }}>Agregar agente</div>
        <form onSubmit={handleSave}>
          <div className="grid-2">
            <div className="field"><label>Nombre Completo</label><input type="text" placeholder="Nombre del agente" value={form.name} onChange={e => updateField('name', e.target.value)} required /></div>
            <div className="field"><label>Teléfono</label><input type="text" placeholder="+1 (000) 000-0000" value={form.phone} onChange={e => updateField('phone', e.target.value)} /></div>
            <div className="field"><label>Correo</label><input type="email" placeholder="correo@ejemplo.com" value={form.email} onChange={e => updateField('email', e.target.value)} /></div>
            <div className="field"><label>Tipo de Agente</label><select value={form.agent_type} onChange={e => updateField('agent_type', e.target.value)}>{AGENT_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
            <div className="field"><label>Estado</label><select value={form.state} onChange={e => updateField('state', e.target.value)}><option value="">-- Seleccionar --</option>{STATES.map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="field"><label>Ciudad</label><input type="text" placeholder="Ej. Miami" value={form.city} onChange={e => updateField('city', e.target.value)} /></div>
          </div>
          <div className="field"><label>Notas</label><textarea rows="2" placeholder="Experiencia, referencias..." value={form.notes} onChange={e => updateField('notes', e.target.value)}></textarea></div>
          <div className="btn-group"><button type="submit" className="btn btn-primary">Guardar agente</button></div>
        </form>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div className="card-title">Agentes registrados</div>
          <div className="field" style={{ margin: 0, minWidth: '160px' }}>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ fontSize: '12px', padding: '6px 8px' }}>
              <option value="">Todos los tipos</option>
              {AGENT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="table-container"><table className="table">
          <thead><tr><th>Nombre</th><th>Tipo</th><th>Ciudad</th><th>Teléfono</th><th>Email</th><th>Completado</th><th>Acciones</th></tr></thead>
          <tbody>
            {filteredAgents.map(agent => (
              <tr key={agent.id}>
                <td style={{ cursor: 'pointer' }} onClick={() => openDetail(agent)}>{agent.name}</td>
                <td><span className={`badge ${getTypeBadge(agent.agent_type)}`}>{agent.agent_type}</span></td>
                <td>{agent.city}{agent.state ? `, ${agent.state}` : ''}</td>
                <td>{agent.phone || '—'}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{agent.email || '—'}</td>
                <td><div className="completion-bar"><div className="completion-track"><div className={`completion-fill ${completionClass(getCompletion(agent, AGENT_FIELDS))}`} style={{ width: `${getCompletion(agent, AGENT_FIELDS)}%` }}></div></div><span className={`completion-text ${completionClass(getCompletion(agent, AGENT_FIELDS))}`}>{getCompletion(agent, AGENT_FIELDS)}%</span></div></td>
                <td><div className="actions-cell"><button className="btn btn-sm" onClick={() => openDetail(agent)}>Ver</button><button className="btn btn-sm btn-danger" onClick={() => handleDelete(agent.id)}>Eliminar</button></div></td>
              </tr>
            ))}
            {filteredAgents.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Sin agentes registrados</td></tr>}
          </tbody>
        </table></div>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setSelected(null); setEditMode(false); } }}>
          <div className="modal">
            <div className="modal-header"><h2>{editMode ? 'Editar agente' : 'Información del agente'}</h2><button className="modal-close" onClick={() => { setSelected(null); setEditMode(false); }}>✕</button></div>
            {!editMode ? (
              <>
                <div className="modal-body">
                  <div className="detail-row"><span className="detail-label">Nombre</span><span className="detail-value">{selected.name}</span></div>
                  <div className="detail-row"><span className="detail-label">Tipo</span><span className="detail-value"><span className={`badge ${getTypeBadge(selected.agent_type)}`}>{selected.agent_type}</span></span></div>
                  <div className="detail-row"><span className="detail-label">Teléfono</span><span className="detail-value">{selected.phone || '—'}</span></div>
                  <div className="detail-row"><span className="detail-label">Correo</span><span className="detail-value">{selected.email || '—'}</span></div>
                  <div className="detail-row"><span className="detail-label">Estado</span><span className="detail-value">{selected.state || '—'}</span></div>
                  <div className="detail-row"><span className="detail-label">Ciudad</span><span className="detail-value">{selected.city || '—'}</span></div>
                  {selected.notes && <div className="detail-row"><span className="detail-label">Notas</span><span className="detail-value">{selected.notes}</span></div>}
                </div>
                <div className="modal-footer"><button className="btn" onClick={() => { setSelected(null); setEditMode(false); }}>Cerrar</button><button className="btn btn-primary" onClick={startEdit}>Editar</button></div>
              </>
            ) : (
              <form onSubmit={handleUpdate}><div className="modal-body"><div className="grid-2">
                <div className="field"><label>Nombre</label><input type="text" value={editForm.name || ''} onChange={e => updateEditField('name', e.target.value)} required /></div>
                <div className="field"><label>Tipo de Agente</label><select value={editForm.agent_type || ''} onChange={e => updateEditField('agent_type', e.target.value)}>{AGENT_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                <div className="field"><label>Teléfono</label><input type="text" value={editForm.phone || ''} onChange={e => updateEditField('phone', e.target.value)} /></div>
                <div className="field"><label>Correo</label><input type="email" value={editForm.email || ''} onChange={e => updateEditField('email', e.target.value)} /></div>
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
