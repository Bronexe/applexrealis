import * as XLSX from 'xlsx'

export interface GestionExportData {
  id: string
  tipo: string
  titulo: string
  descripcion: string | null
  estado: string
  prioridad: string
  condominio_name: string
  comuna: string | null
  fecha_creacion: string
  fecha_limite: string | null
  fecha_cierre: string | null
  tags: string[] | null
}

export function exportGestionesToExcel(gestiones: GestionExportData[], filename: string = 'gestiones.xlsx') {
  // Preparar los datos para Excel
  const excelData = gestiones.map(gestion => ({
    'ID': gestion.id,
    'Título': gestion.titulo,
    'Tipo': gestion.tipo,
    'Descripción': gestion.descripcion || '',
    'Estado': gestion.estado.replace('_', ' '),
    'Prioridad': gestion.prioridad,
    'Condominio': gestion.condominio_name,
    'Comuna': gestion.comuna || '',
    'Fecha Creación': new Date(gestion.fecha_creacion).toLocaleDateString('es-CL'),
    'Fecha Límite': gestion.fecha_limite ? new Date(gestion.fecha_limite).toLocaleDateString('es-CL') : '',
    'Fecha Cierre': gestion.fecha_cierre ? new Date(gestion.fecha_cierre).toLocaleDateString('es-CL') : '',
    'Tags': gestion.tags ? gestion.tags.join(', ') : ''
  }))

  // Crear un nuevo libro de trabajo
  const workbook = XLSX.utils.book_new()
  
  // Crear una hoja de trabajo con los datos
  const worksheet = XLSX.utils.json_to_sheet(excelData)
  
  // Ajustar el ancho de las columnas
  const columnWidths = [
    { wch: 10 }, // ID
    { wch: 30 }, // Título
    { wch: 15 }, // Tipo
    { wch: 40 }, // Descripción
    { wch: 12 }, // Estado
    { wch: 10 }, // Prioridad
    { wch: 25 }, // Condominio
    { wch: 20 }, // Comuna
    { wch: 15 }, // Fecha Creación
    { wch: 15 }, // Fecha Límite
    { wch: 15 }, // Fecha Cierre
    { wch: 30 }  // Tags
  ]
  worksheet['!cols'] = columnWidths
  
  // Añadir la hoja al libro
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Gestiones')
  
  // Generar el archivo Excel
  XLSX.writeFile(workbook, filename)
}

export function downloadExcelFile(data: any[], filename: string) {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(data)
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos')
  XLSX.writeFile(workbook, filename)
}



