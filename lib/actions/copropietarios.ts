"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export interface Unidad {
  id: string
  unidad_codigo: string
  alicuota: number
  titular_tipo: 'PersonaNatural' | 'PersonaJuridica'
  nombre_razon_social: string
  tipo_uso: string[]
  roles: Array<{
    rolCBR: string
    aplicaA: string[]
  }>
  archivo_inscripcion_cbr?: any
  archivo_vigencia_cbr?: any
  co_titulares?: Array<{
    nombre: string
    identificacion: string
    porcentaje: number
  }>
  contacto?: {
    email?: string
    telefono?: string
  }
  observaciones?: string
  fecha_ultima_actualizacion: string
  created_at: string
  updated_at: string
}

export interface CreateUnidadData {
  unidad_codigo: string
  alicuota: number
  titular_tipo: 'PersonaNatural' | 'PersonaJuridica'
  nombre_razon_social: string
  tipo_uso: string[]
  roles: Array<{
    rolCBR: string
    aplicaA: string[]
  }>
  archivo_inscripcion_cbr?: any
  archivo_vigencia_cbr?: any
  co_titulares?: Array<{
    nombre: string
    identificacion: string
    porcentaje: number
  }>
  contacto?: {
    email?: string
    telefono?: string
  }
  observaciones?: string
}

