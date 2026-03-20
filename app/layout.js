import './globals.css';

export const metadata = {
  title: 'EC ADINO REALTY LLC · CRM',
  description: 'Sistema de gestión de bienes raíces e inversiones — EC ADINO REALTY LLC',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
