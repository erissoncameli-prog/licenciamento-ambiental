'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, XCircle, Search, Leaf, Shield } from 'lucide-react'
export default function VerificarPage() {
  const [token, setToken] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const verify = async () => {
    if (!token.trim()) return
    setLoading(true)
    const { data, error } = await supabase.rpc('verify_license', { p_qr_token: token.trim() })
    setResult(error ? { valid: false, error: error.message } : data)
    setLoading(false)
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-emerald-800 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4"><Leaf className="w-8 h-8 text-green-700"/></div>
          <h1 className="text-2xl font-bold text-white">Verificar Licenca Ambiental</h1>
          <p className="text-green-200 mt-1">Consulta publica de autenticidade</p>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex gap-3 mb-6">
            <input className="input flex-1" value={token} onChange={e=>setToken(e.target.value)} placeholder="Token do QR Code..." onKeyDown={e=>e.key==='Enter'&&verify()}/>
            <button className="btn-primary flex items-center gap-2" onClick={verify} disabled={loading||!token.trim()}>
              <Search className="w-4 h-4"/>{loading?'...':'Verificar'}
            </button>
          </div>
          {result && (
            <div className={`rounded-xl p-6 ${result.valid?'bg-green-50 border border-green-200':'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center gap-3 mb-4">
                {result.valid?<CheckCircle className="w-8 h-8 text-green-600"/>:<XCircle className="w-8 h-8 text-red-600"/>}
                <p className={`font-bold text-lg ${result.valid?'text-green-800':'text-red-800'}`}>
                  {result.valid?'Licenca Valida ✅':'Licenca Invalida ❌'}
                </p>
              </div>
              {result.valid && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-gray-500">Numero</p><p className="font-semibold">{result.license_number}</p></div>
                  <div><p className="text-gray-500">Valida ate</p><p className="font-semibold">{new Date(result.valid_until).toLocaleDateString('pt-BR')}</p></div>
                </div>
              )}
            </div>
          )}
          <div className="mt-6 flex items-center gap-2 text-xs text-gray-400 justify-center">
            <Shield className="w-3 h-3"/>Verificado com SHA-256 · SIAM
          </div>
        </div>
      </div>
    </div>
  )
}