'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import Sidebar from '@/components/layout/Sidebar'
import { STATUS_LABELS, STATUS_COLORS, type Process, type ProcessTransition, type Document, type ProcessStatus } from '@/types/database'
import { toast } from 'sonner'
import { Clock, FileText, MessageSquare, ChevronRight, CheckCircle } from 'lucide-react'

const NEXT: Partial<Record<ProcessStatus, ProcessStatus[]>> = {
  rascunho:['submetido'], submetido:['triagem','indeferido'], triagem:['em_analise','pendente_documentacao'],
  em_analise:['em_vistoria','aprovado_tecnico','pendente_documentacao','indeferido'],
  pendente_documentacao:['em_analise','arquivado'], em_vistoria:['aprovado_tecnico','em_analise'],
  aprovado_tecnico:['em_revisao_juridica'], em_revisao_juridica:['aprovado_juridico','em_analise'],
  aprovado_juridico:['aguardando_assinatura'], aguardando_assinatura:['licenca_emitida'],
}

export default function ProcessoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()
  const supabase = createClient()
  const [proc, setProc] = useState<Process|null>(null)
  const [trans, setTrans] = useState<ProcessTransition[]>([])
  const [docs, setDocs] = useState<Document[]>([])
  const [comment, setComment] = useState('')
  const [transitioning, setTransitioning] = useState(false)
  const [tab, setTab] = useState<'historico'|'documentos'|'comentarios'>('historico')

  useEffect(() => {
    const load = async () => {
      const [{ data: p }, { data: t }, { data: d }] = await Promise.all([
        supabase.from('processes').select('*, profiles!processes_requester_id_fkey(full_name)').eq('id', id).single(),
        supabase.from('process_transitions').select('*, profiles(full_name, role)').eq('process_id', id).order('created_at'),
        supabase.from('documents').select('*').eq('process_id', id).order('created_at',{ascending:false}),
      ])
      setProc(p); setTrans(t??[]); setDocs(d??[])
    }
    load()
    const ch = supabase.channel('proc-'+id).on('postgres_changes',{event:'*',schema:'public',table:'processes',filter:'id=eq.'+id},load).subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [id])

  const transition = async (s: ProcessStatus) => {
    if (!profile) return
    setTransitioning(true)
    const { data, error } = await supabase.rpc('transition_process', { p_process_id:id, p_new_status:s, p_actor_id:profile.id, p_reason:comment||null })
    error||!data?.ok ? toast.error(data?.error||error?.message||'Erro') : (toast.success('Avancado: '+STATUS_LABELS[s]), setComment(''))
    setTransitioning(false)
  }

  if (!proc) return <div className="flex min-h-screen"><Sidebar /><main className="flex-1 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"/></main></div>

  const next = NEXT[proc.status as ProcessStatus] ?? []
  return (
    <div className="flex min-h-screen"><Sidebar />
      <main className="flex-1 p-8 overflow-auto"><div className="max-w-5xl mx-auto">
        <div className="card mb-6">
          <div className="flex items-start justify-between">
            <div><p className="text-xs text-gray-500 font-mono mb-1">{proc.protocol}</p>
              <h1 className="text-xl font-bold">{proc.title}</h1>
              {proc.description && <p className="text-gray-500 mt-2 text-sm">{proc.description}</p>}</div>
            <span className={`badge text-sm px-3 py-1 ${STATUS_COLORS[proc.status as ProcessStatus]}`}>{STATUS_LABELS[proc.status as ProcessStatus]}</span>
          </div>
          <div className="flex gap-6 mt-4 text-sm text-gray-500">
            <span>Tipo: <strong>{proc.license_type}</strong></span>
            <span>Prioridade: <strong>{proc.priority}</strong></span>
            <span>Criado: <strong>{new Date(proc.created_at).toLocaleDateString('pt-BR')}</strong></span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="card">
              <div className="flex gap-4 border-b border-gray-100 mb-4 -mx-6 px-6">
                {(['historico','documentos','comentarios'] as const).map(t=>(
                  <button key={t} onClick={()=>setTab(t)} className={`pb-3 text-sm font-medium capitalize border-b-2 ${tab===t?'border-green-600 text-green-700':'border-transparent text-gray-500'}`}>
                    {t==='historico'?'📋 Historico':t==='documentos'?'📄 Documentos':'💬 Comentarios'}
                  </button>
                ))}
              </div>
              {tab==='historico' && (
                <div className="space-y-3">
                  {trans.length===0?<p className="text-gray-500 text-sm text-center py-4">Sem transicoes</p>
                  :trans.map((t,i)=>(
                    <div key={t.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-green-600"/></div>
                        {i<trans.length-1 && <div className="w-0.5 h-full bg-gray-200 mt-1"/>}
                      </div>
                      <div className="flex-1 pb-3">
                        <div className="flex items-center gap-2 text-sm">
                          {t.from_status && <><span className={`badge ${STATUS_COLORS[t.from_status]}`}>{STATUS_LABELS[t.from_status]}</span><ChevronRight className="w-3 h-3 text-gray-400"/></>}
                          <span className={`badge ${STATUS_COLORS[t.to_status]}`}>{STATUS_LABELS[t.to_status]}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">por <strong>{(t as any).profiles?.full_name}</strong> · {new Date(t.created_at).toLocaleString('pt-BR')}</p>
                        {t.reason && <p className="text-xs text-gray-600 mt-1 italic">"{t.reason}"</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {tab==='documentos' && (
                <div>
                  {docs.length===0?<div className="text-center py-8"><FileText className="w-10 h-10 text-gray-300 mx-auto mb-2"/><p className="text-gray-500 text-sm">Sem documentos</p></div>
                  :<div className="space-y-2">{docs.map(d=>(
                    <div key={d.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <FileText className="w-5 h-5 text-gray-400"/>
                      <div className="flex-1"><p className="text-sm font-medium truncate">{d.filename}</p><p className="text-xs text-gray-500">{new Date(d.created_at).toLocaleDateString('pt-BR')}</p></div>
                    </div>
                  ))}</div>}
                </div>
              )}
              {tab==='comentarios' && (
                <div className="space-y-4">
                  <textarea className="input min-h-20 resize-none" value={comment} onChange={e=>setComment(e.target.value)} placeholder="Adicione um comentario..."/>
                  <button className="btn-primary text-sm" onClick={async()=>{ if(!profile||!comment.trim())return; await supabase.from('process_comments').insert({process_id:id,author_id:profile.id,content:comment,is_internal:profile.role!=='requerente'}); toast.success('Comentario adicionado'); setComment('') }} disabled={!comment.trim()}>
                    <MessageSquare className="w-4 h-4 inline mr-2"/>Comentar
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-4">
            {next.length>0 && (
              <div className="card">
                <h3 className="font-semibold mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-green-600"/>Avancar</h3>
                <textarea className="input text-xs min-h-16 resize-none mb-3" value={comment} onChange={e=>setComment(e.target.value)} placeholder="Motivo (opcional)"/>
                <div className="space-y-2">
                  {next.map(s=>(
                    <button key={s} onClick={()=>transition(s)} disabled={transitioning}
                      className={`w-full text-sm py-2 px-3 rounded-lg font-medium ${s==='indeferido'||s==='arquivado'?'bg-red-50 text-red-700 hover:bg-red-100':'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                      {transitioning?'...':'→ '+STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div></main>
    </div>
  )
}