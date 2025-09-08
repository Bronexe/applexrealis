// Script para enviar notificaciones de prueba a sleon@slfabogados.cl
// Ejecutar con: node scripts/send-test-notifications.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function sendTestNotifications() {
  console.log('📧 Enviando notificaciones de prueba a sleon@slfabogados.cl...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.log('❌ Configuración incompleta')
    return
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  try {
    // 1. Obtener tipos de notificaciones disponibles
    console.log('🔍 Obteniendo tipos de notificaciones disponibles...')
    const { data: notificationTypes, error: typesError } = await supabase
      .from('notification_types')
      .select('*')

    if (typesError) {
      console.log('❌ Error al obtener tipos de notificaciones:', typesError.message)
      return
    }

    console.log(`✅ Encontrados ${notificationTypes.length} tipos de notificaciones`)

    // 2. Crear un usuario de prueba si no existe
    console.log('\n👤 Configurando usuario de prueba...')
    const testEmail = 'sleon@slfabogados.cl'
    
    // Verificar si el usuario existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', testEmail)
      .single()

    let userId
    if (existingUser) {
      userId = existingUser.id
      console.log('✅ Usuario de prueba ya existe')
    } else {
      // Crear usuario de prueba
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          email: testEmail,
          name: 'Sebastián León',
          role: 'admin'
        })
        .select('id')
        .single()

      if (userError) {
        console.log('❌ Error al crear usuario de prueba:', userError.message)
        return
      }

      userId = newUser.id
      console.log('✅ Usuario de prueba creado')
    }

    // 3. Configurar notificaciones para el usuario de prueba
    console.log('\n⚙️ Configurando notificaciones para el usuario...')
    
    for (const notificationType of notificationTypes) {
      const { error: settingsError } = await supabase
        .from('user_notification_settings')
        .upsert({
          user_id: userId,
          notification_type_id: notificationType.id,
          is_enabled: true,
          email_enabled: true,
          days_before: 7
        })

      if (settingsError) {
        console.log(`❌ Error configurando ${notificationType.name}:`, settingsError.message)
      } else {
        console.log(`✅ Configurado: ${notificationType.name}`)
      }
    }

    // 4. Crear eventos de notificación de prueba
    console.log('\n📅 Creando eventos de notificación de prueba...')
    
    const testEvents = [
      {
        event_type: 'document_expiring',
        entity_type: 'document',
        entity_id: '00000000-0000-0000-0000-000000000001',
        event_date: new Date().toISOString(),
        notification_type_name: 'document_expiring'
      },
      {
        event_type: 'assembly_reminder',
        entity_type: 'assembly',
        entity_id: '00000000-0000-0000-0000-000000000002',
        event_date: new Date().toISOString(),
        notification_type_name: 'assembly_reminder'
      },
      {
        event_type: 'insurance_expiring',
        entity_type: 'insurance',
        entity_id: '00000000-0000-0000-0000-000000000003',
        event_date: new Date().toISOString(),
        notification_type_name: 'insurance_expiring'
      },
      {
        event_type: 'compliance_alert',
        entity_type: 'condo',
        entity_id: '00000000-0000-0000-0000-000000000004',
        event_date: new Date().toISOString(),
        notification_type_name: 'compliance_alert'
      }
    ]

    const createdEvents = []
    for (const event of testEvents) {
      try {
        const { data: eventId, error: eventError } = await supabase.rpc('create_notification_event', {
          p_event_type: event.event_type,
          p_entity_type: event.entity_type,
          p_entity_id: event.entity_id,
          p_event_date: event.event_date,
          p_notification_type_name: event.notification_type_name
        })

        if (eventError) {
          console.log(`❌ Error creando evento ${event.event_type}:`, eventError.message)
        } else {
          console.log(`✅ Evento creado: ${event.event_type} (${eventId})`)
          createdEvents.push({ ...event, event_id: eventId })
        }
      } catch (error) {
        console.log(`❌ Error creando evento ${event.event_type}:`, error.message)
      }
    }

    // 5. Procesar eventos y enviar notificaciones
    console.log('\n📧 Procesando eventos y enviando notificaciones...')
    
    for (const event of createdEvents) {
      try {
        // Obtener el evento completo con templates
        const { data: fullEvent, error: eventError } = await supabase.rpc('get_pending_notification_events')
        
        if (eventError) {
          console.log(`❌ Error obteniendo evento completo:`, eventError.message)
          continue
        }

        const eventData = fullEvent.find(e => e.event_id === event.event_id)
        if (!eventData) {
          console.log(`❌ No se encontró el evento ${event.event_id}`)
          continue
        }

        // Generar contenido del email
        const emailContent = await generateTestEmailContent(eventData)
        
        if (!emailContent) {
          console.log(`❌ No se pudo generar contenido para ${event.event_type}`)
          continue
        }

        // Enviar email usando la Edge Function
        const emailResult = await sendTestEmail(testEmail, emailContent.subject, emailContent.body)
        
        if (emailResult.success) {
          console.log(`✅ Email enviado: ${event.event_type}`)
          
          // Marcar evento como procesado
          await supabase.rpc('mark_notification_event_processed', {
            event_uuid: event.event_id
          })
        } else {
          console.log(`❌ Error enviando email ${event.event_type}:`, emailResult.error)
        }
      } catch (error) {
        console.log(`❌ Error procesando evento ${event.event_type}:`, error.message)
      }
    }

    console.log('\n' + '='.repeat(60) + '\n')
    console.log('🎉 ¡NOTIFICACIONES DE PRUEBA ENVIADAS! 🎉')
    console.log(`📧 Enviadas a: ${testEmail}`)
    console.log(`📊 Total de tipos: ${notificationTypes.length}`)
    console.log(`📅 Eventos creados: ${createdEvents.length}`)
    console.log('\n✅ Sistema de notificaciones completamente funcional')

  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

// Función para generar contenido de email de prueba
async function generateTestEmailContent(event) {
  const variables = {
    condo_name: 'Condominio de Prueba',
    document_name: 'Documento de Prueba',
    expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-CL'),
    assembly_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('es-CL'),
    assembly_time: '19:00',
    assembly_location: 'Salón de Eventos',
    assembly_type: 'Ordinaria',
    insurance_type: 'Seguro de Incendio',
    compliance_items: 'Asamblea anual, Plan de evacuación, Seguro vigente'
  }

  let subject = event.template_subject || 'Notificación de Prueba'
  let body = event.template_body || 'Esta es una notificación de prueba del sistema.'

  // Reemplazar variables
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    subject = subject.replace(regex, value)
    body = body.replace(regex, value)
  })

  return {
    subject,
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #BF7F11, #D4A574); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🏢 Lex Realis</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #BF7F11; margin-top: 0;">${subject}</h2>
          ${body}
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #666; font-size: 14px; text-align: center;">
            <strong>🧪 NOTIFICACIÓN DE PRUEBA</strong><br>
            Este es un mensaje automático del sistema Lex Realis.<br>
            Para modificar tus preferencias de notificaciones, visita la sección de configuración.
          </p>
        </div>
      </div>
    `
  }
}

// Función para enviar email de prueba
async function sendTestEmail(to, subject, html) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  
  try {
    const { data, error } = await supabase.functions.invoke('smooth-task', {
      body: {
        to,
        subject: `[PRUEBA] ${subject}`,
        html
      }
    })

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      emailId: data?.data?.id || 'unknown'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Ejecutar el script
sendTestNotifications().catch(console.error)
