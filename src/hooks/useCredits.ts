'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'

export function useCredits() {
  const { user } = useAuth()
  const [credits, setCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setCredits(null)
      setLoading(false)
      return
    }

    const fetchCredits = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const { data, error } = await supabase
          .from('profiles')
          .select('credits_remaining')
          .eq('id', user.id)
          .single()

        if (error) {
          throw error
        }

        setCredits(data?.credits_remaining ?? 0)
      } catch (err) {
        console.error('Error fetching credits:', err)
        setError('Failed to fetch credits')
        setCredits(0)
      } finally {
        setLoading(false)
      }
    }

    fetchCredits()

    const channel = supabase
      .channel('credits-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          setCredits(payload.new.credits_remaining)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase])

  return { credits, loading, error }
}