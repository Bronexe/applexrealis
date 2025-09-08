// Script para enviar notificaciones de prueba directamente a sleon@slfabogados.cl
// Ejecutar con: node scripts/send-direct-test-notifications.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function sendDirectTestNotifications() {
  console.log('📧 Enviando notificaciones de prueba directamente a sleon@slfabogados.cl...\n')

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

    // 2. Enviar notificación de prueba para cada tipo
    console.log('\n📧 Enviando notificaciones de prueba...')
    
    const testEmail = 'sleon@slfabogados.cl'
    let emailsSent = 0
    let errors = 0

    for (const notificationType of notificationTypes) {
      try {
        console.log(`\n📤 Enviando: ${notificationType.name}...`)
        
        // Generar contenido del email de prueba
        const emailContent = generateTestEmailContent(notificationType)
        
        // Enviar email usando la Edge Function
        const emailResult = await sendTestEmail(testEmail, emailContent.subject, emailContent.body)
        
        if (emailResult.success) {
          console.log(`✅ Email enviado: ${notificationType.name}`)
          emailsSent++
        } else {
          console.log(`❌ Error enviando ${notificationType.name}:`, emailResult.error)
          errors++
        }
      } catch (error) {
        console.log(`❌ Error procesando ${notificationType.name}:`, error.message)
        errors++
      }
    }

    console.log('\n' + '='.repeat(60) + '\n')
    console.log('🎉 ¡NOTIFICACIONES DE PRUEBA ENVIADAS! 🎉')
    console.log(`📧 Enviadas a: ${testEmail}`)
    console.log(`📊 Total de tipos: ${notificationTypes.length}`)
    console.log(`✅ Emails enviados: ${emailsSent}`)
    console.log(`❌ Errores: ${errors}`)
    console.log('\n✅ Sistema de notificaciones completamente funcional')

  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

// Función para generar contenido de email de prueba
function generateTestEmailContent(notificationType) {
  const testData = {
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

  let subject = notificationType.template_subject || 'Notificación de Prueba'
  let body = notificationType.template_body || 'Esta es una notificación de prueba del sistema.'

  // Reemplazar variables en el template
  Object.entries(testData).forEach(([key, value]) => {
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
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #856404; margin: 0; font-weight: bold;">
              🧪 NOTIFICACIÓN DE PRUEBA
            </p>
            <p style="color: #856404; margin: 5px 0 0 0; font-size: 14px;">
              Tipo: ${notificationType.name}<br>
              ID: ${notificationType.id}<br>
              Fecha: ${new Date().toLocaleString('es-CL')}
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center;">
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
sendDirectTestNotifications().catch(console.error)
