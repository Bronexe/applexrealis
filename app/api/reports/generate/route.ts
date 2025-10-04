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
      include_contracts,
      include_copropietarios,
      include_gestiones,
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

    // Obtener estadísticas de cumplimiento
    const complianceStats = await getComplianceStats(supabase, condo_id)

    // Obtener datos según los filtros seleccionados
    const reportContent: any = {
      condo: condo,
      assemblies: [],
      plans: [],
      certifications: [],
      insurances: [],
      contracts: [],
      copropietarios: [],
      gestiones: [],
      complianceStats,
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

    // Obtener contratos
    if (include_contracts) {
      const { data: contracts } = await supabase
        .from("contracts")
        .select("*")
        .eq("condo_id", condo_id)
        .order("end_date", { ascending: false })
      
      reportContent.contracts = contracts || []
    }

    // Obtener copropietarios
    if (include_copropietarios) {
      const { data: copropietarios } = await supabase
        .from("unidades_simplified")
        .select("*")
        .eq("condo_id", condo_id)
        .order("unidad_codigo", { ascending: true })
      
      reportContent.copropietarios = copropietarios || []
    }

    // Obtener gestiones
    if (include_gestiones) {
      let gestionesQuery = supabase
        .from("gestiones")
        .select("*")
        .eq("condominio_id", condo_id)
        .order("fecha_creacion", { ascending: false })

      // Aplicar filtros de fecha si están especificados
      if (date_from && date_to) {
        gestionesQuery = gestionesQuery
          .gte("fecha_creacion", date_from)
          .lte("fecha_creacion", date_to)
      }

      const { data: gestiones } = await gestionesQuery
      reportContent.gestiones = gestiones || []
    }

    // Generar PDF real usando jsPDF
    const pdf = await generatePDFReport(reportContent, custom_title, custom_description)
    
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

async function generatePDFReport(data: any, customTitle?: string, customDescription?: string): Promise<jsPDF> {
  // Crear nuevo documento PDF
  const pdf = new jsPDF()
  
  // Configuración de fuentes y colores del proyecto (dorado/amber)
  const primaryColor = [191, 127, 17] // #BF7F11 - Dorado principal
  const secondaryColor = [212, 175, 55] // #D4AF37 - Dorado secundario
  const successColor = [16, 185, 129] // Verde
  const dangerColor = [239, 68, 68] // Rojo
  const warningColor = [245, 158, 11] // Amarillo
  const infoColor = [59, 130, 246] // Azul
  
  let yPosition = 20
  
  // Función para agregar texto con salto de línea automático y alineación justificada
  const addText = (text: string, x: number, y: number, maxWidth: number = 180, fontSize: number = 10, color: number[] = [0, 0, 0]) => {
    pdf.setFontSize(fontSize)
    pdf.setTextColor(color[0], color[1], color[2])
    const lines = pdf.splitTextToSize(text, maxWidth)
    lines.forEach((line: string, index: number) => {
      pdf.text(line, x, y + (index * fontSize * 0.4), { align: 'justify' })
    })
    return y + (lines.length * fontSize * 0.4)
  }
  
  // Función para dibujar línea
  const drawLine = (x1: number, y1: number, x2: number, y2: number, color: number[] = [0, 0, 0]) => {
    pdf.setDrawColor(color[0], color[1], color[2])
    pdf.line(x1, y1, x2, y2)
  }

  // Función para agregar el logo
  const addLogo = async () => {
    try {
      // Cargar la imagen del favicon
      const logoPath = './public/Favicon.png'
      const logoData = await fetch(logoPath)
      if (logoData.ok) {
        const logoBuffer = await logoData.arrayBuffer()
        pdf.addImage(logoBuffer, 'PNG', 20, 10, 15, 15)
      } else {
        // Fallback si no se puede cargar la imagen
        pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
        pdf.rect(20, 10, 15, 15, 'F')
        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(8)
        pdf.text('LR', 25, 19)
        pdf.setTextColor(0, 0, 0)
      }
    } catch (error) {
      // Fallback en caso de error
      pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
      pdf.rect(20, 10, 15, 15, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(8)
      pdf.text('LR', 25, 19)
      pdf.setTextColor(0, 0, 0)
    }
  }

  // Agregar logo en la esquina superior izquierda
  await addLogo()

  // Título principal
  const periodText = data.filters.date_from && data.filters.date_to 
    ? ` (${new Date(data.filters.date_from).toLocaleDateString('es-CL')} - ${new Date(data.filters.date_to).toLocaleDateString('es-CL')})`
    : ''
  
  const title = customTitle || `Reporte de Cumplimiento ${data.condo.name}${periodText}`
  
  pdf.setFontSize(18)
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  pdf.text(title, 45, yPosition, { align: 'justify' })
  yPosition += 20

  // Información del condominio
  pdf.setFontSize(12)
  pdf.setTextColor(0, 0, 0)
  yPosition = addText(`Condominio: ${data.condo.name}`, 20, yPosition)
  yPosition = addText(`Comuna: ${data.condo.comuna || 'No especificada'}`, 20, yPosition)
  yPosition = addText(`Fecha de Generación: ${new Date(data.generated_at).toLocaleDateString('es-CL')}`, 20, yPosition)
  yPosition += 15

  // Introducción
  pdf.setFontSize(12)
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  pdf.text('INTRODUCCIÓN', 20, yPosition, { align: 'justify' })
  yPosition += 10
  
  pdf.setFontSize(10)
  pdf.setTextColor(0, 0, 0)
  const introText = "Reporte generado en base a la información que se encuentra en el sistema de cumplimiento de Lexrealis.cl, el cual controla los documentos cargados, plazos, unidades, quorums, entre otras exigencias de la Ley de Copropiedad Inmobiliaria."
  yPosition = addText(introText, 20, yPosition)
  yPosition += 15
  
  // Asambleas
  if (data.assemblies.length > 0) {
    yPosition = addDetailedSection(pdf, 'ASAMBLEAS', data.assemblies, yPosition, (assembly: any) => {
      return {
        title: `${assembly.type === 'ordinaria' ? 'Asamblea Ordinaria' : 'Asamblea Extraordinaria'}`,
        details: [
          `Fecha: ${new Date(assembly.date).toLocaleDateString('es-CL')}`,
          `Tipo: ${assembly.type === 'ordinaria' ? 'Ordinaria' : 'Extraordinaria'}`,
          `Acta: ${assembly.act_file_url ? 'Sí' : 'No'}`,
          assembly.description ? `Descripción: ${assembly.description}` : null,
          assembly.quorum ? `Quórum: ${assembly.quorum}` : null,
          assembly.attendance ? `Asistencia: ${assembly.attendance}` : null
        ].filter(Boolean)
      }
    })
  }
  
  // Planes de Emergencia
  if (data.plans.length > 0) {
    yPosition = addDetailedSection(pdf, 'PLANES DE EMERGENCIA', data.plans, yPosition, (plan: any) => {
      return {
        title: `Plan de Emergencia - Versión ${plan.version || 'Sin versión'}`,
        details: [
          `Versión: ${plan.version || 'Sin versión'}`,
          `Profesional: ${plan.professional_name || 'No especificado'}`,
          `Actualizado: ${new Date(plan.updated_at).toLocaleDateString('es-CL')}`,
          `Archivo: ${plan.plan_file_url ? 'Sí' : 'No'}`,
          plan.description ? `Descripción: ${plan.description}` : null,
          plan.valid_until ? `Válido hasta: ${new Date(plan.valid_until).toLocaleDateString('es-CL')}` : null
        ].filter(Boolean)
      }
    })
  }
  
  // Certificaciones
  if (data.certifications.length > 0) {
    yPosition = addDetailedSection(pdf, 'CERTIFICACIONES', data.certifications, yPosition, (cert: any) => {
      const isExpired = cert.valid_to ? new Date(cert.valid_to) < new Date() : false
      const status = isExpired ? 'VENCIDA' : 'VIGENTE'
      return {
        title: `Certificación ${cert.kind}`,
        details: [
          `Tipo: ${cert.kind}`,
          `Válida desde: ${cert.valid_from ? new Date(cert.valid_from).toLocaleDateString('es-CL') : 'No especificado'}`,
          `Válida hasta: ${cert.valid_to ? new Date(cert.valid_to).toLocaleDateString('es-CL') : 'No especificado'}`,
          `Estado: ${status}`,
          `Archivo: ${cert.cert_file_url ? 'Sí' : 'No'}`,
          cert.issuer ? `Emisor: ${cert.issuer}` : null,
          cert.cert_number ? `Número: ${cert.cert_number}` : null
        ].filter(Boolean)
      }
    })
  }
  
  // Seguros
  if (data.insurances.length > 0) {
    yPosition = addDetailedSection(pdf, 'SEGUROS', data.insurances, yPosition, (insurance: any) => {
      const isExpired = insurance.valid_to ? new Date(insurance.valid_to) < new Date() : false
      const status = isExpired ? 'VENCIDO' : 'VIGENTE'
      return {
        title: `Seguro ${insurance.insurance_type || 'Sin tipo'}`,
        details: [
          `Tipo: ${insurance.insurance_type || 'No especificado'}`,
          `Póliza: ${insurance.policy_number || 'Sin número'}`,
          `Compañía: ${insurance.insurer || 'No especificada'}`,
          `Válido desde: ${insurance.valid_from ? new Date(insurance.valid_from).toLocaleDateString('es-CL') : 'No especificado'}`,
          `Válido hasta: ${insurance.valid_to ? new Date(insurance.valid_to).toLocaleDateString('es-CL') : 'No especificado'}`,
          `Estado: ${status}`,
          `Archivo: ${insurance.policy_file_url ? 'Sí' : 'No'}`,
          insurance.coverage_amount ? `Monto de cobertura: $${insurance.coverage_amount}` : null
        ].filter(Boolean)
      }
    })
  }

  // Contratos
  if (data.contracts.length > 0) {
    yPosition = addDetailedSection(pdf, 'CONTRATOS', data.contracts, yPosition, (contract: any) => {
      const isExpired = contract.end_date ? new Date(contract.end_date) < new Date() : false
      const status = isExpired ? 'VENCIDO' : 'VIGENTE'
      return {
        title: `Contrato ${contract.contract_type || 'Sin tipo'}`,
        details: [
          `Tipo: ${contract.contract_type || 'No especificado'}`,
          `Empresa: ${contract.company_name || 'No especificada'}`,
          `Inicio: ${contract.start_date ? new Date(contract.start_date).toLocaleDateString('es-CL') : 'No especificado'}`,
          `Fin: ${contract.end_date ? new Date(contract.end_date).toLocaleDateString('es-CL') : 'No especificado'}`,
          `Estado: ${status}`,
          `Valor: ${contract.amount ? `$${contract.amount.toLocaleString('es-CL')}` : 'No especificado'}`,
          `Archivo: ${contract.contract_file_url ? 'Sí' : 'No'}`,
          contract.description ? `Descripción: ${contract.description}` : null
        ].filter(Boolean)
      }
    })
  }

  // Copropietarios
  if (data.copropietarios.length > 0) {
    yPosition = addDetailedSection(pdf, 'COPROPIETARIOS Y UNIDADES', data.copropietarios, yPosition, (copropietario: any) => {
      return {
        title: `Unidad ${copropietario.unidad_codigo}`,
        details: [
          `Código: ${copropietario.unidad_codigo}`,
          `Propietario: ${copropietario.nombre_razon_social}`,
          `Alícuota: ${(copropietario.alicuota * 100).toFixed(2)}%`,
          `Tipo de titular: ${copropietario.titular_tipo}`,
          `Uso: ${copropietario.tipo_uso?.join(', ') || 'No especificado'}`,
          copropietario.rut ? `RUT: ${copropietario.rut}` : null,
          copropietario.email ? `Email: ${copropietario.email}` : null,
          copropietario.phone ? `Teléfono: ${copropietario.phone}` : null
        ].filter(Boolean)
      }
    })
  }

  // Gestiones
  if (data.gestiones.length > 0) {
    yPosition = addDetailedSection(pdf, 'GESTIONES Y TRÁMITES', data.gestiones, yPosition, (gestion: any) => {
      const isOverdue = gestion.fecha_limite ? new Date(gestion.fecha_limite) < new Date() && !['resuelto', 'cerrado'].includes(gestion.estado) : false
      const status = isOverdue ? 'VENCIDA' : gestion.estado.toUpperCase().replace('_', ' ')
      return {
        title: `${gestion.titulo}`,
        details: [
          `Tipo: ${gestion.tipo}`,
          `Estado: ${status}`,
          `Prioridad: ${gestion.prioridad}`,
          `Fecha de creación: ${new Date(gestion.fecha_creacion).toLocaleDateString('es-CL')}`,
          gestion.fecha_limite ? `Fecha límite: ${new Date(gestion.fecha_limite).toLocaleDateString('es-CL')}` : 'Sin fecha límite',
          gestion.fecha_cierre ? `Fecha de cierre: ${new Date(gestion.fecha_cierre).toLocaleDateString('es-CL')}` : null,
          gestion.descripcion ? `Descripción: ${gestion.descripcion}` : null,
          gestion.tags ? `Tags: ${gestion.tags.join(', ')}` : null
        ].filter(Boolean)
      }
    })
  }
  
  // Pie de página
  yPosition += 20
  drawLine(20, yPosition, 190, yPosition, secondaryColor)
  yPosition += 10
  
  pdf.setFontSize(8)
  pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
  pdf.text('Generado por Lex Realis - Sistema de Gestión de Cumplimiento', 20, yPosition, { align: 'justify' })
  pdf.text(`Página 1 de 1`, 150, yPosition, { align: 'justify' })
  
  return pdf
}

function addDetailedSection(pdf: jsPDF, sectionTitle: string, items: any[], yPosition: number, formatter: (item: any) => {title: string, details: string[]}): number {
  const primaryColor = [191, 127, 17]
  const secondaryColor = [212, 175, 55]
  
  // Verificar si necesitamos una nueva página
  if (yPosition > 250) {
    pdf.addPage()
    yPosition = 20
  }
  
  // Título de la sección
  pdf.setFontSize(14)
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  pdf.text(`${sectionTitle.toUpperCase()} (${items.length})`, 20, yPosition, { align: 'justify' })
  yPosition += 8
  
  // Línea debajo del título
  pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
  pdf.line(20, yPosition, 50, yPosition)
  yPosition += 12
  
  // Items de la sección con detalles
  items.forEach((item, index) => {
    if (yPosition > 250) {
      pdf.addPage()
      yPosition = 20
    }
    
    const formatted = formatter(item)
    
    // Título del item
    pdf.setFontSize(11)
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    pdf.text(`${index + 1}. ${formatted.title}`, 25, yPosition, { align: 'justify' })
    yPosition += 8
    
    // Detalles del item
    pdf.setFontSize(9)
    pdf.setTextColor(0, 0, 0)
    formatted.details.forEach(detail => {
      if (yPosition > 250) {
        pdf.addPage()
        yPosition = 20
      }
      pdf.text(`   • ${detail}`, 30, yPosition, { align: 'justify' })
      yPosition += 6
    })
    
    yPosition += 8
  })
  
  yPosition += 15
  return yPosition
}

function addSection(pdf: jsPDF, title: string, items: any[], yPosition: number, formatter: (item: any) => string): number {
  const primaryColor = [191, 127, 17]
  const secondaryColor = [212, 175, 55]
  
  // Verificar si necesitamos una nueva página
  if (yPosition > 250) {
    pdf.addPage()
    yPosition = 20
  }
  
  // Título de la sección
  pdf.setFontSize(12)
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  pdf.text(`${title} (${items.length})`, 20, yPosition, { align: 'justify' })
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
    lines.forEach((line: string, lineIndex: number) => {
      pdf.text(line, 25, yPosition + (lineIndex * 9 * 0.4), { align: 'justify' })
    })
    yPosition += lines.length * 9 * 0.4 + 3
  })
  
  yPosition += 10
  return yPosition
}

