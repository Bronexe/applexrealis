// API route para procesar notificaciones automáticas (cron job)
import { NextRequest, NextResponse } from 'next/server'
import { processAllPendingNotifications } from '@/lib/actions/notifications-automated'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación del cron job
    const authHeader = request.headers.get('authorization')
    const expectedSecret = process.env.CRON_SECRET

    if (!expectedSecret) {
      console.error('CRON_SECRET not configured')
      return NextResponse.json(
        { error: 'Cron secret not configured' },
        { status: 500 }
      )
    }

    if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
      console.error('Invalid cron secret')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Starting notification processing cron job...')

    // Procesar todas las notificaciones pendientes
    const result = await processAllPendingNotifications()

    console.log('Notification processing completed:', result)

    return NextResponse.json({
      success: true,
      message: 'Notification processing completed',
      ...result
    })

  } catch (error) {
    console.error('Error in notification processing cron job:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Permitir GET para testing
export async function GET(request: NextRequest) {
  try {
    console.log('Testing notification processing endpoint...')

    const result = await processAllPendingNotifications()

    return NextResponse.json({
      success: true,
      message: 'Test completed',
      ...result
    })

  } catch (error) {
    console.error('Error in notification processing test:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
