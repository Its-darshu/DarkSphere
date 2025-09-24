import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/database';
import { Auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const posts = await Database.getAllPosts(limit, offset);
    
    // Get user's liked posts if authenticated
    const user = Auth.getUserFromRequest(request);
    let userLikes: string[] = [];
    
    if (user) {
      userLikes = await Database.getUserPostLikes(user.id);
    }

    // Transform posts to include like status
    const transformedPosts = posts.map(post => ({
      id: post.id,
      content: post.content,
      author: post.author?.full_name || 'Unknown',
      authorId: post.author_id,
      username: post.author?.username || 'unknown',
      timestamp: post.created_at,
      likes: post.likes_count,
      comments: post.comments_count,
      likedBy: userLikes.includes(post.id) ? [user?.id].filter(Boolean) : []
    }));

    return NextResponse.json({
      success: true,
      posts: transformedPosts,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit
      }
    });

  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = Auth.getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Post content is required' },
        { status: 400 }
      );
    }

    if (content.length > 500) {
      return NextResponse.json(
        { error: 'Post content must be 500 characters or less' },
        { status: 400 }
      );
    }

    // Create post
    const newPost = await Database.createPost({
      content: content.trim(),
      author_id: user.id
    });

    // Get user details for response
    const userDetails = await Database.getUserById(user.id);

    return NextResponse.json({
      success: true,
      post: {
        id: newPost.id,
        content: newPost.content,
        author: userDetails?.full_name || user.fullName,
        authorId: newPost.author_id,
        username: userDetails?.username || user.username,
        timestamp: newPost.created_at,
        likes: 0,
        comments: 0,
        likedBy: []
      }
    });

  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}