import { NextRequest, NextResponse } from 'next/server'

export async function POST(_request: NextRequest) {
  try {
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    )

    // Clear auth cookie with matching path attribute
    response.cookies.delete({
      name: 'auth-token',
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    )
  }
}
