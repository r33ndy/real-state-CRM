import './globals.css';

export const metadata = {
  title: 'Edwin LLC · CRM',
  description: 'Sistema de gestión de bienes raíces e inversiones — Edwin LLC',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
