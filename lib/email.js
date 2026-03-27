import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'EC ADINO REALTY LLC <noreply@ecrealty.pro>';

export function buildWelcomeEmail({ name, email, password, loginUrl }) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a EC ADINO REALTY</title>
</head>
<body style="margin:0;padding:0;background-color:#0f1117;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0f1117;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="520" cellspacing="0" cellpadding="0" style="background:linear-gradient(135deg,#161922 0%,#1a1d2e 100%);border-radius:16px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;">
          
          <!-- Header with gradient -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e3a5f 0%,#0ea5e9 100%);padding:40px 40px 32px;text-align:center;">
              <img src="${loginUrl}/logo.png" alt="EC ADINO REALTY" width="72" height="72" style="display:block;margin:0 auto 16px;border-radius:14px;" />
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.01em;">EC ADINO REALTY LLC</h1>
              <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.7);letter-spacing:0.02em;">CRM Platform</p>
            </td>
          </tr>

          <!-- Welcome message -->
          <tr>
            <td style="padding:32px 40px 0;">
              <h2 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#f1f5f9;">¡Bienvenido, ${name}!</h2>
              <p style="margin:0;font-size:14px;color:#94a3b8;line-height:1.6;">
                Tu cuenta ha sido creada exitosamente en el sistema CRM de EC ADINO REALTY LLC. A continuación encontrarás tus credenciales de acceso.
              </p>
            </td>
          </tr>

          <!-- Credentials card -->
          <tr>
            <td style="padding:24px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:rgba(14,165,233,0.06);border:1px solid rgba(14,165,233,0.15);border-radius:12px;">
                <tr>
                  <td style="padding:24px;">
                    <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#0ea5e9;font-weight:600;">Tus credenciales</p>
                    
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:16px;">
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                          <span style="font-size:12px;color:#64748b;">Correo electrónico</span><br/>
                          <span style="font-size:15px;color:#e2e8f0;font-weight:500;">${email}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                          <span style="font-size:12px;color:#64748b;">Contraseña temporal</span><br/>
                          <span style="font-size:15px;color:#e2e8f0;font-weight:500;font-family:monospace;background:rgba(255,255,255,0.05);padding:2px 8px;border-radius:4px;">${password}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;">
                          <span style="font-size:12px;color:#64748b;">URL de acceso</span><br/>
                          <a href="${loginUrl}" style="font-size:15px;color:#0ea5e9;text-decoration:none;font-weight:500;">${loginUrl}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 40px 8px;" align="center">
              <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#0ea5e9,#0284c7);color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 40px;border-radius:10px;letter-spacing:0.01em;">
                Iniciar sesión →
              </a>
            </td>
          </tr>

          <!-- Permissions -->
          <tr>
            <td style="padding:24px 40px 0;">
              <p style="margin:0 0 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#64748b;font-weight:600;">Módulos disponibles</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#94a3b8;">✅ Evaluación de mercado</td>
                  <td style="padding:6px 0;font-size:13px;color:#94a3b8;">✅ Profesionales</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#94a3b8;">✅ Contratistas</td>
                  <td style="padding:6px 0;font-size:13px;color:#94a3b8;">✅ Inversionistas</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#94a3b8;">✅ Lending</td>
                  <td style="padding:6px 0;font-size:13px;color:#94a3b8;">✅ Agents</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Security note -->
          <tr>
            <td style="padding:24px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.15);border-radius:10px;">
                <tr>
                  <td style="padding:16px;">
                    <p style="margin:0;font-size:12px;color:#f59e0b;font-weight:600;">🔒 Seguridad</p>
                    <p style="margin:6px 0 0;font-size:12px;color:#94a3b8;line-height:1.5;">
                      Te recomendamos cambiar tu contraseña temporal después de tu primer inicio de sesión desde la sección "Mi perfil".
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 40px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.04);">
              <p style="margin:0;font-size:11px;color:#475569;">
                © ${new Date().getFullYear()} EC ADINO REALTY LLC · Todos los derechos reservados
              </p>
              <p style="margin:6px 0 0;font-size:11px;color:#334155;">
                Este correo fue enviado automáticamente. No responda a este mensaje.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendWelcomeEmail({ name, email, password }) {
  const loginUrl = 'https://www.ecrealty.pro';

  const html = buildWelcomeEmail({ name, email, password, loginUrl });

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Bienvenido a EC ADINO REALTY CRM — Tus credenciales de acceso`,
      html,
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('Email service error:', err);
    return { success: false, error: err.message };
  }
}
