import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Database } from '@/lib/database'
import { Validator, ValidationRules, RateLimiter } from '@/lib/validation'

// Rate limiter for login attempts (5 attempts per 15 minutes)
const loginRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5
});

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    
    // Check rate limit
    if (!loginRateLimiter.isAllowed(clientIP)) {
      return NextResponse.json({ 
        error: 'Too many login attempts. Please try again later.' 
      }, { status: 429 });
    }

    const body = await request.json();

    // Validate input
    const validator = Validator.create(body).rules([
      ...ValidationRules.auth.login,
      { field: 'rememberMe', type: 'boolean' as const }
    ]);

    const validation = validator.validate();
    if (!validation.isValid) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validation.errors 
      }, { status: 400 });
    }

    const { username, password, rememberMe = false } = validation.sanitizedData!;

    // Check if user exists (use email field for username since our validation expects email)
    const user = await Database.getUserByEmail(username) || await Database.getUserByUsername(username);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Generate JWT token
    const tokenExpiry = rememberMe ? '30d' : '24h' // 30 days if remember me, 24 hours otherwise
    const token = jwt.sign(
      { 
        userId: user.id,
        username: user.username,
        userType: user.user_type
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: tokenExpiry }
    )

    // Return user data and token (excluding password)
    const { password_hash, ...userWithoutPassword } = user
    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token,
      expiresIn: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // milliseconds
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}