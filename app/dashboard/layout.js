'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [viewAsUserId, setViewAsUserId] = useState('');
  const [viewAsUserName, setViewAsUserName] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.error) { router.push('/'); return; }
        setUser(data.user);
        setLoading(false);

        // If admin, load employee list for the switcher
        if (data.user.role === 'admin') {
          fetch('/api/users').then(r => r.json()).then(d => {
            setEmployees((d.users || []).filter(u => u.role === 'employee'));
          });
          // Restore saved view-as selection
          const saved = localStorage.getItem('viewAsUserId');
          const savedName = localStorage.getItem('viewAsUserName');
          if (saved) { setViewAsUserId(saved); setViewAsUserName(savedName || ''); }
        }
      })
      .catch(() => router.push('/'));
  }, [router]);

  function handleViewAsChange(userId) {
    setViewAsUserId(userId);
    if (userId) {
      const emp = employees.find(e => String(e.id) === userId);
      const name = emp ? emp.name : '';
      setViewAsUserName(name);
      localStorage.setItem('viewAsUserId', userId);
      localStorage.setItem('viewAsUserName', name);
    } else {
      setViewAsUserName('');
      localStorage.removeItem('viewAsUserId');
      localStorage.removeItem('viewAsUserName');
    }
    // Force re-render of child pages by triggering a custom event
    window.dispatchEvent(new CustomEvent('viewAsChanged', { detail: { userId } }));
  }

  async function handleLogout() {
    localStorage.removeItem('viewAsUserId');
    localStorage.removeItem('viewAsUserName');
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <div className="spinner" style={{ width: 32, height: 32 }}></div>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

  const navItems = [];
  if (isAdmin) {
    navItems.push(
      { section: 'Administración' },
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard', color: '#7c5cfc', icon: '📊' },
      { id: 'empleados', label: 'Gestión usuarios', href: '/dashboard/empleados', color: '#10b981', icon: '👥' },
    );
  }
  navItems.push(
    { section: 'Mercado' },
    { id: 'mercado', label: 'Evaluación de mercado', href: '/dashboard/mercado', color: '#f59e0b', icon: '🏘️' },
    { section: 'Directorio' },
    { id: 'profesionales', label: 'Profesionales', href: '/dashboard/profesionales', color: '#3b82f6', icon: '👔' },
    { id: 'contratistas', label: 'Contratistas', href: '/dashboard/contratistas', color: '#ef4444', icon: '🔧' },
    { id: 'inversionistas', label: 'Inversionistas', href: '/dashboard/inversionistas', color: '#8b5cf6', icon: '💰' },
    { section: 'Cuenta' },
    { id: 'perfil', label: 'Mi perfil', href: '/dashboard/perfil', color: '#64748b', icon: '⚙️' },
  );

  return (
    <div className="app-layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">Edwin LLC</div>
          <div className="sidebar-user">{user?.name}</div>
          <div className={`sidebar-badge ${isAdmin ? 'badge-admin' : 'badge-employee'}`}>
            {isAdmin ? 'Administrador' : 'Usuario'}
          </div>
        </div>

        {/* Admin: View-as-user selector in sidebar */}
        {isAdmin && (
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-primary)' }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
              👁️ Ver como usuario
            </div>
            <select
              value={viewAsUserId}
              onChange={e => handleViewAsChange(e.target.value)}
              style={{ width: '100%', fontSize: '12px', padding: '6px 8px' }}
            >
              <option value="">Todos (Admin)</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
            {viewAsUserId && (
              <div style={{
                marginTop: '6px', padding: '5px 8px', borderRadius: '6px',
                background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)',
                fontSize: '11px', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '4px'
              }}>
                🔍 Viendo: <strong>{viewAsUserName}</strong>
              </div>
            )}
          </div>
        )}

        <nav className="sidebar-nav">
          {navItems.map((item, i) => {
            if (item.section) return <div key={i} className="nav-section">{item.section}</div>;
            const isActive = (item.id === 'dashboard' && pathname === '/dashboard') ||
                             (item.id !== 'dashboard' && pathname.includes(item.id));
            return (
              <Link key={item.id} href={item.href} className={`nav-item ${isActive ? 'active' : ''}`}>
                <span className="nav-dot" style={{ background: item.color }}></span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="btn btn-full" onClick={handleLogout} style={{ fontSize: '12px' }}>
            Cerrar sesión
          </button>
        </div>
      </div>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
