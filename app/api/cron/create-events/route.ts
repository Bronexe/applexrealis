// API route para crear eventos de notificaciones (cron job)
import { NextRequest, NextResponse } from 'next/server'
import { createAllNotificationEvents } from '@/lib/actions/notification-events'

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

    console.log('Starting notification events creation cron job...')

    // Crear todos los eventos de notificación
    const result = await createAllNotificationEvents()

    console.log('Notification events creation completed:', result)

    return NextResponse.json({
      success: true,
      message: 'Notification events creation completed',
      ...result
    })

  } catch (error) {
    console.error('Error in notification events creation cron job:', error)
    
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
    console.log('Testing notification events creation endpoint...')

    const result = await createAllNotificationEvents()

    return NextResponse.json({
      success: true,
      message: 'Test completed',
      ...result
    })

  } catch (error) {
    console.error('Error in notification events creation test:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
