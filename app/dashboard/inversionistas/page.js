'use client';
import { useEffect, useState } from 'react';
import { useViewAsUser, buildApiUrl } from '@/lib/useViewAsUser';

const STRATEGIES = ['Fix and Flip', 'Wholesale', 'Renta', 'Mixto'];
const PAYMENT_METHODS = ['Hard Money', 'Cash', 'Financiamiento', 'Mixto'];
import { US_STATES as STATES } from '@/lib/constants';
const INVESTOR_FIELDS = ['name', 'email', 'phone', 'investment_area', 'property_type', 'strategy', 'budget', 'payment_method', 'closing_time', 'max_simultaneous_projects', 'city', 'state', 'notes'];
function getCompletion(record, fields) {
  const filled = fields.filter(f => record[f] !== null && record[f] !== undefined && record[f] !== '').length;
  return Math.round((filled / fields.length) * 100);
}
function completionClass(pct) { return pct >= 80 ? 'high' : pct >= 50 ? 'mid' : 'low'; }

export default function InversionistasPage() {
  const [investors, setInvestors] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [selected, setSelected] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const viewAsUserId = useViewAsUser();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', investment_area: '',
    property_type: '', strategy: 'Fix and Flip', budget: '',
    payment_method: 'Cash', closing_time: '',
    max_simultaneous_projects: '', city: '', state: '', notes: ''
  });

  useEffect(() => { fetch('/api/auth/me').then(r => r.json()).then(data => setUser(data.user)); }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(buildApiUrl('/api/investors', user.role, viewAsUserId))
      .then(r => r.json())
      .then(data => { setInvestors(data.investors || []); setLoading(false); });
  }, [user, viewAsUserId]);

  function updateField(key, value) { setForm(prev => ({ ...prev, [key]: value })); }
  function updateEditField(key, value) { setEditForm(prev => ({ ...prev, [key]: value })); }

  async function handleSave(e) {
    e.preventDefault();
    setMessage(null);
    const res = await fetch('/api/investors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setMessage({ type: 'error', text: data.error }); return; }
    setMessage({ type: 'success', text: `Inversionista "${data.investor.name}" registrado exitosamente` });
    if (!viewAsUserId) setInvestors(prev => [data.investor, ...prev]);
    setForm({ name: '', email: '', phone: '', investment_area: '', property_type: '', strategy: 'Fix and Flip', budget: '', payment_method: 'Cash', closing_time: '', max_simultaneous_projects: '', city: '', state: '', notes: '' });
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este inversionista?')) return;
    await fetch(`/api/investors/${id}`, { method: 'DELETE' });
    setInvestors(prev => prev.filter(i => i.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  function openDetail(inv) { setSelected(inv); setEditMode(false); setEditForm({ ...inv }); }
  function startEdit() { setEditMode(true); setEditForm({ ...selected }); }

  async function handleUpdate(e) {
    e.preventDefault();
    const res = await fetch(`/api/investors/${selected.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    if (!res.ok) { const data = await res.json(); setMessage({ type: 'error', text: data.error }); return; }
    setInvestors(prev => prev.map(i => i.id === selected.id ? { ...i, ...editForm } : i));
    setSelected({ ...selected, ...editForm });
    setEditMode(false);
    setMessage({ type: 'success', text: 'Inversionista actualizado exitosamente' });
  }

  if (!user || loading) return <div className="empty-state"><div className="spinner" style={{ width: 24, height: 24, margin: '0 auto' }}></div></div>;
  const isViewingOther = user.role === 'admin' && viewAsUserId;

  return (
    <>
      <div className="page-header">
        <div className="page-title">Directorio de inversionistas</div>
        <div className="page-subtitle">Registro de inversionistas, estrategia y capacidad</div>
      </div>

      {isViewingOther && (<div className="alert alert-info" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: 'var(--accent-amber)' }}>🔍 Viendo datos del usuario seleccionado.</div>)}
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="card">
        <div className="card-title" style={{ marginBottom: '16px' }}>Registrar inversionista</div>
        <form onSubmit={handleSave}>
          <div className="grid-2">
            <div className="field">
              <label>Nombre completo</label>
              <input type="text" placeholder="Nombre del inversionista" value={form.name} onChange={e => updateField('name', e.target.value)} required />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" placeholder="correo@ejemplo.com" value={form.email} onChange={e => updateField('email', e.target.value)} />
            </div>
            <div className="field">
              <label>Número de teléfono</label>
              <input type="text" placeholder="+1 (000) 000-0000" value={form.phone} onChange={e => updateField('phone', e.target.value)} />
            </div>
            <div className="field">
              <label>¿En qué área invierte?</label>
              <input type="text" placeholder="Ej. Residencial, Comercial, Terrenos" value={form.investment_area} onChange={e => updateField('investment_area', e.target.value)} />
            </div>
            <div className="field">
              <label>¿Qué tipo de propiedades busca?</label>
              <input type="text" placeholder="Ej. Single Family, Multi-Family, Condos" value={form.property_type} onChange={e => updateField('property_type', e.target.value)} />
            </div>
            <div className="field">
              <label>Estrategia que usa</label>
              <select value={form.strategy} onChange={e => updateField('strategy', e.target.value)}>
                {STRATEGIES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Presupuesto</label>
              <input type="text" placeholder="Ej. $100,000 - $500,000" value={form.budget} onChange={e => updateField('budget', e.target.value)} />
            </div>
            <div className="field">
              <label>¿Compra con Hard Money o Cash?</label>
              <select value={form.payment_method} onChange={e => updateField('payment_method', e.target.value)}>
                {PAYMENT_METHODS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="field">
              <label>¿Qué tiempo puede cerrar?</label>
              <input type="text" placeholder="Ej. 14 días, 30 días" value={form.closing_time} onChange={e => updateField('closing_time', e.target.value)} />
            </div>
            <div className="field">
              <label>¿Cuántos proyectos puede comprar a la vez?</label>
              <input type="number" placeholder="Ej. 3" value={form.max_simultaneous_projects} onChange={e => updateField('max_simultaneous_projects', e.target.value)} />
            </div>
            <div className="field">
              <label>Estado</label>
              <select value={form.state} onChange={e => updateField('state', e.target.value)}>
                <option value="">-- Seleccionar --</option>
                {STATES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Ciudad</label>
              <input type="text" placeholder="Ej. Miami" value={form.city} onChange={e => updateField('city', e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>Notas adicionales</label>
            <textarea rows="2" placeholder="Observaciones, referencias..." value={form.notes} onChange={e => updateField('notes', e.target.value)}></textarea>
          </div>
          <div className="btn-group">
            <button type="submit" className="btn btn-primary">Guardar inversionista</button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: '16px' }}>Inversionistas registrados</div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Estrategia</th>
                <th>Presupuesto</th>
                <th>Forma de pago</th>
                <th>Cierre</th>
                <th>Proyectos</th>
                <th>Completado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {investors.map(inv => (
                <tr key={inv.id}>
                  <td style={{ cursor: 'pointer' }} onClick={() => openDetail(inv)}>
                    {inv.name}
                    {inv.email && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{inv.email}</div>}
                  </td>
                  <td><span className="tag">{inv.strategy}</span></td>
                  <td>{inv.budget || '—'}</td>
                  <td><span className={`badge ${inv.payment_method === 'Cash' ? 'badge-green' : 'badge-amber'}`}>{inv.payment_method}</span></td>
                  <td>{inv.closing_time || '—'}</td>
                  <td>{inv.max_simultaneous_projects || '—'}</td>
                  <td><div className="completion-bar"><div className="completion-track"><div className={`completion-fill ${completionClass(getCompletion(inv, INVESTOR_FIELDS))}`} style={{ width: `${getCompletion(inv, INVESTOR_FIELDS)}%` }}></div></div><span className={`completion-text ${completionClass(getCompletion(inv, INVESTOR_FIELDS))}`}>{getCompletion(inv, INVESTOR_FIELDS)}%</span></div></td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn btn-sm" onClick={() => openDetail(inv)}>Ver</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(inv.id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {investors.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Sin inversionistas registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail / Edit Modal */}
      {selected && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setSelected(null); setEditMode(false); } }}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editMode ? 'Editar inversionista' : 'Información del inversionista'}</h2>
              <button className="modal-close" onClick={() => { setSelected(null); setEditMode(false); }}>✕</button>
            </div>

            {!editMode ? (
              <>
                <div className="modal-body">
                  <div className="detail-row"><span className="detail-label">Nombre</span><span className="detail-value">{selected.name}</span></div>
                  <div className="detail-row"><span className="detail-label">Email</span><span className="detail-value">{selected.email || '—'}</span></div>
                  <div className="detail-row"><span className="detail-label">Teléfono</span><span className="detail-value">{selected.phone || '—'}</span></div>
                  <div className="detail-row"><span className="detail-label">Área de inversión</span><span className="detail-value">{selected.investment_area || '—'}</span></div>
                  <div className="detail-row"><span className="detail-label">Tipo de propiedades</span><span className="detail-value">{selected.property_type || '—'}</span></div>
                  <div className="detail-row"><span className="detail-label">Estrategia</span><span className="detail-value"><span className="tag">{selected.strategy}</span></span></div>
                  <div className="detail-row"><span className="detail-label">Presupuesto</span><span className="detail-value">{selected.budget || '—'}</span></div>
                  <div className="detail-row"><span className="detail-label">Forma de pago</span><span className="detail-value"><span className={`badge ${selected.payment_method === 'Cash' ? 'badge-green' : 'badge-amber'}`}>{selected.payment_method}</span></span></div>
                  <div className="detail-row"><span className="detail-label">Tiempo de cierre</span><span className="detail-value">{selected.closing_time || '—'}</span></div>
                  <div className="detail-row"><span className="detail-label">Proyectos simultáneos</span><span className="detail-value">{selected.max_simultaneous_projects || '—'}</span></div>
                  <div className="detail-row"><span className="detail-label">Ciudad</span><span className="detail-value">{selected.city}{selected.state ? `, ${selected.state}` : ''}</span></div>
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
                    <div className="field"><label>Email</label><input type="email" value={editForm.email || ''} onChange={e => updateEditField('email', e.target.value)} /></div>
                    <div className="field"><label>Teléfono</label><input type="text" value={editForm.phone || ''} onChange={e => updateEditField('phone', e.target.value)} /></div>
                    <div className="field"><label>Área de inversión</label><input type="text" value={editForm.investment_area || ''} onChange={e => updateEditField('investment_area', e.target.value)} /></div>
                    <div className="field"><label>Tipo de propiedades</label><input type="text" value={editForm.property_type || ''} onChange={e => updateEditField('property_type', e.target.value)} /></div>
                    <div className="field"><label>Estrategia</label><select value={editForm.strategy || ''} onChange={e => updateEditField('strategy', e.target.value)}>{STRATEGIES.map(s => <option key={s}>{s}</option>)}</select></div>
                    <div className="field"><label>Presupuesto</label><input type="text" value={editForm.budget || ''} onChange={e => updateEditField('budget', e.target.value)} /></div>
                    <div className="field"><label>Forma de pago</label><select value={editForm.payment_method || ''} onChange={e => updateEditField('payment_method', e.target.value)}>{PAYMENT_METHODS.map(p => <option key={p}>{p}</option>)}</select></div>
                    <div className="field"><label>Tiempo de cierre</label><input type="text" value={editForm.closing_time || ''} onChange={e => updateEditField('closing_time', e.target.value)} /></div>
                    <div className="field"><label>Proyectos simultáneos</label><input type="number" value={editForm.max_simultaneous_projects || ''} onChange={e => updateEditField('max_simultaneous_projects', e.target.value)} /></div>
                  </div>
                  <div className="field"><label>Notas</label><textarea rows="2" value={editForm.notes || ''} onChange={e => updateEditField('notes', e.target.value)}></textarea></div>
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
