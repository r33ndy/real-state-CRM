import './globals.css';

export const metadata = {
  title: 'EC ADINO REALTY LLC · CRM',
  description: 'Sistema de gestión de bienes raíces e inversiones — EC ADINO REALTY LLC',
  icons: {
    icon: '/favicon-32.png',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
