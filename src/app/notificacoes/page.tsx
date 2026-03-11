'use client'
import { useAuth } from '@/hooks/useAuth'
import { useRealtimeNotifications } from '@/hooks/useRealtime'
import Sidebar from '@/components/layout/Sidebar'
import { Bell, CheckCheck } from 'lucide-react'
import Link from 'next/link'
export default function NotificacoesPage() {
  const { profile } = useAuth()
  const { notifications, unreadCount, markAllRead } = useRealtimeNotifications(profile?.id ?? '')
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="flex items-center gap-2"><Bell className="w-6 h-6 text-green-700" />Notificacoes</h1>
            {unreadCount > 0 && <button onClick={markAllRead} className="btn-secondary flex items-center gap-2 text-sm"><CheckCheck className="w-4 h-4" />Marcar lidas</button>}
          </div>
          <div className="space-y-3">
            {notifications.length === 0
              ? <div className="card text-center py-16"><Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">Sem notificacoes</p></div>
              : notifications.map(n => (
                <div key={n.id} className={`card p-4 flex gap-4 ${!n.read_at ? 'border-l-4 border-l-green-500' : ''}`}>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{n.title}</p>
                    {n.body && <p className="text-sm text-gray-500">{n.body}</p>}
                    <div className="flex gap-4 mt-2">
                      <p className="text-xs text-gray-400">{new Date(n.created_at).toLocaleString('pt-BR')}</p>
                      {n.process_id && <Link href={`/processos/${n.process_id}`} className="text-xs text-green-600">Ver processo</Link>}
                    </div>
                  </div>
                  {!n.read_at && <div className="w-2 h-2 bg-green-500 rounded-full mt-1" />}
                </div>
              ))}
          </div>
        </div>
      </main>
    </div>
  )
}