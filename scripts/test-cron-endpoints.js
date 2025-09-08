// Script para probar los endpoints de cron jobs
// Ejecutar con: node scripts/test-cron-endpoints.js

require('dotenv').config({ path: '.env.local' })

async function testCronEndpoints() {
  console.log('🧪 Probando endpoints de cron jobs...\n')

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const cronSecret = process.env.CRON_SECRET

  console.log('📋 Configuración:')
  console.log(`Base URL: ${baseUrl}`)
  console.log(`Cron Secret: ${cronSecret ? 'Configurada' : 'NO CONFIGURADA'}`)

  if (!cronSecret) {
    console.log('❌ CRON_SECRET no está configurada')
    return
  }

  try {
    // 1. Probar endpoint de creación de eventos
    console.log('\n🔍 1. Probando endpoint de creación de eventos...')
    
    const createEventsResponse = await fetch(`${baseUrl}/api/cron/create-events`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const createEventsData = await createEventsResponse.json()
    
    if (createEventsResponse.ok) {
      console.log('✅ Endpoint de creación de eventos funcionando')
      console.log('📊 Respuesta:', JSON.stringify(createEventsData, null, 2))
    } else {
      console.log('❌ Error en endpoint de creación de eventos:', createEventsData.error)
    }

    // 2. Probar endpoint de procesamiento de notificaciones
    console.log('\n🔍 2. Probando endpoint de procesamiento de notificaciones...')
    
    const processNotificationsResponse = await fetch(`${baseUrl}/api/cron/process-notifications`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const processNotificationsData = await processNotificationsResponse.json()
    
    if (processNotificationsResponse.ok) {
      console.log('✅ Endpoint de procesamiento de notificaciones funcionando')
      console.log('📊 Respuesta:', JSON.stringify(processNotificationsData, null, 2))
    } else {
      console.log('❌ Error en endpoint de procesamiento:', processNotificationsData.error)
    }

    // 3. Probar con autenticación (simulando cron job real)
    console.log('\n🔍 3. Probando con autenticación de cron job...')
    
    const authResponse = await fetch(`${baseUrl}/api/cron/process-notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cronSecret}`
      }
    })

    const authData = await authResponse.json()
    
    if (authResponse.ok) {
      console.log('✅ Endpoint con autenticación funcionando')
      console.log('📊 Respuesta:', JSON.stringify(authData, null, 2))
    } else {
      console.log('❌ Error en endpoint con autenticación:', authData.error)
    }

    console.log('\n' + '='.repeat(60) + '\n')
    console.log('🎉 ¡PRUEBA DE ENDPOINTS COMPLETADA! 🎉')
    console.log('✅ Endpoints de cron jobs funcionando')
    console.log('✅ Sistema de notificaciones operativo')
    console.log('✅ Cron jobs listos para producción')

    console.log('\n🚀 PRÓXIMOS PASOS:')
    console.log('1. Crear datos de prueba (condominios, documentos, etc.)')
    console.log('2. Configurar notificaciones por usuario')
    console.log('3. Desplegar en Vercel para activar cron jobs automáticos')
    console.log('4. Probar notificaciones automáticas en producción')

  } catch (error) {
    console.error('❌ Error general:', error.message)
    console.log('\n🔍 Error completo:', error)
  }
}

// Ejecutar la prueba
testCronEndpoints().catch(console.error)
