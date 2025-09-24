import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/database';
import { Auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, username, securityKey } = await request.json();

    // Validate input
    if (!email || !password || !fullName || !username || !securityKey) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!Auth.validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate username format
    if (!Auth.validateUsername(username)) {
      return NextResponse.json(
        { error: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = Auth.validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: 'Password requirements not met', details: passwordValidation.errors },
        { status: 400 }
      );
    }

    // Check if security key exists and is valid
    const keyRecord = await Database.getSecurityKeyByValue(securityKey);
    if (!keyRecord) {
      return NextResponse.json(
        { error: 'Invalid security key' },
        { status: 400 }
      );
    }

    if (keyRecord.is_used) {
      return NextResponse.json(
        { error: 'Security key has already been used' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUserByEmail = await Database.getUserByEmail(email);
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const existingUserByUsername = await Database.getUserByUsername(username);
    if (existingUserByUsername) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await Auth.hashPassword(password);

    // Create user
    const newUser = await Database.createUser({
      username,
      email,
      password_hash: passwordHash,
      full_name: fullName,
      user_type: keyRecord.key_type
    });

    // Mark security key as used
    await Database.useSecurityKey(securityKey, newUser.id);

    // Generate JWT token
    const token = Auth.generateToken({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      fullName: newUser.full_name,
      userType: newUser.user_type
    });

    // Create response with httpOnly cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.full_name,
        type: newUser.user_type,
        createdAt: newUser.created_at
      }
    });

    // Set httpOnly cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}