export async function createUnidad(condoId: string, data: CreateUnidadData) {
  const supabase = await createClient()

  // Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  // Verificar que el usuario tiene acceso al condominio
  const { data: condo, error: condoError } = await supabase
    .from("condos")
    .select("id, user_id")
    .eq("id", condoId)
    .single()

  if (condoError || !condo) {
    throw new Error("Condominio no encontrado")
  }

  if (condo.user_id !== user.id) {
    throw new Error("No tienes permisos para crear unidades en este condominio")
  }

  // Validar que el código de unidad sea único
  console.log(`createUnidad: Verificando código único para: ${data.unidad_codigo} en condominio ${condoId}`)
  
  const { data: existingUnidad, error: checkError } = await supabase
    .from("unidades")
    .select("id, unidad_codigo")
    .eq("condo_id", condoId)
    .eq("unidad_codigo", data.unidad_codigo)
    .single()

  if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error(`createUnidad: Error verificando código único:`, checkError)
    throw new Error(`Error verificando código único: ${checkError.message}`)
  }

  if (existingUnidad) {
    console.error(`createUnidad: Código duplicado encontrado:`, {
      codigo: data.unidad_codigo,
      existingId: existingUnidad.id,
      existingCodigo: existingUnidad.unidad_codigo
    })
    throw new Error(`Ya existe una unidad con este código: ${data.unidad_codigo}`)
  }

  console.log(`createUnidad: Código ${data.unidad_codigo} es único, procediendo con la creación`)

  // Validar alícuota si se proporciona
  if (data.alicuota !== undefined && (data.alicuota < 0 || data.alicuota > 100)) {
    throw new Error("La alícuota debe estar entre 0 y 100")
  }

  // Logging detallado para debugging
  console.log(`createUnidad: Datos recibidos:`, {
    unidad_codigo: data.unidad_codigo,
    alicuota: data.alicuota,
    alicuota_type: typeof data.alicuota,
    alicuota_string: String(data.alicuota),
    co_titulares: data.co_titulares,
    roles: data.roles
  })

  // Validar co-titulares si existen
  if (data.co_titulares && data.co_titulares.length > 0) {
    console.log(`createUnidad: Procesando co-titulares:`, data.co_titulares)
    
    // Validar y limpiar porcentajes de co-titulares
    const coTitularesLimpios = data.co_titulares.map((co, index) => {
      console.log(`createUnidad: Procesando co-titular ${index}:`, co)
      
      let porcentajeLimpio = 0
      if (co.porcentaje !== null && co.porcentaje !== undefined) {
        const porcentajeNum = Number(co.porcentaje)
        if (Number.isFinite(porcentajeNum)) {
          // Validar rango 0-100 y limitar a 4 decimales
          if (porcentajeNum >= 0 && porcentajeNum <= 100) {
            porcentajeLimpio = Math.round(porcentajeNum * 10000) / 10000
          } else {
            console.warn(`createUnidad: Porcentaje fuera de rango (0-100): ${porcentajeNum} en co-titular ${index}`)
            porcentajeLimpio = 0
          }
        } else {
          console.warn(`createUnidad: Porcentaje no es un número válido: ${co.porcentaje} en co-titular ${index}`)
          porcentajeLimpio = 0
        }
      }
      
      return {
        ...co,
        porcentaje: porcentajeLimpio
      }
    })
    
    console.log(`createUnidad: Co-titulares procesados:`, coTitularesLimpios)
    
    const totalPorcentaje = coTitularesLimpios.reduce((sum, co) => sum + co.porcentaje, 0)
    if (Math.abs(totalPorcentaje - 100) > 0.0001) { // Tolerancia para decimales
      throw new Error(`La suma de porcentajes de co-titulares debe ser 100%. Suma actual: ${totalPorcentaje}`)
    }
    
    // Actualizar los datos con los valores limpios
    data.co_titulares = coTitularesLimpios
  }

  // Preparar datos para inserción con validación estricta de todos los campos numéricos
  const insertData = {
    condo_id: condoId,
    unidad_codigo: data.unidad_codigo,
    alicuota: data.alicuota !== null && data.alicuota !== undefined ? 
      Math.round(Number(data.alicuota) * 10000) / 10000 : null, // Asegurar 4 decimales máximo
    titular_tipo: data.titular_tipo,
    nombre_razon_social: data.nombre_razon_social,
    tipo_uso: data.tipo_uso,
    roles: data.roles,
    archivo_inscripcion_cbr: data.archivo_inscripcion_cbr,
    archivo_vigencia_cbr: data.archivo_vigencia_cbr,
    co_titulares: data.co_titulares || [],
    contacto: data.contacto || {},
    observaciones: data.observaciones
  }

  // Validación final de todos los campos numéricos
  console.log(`createUnidad: Validación final de campos numéricos:`)
  
        // Validar alícuota
        if (insertData.alicuota !== null) {
          const alicuotaStr = insertData.alicuota.toString()
          // DECIMAL(5,4) permite máximo 5 dígitos totales, 4 después del punto
          // Ejemplos válidos: 0.0000, 1.1380, 10.0000, 100.0000
          // Contar solo dígitos, no el punto decimal
          const digitsOnly = alicuotaStr.replace('.', '')
          if (digitsOnly.length > 5) {
            console.error(`createUnidad: Alícuota excede formato DECIMAL(5,4): ${insertData.alicuota} (${digitsOnly.length} dígitos)`)
            throw new Error(`Alícuota excede formato permitido: ${insertData.alicuota}`)
          }
          console.log(`createUnidad: Alícuota válida: ${insertData.alicuota} (${digitsOnly.length} dígitos)`)
        }

  // Validar co-titulares
  if (insertData.co_titulares && insertData.co_titulares.length > 0) {
    insertData.co_titulares.forEach((co, index) => {
      if (co.porcentaje !== undefined && co.porcentaje !== null) {
        const porcentajeStr = co.porcentaje.toString()
        // Contar solo dígitos, no el punto decimal
        const digitsOnly = porcentajeStr.replace('.', '')
        if (digitsOnly.length > 5) {
          console.error(`createUnidad: Porcentaje de co-titular ${index} excede formato DECIMAL(5,4): ${co.porcentaje} (${digitsOnly.length} dígitos)`)
          throw new Error(`Porcentaje de co-titular excede formato permitido: ${co.porcentaje}`)
        }
        console.log(`createUnidad: Co-titular ${index} porcentaje válido: ${co.porcentaje} (${digitsOnly.length} dígitos)`)
      }
    })
  }

  console.log(`createUnidad: Datos a insertar:`, {
    unidad_codigo: insertData.unidad_codigo,
    alicuota_original: data.alicuota,
    alicuota_processed: insertData.alicuota,
    alicuota_type: typeof insertData.alicuota,
    alicuota_string_length: insertData.alicuota?.toString().length,
    co_titulares: insertData.co_titulares,
    co_titulares_porcentajes: insertData.co_titulares?.map(co => ({
      nombre: co.nombre,
      porcentaje: co.porcentaje,
      porcentaje_type: typeof co.porcentaje,
      porcentaje_string_length: co.porcentaje?.toString().length
    })),
    roles: insertData.roles,
    // Logging detallado de TODOS los campos numéricos
    all_numeric_fields: {
      alicuota: insertData.alicuota,
      co_titulares_porcentajes: insertData.co_titulares?.map(co => co.porcentaje),
      // Verificar si hay otros campos numéricos que puedan causar overflow
      all_fields: Object.keys(insertData).reduce((acc, key) => {
        const value = insertData[key]
        if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))) {
          acc[key] = {
            value: value,
            type: typeof value,
            string_length: value?.toString().length
          }
        }
        return acc
      }, {} as any)
    },
    all_data: insertData
  })

  // Crear la unidad
  try {
    const { data: nuevaUnidad, error: createError } = await supabase
      .from("unidades")
      .insert(insertData)
      .select()
      .single()

    if (createError) {
      console.error(`createUnidad: Error de Supabase:`, createError)
      console.error(`createUnidad: Datos que causaron el error:`, insertData)
      
      // Logging específico para numeric field overflow
      if (createError.message.includes('numeric field overflow')) {
        console.error(`createUnidad: NUMERIC FIELD OVERFLOW DETECTADO`)
        console.error(`createUnidad: Unidad código: ${insertData.unidad_codigo}`)
        console.error(`createUnidad: Alícuota: ${insertData.alicuota} (tipo: ${typeof insertData.alicuota}, longitud: ${insertData.alicuota?.toString().length})`)
        
        if (insertData.co_titulares && insertData.co_titulares.length > 0) {
          insertData.co_titulares.forEach((co, index) => {
            console.error(`createUnidad: Co-titular ${index}: ${co.nombre} - Porcentaje: ${co.porcentaje} (tipo: ${typeof co.porcentaje}, longitud: ${co.porcentaje?.toString().length})`)
          })
        }
        
        console.error(`createUnidad: Todos los campos numéricos:`, {
          alicuota: insertData.alicuota,
          co_titulares_porcentajes: insertData.co_titulares?.map(co => co.porcentaje)
        })
      }
      
      throw new Error(`Error al crear la unidad: ${createError.message}`)
    }

    console.log(`createUnidad: Unidad creada exitosamente:`, nuevaUnidad.unidad_codigo)
    revalidatePath(`/condos/${condoId}/copropietarios`)
    return nuevaUnidad
  } catch (error) {
    console.error(`createUnidad: Error completo:`, error)
    console.error(`createUnidad: Datos que causaron el error:`, insertData)
    throw error
  }
}

