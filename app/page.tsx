'use client'

import { useState, useEffect } from 'react'
import PostJokeForm from '@/components/PostJokeForm'
import JokeCard from '@/components/JokeCard'

interface Joke {
  id: string
  content: string
  author?: {
    id: string
    name: string | null
  } | null
  score: number
  voteCount: number
}

export default function Home() {
  const [jokes, setJokes] = useState<Joke[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(getToday())

  useEffect(() => {
    fetchJokes()
  }, [selectedDate])

  const fetchJokes = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/jokes?date=${selectedDate}`)
      const data = await response.json()
      setJokes(data)
    } catch (error) {
      console.error('Failed to fetch jokes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePostJoke = async (content: string, authorName: string) => {
    try {
      const response = await fetch('/api/jokes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, authorName }),
      })

      if (!response.ok) {
        throw new Error('Failed to post joke')
      }

      const newJoke = await response.json()
      setJokes([newJoke, ...jokes])
    } catch (error) {
      console.error('Failed to post joke:', error)
      throw error
    }
  }

  const handleVote = async (jokeId: string, value: number) => {
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jokeId, value }),
      })

      if (!response.ok) {
        throw new Error('Failed to vote')
      }

      const updatedJoke = await response.json()

      // Update the joke in the list
      setJokes((prevJokes) =>
        prevJokes
          .map((j) => (j.id === jokeId ? updatedJoke : j))
          .sort((a, b) => b.score - a.score || b.voteCount - a.voteCount)
      )
    } catch (error) {
      console.error('Failed to vote:', error)
      throw error
    }
  }

  return (
    <main className="min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">😂 JokeSphere</h1>
          <p className="text-slate-400">Share and discover the funniest jokes</p>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between mb-6 bg-slate-800 border border-slate-700 rounded-lg p-3">
          <button
            onClick={() => {
              const prev = new Date(selectedDate)
              prev.setDate(prev.getDate() - 1)
              setSelectedDate(prev.toISOString().split('T')[0])
            }}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-all"
          >
            ← Previous
          </button>

          <span className="text-white font-semibold">
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </span>

          <button
            onClick={() => {
              const next = new Date(selectedDate)
              next.setDate(next.getDate() + 1)
              if (next <= new Date()) {
                setSelectedDate(next.toISOString().split('T')[0])
              }
            }}
            disabled={new Date(selectedDate) >= new Date()}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-all"
          >
            Next →
          </button>
        </div>

        {/* Post Form */}
        <PostJokeForm onSubmit={handlePostJoke} />

        {/* Jokes Feed */}
        <div>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-slate-400">Loading jokes...</p>
            </div>
          ) : jokes.length === 0 ? (
            <div className="text-center py-12 bg-slate-800 border border-slate-700 rounded-lg">
              <p className="text-slate-400 mb-4">No jokes yet for this day</p>
              <p className="text-slate-500 text-sm">Be the first to share a joke!</p>
            </div>
          ) : (
            <div>
              <div className="mb-4 text-slate-400 text-sm">
                {jokes.length} joke{jokes.length !== 1 ? 's' : ''} today
              </div>
              {jokes.map((joke) => (
                <JokeCard
                  key={joke.id}
                  {...joke}
                  onVote={handleVote}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-slate-500 text-sm">
          <p>Made with ❤️ for joke lovers everywhere</p>
        </div>
      </div>
    </main>
  )
}

function getToday(): string {
  const today = new Date()
  return today.toISOString().split('T')[0]
}
