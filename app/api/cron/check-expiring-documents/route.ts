import { NextRequest, NextResponse } from 'next/server'
import { checkExpiringDocuments } from '@/lib/actions/notifications'

export async function GET(request: NextRequest) {
  try {
    // Verificar que la request viene de un cron job válido
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET || 'test-secret'}`
    
    // En desarrollo, permitir test-secret si CRON_SECRET no está configurado
    if (authHeader !== expectedAuth) {
      console.error('Auth failed:', { authHeader, expectedAuth })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Starting checkExpiringDocuments cron job...')
    const result = await checkExpiringDocuments()
    
    console.log('checkExpiringDocuments completed:', result)
    
    return NextResponse.json({
      success: true,
      message: 'Expiring documents check completed',
      data: result
    })
  } catch (error) {
    console.error('Error in check-expiring-documents cron:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