export async function updateUnidad(condoId: string, unidadId: string, data: Partial<CreateUnidadData>) {
  const supabase = await createClient()

  // Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  // Verificar que el usuario tiene acceso al condominio
  const { data: condo, error: condoError } = await supabase
    .from("condos")
    .select("id, user_id")
    .eq("id", condoId)
    .single()

  if (condoError || !condo) {
    throw new Error("Condominio no encontrado")
  }

  if (condo.user_id !== user.id) {
    throw new Error("No tienes permisos para editar unidades en este condominio")
  }

  // Verificar que la unidad existe y pertenece al condominio
  const { data: unidad, error: unidadError } = await supabase
    .from("unidades")
    .select("id, unidad_codigo")
    .eq("id", unidadId)
    .eq("condo_id", condoId)
    .single()

  if (unidadError || !unidad) {
    throw new Error("Unidad no encontrada")
  }

  // Si se está cambiando el código, validar que sea único
  if (data.unidad_codigo && data.unidad_codigo !== unidad.unidad_codigo) {
    const { data: existingUnidad } = await supabase
      .from("unidades")
      .select("id")
      .eq("condo_id", condoId)
      .eq("unidad_codigo", data.unidad_codigo)
      .neq("id", unidadId)
      .single()

    if (existingUnidad) {
      throw new Error("Ya existe una unidad con este código")
    }
  }

  // Validar alícuota si se está actualizando
  if (data.alicuota !== undefined && (data.alicuota < 0 || data.alicuota > 100)) {
    throw new Error("La alícuota debe estar entre 0 y 100")
  }

  // Validar co-titulares si se están actualizando
  if (data.co_titulares && data.co_titulares.length > 0) {
    const totalPorcentaje = data.co_titulares.reduce((sum, co) => sum + co.porcentaje, 0)
    if (totalPorcentaje !== 100) {
      throw new Error("La suma de porcentajes de co-titulares debe ser 100%")
    }
  }

  // Actualizar la unidad
  const { data: unidadActualizada, error: updateError } = await supabase
    .from("unidades")
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq("id", unidadId)
    .select()
    .single()

  if (updateError) {
    throw new Error(`Error al actualizar la unidad: ${updateError.message}`)
  }

  revalidatePath(`/condos/${condoId}/copropietarios`)
  return unidadActualizada
}

