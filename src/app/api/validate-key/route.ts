import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { securityKey } = await request.json()

    if (!securityKey) {
      return NextResponse.json({ error: 'Security key is required' }, { status: 400 })
    }

    console.log('🔍 Validating security key:', securityKey)
    
    // Get security key from database
    const keyData = await Database.getSecurityKeyByValue(securityKey)
    
    if (!keyData) {
      console.log('❌ Security key not found')
      return NextResponse.json({ 
        valid: false, 
        error: 'Security key not found' 
      }, { status: 404 })
    }
    
    if (keyData.is_used) {
      console.log('❌ Security key already used')
      return NextResponse.json({ 
        valid: false, 
        error: 'Security key has already been used' 
      }, { status: 400 })
    }
    
    console.log('✅ Security key is valid:', keyData.key_type)
    return NextResponse.json({ 
      valid: true, 
      keyType: keyData.key_type,
      message: 'Security key is valid'
    })

  } catch (error) {
    console.error('❌ Security key validation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}