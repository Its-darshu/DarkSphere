'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function GoogleCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const handleAuth = async () => {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) throw sessionError
        
        if (!data.session) {
          // Wait for the hash to be processed, or retry mechanism
          const { data: hashData, error: hashError } = await supabase.auth.getSession()
          if (!hashData.session) {
            router.push('/signin')
            return
          }
        }

        const session = data.session || (await supabase.auth.getSession()).data.session

        if (session?.access_token) {
          // Send to our backend to sync and set HTTP-only custom cookie
          const res = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: session.access_token }),
          })

          const result = await res.json()
          if (res.ok) {
            router.push('/feed')
          } else {
            setError(result.error || 'Failed to sync Google login')
          }
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred during authentication')
      }
    }

    // Set up a listener for the auth event that Supabase triggers when returning from Google
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        handleAuth()
      }
    })

    // Also manually trigger check just in case the event fired before we mounted
    handleAuth()

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [router])

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      {error ? (
        <div className="bg-slate-800 p-6 rounded-lg text-center shadow-xl w-full max-w-sm border border-red-500/30">
          <div className="text-red-400 mb-4 text-xl font-semibold">Authentication Error</div>
          <p className="text-slate-300 mb-6">{error}</p>
          <button 
            onClick={() => router.push('/signin')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          >
            Back to Sign in
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <h2 className="text-slate-300 text-lg">Safely completing Google sign in...</h2>
        </div>
      )}
    </div>
  )
}
