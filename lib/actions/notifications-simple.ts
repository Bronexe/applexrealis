"use server"

import { createClient } from "@/lib/supabase/server"
import { EmailService } from "@/lib/services/email"

export async function checkExpiringDocumentsSimple() {
  const supabase = await createClient()
  
  try {
    // Obtener usuarios con notificaciones de vencimiento habilitadas
    // Usar una consulta más simple sin la relación compleja
    const { data: users, error: usersError } = await supabase
      .from("notification_settings")
      .select("*")
      .eq("expiration_notifications_enabled", true)
      .eq("expiration_email_enabled", true)

    if (usersError) {
      console.error("Error fetching users:", usersError)
      return { success: false, error: usersError.message }
    }

    if (!users || users.length === 0) {
      console.log("No users with expiration notifications enabled")
      return { success: true, message: "No users to notify", totalSent: 0, totalErrors: 0 }
    }

    const results = []

    for (const user of users) {
      // Obtener el email del usuario directamente
      const { data: userData } = await supabase.auth.admin.getUserById(user.user_id)
      const userEmail = userData?.user?.email
      
      if (!userEmail) continue

      // Buscar documentos próximos a vencer para este usuario
      const { data: condos } = await supabase
        .from("condos")
        .select("id, name")
        .eq("user_id", user.user_id)

      if (!condos || condos.length === 0) continue

      for (const condo of condos) {
        // Buscar seguros próximos a vencer
        const { data: expiringInsurances } = await supabase
          .from("insurances")
          .select("id, policy_number, insurer, valid_to, insurance_type")
          .eq("condo_id", condo.id)
          .gte("valid_to", new Date().toISOString().split("T")[0])
          .lte("valid_to", new Date(Date.now() + user.expiration_days_before * 24 * 60 * 60 * 1000).toISOString().split("T")[0])

        // Buscar certificaciones próximas a vencer
        const { data: expiringCertifications } = await supabase
          .from("certifications")
          .select("id, kind, valid_to")
          .eq("condo_id", condo.id)
          .gte("valid_to", new Date().toISOString().split("T")[0])
          .lte("valid_to", new Date(Date.now() + user.expiration_days_before * 24 * 60 * 60 * 1000).toISOString().split("T")[0])

        // Enviar notificaciones para seguros
        for (const insurance of expiringInsurances || []) {
          const daysUntilExpiration = Math.ceil(
            (new Date(insurance.valid_to).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          )
          
          const documentName = `Seguro ${insurance.insurance_type?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} - ${insurance.insurer}`
          
          try {
            await EmailService.sendExpirationAlert(
              userEmail,
              documentName,
              daysUntilExpiration,
              condo.name
            )
            results.push({ success: true, user: userEmail, document: documentName })
          } catch (error) {
            console.error(`Error sending email to ${userEmail}:`, error)
            results.push({ success: false, user: userEmail, error: error instanceof Error ? error.message : "Unknown error" })
          }
        }

        // Enviar notificaciones para certificaciones
        for (const certification of expiringCertifications || []) {
          const daysUntilExpiration = Math.ceil(
            (new Date(certification.valid_to).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          )
          
          const documentName = `Certificación ${certification.kind}`
          
          try {
            await EmailService.sendExpirationAlert(
              userEmail,
              documentName,
              daysUntilExpiration,
              condo.name
            )
            results.push({ success: true, user: userEmail, document: documentName })
          } catch (error) {
            console.error(`Error sending email to ${userEmail}:`, error)
            results.push({ success: false, user: userEmail, error: error instanceof Error ? error.message : "Unknown error" })
          }
        }
      }
    }

    return { 
      success: true, 
      results,
      totalSent: results.filter(r => r.success).length,
      totalErrors: results.filter(r => !r.success).length
    }
  } catch (error) {
    console.error("Error in checkExpiringDocumentsSimple:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}

export async function checkAssemblyRemindersSimple() {
  const supabase = await createClient()
  
  try {
    // Obtener usuarios con recordatorios de asambleas habilitados
    const { data: users, error: usersError } = await supabase
      .from("notification_settings")
      .select("*")
      .eq("assembly_reminders_enabled", true)
      .eq("assembly_reminder_email_enabled", true)

    if (usersError) {
      console.error("Error fetching users:", usersError)
      return { success: false, error: usersError.message }
    }

    if (!users || users.length === 0) {
      console.log("No users with assembly reminders enabled")
      return { success: true, message: "No users to notify", totalSent: 0, totalErrors: 0 }
    }

    const results = []

    for (const user of users) {
      // Obtener el email del usuario directamente
      const { data: userData } = await supabase.auth.admin.getUserById(user.user_id)
      const userEmail = userData?.user?.email
      
      if (!userEmail) continue

      // Buscar asambleas próximas para este usuario
      const { data: condos } = await supabase
        .from("condos")
        .select("id, name")
        .eq("user_id", user.user_id)

      if (!condos || condos.length === 0) continue

      for (const condo of condos) {
        const { data: upcomingAssemblies } = await supabase
          .from("assemblies")
          .select("id, type, date")
          .eq("condo_id", condo.id)
          .gte("date", new Date().toISOString().split("T")[0])
          .lte("date", new Date(Date.now() + user.assembly_reminder_days_before * 24 * 60 * 60 * 1000).toISOString().split("T")[0])

        for (const assembly of upcomingAssemblies || []) {
          try {
            await EmailService.sendAssemblyReminder(
              userEmail,
              assembly.date,
              assembly.type,
              condo.name
            )
            results.push({ success: true, user: userEmail, assembly: `${assembly.type} - ${condo.name}` })
          } catch (error) {
            console.error(`Error sending email to ${userEmail}:`, error)
            results.push({ success: false, user: userEmail, error: error instanceof Error ? error.message : "Unknown error" })
          }
        }
      }
    }

    return { 
      success: true, 
      results,
      totalSent: results.filter(r => r.success).length,
      totalErrors: results.filter(r => !r.success).length
    }
  } catch (error) {
    console.error("Error in checkAssemblyRemindersSimple:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}
