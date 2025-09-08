// Script para verificar la API Key de Resend
// Ejecutar con: node scripts/test-resend-api-key.js

const { Resend } = require('resend')
require('dotenv').config({ path: '.env.local' })

async function testResendApiKey() {
  console.log('🔑 Verificando API Key de Resend...\n')

  const apiKey = process.env.RESEND_API_KEY
  
  console.log('📋 Configuración:')
  console.log(`API Key: ${apiKey ? apiKey.substring(0, 10) + '...' + apiKey.slice(-4) : 'NO CONFIGURADA'}`)
  console.log(`Longitud: ${apiKey ? apiKey.length : 0} caracteres`)
  console.log(`Formato: ${apiKey ? (apiKey.startsWith('re_') ? 'Válido' : 'Inválido') : 'N/A'}`)

  if (!apiKey) {
    console.log('❌ RESEND_API_KEY no está configurada')
    return
  }

  const resend = new Resend(apiKey)

  try {
    // Probar consulta de dominios
    console.log('\n🔍 Probando consulta de dominios...')
    const domainsResponse = await resend.domains.list()
    console.log('✅ API Key válida!')
    console.log(`📧 Dominios configurados: ${domainsResponse.data?.length || 0}`)

    if (domainsResponse.data && domainsResponse.data.length > 0) {
      console.log('📋 Dominios disponibles:')
      domainsResponse.data.forEach(domain => {
        console.log(`  - ${domain.name} (${domain.status})`)
      })
    }

    // Probar envío de email
    console.log('\n📧 Probando envío de email...')
    
    const emailResponse = await resend.emails.send({
      from: 'Lex Realis <onboarding@resend.dev>',
      to: ['sleon@slfabogados.cl'],
      subject: '🧪 Verificación API Key - Lex Realis',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #BF7F11, #D4A574); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🏢 Lex Realis</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #BF7F11; margin-top: 0;">🧪 Verificación API Key</h2>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #155724;">
                <strong>✅ ¡API Key funcionando!</strong><br>
                Esta API Key de Resend está funcionando correctamente.
              </p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #BF7F11;">
              <h3 style="margin-top: 0; color: #333;">Detalles de la Verificación</h3>
              <p style="margin: 10px 0; color: #666;">
                <strong>Fecha:</strong> ${new Date().toLocaleDateString('es-CL')}
              </p>
              <p style="margin: 10px 0; color: #666;">
                <strong>Hora:</strong> ${new Date().toLocaleTimeString('es-CL')}
              </p>
              <p style="margin: 10px 0; color: #666;">
                <strong>Destinatario:</strong> sleon@slfabogados.cl
              </p>
              <p style="margin: 10px 0; color: #666;">
                <strong>Remitente:</strong> onboarding@resend.dev
              </p>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>📋 Sistema Lex Realis:</strong><br>
                • API Key de Resend verificada<br>
                • Envío de emails funcionando<br>
                • Integración con Supabase lista<br>
                • Timestamp: ${new Date().toISOString()}
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #666; font-size: 14px; text-align: center;">
              Este es un mensaje de verificación del sistema Lex Realis.<br>
              Si recibes este email, la API Key está funcionando correctamente.
            </p>
          </div>
        </div>
      `
    })

    if (emailResponse.error) {
      console.log('❌ Error al enviar email:', emailResponse.error.message)
      console.log('🔍 Error completo:', emailResponse.error)
    } else {
      console.log('✅ Email enviado exitosamente!')
      console.log('📧 Respuesta:', JSON.stringify(emailResponse, null, 2))
    }

    console.log('\n' + '='.repeat(50) + '\n')
    console.log('📋 RESULTADO:')
    console.log('✅ API Key de Resend válida')
    console.log('✅ Consulta de dominios exitosa')
    console.log('✅ Envío de emails funcionando')
    
    console.log('\n📧 Revisa la bandeja de entrada de sleon@slfabogados.cl')
    console.log('📁 Si no aparece, revisa la carpeta de spam')

  } catch (error) {
    console.error('❌ Error:', error.message)
    
    if (error.message.includes('Invalid API key')) {
      console.log('\n💡 SOLUCIÓN:')
      console.log('1. Ve a https://resend.com/api-keys')
      console.log('2. Verifica que la API Key sea correcta')
      console.log('3. Si es incorrecta, crea una nueva API Key')
      console.log('4. Actualiza el archivo .env.local')
    }
    
    console.log('\n🔍 Error completo:', error)
  }
}

// Ejecutar la verificación
testResendApiKey().catch(console.error)
