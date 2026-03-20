'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useViewAsUser, buildApiUrl } from '@/lib/useViewAsUser';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const viewAsUserId = useViewAsUser();

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(userData => {
      if (userData.error || userData.user?.role !== 'admin') {
        router.push('/dashboard/mercado');
        return;
      }
      setUser(userData.user);
    }).catch(() => router.push('/'));
  }, [router]);

  // Reload dashboard data when viewAsUserId changes
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const url = viewAsUserId ? `/api/dashboard?user_id=${viewAsUserId}` : '/api/dashboard';
    fetch(url).then(r => r.json()).then(data => {
      setStats(data);
      setLoading(false);
    });
  }, [user, viewAsUserId]);

  if (!user || loading) {
    return (
      <div className="empty-state">
        <div className="spinner" style={{ width: 24, height: 24, margin: '0 auto' }}></div>
      </div>
    );
  }

  const marketsByState = {};
  (stats?.markets || []).forEach(m => {
    if (!marketsByState[m.state]) marketsByState[m.state] = [];
    if (!marketsByState[m.state].includes(m.city)) marketsByState[m.state].push(m.city);
  });

  return (
    <>
      <div className="page-header">
        <div className="page-title">Dashboard</div>
        <div className="page-subtitle">Panel general del sistema · EC ADINO REALTY LLC</div>
      </div>

      {viewAsUserId && stats?.viewingAs && (
        <div className="alert alert-info" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: 'var(--accent-amber)' }}>
          🔍 Viendo datos de: <strong>{stats.viewingAs.name}</strong>. Usa el selector del sidebar para volver a la vista admin.
        </div>
      )}

      <div className="grid-4" style={{ marginBottom: '20px' }}>
        <div className="metric-card">
          <div className="metric-value">{stats?.counts?.employees || 0}</div>
          <div className="metric-label">Usuarios activos</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{stats?.counts?.markets || 0}</div>
          <div className="metric-label">Mercados</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{stats?.counts?.professionals || 0}</div>
          <div className="metric-label">Profesionales</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{stats?.counts?.contractors || 0}</div>
          <div className="metric-label">Contratistas</div>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: '20px' }}>
        <div className="metric-card">
          <div className="metric-value">{stats?.counts?.investors || 0}</div>
          <div className="metric-label">Inversionistas</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title" style={{ marginBottom: '16px' }}>🏘️ Mercados registrados</div>
          {Object.entries(marketsByState).map(([state, cities]) => (
            <div key={state} style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>
                {state}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                {cities.join(' · ')}
              </div>
            </div>
          ))}
          {Object.keys(marketsByState).length === 0 && (
            <div className="empty-state">Sin mercados registrados</div>
          )}
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: '16px' }}>👥 Usuarios del sistema</div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.employees || []).filter(e => e.role === 'employee').map(emp => (
                  <tr key={emp.id}>
                    <td>{emp.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{emp.email}</td>
                    <td>
                      <span className={`badge ${emp.status === 'active' ? 'badge-green' : 'badge-amber'}`}>
                        {emp.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
                {(stats?.employees || []).filter(e => e.role === 'employee').length === 0 && (
                  <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Sin usuarios</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
