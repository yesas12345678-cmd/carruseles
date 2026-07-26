import './globals.css';

export const metadata = {
  title: 'Motor de Carruseles Local',
  description: 'Renderizador dinámico de diapositivas 1080x1350 para Instagram/TikTok',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
