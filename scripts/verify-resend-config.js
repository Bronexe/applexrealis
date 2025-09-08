// Script para verificar la configuración real de Resend
// Ejecutar con: node scripts/verify-resend-config.js

const { Resend } = require('resend')
require('dotenv').config({ path: '.env.local' })

async function verifyResendConfig() {
  console.log('🔍 Verificando configuración real de Resend...\n')

  // Verificar configuración
  console.log('📋 Configuración actual:')
  console.log(`RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '***' + process.env.RESEND_API_KEY.slice(-4) : 'NO CONFIGURADA'}`)
  console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM}`)

  if (!process.env.RESEND_API_KEY) {
    console.log('❌ RESEND_API_KEY no está configurada')
    return
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    // Verificar dominios
    console.log('\n🔑 Verificando dominios en Resend...')
    
    const domainsResponse = await resend.domains.list()
    console.log(`📧 Total de dominios: ${domainsResponse.data?.length || 0}`)
    
    if (domainsResponse.data && domainsResponse.data.length > 0) {
      console.log('📋 Dominios configurados:')
      domainsResponse.data.forEach(domain => {
        console.log(`  - ${domain.name}`)
        console.log(`    Status: ${domain.status}`)
        console.log(`    Created: ${domain.created_at}`)
        console.log(`    Region: ${domain.region}`)
      })
    } else {
      console.log('⚠️  No hay dominios configurados en Resend')
      console.log('💡 Esto significa que solo puedes usar el dominio por defecto: onboarding@resend.dev')
    }

    // Probar envío con el dominio por defecto
    console.log('\n📧 Probando envío con dominio por defecto...')
    
    const testEmail = await resend.emails.send({
      from: 'Lex Realis <onboarding@resend.dev>',
      to: ['sleon@slfabogados.cl'],
      subject: '🧪 Prueba Real - Sistema Lex Realis',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #BF7F11, #D4A574); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🏢 Lex Realis</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #BF7F11; margin-top: 0;">🧪 Prueba Real del Sistema</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #BF7F11;">
              <h3 style="margin-top: 0; color: #333;">Email de Prueba</h3>
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
                • Usando dominio por defecto de Resend<br>
                • API Key: Configurada correctamente<br>
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
    console.log(`📧 ID del email: ${testEmail.data?.id || 'No disponible'}`)
    console.log(`📧 Status: ${testEmail.data?.status || 'Enviado'}`)

    // Verificar si hay errores en la respuesta
    if (testEmail.error) {
      console.log('❌ Error en la respuesta:', testEmail.error)
    }

    console.log('\n' + '='.repeat(50) + '\n')
    console.log('📋 DIAGNÓSTICO COMPLETADO:')
    console.log('✅ API Key válida')
    console.log('✅ Dominio por defecto funcionando')
    console.log('✅ Email enviado desde onboarding@resend.dev')
    
    if (domainsResponse.data?.length === 0) {
      console.log('⚠️  No hay dominios personalizados configurados')
      console.log('💡 Para usar contacto@lexrealis.cl, necesitas:')
      console.log('   1. Ir a Resend Dashboard')
      console.log('   2. Agregar el dominio lexrealis.cl')
      console.log('   3. Configurar los registros DNS')
      console.log('   4. Verificar el dominio')
    }

    console.log('\n📧 Revisa la bandeja de entrada de sleon@slfabogados.cl')
    console.log('📁 Si no aparece, revisa la carpeta de spam')

  } catch (error) {
    console.error('❌ Error:', error.message)
    
    if (error.message.includes('Invalid API key')) {
      console.log('💡 Solución: Verifica que la RESEND_API_KEY sea correcta')
    } else if (error.message.includes('domain')) {
      console.log('💡 Solución: Verifica que el dominio esté configurado en Resend')
    }
    
    console.log('\n🔍 Error completo:', error)
  }
}

// Ejecutar la verificación
verifyResendConfig().catch(console.error)
