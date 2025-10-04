import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/services/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, title, message } = body

    if (!email || !title || !message) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email, título y mensaje son requeridos' 
        },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Formato de email inválido' 
        },
        { status: 400 }
      )
    }

    console.log('📧 Enviando email de prueba...')
    console.log('Para:', email)
    console.log('Título:', title)
    console.log('Mensaje:', message)

    // Enviar el email
    const result = await EmailService.sendGeneralNotification(
      email,
      title,
      message
    )

    console.log('✅ Email enviado exitosamente:', result)

    return NextResponse.json({
      success: true,
      message: 'Email enviado exitosamente',
      data: {
        to: email,
        messageId: result.messageId,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('❌ Error enviando email de prueba:', error)
    
    // Manejar errores específicos de Resend
    let errorMessage = 'Error desconocido al enviar el email'
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'API key de Resend inválida o no configurada. Verifica tu .env.local'
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Límite de emails excedido. Espera unos minutos e intenta de nuevo'
      } else if (error.message.includes('domain')) {
        errorMessage = 'Dominio no verificado en Resend. Verifica tu configuración'
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

