import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Korat OS · Martín',
  description: 'Segundo cerebro, centro de mando y copiloto de negocios.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${jakarta.className} bg-[#FAF8F5] text-slate-800 antialiased`}>
        {children}
      </body>
    </html>
  );
}
