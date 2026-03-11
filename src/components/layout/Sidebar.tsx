'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useRealtimeNotifications } from '@/hooks/useRealtime'
import { LayoutDashboard, FileText, Search, ClipboardCheck, PenSquare, Bell, Settings, LogOut, Leaf, Users, Shield } from 'lucide-react'
import { clsx } from 'clsx'

export default function Sidebar() {
  const pathname = usePathname()
  const { profile, signOut } = useAuth()
  const { unreadCount } = useRealtimeNotifications(profile?.id ?? '')

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['requerente','analista','coordenador','secretario','admin'] },
    { href: '/processos/novo', icon: FileText, label: 'Novo Processo', roles: ['requerente'] },
    { href: '/analise', icon: Search, label: 'Fila de Análise', roles: ['analista','coordenador','admin'] },
    { href: '/secretaria', icon: PenSquare, label: 'Secretaria', roles: ['secretario','admin'] },
    { href: '/secretaria/licencas', icon: ClipboardCheck, label: 'Licencas', roles: ['secretario','admin','coordenador'] },
    { href: '/admin', icon: Users, label: 'Usuarios', roles: ['admin'] },
    { href: '/admin/auditoria', icon: Shield, label: 'Auditoria', roles: ['admin','secretario'] },
  ]

  const filtered = navItems.filter(i => profile?.role && i.roles.includes(profile.role))

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-700 rounded-lg flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">SIAM</p>
            <p className="text-xs text-gray-500">Licenciamento Ambiental</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {filtered.map(item => (
          <Link key={item.href} href={item.href}
            className={clsx('sidebar-link', pathname === item.href && 'active')}>
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-100 space-y-1">
        <Link href="/notificacoes" className={clsx('sidebar-link', pathname === '/notificacoes' && 'active')}>
          <Bell className="w-4 h-4" />
          Notificacoes
          {unreadCount > 0 && (
            <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Link>
        <Link href="/perfil" className={clsx('sidebar-link', pathname === '/perfil' && 'active')}>
          <Settings className="w-4 h-4" />Perfil
        </Link>
        <button onClick={signOut} className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-700">
          <LogOut className="w-4 h-4" />Sair
        </button>
      </div>
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <p className="text-xs font-medium text-gray-800 truncate">{profile?.full_name}</p>
        <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
      </div>
    </aside>
  )
}