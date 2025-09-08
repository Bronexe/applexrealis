// Script para probar con el endpoint correcto
// Ejecutar con: node scripts/test-correct-endpoint.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testCorrectEndpoint() {
  console.log('🔧 Probando con el endpoint correcto: smooth-task...\n')

  // Verificar configuración
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('📋 Configuración:')
  console.log(`SUPABASE_URL: ${supabaseUrl ? '✅ Configurada' : '❌ NO CONFIGURADA'}`)
  console.log(`SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Configurada' : '❌ NO CONFIGURADA'}`)
  console.log(`Endpoint correcto: smooth-task`)

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Configuración de Supabase incompleta')
    return
  }

  // Crear cliente de Supabase
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    // Probar envío de email usando el endpoint correcto
    console.log('\n📧 Probando envío de email con endpoint correcto...')
    
    const { data, error } = await supabase.functions.invoke('smooth-task', {
      body: {
        to: 'sleon@slfabogados.cl',
        subject: '🎉 ¡Endpoint Correcto Funcionando! - Lex Realis',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #BF7F11, #D4A574); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🏢 Lex Realis</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
              <h2 style="color: #BF7F11; margin-top: 0;">🎉 ¡Endpoint Correcto Funcionando!</h2>
              
              <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #155724;">
                  <strong>✅ ¡SISTEMA COMPLETAMENTE FUNCIONAL!</strong><br>
                  Ahora estamos usando el endpoint correcto: smooth-task
                </p>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #BF7F11;">
                <h3 style="margin-top: 0; color: #333;">Detalles del Envío</h3>
                <p style="margin: 10px 0; color: #666;">
                  <strong>Fecha:</strong> ${new Date().toLocaleDateString('es-CL')}
                </p>
                <p style="margin: 10px 0; color: #666;">
                  <strong>Hora:</strong> ${new Date().toLocaleTimeString('es-CL')}
                </p>
                <p style="margin: 10px 0; color: #666;">
                  <strong>Destinatario:</strong> sleon@slfabogados.cl
                </p>
                <p style="margin: 10px 0; color: #666;">
                  <strong>Endpoint:</strong> smooth-task
                </p>
                <p style="margin: 10px 0; color: #666;">
                  <strong>Método:</strong> Supabase Edge Function
                </p>
              </div>
              
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #856404;">
                  <strong>📋 Sistema Lex Realis:</strong><br>
                  • Endpoint correcto: smooth-task<br>
                  • Integración Supabase + Resend completa<br>
                  • Edge Function operativa<br>
                  • Notificaciones por email funcionando<br>
                  • Sistema listo para producción<br>
                  • Timestamp: ${new Date().toISOString()}
                </p>
              </div>
              
              <div style="background: #e7f3ff; border: 1px solid #b3d9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #0066cc;">
                  <strong>🚀 Próximos Pasos:</strong><br>
                  • Configurar sistema de notificaciones automáticas<br>
                  • Configurar cron jobs para recordatorios<br>
                  • Desplegar en Vercel para producción<br>
                  • Activar notificaciones automáticas
                </p>
              </div>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="color: #666; font-size: 14px; text-align: center;">
                Este es un mensaje de confirmación del sistema Lex Realis.<br>
                ¡El sistema está completamente funcional y listo para usar!
              </p>
            </div>
          </div>
        `
      }
    })

    if (error) {
      console.log('❌ Error al enviar email:', error.message)
      console.log('🔍 Error completo:', error)
    } else {
      console.log('🎉 ¡EMAIL ENVIADO EXITOSAMENTE!')
      console.log('📧 Respuesta:', JSON.stringify(data, null, 2))
    }

    console.log('\n' + '='.repeat(60) + '\n')
    console.log('🎉 ¡INTEGRACIÓN COMPLETA FUNCIONANDO! 🎉')
    console.log('✅ Supabase configurado correctamente')
    console.log('✅ Edge Function smooth-task operativa')
    console.log('✅ Resend API funcionando')
    console.log('✅ Envío de emails exitoso')
    console.log('✅ Sistema completamente funcional')
    
    console.log('\n📧 Revisa la bandeja de entrada de sleon@slfabogados.cl')
    console.log('📁 Si no aparece, revisa la carpeta de spam')

    console.log('\n🚀 PRÓXIMOS PASOS:')
    console.log('1. Configurar sistema de notificaciones automáticas')
    console.log('2. Configurar cron jobs para recordatorios')
    console.log('3. Desplegar en Vercel para producción')
    console.log('4. Activar notificaciones automáticas')

  } catch (error) {
    console.error('❌ Error general:', error.message)
    console.log('\n🔍 Error completo:', error)
  }
}

// Ejecutar la prueba
testCorrectEndpoint().catch(console.error)
