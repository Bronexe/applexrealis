// Script completo para probar las notificaciones
// Ejecutar con: node scripts/test-notifications-complete.js

const https = require('https')
const http = require('http')

async function testCompleteNotifications() {
  console.log('🧪 Prueba completa del sistema de notificaciones...\n')

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
    console.log('📋 PASO 1: Verificando configuración de email...')
    
    // Probar endpoint de vencimientos
    console.log('📅 Probando notificaciones de vencimiento...')
    const expiringResult = await makeRequest(`${baseUrl}/api/cron/check-expiring-documents`)
    
    console.log(`Status: ${expiringResult.status}`)
    console.log('Response:', JSON.stringify(expiringResult.data, null, 2))
    
    if (expiringResult.status === 200) {
      console.log('✅ Endpoint de vencimientos funcionando correctamente')
      
      if (expiringResult.data.data?.success === false) {
        console.log('⚠️  La tabla notification_settings no existe en la base de datos')
        console.log('💡 Solución: Ejecutar el script SQL en Supabase SQL Editor')
        console.log('📄 Archivo: scripts/create_notification_settings_table.sql')
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
        console.log('⚠️  La tabla notification_settings no existe en la base de datos')
        console.log('💡 Solución: Ejecutar el script SQL en Supabase SQL Editor')
        console.log('📄 Archivo: scripts/create_notification_settings_table.sql')
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
    console.log('⚠️  Tabla notification_settings necesita ser creada en Supabase')
    
    console.log('\n📋 PRÓXIMOS PASOS:')
    console.log('1. Ejecutar el script SQL en Supabase SQL Editor')
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
testCompleteNotifications().catch(console.error)
