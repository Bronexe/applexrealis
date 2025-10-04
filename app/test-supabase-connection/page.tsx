"use client"

import React, { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestSupabaseConnectionPage() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testBasicConnection = async () => {
    setIsLoading(true)
    setTestResults([])
    
    try {
      addResult("🔄 Iniciando prueba de conexión básica...")
      
      // 1. Crear cliente
      addResult("🔄 Creando cliente de Supabase...")
      const supabase = createClient()
      addResult("✅ Cliente creado exitosamente")
      
      // 2. Verificar autenticación
      addResult("🔄 Verificando autenticación...")
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        addResult(`❌ Error de autenticación: ${authError.message}`)
      } else if (user) {
        addResult(`✅ Usuario autenticado: ${user.email} (ID: ${user.id})`)
      } else {
        addResult("⚠️ No hay usuario autenticado")
      }
      
      // 3. Probar consulta simple a condos
      addResult("🔄 Probando consulta a tabla 'condos'...")
      const { data: condos, error: condosError } = await supabase
        .from('condos')
        .select('id, name')
        .limit(3)
      
      if (condosError) {
        addResult(`❌ Error consultando condos: ${condosError.message}`)
        addResult(`❌ Detalles: ${JSON.stringify(condosError, null, 2)}`)
      } else {
        addResult(`✅ Consulta a condos exitosa. Encontrados: ${condos?.length || 0} condominios`)
        if (condos && condos.length > 0) {
          addResult(`📋 Primer condominio: ${condos[0].name} (ID: ${condos[0].id})`)
        }
      }
      
      // 4. Probar consulta a contracts
      addResult("🔄 Probando consulta a tabla 'contracts'...")
      const { data: contracts, error: contractsError } = await supabase
        .from('contracts')
        .select('id, contract_number')
        .limit(3)
      
      if (contractsError) {
        addResult(`❌ Error consultando contracts: ${contractsError.message}`)
        addResult(`❌ Detalles: ${JSON.stringify(contractsError, null, 2)}`)
      } else {
        addResult(`✅ Consulta a contracts exitosa. Encontrados: ${contracts?.length || 0} contratos`)
      }
      
      // 5. Probar inserción de prueba (si hay usuario autenticado)
      if (user) {
        addResult("🔄 Probando inserción de prueba en contracts...")
        
        // Obtener un condominio del usuario
        const { data: userCondos } = await supabase
          .from('condos')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)
        
        if (userCondos && userCondos.length > 0) {
          const testContractData = {
            condo_id: userCondos[0].id,
            user_id: user.id,
            contract_number: 'TEST-CONNECTION-001',
            contract_type: 'mantenimiento_ascensores',
            start_date: '2024-01-01',
            amount: 100000,
            currency: 'CLP',
            provider_name: 'Test Provider',
            status: 'vigente'
          }
          
          addResult(`🔄 Insertando contrato de prueba...`)
          addResult(`📋 Datos: ${JSON.stringify(testContractData, null, 2)}`)
          
          const { data: insertData, error: insertError } = await supabase
            .from('contracts')
            .insert([testContractData])
            .select()
          
          if (insertError) {
            addResult(`❌ Error insertando contrato: ${insertError.message}`)
            addResult(`❌ Código: ${insertError.code}`)
            addResult(`❌ Detalles: ${insertError.details}`)
            addResult(`❌ Hint: ${insertError.hint}`)
            addResult(`❌ Error completo: ${JSON.stringify(insertError, null, 2)}`)
          } else {
            addResult(`✅ Inserción exitosa! ID: ${insertData?.[0]?.id}`)
            
            // Limpiar el registro de prueba
            if (insertData?.[0]?.id) {
              const { error: deleteError } = await supabase
                .from('contracts')
                .delete()
                .eq('id', insertData[0].id)
              
              if (deleteError) {
                addResult(`⚠️ Error eliminando registro de prueba: ${deleteError.message}`)
              } else {
                addResult(`✅ Registro de prueba eliminado`)
              }
            }
          }
        } else {
          addResult("⚠️ No hay condominios para el usuario, saltando prueba de inserción")
        }
      } else {
        addResult("⚠️ Sin usuario autenticado, saltando prueba de inserción")
      }
      
      addResult("🎉 Prueba de conexión completada")
      
    } catch (error) {
      addResult(`❌ Error inesperado: ${error instanceof Error ? error.message : String(error)}`)
      console.error('Error en prueba de conexión:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>🧪 Prueba de Conexión con Supabase</CardTitle>
          <CardDescription>
            Esta página prueba la conexión básica con Supabase y las operaciones CRUD
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button 
            onClick={testBasicConnection} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "🔄 Probando conexión..." : "🚀 Iniciar Prueba de Conexión"}
          </Button>
          
          {testResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📋 Resultados de la Prueba</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {testResults.map((result, index) => (
                    <div 
                      key={index} 
                      className={`p-2 rounded text-sm font-mono ${
                        result.includes('✅') ? 'bg-green-50 text-green-800' :
                        result.includes('❌') ? 'bg-red-50 text-red-800' :
                        result.includes('⚠️') ? 'bg-yellow-50 text-yellow-800' :
                        'bg-blue-50 text-blue-800'
                      }`}
                    >
                      {result}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}






