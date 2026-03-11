'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import Sidebar from '@/components/layout/Sidebar'
import { toast } from 'sonner'
import { User, Shield, Save } from 'lucide-react'

export default function PerfilPage() {
  const { profile } = useAuth()
  const supabase = createClient()
  const [form, setForm] = useState({ full_name: '', phone: '', organization: '', orcid_id: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile) setForm({ full_name: profile.full_name ?? '', phone: profile.phone ?? '', organization: profile.organization ?? '', orcid_id: profile.orcid_id ?? '' })
  }, [profile])

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    const { error } = await supabase.from('profiles').update(form).eq('id', profile.id)
    if (error) toast.error(error.message)
    else toast.success('Perfil atualizado!')
    setSaving(false)
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <h1 className="flex items-center gap-2 mb-6"><User className="w-6 h-6 text-green-700" />Meu Perfil</h1>
          <div className="card mb-6">
            <h2 className="mb-4">Informacoes Pessoais</h2>
            <div className="space-y-4">
              <div><label className="label">Nome Completo</label>
                <input className="input" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Telefone</label>
                  <input className="input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                <div><label className="label">ORCID iD</label>
                  <input className="input" value={form.orcid_id} onChange={e => setForm({...form, orcid_id: e.target.value})} /></div>
              </div>
              <div><label className="label">Organizacao</label>
                <input className="input" value={form.organization} onChange={e => setForm({...form, organization: e.target.value})} /></div>
              <div className="flex justify-end">
                <button className="btn-primary flex items-center gap-2" onClick={handleSave} disabled={saving}>
                  <Save className="w-4 h-4" />{saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
          <div className="card">
            <h2 className="flex items-center gap-2 mb-4"><Shield className="w-5 h-5 text-green-600" />Seguranca</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div><p className="font-medium">Role atual</p><p className="text-gray-500 capitalize">{profile?.role}</p></div>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div><p className="font-medium">MFA</p><p className="text-gray-500">{profile?.mfa_enabled ? 'Ativado' : 'Nao ativado'}</p></div>
                <span className={`badge ${profile?.mfa_enabled ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {profile?.mfa_enabled ? '✅ Ativo' : '⚠️ Recomendado'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}