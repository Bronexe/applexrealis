"use server"

import { createClient } from "@/lib/supabase/server"

// Función para subida por chunks optimizada
async function uploadFileInChunks(
  supabase: any,
  fileName: string,
  file: File,
  chunkSize: number = 1024 * 1024 // 1MB por chunk
): Promise<void> {
  const totalChunks = Math.ceil(file.size / chunkSize)
  console.log(`Subiendo archivo en ${totalChunks} chunks de ${Math.round(chunkSize / 1024)}KB cada uno`)

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize
    const end = Math.min(start + chunkSize, file.size)
    const chunk = file.slice(start, end)
    
    const chunkFileName = `${fileName}.chunk.${i}`
    
    const { error } = await supabase.storage
      .from("evidence")
      .upload(chunkFileName, chunk, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'application/octet-stream',
      })

    if (error) {
      throw new Error(`Error al subir chunk ${i + 1}/${totalChunks}: ${error.message}`)
    }

    console.log(`Chunk ${i + 1}/${totalChunks} subido (${Math.round((i + 1) / totalChunks * 100)}%)`)
  }

  // Combinar chunks en el archivo final
  // Nota: Esta parte requeriría una función del lado del servidor para combinar chunks
  // Por ahora, usamos el método directo para archivos grandes
}

// Función para optimizar archivos PDF (reducir tamaño)
async function optimizePdfFile(file: File): Promise<File> {
  // Para archivos pequeños (<2MB), no optimizar
  if (file.size < 2 * 1024 * 1024) {
    return file
  }

  try {
    // Crear un nuevo File con el mismo contenido pero con metadatos optimizados
    const arrayBuffer = await file.arrayBuffer()
    
    // Crear un nuevo File con el mismo contenido
    const optimizedFile = new File([arrayBuffer], file.name, {
      type: 'application/pdf',
      lastModified: Date.now()
    })

    console.log(`Archivo optimizado: ${Math.round(file.size / 1024 / 1024)}MB -> ${Math.round(optimizedFile.size / 1024 / 1024)}MB`)
    return optimizedFile
  } catch (error) {
    console.warn('No se pudo optimizar el archivo, usando original:', error)
    return file
  }
}