async function getComplianceStats(supabase: any, condoId: string) {
  const today = new Date().toISOString().split('T')[0]
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Contar documentos por tipo y estado
  const [assemblies, plans, certifications, insurances, contracts, copropietarios] = await Promise.all([
    // Asambleas
    supabase
      .from('assemblies')
      .select('valid_to')
      .eq('condo_id', condoId),

    // Planes de emergencia
    supabase
      .from('emergency_plans')
      .select('valid_to')
      .eq('condo_id', condoId),

    // Certificaciones
    supabase
      .from('certifications')
      .select('valid_to')
      .eq('condo_id', condoId),

    // Seguros
    supabase
      .from('insurances')
      .select('valid_to')
      .eq('condo_id', condoId),

    // Contratos
    supabase
      .from('contracts')
      .select('end_date')
      .eq('condo_id', condoId),

    // Copropietarios
    supabase
      .from('unidades_simplified')
      .select('id')
      .eq('condo_id', condoId)
  ])

  // Procesar estadísticas
  let totalDocuments = 0
  let expiredDocuments = 0
  let expiringSoon = 0
  let compliantDocuments = 0

  // Procesar cada tipo de documento
  const processDocuments = (documents: any[], dateField: string) => {
    if (documents.data) {
      totalDocuments += documents.data.length
      
      documents.data.forEach((doc: any) => {
        const validDate = doc[dateField]
        if (validDate) {
          if (validDate < today) {
            expiredDocuments++
          } else if (validDate <= thirtyDaysFromNow) {
            expiringSoon++
          } else {
            compliantDocuments++
          }
        } else {
          // Si no hay fecha de vencimiento, se considera válido
          compliantDocuments++
        }
      })
    }
  }

  processDocuments(assemblies, 'valid_to')
  processDocuments(plans, 'valid_to')
  processDocuments(certifications, 'valid_to')
  processDocuments(insurances, 'valid_to')
  processDocuments(contracts, 'end_date')

  // Copropietarios no tienen fecha de vencimiento, se cuentan como válidos
  const copropietariosCount = copropietarios.data?.length || 0
  totalDocuments += copropietariosCount
  compliantDocuments += copropietariosCount

  const complianceRate = totalDocuments > 0 ? (compliantDocuments / totalDocuments) * 100 : 0

  return {
    totalDocuments,
    expiredDocuments,
    expiringSoon,
    compliantDocuments,
    complianceRate,
    contractsCount: contracts.data?.length || 0,
    copropietariosCount
  }
}
