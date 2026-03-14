import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NexusERP - Sistema de Gestão',
  description: 'Sistema ERP moderno com PDV e Cadastro de Produtos',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-50 text-slate-900 h-screen overflow-hidden flex`} suppressHydrationWarning>
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
