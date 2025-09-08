import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailNotification {
  to: string
  subject: string
  html: string
  from?: string
}

export class EmailService {
  private static from = process.env.EMAIL_FROM || 'Lex Realis <contacto@lexrealis.cl>'

  static async sendExpirationAlert(
    userEmail: string,
    documentName: string,
    daysUntilExpiration: number,
    condoName: string
  ) {
    const subject = `⚠️ Documento próximo a vencer - ${condoName}`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #BF7F11, #D4A574); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🏢 Lex Realis</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #BF7F11; margin-top: 0;">⚠️ Documento próximo a vencer</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #BF7F11;">
            <h3 style="margin-top: 0; color: #333;">${documentName}</h3>
            <p style="margin: 10px 0; color: #666;">
              <strong>Condominio:</strong> ${condoName}
            </p>
            <p style="margin: 10px 0; color: #666;">
              <strong>Días restantes:</strong> ${daysUntilExpiration} días
            </p>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;">
              <strong>📋 Acción requerida:</strong> Por favor, renueva este documento antes de su vencimiento para mantener el cumplimiento normativo.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
               style="background: #BF7F11; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Ver Dashboard
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #666; font-size: 14px; text-align: center;">
            Este es un mensaje automático del sistema Lex Realis.<br>
            Si no deseas recibir estas notificaciones, puedes desactivarlas en la configuración.
          </p>
        </div>
      </div>
    `

    return await this.sendEmail({
      to: userEmail,
      subject,
      html
    })
  }

  static async sendAssemblyReminder(
    userEmail: string,
    assemblyDate: string,
    assemblyType: string,
    condoName: string
  ) {
    const subject = `📅 Recordatorio de Asamblea - ${condoName}`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #BF7F11, #D4A574); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🏢 Lex Realis</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #BF7F11; margin-top: 0;">📅 Recordatorio de Asamblea</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #BF7F11;">
            <h3 style="margin-top: 0; color: #333;">Asamblea ${assemblyType}</h3>
            <p style="margin: 10px 0; color: #666;">
              <strong>Condominio:</strong> ${condoName}
            </p>
            <p style="margin: 10px 0; color: #666;">
              <strong>Fecha:</strong> ${new Date(assemblyDate).toLocaleDateString('es-CL')}
            </p>
          </div>
          
          <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #0c5460;">
              <strong>📋 Importante:</strong> Recuerda asistir a la asamblea para participar en las decisiones importantes del condominio.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
               style="background: #BF7F11; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Ver Dashboard
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #666; font-size: 14px; text-align: center;">
            Este es un mensaje automático del sistema Lex Realis.<br>
            Si no deseas recibir estos recordatorios, puedes desactivarlos en la configuración.
          </p>
        </div>
      </div>
    `

    return await this.sendEmail({
      to: userEmail,
      subject,
      html
    })
  }

  static async sendGeneralNotification(
    userEmail: string,
    title: string,
    message: string,
    condoName?: string
  ) {
    const subject = `🔔 ${title} - ${condoName || 'Lex Realis'}`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #BF7F11, #D4A574); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🏢 Lex Realis</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #BF7F11; margin-top: 0;">🔔 ${title}</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #BF7F11;">
            <p style="margin: 0; color: #333; line-height: 1.6;">${message}</p>
            ${condoName ? `<p style="margin: 10px 0 0 0; color: #666; font-size: 14px;"><strong>Condominio:</strong> ${condoName}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
               style="background: #BF7F11; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Ver Dashboard
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #666; font-size: 14px; text-align: center;">
            Este es un mensaje automático del sistema Lex Realis.<br>
            Si no deseas recibir estas notificaciones, puedes desactivarlas en la configuración.
          </p>
        </div>
      </div>
    `

    return await this.sendEmail({
      to: userEmail,
      subject,
      html
    })
  }

  private static async sendEmail({ to, subject, html }: EmailNotification) {
    try {
      const { data, error } = await resend.emails.send({
        from: this.from,
        to,
        subject,
        html
      })

      if (error) {
        console.error('Error sending email:', error)
        throw new Error(`Failed to send email: ${error.message}`)
      }

      console.log('Email sent successfully:', data)
      return { success: true, messageId: data?.id }
    } catch (error) {
      console.error('Email service error:', error)
      throw error
    }
  }
}
