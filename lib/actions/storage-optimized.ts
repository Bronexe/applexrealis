"use server"

import { createClient } from "@/lib/supabase/server"

// Función para subida por chunks optimizada
export async function uploadFileOptimized(formData: FormData) {
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
    const fileName = `${user.id}/${condoId}/${module}/${crypto.randomUUID()}.${fileExt}`
    
    console.log(`🚀 Iniciando subida optimizada: ${file.name} (${Math.round(file.size / 1024 / 1024)}MB)`)

    const startTime = Date.now()

    // Para archivos grandes (>5MB), usar subida por chunks
    if (file.size > 5 * 1024 * 1024) {
      console.log('📦 Usando subida por chunks para archivo grande')
      return await uploadFileInChunks(supabase, fileName, file)
    }

    // Para archivos pequeños, usar subida directa optimizada
    console.log('⚡ Usando subida directa optimizada')
    
    // Convertir a ArrayBuffer para mejor rendimiento
    const arrayBuffer = await file.arrayBuffer()
    
    // Opciones de subida optimizadas
    const uploadOptions = {
      cacheControl: '3600',
      upsert: false,
      contentType: 'application/pdf',
    }

    // Log de progreso para archivos pequeños
    console.log('📊 Progreso: 50% - Iniciando subida directa')

    const { error: uploadError } = await supabase.storage
      .from("evidence")
      .upload(fileName, arrayBuffer, uploadOptions)

    if (uploadError) {
      throw uploadError
    }

    console.log('📊 Progreso: 100% - Subida completada')

    const endTime = Date.now()
    const uploadTime = (endTime - startTime) / 1000
    const speed = Math.round(file.size / 1024 / uploadTime) // KB/s
    
    console.log(`✅ Subida completada en ${uploadTime.toFixed(2)}s (${speed} KB/s)`)

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from("evidence")
      .getPublicUrl(fileName)

    return { url: publicUrl, fileName, uploadTime, speed }

  } catch (error) {
    console.error("Upload error:", error)
    
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

// Función para subida por chunks
async function uploadFileInChunks(
  supabase: any,
  fileName: string,
  file: File
) {
  const chunkSize = 1024 * 1024 // 1MB por chunk
  const totalChunks = Math.ceil(file.size / chunkSize)
  
  console.log(`📦 Subiendo archivo en ${totalChunks} chunks de ${Math.round(chunkSize / 1024)}KB cada uno`)

  // Crear un archivo temporal para combinar chunks
  const tempFileName = `${fileName}.temp`
  
  try {
    // Subir chunks secuencialmente
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      const chunk = file.slice(start, end)
      
      const chunkFileName = `${tempFileName}.chunk.${i}`
      
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

      // Actualizar progreso
      const progress = Math.round(((i + 1) / totalChunks) * 90) // 90% para chunks, 10% para finalización
      console.log(`📦 Chunk ${i + 1}/${totalChunks} subido (${progress}%)`)
    }

    // Combinar chunks en el archivo final
    console.log('🔗 Combinando chunks...')
    
    // Leer todos los chunks y combinarlos
    const chunks = []
    for (let i = 0; i < totalChunks; i++) {
      const chunkFileName = `${tempFileName}.chunk.${i}`
      const { data: chunkData, error } = await supabase.storage
        .from("evidence")
        .download(chunkFileName)
      
      if (error) {
        throw new Error(`Error al leer chunk ${i + 1}: ${error.message}`)
      }
      
      chunks.push(await chunkData.arrayBuffer())
    }

    // Combinar chunks
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0)
    const combinedBuffer = new Uint8Array(totalSize)
    let offset = 0
    
    for (const chunk of chunks) {
      combinedBuffer.set(new Uint8Array(chunk), offset)
      offset += chunk.byteLength
    }

    // Subir archivo final
    const { error: finalError } = await supabase.storage
      .from("evidence")
      .upload(fileName, combinedBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'application/pdf',
      })

    if (finalError) {
      throw finalError
    }

    // Limpiar chunks temporales
    const chunkFiles = Array.from({ length: totalChunks }, (_, i) => `${tempFileName}.chunk.${i}`)
    await supabase.storage
      .from("evidence")
      .remove(chunkFiles)

    console.log('📊 Progreso: 100% - Archivo combinado exitosamente')

    console.log('✅ Archivo combinado y subido exitosamente')

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from("evidence")
      .getPublicUrl(fileName)

    return { url: publicUrl, fileName }

  } catch (error) {
    // Limpiar chunks en caso de error
    try {
      const chunkFiles = Array.from({ length: totalChunks }, (_, i) => `${tempFileName}.chunk.${i}`)
      await supabase.storage
        .from("evidence")
        .remove(chunkFiles)
    } catch (cleanupError) {
      console.warn('Error limpiando chunks temporales:', cleanupError)
    }
    
    throw error
  }
}

// Función para subida con retry automático
export async function uploadFileWithRetry(
  formData: FormData,
  maxRetries: number = 3
) {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Intento ${attempt}/${maxRetries}`)
      
      const result = await uploadFileOptimized(formData)
      
      if (attempt > 1) {
        console.log(`✅ Subida exitosa en el intento ${attempt}`)
      }
      
      return result
      
    } catch (error) {
      lastError = error as Error
      console.warn(`❌ Intento ${attempt} falló:`, error)
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000 // Backoff exponencial
        console.log(`⏳ Esperando ${delay}ms antes del siguiente intento...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw new Error(`Subida falló después de ${maxRetries} intentos: ${lastError?.message}`)
}

// Función para eliminar archivos (reutilizada del archivo original)
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

// Función para obtener URL firmada (reutilizada del archivo original)
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
