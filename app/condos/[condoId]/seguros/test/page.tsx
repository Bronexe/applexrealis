"use client"

import React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestInsurancePage({ params }: { params: Promise<{ condoId: string }> }) {
  const { condoId } = React.use(params)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string>("")
  const [error, setError] = useState<string>("")

  const testConnection = async () => {
    setIsLoading(true)
    setResult("")
    setError("")

    try {
      console.log('=== INICIANDO PRUEBA DE CONEXIÓN PARA SEGUROS ===')
      
      const supabase = createClient()
      console.log('Cliente de Supabase creado')

      // Prueba 1: Verificar autenticación
      console.log('Prueba 1: Verificando autenticación...')
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        throw new Error(`Error de autenticación: ${authError.message}`)
      }
      
      if (!user) {
        throw new Error("No hay usuario autenticado")
      }

      setResult(prev => prev + `✅ Usuario autenticado: ${user.id}\n`)

      // Prueba 2: Verificar que el condominio existe
      console.log('Prueba 2: Verificando condominio...')
      const { data: condoData, error: condoError } = await supabase
        .from("condos")
        .select("id, name")
        .eq("id", condoId)
        .single()

      if (condoError) {
        throw new Error(`Error al verificar condominio: ${condoError.message}`)
      }

      setResult(prev => prev + `✅ Condominio encontrado: ${condoData.name}\n`)

      // Prueba 3: Verificar permisos de lectura en insurances
      console.log('Prueba 3: Verificando permisos de lectura...')
      const { data: insuranceData, error: insuranceError } = await supabase
        .from("insurances")
        .select("id")
        .eq("condo_id", condoId)
        .limit(1)

      if (insuranceError) {
        throw new Error(`Error al leer seguros: ${insuranceError.message}`)
      }

      setResult(prev => prev + `✅ Permisos de lectura OK (${insuranceData.length} seguros encontrados)\n`)

      // Prueba 4: Intentar insertar un seguro de prueba
      console.log('Prueba 4: Intentando insertar seguro de prueba...')
      const testData = {
        condo_id: condoId,
        user_id: user.id,
        policy_number: "TEST-POL-001",
        insurer: "Compañía de Prueba",
        insurance_type: "incendio-espacios-comunes",
        valid_from: new Date().toISOString().split('T')[0],
        valid_to: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        policy_file_url: null,
      }

      const { data: insertData, error: insertError } = await supabase
        .from("insurances")
        .insert([testData])
        .select()

      if (insertError) {
        throw new Error(`Error al insertar: ${insertError.message}`)
      }

      setResult(prev => prev + `✅ Inserción exitosa: ${insertData[0].id}\n`)

      // Prueba 5: Eliminar el seguro de prueba
      console.log('Prueba 5: Eliminando seguro de prueba...')
      const { error: deleteError } = await supabase
        .from("insurances")
        .delete()
        .eq("id", insertData[0].id)

      if (deleteError) {
        throw new Error(`Error al eliminar: ${deleteError.message}`)
      }

      setResult(prev => prev + `✅ Eliminación exitosa\n`)
      setResult(prev => prev + `\n🎉 TODAS LAS PRUEBAS DE SEGUROS PASARON CORRECTAMENTE`)

    } catch (error: unknown) {
      console.error('Error en la prueba:', error)
      
      let errorMessage = "Error desconocido"
      
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (error && typeof error === 'object') {
        const errorObj = error as any
        if (errorObj.message) {
          errorMessage = errorObj.message
        } else {
          errorMessage = JSON.stringify(error, null, 2)
        }
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Prueba de Seguros</h2>
        <p className="text-muted-foreground">Diagnóstico de problemas con la creación de seguros</p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Pruebas de Diagnóstico</CardTitle>
          <CardDescription>
            Este formulario ejecuta una serie de pruebas para identificar problemas con la creación de seguros.
            Condominio ID: {condoId}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testConnection} 
            disabled={isLoading}
            className="rounded-xl"
          >
            {isLoading ? "Ejecutando pruebas..." : "Ejecutar Pruebas"}
          </Button>

          {result && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <h3 className="font-semibold text-green-800 mb-2">Resultados:</h3>
              <pre className="text-sm text-green-700 whitespace-pre-wrap">{result}</pre>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <h3 className="font-semibold text-red-800 mb-2">Error:</h3>
              <pre className="text-sm text-red-700 whitespace-pre-wrap">{error}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


















