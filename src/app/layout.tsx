import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TataDana — Catat Keuangan Semudah Chat dari Telegram Kamu',
  description: 'Aplikasi manajemen keuangan pribadi SaaS fintech Indonesia terintegrasi dengan Telegram Bot. Catat pemasukan, pengeluaran, foto struk, dan pantau budget secara real-time.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[#F8FAFC] text-slate-900 antialiased selection:bg-orange-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
