import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/database';

export async function GET() {
  try {
    // Get all posts for debugging
    const posts = await Database.getAllPosts(10, 0);
    
    return NextResponse.json({
      success: true,
      count: posts.length,
      posts: posts.map(post => ({
        id: post.id,
        content: post.content,
        author_id: post.author_id,
        created_at: post.created_at,
        author: post.author ? {
          username: post.author.username,
          full_name: post.author.full_name
        } : null
      }))
    });

  } catch (error) {
    console.error('Debug posts error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch posts',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      received: {
        content: body.content,
        authorId: body.authorId,
        contentType: typeof body.content,
        authorIdType: typeof body.authorId,
        contentLength: body.content?.length || 0,
        isEmpty: !body.content || body.content.trim().length === 0
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}