// Script para probar las notificaciones
// Ejecutar con: node scripts/test-notifications.js

const https = require('https')
const http = require('http')

async function testNotifications() {
  console.log('🧪 Probando sistema de notificaciones...\n')

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
    // Probar endpoint de vencimientos
    console.log('📅 Probando notificaciones de vencimiento...')
    const expiringResult = await makeRequest(`${baseUrl}/api/cron/check-expiring-documents`)
    
    console.log(`Status: ${expiringResult.status}`)
    console.log('Response:', JSON.stringify(expiringResult.data, null, 2))
    
    if (expiringResult.status === 200) {
      console.log('✅ Notificaciones de vencimiento funcionando correctamente')
    } else {
      console.log('❌ Error en notificaciones de vencimiento')
    }

    console.log('\n' + '='.repeat(50) + '\n')

    // Probar endpoint de asambleas
    console.log('📅 Probando recordatorios de asambleas...')
    const assemblyResult = await makeRequest(`${baseUrl}/api/cron/check-assembly-reminders`)
    
    console.log(`Status: ${assemblyResult.status}`)
    console.log('Response:', JSON.stringify(assemblyResult.data, null, 2))
    
    if (assemblyResult.status === 200) {
      console.log('✅ Recordatorios de asambleas funcionando correctamente')
    } else {
      console.log('❌ Error en recordatorios de asambleas')
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message)
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Solución: Asegúrate de que el servidor esté ejecutándose en http://localhost:3000')
    }
  }
}

// Ejecutar la prueba
testNotifications().catch(console.error)
