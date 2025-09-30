import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// Initialize database connection
const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const { postId, userId } = await request.json();

    if (!postId || !userId) {
      return NextResponse.json({ 
        error: 'Post ID and User ID are required' 
      }, { status: 400 });
    }

    // Check if user already liked this post
    const existingLike = await sql`
      SELECT * FROM likes WHERE post_id = ${postId} AND user_id = ${userId}
    `;

    let isLiked = false;
    let likesCount = 0;

    if (existingLike.length > 0) {
      // Unlike - remove the like
      await sql`DELETE FROM likes WHERE post_id = ${postId} AND user_id = ${userId}`;
      isLiked = false;
    } else {
      // Like - add the like
      await sql`INSERT INTO likes (post_id, user_id) VALUES (${postId}, ${userId})`;
      isLiked = true;
    }

    // Get updated likes count
    const likesResult = await sql`SELECT COUNT(*) as count FROM likes WHERE post_id = ${postId}`;
    likesCount = parseInt(likesResult[0].count);

    // Update the post's likes_count
    await sql`UPDATE posts SET likes_count = ${likesCount} WHERE id = ${postId}`;

    return NextResponse.json({
      success: true,
      isLiked,
      likesCount,
      postId
    });

  } catch (error) {
    console.error('Like/unlike error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const userId = searchParams.get('userId');

    if (!postId || !userId) {
      return NextResponse.json({ 
        error: 'Post ID and User ID are required' 
      }, { status: 400 });
    }

    // Check if user liked this post
    const existingLike = await sql`
      SELECT * FROM likes WHERE post_id = ${postId} AND user_id = ${userId}
    `;

    // Get total likes count
    const likesResult = await sql`SELECT COUNT(*) as count FROM likes WHERE post_id = ${postId}`;
    const likesCount = parseInt(likesResult[0].count);

    return NextResponse.json({
      isLiked: existingLike.length > 0,
      likesCount,
      postId
    });

  } catch (error) {
    console.error('Get like status error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}