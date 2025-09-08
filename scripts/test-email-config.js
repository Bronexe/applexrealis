// Script para verificar la configuración de email
// Ejecutar con: node scripts/test-email-config.js

const { Resend } = require('resend')
require('dotenv').config({ path: '.env.local' })

async function testEmailConfig() {
  console.log('🔍 Verificando configuración de email...\n')

  // Verificar variables de entorno
  const requiredVars = [
    'RESEND_API_KEY',
    'EMAIL_FROM',
    'NEXT_PUBLIC_APP_URL'
  ]

  console.log('📋 Variables de entorno requeridas:')
  for (const varName of requiredVars) {
    const value = process.env[varName]
    if (value) {
      console.log(`✅ ${varName}: ${varName === 'RESEND_API_KEY' ? '***' + value.slice(-4) : value}`)
    } else {
      console.log(`❌ ${varName}: NO CONFIGURADA`)
    }
  }

  // Verificar Resend
  if (!process.env.RESEND_API_KEY) {
    console.log('\n❌ RESEND_API_KEY no está configurada')
    return
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    // Verificar que la API Key es válida
    console.log('\n🔑 Verificando API Key de Resend...')
    
    // Intentar obtener información de la cuenta
    const response = await resend.domains.list()
    console.log('✅ API Key de Resend válida')
    console.log(`📧 Dominios configurados: ${response.data?.length || 0}`)
    
    // Probar envío de email de prueba
    console.log('\n📤 Enviando email de prueba...')
    
    const testEmail = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Lex Realis <noreply@lexrealis.com>',
      to: ['test@example.com'], // Cambiar por tu email real
      subject: '🧪 Prueba de configuración - Lex Realis',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #BF7F11, #D4A574); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🏢 Lex Realis</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #BF7F11; margin-top: 0;">🧪 Prueba de Configuración</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #BF7F11;">
              <p style="margin: 0; color: #333; line-height: 1.6;">
                ¡Excelente! La configuración de email está funcionando correctamente.
              </p>
            </div>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #155724;">
                <strong>✅ Configuración exitosa:</strong> El sistema de notificaciones por email está listo para usar.
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #666; font-size: 14px; text-align: center;">
              Este es un mensaje de prueba del sistema Lex Realis.<br>
              Si recibes este email, la configuración está funcionando correctamente.
            </p>
          </div>
        </div>
      `
    })

    console.log('✅ Email de prueba enviado exitosamente')
    console.log(`📧 ID del email: ${testEmail.data?.id}`)
    
  } catch (error) {
    console.log('❌ Error al verificar Resend:', error.message)
    
    if (error.message.includes('Invalid API key')) {
      console.log('💡 Solución: Verifica que la RESEND_API_KEY sea correcta')
    } else if (error.message.includes('domain')) {
      console.log('💡 Solución: Verifica que el dominio esté configurado en Resend')
    }
  }
}

// Ejecutar la verificación
testEmailConfig().catch(console.error)
