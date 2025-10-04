import { NextRequest, NextResponse } from "next/server"
import { jsPDF } from 'jspdf'

// API para generar un PDF de ejemplo
export async function GET(request: NextRequest) {
  try {
    // Crear PDF de ejemplo
    const pdf = new jsPDF()
    
    // Configuración de colores del proyecto (dorado/amber)
    const primaryColor = [191, 127, 17] // #BF7F11 - Dorado principal
    const secondaryColor = [212, 175, 55] // #D4AF37 - Dorado secundario
    const successColor = [16, 185, 129] // Verde
    const dangerColor = [239, 68, 68] // Rojo
    const warningColor = [245, 158, 11] // Amarillo
    
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
    const title = `Reporte de Cumplimiento Condominio de Ejemplo (01/01/2024 - 31/12/2024)`
    
    pdf.setFontSize(18)
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    pdf.text(title, 45, yPosition, { align: 'justify' })
    yPosition += 20

    // Información del condominio
    pdf.setFontSize(12)
    pdf.setTextColor(0, 0, 0)
    yPosition = addText('Condominio: Condominio de Ejemplo', 20, yPosition)
    yPosition = addText('Comuna: Santiago', 20, yPosition)
    yPosition = addText('Fecha de Generación: ' + new Date().toLocaleDateString('es-CL'), 20, yPosition)
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
    
    // Función para agregar secciones detalladas
    const addDetailedSection = (sectionTitle: string, items: any[], startY: number) => {
      let currentY = startY
      
      // Verificar si necesitamos una nueva página
      if (currentY > 250) {
        pdf.addPage()
        currentY = 20
      }
      
      // Título de la sección
      pdf.setFontSize(14)
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
      pdf.text(`${sectionTitle.toUpperCase()} (${items.length})`, 20, currentY, { align: 'justify' })
      currentY += 8
      
      // Línea debajo del título
      pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
      pdf.line(20, currentY, 50, currentY)
      currentY += 12
      
      // Items de la sección con detalles
      items.forEach((item, index) => {
        if (currentY > 250) {
          pdf.addPage()
          currentY = 20
        }
        
        // Título del item
        pdf.setFontSize(11)
        pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
        pdf.text(`${index + 1}. ${item.title}`, 25, currentY, { align: 'justify' })
        currentY += 8
        
        // Detalles del item
        pdf.setFontSize(9)
        pdf.setTextColor(0, 0, 0)
        item.details.forEach(detail => {
          if (currentY > 250) {
            pdf.addPage()
            currentY = 20
          }
          pdf.text(`   • ${detail}`, 30, currentY, { align: 'justify' })
          currentY += 6
        })
        
        currentY += 8
      })
      
      return currentY + 15
    }

    // Asambleas
    const assemblies = [
      {
        title: 'Asamblea Ordinaria',
        details: [
          'Fecha: 15/03/2024',
          'Tipo: Ordinaria',
          'Acta: Sí',
          'Quórum: 65%',
          'Asistencia: 40 propietarios'
        ]
      },
      {
        title: 'Asamblea Extraordinaria',
        details: [
          'Fecha: 20/06/2024',
          'Tipo: Extraordinaria',
          'Acta: Sí',
          'Quórum: 70%',
          'Asistencia: 45 propietarios'
        ]
      }
    ]
    yPosition = addDetailedSection('ASAMBLEAS', assemblies, yPosition)
    
    // Planes de Emergencia
    const plans = [
      {
        title: 'Plan de Emergencia - Versión 2.0',
        details: [
          'Versión: 2.0',
          'Profesional: Juan Pérez',
          'Actualizado: 10/01/2024',
          'Archivo: Sí',
          'Válido hasta: 10/01/2025'
        ]
      }
    ]
    yPosition = addDetailedSection('PLANES DE EMERGENCIA', plans, yPosition)
    
    // Certificaciones
    const certifications = [
      {
        title: 'Certificación Gas',
        details: [
          'Tipo: gas',
          'Válida desde: 01/01/2024',
          'Válida hasta: 31/12/2024',
          'Estado: VIGENTE',
          'Archivo: Sí',
          'Emisor: SEC',
          'Número: CERT-GAS-2024-001'
        ]
      },
      {
        title: 'Certificación Ascensor',
        details: [
          'Tipo: ascensor',
          'Válida desde: 01/06/2024',
          'Válida hasta: 31/05/2025',
          'Estado: VIGENTE',
          'Archivo: Sí',
          'Emisor: Superintendencia',
          'Número: CERT-ASC-2024-002'
        ]
      },
      {
        title: 'Certificación Otros',
        details: [
          'Tipo: otros',
          'Válida desde: 01/01/2023',
          'Válida hasta: 31/12/2023',
          'Estado: VENCIDA',
          'Archivo: Sí',
          'Emisor: Municipalidad',
          'Número: CERT-OTH-2023-003'
        ]
      }
    ]
    yPosition = addDetailedSection('CERTIFICACIONES', certifications, yPosition)
    
    // Seguros
    const insurances = [
      {
        title: 'Seguro Incendio',
        details: [
          'Tipo: Incendio',
          'Póliza: POL-2024-001',
          'Compañía: Seguros Chile',
          'Válido desde: 01/01/2024',
          'Válido hasta: 31/12/2024',
          'Estado: VIGENTE',
          'Archivo: Sí',
          'Monto de cobertura: $500,000,000'
        ]
      },
      {
        title: 'Seguro Responsabilidad Civil',
        details: [
          'Tipo: Responsabilidad Civil',
          'Póliza: POL-2024-002',
          'Compañía: Mapfre',
          'Válido desde: 01/06/2024',
          'Válido hasta: 31/05/2025',
          'Estado: VIGENTE',
          'Archivo: Sí',
          'Monto de cobertura: $100,000,000'
        ]
      }
    ]
    yPosition = addDetailedSection('SEGUROS', insurances, yPosition)

    // Contratos
    const contracts = [
      {
        title: 'Contrato Mantenimiento',
        details: [
          'Tipo: Mantenimiento',
          'Empresa: Servitec',
          'Inicio: 01/01/2024',
          'Fin: 31/12/2024',
          'Estado: VIGENTE',
          'Valor: $2,500,000',
          'Archivo: Sí',
          'Descripción: Mantenimiento de áreas comunes'
        ]
      },
      {
        title: 'Contrato Limpieza',
        details: [
          'Tipo: Limpieza',
          'Empresa: CleanPro',
          'Inicio: 01/06/2024',
          'Fin: 31/05/2025',
          'Estado: VIGENTE',
          'Valor: $1,800,000',
          'Archivo: Sí',
          'Descripción: Servicio de limpieza general'
        ]
      },
      {
        title: 'Contrato Seguridad',
        details: [
          'Tipo: Seguridad',
          'Empresa: SecureChile',
          'Inicio: 01/01/2023',
          'Fin: 31/12/2023',
          'Estado: VENCIDO',
          'Valor: $3,200,000',
          'Archivo: Sí',
          'Descripción: Servicio de seguridad 24/7'
        ]
      }
    ]
    yPosition = addDetailedSection('CONTRATOS', contracts, yPosition)

    // Copropietarios
    const copropietarios = [
      {
        title: 'Unidad 101',
        details: [
          'Código: 101',
          'Propietario: Juan Pérez',
          'Alícuota: 2.50%',
          'Tipo de titular: PersonaNatural',
          'Uso: Departamento',
          'RUT: 12.345.678-9',
          'Email: juan.perez@email.com',
          'Teléfono: +56 9 1234 5678'
        ]
      },
      {
        title: 'Unidad 102',
        details: [
          'Código: 102',
          'Propietario: María González',
          'Alícuota: 2.50%',
          'Tipo de titular: PersonaNatural',
          'Uso: Departamento',
          'RUT: 98.765.432-1',
          'Email: maria.gonzalez@email.com',
          'Teléfono: +56 9 8765 4321'
        ]
      },
      {
        title: 'Unidad 201',
        details: [
          'Código: 201',
          'Propietario: Empresa ABC Ltda.',
          'Alícuota: 2.50%',
          'Tipo de titular: PersonaJuridica',
          'Uso: Departamento',
          'RUT: 76.543.210-K',
          'Email: contacto@empresaabc.cl',
          'Teléfono: +56 2 2345 6789'
        ]
      },
      {
        title: 'Unidad 202',
        details: [
          'Código: 202',
          'Propietario: Carlos Silva',
          'Alícuota: 2.50%',
          'Tipo de titular: PersonaNatural',
          'Uso: Departamento',
          'RUT: 11.222.333-4',
          'Email: carlos.silva@email.com',
          'Teléfono: +56 9 1111 2222'
        ]
      },
      {
        title: 'Unidad 301',
        details: [
          'Código: 301',
          'Propietario: Ana Torres',
          'Alícuota: 2.50%',
          'Tipo de titular: PersonaNatural',
          'Uso: Departamento',
          'RUT: 55.666.777-8',
          'Email: ana.torres@email.com',
          'Teléfono: +56 9 3333 4444'
        ]
      }
    ]
    yPosition = addDetailedSection('COPROPIETARIOS Y UNIDADES', copropietarios, yPosition)
    
    // Pie de página
    drawLine(20, yPosition, 190, yPosition, secondaryColor)
    yPosition += 10
    
    pdf.setFontSize(8)
    pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    pdf.text('Generado por Lex Realis - Sistema de Gestión de Cumplimiento', 20, yPosition, { align: 'justify' })
    pdf.text('Página 1 de 1', 150, yPosition, { align: 'justify' })
    
    // Obtener el buffer del PDF
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="reporte-ejemplo-lex-realis.pdf"'
      }
    })

  } catch (error) {
    console.error("Error generating example PDF:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}















