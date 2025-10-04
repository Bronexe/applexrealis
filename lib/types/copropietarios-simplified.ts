// =====================================================
// TIPOS PARA ESQUEMA SIMPLIFICADO DE COPROPIETARIOS
// =====================================================

// Nueva estructura de Roles CBR
export interface RolCBRSimplified {
  fojas: string
  numero: string
  año: string
  aplicaA: string[]
}

// Nueva estructura de Co-titulares (sin identificación)
export interface CoTitularSimplified {
  nombre: string
  porcentaje: number
}

// Estructura de contacto (sin cambios)
export interface Contacto {
  email?: string
  telefono?: string
  direccion?: string
}

// Estructura de archivos CBR (sin cambios)
export interface ArchivoCBR {
  nombre: string
  url: string
  tamaño: number
  fecha_subida: string
}

// Estructura principal de Unidad simplificada
export interface UnidadSimplified {
  id: string
  condo_id: string
  unidad_codigo: string
  alicuota: number
  titular_tipo: 'PersonaNatural' | 'PersonaJuridica'
  nombre_razon_social: string
  tipo_uso: string[]
  roles: RolCBRSimplified[]
  archivo_inscripcion_cbr?: ArchivoCBR
  archivo_vigencia_cbr?: ArchivoCBR
  co_titulares: CoTitularSimplified[]
  contacto?: Contacto
  observaciones?: string
  fecha_ultima_actualizacion: string
  created_at: string
  updated_at: string
}

// Formulario para crear/editar unidad
export interface UnidadFormData {
  unidad_codigo: string
  alicuota: number
  titular_tipo: 'PersonaNatural' | 'PersonaJuridica'
  nombre_razon_social: string
  tipo_uso: string[]
  roles: RolCBRSimplified[]
  archivo_inscripcion_cbr?: ArchivoCBR
  archivo_vigencia_cbr?: ArchivoCBR
  co_titulares: CoTitularSimplified[]
  contacto?: Contacto
  observaciones?: string
}

// Datos de importación simplificados desde Excel/CSV
export interface UnidadImportDataSimplified {
  unidad_codigo: string
  alicuota?: string | number
  nombre_completo: string
  tipo_titular?: string
  tipo_uso: string | string[]
  email?: string
  telefono?: string
  observaciones?: string
}

// Errores de validación detallados
export interface ValidationError {
  fila: number
  unidad: string
  errores: string[]
  campos_con_error: string[]
  datos_problematicos: Record<string, any>
}

// Resultado de importación
export interface ImportResult {
  success: boolean
  total: number
  imported: number
  errors: ValidationError[]
  message: string
}

// Filtros para la tabla
export interface UnidadFilters {
  search: string
  tipoTitular: string[]
  tipoUso: string[]
}

// Opciones de exportación
export interface ExportOptions {
  format: 'excel' | 'csv'
  includeArchivos: boolean
  includeHistorial: boolean
}
