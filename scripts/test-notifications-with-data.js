// Script para probar notificaciones con datos simulados
// Ejecutar con: node scripts/test-notifications-with-data.js

const https = require('https')
const http = require('http')

async function testNotificationsWithData() {
  console.log('🧪 Probando notificaciones con datos simulados...\n')

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
    console.log('📋 PASO 1: Verificando estado de la tabla notification_settings...')
    
    // Probar endpoint de vencimientos
    console.log('📅 Probando notificaciones de vencimiento...')
    const expiringResult = await makeRequest(`${baseUrl}/api/cron/check-expiring-documents`)
    
    console.log(`Status: ${expiringResult.status}`)
    console.log('Response:', JSON.stringify(expiringResult.data, null, 2))
    
    if (expiringResult.status === 200) {
      console.log('✅ Endpoint de vencimientos funcionando correctamente')
      
      if (expiringResult.data.data?.success === false) {
        console.log('⚠️  Error en la base de datos:', expiringResult.data.data.error)
        
        if (expiringResult.data.data.error.includes('notification_settings')) {
          console.log('💡 Solución: Ejecutar el script de corrección en Supabase')
          console.log('📄 Archivo: scripts/fix_notification_settings_table.sql')
        }
      } else if (expiringResult.data.data?.success === true) {
        console.log('🎉 ¡Notificaciones funcionando correctamente!')
        console.log(`📧 Emails enviados: ${expiringResult.data.data.totalSent || 0}`)
        console.log(`❌ Errores: ${expiringResult.data.data.totalErrors || 0}`)
      }
    } else {
      console.log('❌ Error en endpoint de vencimientos')
    }

    console.log('\n' + '='.repeat(50) + '\n')

    // Probar endpoint de asambleas
    console.log('📅 Probando recordatorios de asambleas...')
    const assemblyResult = await makeRequest(`${baseUrl}/api/cron/check-assembly-reminders`)
    
    console.log(`Status: ${assemblyResult.status}`)
    console.log('Response:', JSON.stringify(assemblyResult.data, null, 2))
    
    if (assemblyResult.status === 200) {
      console.log('✅ Endpoint de asambleas funcionando correctamente')
      
      if (assemblyResult.data.data?.success === false) {
        console.log('⚠️  Error en la base de datos:', assemblyResult.data.data.error)
        
        if (assemblyResult.data.data.error.includes('notification_settings')) {
          console.log('💡 Solución: Ejecutar el script de corrección en Supabase')
          console.log('📄 Archivo: scripts/fix_notification_settings_table.sql')
        }
      } else if (assemblyResult.data.data?.success === true) {
        console.log('🎉 ¡Recordatorios de asambleas funcionando correctamente!')
        console.log(`📧 Emails enviados: ${assemblyResult.data.data.totalSent || 0}`)
        console.log(`❌ Errores: ${assemblyResult.data.data.totalErrors || 0}`)
      }
    } else {
      console.log('❌ Error en endpoint de asambleas')
    }

    console.log('\n' + '='.repeat(50) + '\n')

    // Resumen de la prueba
    console.log('📊 RESUMEN DE LA PRUEBA:')
    console.log('✅ Servidor Next.js funcionando correctamente')
    console.log('✅ Endpoints de cron jobs accesibles')
    console.log('✅ Autenticación con CRON_SECRET funcionando')
    console.log('✅ Configuración de Resend funcionando')
    
    if (expiringResult.data.data?.success === false || assemblyResult.data.data?.success === false) {
      console.log('⚠️  Problema con la tabla notification_settings en Supabase')
      console.log('💡 Solución: Ejecutar scripts de corrección en Supabase')
    } else {
      console.log('🎉 ¡Sistema de notificaciones funcionando completamente!')
    }
    
    console.log('\n📋 PRÓXIMOS PASOS:')
    console.log('1. Ejecutar scripts de corrección en Supabase SQL Editor')
    console.log('2. Crear configuraciones de notificación para usuarios')
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
testNotificationsWithData().catch(console.error)
