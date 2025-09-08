// Acciones para el sistema de notificaciones automáticas
'use server'

import { createClient } from '@supabase/supabase-js'
import { EmailService } from '@/lib/services/email'

export interface NotificationEvent {
  event_id: string
  event_type: string
  entity_type: string
  entity_id: string
  event_date: string
  notification_type_id: string
  notification_name: string
  template_subject: string
  template_body: string
}

export interface UserNotificationSettings {
  notification_type_id: string
  notification_name: string
  is_enabled: boolean
  email_enabled: boolean
  days_before: number
  template_subject: string
  template_body: string
}

/**
 * Obtiene la configuración de notificaciones de un usuario
 */
export async function getUserNotificationSettings(userId: string): Promise<UserNotificationSettings[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const { data, error } = await supabase.rpc('get_user_notification_settings', {
    user_uuid: userId
  })

  if (error) {
    console.error('Error getting user notification settings:', error)
    throw new Error('Error al obtener configuración de notificaciones')
  }

  return data || []
}

/**
 * Actualiza la configuración de notificaciones de un usuario
 */
export async function updateUserNotificationSettings(
  userId: string,
  notificationTypeId: string,
  settings: {
    is_enabled?: boolean
    email_enabled?: boolean
    days_before?: number
  }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const { error } = await supabase
    .from('user_notification_settings')
    .upsert({
      user_id: userId,
      notification_type_id: notificationTypeId,
      ...settings
    })

  if (error) {
    console.error('Error updating user notification settings:', error)
    throw new Error('Error al actualizar configuración de notificaciones')
  }
}

/**
 * Obtiene eventos de notificación pendientes
 */
export async function getPendingNotificationEvents(): Promise<NotificationEvent[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const { data, error } = await supabase.rpc('get_pending_notification_events')

  if (error) {
    console.error('Error getting pending notification events:', error)
    throw new Error('Error al obtener eventos pendientes')
  }

  return data || []
}

/**
 * Marca un evento como procesado
 */
export async function markNotificationEventProcessed(eventId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const { error } = await supabase.rpc('mark_notification_event_processed', {
    event_uuid: eventId
  })

  if (error) {
    console.error('Error marking notification event as processed:', error)
    throw new Error('Error al marcar evento como procesado')
  }
}

/**
 * Crea un evento de notificación
 */
export async function createNotificationEvent(
  eventType: string,
  entityType: string,
  entityId: string,
  eventDate: Date,
  notificationTypeName: string
): Promise<string> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const { data, error } = await supabase.rpc('create_notification_event', {
    p_event_type: eventType,
    p_entity_type: entityType,
    p_entity_id: entityId,
    p_event_date: eventDate.toISOString(),
    p_notification_type_name: notificationTypeName
  })

  if (error) {
    console.error('Error creating notification event:', error)
    throw new Error('Error al crear evento de notificación')
  }

  return data
}

/**
 * Obtiene usuarios que deben recibir notificaciones para un evento
 */
export async function getUsersForNotification(
  eventType: string,
  entityType: string,
  entityId: string
): Promise<Array<{ user_id: string; email: string; settings: UserNotificationSettings[] }>> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  // Obtener usuarios relacionados con la entidad
  let usersQuery = supabase.from('users').select('id, email')
  
  if (entityType === 'condo') {
    // Para condominios, obtener usuarios que tienen acceso
    usersQuery = supabase
      .from('condos')
      .select(`
        users!condos_user_id_fkey (
          id,
          email
        )
      `)
      .eq('id', entityId)
      .single()
  }
  
  const { data: usersData, error: usersError } = await usersQuery
  
  if (usersError) {
    console.error('Error getting users for notification:', usersError)
    return []
  }

  const users = Array.isArray(usersData) ? usersData : [usersData]
  
  // Obtener configuración de notificaciones para cada usuario
  const usersWithSettings = await Promise.all(
    users.map(async (user) => {
      const settings = await getUserNotificationSettings(user.id)
      return {
        user_id: user.id,
        email: user.email,
        settings
      }
    })
  )

  return usersWithSettings
}

/**
 * Procesa un evento de notificación y envía emails
 */
