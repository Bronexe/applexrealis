// Script para debuggear el error de assembly_reminder
// Ejecutar con: node scripts/debug-assembly-reminder.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function debugAssemblyReminder() {
  console.log('🔍 Debuggeando error de assembly_reminder...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.log('❌ Configuración incompleta')
    return
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  try {
    // 1. Obtener el tipo de notificación assembly_reminder
    console.log('🔍 Obteniendo tipo de notificación assembly_reminder...')
    const { data: notificationType, error: typesError } = await supabase
      .from('notification_types')
      .select('*')
      .eq('name', 'assembly_reminder')
      .single()

    if (typesError) {
      console.log('❌ Error al obtener assembly_reminder:', typesError.message)
      return
    }

    console.log('✅ Tipo de notificación encontrado:')
    console.log(`   ID: ${notificationType.id}`)
    console.log(`   Nombre: ${notificationType.name}`)
    console.log(`   Asunto: ${notificationType.template_subject}`)
    console.log(`   Cuerpo: ${notificationType.template_body}`)

    // 2. Generar contenido del email
    console.log('\n📧 Generando contenido del email...')
    const emailContent = generateTestEmailContent(notificationType)
    console.log('✅ Contenido generado:')
    console.log(`   Asunto: ${emailContent.subject}`)
    console.log(`   Cuerpo (primeros 200 chars): ${emailContent.body.substring(0, 200)}...`)

    // 3. Probar envío de email con más detalles
    console.log('\n📤 Probando envío de email...')
    const testEmail = 'sleon@slfabogados.cl'
    
    try {
      const { data, error } = await supabase.functions.invoke('smooth-task', {
        body: {
          to: testEmail,
          subject: `[DEBUG] ${emailContent.subject}`,
          html: emailContent.body
        }
      })

      if (error) {
        console.log('❌ Error en Edge Function:')
        console.log(`   Código: ${error.status || 'N/A'}`)
        console.log(`   Mensaje: ${error.message}`)
        console.log(`   Detalles: ${JSON.stringify(error, null, 2)}`)
      } else {
        console.log('✅ Email enviado exitosamente:')
        console.log(`   Respuesta: ${JSON.stringify(data, null, 2)}`)
      }
    } catch (invokeError) {
      console.log('❌ Error al invocar Edge Function:')
      console.log(`   Mensaje: ${invokeError.message}`)
      console.log(`   Stack: ${invokeError.stack}`)
    }

    // 4. Verificar el estado de la Edge Function
    console.log('\n🔍 Verificando estado de la Edge Function...')
    try {
      const { data: functions, error: functionsError } = await supabase
        .from('functions')
        .select('*')

      if (functionsError) {
        console.log('❌ Error al obtener funciones:', functionsError.message)
      } else {
        console.log('✅ Funciones disponibles:', functions)
      }
    } catch (error) {
      console.log('❌ Error al verificar funciones:', error.message)
    }

    // 5. Probar con un email más simple
    console.log('\n📧 Probando con email simple...')
    try {
      const simpleEmail = {
        to: testEmail,
        subject: '[DEBUG] Test Simple',
        html: '<h1>Test Simple</h1><p>Este es un test simple.</p>'
      }

      const { data: simpleData, error: simpleError } = await supabase.functions.invoke('smooth-task', {
        body: simpleEmail
      })

      if (simpleError) {
        console.log('❌ Error con email simple:')
        console.log(`   Mensaje: ${simpleError.message}`)
        console.log(`   Detalles: ${JSON.stringify(simpleError, null, 2)}`)
      } else {
        console.log('✅ Email simple enviado exitosamente:')
        console.log(`   Respuesta: ${JSON.stringify(simpleData, null, 2)}`)
      }
    } catch (error) {
      console.log('❌ Error con email simple:', error.message)
    }

  } catch (error) {
    console.error('❌ Error general:', error.message)
    console.error('Stack:', error.stack)
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

// Ejecutar el debug
debugAssemblyReminder().catch(console.error)
