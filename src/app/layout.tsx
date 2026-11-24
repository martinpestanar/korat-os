import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export const viewport: Viewport = {
  themeColor: '#0EA5E9',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Korat OS · Martín',
  description: 'Segundo cerebro, centro de mando y copiloto de negocios.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Korat OS',
  },
  icons: {
    icon: '/icon-512x512.png',
    apple: '/icon-512x512.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${jakarta.className} bg-[#FAF8F5] text-slate-800 antialiased selection:bg-sky-200 selection:text-sky-900`}>
        {children}
      </body>
    </html>
  );
}
