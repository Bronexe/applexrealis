// Script para enviar email real a contacto@lexrealis.cl
// Ejecutar con: node scripts/test-email-real.js

const { Resend } = require('resend')
require('dotenv').config({ path: '.env.local' })

async function testRealEmail() {
  console.log('📧 Enviando email real a contacto@lexrealis.cl...\n')

  // Verificar configuración
  if (!process.env.RESEND_API_KEY) {
    console.log('❌ RESEND_API_KEY no está configurada')
    return
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    // Enviar email de prueba de vencimiento
    console.log('📅 Enviando email de prueba de vencimiento...')
    
    const expirationEmail = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Lex Realis <noreply@lexrealis.com>',
      to: ['contacto@lexrealis.cl'],
      subject: '🧪 Prueba de Sistema - Documento próximo a vencer',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #BF7F11, #D4A574); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🏢 Lex Realis</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #BF7F11; margin-top: 0;">🧪 Prueba del Sistema de Notificaciones</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #BF7F11;">
              <h3 style="margin-top: 0; color: #333;">Seguro de Incendio Espacios Comunes - Seguros del Pacífico</h3>
              <p style="margin: 10px 0; color: #666;">
                <strong>Condominio:</strong> Edificio Residencial Las Flores
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
            
            <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #0c5460;">
                <strong>✅ Sistema funcionando:</strong> Este es un email de prueba del sistema de notificaciones automáticas de Lex Realis.
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
              Este es un mensaje de prueba del sistema Lex Realis.<br>
              Si recibes este email, el sistema de notificaciones está funcionando correctamente.
            </p>
          </div>
        </div>
      `
    })

    console.log('✅ Email de vencimiento enviado exitosamente')
    console.log(`📧 ID del email: ${expirationEmail.data?.id}`)

    console.log('\n' + '='.repeat(50) + '\n')

    // Enviar email de prueba de asamblea
    console.log('📅 Enviando email de prueba de asamblea...')
    
    const assemblyEmail = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Lex Realis <noreply@lexrealis.com>',
      to: ['contacto@lexrealis.cl'],
      subject: '🧪 Prueba de Sistema - Recordatorio de Asamblea',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #BF7F11, #D4A574); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🏢 Lex Realis</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #BF7F11; margin-top: 0;">🧪 Prueba del Sistema de Notificaciones</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #BF7F11;">
              <h3 style="margin-top: 0; color: #333;">Asamblea Ordinaria</h3>
              <p style="margin: 10px 0; color: #666;">
                <strong>Condominio:</strong> Edificio Residencial Las Flores
              </p>
              <p style="margin: 10px 0; color: #666;">
                <strong>Fecha:</strong> ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-CL')}
              </p>
              <p style="margin: 10px 0; color: #666;">
                <strong>Hora:</strong> 19:00 hrs
              </p>
              <p style="margin: 10px 0; color: #666;">
                <strong>Lugar:</strong> Salón de eventos del condominio
              </p>
            </div>
            
            <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #0c5460;">
                <strong>📋 Importante:</strong> Recuerda asistir a la asamblea para participar en las decisiones importantes del condominio.
              </p>
            </div>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #155724;">
                <strong>✅ Sistema funcionando:</strong> Este es un email de prueba del sistema de recordatorios automáticos de Lex Realis.
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
              Este es un mensaje de prueba del sistema Lex Realis.<br>
              Si recibes este email, el sistema de recordatorios está funcionando correctamente.
            </p>
          </div>
        </div>
      `
    })

    console.log('✅ Email de asamblea enviado exitosamente')
    console.log(`📧 ID del email: ${assemblyEmail.data?.id}`)

    console.log('\n' + '='.repeat(50) + '\n')

    // Resumen
    console.log('📊 RESUMEN DE LA PRUEBA REAL:')
    console.log('✅ Configuración de Resend funcionando correctamente')
    console.log('✅ Email de vencimiento enviado a contacto@lexrealis.cl')
    console.log('✅ Email de asamblea enviado a contacto@lexrealis.cl')
    console.log('✅ Diseño HTML funcionando correctamente')
    console.log('✅ Branding de Lex Realis aplicado correctamente')
    
    console.log('\n🎉 ¡PRUEBA EXITOSA!')
    console.log('📧 Revisa la bandeja de entrada de contacto@lexrealis.cl')
    console.log('💡 Si no ves los emails, revisa la carpeta de spam')

  } catch (error) {
    console.error('❌ Error al enviar emails:', error.message)
    
    if (error.message.includes('Invalid API key')) {
      console.log('💡 Solución: Verifica que la RESEND_API_KEY sea correcta')
    } else if (error.message.includes('domain')) {
      console.log('💡 Solución: Verifica que el dominio esté configurado en Resend')
    } else if (error.message.includes('rate limit')) {
      console.log('💡 Solución: Espera unos minutos antes de enviar más emails')
    }
  }
}

// Ejecutar la prueba
testRealEmail().catch(console.error)