export async function processNotificationEvent(event: NotificationEvent) {
  console.log(`Processing notification event: ${event.event_id}`)
  
  try {
    // Obtener usuarios que deben recibir la notificación
    const users = await getUsersForNotification(
      event.event_type,
      event.entity_type,
      event.entity_id
    )

    let emailsSent = 0
    let errors = 0

    for (const user of users) {
      try {
        // Verificar si el usuario tiene habilitadas las notificaciones para este tipo
        const userSettings = user.settings.find(
          s => s.notification_type_id === event.notification_type_id
        )

        if (!userSettings || !userSettings.is_enabled || !userSettings.email_enabled) {
          console.log(`User ${user.user_id} has notifications disabled for ${event.notification_name}`)
          continue
        }

        // Generar contenido del email
        const emailContent = await generateEmailContent(event, user.user_id)
        
        if (!emailContent) {
          console.log(`Could not generate email content for user ${user.user_id}`)
          continue
        }

        // Enviar email usando la Edge Function
        const emailResult = await sendNotificationEmail(
          user.email,
          emailContent.subject,
          emailContent.body
        )

        if (emailResult.success) {
          // Registrar en el historial
          await recordNotificationSent(
            user.user_id,
            event.notification_type_id,
            event.entity_type,
            event.entity_id,
            emailContent.subject,
            emailContent.body,
            emailResult.emailId
          )
          
          emailsSent++
          console.log(`Email sent successfully to ${user.email}`)
        } else {
          console.error(`Failed to send email to ${user.email}:`, emailResult.error)
          errors++
        }
      } catch (error) {
        console.error(`Error processing notification for user ${user.user_id}:`, error)
        errors++
      }
    }

    // Marcar evento como procesado
    await markNotificationEventProcessed(event.event_id)

    console.log(`Notification event ${event.event_id} processed: ${emailsSent} emails sent, ${errors} errors`)

    return {
      success: true,
      emailsSent,
      errors,
      eventId: event.event_id
    }
  } catch (error) {
    console.error(`Error processing notification event ${event.event_id}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      eventId: event.event_id
    }
  }
}

/**
 * Genera el contenido del email basado en el evento y datos de la entidad
 */
async function generateEmailContent(event: NotificationEvent, userId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  try {
    // Obtener datos de la entidad
    let entityData: any = {}
    
    if (event.entity_type === 'condo') {
      const { data: condoData } = await supabase
        .from('condos')
        .select('*')
        .eq('id', event.entity_id)
        .single()
      entityData = condoData
    } else if (event.entity_type === 'document') {
      const { data: documentData } = await supabase
        .from('documents')
        .select(`
          *,
          condos (*)
        `)
        .eq('id', event.entity_id)
        .single()
      entityData = documentData
    } else if (event.entity_type === 'assembly') {
      const { data: assemblyData } = await supabase
        .from('assemblies')
        .select(`
          *,
          condos (*)
        `)
        .eq('id', event.entity_id)
        .single()
      entityData = assemblyData
    }

    // Reemplazar variables en el template
    let subject = event.template_subject
    let body = event.template_body

    // Variables comunes
    const variables = {
      condo_name: entityData?.condos?.name || entityData?.name || 'Condominio',
      document_name: entityData?.name || entityData?.title || 'Documento',
      expiry_date: entityData?.expiry_date ? new Date(entityData.expiry_date).toLocaleDateString('es-CL') : 'Fecha no disponible',
      assembly_date: entityData?.date ? new Date(entityData.date).toLocaleDateString('es-CL') : 'Fecha no disponible',
      assembly_time: entityData?.time || 'Hora no disponible',
      assembly_location: entityData?.location || 'Lugar no disponible',
      assembly_type: entityData?.type || 'Asamblea',
      insurance_type: entityData?.insurance_type || 'Seguro',
      compliance_items: entityData?.compliance_items || 'Requisitos pendientes'
    }

    // Reemplazar variables en subject y body
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
            ${body}
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #666; font-size: 14px; text-align: center;">
              Este es un mensaje automático del sistema Lex Realis.<br>
              Para modificar tus preferencias de notificaciones, visita la sección de configuración.
            </p>
          </div>
        </div>
      `
    }
  } catch (error) {
    console.error('Error generating email content:', error)
    return null
  }
}

/**
 * Envía email de notificación usando la Edge Function
 */
async function sendNotificationEmail(to: string, subject: string, html: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  try {
    const { data, error } = await supabase.functions.invoke('smooth-task', {
      body: {
        to,
        subject,
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

/**
 * Registra una notificación enviada en el historial
 */
async function recordNotificationSent(
  userId: string,
  notificationTypeId: string,
  entityType: string,
  entityId: string,
  subject: string,
  body: string,
  emailId: string
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const { error } = await supabase
    .from('notification_history')
    .insert({
      user_id: userId,
      notification_type_id: notificationTypeId,
      related_entity_type: entityType,
      related_entity_id: entityId,
      subject,
      body,
      email_id: emailId,
      status: 'sent'
    })

  if (error) {
    console.error('Error recording notification sent:', error)
  }
}

/**
 * Procesa todos los eventos de notificación pendientes
 */
export async function processAllPendingNotifications() {
  console.log('Starting to process all pending notifications...')
  
  try {
    const pendingEvents = await getPendingNotificationEvents()
    
    if (pendingEvents.length === 0) {
      console.log('No pending notification events found')
      return {
        success: true,
        message: 'No pending events',
        processed: 0,
        totalSent: 0,
        totalErrors: 0
      }
    }

    console.log(`Found ${pendingEvents.length} pending notification events`)

    let totalSent = 0
    let totalErrors = 0
    const results = []

    for (const event of pendingEvents) {
      const result = await processNotificationEvent(event)
      results.push(result)
      
      if (result.success) {
        totalSent += result.emailsSent || 0
        totalErrors += result.errors || 0
      } else {
        totalErrors++
      }
    }

    console.log(`Processed ${pendingEvents.length} events: ${totalSent} emails sent, ${totalErrors} errors`)

    return {
      success: true,
      message: `Processed ${pendingEvents.length} events`,
      processed: pendingEvents.length,
      totalSent,
      totalErrors,
      results
    }
  } catch (error) {
    console.error('Error processing all pending notifications:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      processed: 0,
      totalSent: 0,
      totalErrors: 0
    }
  }
}
