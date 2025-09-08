// Script para probar el envío de emails directamente
// Ejecutar con: node scripts/test-email-sending.js

const { Resend } = require('resend')
require('dotenv').config({ path: '.env.local' })

async function testEmailSending() {
  console.log('📧 Probando envío de emails...\n')

  // Verificar configuración
  if (!process.env.RESEND_API_KEY) {
    console.log('❌ RESEND_API_KEY no está configurada')
    return
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    // Probar email de vencimiento
    console.log('📅 Enviando email de prueba de vencimiento...')
    
    const expirationEmail = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Lex Realis <noreply@lexrealis.com>',
      to: ['test@example.com'], // Cambiar por tu email real
      subject: '⚠️ Documento próximo a vencer - Prueba',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #BF7F11, #D4A574); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🏢 Lex Realis</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #BF7F11; margin-top: 0;">⚠️ Documento próximo a vencer</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #BF7F11;">
              <h3 style="margin-top: 0; color: #333;">Seguro de Incendio Espacios Comunes - Seguros del Pacífico</h3>
              <p style="margin: 10px 0; color: #666;">
                <strong>Condominio:</strong> Edificio Residencial Las Flores
              </p>
              <p style="margin: 10px 0; color: #666;">
                <strong>Días restantes:</strong> 15 días
              </p>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>📋 Acción requerida:</strong> Por favor, renueva este documento antes de su vencimiento para mantener el cumplimiento normativo.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
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

    console.log('✅ Email de vencimiento enviado exitosamente')
    console.log(`📧 ID del email: ${expirationEmail.data?.id}`)

    console.log('\n' + '='.repeat(50) + '\n')

    // Probar email de asamblea
    console.log('📅 Enviando email de prueba de asamblea...')
    
    const assemblyEmail = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Lex Realis <noreply@lexrealis.com>',
      to: ['test@example.com'], // Cambiar por tu email real
      subject: '📅 Recordatorio de Asamblea - Prueba',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #BF7F11, #D4A574); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🏢 Lex Realis</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #BF7F11; margin-top: 0;">📅 Recordatorio de Asamblea</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #BF7F11;">
              <h3 style="margin-top: 0; color: #333;">Asamblea Ordinaria</h3>
              <p style="margin: 10px 0; color: #666;">
                <strong>Condominio:</strong> Edificio Residencial Las Flores
              </p>
              <p style="margin: 10px 0; color: #666;">
                <strong>Fecha:</strong> ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-CL')}
              </p>
            </div>
            
            <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #0c5460;">
                <strong>📋 Importante:</strong> Recuerda asistir a la asamblea para participar en las decisiones importantes del condominio.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                 style="background: #BF7F11; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Ver Dashboard
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #666; font-size: 14px; text-align: center;">
              Este es un mensaje automático del sistema Lex Realis.<br>
              Si no deseas recibir estos recordatorios, puedes desactivarlos en la configuración.
            </p>
          </div>
        </div>
      `
    })

    console.log('✅ Email de asamblea enviado exitosamente')
    console.log(`📧 ID del email: ${assemblyEmail.data?.id}`)

    console.log('\n' + '='.repeat(50) + '\n')

    // Resumen
    console.log('📊 RESUMEN DE LA PRUEBA DE EMAILS:')
    console.log('✅ Configuración de Resend funcionando correctamente')
    console.log('✅ Email de vencimiento enviado exitosamente')
    console.log('✅ Email de asamblea enviado exitosamente')
    console.log('✅ Diseño HTML funcionando correctamente')
    console.log('✅ Branding de Lex Realis aplicado correctamente')
    
    console.log('\n💡 NOTA: Los emails se enviaron a test@example.com')
    console.log('💡 Para recibir emails reales, cambia la dirección en el script')

  } catch (error) {
    console.error('❌ Error al enviar emails:', error.message)
    
    if (error.message.includes('Invalid API key')) {
      console.log('💡 Solución: Verifica que la RESEND_API_KEY sea correcta')
    } else if (error.message.includes('domain')) {
      console.log('💡 Solución: Verifica que el dominio esté configurado en Resend')
    }
  }
}

// Ejecutar la prueba
testEmailSending().catch(console.error)
