import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    console.log(`🗑️ Deleting user with ID: ${userId}`)

    // Begin transaction to delete user and all associated data
    
    // 1. Delete user's posts (this will cascade to delete comments and likes)
    const deletedPosts = await sql`
      DELETE FROM posts 
      WHERE author_id = ${userId}
    `
    console.log(`🗑️ Deleted ${deletedPosts.length} posts for user ${userId}`)

    // 2. Delete user's comments
    const deletedComments = await sql`
      DELETE FROM comments 
      WHERE author_id = ${userId}
    `
    console.log(`🗑️ Deleted ${deletedComments.length} comments for user ${userId}`)

    // 3. Delete user's likes
    const deletedLikes = await sql`
      DELETE FROM likes 
      WHERE user_id = ${userId}
    `
    console.log(`🗑️ Deleted ${deletedLikes.length} likes for user ${userId}`)

    // 4. Mark security key as unused if user had one
    await sql`
      UPDATE security_keys 
      SET is_used = false, used_by = null, used_at = null
      WHERE used_by = ${userId}
    `
    console.log(`🔑 Released security key for user ${userId}`)

    // 5. Finally, delete the user
    const deletedUser = await sql`
      DELETE FROM users 
      WHERE id = ${userId}
      RETURNING username, full_name
    `

    if (deletedUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log(`✅ Successfully deleted user: ${deletedUser[0].full_name} (@${deletedUser[0].username})`)

    return NextResponse.json({
      message: 'User successfully deleted',
      deletedUser: {
        username: deletedUser[0].username,
        fullName: deletedUser[0].full_name
      }
    })

  } catch (error) {
    console.error('❌ Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}