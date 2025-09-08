import { NextRequest, NextResponse } from "next/server"
import { jsPDF } from 'jspdf'

// API para generar un PDF de ejemplo
export async function GET(request: NextRequest) {
  try {
    // Crear PDF de ejemplo
    const pdf = new jsPDF()
    
    // Configuración de colores
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
    pdf.text('REPORTE DE EJEMPLO - LEX REALIS', 20, yPosition)
    yPosition += 15
    
    pdf.setFontSize(12)
    pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    pdf.text('Sistema de Gestión de Cumplimiento', 20, yPosition)
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
    yPosition = addText('Nombre: Condominio de Ejemplo', 20, yPosition)
    yPosition = addText('Comuna: Santiago', 20, yPosition)
    yPosition = addText('Fecha de Generación: ' + new Date().toLocaleDateString('es-CL'), 20, yPosition)
    yPosition += 15
    
    // Asambleas
    pdf.setFontSize(12)
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    pdf.text('ASAMBLEAS (2)', 20, yPosition)
    yPosition += 8
    
    drawLine(20, yPosition, 50, yPosition, primaryColor)
    yPosition += 10
    
    pdf.setFontSize(9)
    pdf.setTextColor(0, 0, 0)
    pdf.text('1. Ordinaria - 15/03/2024 - Con acta', 25, yPosition)
    yPosition += 8
    pdf.text('2. Extraordinaria - 20/06/2024 - Con acta', 25, yPosition)
    yPosition += 15
    
    // Planes de Emergencia
    pdf.setFontSize(12)
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    pdf.text('PLANES DE EMERGENCIA (1)', 20, yPosition)
    yPosition += 8
    
    drawLine(20, yPosition, 50, yPosition, primaryColor)
    yPosition += 10
    
    pdf.setFontSize(9)
    pdf.setTextColor(0, 0, 0)
    pdf.text('1. Versión: 2.0 - Profesional: Juan Pérez - Actualizado: 10/01/2024 - Con archivo', 25, yPosition)
    yPosition += 15
    
    // Certificaciones
    pdf.setFontSize(12)
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    pdf.text('CERTIFICACIONES (3)', 20, yPosition)
    yPosition += 8
    
    drawLine(20, yPosition, 50, yPosition, primaryColor)
    yPosition += 10
    
    pdf.setFontSize(9)
    pdf.setTextColor(0, 0, 0)
    pdf.text('1. gas - Desde: 01/01/2024 - Hasta: 31/12/2024 - Estado: VIGENTE - Con certificado', 25, yPosition)
    yPosition += 8
    pdf.text('2. ascensor - Desde: 01/06/2024 - Hasta: 31/05/2025 - Estado: VIGENTE - Con certificado', 25, yPosition)
    yPosition += 8
    pdf.text('3. otros - Desde: 01/01/2023 - Hasta: 31/12/2023 - Estado: VENCIDA - Con certificado', 25, yPosition)
    yPosition += 15
    
    // Seguros
    pdf.setFontSize(12)
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    pdf.text('SEGUROS (2)', 20, yPosition)
    yPosition += 8
    
    drawLine(20, yPosition, 50, yPosition, primaryColor)
    yPosition += 10
    
    pdf.setFontSize(9)
    pdf.setTextColor(0, 0, 0)
    pdf.text('1. Póliza: POL-2024-001 - Compañía: Seguros Chile - Desde: 01/01/2024 - Hasta: 31/12/2024 - Estado: VIGENTE - Con póliza', 25, yPosition)
    yPosition += 8
    pdf.text('2. Póliza: POL-2024-002 - Compañía: Mapfre - Desde: 01/06/2024 - Hasta: 31/05/2025 - Estado: VIGENTE - Con póliza', 25, yPosition)
    yPosition += 20
    
    // Pie de página
    drawLine(20, yPosition, 190, yPosition, secondaryColor)
    yPosition += 10
    
    pdf.setFontSize(8)
    pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    pdf.text('Generado por Lex Realis - Sistema de Gestión de Cumplimiento', 20, yPosition)
    pdf.text('Página 1 de 1', 150, yPosition)
    
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

