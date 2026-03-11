'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Process, Notification } from '@/types/database'

export function useRealtimeProcesses(filters?: { status?: string }) {
  const [processes, setProcesses] = useState<Process[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchProcesses = useCallback(async () => {
    let query = supabase.from('processes')
      .select('*, profiles!processes_requester_id_fkey(full_name, role)')
      .order('created_at', { ascending: false })
    if (filters?.status) query = query.eq('status', filters.status)
    const { data } = await query
    setProcesses(data ?? [])
    setLoading(false)
  }, [filters?.status])

  useEffect(() => {
    fetchProcesses()
    const ch = supabase.channel('processes-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'processes' }, () => fetchProcesses())
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [fetchProcesses])

  return { processes, loading, refetch: fetchProcesses }
}

export function useRealtimeNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return
    const load = async () => {
      const { data } = await supabase.from('notifications').select('*')
        .eq('recipient_id', userId).order('created_at', { ascending: false }).limit(20)
      setNotifications(data ?? [])
      setUnreadCount((data ?? []).filter((n: any) => !n.read_at).length)
    }
    load()
    const ch = supabase.channel('notifs-' + userId)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications',
        filter: 'recipient_id=eq.' + userId }, () => load())
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [userId])

  const markAllRead = async () => {
    await supabase.from('notifications').update({ read_at: new Date().toISOString() })
      .eq('recipient_id', userId).is('read_at', null)
    setUnreadCount(0)
  }
  return { notifications, unreadCount, markAllRead }
}