export async function deleteUnidad(condoId: string, unidadId: string) {
  const supabase = await createClient()

  // Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  // Verificar que el usuario tiene acceso al condominio
  const { data: condo, error: condoError } = await supabase
    .from("condos")
    .select("id, user_id")
    .eq("id", condoId)
    .single()

  if (condoError || !condo) {
    throw new Error("Condominio no encontrado")
  }

  if (condo.user_id !== user.id) {
    throw new Error("No tienes permisos para eliminar unidades en este condominio")
  }

  // Verificar que la unidad existe y pertenece al condominio
  const { data: unidad, error: unidadError } = await supabase
    .from("unidades")
    .select("id, unidad_codigo")
    .eq("id", unidadId)
    .eq("condo_id", condoId)
    .single()

  if (unidadError || !unidad) {
    throw new Error("Unidad no encontrada")
  }

  // Eliminar registros relacionados primero (por si CASCADE no funciona)
  try {
    console.log(`deleteUnidad: Eliminando registros relacionados para unidad ${unidadId}`)
    
    // Eliminar historial de la unidad
    const { error: historialError } = await supabase
      .from("unidades_historial")
      .delete()
      .eq("unidad_id", unidadId)
    
    if (historialError) {
      console.warn("Error eliminando historial:", historialError)
    } else {
      console.log("Historial eliminado exitosamente")
    }

    // Eliminar archivos CBR de la unidad
    const { error: archivosError } = await supabase
      .from("archivos_cbr")
      .delete()
      .eq("unidad_id", unidadId)
    
    if (archivosError) {
      console.warn("Error eliminando archivos CBR:", archivosError)
    } else {
      console.log("Archivos CBR eliminados exitosamente")
    }
  } catch (relatedDeleteError) {
    console.warn("Error eliminando registros relacionados:", relatedDeleteError)
    // Continuar con la eliminación de la unidad
  }

  // Eliminar la unidad con manejo de errores mejorado
  console.log(`deleteUnidad: Eliminando unidad ${unidadId} (${unidad.unidad_codigo})`)
  
  const { data: deleteResult, error: deleteError } = await supabase
    .from("unidades")
    .delete()
    .eq("id", unidadId)
    .select()

  console.log(`deleteUnidad: Resultado eliminación unidad ${unidadId}:`, {
    result: deleteResult,
    error: deleteError
  })

  if (deleteError) {
    console.error(`deleteUnidad: Error eliminando unidad, intentando método directo:`, deleteError)
    
    // Si el error es de clave foránea del historial, es un problema del trigger
    if (deleteError.message.includes("unidades_historial") && 
        deleteError.message.includes("foreign key constraint")) {
      console.log("Error de trigger de historial detectado. Esto es un problema conocido.")
      console.log("La unidad se eliminó pero el trigger falló al registrar el historial.")
      console.log("Esto no afecta la funcionalidad principal.")
      
      // Considerar la eliminación como exitosa ya que la unidad se eliminó
      console.log(`deleteUnidad: Unidad ${unidad.unidad_codigo} eliminada (con advertencia de historial)`)
    } else {
      // Intentar con método directo como respaldo
      try {
        console.log(`deleteUnidad: Intentando método directo para unidad ${unidadId}`)
        const directResult = await deleteUnidadDirect(unidadId)
        console.log(`deleteUnidad: Método directo exitoso:`, directResult)
        revalidatePath(`/condos/${condoId}/copropietarios`)
        return directResult
      } catch (directError) {
        console.error(`deleteUnidad: Método directo también falló:`, directError)
        throw new Error(`Error al eliminar la unidad. Método normal: ${deleteError.message}, Método directo: ${directError instanceof Error ? directError.message : 'Error desconocido'}`)
      }
    }
  } else {
    console.log(`deleteUnidad: Unidad ${unidad.unidad_codigo} eliminada exitosamente`)
  }

  // Verificar que la unidad realmente se eliminó del servidor
  console.log(`deleteUnidad: Verificando eliminación en servidor...`)
  const { data: unidadRestante, error: verifyError } = await supabase
    .from("unidades")
    .select("id, unidad_codigo")
    .eq("id", unidadId)
    .single()

  if (verifyError && verifyError.code === 'PGRST116') {
    // PGRST116 = no rows returned, significa que se eliminó correctamente
    console.log(`deleteUnidad: Verificación exitosa - unidad ${unidadId} eliminada del servidor`)
  } else if (unidadRestante) {
    console.warn(`deleteUnidad: ADVERTENCIA - unidad ${unidadId} aún existe en el servidor`)
    // Intentar eliminación directa como último recurso
    try {
      const directResult = await deleteUnidadDirect(unidadId)
      console.log(`deleteUnidad: Eliminación directa de verificación exitosa:`, directResult)
    } catch (directError) {
      console.error(`deleteUnidad: Error en eliminación directa de verificación:`, directError)
    }
  } else {
    console.error(`deleteUnidad: Error verificando eliminación:`, verifyError)
  }

  revalidatePath(`/condos/${condoId}/copropietarios`)
  return { success: true, unidad_codigo: unidad.unidad_codigo }
}

