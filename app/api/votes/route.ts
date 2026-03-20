import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getLocalDateString } from '@/lib/dateUtils'

export async function POST(request: NextRequest) {
  try {
    const { jokeId, value } = await request.json()

    if (!jokeId) {
      return NextResponse.json(
        { error: 'Joke ID is required' },
        { status: 400 }
      )
    }

    if (![1, -1, 0].includes(value)) {
      return NextResponse.json(
        { error: 'Vote value must be 1 (upvote), -1 (downvote), or 0 (remove)' },
        { status: 400 }
      )
    }

    const today = getLocalDateString()

    // Get or generate a persistent user identifier
    // In a real app, this should come from session/auth
    // For now, use IP + user-agent hash as a temporary solution
    const clientIp =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'anonymous'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    // Create a simple hash for the user ID (in production, use crypto.subtle.digest)
    const userId = `${clientIp}-${Buffer.from(userAgent).toString('base64').slice(0, 20)}`

    if (value === 0) {
      // Remove vote
      await prisma.vote.deleteMany({
        where: {
          jokeId,
          userId,
          voteDate: today,
        },
      })
    } else {
      // Create or update vote
      await prisma.vote.upsert({
        where: {
          jokeId_userId_voteDate: {
            jokeId,
            userId,
            voteDate: today,
          },
        },
        update: {
          value,
        },
        create: {
          jokeId,
          userId,
          value,
          voteDate: today,
        },
      })
    }

    // Get updated joke with new vote count
    const updatedJoke = await prisma.joke.findUnique({
      where: { id: jokeId },
      include: {
        votes: {
          where: {
            voteDate: today,
          },
        },
      },
    })

    if (!updatedJoke) {
      return NextResponse.json(
        { error: 'Joke not found' },
        { status: 404 }
      )
    }

    const score = updatedJoke.votes.reduce((sum, v) => sum + v.value, 0)

    return NextResponse.json({
      ...updatedJoke,
      score,
      voteCount: updatedJoke.votes.length,
    })
  } catch (error) {
    console.error('Error voting:', error)
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    )
  }
}

function getToday(): string {
  return getLocalDateString()
}
