import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { jokeId, value } = await request.json()

    if (!jokeId) {
      return NextResponse.json(
        { error: 'Joke ID is required' },
        { status: 400 }
      )
    }

    if (![1, -1].includes(value)) {
      return NextResponse.json(
        { error: 'Vote value must be 1 (upvote) or -1 (downvote)' },
        { status: 400 }
      )
    }

    const today = getToday()
    const userId = `user-${request.headers.get('user-agent') || 'anonymous'}`

    // Create or update vote
    const vote = await prisma.vote.upsert({
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

    const score = updatedJoke?.votes.reduce((sum, v) => sum + v.value, 0) || 0

    return NextResponse.json({
      ...updatedJoke,
      score,
      voteCount: updatedJoke?.votes.length || 0,
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
  const today = new Date()
  return today.toISOString().split('T')[0]
}
