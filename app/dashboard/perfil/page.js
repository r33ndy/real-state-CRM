'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [passForm, setPassForm] = useState({ current_password: '', new_password: '', confirm_password: '' });

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (data.error) { router.push('/'); return; }
      setUser(data.user);
      setForm({ name: data.user.name || '', phone: data.user.phone || '' });
      setLoading(false);
    });
  }, [router]);

  async function handleUpdateProfile(e) {
    e.preventDefault();
    setSaving(true); setMessage(null);
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, phone: form.phone }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setMessage({ type: 'error', text: data.error }); return; }
    setMessage({ type: 'success', text: 'Datos actualizados exitosamente' });
    setUser(prev => ({ ...prev, name: form.name, phone: form.phone }));
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setMessage(null);
    if (passForm.new_password !== passForm.confirm_password) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }
    if (passForm.new_password.length < 6) {
      setMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres' });
      return;
    }
    setSaving(true);
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        current_password: passForm.current_password,
        new_password: passForm.new_password,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setMessage({ type: 'error', text: data.error }); return; }
    setMessage({ type: 'success', text: 'Contraseña actualizada exitosamente' });
    setPassForm({ current_password: '', new_password: '', confirm_password: '' });
  }

  if (loading) return <div className="empty-state"><div className="spinner" style={{ width: 24, height: 24, margin: '0 auto' }}></div></div>;

  return (
    <>
      <div className="page-header">
        <div className="page-title">Mi perfil</div>
        <div className="page-subtitle">Actualizar datos personales y contraseña</div>
      </div>

      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="grid-2">
        <div className="card">
          <div className="card-title" style={{ marginBottom: '16px' }}>📋 Datos personales</div>
          <form onSubmit={handleUpdateProfile}>
            <div className="field">
              <label>Correo electrónico</label>
              <input type="email" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>El correo no se puede cambiar</div>
            </div>
            <div className="field">
              <label>Nombre completo</label>
              <input type="text" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} required />
            </div>
            <div className="field">
              <label>Teléfono</label>
              <input type="text" placeholder="+1 (000) 000-0000" value={form.phone} onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))} />
            </div>
            <div className="field">
              <label>Rol</label>
              <input type="text" value={user?.role === 'admin' ? 'Administrador' : 'Usuario'} disabled style={{ opacity: 0.6 }} />
            </div>
            <div className="btn-group">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: '16px' }}>🔒 Cambiar contraseña</div>
          <form onSubmit={handleChangePassword}>
            <div className="field">
              <label>Contraseña actual</label>
              <input type="password" placeholder="Tu contraseña actual" value={passForm.current_password} onChange={e => setPassForm(prev => ({ ...prev, current_password: e.target.value }))} required />
            </div>
            <div className="field">
              <label>Nueva contraseña</label>
              <input type="password" placeholder="Mín. 6 caracteres" value={passForm.new_password} onChange={e => setPassForm(prev => ({ ...prev, new_password: e.target.value }))} required minLength={6} />
            </div>
            <div className="field">
              <label>Confirmar nueva contraseña</label>
              <input type="password" placeholder="Repite la nueva contraseña" value={passForm.confirm_password} onChange={e => setPassForm(prev => ({ ...prev, confirm_password: e.target.value }))} required minLength={6} />
            </div>
            <div className="btn-group">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Guardando...' : 'Cambiar contraseña'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
