'use client';

export default function TerminosPage() {
  return (
    <div className="login-container">
      <div className="login-card" style={{ width: '700px', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <a href="/" style={{ color: 'var(--accent-primary-light)', textDecoration: 'none', fontSize: '13px' }}>← Volver al inicio</a>
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Términos de Servicio</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '24px' }}>Última actualización: Marzo 2026</p>

        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px', marginTop: '20px' }}>1. Aceptación de los Términos</h3>
          <p>Al acceder y utilizar el sistema CRM de EC ADINO REALTY LLC, usted acepta cumplir con estos términos de servicio. Si no está de acuerdo con alguno de estos términos, no debe utilizar el sistema.</p>

          <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px', marginTop: '20px' }}>2. Uso del Sistema</h3>
          <p>El sistema CRM está diseñado exclusivamente para la gestión interna de bienes raíces e inversiones de EC ADINO REALTY LLC. Su uso está limitado a empleados autorizados y administradores de la empresa.</p>

          <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px', marginTop: '20px' }}>3. Cuentas de Usuario</h3>
          <p>Cada usuario es responsable de mantener la confidencialidad de sus credenciales de acceso. No debe compartir su contraseña con terceros. Cualquier actividad realizada bajo su cuenta será su responsabilidad.</p>

          <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px', marginTop: '20px' }}>4. Datos y Contenido</h3>
          <p>Toda la información ingresada en el sistema, incluyendo evaluaciones de mercado, directorios de profesionales, contratistas e inversionistas, es propiedad de EC ADINO REALTY LLC. Los usuarios no deben copiar, distribuir o divulgar esta información sin autorización.</p>

          <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px', marginTop: '20px' }}>5. Disponibilidad del Servicio</h3>
          <p>EC ADINO REALTY LLC se esfuerza por mantener el sistema disponible, pero no garantiza un funcionamiento ininterrumpido. Se pueden realizar mantenimientos programados que podrían afectar temporalmente el acceso.</p>

          <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px', marginTop: '20px' }}>6. Modificaciones</h3>
          <p>EC ADINO REALTY LLC se reserva el derecho de modificar estos términos en cualquier momento. Los cambios serán efectivos al ser publicados en esta página.</p>

          <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px', marginTop: '20px' }}>7. Contacto</h3>
          <p>Para cualquier consulta sobre estos términos, puede contactarse con el administrador del sistema.</p>
        </div>
      </div>
    </div>
  );
}
