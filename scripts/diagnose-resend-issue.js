// Script para diagnosticar problemas con Resend
// Ejecutar con: node scripts/diagnose-resend-issue.js

const { Resend } = require('resend')
require('dotenv').config({ path: '.env.local' })

async function diagnoseResendIssue() {
  console.log('🔍 Diagnosticando problemas con Resend...\n')

  // Verificar configuración
  console.log('📋 Verificando configuración:')
  console.log(`RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '***' + process.env.RESEND_API_KEY.slice(-4) : 'NO CONFIGURADA'}`)
  console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM}`)
  console.log(`NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL}`)

  if (!process.env.RESEND_API_KEY) {
    console.log('❌ RESEND_API_KEY no está configurada')
    return
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    // 1. Verificar que la API Key es válida
    console.log('\n🔑 Verificando API Key...')
    
    try {
      const domainsResponse = await resend.domains.list()
      console.log('✅ API Key válida')
      console.log(`📧 Dominios configurados: ${domainsResponse.data?.length || 0}`)
      
      if (domainsResponse.data && domainsResponse.data.length > 0) {
        console.log('📋 Dominios disponibles:')
        domainsResponse.data.forEach(domain => {
          console.log(`  - ${domain.name} (${domain.status})`)
        })
      }
    } catch (error) {
      console.log('❌ Error al verificar API Key:', error.message)
      return
    }

    // 2. Verificar el formato de la API Key
    console.log('\n🔍 Verificando formato de API Key...')
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey.startsWith('re_')) {
      console.log('⚠️  La API Key no tiene el formato correcto (debería empezar con "re_")')
    } else {
      console.log('✅ Formato de API Key correcto')
    }

    // 3. Probar envío con diferentes configuraciones
    console.log('\n📧 Probando envío de email...')

    // Probar con el dominio por defecto de Resend primero
    console.log('📅 Probando con dominio por defecto de Resend...')
    
    try {
      const testEmail1 = await resend.emails.send({
        from: 'Lex Realis <onboarding@resend.dev>',
        to: ['sleon@slfabogados.cl'],
        subject: '🧪 Prueba 1 - Dominio por defecto Resend',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>🧪 Prueba 1 - Dominio por defecto</h1>
            <p>Este email se envió desde onboarding@resend.dev</p>
            <p>Timestamp: ${new Date().toISOString()}</p>
          </div>
        `
      })
      
      console.log('✅ Email 1 enviado exitosamente')
      console.log(`📧 ID: ${testEmail1.data?.id}`)
      console.log(`📧 Status: ${testEmail1.data?.status}`)
      
    } catch (error) {
      console.log('❌ Error en email 1:', error.message)
    }

    // Probar con el dominio lexrealis.cl
    console.log('\n📅 Probando con dominio lexrealis.cl...')
    
    try {
      const testEmail2 = await resend.emails.send({
        from: 'Lex Realis <contacto@lexrealis.cl>',
        to: ['sleon@slfabogados.cl'],
        subject: '🧪 Prueba 2 - Dominio lexrealis.cl',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>🧪 Prueba 2 - Dominio lexrealis.cl</h1>
            <p>Este email se envió desde contacto@lexrealis.cl</p>
            <p>Timestamp: ${new Date().toISOString()}</p>
          </div>
        `
      })
      
      console.log('✅ Email 2 enviado exitosamente')
      console.log(`📧 ID: ${testEmail2.data?.id}`)
      console.log(`📧 Status: ${testEmail2.data?.status}`)
      
    } catch (error) {
      console.log('❌ Error en email 2:', error.message)
      console.log('💡 Posibles causas:')
      console.log('   - El dominio lexrealis.cl no está configurado en Resend')
      console.log('   - El dominio no está verificado')
      console.log('   - El email contacto@lexrealis.cl no está autorizado')
    }

    // 4. Verificar logs de Resend
    console.log('\n📊 Verificando logs de Resend...')
    
    try {
      const logsResponse = await resend.emails.list()
      console.log(`📧 Total de emails enviados: ${logsResponse.data?.data?.length || 0}`)
      
      if (logsResponse.data?.data && logsResponse.data.data.length > 0) {
        console.log('📋 Últimos emails:')
        logsResponse.data.data.slice(0, 5).forEach((email, index) => {
          console.log(`  ${index + 1}. ${email.subject} - ${email.created_at} - ${email.last_event}`)
        })
      }
    } catch (error) {
      console.log('❌ Error al obtener logs:', error.message)
    }

    console.log('\n' + '='.repeat(50) + '\n')
    console.log('📋 RESUMEN DEL DIAGNÓSTICO:')
    console.log('1. Verificar que la API Key sea correcta')
    console.log('2. Verificar que el dominio lexrealis.cl esté configurado en Resend')
    console.log('3. Verificar que el email contacto@lexrealis.cl esté autorizado')
    console.log('4. Revisar la bandeja de entrada y spam')
    console.log('5. Verificar los logs en el dashboard de Resend')

  } catch (error) {
    console.error('❌ Error general:', error.message)
    console.log('\n🔍 Información del error:')
    console.log('Error completo:', error)
  }
}

// Ejecutar el diagnóstico
diagnoseResendIssue().catch(console.error)
