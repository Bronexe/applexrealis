import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Obtener el usuario actual para aislamiento
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: "No se pudo obtener la información del usuario" },
        { status: 401 }
      )
    }

    // Parsear el FormData
    const formData = await request.formData()
    const file = formData.get("file") as File
    const condoId = formData.get("condoId") as string
    const module = formData.get("module") as string

    if (!file || !condoId || !module) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      )
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Solo se permiten archivos PDF" },
        { status: 400 }
      )
    }

    // Validate file size (20MB max)
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: "El archivo no puede ser mayor a 20MB" },
        { status: 400 }
      )
    }

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

    // Subir directamente
    const { error: uploadError } = await supabase.storage
      .from("evidence")
      .upload(fileName, file, uploadOptions)

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return NextResponse.json(
        { error: `Error al subir el archivo: ${uploadError.message}` },
        { status: 500 }
      )
    }

    const endTime = Date.now()
    const uploadTime = (endTime - startTime) / 1000
    const speed = Math.round(file.size / 1024 / uploadTime) // KB/s
    
    console.log(`✅ Subida completada en ${uploadTime.toFixed(2)}s (${speed} KB/s)`)

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from("evidence")
      .getPublicUrl(fileName)

    return NextResponse.json({
      url: publicUrl,
      fileName,
      uploadTime: uploadTime.toFixed(2),
      speed: speed.toString()
    })

  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
















