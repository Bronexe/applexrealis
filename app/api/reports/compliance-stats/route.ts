import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const condoId = searchParams.get("condo_id")

    if (!condoId) {
      return NextResponse.json({ error: "ID de condominio requerido" }, { status: 400 })
    }

    // Obtener estadísticas de cumplimiento
    const stats = await getComplianceStats(supabase, condoId)

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error obteniendo estadísticas de cumplimiento:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

async function getComplianceStats(supabase: any, condoId: string) {
  const today = new Date().toISOString().split('T')[0]
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Contar documentos por tipo y estado
  const [assemblies, plans, certifications, insurances, contracts, copropietarios] = await Promise.all([
    // Asambleas
    supabase
      .from('assemblies')
      .select('valid_to')
      .eq('condo_id', condoId),

    // Planes de emergencia
    supabase
      .from('emergency_plans')
      .select('valid_to')
      .eq('condo_id', condoId),

    // Certificaciones
    supabase
      .from('certifications')
      .select('valid_to')
      .eq('condo_id', condoId),

    // Seguros
    supabase
      .from('insurances')
      .select('valid_to')
      .eq('condo_id', condoId),

    // Contratos
    supabase
      .from('contracts')
      .select('end_date')
      .eq('condo_id', condoId),

    // Copropietarios
    supabase
      .from('unidades_simplified')
      .select('id')
      .eq('condo_id', condoId)
  ])

  // Procesar estadísticas
  let totalDocuments = 0
  let expiredDocuments = 0
  let expiringSoon = 0
  let compliantDocuments = 0

  // Procesar cada tipo de documento
  const processDocuments = (documents: any[], dateField: string) => {
    if (documents.data) {
      totalDocuments += documents.data.length
      
      documents.data.forEach((doc: any) => {
        const validDate = doc[dateField]
        if (validDate) {
          if (validDate < today) {
            expiredDocuments++
          } else if (validDate <= thirtyDaysFromNow) {
            expiringSoon++
          } else {
            compliantDocuments++
          }
        } else {
          // Si no hay fecha de vencimiento, se considera válido
          compliantDocuments++
        }
      })
    }
  }

  processDocuments(assemblies, 'valid_to')
  processDocuments(plans, 'valid_to')
  processDocuments(certifications, 'valid_to')
  processDocuments(insurances, 'valid_to')
  processDocuments(contracts, 'end_date')

  // Copropietarios no tienen fecha de vencimiento, se cuentan como válidos
  const copropietariosCount = copropietarios.data?.length || 0
  totalDocuments += copropietariosCount
  compliantDocuments += copropietariosCount

  const complianceRate = totalDocuments > 0 ? (compliantDocuments / totalDocuments) * 100 : 0

  return {
    totalDocuments,
    expiredDocuments,
    expiringSoon,
    compliantDocuments,
    complianceRate,
    contractsCount: contracts.data?.length || 0,
    copropietariosCount
  }
}






