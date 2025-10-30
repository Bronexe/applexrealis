"use server"

import { createClient } from "@/lib/supabase/server"

// Función directa para subida de archivos sin optimizaciones complejas
export async function uploadFileDirect(formData: FormData) {
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
    
    console.log(`🚀 Subiendo archivo: ${file.name} (${Math.round(file.size / 1024 / 1024)}MB)`)

    const startTime = Date.now()

    // Opciones de subida simples
    const uploadOptions = {
      cacheControl: '3600',
      upsert: false,
      contentType: 'application/pdf',
    }

    // Subir directamente sin conversiones
    const { error: uploadError } = await supabase.storage
      .from("evidence")
      .upload(fileName, file, uploadOptions)

    if (uploadError) {
      console.error("Upload error details:", uploadError)
      throw uploadError
    }

    const endTime = Date.now()
    const uploadTime = (endTime - startTime) / 1000
    const speed = Math.round(file.size / 1024 / uploadTime) // KB/s
    
    console.log(`✅ Subida completada en ${uploadTime.toFixed(2)}s (${speed} KB/s)`)

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from("evidence")
      .getPublicUrl(fileName)

    return { 
      url: publicUrl, 
      fileName, 
      uploadTime: uploadTime.toFixed(2),
      speed: speed.toString()
    }

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
      } else if (error.message.includes("channel closed")) {
        throw new Error("Conexión interrumpida. Intenta subir el archivo nuevamente.")
      } else {
        throw new Error(`Error al subir el archivo: ${error.message}`)
      }
    }
    
    throw new Error("Error al subir el archivo")
  }
}

// Función para subida con retry simple
export async function uploadFileWithRetryDirect(
  formData: FormData,
  maxRetries: number = 2
) {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Intento ${attempt}/${maxRetries}`)
      
      const result = await uploadFileDirect(formData)
      
      if (attempt > 1) {
        console.log(`✅ Subida exitosa en el intento ${attempt}`)
      }
      
      return result
      
    } catch (error) {
      lastError = error as Error
      console.warn(`❌ Intento ${attempt} falló:`, error)
      
      if (attempt < maxRetries) {
        const delay = 2000 // 2 segundos fijos
        console.log(`⏳ Esperando ${delay}ms antes del siguiente intento...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw new Error(`Subida falló después de ${maxRetries} intentos: ${lastError?.message}`)
}

// Función para eliminar archivos
export async function deleteFile(filePath: string) {
  const supabase = await createClient()

  try {
    // Obtener el usuario actual para verificación de seguridad
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error("No se pudo obtener la información del usuario")
    }

    // Verificar si es super admin de forma más robusta
    let isSuperAdmin = false
    try {
      // Verificación específica para sebaleon@gmail.com
      if (user.email === 'sebaleon@gmail.com') {
        isSuperAdmin = true
      } else {
        // Verificación en la tabla administrators
        const { data: admin, error: adminError } = await supabase
          .from("administrators")
          .select("role, is_active")
          .eq("user_id", user.id)
          .single()

        if (!adminError && admin) {
          isSuperAdmin = admin.role === 'super_admin' && admin.is_active === true
        }
      }
    } catch (adminCheckError) {
      console.warn("Error verificando super admin:", adminCheckError)
      // Si falla la verificación, asumir que no es super admin
      isSuperAdmin = false
    }

    // Extract the file path from the URL
    const urlParts = filePath.split("/")
    // Nueva estructura: user_id/condo_id/module/filename.pdf
    const fileName = urlParts.slice(-4).join("/") // Get user_id/condoId/module/filename.pdf

    // Verificar permisos: propietario del archivo O super admin
    if (!isSuperAdmin && !fileName.startsWith(user.id)) {
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

// Función para obtener URL firmada
export async function getSignedUrl(filePath: string) {
  const supabase = await createClient()

  try {
    // Obtener el usuario actual para verificación de seguridad
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error("No se pudo obtener la información del usuario")
    }

    // Verificar si es super admin de forma más robusta
    let isSuperAdmin = false
    try {
      // Verificación específica para sebaleon@gmail.com
      if (user.email === 'sebaleon@gmail.com') {
        isSuperAdmin = true
      } else {
        // Verificación en la tabla administrators
        const { data: admin, error: adminError } = await supabase
          .from("administrators")
          .select("role, is_active")
          .eq("user_id", user.id)
          .single()

        if (!adminError && admin) {
          isSuperAdmin = admin.role === 'super_admin' && admin.is_active === true
        }
      }
    } catch (adminCheckError) {
      console.warn("Error verificando super admin:", adminCheckError)
      // Si falla la verificación, asumir que no es super admin
      isSuperAdmin = false
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

    // Verificar permisos: propietario del archivo O super admin
    if (!isSuperAdmin && !fileName.startsWith(user.id)) {
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
















