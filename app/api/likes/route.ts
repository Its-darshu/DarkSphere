import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId, commentId } = await request.json()

    if (!postId && !commentId) {
      return NextResponse.json(
        { error: 'Post ID or Comment ID is required' },
        { status: 400 }
      )
    }

    // Check if already liked
    const existingLike = await prisma.like.findFirst({
      where: {
        userId: user.userId,
        ...(postId ? { postId } : { commentId }),
      },
    })

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id },
      })

      return NextResponse.json(
        { message: 'Like removed', liked: false },
        { status: 200 }
      )
    } else {
      // Like - Check if user owns the post/comment
      if (postId) {
        const post = await prisma.post.findUnique({
          where: { id: postId },
          select: { authorId: true },
        })

        if (!post) {
          return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }

        if (user.userId === post.authorId) {
          return NextResponse.json(
            { error: 'You cannot like your own posts' },
            { status: 400 }
          )
        }
      } else if (commentId) {
        const comment = await prisma.comment.findUnique({
          where: { id: commentId },
          select: { authorId: true },
        })

        if (!comment) {
          return NextResponse.json(
            { error: 'Comment not found' },
            { status: 404 }
          )
        }

        if (user.userId === comment.authorId) {
          return NextResponse.json(
            { error: 'You cannot like your own comments' },
            { status: 400 }
          )
        }
      }

      await prisma.like.create({
        data: {
          userId: user.userId,
          ...(postId ? { postId } : { commentId }),
        },
      })

      return NextResponse.json(
        { message: postId ? 'Post liked' : 'Comment liked', liked: true },
        { status: 201 }
      )
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromToken()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')
    const commentId = searchParams.get('commentId')

    if (!postId && !commentId) {
      return NextResponse.json(
        { error: 'Post ID or Comment ID is required' },
        { status: 400 }
      )
    }

    const like = await prisma.like.findFirst({
      where: {
        userId: user.userId,
        ...(postId ? { postId } : { commentId }),
      },
    })

    if (!like) {
      return NextResponse.json({ error: 'Like not found' }, { status: 404 })
    }

    await prisma.like.delete({
      where: { id: like.id },
    })

    return NextResponse.json({ message: 'Like removed' })
  } catch (error) {
    console.error('Error removing like:', error)
    return NextResponse.json(
      { error: 'Failed to remove like' },
      { status: 500 }
    )
  }
}
