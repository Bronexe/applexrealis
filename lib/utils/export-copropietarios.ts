import * as XLSX from 'xlsx'

export interface CopropietarioExportData {
  unidad_codigo: string
  alicuota: number
  nombre_razon_social: string
  titular_tipo: string
  tipo_uso: string[]
  rut: string
  email: string
  phone: string
  roles_cbr: string
  co_titulares: string
  archivo_inscripcion: string
  archivo_vigencia: string
}

export function exportCopropietariosToExcel(copropietarios: CopropietarioExportData[], filename: string = 'copropietarios.xlsx') {
  // Preparar los datos para Excel
  const excelData = copropietarios.map(copropietario => ({
    'Código Unidad': copropietario.unidad_codigo,
    'Alícuota (%)': (copropietario.alicuota * 100).toFixed(2),
    'Titular': copropietario.nombre_razon_social,
    'Tipo Titular': copropietario.titular_tipo === 'PersonaNatural' ? 'Persona Natural' : 'Persona Jurídica',
    'Tipo de Uso': copropietario.tipo_uso.join(', '),
    'RUT': copropietario.rut || '',
    'Email': copropietario.email || '',
    'Teléfono': copropietario.phone || '',
    'Roles CBR': copropietario.roles_cbr,
    'Co-titulares': copropietario.co_titulares,
    'Archivo Inscripción': copropietario.archivo_inscripcion,
    'Archivo Vigencia': copropietario.archivo_vigencia
  }))

  // Crear un nuevo libro de trabajo
  const workbook = XLSX.utils.book_new()
  
  // Crear una hoja de trabajo con los datos
  const worksheet = XLSX.utils.json_to_sheet(excelData)
  
  // Ajustar el ancho de las columnas
  const columnWidths = [
    { wch: 12 }, // Código Unidad
    { wch: 10 }, // Alícuota
    { wch: 30 }, // Titular
    { wch: 15 }, // Tipo Titular
    { wch: 20 }, // Tipo de Uso
    { wch: 15 }, // RUT
    { wch: 25 }, // Email
    { wch: 15 }, // Teléfono
    { wch: 20 }, // Roles CBR
    { wch: 25 }, // Co-titulares
    { wch: 15 }, // Archivo Inscripción
    { wch: 15 }  // Archivo Vigencia
  ]
  worksheet['!cols'] = columnWidths
  
  // Añadir la hoja al libro
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Copropietarios')
  
  // Generar el archivo Excel
  XLSX.writeFile(workbook, filename)
}






