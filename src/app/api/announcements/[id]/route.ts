import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const announcementId = params.id

    console.log(`🗑️ Deleting announcement with ID: ${announcementId}`)

    const deletedAnnouncement = await sql`
      DELETE FROM announcements 
      WHERE id = ${announcementId}
      RETURNING title
    `

    if (deletedAnnouncement.length === 0) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      )
    }

    console.log(`✅ Successfully deleted announcement: ${deletedAnnouncement[0].title}`)

    return NextResponse.json({
      message: 'Announcement successfully deleted',
      deletedAnnouncement: {
        title: deletedAnnouncement[0].title
      }
    })

  } catch (error) {
    console.error('❌ Error deleting announcement:', error)
    return NextResponse.json(
      { error: 'Failed to delete announcement' },
      { status: 500 }
    )
  }
}