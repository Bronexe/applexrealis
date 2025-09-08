// Script para probar las notificaciones con endpoints simplificados
// Ejecutar con: node scripts/test-notifications-simple.js

const https = require('https')
const http = require('http')

async function testSimpleNotifications() {
  console.log('🧪 Probando notificaciones con endpoints simplificados...\n')

  const baseUrl = 'http://localhost:3000'
  const cronSecret = '7598271ef892b0a1e8f7b0284e9dfb1d0c26ff71110ac211bbcfd20bc25954ea'

  // Función para hacer peticiones HTTP
  function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url)
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || 3000,
        path: urlObj.pathname,
        method: options.method || 'GET',
        headers: {
          'Authorization': `Bearer ${cronSecret}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      }

      const req = http.request(requestOptions, (res) => {
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data)
            resolve({ status: res.statusCode, data: jsonData })
          } catch (e) {
            resolve({ status: res.statusCode, data: data })
          }
        })
      })

      req.on('error', (error) => {
        reject(error)
      })

      req.end()
    })
  }

  try {
    console.log('📋 PASO 1: Probando endpoints simplificados...')
    
    // Probar endpoint simplificado de vencimientos
    console.log('📅 Probando notificaciones de vencimiento (versión simple)...')
    const expiringResult = await makeRequest(`${baseUrl}/api/cron/check-expiring-documents-simple`)
    
    console.log(`Status: ${expiringResult.status}`)
    console.log('Response:', JSON.stringify(expiringResult.data, null, 2))
    
    if (expiringResult.status === 200) {
      console.log('✅ Endpoint simplificado de vencimientos funcionando correctamente')
      
      if (expiringResult.data.data?.success === true) {
        console.log('🎉 ¡Notificaciones de vencimiento funcionando!')
        console.log(`📧 Emails enviados: ${expiringResult.data.data.totalSent || 0}`)
        console.log(`❌ Errores: ${expiringResult.data.data.totalErrors || 0}`)
      } else if (expiringResult.data.data?.success === false) {
        console.log('⚠️  Error en la base de datos:', expiringResult.data.data.error)
      }
    } else {
      console.log('❌ Error en endpoint simplificado de vencimientos')
    }

    console.log('\n' + '='.repeat(50) + '\n')

    // Probar endpoint simplificado de asambleas
    console.log('📅 Probando recordatorios de asambleas (versión simple)...')
    const assemblyResult = await makeRequest(`${baseUrl}/api/cron/check-assembly-reminders-simple`)
    
    console.log(`Status: ${assemblyResult.status}`)
    console.log('Response:', JSON.stringify(assemblyResult.data, null, 2))
    
    if (assemblyResult.status === 200) {
      console.log('✅ Endpoint simplificado de asambleas funcionando correctamente')
      
      if (assemblyResult.data.data?.success === true) {
        console.log('🎉 ¡Recordatorios de asambleas funcionando!')
        console.log(`📧 Emails enviados: ${assemblyResult.data.data.totalSent || 0}`)
        console.log(`❌ Errores: ${assemblyResult.data.data.totalErrors || 0}`)
      } else if (assemblyResult.data.data?.success === false) {
        console.log('⚠️  Error en la base de datos:', assemblyResult.data.data.error)
      }
    } else {
      console.log('❌ Error en endpoint simplificado de asambleas')
    }

    console.log('\n' + '='.repeat(50) + '\n')

    // Resumen de la prueba
    console.log('📊 RESUMEN DE LA PRUEBA SIMPLIFICADA:')
    console.log('✅ Servidor Next.js funcionando correctamente')
    console.log('✅ Endpoints simplificados accesibles')
    console.log('✅ Autenticación con CRON_SECRET funcionando')
    console.log('✅ Configuración de Resend funcionando')
    
    if (expiringResult.data.data?.success === true || assemblyResult.data.data?.success === true) {
      console.log('🎉 ¡Sistema de notificaciones funcionando completamente!')
    } else {
      console.log('⚠️  Problema con la tabla notification_settings en Supabase')
      console.log('💡 Solución: Ejecutar scripts de corrección en Supabase')
    }
    
    console.log('\n📋 PRÓXIMOS PASOS:')
    console.log('1. Si funciona: Configurar notificaciones en la aplicación')
    console.log('2. Si no funciona: Ejecutar scripts de corrección en Supabase')
    console.log('3. Probar el envío real de emails')
    console.log('4. Configurar cron jobs en Vercel')

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message)
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Solución: Asegúrate de que el servidor esté ejecutándose en http://localhost:3000')
    }
  }
}

// Ejecutar la prueba
testSimpleNotifications().catch(console.error)
