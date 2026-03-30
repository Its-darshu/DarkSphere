import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateToken, setAuthCookie } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 400 })
    }

    // Verify token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid Google token' }, { status: 401 })
    }

    const email = user.email
    if (!email) {
      return NextResponse.json({ error: 'Google account has no email' }, { status: 400 })
    }

    // Check if user already exists
    let dbUser = await prisma.user.findUnique({
      where: { email }
    })

    if (!dbUser) {
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
    }

    // User is verified, create your custom auth cookie
    const authToken = generateToken(dbUser.id, dbUser.username)
    await setAuthCookie(authToken)

    return NextResponse.json({ success: true, username: dbUser.username })
  } catch (error) {
    console.error('Google sync error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
