import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id
    const { userId, userType } = await request.json()

    console.log(`🗑️ Attempting to delete post ${postId} by user ${userId}`)

    // First, check if the post exists and get its author
    const postCheck = await sql`
      SELECT author_id FROM posts WHERE id = ${postId}
    `

    if (postCheck.length === 0) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    const postAuthorId = postCheck[0].author_id

    // Check authorization: user can delete their own posts, admins can delete any post
    if (userType !== 'admin' && postAuthorId !== userId) {
      return NextResponse.json(
        { error: 'Not authorized to delete this post' },
        { status: 403 }
      )
    }

    console.log(`✅ User authorized to delete post ${postId}`)

    // Delete related data first (comments, likes)
    await sql`DELETE FROM comments WHERE post_id = ${postId}`
    await sql`DELETE FROM likes WHERE post_id = ${postId}`
    
    // Delete the post
    const deletedPost = await sql`
      DELETE FROM posts 
      WHERE id = ${postId}
      RETURNING content, author_id
    `

    if (deletedPost.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete post' },
        { status: 500 }
      )
    }

    console.log(`✅ Successfully deleted post ${postId}`)

    return NextResponse.json({
      message: 'Post successfully deleted',
      deletedPost: {
        id: postId,
        content: deletedPost[0].content
      }
    })

  } catch (error) {
    console.error('❌ Error deleting post:', error)
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}