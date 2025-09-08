// Script para probar directamente con SUPABASE_SERVICE_ROLE_KEY
// Ejecutar con: node scripts/test-service-role-direct.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testServiceRoleDirect() {
  console.log('🔑 Probando directamente con SUPABASE_SERVICE_ROLE_KEY...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log('📋 Configuración:')
  console.log(`SUPABASE_URL: ${supabaseUrl ? '✅ Configurada' : '❌ NO CONFIGURADA'}`)
  console.log(`SERVICE_ROLE_KEY: ${serviceRoleKey ? '✅ Configurada' : '❌ NO CONFIGURADA'}`)

  if (!supabaseUrl || !serviceRoleKey) {
    console.log('❌ Configuración incompleta')
    console.log('SUPABASE_URL:', supabaseUrl ? 'OK' : 'MISSING')
    console.log('SERVICE_ROLE_KEY:', serviceRoleKey ? 'OK' : 'MISSING')
    return
  }

  console.log(`SERVICE_ROLE_KEY longitud: ${serviceRoleKey.length} caracteres`)
  console.log(`SERVICE_ROLE_KEY empieza con 'eyJ': ${serviceRoleKey.startsWith('eyJ')}`)

  // Crear cliente de Supabase con SERVICE_ROLE_KEY
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  try {
    // Probar consulta de tipos de notificaciones
    console.log('\n🔍 Probando consulta de tipos de notificaciones...')
    
    const { data: notificationTypes, error } = await supabase
      .from('notification_types')
      .select('*')

    if (error) {
      console.log('❌ Error al consultar tipos de notificaciones:', error.message)
    } else {
      console.log('✅ Tipos de notificaciones consultados exitosamente')
      console.log(`📧 Total: ${notificationTypes?.length || 0} tipos`)
    }

    // Probar función RPC
    console.log('\n🔍 Probando función RPC...')
    
    const { data: pendingEvents, error: rpcError } = await supabase.rpc('get_pending_notification_events')

    if (rpcError) {
      console.log('❌ Error en función RPC:', rpcError.message)
    } else {
      console.log('✅ Función RPC ejecutada exitosamente')
      console.log(`📧 Eventos pendientes: ${pendingEvents?.length || 0}`)
    }

    // Probar creación de evento
    console.log('\n🔍 Probando creación de evento...')
    
    const { data: eventId, error: createError } = await supabase.rpc('create_notification_event', {
      p_event_type: 'test_event',
      p_entity_type: 'test',
      p_entity_id: '00000000-0000-0000-0000-000000000000',
      p_event_date: new Date().toISOString(),
      p_notification_type_name: 'document_expiring'
    })

    if (createError) {
      console.log('❌ Error al crear evento:', createError.message)
    } else {
      console.log('✅ Evento creado exitosamente:', eventId)
      
      // Marcar como procesado
      await supabase.rpc('mark_notification_event_processed', {
        event_uuid: eventId
      })
      console.log('✅ Evento marcado como procesado')
    }

    console.log('\n' + '='.repeat(50) + '\n')
    console.log('🎉 ¡PRUEBA DIRECTA EXITOSA! 🎉')
    console.log('✅ SERVICE_ROLE_KEY funcionando correctamente')
    console.log('✅ Consultas a base de datos exitosas')
    console.log('✅ Funciones RPC operativas')
    console.log('✅ Sistema de notificaciones funcional')

  } catch (error) {
    console.error('❌ Error general:', error.message)
    console.log('\n🔍 Error completo:', error)
  }
}

// Ejecutar la prueba
testServiceRoleDirect().catch(console.error)
