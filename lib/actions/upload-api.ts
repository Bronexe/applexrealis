// Función del cliente para subir archivos usando API route
export async function uploadFileViaAPI(formData: FormData) {
  try {
    const response = await fetch('/api/upload-file', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error al subir el archivo')
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error en uploadFileViaAPI:', error)
    throw error
  }
}

// Función para subida con retry usando API route
export async function uploadFileWithRetryAPI(
  formData: FormData,
  maxRetries: number = 2
) {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Intento ${attempt}/${maxRetries}`)
      
      const result = await uploadFileViaAPI(formData)
      
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













