'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Leaf, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'login'|'signup'|'reset'>('login')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) toast.error(error.message)
      else { toast.success('Login realizado!'); router.push('/dashboard') }
    } else if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: email.split('@')[0] } } })
      if (error) toast.error(error.message)
      else toast.success('Verifique seu email!')
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) toast.error(error.message)
      else toast.success('Email enviado!')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <Leaf className="w-8 h-8 text-green-700" />
          </div>
          <h1 className="text-3xl font-bold text-white">SIAM</h1>
          <p className="text-green-200 mt-1">Sistema de Licenciamento Ambiental</p>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            {mode === 'login' ? 'Entrar na plataforma' : mode === 'signup' ? 'Criar conta' : 'Recuperar senha'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="input pl-9" placeholder="seu@email.gov.br" required />
              </div>
            </div>
            {mode !== 'reset' && (
              <div>
                <label className="label">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input type={showPass ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)} className="input pl-9 pr-10" placeholder="••••••••" required />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-2.5 text-gray-400">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar conta' : 'Enviar email'}
            </button>
          </form>
          <div className="mt-4 text-center text-sm space-y-2">
            {mode === 'login' && <>
              <button onClick={() => setMode('reset')} className="text-green-600 hover:underline block w-full">Esqueceu a senha?</button>
              <button onClick={() => setMode('signup')} className="text-gray-500 hover:underline block w-full">Nao tem conta? Cadastre-se</button>
            </>}
            {mode !== 'login' && <button onClick={() => setMode('login')} className="text-green-600 hover:underline">← Voltar ao login</button>}
          </div>
        </div>
      </div>
    </div>
  )
}