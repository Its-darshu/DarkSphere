import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || getToday()

    // Get jokes sorted by votes for today, fresh jokes on top
    const jokes = await prisma.joke.findMany({
      where: {
        createdAt: {
          gte: new Date(date),
          lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
        },
      },
      include: {
        votes: {
          where: {
            voteDate: date,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        {
          votes: {
            _count: 'desc',
          },
        },
        {
          createdAt: 'desc',
        },
      ],
    })

    // Calculate vote counts
    const jokesWithScores = jokes.map((joke) => ({
      ...joke,
      score: joke.votes.reduce((sum, vote) => sum + vote.value, 0),
      voteCount: joke.votes.length,
    }))

    return NextResponse.json(jokesWithScores)
  } catch (error) {
    console.error('Error fetching jokes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jokes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content, authorName } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Joke content cannot be empty' },
        { status: 400 }
      )
    }

    if (content.length > 500) {
      return NextResponse.json(
        { error: 'Joke must be 500 characters or less' },
        { status: 400 }
      )
    }

    // Get or create user
    let user = null
    if (authorName && authorName.trim().length > 0) {
      user = await prisma.user.upsert({
        where: { email: `anon-${Date.now()}@local` },
        update: {},
        create: {
          email: `anon-${Date.now()}@local`,
          name: authorName.substring(0, 50),
        },
      })
    }

    const joke = await prisma.joke.create({
      data: {
        content,
        authorId: user?.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(joke, { status: 201 })
  } catch (error) {
    console.error('Error creating joke:', error)
    return NextResponse.json(
      { error: 'Failed to create joke' },
      { status: 500 }
    )
  }
}

function getToday(): string {
  const today = new Date()
  return today.toISOString().split('T')[0]
}
