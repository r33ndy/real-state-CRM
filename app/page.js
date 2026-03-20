'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('admin@edwinllc.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleRoleChange(r) {
    setRole(r);
    setEmail(r === 'admin' ? 'admin@edwinllc.com' : 'carlos@edwinllc.com');
    setError('');
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesión');
        setLoading(false);
        return;
      }
      router.push('/dashboard');
    } catch (err) {
      setError('Error de conexión');
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleLogin}>
        <div className="login-logo">
          <img src="/logo.png" alt="EC ADINO REALTY LLC" style={{ width: 64, height: 64, borderRadius: '12px', marginBottom: '12px' }} />
          <h1>EC ADINO REALTY LLC</h1>
          <p>Sistema de bienes raíces e inversiones</p>
        </div>

        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px', display: 'block' }}>
          Tipo de acceso
        </label>
        <div className="role-selector">
          <button
            type="button"
            className={`role-btn ${role === 'admin' ? 'selected' : ''}`}
            onClick={() => handleRoleChange('admin')}
          >
            ⚙️ Administrador
          </button>
          <button
            type="button"
            className={`role-btn ${role === 'emp' ? 'selected' : ''}`}
            onClick={() => handleRoleChange('emp')}
          >
            👤 Usuario
          </button>
        </div>

        <div className="field">
          <label>Correo electrónico</label>
          <input
            type="email"
            id="login-email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="correo@edwinllc.com"
            required
          />
        </div>
        <div className="field">
          <label>Contraseña</label>
          <input
            type="password"
            id="login-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="access-note">
          {role === 'admin'
            ? 'Acceso completo al sistema incluyendo gestión de usuarios y panel administrativo.'
            : 'Acceso para registrar mercado, profesionales, contratistas e inversionistas. Solo verás los datos que tú registres.'}
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={loading}
          style={{ marginTop: '20px', padding: '12px' }}
        >
          {loading ? <span className="spinner"></span> : 'Entrar al sistema'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          Al iniciar sesión aceptas nuestros{' '}
          <a href="/terminos" target="_blank" style={{ color: 'var(--accent-primary-light)', textDecoration: 'none' }}>Términos de servicio</a>
          {' '}y{' '}
          <a href="/privacidad" target="_blank" style={{ color: 'var(--accent-primary-light)', textDecoration: 'none' }}>Política de privacidad</a>.
        </div>
      </form>
      <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '11px', color: 'var(--text-muted)' }}>
        © {new Date().getFullYear()} EC ADINO REALTY LLC. Todos los derechos reservados.
      </div>
    </div>
  );
}
