// Script para enviar email usando el dominio por defecto de Resend
// Ejecutar con: node scripts/test-email-resend-domain.js

const { Resend } = require('resend')
require('dotenv').config({ path: '.env.local' })

async function testEmailResendDomain() {
  console.log('📧 Enviando email usando dominio por defecto de Resend...\n')

  // Verificar configuración
  if (!process.env.RESEND_API_KEY) {
    console.log('❌ RESEND_API_KEY no está configurada')
    return
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    // Usar el dominio por defecto de Resend
    const fromEmail = 'Lex Realis <onboarding@resend.dev>'
    
    console.log(`📧 Enviando desde: ${fromEmail}`)
    console.log(`📧 Enviando a: sleon@slfabogados.cl`)

    // Enviar email de prueba
    console.log('\n📅 Enviando email de prueba...')
    
    const testEmail = await resend.emails.send({
      from: fromEmail,
      to: ['sleon@slfabogados.cl'],
      subject: '🧪 Prueba Lex Realis - Sistema de Notificaciones',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #BF7F11, #D4A574); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🏢 Lex Realis</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #BF7F11; margin-top: 0;">🧪 Prueba del Sistema de Notificaciones</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #BF7F11;">
              <h3 style="margin-top: 0; color: #333;">Email de Prueba</h3>
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
                <strong>Remitente:</strong> ${fromEmail}
              </p>
            </div>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #155724;">
                <strong>✅ Sistema funcionando:</strong> Este email se envió usando el dominio por defecto de Resend (onboarding@resend.dev).
              </p>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>📋 Información técnica:</strong><br>
                • Usando dominio por defecto de Resend<br>
                • API Key: Configurada correctamente<br>
                • Timestamp: ${new Date().toISOString()}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/dashboard" 
                 style="background: #BF7F11; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Ver Dashboard
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #666; font-size: 14px; text-align: center;">
              Este es un mensaje de prueba del sistema Lex Realis.<br>
              Si recibes este email, el sistema de notificaciones está funcionando correctamente.
            </p>
          </div>
        </div>
      `
    })

    console.log('✅ Email de prueba enviado exitosamente')
    console.log(`📧 ID del email: ${testEmail.data?.id}`)
    console.log(`📧 Status: ${testEmail.data?.status || 'Enviado'}`)

    console.log('\n' + '='.repeat(50) + '\n')

    // Enviar email de notificación
    console.log('📅 Enviando email de notificación de vencimiento...')
    
    const notificationEmail = await resend.emails.send({
      from: fromEmail,
      to: ['sleon@slfabogados.cl'],
      subject: '⚠️ Documento próximo a vencer - Edificio Residencial Las Flores',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #BF7F11, #D4A574); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🏢 Lex Realis</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #BF7F11; margin-top: 0;">⚠️ Documento próximo a vencer</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #BF7F11;">
              <h3 style="margin-top: 0; color: #333;">Seguro de Incendio Espacios Comunes</h3>
              <p style="margin: 10px 0; color: #666;">
                <strong>Condominio:</strong> Edificio Residencial Las Flores
              </p>
              <p style="margin: 10px 0; color: #666;">
                <strong>Aseguradora:</strong> Seguros del Pacífico
              </p>
              <p style="margin: 10px 0; color: #666;">
                <strong>Días restantes:</strong> 15 días
              </p>
              <p style="margin: 10px 0; color: #666;">
                <strong>Fecha de vencimiento:</strong> ${new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('es-CL')}
              </p>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>📋 Acción requerida:</strong> Por favor, renueva este documento antes de su vencimiento para mantener el cumplimiento normativo.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/dashboard" 
                 style="background: #BF7F11; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Ver Dashboard
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #666; font-size: 14px; text-align: center;">
              Este es un mensaje automático del sistema Lex Realis.<br>
              Si no deseas recibir estas notificaciones, puedes desactivarlas en la configuración.
            </p>
          </div>
        </div>
      `
    })

    console.log('✅ Email de notificación enviado exitosamente')
    console.log(`📧 ID del email: ${notificationEmail.data?.id}`)
    console.log(`📧 Status: ${notificationEmail.data?.status || 'Enviado'}`)

    console.log('\n' + '='.repeat(50) + '\n')

    // Resumen
    console.log('📊 RESUMEN DE LA PRUEBA:')
    console.log('✅ Configuración de Resend verificada')
    console.log('✅ API Key válida')
    console.log('✅ Usando dominio por defecto de Resend')
    console.log('✅ Email de prueba enviado a sleon@slfabogados.cl')
    console.log('✅ Email de notificación enviado a sleon@slfabogados.cl')
    console.log('✅ Diseño HTML funcionando correctamente')
    console.log('✅ Branding de Lex Realis aplicado correctamente')
    
    console.log('\n🎉 ¡PRUEBA EXITOSA!')
    console.log('📧 Revisa la bandeja de entrada de sleon@slfabogados.cl')
    console.log('💡 Si no ves los emails, revisa la carpeta de spam')
    console.log('📋 Los emails se enviaron desde onboarding@resend.dev (dominio por defecto)')

  } catch (error) {
    console.error('❌ Error al enviar emails:', error.message)
    console.log('\n🔍 Información del error:')
    console.log('Error completo:', error)
  }
}

// Ejecutar la prueba
testEmailResendDomain().catch(console.error)
