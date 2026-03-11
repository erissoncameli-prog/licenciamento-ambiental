'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import Sidebar from '@/components/layout/Sidebar'
import { toast } from 'sonner'
import { FileText } from 'lucide-react'
const LICENSES = [{ value:'LP',label:'LP - Licenca Previa'},{ value:'LI',label:'LI - Licenca de Instalacao'},{ value:'LO',label:'LO - Licenca de Operacao'},{ value:'AIA',label:'AIA - Avaliacao de Impacto'}]
export default function NovoProcessoPage() {
  const { profile } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title:'', description:'', license_type:'LP', priority:3, deadline:'' })
  const submit = async (draft: boolean) => {
    if (!profile || !form.title) return
    setLoading(true)
    const { data, error } = await supabase.from('processes').insert({
      title: form.title, description: form.description, license_type: form.license_type,
      priority: form.priority, deadline: form.deadline || null, requester_id: profile.id,
      status: draft ? 'rascunho' : 'submetido', submitted_at: draft ? null : new Date().toISOString(),
    }).select().single()
    if (error) toast.error(error.message)
    else { toast.success(draft ? 'Rascunho salvo!' : 'Processo submetido!'); router.push(`/processos/${data.id}`) }
    setLoading(false)
  }
  return (
    <div className="flex min-h-screen"><Sidebar />
      <main className="flex-1 p-8"><div className="max-w-2xl mx-auto">
        <h1 className="flex items-center gap-2 mb-6"><FileText className="w-6 h-6 text-green-700"/>Novo Processo</h1>
        <div className="card space-y-4">
          <div><label className="label">Titulo *</label>
            <input className="input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Ex: Usina Solar..." required/></div>
          <div><label className="label">Descricao</label>
            <textarea className="input min-h-24 resize-none" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Tipo de Licenca</label>
              <select className="input" value={form.license_type} onChange={e=>setForm({...form,license_type:e.target.value})}>
                {LICENSES.map(l=><option key={l.value} value={l.value}>{l.label}</option>)}
              </select></div>
            <div><label className="label">Prazo</label>
              <input type="date" className="input" value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})}/></div>
          </div>
          <div><label className="label">Prioridade</label>
            <div className="flex gap-2 mt-1">
              {[1,2,3,4,5].map(n=>(
                <button type="button" key={n} onClick={()=>setForm({...form,priority:n})}
                  className={`w-10 h-10 rounded-lg text-sm font-medium ${form.priority===n?'bg-green-700 text-white':'bg-gray-100 text-gray-600'}`}>{n}</button>
              ))}
            </div></div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" className="btn-secondary" disabled={loading} onClick={()=>submit(true)}>Rascunho</button>
            <button type="button" className="btn-primary" disabled={loading||!form.title} onClick={()=>submit(false)}>
              {loading?'Enviando...':'Submeter'}
            </button>
          </div>
        </div>
      </div></main>
    </div>
  )
}