'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Logo & Title */}
        <div className="mb-12">
          <h1 className="text-6xl font-bold text-white mb-4">🌑 DarkSphere</h1>
          <p className="text-xl text-slate-300 mb-6">
            A Twitter-like social platform for sharing your thoughts
          </p>
          <p className="text-slate-400">
            Connect with friends, share your ideas, and join the conversation
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="text-lg font-semibold text-white mb-2">Share Your Thoughts</h3>
            <p className="text-slate-400 text-sm">
              Post what's on your mind and express yourself freely
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="text-3xl mb-3">👥</div>
            <h3 className="text-lg font-semibold text-white mb-2">Connect</h3>
            <p className="text-slate-400 text-sm">
              Follow friends and discover new voices in your community
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="text-3xl mb-3">❤️</div>
            <h3 className="text-lg font-semibold text-white mb-2">Engage</h3>
            <p className="text-slate-400 text-sm">
              Like, comment, and retweet to participate in conversations
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center">
          <Link
            href="/signup"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Create Account
          </Link>
          <Link
            href="/signin"
            className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Sign In
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-16 text-slate-500 text-sm">
          <p>Built with Next.js, PostgreSQL, and Supabase</p>
        </div>
      </div>
    </div>
  )
}
