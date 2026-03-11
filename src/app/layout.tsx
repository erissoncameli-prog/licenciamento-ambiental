import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
const inter = Inter({ subsets: ['latin'] })
export const metadata: Metadata = {
  title: 'SIAM — Sistema de Licenciamento Ambiental',
  description: 'Plataforma digital de licenciamento ambiental',
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}