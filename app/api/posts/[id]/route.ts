import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            retweets: true,
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...post,
      likeCount: post._count.likes,
      commentCount: post._count.comments,
      retweetCount: post._count.retweets,
      _count: undefined,
    })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: postId } = await params
    
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }
    const { content } = body

    // Validate content
    const trimmedContent = content?.trim() || ''

    if (trimmedContent.length === 0) {
      return NextResponse.json(
        { error: 'Post content cannot be empty' },
        { status: 400 }
      )
    }

    if (trimmedContent.length > 500) {
      return NextResponse.json(
        { error: 'Post must be 500 characters or less' },
        { status: 400 }
      )
    }

    // Atomic update with ownership check to prevent TOCTOU
    const updatedPost = await prisma.post.update({
      where: { 
        id: postId,
        authorId: user.userId,
      },
      data: {
        content: trimmedContent,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    })

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: postId } = await params

    // Atomic delete with ownership check to prevent TOCTOU
    try {
      await prisma.post.delete({
        where: { 
          id: postId,
          authorId: user.userId,
        },
      })
    } catch (error: any) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Post not found or you do not have permission to delete it' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}
