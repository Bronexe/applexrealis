"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { exportGestionesToExcel, GestionExportData } from "@/lib/utils/export-excel"
import { getRegionById, getCommuneById } from "@/lib/data/chile-regions"

interface Gestion {
  id: string
  tipo: string
  titulo: string
  descripcion: string | null
  estado: string
  prioridad: string
  condominio_id: string
  unidad_id: string | null
  solicitante_id: string | null
  responsable_id: string
  fecha_creacion: string
  fecha_limite: string | null
  fecha_cierre: string | null
  tags: string[] | null
}

interface CondoInfo {
  id: string
  name: string
  comuna: string | null
  region_id: string | null
  commune_id: string | null
}

interface ExportButtonProps {
  gestiones: Gestion[]
  condosInfo: Record<string, CondoInfo>
}

export default function ExportButton({ gestiones, condosInfo }: ExportButtonProps) {
  const handleExport = () => {
    // Preparar los datos para exportación
    const exportData: GestionExportData[] = gestiones.map(gestion => {
      const condominio = condosInfo[gestion.condominio_id]
      const region = condominio?.region_id ? getRegionById(condominio.region_id) : null
      const commune = condominio?.region_id && condominio?.commune_id ? getCommuneById(condominio.region_id, condominio.commune_id) : null
      
      return {
        id: gestion.id,
        tipo: gestion.tipo,
        titulo: gestion.titulo,
        descripcion: gestion.descripcion,
        estado: gestion.estado,
        prioridad: gestion.prioridad,
        condominio_name: condominio?.name || 'Condominio no encontrado',
        comuna: commune?.name || condominio?.comuna || '',
        fecha_creacion: gestion.fecha_creacion,
        fecha_limite: gestion.fecha_limite,
        fecha_cierre: gestion.fecha_cierre,
        tags: gestion.tags
      }
    })

    // Generar nombre de archivo con fecha actual
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0] // YYYY-MM-DD
    const filename = `gestiones_${dateStr}.xlsx`

    // Exportar a Excel
    exportGestionesToExcel(exportData, filename)
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



