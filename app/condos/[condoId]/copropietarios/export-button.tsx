"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { exportCopropietariosToExcel, CopropietarioExportData } from "@/lib/utils/export-copropietarios"
import { UnidadSimplified } from "@/lib/types/copropietarios-simplified"

interface ExportButtonProps {
  copropietarios: UnidadSimplified[]
}

export default function ExportButton({ copropietarios }: ExportButtonProps) {
  const handleExport = () => {
    // Preparar los datos para exportación
    const exportData: CopropietarioExportData[] = copropietarios.map(copropietario => {
      // Formatear roles CBR
      const rolesCBR = copropietario.roles.map(rol => 
        `${rol.fojas}-${rol.numero}-${rol.año} (${rol.aplicaA.join(', ')})`
      ).join('; ')

      // Formatear co-titulares
      const coTitulares = copropietario.co_titulares.map(co => 
        `${co.nombre} (${co.porcentaje}%)`
      ).join('; ')

      // Verificar archivos CBR
      const hasInscripcion = copropietario.archivo_inscripcion_cbr && 
        (Array.isArray(copropietario.archivo_inscripcion_cbr) ? 
          copropietario.archivo_inscripcion_cbr.length > 0 : 
          Object.keys(copropietario.archivo_inscripcion_cbr).length > 0)

      const hasVigencia = copropietario.archivo_vigencia_cbr && 
        (Array.isArray(copropietario.archivo_vigencia_cbr) ? 
          copropietario.archivo_vigencia_cbr.length > 0 : 
          Object.keys(copropietario.archivo_vigencia_cbr).length > 0)

      return {
        unidad_codigo: copropietario.unidad_codigo,
        alicuota: copropietario.alicuota || 0,
        nombre_razon_social: copropietario.nombre_razon_social,
        titular_tipo: copropietario.titular_tipo,
        tipo_uso: copropietario.tipo_uso,
        rut: copropietario.rut || '',
        email: copropietario.email || '',
        phone: copropietario.phone || '',
        roles_cbr: rolesCBR || 'Sin roles',
        co_titulares: coTitulares || 'Sin co-titulares',
        archivo_inscripcion: hasInscripcion ? 'Adjunto' : 'Sin archivo',
        archivo_vigencia: hasVigencia ? 'Adjunto' : 'Sin archivo'
      }
    })

    // Generar nombre de archivo con fecha actual
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0] // YYYY-MM-DD
    const filename = `copropietarios_${dateStr}.xlsx`

    // Exportar a Excel
    exportCopropietariosToExcel(exportData, filename)
  }

  if (copropietarios.length === 0) {
    return null
  }

  return (
    <Button 
      onClick={handleExport}
      variant="outline" 
      className="rounded-xl"
    >
      <Download className="mr-2 h-4 w-4" />
      Exportar Excel
    </Button>
  )
}



