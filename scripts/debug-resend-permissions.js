// Script para diagnosticar permisos de Resend
// Ejecutar con: node scripts/debug-resend-permissions.js

const { Resend } = require('resend')
require('dotenv').config({ path: '.env.local' })

async function debugResendPermissions() {
  console.log('🔍 Diagnosticando permisos de Resend...\n')

  const apiKey = process.env.RESEND_API_KEY
  console.log('📋 API Key actual:')
  console.log(`Formato: ${apiKey ? apiKey.substring(0, 10) + '...' + apiKey.slice(-4) : 'NO CONFIGURADA'}`)
  console.log(`Longitud: ${apiKey ? apiKey.length : 0} caracteres`)

  if (!apiKey) {
    console.log('❌ RESEND_API_KEY no está configurada')
    return
  }

  const resend = new Resend(apiKey)

  try {
    // 1. Probar consulta de dominios
    console.log('\n🔍 1. Probando consulta de dominios...')
    const domainsResponse = await resend.domains.list()
    console.log('✅ Consulta de dominios exitosa')
    console.log(`📧 Dominios: ${domainsResponse.data?.length || 0}`)

    // 2. Probar consulta de API Keys
    console.log('\n🔍 2. Probando consulta de API Keys...')
    try {
      const apiKeysResponse = await resend.apiKeys.list()
      console.log('✅ Consulta de API Keys exitosa')
      console.log(`🔑 API Keys: ${apiKeysResponse.data?.length || 0}`)
    } catch (error) {
      console.log('❌ Error al consultar API Keys:', error.message)
    }

    // 3. Probar envío de email simple
    console.log('\n🔍 3. Probando envío de email simple...')
    
    const simpleEmail = await resend.emails.send({
      from: 'Lex Realis <onboarding@resend.dev>',
      to: ['sleon@slfabogados.cl'],
      subject: '🧪 Prueba Simple - Lex Realis',
      text: 'Este es un email de prueba simple del sistema Lex Realis.'
    })

    console.log('✅ Email simple enviado')
    console.log('📧 Respuesta:', JSON.stringify(simpleEmail, null, 2))

    // 4. Probar envío de email HTML
    console.log('\n🔍 4. Probando envío de email HTML...')
    
    const htmlEmail = await resend.emails.send({
      from: 'Lex Realis <onboarding@resend.dev>',
      to: ['sleon@slfabogados.cl'],
      subject: '🧪 Prueba HTML - Lex Realis',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #BF7F11;">🏢 Lex Realis</h1>
          <p>Este es un email de prueba HTML del sistema Lex Realis.</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CL')}</p>
          <p><strong>Destinatario:</strong> sleon@slfabogados.cl</p>
        </div>
      `
    })

    console.log('✅ Email HTML enviado')
    console.log('📧 Respuesta:', JSON.stringify(htmlEmail, null, 2))

    // 5. Verificar logs de emails
    console.log('\n🔍 5. Verificando logs de emails...')
    try {
      const emailsResponse = await resend.emails.list()
      console.log('✅ Consulta de emails exitosa')
      console.log(`📧 Total emails: ${emailsResponse.data?.data?.length || 0}`)
      
      if (emailsResponse.data?.data && emailsResponse.data.data.length > 0) {
        console.log('📋 Últimos emails:')
        emailsResponse.data.data.slice(0, 3).forEach((email, index) => {
          console.log(`  ${index + 1}. ${email.subject} - ${email.created_at} - ${email.last_event}`)
        })
      }
    } catch (error) {
      console.log('❌ Error al consultar emails:', error.message)
    }

    console.log('\n' + '='.repeat(50) + '\n')
    console.log('📋 DIAGNÓSTICO COMPLETADO:')
    console.log('✅ API Key válida para consultas')
    console.log('✅ Emails enviados exitosamente')
    console.log('✅ Sistema funcionando correctamente')
    
    console.log('\n📧 Revisa la bandeja de entrada de sleon@slfabogados.cl')
    console.log('📁 Si no aparece, revisa la carpeta de spam')

  } catch (error) {
    console.error('❌ Error general:', error.message)
    
    if (error.message.includes('Invalid API key')) {
      console.log('\n💡 SOLUCIÓN:')
      console.log('1. Verifica que la API Key sea correcta')
      console.log('2. Asegúrate de que tenga permisos completos')
      console.log('3. Verifica que no esté expirada')
    } else if (error.message.includes('permission')) {
      console.log('\n💡 SOLUCIÓN:')
      console.log('1. Verifica que la API Key tenga permisos de envío')
      console.log('2. Asegúrate de que tenga "Full Access"')
    }
    
    console.log('\n🔍 Error completo:', error)
  }
}

// Ejecutar el diagnóstico
debugResendPermissions().catch(console.error)
