'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useRealtimeProcesses } from '@/hooks/useRealtime'
import { STATUS_LABELS, STATUS_COLORS, type ProcessStatus } from '@/types/database'
import Sidebar from '@/components/layout/Sidebar'
import { FileText, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'
import Link from 'next/link'
export default function DashboardPage() {
  const { profile } = useAuth()
  const { processes, loading } = useRealtimeProcesses()
  const [stats, setStats] = useState({ total:0, analise:0, pendente:0, emitidas:0 })
  const supabase = createClient()
  useEffect(() => {
    supabase.from('processes').select('status').then(({data}) => {
      if(data) setStats({ total:data.length, analise:data.filter(p=>p.status==='em_analise').length, pendente:data.filter(p=>p.status==='pendente_documentacao').length, emitidas:data.filter(p=>p.status==='licenca_emitida').length })
    })
  }, [processes])
  return (
    <div className="flex min-h-screen"><Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-8"><h1>Ola, {profile?.full_name?.split(' ')[0]} 👋</h1><p className="text-gray-500">Bem-vindo ao SIAM</p></div>
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[{l:'Total',v:stats.total,I:FileText,c:'text-blue-600',b:'bg-blue-50'},{l:'Em Analise',v:stats.analise,I:Clock,c:'text-orange-600',b:'bg-orange-50'},{l:'Pendente',v:stats.pendente,I:AlertCircle,c:'text-red-600',b:'bg-red-50'},{l:'Licencas',v:stats.emitidas,I:CheckCircle,c:'text-green-600',b:'bg-green-50'}].map(c=>(
            <div key={c.l} className="card flex items-center gap-4">
              <div className={`p-3 rounded-xl ${c.b}`}><c.I className={`w-6 h-6 ${c.c}`}/></div>
              <div><p className="text-2xl font-bold">{c.v}</p><p className="text-sm text-gray-500">{c.l}</p></div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-600"/>Processos Recentes</h2>
            <Link href="/analise" className="text-sm text-green-600">Ver todos</Link>
          </div>
          {loading ? <div className="space-y-3">{[...Array(5)].map((_,i)=><div key={i} className="h-14 bg-gray-100 rounded animate-pulse"/>)}</div>
          : processes.length === 0 ? <p className="text-center py-8 text-gray-500">Nenhum processo</p>
          : <table className="w-full text-sm"><thead><tr className="text-left text-gray-500 border-b">
              <th className="pb-3">Protocolo</th><th className="pb-3">Titulo</th><th className="pb-3">Status</th>
            </tr></thead><tbody className="divide-y divide-gray-50">
              {processes.slice(0,10).map(p=>(
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="py-3 font-mono text-xs text-gray-500">{p.protocol}</td>
                  <td className="py-3"><Link href={`/processos/${p.id}`} className="hover:text-green-700 font-medium">{p.title}</Link></td>
                  <td className="py-3"><span className={`badge ${STATUS_COLORS[p.status as ProcessStatus]}`}>{STATUS_LABELS[p.status as ProcessStatus]}</span></td>
                </tr>
              ))}
            </tbody></table>}
        </div>
      </main>
    </div>
  )
}