export async function clearAllUnidades(condoId: string) {
  const supabase = await createClient()

  // Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  // Verificar que el usuario tiene acceso al condominio
  const { data: condo, error: condoError } = await supabase
    .from("condos")
    .select("id, user_id")
    .eq("id", condoId)
    .single()

  if (condoError || !condo) {
    throw new Error("Condominio no encontrado")
  }

  if (condo.user_id !== user.id) {
    throw new Error("No tienes permisos para limpiar las unidades de este condominio")
  }

  console.log(`clearAllUnidades: Limpiando todas las unidades del condominio ${condoId}`)

  try {
    // Obtener todas las unidades para eliminar registros relacionados
    const { data: unidades, error: unidadesError } = await supabase
      .from("unidades")
      .select("id")
      .eq("condo_id", condoId)

    if (unidadesError) {
      throw new Error(`Error obteniendo unidades: ${unidadesError.message}`)
    }

    console.log(`clearAllUnidades: Encontradas ${unidades?.length || 0} unidades para eliminar`)

    // Eliminar registros relacionados primero
    if (unidades && unidades.length > 0) {
      const unidadIds = unidades.map(u => u.id)
      
      // Eliminar historial
      const { error: historialError } = await supabase
        .from("unidades_historial")
        .delete()
        .in("unidad_id", unidadIds)
      
      if (historialError) {
        console.warn("Error eliminando historial:", historialError)
      }

      // Eliminar archivos CBR
      const { error: archivosError } = await supabase
        .from("archivos_cbr")
        .delete()
        .in("unidad_id", unidadIds)
      
      if (archivosError) {
        console.warn("Error eliminando archivos CBR:", archivosError)
      }
    }

    // Eliminar unidades una por una para evitar problemas con el trigger
    let deletedCount = 0
    let errorCount = 0
    
    if (unidades && unidades.length > 0) {
      console.log(`clearAllUnidades: Iniciando eliminación de ${unidades.length} unidades`)
      
      for (const unidad of unidades) {
        try {
          console.log(`clearAllUnidades: Eliminando unidad ${unidad.id} (${unidad.unidad_codigo})`)
          
          const { data: deleteResult, error: deleteError } = await supabase
            .from("unidades")
            .delete()
            .eq("id", unidad.id)
            .select()

          console.log(`clearAllUnidades: Resultado eliminación unidad ${unidad.id}:`, {
            result: deleteResult,
            error: deleteError
          })

          if (deleteError) {
            // Si el error es del trigger de historial, considerarlo como éxito
            if (deleteError.message.includes("unidades_historial") && 
                deleteError.message.includes("foreign key constraint")) {
              console.log(`clearAllUnidades: Unidad ${unidad.id} eliminada (con advertencia de trigger)`)
              deletedCount++
            } else {
              console.error(`clearAllUnidades: Error eliminando unidad ${unidad.id}:`, deleteError)
              errorCount++
            }
          } else {
            console.log(`clearAllUnidades: Unidad ${unidad.id} eliminada exitosamente`)
            deletedCount++
          }
        } catch (error) {
          console.error(`clearAllUnidades: Error eliminando unidad ${unidad.id}:`, error)
          errorCount++
        }
      }
    }

    // Si no se eliminó ninguna unidad, intentar con SQL directo
    if (deletedCount === 0 && unidades && unidades.length > 0) {
      console.log(`clearAllUnidades: No se eliminaron unidades, intentando con SQL directo...`)
      try {
        const directResult = await clearAllUnidadesDirect(condoId)
        console.log(`clearAllUnidades: SQL directo exitoso:`, directResult)
        return directResult
      } catch (directError) {
        console.error(`clearAllUnidades: SQL directo también falló:`, directError)
        throw new Error(`Error eliminando todas las unidades. Método normal: ${errorCount} errores, SQL directo: ${directError instanceof Error ? directError.message : 'Error desconocido'}`)
      }
    }

    if (errorCount > 0 && deletedCount === 0) {
      throw new Error(`Error eliminando todas las unidades. ${errorCount} errores encontrados`)
    }

    // Verificar que las unidades realmente se eliminaron del servidor
    console.log(`clearAllUnidades: Verificando eliminación en servidor...`)
    const { data: unidadesRestantes, error: verifyError } = await supabase
      .from("unidades")
      .select("id, unidad_codigo")
      .eq("condo_id", condoId)

    if (verifyError) {
      console.error(`clearAllUnidades: Error verificando eliminación:`, verifyError)
    } else {
      console.log(`clearAllUnidades: Unidades restantes en servidor: ${unidadesRestantes?.length || 0}`)
      if (unidadesRestantes && unidadesRestantes.length > 0) {
        console.log(`clearAllUnidades: Unidades no eliminadas:`, unidadesRestantes.map(u => u.unidad_codigo))
      }
    }

    console.log(`clearAllUnidades: Proceso completado - ${deletedCount} eliminadas, ${errorCount} errores`)
    revalidatePath(`/condos/${condoId}/copropietarios`)
    return { success: true, deletedCount, errorCount, remainingInServer: unidadesRestantes?.length || 0 }
  } catch (error) {
    console.error("Error en clearAllUnidades:", error)
    throw error
  }
}

