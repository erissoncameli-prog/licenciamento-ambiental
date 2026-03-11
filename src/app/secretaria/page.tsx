'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import Sidebar from '@/components/layout/Sidebar'
import { STATUS_LABELS, STATUS_COLORS, type Process, type Decision } from '@/types/database'
import { toast } from 'sonner'
import { PenSquare, Clock, Award, CheckCircle } from 'lucide-react'
export default function SecretariaPage() {
  const { profile } = useAuth()
  const supabase = createClient()
  const [pending, setPending] = useState<Process[]>([])
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState<Process|null>(null)
  const [justification, setJustification] = useState('')
  const [dtype, setDtype] = useState<'deferimento'|'indeferimento'|'exigencia'>('deferimento')
  const [submitting, setSubmitting] = useState(false)
  const load = async () => {
    const [{ data: procs },{ data: decs }] = await Promise.all([
      supabase.from('processes').select('*').in('status',['aprovado_juridico','aguardando_assinatura']).order('created_at'),
      supabase.from('decisions').select('*').order('created_at',{ascending:false}).limit(10)
    ])
    setPending(procs??[]); setDecisions(decs??[]); setLoading(false)
  }
  useEffect(() => { load() }, [])
  const decide = async () => {
    if (!profile || !active || !justification.trim()) return
    setSubmitting(true)
    const { data: dec, error } = await supabase.from('decisions').insert({ process_id:active.id, decider_id:profile.id, decision_type:dtype, justification, is_final:false }).select().single()
    if (error) { toast.error(error.message); setSubmitting(false); return }
    const { data: signed } = await supabase.rpc('sign_decision', { p_decision_id:dec.id, p_signer_id:profile.id })
    signed?.ok ? toast.success('Assinado! '+signed.hash?.substring(0,16)+'...') : toast.error(signed?.error||'Erro')
    setActive(null); setJustification(''); setSubmitting(false)
  }
  const emitir = async (pid: string) => {
    if (!profile) return
    const { data } = await supabase.rpc('emit_license', { p_process_id:pid, p_issuer_id:profile.id, p_valid_months:12 })
    data?.ok ? toast.success('Licenca: '+data.license_number) : toast.error(data?.error||'Erro')
  }
  return (
    <div className="flex min-h-screen"><Sidebar />
      <main className="flex-1 p-8">
        <h1 className="flex items-center gap-2 mb-6"><PenSquare className="w-6 h-6 text-green-700"/>Secretaria</h1>
        <div className="grid grid-cols-2 gap-6">
          <div className="card">
            <h2 className="flex items-center gap-2 mb-4"><Clock className="w-5 h-5 text-amber-500"/>Aguardando ({pending.length})</h2>
            {loading ? [...Array(3)].map((_,i)=><div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse mb-2"/>)
            : pending.map(p=>(
              <div key={p.id} className={`p-4 rounded-xl border-2 cursor-pointer mb-2 ${active?.id===p.id?'border-green-500 bg-green-50':'border-gray-100 hover:border-gray-300'}`} onClick={()=>setActive(p)}>
                <div className="flex justify-between items-start">
                  <div><p className="font-medium text-sm">{p.title}</p><p className="text-xs text-gray-400 font-mono">{p.protocol}</p></div>
                  <span className={`badge ${STATUS_COLORS[p.status as keyof typeof STATUS_COLORS]}`}>{STATUS_LABELS[p.status as keyof typeof STATUS_LABELS]}</span>
                </div>
                {p.status==='aguardando_assinatura' && <button onClick={e=>{e.stopPropagation();emitir(p.id)}} className="mt-2 w-full btn-primary text-xs py-1.5 flex items-center justify-center gap-1"><Award className="w-3 h-3"/>Emitir Licenca</button>}
              </div>
            ))}
          </div>
          <div className="card">
            <h2 className="mb-4">{active?'Decidir: '+active.title:'Selecione um processo'}</h2>
            {!active ? <div className="flex flex-col items-center justify-center h-48 text-gray-400"><PenSquare className="w-12 h-12 mb-3 opacity-30"/><p className="text-sm">Clique em um processo</p></div>
            : <div className="space-y-4">
                <div className="flex gap-2">
                  {(['deferimento','indeferimento','exigencia'] as const).map(t=>(
                    <button key={t} type="button" onClick={()=>setDtype(t)}
                      className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium ${dtype===t?(t==='indeferimento'?'bg-red-600 text-white':'bg-green-700 text-white'):'bg-gray-100 text-gray-600'}`}>
                      {t==='deferimento'?'✅ Deferir':t==='indeferimento'?'❌ Indeferir':'📋 Exigencia'}
                    </button>
                  ))}
                </div>
                <div><label className="label">Fundamentacao *</label>
                  <textarea className="input min-h-28 resize-none" value={justification} onChange={e=>setJustification(e.target.value)} placeholder="Fundamentacao legal..."/></div>
                <div className="flex gap-3">
                  <button className="btn-secondary flex-1" onClick={()=>setActive(null)}>Cancelar</button>
                  <button className="btn-primary flex-1" disabled={submitting||!justification.trim()} onClick={decide}>{submitting?'Assinando...':'Assinar'}</button>
                </div>
              </div>}
          </div>
          <div className="card col-span-2">
            <h2 className="flex items-center gap-2 mb-4"><CheckCircle className="w-5 h-5 text-green-600"/>Ultimas Decisoes</h2>
            <table className="w-full text-xs">
              <thead><tr className="text-left text-gray-500 border-b"><th className="pb-2">Processo</th><th className="pb-2">Tipo</th><th className="pb-2">Hash</th><th className="pb-2">Status</th></tr></thead>
              <tbody>{decisions.map(d=>(
                <tr key={d.id}><td className="py-2 font-mono text-gray-500">{d.process_id.substring(0,8)}...</td>
                  <td className="py-2 capitalize">{d.decision_type}</td>
                  <td className="py-2"><code className="bg-gray-100 px-1 rounded">{d.signature_hash?d.signature_hash.substring(0,12)+'...':'—'}</code></td>
                  <td className="py-2"><span className={`badge ${d.is_final?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>{d.is_final?'✅ Final':'⏳ Pend.'}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}