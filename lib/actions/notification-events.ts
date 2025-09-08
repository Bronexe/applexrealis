// Acciones para crear eventos de notificaciones automáticas
'use server'

import { createClient } from '@supabase/supabase-js'

/**
 * Crea eventos de notificación para documentos próximos a vencer
 */
export async function createDocumentExpirationEvents() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  try {
    console.log('Creating document expiration events...')

    // Obtener documentos que vencen en los próximos 30 días
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const { data: documents, error } = await supabase
      .from('documents')
      .select(`
        id,
        name,
        expiry_date,
        condos!documents_condo_id_fkey (
          id,
          name
        )
      `)
      .lte('expiry_date', thirtyDaysFromNow.toISOString())
      .gte('expiry_date', new Date().toISOString())

    if (error) {
      console.error('Error fetching documents:', error)
      throw new Error('Error al obtener documentos')
    }

    let eventsCreated = 0

    for (const document of documents || []) {
      if (!document.condos) continue

      const expiryDate = new Date(document.expiry_date)
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

      // Crear evento para 30 días antes
      if (daysUntilExpiry <= 30 && daysUntilExpiry > 7) {
        const eventDate = new Date(expiryDate)
        eventDate.setDate(eventDate.getDate() - 30)

        await createNotificationEvent(
          'document_expiring',
          'document',
          document.id,
          eventDate,
          'document_expiring'
        )
        eventsCreated++
      }

      // Crear evento para 7 días antes
      if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
        const eventDate = new Date(expiryDate)
        eventDate.setDate(eventDate.getDate() - 7)

        await createNotificationEvent(
          'document_expiring',
          'document',
          document.id,
          eventDate,
          'document_expiring'
        )
        eventsCreated++
      }

      // Crear evento para documentos vencidos
      if (daysUntilExpiry <= 0) {
        await createNotificationEvent(
          'document_expired',
          'document',
          document.id,
          new Date(),
          'document_expired'
        )
        eventsCreated++
      }
    }

    console.log(`Created ${eventsCreated} document expiration events`)
    return { success: true, eventsCreated }

  } catch (error) {
    console.error('Error creating document expiration events:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Crea eventos de notificación para asambleas próximas
 */
export async function createAssemblyReminderEvents() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  try {
    console.log('Creating assembly reminder events...')

    // Obtener asambleas en los próximos 30 días
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const { data: assemblies, error } = await supabase
      .from('assemblies')
      .select(`
        id,
        date,
        time,
        location,
        type,
        condos!assemblies_condo_id_fkey (
          id,
          name
        )
      `)
      .lte('date', thirtyDaysFromNow.toISOString())
      .gte('date', new Date().toISOString())

    if (error) {
      console.error('Error fetching assemblies:', error)
      throw new Error('Error al obtener asambleas')
    }

    let eventsCreated = 0

    for (const assembly of assemblies || []) {
      if (!assembly.condos) continue

      const assemblyDate = new Date(assembly.date)
      const daysUntilAssembly = Math.ceil((assemblyDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

      // Crear evento para 7 días antes
      if (daysUntilAssembly <= 7 && daysUntilAssembly > 0) {
        const eventDate = new Date(assemblyDate)
        eventDate.setDate(eventDate.getDate() - 7)

        await createNotificationEvent(
          'assembly_reminder',
          'assembly',
          assembly.id,
          eventDate,
          'assembly_reminder'
        )
        eventsCreated++
      }

      // Crear evento para 1 día antes
      if (daysUntilAssembly <= 1 && daysUntilAssembly > 0) {
        const eventDate = new Date(assemblyDate)
        eventDate.setDate(eventDate.getDate() - 1)

        await createNotificationEvent(
          'assembly_reminder',
          'assembly',
          assembly.id,
          eventDate,
          'assembly_reminder'
        )
        eventsCreated++
      }
    }

    console.log(`Created ${eventsCreated} assembly reminder events`)
    return { success: true, eventsCreated }

  } catch (error) {
    console.error('Error creating assembly reminder events:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Crea eventos de notificación para seguros próximos a vencer
 */
export async function createInsuranceExpirationEvents() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  try {
    console.log('Creating insurance expiration events...')

    // Obtener seguros que vencen en los próximos 30 días
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const { data: insurances, error } = await supabase
      .from('insurances')
      .select(`
        id,
        insurance_type,
        expiry_date,
        condos!insurances_condo_id_fkey (
          id,
          name
        )
      `)
      .lte('expiry_date', thirtyDaysFromNow.toISOString())
      .gte('expiry_date', new Date().toISOString())

    if (error) {
      console.error('Error fetching insurances:', error)
      throw new Error('Error al obtener seguros')
    }

    let eventsCreated = 0

    for (const insurance of insurances || []) {
      if (!insurance.condos) continue

      const expiryDate = new Date(insurance.expiry_date)
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

      // Crear evento para 30 días antes
      if (daysUntilExpiry <= 30 && daysUntilExpiry > 7) {
        const eventDate = new Date(expiryDate)
        eventDate.setDate(eventDate.getDate() - 30)

        await createNotificationEvent(
          'insurance_expiring',
          'insurance',
          insurance.id,
          eventDate,
          'insurance_expiring'
        )
        eventsCreated++
      }

      // Crear evento para 7 días antes
      if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
        const eventDate = new Date(expiryDate)
        eventDate.setDate(eventDate.getDate() - 7)

        await createNotificationEvent(
          'insurance_expiring',
          'insurance',
          insurance.id,
          eventDate,
          'insurance_expiring'
        )
        eventsCreated++
      }
    }

    console.log(`Created ${eventsCreated} insurance expiration events`)
    return { success: true, eventsCreated }

  } catch (error) {
    console.error('Error creating insurance expiration events:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Crea eventos de notificación para alertas de cumplimiento
 */
export async function createComplianceAlertEvents() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  try {
    console.log('Creating compliance alert events...')

    // Obtener condominios con problemas de cumplimiento
    const { data: condos, error } = await supabase
      .from('condos')
      .select(`
        id,
        name,
        compliance_status
      `)
      .neq('compliance_status', 'compliant')

    if (error) {
      console.error('Error fetching condos:', error)
      throw new Error('Error al obtener condominios')
    }

    let eventsCreated = 0

    for (const condo of condos || []) {
      // Crear evento de alerta de cumplimiento
      await createNotificationEvent(
        'compliance_alert',
        'condo',
        condo.id,
        new Date(),
        'compliance_alert'
      )
      eventsCreated++
    }

    console.log(`Created ${eventsCreated} compliance alert events`)
    return { success: true, eventsCreated }

  } catch (error) {
    console.error('Error creating compliance alert events:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Crea todos los eventos de notificación necesarios
 */
export async function createAllNotificationEvents() {
  console.log('Creating all notification events...')

  try {
    const results = await Promise.all([
      createDocumentExpirationEvents(),
      createAssemblyReminderEvents(),
      createInsuranceExpirationEvents(),
      createComplianceAlertEvents()
    ])

    const totalEvents = results.reduce((sum, result) => sum + (result.eventsCreated || 0), 0)
    const errors = results.filter(result => !result.success).length

    console.log(`Created ${totalEvents} total notification events with ${errors} errors`)

    return {
      success: true,
      totalEvents,
      errors,
      results
    }

  } catch (error) {
    console.error('Error creating all notification events:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      totalEvents: 0,
      errors: 1
    }
  }
}

/**
 * Función auxiliar para crear eventos de notificación
 */
async function createNotificationEvent(
  eventType: string,
  entityType: string,
  entityId: string,
  eventDate: Date,
  notificationTypeName: string
) {
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
