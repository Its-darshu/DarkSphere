import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/database'

export async function GET() {
  try {
    const posts = await Database.getAllPosts()
    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Get posts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content, authorId } = await request.json()

    if (!content || !authorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const post = await Database.createPost({ content, author_id: authorId })
    return NextResponse.json({ post })

  } catch (error) {
    console.error('Create post error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}