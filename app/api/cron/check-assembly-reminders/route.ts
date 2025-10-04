import { NextRequest, NextResponse } from 'next/server'
import { checkAssemblyReminders } from '@/lib/actions/notifications'

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

    console.log('Starting checkAssemblyReminders cron job...')
    const result = await checkAssemblyReminders()
    
    console.log('checkAssemblyReminders completed:', result)
    
    return NextResponse.json({
      success: true,
      message: 'Assembly reminders check completed',
      data: result
    })
  } catch (error) {
    console.error('Error in check-assembly-reminders cron:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
