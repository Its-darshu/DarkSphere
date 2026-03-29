import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { prisma } from './prisma'

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10)
  return bcryptjs.hash(password, salt)
}

// Compare password with hash
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcryptjs.compare(password, hash)
}

// Generate JWT token
export function generateToken(userId: string, username: string): string {
  const secret = process.env.NEXTAUTH_SECRET

  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not set in environment variables')
  }

  return jwt.sign({ userId, username }, secret, { expiresIn: '7d' })
}

// Verify JWT token
export function verifyToken(token: string): { userId: string; username: string } | null {
  const secret = process.env.NEXTAUTH_SECRET

  if (!secret) {
    console.error('NEXTAUTH_SECRET is not set')
    return null
  }

  try {
    const decoded = jwt.verify(token, secret) as unknown

    // Validate the decoded payload has the expected shape
    if (
      typeof decoded === 'object' &&
      decoded !== null &&
      'userId' in decoded &&
      'username' in decoded &&
      typeof (decoded as any).userId === 'string' &&
      typeof (decoded as any).username === 'string'
    ) {
      return {
        userId: (decoded as any).userId,
        username: (decoded as any).username,
      }
    }

    return null
  } catch (error) {
    return null
  }
}

// Set auth cookie
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

// Get auth token from cookies
export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('auth-token')?.value || null
}

// Clear auth cookie
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
}

// Extract user from token (for API routes)
export async function getUserFromToken(): Promise<{ userId: string; username: string } | null> {
  const token = await getAuthToken()
  if (!token) return null
  return verifyToken(token)
}

// Check if user is admin
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })
    return user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN'
  } catch (error) {
    return false
  }
}
