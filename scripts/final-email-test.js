// Script final para probar el envío de emails
// Ejecutar con: node scripts/final-email-test.js

const { Resend } = require('resend')
require('dotenv').config({ path: '.env.local' })

async function finalEmailTest() {
  console.log('📧 Prueba final de envío de emails...\n')

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    // Probar envío con dominio por defecto
    console.log('📅 Enviando email con dominio por defecto de Resend...')
    
    const emailResponse = await resend.emails.send({
      from: 'Lex Realis <onboarding@resend.dev>',
      to: ['sleon@slfabogados.cl'],
      subject: '🧪 Prueba Final - Sistema Lex Realis',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #BF7F11, #D4A574); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🏢 Lex Realis</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #BF7F11; margin-top: 0;">🧪 Prueba Final del Sistema</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #BF7F11;">
              <h3 style="margin-top: 0; color: #333;">Email de Prueba Final</h3>
              <p style="margin: 10px 0; color: #666;">
                <strong>Fecha:</strong> ${new Date().toLocaleDateString('es-CL')}
              </p>
              <p style="margin: 10px 0; color: #666;">
                <strong>Hora:</strong> ${new Date().toLocaleTimeString('es-CL')}
              </p>
              <p style="margin: 10px 0; color: #666;">
                <strong>Remitente:</strong> onboarding@resend.dev
              </p>
              <p style="margin: 10px 0; color: #666;">
                <strong>Destinatario:</strong> sleon@slfabogados.cl
              </p>
            </div>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #155724;">
                <strong>✅ Sistema funcionando:</strong> Este email se envió usando el dominio por defecto de Resend.
              </p>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>📋 Información técnica:</strong><br>
                • API Key: ${process.env.RESEND_API_KEY ? 'Configurada' : 'NO CONFIGURADA'}<br>
                • Dominio: onboarding@resend.dev<br>
                • Timestamp: ${new Date().toISOString()}
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #666; font-size: 14px; text-align: center;">
              Este es un mensaje de prueba del sistema Lex Realis.<br>
              Si recibes este email, el sistema está funcionando correctamente.
            </p>
          </div>
        </div>
      `
    })

    console.log('✅ Email enviado exitosamente')
    console.log('📧 Respuesta completa:', JSON.stringify(emailResponse, null, 2))

    if (emailResponse.data) {
      console.log(`📧 ID del email: ${emailResponse.data.id || 'No disponible'}`)
      console.log(`📧 Status: ${emailResponse.data.status || 'Enviado'}`)
    }

    if (emailResponse.error) {
      console.log('❌ Error en la respuesta:', emailResponse.error)
    }

    console.log('\n' + '='.repeat(50) + '\n')
    console.log('📋 PRÓXIMOS PASOS:')
    console.log('1. Revisa la bandeja de entrada de sleon@slfabogados.cl')
    console.log('2. Si no aparece, revisa la carpeta de spam')
    console.log('3. Si no llega, verifica la API Key en Resend Dashboard')
    console.log('4. Verifica que el email sleon@slfabogados.cl sea válido')

  } catch (error) {
    console.error('❌ Error al enviar email:', error.message)
    console.log('\n🔍 Información del error:')
    console.log('Error completo:', error)
    
    if (error.message.includes('Invalid API key')) {
      console.log('\n💡 SOLUCIÓN:')
      console.log('1. Ve a https://resend.com/api-keys')
      console.log('2. Verifica que la API Key sea correcta')
      console.log('3. Si es incorrecta, crea una nueva API Key')
      console.log('4. Actualiza el archivo .env.local')
    }
  }
}

// Ejecutar la prueba final
finalEmailTest().catch(console.error)
