import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/database'
import { Validator, ValidationRules, RateLimiter } from '@/lib/validation'
import { CachedDatabase } from '@/lib/performance'
import { PerformanceMonitor } from '@/lib/error-handling'

// Rate limiter for post creation (10 posts per hour)
const postCreationRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10
});

export async function GET(request: NextRequest) {
  const stopTimer = PerformanceMonitor.startTimer('get_posts_api');
  
  try {
    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100); // Max 100 posts
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

    // Use cached database for better performance
    const posts = await CachedDatabase.getAllPosts(limit, offset);
    
    return NextResponse.json({ 
      posts,
      pagination: {
        limit,
        offset,
        hasMore: posts.length === limit
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    stopTimer();
  }
}

export async function POST(request: NextRequest) {
  const stopTimer = PerformanceMonitor.startTimer('create_post_api');
  
  try {
    const body = await request.json();

    // Simple validation instead of strict validation
    if (!body.content || !body.authorId) {
      return NextResponse.json({ 
        error: 'Content and author ID are required' 
      }, { status: 400 });
    }

    if (body.content.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Post content cannot be empty' 
      }, { status: 400 });
    }

    if (body.content.length > 2000) {
      return NextResponse.json({ 
        error: 'Post content is too long (max 2000 characters)' 
      }, { status: 400 });
    }

    const content = body.content.trim();
    const author_id = body.authorId;

    // Verify author exists
    const author = await Database.getUserById(author_id);
    if (!author) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    }

    const post = await Database.createPost({ content, author_id });
    
    // Invalidate post cache since we added a new post
    CachedDatabase.invalidatePostCache();
    
    return NextResponse.json({ 
      success: true,
      post 
    });

  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  } finally {
    stopTimer();
  }
}