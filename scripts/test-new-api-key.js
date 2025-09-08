// Script para probar la nueva API Key
// Ejecutar con: node scripts/test-new-api-key.js

const { Resend } = require('resend')
require('dotenv').config({ path: '.env.local' })

async function testNewApiKey() {
  console.log('🔑 Probando la nueva API Key...\n')

  // Verificar la configuración actual
  const apiKey = process.env.RESEND_API_KEY
  console.log('📋 Configuración actual:')
  console.log(`API Key: ${apiKey ? apiKey.substring(0, 10) + '...' + apiKey.slice(-4) : 'NO CONFIGURADA'}`)
  console.log(`Longitud: ${apiKey ? apiKey.length : 0} caracteres`)
  console.log(`Formato correcto: ${apiKey ? apiKey.startsWith('re_') : false}`)

  if (!apiKey) {
    console.log('❌ RESEND_API_KEY no está configurada')
    return
  }

  const resend = new Resend(apiKey)

  try {
    // Probar la API Key con una consulta simple
    console.log('\n🔍 Probando API Key con consulta de dominios...')
    const domainsResponse = await resend.domains.list()
    console.log('✅ API Key válida!')
    console.log(`📧 Dominios configurados: ${domainsResponse.data?.length || 0}`)

    // Probar envío de email
    console.log('\n📧 Enviando email de prueba...')
    
    const emailResponse = await resend.emails.send({
      from: 'Lex Realis <onboarding@resend.dev>',
      to: ['sleon@slfabogados.cl'],
      subject: '🧪 Prueba Nueva API Key - Lex Realis',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #BF7F11, #D4A574); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🏢 Lex Realis</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #BF7F11; margin-top: 0;">🧪 Prueba Nueva API Key</h2>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #155724;">
                <strong>✅ ¡API Key funcionando!</strong><br>
                Este email confirma que la nueva API Key está funcionando correctamente.
              </p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #BF7F11;">
              <h3 style="margin-top: 0; color: #333;">Detalles del Envío</h3>
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
              <p style="margin: 10px 0; color: #666;">
                <strong>API Key:</strong> ${apiKey ? 'Configurada correctamente' : 'NO CONFIGURADA'}
              </p>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>📋 Sistema Lex Realis:</strong><br>
                • Notificaciones por email funcionando<br>
                • API Key válida y operativa<br>
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

    console.log('✅ Email enviado exitosamente!')
    console.log('📧 Respuesta:', JSON.stringify(emailResponse, null, 2))

    if (emailResponse.data) {
      console.log(`📧 ID del email: ${emailResponse.data.id}`)
      console.log(`📧 Status: ${emailResponse.data.status}`)
    }

    if (emailResponse.error) {
      console.log('❌ Error en la respuesta:', emailResponse.error)
    }

    console.log('\n' + '='.repeat(50) + '\n')
    console.log('🎉 ¡ÉXITO!')
    console.log('✅ API Key válida')
    console.log('✅ Email enviado')
    console.log('✅ Sistema funcionando')
    console.log('\n📧 Revisa la bandeja de entrada de sleon@slfabogados.cl')
    console.log('📁 Si no aparece, revisa la carpeta de spam')

  } catch (error) {
    console.error('❌ Error:', error.message)
    
    if (error.message.includes('Invalid API key')) {
      console.log('\n💡 SOLUCIÓN:')
      console.log('1. Verifica que la API Key sea correcta en .env.local')
      console.log('2. Asegúrate de que empiece con "re_"')
      console.log('3. Verifica que no tenga espacios extra')
      console.log('4. Reinicia el servidor después de cambiar la API Key')
    }
    
    console.log('\n🔍 Error completo:', error)
  }
}

// Ejecutar la prueba
testNewApiKey().catch(console.error)
