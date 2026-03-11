'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'

export function useAuth() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setProfile(data)
      }
      setLoading(false)
    }
    getProfile()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { getProfile() })
    return () => subscription.unsubscribe()
  }, [])

  const signOut = () => supabase.auth.signOut()
  return { profile, loading, signOut }
}