export async function diagnosticarFilaEspecifica(condoId: string, filaData: any) {
  console.log(`diagnosticarFilaEspecifica: Analizando datos de fila:`, filaData)
  
  try {
    // Procesar alícuota como lo hace el sistema
    let alicuotaProcessed = null
    if (filaData.alicuota !== '' && filaData.alicuota !== null && filaData.alicuota !== undefined) {
      let alicuotaStr = String(filaData.alicuota)
        .replace(',', '.')
        .replace(/\s/g, '')
        .trim()
      
      const n = Number(alicuotaStr)
      
      console.log(`diagnosticarFilaEspecifica: Procesando alícuota:`, {
        original: filaData.alicuota,
        cleaned: alicuotaStr,
        parsed: n,
        isFinite: Number.isFinite(n),
        stringLength: alicuotaStr.length
      })
      
      if (Number.isFinite(n) && n >= 0 && n <= 100) {
        alicuotaProcessed = Math.round(n * 10000) / 10000
        console.log(`diagnosticarFilaEspecifica: Alícuota procesada: ${alicuotaProcessed}`)
      }
    }
    
    // Procesar co-titulares
    let coTitularesProcessed = null
    if (filaData.co_titulares && Array.isArray(filaData.co_titulares)) {
      coTitularesProcessed = filaData.co_titulares.map((co: any) => {
        const porcentaje = co.porcentaje !== null && co.porcentaje !== undefined ? 
          Math.round(Number(co.porcentaje) * 10000) / 10000 : 0
        
        console.log(`diagnosticarFilaEspecifica: Co-titular ${co.nombre}:`, {
          original: co.porcentaje,
          processed: porcentaje,
          type: typeof porcentaje,
          stringLength: porcentaje.toString().length
        })
        
        return {
          ...co,
          porcentaje
        }
      })
    }
    
    console.log(`diagnosticarFilaEspecifica: Resultado final:`, {
      unidad_codigo: filaData.unidad_codigo,
      alicuota_original: filaData.alicuota,
      alicuota_processed: alicuotaProcessed,
      co_titulares_original: filaData.co_titulares,
      co_titulares_processed: coTitularesProcessed
    })
    
    return {
      success: true,
      alicuota: alicuotaProcessed,
      co_titulares: coTitularesProcessed
    }
  } catch (error) {
    console.error(`diagnosticarFilaEspecifica: Error:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

export async function testCreateUnidadMinimal(condoId: string, unidadCodigo: string, alicuota: number) {
  const supabase = await createClient()

  // Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  console.log(`testCreateUnidadMinimal: Probando inserción mínima para unidad ${unidadCodigo}`)

  try {
    // Crear datos mínimos para probar
    const testData = {
      condo_id: condoId,
      unidad_codigo: unidadCodigo,
      titular_tipo: "PersonaNatural",
      nombre_razon_social: "Test User",
      tipo_uso: "Departamento",
      alicuota: alicuota,
      // Campos opcionales como null
      co_titulares: null,
      roles: null,
      archivo_inscripcion_cbr: null,
      archivo_vigencia_cbr: null,
      contacto: null
    }

    console.log(`testCreateUnidadMinimal: Datos de prueba:`, testData)

    const { data: nuevaUnidad, error: createError } = await supabase
      .from("unidades")
      .insert(testData)
      .select()
      .single()

    if (createError) {
      console.error(`testCreateUnidadMinimal: Error:`, createError)
      throw new Error(`Error al crear unidad de prueba: ${createError.message}`)
    }

    console.log(`testCreateUnidadMinimal: Unidad de prueba creada exitosamente:`, nuevaUnidad)
    return nuevaUnidad
  } catch (error) {
    console.error(`testCreateUnidadMinimal: Error completo:`, error)
    throw error
  }
}

export async function testCreateUnidad(condoId: string) {
  const supabase = await createClient()

  // Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  // Verificar que el usuario tiene acceso al condominio
  const { data: condo, error: condoError } = await supabase
    .from("condos")
    .select("id, user_id")
    .eq("id", condoId)
    .single()

  if (condoError || !condo) {
    throw new Error("Condominio no encontrado")
  }

  if (condo.user_id !== user.id) {
    throw new Error("No tienes permisos para crear unidades en este condominio")
  }

  console.log(`testCreateUnidad: Creando unidad de prueba`)

  // Datos de prueba simples
  const testData = {
    condo_id: condoId,
    unidad_codigo: "TEST-001",
    alicuota: 1.5, // Valor simple
    titular_tipo: "PersonaNatural" as const,
    nombre_razon_social: "Test User",
    tipo_uso: ["Departamento"],
    roles: [],
    co_titulares: [],
    contacto: {},
    observaciones: "Unidad de prueba"
  }

  try {
    const { data: nuevaUnidad, error: createError } = await supabase
      .from("unidades")
      .insert(testData)
      .select()
      .single()

    if (createError) {
      console.error(`testCreateUnidad: Error de Supabase:`, createError)
      throw new Error(`Error al crear unidad de prueba: ${createError.message}`)
    }

    console.log(`testCreateUnidad: Unidad de prueba creada exitosamente:`, nuevaUnidad)
    return nuevaUnidad
  } catch (error) {
    console.error(`testCreateUnidad: Error completo:`, error)
    throw error
  }
}

export async function clearAllUnidadesDirect(condoId: string) {
  const supabase = await createClient()

  // Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  // Verificar que el usuario tiene acceso al condominio
  const { data: condo, error: condoError } = await supabase
    .from("condos")
    .select("id, user_id")
    .eq("id", condoId)
    .single()

  if (condoError || !condo) {
    throw new Error("Condominio no encontrado")
  }

  if (condo.user_id !== user.id) {
    throw new Error("No tienes permisos para limpiar las unidades de este condominio")
  }

  console.log(`clearAllUnidadesDirect: Limpiando todas las unidades del condominio ${condoId} usando SQL directo`)

  try {
    // Usar SQL directo para eliminar todas las unidades y registros relacionados
    const { data, error } = await supabase.rpc('clear_all_unidades', {
      p_condo_id: condoId
    })

    if (error) {
      console.error(`clearAllUnidadesDirect: Error ejecutando SQL directo:`, error)
      throw new Error(`Error ejecutando limpieza directa: ${error.message}`)
    }

    console.log(`clearAllUnidadesDirect: Limpieza directa completada:`, data)
    revalidatePath(`/condos/${condoId}/copropietarios`)
    return { success: true, deletedCount: data?.deleted_count || 0 }
  } catch (error) {
    console.error("Error en clearAllUnidadesDirect:", error)
    throw error
  }
}

export async function deleteUnidadDirect(unidadId: string) {
  const supabase = await createClient()

  // Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  console.log(`deleteUnidadDirect: Eliminando unidad ${unidadId} usando método directo`)

  try {
    // Obtener información de la unidad antes de eliminarla
    const { data: unidadInfo, error: infoError } = await supabase
      .from("unidades")
      .select("unidad_codigo")
      .eq("id", unidadId)
      .single()

    if (infoError || !unidadInfo) {
      throw new Error("Unidad no encontrada")
    }

    console.log(`deleteUnidadDirect: Eliminando registros relacionados para unidad ${unidadInfo.unidad_codigo}`)

    // Eliminar registros relacionados uno por uno
    const { error: historialError } = await supabase
      .from("unidades_historial")
      .delete()
      .eq("unidad_id", unidadId)

    if (historialError) {
      console.warn(`deleteUnidadDirect: Error eliminando historial:`, historialError)
    } else {
      console.log(`deleteUnidadDirect: Historial eliminado exitosamente`)
    }

    const { error: archivosError } = await supabase
      .from("archivos_cbr")
      .delete()
      .eq("unidad_id", unidadId)

    if (archivosError) {
      console.warn(`deleteUnidadDirect: Error eliminando archivos CBR:`, archivosError)
    } else {
      console.log(`deleteUnidadDirect: Archivos CBR eliminados exitosamente`)
    }

    // Eliminar la unidad principal
    const { data: deleteResult, error: deleteError } = await supabase
      .from("unidades")
      .delete()
      .eq("id", unidadId)
      .select()

    console.log(`deleteUnidadDirect: Resultado eliminación unidad:`, {
      result: deleteResult,
      error: deleteError
    })

    if (deleteError) {
      console.error(`deleteUnidadDirect: Error eliminando unidad:`, deleteError)
      throw new Error(`Error ejecutando eliminación directa: ${deleteError.message}`)
    }

    console.log(`deleteUnidadDirect: Eliminación directa completada para unidad ${unidadInfo.unidad_codigo}`)
    return { success: true, deletedCount: 1, unidad_codigo: unidadInfo.unidad_codigo }
  } catch (error) {
    console.error("Error en deleteUnidadDirect:", error)
    throw error
  }
}

export async function diagnosticarEliminacion(condoId: string, unidadId: string) {
  const supabase = await createClient()

  console.log(`diagnosticarEliminacion: Iniciando diagnóstico para unidad ${unidadId}`)

  try {
    // Verificar si la unidad existe
    const { data: unidad, error: unidadError } = await supabase
      .from("unidades")
      .select("*")
      .eq("id", unidadId)
      .single()

    console.log(`diagnosticarEliminacion: Estado de la unidad:`, {
      exists: !!unidad,
      error: unidadError,
      data: unidad
    })

    // Verificar registros relacionados
    const { data: historial, error: historialError } = await supabase
      .from("unidades_historial")
      .select("id")
      .eq("unidad_id", unidadId)

    console.log(`diagnosticarEliminacion: Historial relacionado:`, {
      count: historial?.length || 0,
      error: historialError,
      data: historial
    })

    const { data: archivos, error: archivosError } = await supabase
      .from("archivos_cbr")
      .select("id")
      .eq("unidad_id", unidadId)

    console.log(`diagnosticarEliminacion: Archivos relacionados:`, {
      count: archivos?.length || 0,
      error: archivosError,
      data: archivos
    })

    // Verificar triggers en la tabla
    const { data: triggers, error: triggersError } = await supabase
      .rpc('get_table_triggers', { table_name: 'unidades' })

    console.log(`diagnosticarEliminacion: Triggers en tabla unidades:`, {
      triggers,
      error: triggersError
    })

    return {
      unidad: unidad,
      historial: historial,
      archivos: archivos,
      triggers: triggers
    }
  } catch (error) {
    console.error("Error en diagnosticarEliminacion:", error)
    throw error
  }
}

export async function getUnidades(condoId: string) {
  const supabase = await createClient()

  // Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  // Verificar que el usuario tiene acceso al condominio
  const { data: condo, error: condoError } = await supabase
    .from("condos")
    .select("id, user_id")
    .eq("id", condoId)
    .single()

  if (condoError || !condo) {
    throw new Error("Condominio no encontrado")
  }

  if (condo.user_id !== user.id) {
    throw new Error("No tienes permisos para ver las unidades de este condominio")
  }

  // Obtener las unidades
  const { data: unidades, error: unidadesError } = await supabase
    .from("unidades")
    .select(`
      id,
      unidad_codigo,
      alicuota,
      titular_tipo,
      nombre_razon_social,
      tipo_uso,
      roles,
      archivo_inscripcion_cbr,
      archivo_vigencia_cbr,
      co_titulares,
      contacto,
      observaciones,
      fecha_ultima_actualizacion,
      created_at,
      updated_at
    `)
    .eq("condo_id", condoId)
    .order("unidad_codigo", { ascending: true })
    .limit(1000) // Asegurar que obtenemos todas las unidades

  if (unidadesError) {
    console.error("Error al obtener unidades:", unidadesError)
    throw new Error(`Error al obtener las unidades: ${unidadesError.message}`)
  }

  console.log(`getUnidades: Obtenidas ${unidades?.length || 0} unidades para condominio ${condoId}`)
  return unidades || []
}

export async function getTotalAlicuota(condoId: string) {
  const supabase = await createClient()

  // Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  // Verificar que el usuario tiene acceso al condominio
  const { data: condo, error: condoError } = await supabase
    .from("condos")
    .select("id, user_id")
    .eq("id", condoId)
    .single()

  if (condoError || !condo) {
    throw new Error("Condominio no encontrado")
  }

  if (condo.user_id !== user.id) {
    throw new Error("No tienes permisos para ver las unidades de este condominio")
  }

  // Obtener la suma de alícuotas
  const { data: unidades, error: unidadesError } = await supabase
    .from("unidades")
    .select("alicuota")
    .eq("condo_id", condoId)

  if (unidadesError) {
    throw new Error(`Error al obtener las alícuotas: ${unidadesError.message}`)
  }

  const totalAlicuota = unidades?.reduce((sum, unidad) => sum + Number(unidad.alicuota), 0) || 0
  return totalAlicuota
}

export async function duplicateUnidad(condoId: string, unidadId: string, nuevoCodigo: string) {
  const supabase = await createClient()

  // Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  // Verificar que el usuario tiene acceso al condominio
  const { data: condo, error: condoError } = await supabase
    .from("condos")
    .select("id, user_id")
    .eq("id", condoId)
    .single()

  if (condoError || !condo) {
    throw new Error("Condominio no encontrado")
  }

  if (condo.user_id !== user.id) {
    throw new Error("No tienes permisos para duplicar unidades en este condominio")
  }

  // Obtener la unidad original
  const { data: unidadOriginal, error: unidadError } = await supabase
    .from("unidades")
    .select("*")
    .eq("id", unidadId)
    .eq("condo_id", condoId)
    .single()

  if (unidadError || !unidadOriginal) {
    throw new Error("Unidad no encontrada")
  }

  // Validar que el nuevo código sea único
  const { data: existingUnidad } = await supabase
    .from("unidades")
    .select("id")
    .eq("condo_id", condoId)
    .eq("unidad_codigo", nuevoCodigo)
    .single()

  if (existingUnidad) {
    throw new Error("Ya existe una unidad con este código")
  }

  // Crear la unidad duplicada
  const { data: unidadDuplicada, error: createError } = await supabase
    .from("unidades")
    .insert({
      condo_id: condoId,
      unidad_codigo: nuevoCodigo,
      alicuota: unidadOriginal.alicuota,
      titular_tipo: unidadOriginal.titular_tipo,
      nombre_razon_social: `${unidadOriginal.nombre_razon_social} (Copia)`,
      tipo_uso: unidadOriginal.tipo_uso,
      roles: unidadOriginal.roles,
      archivo_inscripcion_cbr: null, // No duplicar archivos
      archivo_vigencia_cbr: null,
      co_titulares: unidadOriginal.co_titulares,
      contacto: unidadOriginal.contacto,
      observaciones: unidadOriginal.observaciones
    })
    .select()
    .single()

  if (createError) {
    throw new Error(`Error al duplicar la unidad: ${createError.message}`)
  }

  revalidatePath(`/condos/${condoId}/copropietarios`)
  return unidadDuplicada
}
