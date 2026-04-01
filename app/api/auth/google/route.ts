import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      console.error('[Google Auth] No token provided')
      return NextResponse.json({ error: 'No token provided' }, { status: 400 })
    }

    console.log('[Google Auth] Verifying token with Supabase...')
    // Verify token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      console.error('[Google Auth] Invalid token:', authError)
      return NextResponse.json({ error: 'Invalid Google token' }, { status: 401 })
    }

    console.log('[Google Auth] User authenticated:', user.email)
    const email = user.email
    if (!email) {
      console.error('[Google Auth] No email in user data')
      return NextResponse.json({ error: 'Google account has no email' }, { status: 400 })
    }

    // Check if user already exists
    let dbUser = await prisma.user.findUnique({
      where: { email }
    })

    if (!dbUser) {
      console.log('[Google Auth] Creating new user for:', email)
      // Check if username from email is already taken
      let baseUsername = 'dark_' + Math.floor(Math.random() * 10000)
      
      let finalUsername = baseUsername
      let counter = 1
      while (await prisma.user.findUnique({ where: { username: finalUsername } })) {
        finalUsername = `${baseUsername}${counter}`
        counter++
      }

      // Create new user linked to this Google email
      dbUser = await prisma.user.create({
        data: {
          username: finalUsername,
          email: email,
          authProvider: 'google',
        },
      })
      console.log('[Google Auth] Created user:', dbUser.username)
    } else {
      console.log('[Google Auth] Existing user:', dbUser.username)
    }

    // User is verified, create your custom auth cookie
    console.log('[Google Auth] Generating auth token...')
    const authToken = generateToken(dbUser.id, dbUser.username)
    
    // Create response with user data
    const response = NextResponse.json({ success: true, username: dbUser.username })
    
    // Set auth cookie on the response
    response.cookies.set('auth-token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    console.log('[Google Auth] Success! User:', dbUser.username)
    return response
  } catch (error) {
    console.error('[Google Auth] Error:', error)
    console.error('[Google Auth] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('[Google Auth] Error name:', error instanceof Error ? error.name : 'Unknown')
    console.error('[Google Auth] Error message:', error instanceof Error ? error.message : String(error))
    
    return NextResponse.json({ 
      error: 'Internal server error', 
      ...(process.env.NODE_ENV === 'development' ? {
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      } : {})
    }, { status: 500 })
  }
}
