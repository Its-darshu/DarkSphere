import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }
    const { postId } = body

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Check if already retweeted
    const existingRetweet = await prisma.retweet.findFirst({
      where: {
        userId: user.userId,
        postId,
      },
    })

    if (existingRetweet) {
      // Undo retweet
      await prisma.retweet.delete({
        where: { id: existingRetweet.id },
      })

      return NextResponse.json(
        { message: 'Retweet removed', retweeted: false },
        { status: 200 }
      )
    } else {
      // Create retweet
      try {
        await prisma.retweet.create({
          data: {
            userId: user.userId,
            postId,
          },
        })
      } catch (createError: any) {
        if (createError.code === 'P2002') {
          // Unique constraint violation - already retweeted in race condition
          return NextResponse.json(
            { message: 'Post already retweeted', retweeted: true },
            { status: 200 }
          )
        }
        throw createError
      }

      return NextResponse.json(
        { message: 'Post retweeted', retweeted: true },
        { status: 201 }
      )
    }
  } catch (error) {
    console.error('Error toggling retweet:', error)
    return NextResponse.json(
      { error: 'Failed to toggle retweet' },
      { status: 500 }
    )
  }
}
