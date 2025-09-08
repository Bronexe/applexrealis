"use server"

import { createClient } from "@/lib/supabase/server"

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

    const { error: uploadError } = await supabase.storage.from("evidence").upload(fileName, file)

    if (uploadError) {
      throw uploadError
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("evidence").getPublicUrl(fileName)

    return { url: publicUrl, fileName }
  } catch (error) {
    console.error("Upload error:", error)
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
    const urlParts = filePath.split("/")
    // Nueva estructura: user_id/condo_id/module/filename.pdf
    const fileName = urlParts.slice(-4).join("/") // Get user_id/condoId/module/filename.pdf

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
