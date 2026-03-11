'use client'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRealtimeProcesses } from '@/hooks/useRealtime'
import Sidebar from '@/components/layout/Sidebar'
import { STATUS_LABELS, STATUS_COLORS, type ProcessStatus } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'
import { Search, RefreshCw, UserCheck } from 'lucide-react'

const QUEUE: ProcessStatus[] = ['submetido','triagem','em_analise','em_vistoria','pendente_documentacao']

export default function FilaAnalisePage() {
  const { profile } = useAuth()
  const [search, setSearch] = useState('')
  const supabase = createClient()
  const { processes, loading, refetch } = useRealtimeProcesses()

  const filtered = processes.filter(p =>
    QUEUE.includes(p.status as ProcessStatus) &&
    (search === '' || p.title.toLowerCase().includes(search.toLowerCase()) || p.protocol.toLowerCase().includes(search.toLowerCase()))
  )

  const byStatus = QUEUE.reduce((acc, s) => { acc[s] = filtered.filter(p => p.status === s); return acc }, {} as Record<ProcessStatus, typeof processes>)

  const assign = async (id: string) => {
    if (!profile) return
    const { error } = await supabase.from('processes').update({ analyst_id: profile.id }).eq('id', id)
    error ? toast.error(error.message) : (toast.success('Assumido!'), refetch())
  }

  return (
    <div className="flex min-h-screen"><Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-6 flex items-center justify-between">
          <div><h1 className="flex items-center gap-2"><Search className="w-6 h-6 text-green-700"/>Fila de Analise</h1>
            <p className="text-gray-500 mt-1">{filtered.length} processos</p></div>
          <button onClick={refetch} className="btn-secondary flex items-center gap-2"><RefreshCw className="w-4 h-4"/>Atualizar</button>
        </div>
        <div className="card mb-6">
          <input className="input" placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {QUEUE.map(status => (
            <div key={status} className="flex-shrink-0 w-72">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className={`badge ${STATUS_COLORS[status]}`}>{STATUS_LABELS[status]}</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{byStatus[status]?.length ?? 0}</span>
              </div>
              <div className="space-y-3 min-h-24">
                {loading ? [...Array(2)].map((_,i)=><div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse"/>)
                : (byStatus[status]??[]).map(p=>(
                  <div key={p.id} className="card p-4 hover:shadow-md transition-shadow">
                    <p className="text-xs font-mono text-gray-400 mb-1">{p.protocol}</p>
                    <Link href={`/processos/${p.id}`}><p className="text-sm font-semibold hover:text-green-700 line-clamp-2">{p.title}</p></Link>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString('pt-BR')}</p>
                      {!p.analyst_id && <button onClick={()=>assign(p.id)} className="text-xs text-green-600 flex items-center gap-1"><UserCheck className="w-3 h-3"/>Assumir</button>}
                    </div>
                  </div>
                ))}
                {!loading && (byStatus[status]??[]).length===0 && <div className="h-20 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl"><p className="text-xs text-gray-400">Sem processos</p></div>}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}