'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EmpleadosPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', new_password: '' });
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const res = await fetch('/api/users');
    const data = await res.json();
    if (data.error && res.status === 403) {
      router.push('/dashboard/mercado');
      return;
    }
    setUsers(data.users || []);
    setLoading(false);
  }

  function updateField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setMessage(null);
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage({ type: 'error', text: data.error });
      return;
    }
    setMessage({ type: 'success', text: `Usuario "${data.user.name}" creado exitosamente` });
    setForm({ name: '', email: '', password: '', phone: '' });
    loadUsers();
  }

  async function toggleStatus(user) {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    await fetch(`/api/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    loadUsers();
  }

  async function deleteUser(user) {
    if (!confirm(`¿Eliminar a ${user.name}?`)) return;
    await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
    loadUsers();
  }

  function openEditUser(u) {
    setEditingUser(u);
    setEditForm({ name: u.name, phone: u.phone || '', new_password: '' });
  }

  async function handleEditUser(e) {
    e.preventDefault();
    setMessage(null);
    const body = { name: editForm.name, phone: editForm.phone };
    if (editForm.new_password) body.new_password = editForm.new_password;
    const res = await fetch(`/api/users/${editingUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) { setMessage({ type: 'error', text: data.error }); return; }
    setMessage({ type: 'success', text: editForm.new_password ? `Datos y contraseña de "${editForm.name}" actualizados` : `Datos de "${editForm.name}" actualizados` });
    setEditingUser(null);
    loadUsers();
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">Gestión de usuarios</div>
        <div className="page-subtitle">Solo visible para administradores</div>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <div className="card">
        <div className="card-title" style={{ marginBottom: '16px' }}>Crear nuevo usuario</div>
        <form onSubmit={handleCreate}>
          <div className="grid-2">
            <div className="field">
              <label>Nombre completo</label>
              <input type="text" placeholder="Nombre del usuario" value={form.name} onChange={e => updateField('name', e.target.value)} required />
            </div>
            <div className="field">
              <label>Correo electrónico</label>
              <input type="email" placeholder="correo@edwinllc.com" value={form.email} onChange={e => updateField('email', e.target.value)} required />
            </div>
            <div className="field">
              <label>Contraseña temporal</label>
              <input type="password" placeholder="Mín. 6 caracteres" value={form.password} onChange={e => updateField('password', e.target.value)} required minLength={6} />
            </div>
            <div className="field">
              <label>Teléfono</label>
              <input type="text" placeholder="+1 (000) 000-0000" value={form.phone} onChange={e => updateField('phone', e.target.value)} />
            </div>
          </div>

          <div className="divider"></div>
          <div className="section-title" style={{ marginBottom: '12px' }}>Permisos del usuario</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            El usuario puede registrar información en cualquier estado y ciudad, pero solo verá la información que él mismo registre.
          </div>
          <div className="check-row"><input type="checkbox" checked disabled /> <span>Evaluación de mercado</span></div>
          <div className="check-row"><input type="checkbox" checked disabled /> <span>Directorio de profesionales</span></div>
          <div className="check-row"><input type="checkbox" checked disabled /> <span>Directorio de contratistas</span></div>
          <div className="check-row"><input type="checkbox" checked disabled /> <span>Directorio de inversionistas</span></div>
          <div className="check-row"><input type="checkbox" disabled /> <span style={{ opacity: 0.5 }}>Dashboard administrativo (bloqueado)</span></div>
          <div className="check-row"><input type="checkbox" disabled /> <span style={{ opacity: 0.5 }}>Gestión de usuarios (bloqueado)</span></div>

          <div className="btn-group">
            <button type="submit" className="btn btn-primary">Crear usuario</button>
            <button type="button" className="btn" onClick={() => setForm({ name: '', email: '', password: '', phone: '' })}>Cancelar</button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: '16px' }}>Usuarios registrados</div>
        {loading ? (
          <div className="empty-state"><div className="spinner" style={{ width: 20, height: 20, margin: '0 auto' }}></div></div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Acceso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.filter(u => u.role === 'employee').map(u => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td>
                      <span className={`badge ${u.status === 'active' ? 'badge-green' : 'badge-amber'}`}>
                        {u.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn btn-sm" onClick={() => openEditUser(u)}>Editar</button>
                        <button className="btn btn-sm" onClick={() => toggleStatus(u)}>
                          {u.status === 'active' ? 'Desactivar' : 'Activar'}
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => deleteUser(u)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.filter(u => u.role === 'employee').length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Sin usuarios registrados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setEditingUser(null); }}>
          <div className="modal">
            <div className="modal-header">
              <h2>Editar usuario: {editingUser.name}</h2>
              <button className="modal-close" onClick={() => setEditingUser(null)}>✕</button>
            </div>
            <form onSubmit={handleEditUser}>
              <div className="modal-body">
                <div className="field">
                  <label>Correo electrónico</label>
                  <input type="email" value={editingUser.email} disabled style={{ opacity: 0.6 }} />
                </div>
                <div className="grid-2">
                  <div className="field">
                    <label>Nombre completo</label>
                    <input type="text" value={editForm.name} onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))} required />
                  </div>
                  <div className="field">
                    <label>Teléfono</label>
                    <input type="text" placeholder="+1 (000) 000-0000" value={editForm.phone} onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))} />
                  </div>
                </div>
                <div className="divider"></div>
                <div className="section-title" style={{ marginBottom: '8px' }}>🔒 Restablecer contraseña</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Dejar vacío si no deseas cambiar la contraseña.</div>
                <div className="field">
                  <label>Nueva contraseña</label>
                  <input type="password" placeholder="Mín. 6 caracteres (dejar vacío para no cambiar)" value={editForm.new_password} onChange={e => setEditForm(prev => ({ ...prev, new_password: e.target.value }))} minLength={editForm.new_password ? 6 : 0} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setEditingUser(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
