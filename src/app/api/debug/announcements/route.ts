import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/database';

export async function GET() {
  try {
    // Get all announcements for debugging
    const announcements = await Database.getAllAnnouncements();
    
    return NextResponse.json({
      success: true,
      count: announcements.length,
      announcements: announcements.map(announcement => ({
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        announcement_type: announcement.announcement_type,
        created_by: announcement.created_by,
        created_at: announcement.created_at,
        author: announcement.author ? {
          username: announcement.author.username,
          full_name: announcement.author.full_name
        } : null
      }))
    });

  } catch (error) {
    console.error('Debug announcements error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch announcements',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}