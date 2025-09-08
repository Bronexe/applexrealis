import { NextRequest, NextResponse } from 'next/server'
import { checkExpiringDocumentsSimple } from '@/lib/actions/notifications-simple'

export async function GET(request: NextRequest) {
  try {
    // Verificar que la request viene de un cron job válido
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Starting checkExpiringDocumentsSimple cron job...')
    const result = await checkExpiringDocumentsSimple()
    
    console.log('checkExpiringDocumentsSimple completed:', result)
    
    return NextResponse.json({
      success: true,
      message: 'Expiring documents check completed (simple version)',
      data: result
    })
  } catch (error) {
    console.error('Error in check-expiring-documents-simple cron:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
