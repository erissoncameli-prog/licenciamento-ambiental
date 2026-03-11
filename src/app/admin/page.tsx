'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/layout/Sidebar'
import { type Profile, type AuditLog } from '@/types/database'
import { toast } from 'sonner'
import { Users, Shield } from 'lucide-react'
const ROLES = ['requerente','analista','coordenador','secretario','admin'] as const
export default function AdminPage() {
  const supabase = createClient()
  const [users, setUsers] = useState<Profile[]>([])
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'users'|'audit'>('users')
  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('*').order('created_at',{ascending:false}),
      supabase.from('audit_log').select('*').order('created_at',{ascending:false}).limit(50)
    ]).then(([{data:u},{data:a}]) => { setUsers(u??[]); setLogs(a??[]); setLoading(false) })
  }, [])
  const updateRole = async (id: string, role: typeof ROLES[number]) => {
    const { error } = await supabase.from('profiles').update({role}).eq('id',id)
    error ? toast.error(error.message) : (toast.success('Role atualizado!'), setUsers(prev=>prev.map(u=>u.id===id?{...u,role}:u)))
  }
  return (
    <div className="flex min-h-screen"><Sidebar />
      <main className="flex-1 p-8">
        <h1 className="flex items-center gap-2 mb-6"><Users className="w-6 h-6 text-green-700"/>Administracao</h1>
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          {(['users','audit'] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} className={`pb-3 text-sm font-medium border-b-2 ${tab===t?'border-green-600 text-green-700':'border-transparent text-gray-500'}`}>
              {t==='users'?'👥 Usuarios':'🔍 Audit Log'}
            </button>
          ))}
        </div>
        {tab==='users' && (
          <div className="card">
            <h2 className="mb-4">Usuarios ({users.length})</h2>
            {loading ? [...Array(4)].map((_,i)=><div key={i} className="h-14 bg-gray-100 rounded mb-2 animate-pulse"/>) :
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b"><th className="pb-3">Nome</th><th className="pb-3">Org</th><th className="pb-3">Role</th><th className="pb-3">MFA</th></tr></thead>
              <tbody className="divide-y divide-gray-50">{users.map(u=>(
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="py-3 font-medium">{u.full_name}</td>
                  <td className="py-3 text-gray-500">{u.organization??'—'}</td>
                  <td className="py-3">
                    <select value={u.role} onChange={e=>updateRole(u.id,e.target.value as any)} className="text-xs border border-gray-200 rounded px-2 py-1 capitalize">
                      {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="py-3"><span className={`badge ${u.mfa_enabled?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>{u.mfa_enabled?'✅':'—'}</span></td>
                </tr>
              ))}</tbody>
            </table>}
          </div>
        )}
        {tab==='audit' && (
          <div className="card">
            <h2 className="flex items-center gap-2 mb-4"><Shield className="w-5 h-5 text-green-600"/>Audit Log (50 ultimas)</h2>
            <table className="w-full text-xs">
              <thead><tr className="text-left text-gray-500 border-b"><th className="pb-2">Tabela</th><th className="pb-2">Acao</th><th className="pb-2">Role</th><th className="pb-2">Data</th></tr></thead>
              <tbody>{logs.map(l=>(
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="py-2 font-mono">{l.table_name}</td>
                  <td className="py-2"><span className={`badge ${l.action==='INSERT'?'bg-green-100 text-green-700':l.action==='UPDATE'?'bg-blue-100 text-blue-700':l.action==='DELETE'?'bg-red-100 text-red-700':'bg-gray-100 text-gray-600'}`}>{l.action}</span></td>
                  <td className="py-2 capitalize text-gray-500">{l.actor_role??'—'}</td>
                  <td className="py-2 text-gray-400">{new Date(l.created_at).toLocaleString('pt-BR')}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}