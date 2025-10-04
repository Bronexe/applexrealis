import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/services/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email requerido' },
        { status: 400 }
      )
    }

    console.log('📧 Enviando todas las notificaciones demo a:', email)
    const results = []

    // 1. Notificación de Vencimiento de Seguro
    try {
      await EmailService.sendExpirationAlert(
        email,
        'Seguro Incendio Espacios Comunes - Compañía de Seguros XYZ',
        15,
        'Edificio Los Alamos'
      )
      results.push({ type: 'Vencimiento Seguro', success: true })
      console.log('✅ Email 1/5 enviado: Vencimiento Seguro')
    } catch (error) {
      results.push({ type: 'Vencimiento Seguro', success: false, error })
      console.error('❌ Error en Email 1/5')
    }

    // Esperar 1 segundo entre emails para evitar rate limits
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 2. Notificación de Vencimiento de Certificación
    try {
      await EmailService.sendExpirationAlert(
        email,
        'Certificación de Gas',
        25,
        'Condominio Vista Hermosa'
      )
      results.push({ type: 'Vencimiento Certificación', success: true })
      console.log('✅ Email 2/5 enviado: Vencimiento Certificación')
    } catch (error) {
      results.push({ type: 'Vencimiento Certificación', success: false, error })
      console.error('❌ Error en Email 2/5')
    }

    await new Promise(resolve => setTimeout(resolve, 1000))

    // 3. Recordatorio de Asamblea Ordinaria
    try {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)
      await EmailService.sendAssemblyReminder(
        email,
        futureDate.toISOString().split('T')[0],
        'ordinaria',
        'Edificio Los Alamos'
      )
      results.push({ type: 'Recordatorio Asamblea Ordinaria', success: true })
      console.log('✅ Email 3/5 enviado: Asamblea Ordinaria')
    } catch (error) {
      results.push({ type: 'Recordatorio Asamblea Ordinaria', success: false, error })
      console.error('❌ Error en Email 3/5')
    }

    await new Promise(resolve => setTimeout(resolve, 1000))

    // 4. Recordatorio de Asamblea Extraordinaria
    try {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 3)
      await EmailService.sendAssemblyReminder(
        email,
        futureDate.toISOString().split('T')[0],
        'extraordinaria',
        'Condominio Vista Hermosa'
      )
      results.push({ type: 'Recordatorio Asamblea Extraordinaria', success: true })
      console.log('✅ Email 4/5 enviado: Asamblea Extraordinaria')
    } catch (error) {
      results.push({ type: 'Recordatorio Asamblea Extraordinaria', success: false, error })
      console.error('❌ Error en Email 4/5')
    }

    await new Promise(resolve => setTimeout(resolve, 1000))

    // 5. Notificación General
    try {
      await EmailService.sendGeneralNotification(
        email,
        'Actualización del Sistema',
        'El sistema ha sido actualizado con nuevas funcionalidades. Ahora puedes gestionar asignaciones de condominios desde el panel de super-admin.',
        'Edificio Los Alamos'
      )
      results.push({ type: 'Notificación General', success: true })
      console.log('✅ Email 5/8 enviado: Notificación General')
    } catch (error) {
      results.push({ type: 'Notificación General', success: false, error })
      console.error('❌ Error en Email 5/8')
    }

    await new Promise(resolve => setTimeout(resolve, 1000))

    // 6. Vencimiento de Contrato (NUEVO)
    try {
      await EmailService.sendContractExpirationAlert(
        email,
        'Mantenimiento',
        'Empresa Mantenciones ABC S.A.',
        20,
        'Edificio Los Alamos'
      )
      results.push({ type: 'Vencimiento Contrato', success: true })
      console.log('✅ Email 6/8 enviado: Vencimiento Contrato')
    } catch (error) {
      results.push({ type: 'Vencimiento Contrato', success: false, error })
      console.error('❌ Error en Email 6/8')
    }

    await new Promise(resolve => setTimeout(resolve, 1000))

    // 7. Límite de Gestión (NUEVO)
    try {
      await EmailService.sendGestionDeadlineAlert(
        email,
        'Renovación de póliza de seguro contra incendios',
        'Administrativo',
        'alta',
        2,
        'Condominio Vista Hermosa'
      )
      results.push({ type: 'Límite Gestión', success: true })
      console.log('✅ Email 7/8 enviado: Límite Gestión')
    } catch (error) {
      results.push({ type: 'Límite Gestión', success: false, error })
      console.error('❌ Error en Email 7/8')
    }

    await new Promise(resolve => setTimeout(resolve, 1000))

    // 8. Renovación Plan de Emergencia (NUEVO)
    try {
      await EmailService.sendEmergencyPlanRenewalAlert(
        email,
        340,
        'Edificio Los Alamos'
      )
      results.push({ type: 'Renovación Plan Emergencia', success: true })
      console.log('✅ Email 8/8 enviado: Renovación Plan Emergencia')
    } catch (error) {
      results.push({ type: 'Renovación Plan Emergencia', success: false, error })
      console.error('❌ Error en Email 8/8')
    }

    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    console.log(`\n📊 Resumen: ${successCount}/8 emails enviados exitosamente`)

    return NextResponse.json({
      success: true,
      message: `Se enviaron ${successCount} de 8 notificaciones demo (incluye 3 NUEVAS)`,
      data: {
        total: 8,
        sent: successCount,
        failed: failCount,
        results
      }
    })
  } catch (error) {
    console.error('❌ Error general:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    )
  }
}

