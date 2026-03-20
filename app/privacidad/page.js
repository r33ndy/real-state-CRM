'use client';

export default function PrivacidadPage() {
  return (
    <div className="login-container">
      <div className="login-card" style={{ width: '700px', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <a href="/" style={{ color: 'var(--accent-primary-light)', textDecoration: 'none', fontSize: '13px' }}>← Volver al inicio</a>
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Política de Privacidad</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '24px' }}>Última actualización: Marzo 2026</p>

        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px', marginTop: '20px' }}>1. Información que Recopilamos</h3>
          <p>Recopilamos la siguiente información personal de nuestros usuarios: nombre completo, correo electrónico, número de teléfono y rol dentro de la organización. Esta información es necesaria para el funcionamiento del sistema.</p>

          <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px', marginTop: '20px' }}>2. Uso de la Información</h3>
          <p>La información recopilada se utiliza exclusivamente para:</p>
          <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
            <li>Autenticación y gestión de acceso al sistema</li>
            <li>Identificación de registros creados por cada usuario</li>
            <li>Comunicación interna relacionada con la operación del negocio</li>
            <li>Administración de cuentas de usuario</li>
          </ul>

          <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px', marginTop: '20px' }}>3. Seguridad de los Datos</h3>
          <p>Implementamos medidas de seguridad para proteger su información personal, incluyendo: cifrado de contraseñas mediante algoritmos de hash seguros (bcrypt), tokens de sesión seguros (JWT con cookies httpOnly), y control de acceso basado en roles.</p>

          <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px', marginTop: '20px' }}>4. Almacenamiento</h3>
          <p>Los datos se almacenan de forma segura en servidores de Supabase con cifrado en tránsito y en reposo. No compartimos información personal con terceros sin su consentimiento.</p>

          <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px', marginTop: '20px' }}>5. Derechos del Usuario</h3>
          <p>Usted tiene derecho a:</p>
          <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
            <li>Acceder a su información personal almacenada en el sistema</li>
            <li>Solicitar la corrección de datos inexactos</li>
            <li>Actualizar su contraseña y datos de contacto</li>
            <li>Solicitar la eliminación de su cuenta al administrador</li>
          </ul>

          <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px', marginTop: '20px' }}>6. Cookies y Sesiones</h3>
          <p>El sistema utiliza cookies de sesión httpOnly para mantener su autenticación. Estas cookies son esenciales para el funcionamiento del sistema y no se utilizan con fines de seguimiento o publicidad.</p>

          <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px', marginTop: '20px' }}>7. Cambios en esta Política</h3>
          <p>EC ADINO REALTY LLC se reserva el derecho de actualizar esta política de privacidad. Cualquier cambio será publicado en esta página con la fecha de actualización correspondiente.</p>

          <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px', marginTop: '20px' }}>8. Contacto</h3>
          <p>Si tiene preguntas sobre esta política de privacidad, puede contactar al administrador del sistema.</p>
        </div>
      </div>
    </div>
  );
}
