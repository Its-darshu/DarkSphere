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
        console.log('[Callback] Starting auth check...')
        const { data, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('[Callback] Session error:', sessionError)
          throw sessionError
        }
        
        const session = data.session
        console.log('[Callback] Session:', session ? 'Found' : 'Not found')

        if (session?.access_token) {
          console.log('[Callback] Sending token to backend...')
          // Send to our backend to sync and set HTTP-only custom cookie
          const res = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: session.access_token }),
          })

          const result = await res.json()
          console.log('[Callback] Backend response:', { ok: res.ok, result })
          
          if (res.ok) {
            // Redirect straight to the user's dashboard/profile
            router.push(`/profile/${result.username}`)
          } else {
            setError(result.error || 'Failed to sync Google login')
          }
        } else {
          console.log('[Callback] No access token found')
        }
      } catch (err: any) {
        console.error('[Callback] Error:', err)
        setError(err.message || 'An error occurred during authentication')
      }
    }

    // Set up a listener for the auth event that Supabase triggers when returning from Google
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Callback] Auth state change:', event, session ? 'Session exists' : 'No session')
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