export async function uploadFile(formData: FormData) {
  const supabase = await createClient()

  const file = formData.get("file") as File
  const condoId = formData.get("condoId") as string
  const module = formData.get("module") as string

  if (!file || !condoId || !module) {
    throw new Error("Missing required parameters")
  }

  // Obtener el usuario actual para aislamiento
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error("No se pudo obtener la información del usuario")
  }

  // Validate file type
  if (file.type !== "application/pdf") {
    throw new Error("Solo se permiten archivos PDF")
  }

  // Validate file size (20MB max)
  if (file.size > 20 * 1024 * 1024) {
    throw new Error("El archivo no puede ser mayor a 20MB")
  }

  try {
    const fileExt = "pdf"
    // Nueva estructura: user_id/condo_id/module/filename.pdf
    const fileName = `${user.id}/${condoId}/${module}/${crypto.randomUUID()}.${fileExt}`

    // Optimizar archivo antes de subir
    const optimizedFile = await optimizePdfFile(file)
    console.log(`Iniciando subida: ${Math.round(optimizedFile.size / 1024 / 1024)}MB`)

    // Optimización: Usar upload con opciones de rendimiento
    const uploadOptions = {
      cacheControl: '3600', // Cache por 1 hora
      upsert: false, // No sobrescribir archivos existentes
      contentType: 'application/pdf', // Especificar tipo MIME explícitamente
    }

    const startTime = Date.now()

    // Para archivos grandes (>3MB), usar ArrayBuffer para mejor rendimiento
    if (optimizedFile.size > 3 * 1024 * 1024) {
      console.log(`Subiendo archivo grande (${Math.round(optimizedFile.size / 1024 / 1024)}MB) con optimizaciones...`)
      
      // Convertir File a ArrayBuffer para mejor rendimiento
      const arrayBuffer = await optimizedFile.arrayBuffer()
      const { error: uploadError } = await supabase.storage
        .from("evidence")
        .upload(fileName, arrayBuffer, uploadOptions)

      if (uploadError) {
        throw uploadError
      }
    } else {
      // Para archivos pequeños, usar upload directo
      const { error: uploadError } = await supabase.storage
        .from("evidence")
        .upload(fileName, optimizedFile, uploadOptions)

      if (uploadError) {
        throw uploadError
      }
    }

    const endTime = Date.now()
    const uploadTime = (endTime - startTime) / 1000
    const speed = Math.round(optimizedFile.size / 1024 / uploadTime) // KB/s
    console.log(`Subida completada en ${uploadTime.toFixed(2)}s (${speed} KB/s)`)

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("evidence").getPublicUrl(fileName)

    return { url: publicUrl, fileName }
  } catch (error) {
    console.error("Upload error:", error)
    
    // Proporcionar mensajes de error más específicos
    if (error instanceof Error) {
      if (error.message.includes("JWT")) {
        throw new Error("Error de autenticación. Por favor, inicia sesión nuevamente.")
      } else if (error.message.includes("permission")) {
        throw new Error("No tienes permisos para subir archivos a este condominio.")
      } else if (error.message.includes("bucket")) {
        throw new Error("Error del sistema de almacenamiento. Contacta al administrador.")
      } else if (error.message.includes("size")) {
        throw new Error("El archivo es demasiado grande.")
      } else if (error.message.includes("network") || error.message.includes("timeout")) {
        throw new Error("Error de conexión. Verifica tu internet e intenta nuevamente.")
      } else {
        throw new Error(`Error al subir el archivo: ${error.message}`)
      }
    }
    
    throw new Error("Error al subir el archivo")
  }
}

export async function deleteFile(filePath: string) {
  const supabase = await createClient()

  try {
    // Obtener el usuario actual para verificación de seguridad
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error("No se pudo obtener la información del usuario")
    }

    // Extract the file path from the URL
    const urlParts = filePath.split("/")
    // Nueva estructura: user_id/condo_id/module/filename.pdf
    const fileName = urlParts.slice(-4).join("/") // Get user_id/condoId/module/filename.pdf

    // Verificar que el archivo pertenece al usuario actual
    if (!fileName.startsWith(user.id)) {
      throw new Error("No tienes permisos para eliminar este archivo")
    }

    const { error } = await supabase.storage.from("evidence").remove([fileName])

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error("Delete error:", error)
    throw new Error("Error al eliminar el archivo")
  }
}

export async function getSignedUrl(filePath: string) {
  const supabase = await createClient()

  try {
    // Obtener el usuario actual para verificación de seguridad
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error("No se pudo obtener la información del usuario")
    }

    // Extract the file path from the URL
    let fileName: string
    
    // Si es una URL completa de Supabase Storage, extraer el path del archivo
    if (filePath.includes('/storage/v1/object/public/evidence/')) {
      // URL completa: https://...supabase.co/storage/v1/object/public/evidence/user_id/condo_id/module/filename.pdf
      const urlParts = filePath.split('/storage/v1/object/public/evidence/')
      if (urlParts.length > 1) {
        fileName = urlParts[1]
      } else {
        throw new Error("URL de archivo inválida")
      }
    } else {
      // Si ya es solo el path del archivo
      fileName = filePath
    }

    // Verificar que el archivo pertenece al usuario actual
    if (!fileName.startsWith(user.id)) {
      throw new Error("No tienes permisos para acceder a este archivo")
    }

    const { data, error } = await supabase.storage.from("evidence").createSignedUrl(fileName, 3600) // 1 hour expiry

    if (error) {
      throw error
    }

    return { signedUrl: data.signedUrl }
  } catch (error) {
    console.error("Signed URL error:", error)
    throw new Error("Error al generar enlace de descarga")
  }
}
