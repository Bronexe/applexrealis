import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, FileText, Building, Calendar, DollarSign } from "lucide-react"
import Link from "next/link"
import { ContractActions } from "./contract-actions"

export default async function ContratosPage({ params }: { params: Promise<{ condoId: string }> }) {
  const { condoId } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  // Get contracts for this condo
  const { data: contracts, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("condo_id", condoId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching contracts:", error)
  }

  const getContractTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'mantenimiento_ascensores': 'Mantenimiento de ascensores',
      'mantenimiento_calderas': 'Mantenimiento de calderas y calefacción',
      'mantenimiento_generadores': 'Mantenimiento de grupos electrógenos / generadores',
      'mantenimiento_bombas': 'Mantenimiento de bombas de agua / hidroneumáticos',
      'mantenimiento_incendios': 'Mantenimiento de sistemas contra incendios',
      'mantenimiento_portones': 'Mantenimiento de portones automáticos y barreras',
      'mantenimiento_jardines': 'Mantenimiento de jardines y áreas verdes',
      'mantenimiento_piscinas': 'Mantenimiento de piscinas',
      'limpieza_comunes': 'Limpieza de espacios comunes',
      'limpieza_vidrios': 'Limpieza de vidrios en altura',
      'control_plagas': 'Control de plagas y desratización',
      'servicios_conserjeria': 'Servicios de conserjería',
      'seguridad_privada': 'Seguridad privada / guardias',
      'monitoreo_cctv': 'Monitoreo CCTV y alarmas',
      'internet_redes': 'Internet y redes de comunicación',
      'plataforma_admin': 'Plataforma de administración de edificios',
      'mantenimiento_antenas': 'Mantenimiento de antenas o satélites',
      'auditoria_contable': 'Auditoría contable',
      'asesoria_legal': 'Asesoría legal',
      'gestion_seguros': 'Gestión de seguros',
      'compra_insumos': 'Compra de insumos de aseo',
      'compra_repuestos': 'Compra de repuestos técnicos',
      'abastecimiento_gas': 'Abastecimiento de gas o combustible',
      'reparacion_cubiertas': 'Reparación de cubiertas, techos o filtraciones',
      'pintura_fachadas': 'Pintura de fachadas y áreas comunes',
      'obras_accesibilidad': 'Obras de accesibilidad',
      'eventos_decoracion': 'Eventos y decoración de temporada',
      'paneles_solares': 'Instalación de paneles solares o eficiencia energética'
    }
    return types[type] || type
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vigente':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'vencido':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'suspendido':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'finalizado':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'cancelado':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'vigente':
        return 'Vigente'
      case 'vencido':
        return 'Vencido'
      case 'suspendido':
        return 'Suspendido'
      case 'finalizado':
        return 'Finalizado'
      case 'cancelado':
        return 'Cancelado'
      default:
        return status
    }
  }

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date()
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency === 'CLP' ? 'CLP' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contratos</h2>
          <p className="text-muted-foreground">Gestiona los contratos con proveedores del condominio</p>
        </div>
        <Button asChild className="rounded-xl">
          <Link href={`/condos/${condoId}/contratos/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Contrato
          </Link>
        </Button>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Lista de Contratos</CardTitle>
          <CardDescription>Registro de contratos vigentes y vencidos con proveedores</CardDescription>
        </CardHeader>
        <CardContent>
          {contracts && contracts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Tipo de Contrato</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Vigencia</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">{contract.contract_number}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-lg">
                        {getContractTypeLabel(contract.contract_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{contract.provider_name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Desde: {new Date(contract.start_date).toLocaleDateString("es-CL")}
                        </div>
                        {contract.end_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Hasta: {new Date(contract.end_date).toLocaleDateString("es-CL")}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{formatCurrency(contract.amount, contract.currency)}</div>
                          <div className="text-sm text-muted-foreground">{contract.currency}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`rounded-lg ${getStatusColor(contract.status)}`}>
                        {getStatusLabel(contract.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {contract.contract_file_url ? (
                        <div className="flex items-center gap-2 text-primary">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">Adjunto</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sin adjunto</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <ContractActions 
                        contract={contract}
                        condoId={condoId}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay contratos registrados</h3>
              <p className="text-muted-foreground mb-4">Comienza registrando el primer contrato con un proveedor</p>
              <Button asChild className="rounded-xl">
                <Link href={`/condos/${condoId}/contratos/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Contrato
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}









