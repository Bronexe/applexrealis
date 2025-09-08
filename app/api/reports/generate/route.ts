import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { jsPDF } from 'jspdf'

// Implementación mejorada con jsPDF para generar PDFs reales

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const reportData = await request.json()
    const {
      condo_id,
      include_assemblies,
      include_plans,
      include_certifications,
      include_insurances,
      date_from,
      date_to,
      custom_title,
      custom_description,
      include_expired,
      include_expiring_soon,
      expiring_days
    } = reportData

    // Obtener información del condominio
    const { data: condo, error: condoError } = await supabase
      .from("condos")
      .select("*")
      .eq("id", condo_id)
      .single()

    if (condoError || !condo) {
      return NextResponse.json({ error: "Condominio no encontrado" }, { status: 404 })
    }

    // Obtener datos según los filtros seleccionados
    const reportContent: any = {
      condo: condo,
      assemblies: [],
      plans: [],
      certifications: [],
      insurances: [],
      generated_at: new Date().toISOString(),
      filters: {
        date_from,
        date_to,
        include_expired,
        include_expiring_soon,
        expiring_days
      }
    }

    // Construir filtros de fecha
    let dateFilter = {}
    if (date_from && date_to) {
      dateFilter = {
        gte: date_from,
        lte: date_to
      }
    }

    // Obtener asambleas
    if (include_assemblies) {
      const { data: assemblies } = await supabase
        .from("assemblies")
        .select("*")
        .eq("condo_id", condo_id)
        .order("date", { ascending: false })
      
      reportContent.assemblies = assemblies || []
    }

    // Obtener planes de emergencia
    if (include_plans) {
      const { data: plans } = await supabase
        .from("emergency_plans")
        .select("*")
        .eq("condo_id", condo_id)
        .order("updated_at", { ascending: false })
      
      reportContent.plans = plans || []
    }

    // Obtener certificaciones
    if (include_certifications) {
      const { data: certifications } = await supabase
        .from("certifications")
        .select("*")
        .eq("condo_id", condo_id)
        .order("valid_to", { ascending: false })
      
      reportContent.certifications = certifications || []
    }

    // Obtener seguros
    if (include_insurances) {
      const { data: insurances } = await supabase
        .from("insurances")
        .select("*")
        .eq("condo_id", condo_id)
        .order("valid_to", { ascending: false })
      
      reportContent.insurances = insurances || []
    }

    // Generar PDF real usando jsPDF
    const pdf = generatePDFReport(reportContent, custom_title, custom_description)
    
    // Obtener el buffer del PDF
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="reporte-${condo.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf"`
      }
    })

  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

function generatePDFReport(data: any, customTitle?: string, customDescription?: string): jsPDF {
  const title = customTitle || `Reporte de Cumplimiento - ${data.condo.name}`
  const description = customDescription || `Reporte generado el ${new Date(data.generated_at).toLocaleDateString('es-CL')}`
  
  // Crear nuevo documento PDF
  const pdf = new jsPDF()
  
  // Configuración de fuentes y colores
  const primaryColor = [0, 123, 255] // Azul
  const secondaryColor = [108, 117, 125] // Gris
  const successColor = [40, 167, 69] // Verde
  const dangerColor = [220, 53, 69] // Rojo
  
  let yPosition = 20
  
  // Función para agregar texto con salto de línea automático
  const addText = (text: string, x: number, y: number, maxWidth: number = 180, fontSize: number = 10, color: number[] = [0, 0, 0]) => {
    pdf.setFontSize(fontSize)
    pdf.setTextColor(color[0], color[1], color[2])
    const lines = pdf.splitTextToSize(text, maxWidth)
    pdf.text(lines, x, y)
    return y + (lines.length * fontSize * 0.4)
  }
  
  // Función para dibujar línea
  const drawLine = (x1: number, y1: number, x2: number, y2: number, color: number[] = [0, 0, 0]) => {
    pdf.setDrawColor(color[0], color[1], color[2])
    pdf.line(x1, y1, x2, y2)
  }
  
  // Encabezado
  pdf.setFontSize(20)
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  pdf.text(title, 20, yPosition)
  yPosition += 15
  
  pdf.setFontSize(12)
  pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
  pdf.text(description, 20, yPosition)
  yPosition += 20
  
  // Línea separadora
  drawLine(20, yPosition, 190, yPosition, primaryColor)
  yPosition += 15
  
  // Información del condominio
  pdf.setFontSize(14)
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  pdf.text('INFORMACIÓN DEL CONDOMINIO', 20, yPosition)
  yPosition += 10
  
  pdf.setFontSize(10)
  pdf.setTextColor(0, 0, 0)
  yPosition = addText(`Nombre: ${data.condo.name}`, 20, yPosition)
  yPosition = addText(`Comuna: ${data.condo.comuna || 'No especificada'}`, 20, yPosition)
  yPosition = addText(`Fecha de Generación: ${new Date(data.generated_at).toLocaleDateString('es-CL')}`, 20, yPosition)
  yPosition += 10
  
  // Asambleas
  if (data.assemblies.length > 0) {
    yPosition = addSection(pdf, 'ASAMBLEAS', data.assemblies, yPosition, (assembly: any) => {
      return `${assembly.type === 'ordinaria' ? 'Ordinaria' : 'Extraordinaria'} - ${new Date(assembly.date).toLocaleDateString('es-CL')} - ${assembly.act_file_url ? 'Con acta' : 'Sin acta'}`
    })
  }
  
  // Planes de Emergencia
  if (data.plans.length > 0) {
    yPosition = addSection(pdf, 'PLANES DE EMERGENCIA', data.plans, yPosition, (plan: any) => {
      return `Versión: ${plan.version || 'Sin versión'} - Profesional: ${plan.professional_name || 'No especificado'} - Actualizado: ${new Date(plan.updated_at).toLocaleDateString('es-CL')} - ${plan.plan_file_url ? 'Con archivo' : 'Sin archivo'}`
    })
  }
  
  // Certificaciones
  if (data.certifications.length > 0) {
    yPosition = addSection(pdf, 'CERTIFICACIONES', data.certifications, yPosition, (cert: any) => {
      const isExpired = cert.valid_to ? new Date(cert.valid_to) < new Date() : false
      const status = isExpired ? 'VENCIDA' : 'VIGENTE'
      const statusColor = isExpired ? [220, 53, 69] : [40, 167, 69]
      return `${cert.kind} - Desde: ${cert.valid_from ? new Date(cert.valid_from).toLocaleDateString('es-CL') : 'N/A'} - Hasta: ${cert.valid_to ? new Date(cert.valid_to).toLocaleDateString('es-CL') : 'N/A'} - Estado: ${status} - ${cert.cert_file_url ? 'Con certificado' : 'Sin certificado'}`
    })
  }
  
  // Seguros
  if (data.insurances.length > 0) {
    yPosition = addSection(pdf, 'SEGUROS', data.insurances, yPosition, (insurance: any) => {
      const isExpired = insurance.valid_to ? new Date(insurance.valid_to) < new Date() : false
      const status = isExpired ? 'VENCIDA' : 'VIGENTE'
      return `Póliza: ${insurance.policy_number || 'Sin número'} - Compañía: ${insurance.insurer || 'No especificada'} - Desde: ${insurance.valid_from ? new Date(insurance.valid_from).toLocaleDateString('es-CL') : 'N/A'} - Hasta: ${insurance.valid_to ? new Date(insurance.valid_to).toLocaleDateString('es-CL') : 'N/A'} - Estado: ${status} - ${insurance.policy_file_url ? 'Con póliza' : 'Sin póliza'}`
    })
  }
  
  // Pie de página
  yPosition += 20
  drawLine(20, yPosition, 190, yPosition, secondaryColor)
  yPosition += 10
  
  pdf.setFontSize(8)
  pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
  pdf.text('Generado por Lex Realis - Sistema de Gestión de Cumplimiento', 20, yPosition)
  pdf.text(`Página 1 de 1`, 150, yPosition)
  
  return pdf
}

function addSection(pdf: jsPDF, title: string, items: any[], yPosition: number, formatter: (item: any) => string): number {
  const primaryColor = [0, 123, 255]
  const secondaryColor = [108, 117, 125]
  
  // Verificar si necesitamos una nueva página
  if (yPosition > 250) {
    pdf.addPage()
    yPosition = 20
  }
  
  // Título de la sección
  pdf.setFontSize(12)
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  pdf.text(`${title} (${items.length})`, 20, yPosition)
  yPosition += 8
  
  // Línea debajo del título
  pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
  pdf.line(20, yPosition, 50, yPosition)
  yPosition += 10
  
  // Items de la sección
  pdf.setFontSize(9)
  pdf.setTextColor(0, 0, 0)
  
  items.forEach((item, index) => {
    if (yPosition > 250) {
      pdf.addPage()
      yPosition = 20
    }
    
    const text = `${index + 1}. ${formatter(item)}`
    const lines = pdf.splitTextToSize(text, 170)
    pdf.text(lines, 25, yPosition)
    yPosition += lines.length * 9 * 0.4 + 3
  })
  
  yPosition += 10
  return yPosition
}
