import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/database';

export async function GET() {
  try {
    // Get all users (for debugging only - remove in production)
    const users = await Database.getAllUsers();
    
    // Return users without sensitive data
    const safeUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      user_type: user.user_type,
      created_at: user.created_at
    }));

    return NextResponse.json({
      success: true,
      count: users.length,
      users: safeUsers
    });

  } catch (error) {
    console.error('Debug users error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch users',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}