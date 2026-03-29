import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const admin = verifyToken(token)
    if (!admin) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if admin is SUPER_ADMIN
    const adminUser = await prisma.user.findUnique({
      where: { id: admin.userId },
      select: { role: true },
    })

    if (adminUser?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only Super Admin can change roles' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { role } = body

    // Validate role
    if (role !== null && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { role },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    )
  }
}
