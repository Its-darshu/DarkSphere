import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/database'
import crypto from 'crypto'

export async function GET() {
  try {
    const keys = await Database.getAllSecurityKeys()
    return NextResponse.json({ keys })
  } catch (error) {
    console.error('Get security keys error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { count, keyType } = await request.json()

    if (!count || !keyType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Generate security keys
    const keys = Array.from({ length: count }, () => ({
      key_value: crypto.randomBytes(16).toString('hex').toUpperCase(),
      key_type: keyType as 'admin' | 'user'
    }))

    const createdKeys = await Database.createSecurityKeys(keys)
    return NextResponse.json({ keys: createdKeys })

  } catch (error) {
    console.error('Create security keys error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { keyId } = await request.json()

    if (!keyId) {
      return NextResponse.json({ error: 'Key ID required' }, { status: 400 })
    }

    const deleted = await Database.deleteSecurityKey(keyId)
    
    if (!deleted) {
      return NextResponse.json({ error: 'Key not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete security key error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}