import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/database'

export async function GET() {
  try {
    const announcements = await Database.getAllAnnouncements()
    return NextResponse.json({ announcements })
  } catch (error) {
    console.error('Get announcements error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, type, createdBy } = await request.json()

    if (!title || !content || !createdBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const announcement = await Database.createAnnouncement({
      title,
      content,
      announcement_type: type || 'info',
      created_by: createdBy
    })

    return NextResponse.json({ announcement })

  } catch (error) {
    console.error('Create announcement error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}