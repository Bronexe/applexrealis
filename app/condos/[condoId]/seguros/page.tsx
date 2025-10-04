import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Shield, FileText, Building } from "lucide-react"
import Link from "next/link"
import { InsuranceActions } from "./insurance-actions"

export default async function SegurosPage({ params }: { params: Promise<{ condoId: string }> }) {
  const { condoId } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  // Get insurances for this condo
  const { data: insurances, error } = await supabase
    .from("insurances")
    .select("*")
    .eq("condo_id", condoId)
    .order("valid_to", { ascending: false })

  if (error) {
    console.error("Error fetching insurances:", error)
  }

  const isExpired = (validTo: string) => {
    return new Date(validTo) < new Date()
  }

  const getInsuranceTypeLabel = (type: string) => {
    switch (type) {
      case "incendio-espacios-comunes":
        return "Incendio Espacios Comunes"
      case "os10-vigilantes-guardias":
        return "OS10 Vigilantes y Guardias"
      case "sismos":
        return "Sismos"
      case "responsabilidad-civil":
        return "Responsabilidad Civil"
      case "hogar":
        return "Hogar"
      default:
        return type || "No especificado"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Seguros</h2>
          <p className="text-muted-foreground">Gestiona las pólizas de seguro del condominio</p>
        </div>
        <Button asChild className="rounded-xl">
          <Link href={`/condos/${condoId}/seguros/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Seguro
          </Link>
        </Button>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Lista de Seguros</CardTitle>
          <CardDescription>Registro de pólizas de seguro vigentes y vencidas</CardDescription>
        </CardHeader>
        <CardContent>
          {insurances && insurances.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número de Póliza</TableHead>
                  <TableHead>Tipo de Seguro</TableHead>
                  <TableHead>Compañía</TableHead>
                  <TableHead>Vigencia</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Póliza</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {insurances.map((insurance) => (
                  <TableRow key={insurance.id}>
                    <TableCell className="font-medium">{insurance.policy_number || "Sin número"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-lg">
                        {getInsuranceTypeLabel(insurance.insurance_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        {insurance.insurer || "No especificada"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {insurance.valid_from && (
                          <div>Desde: {new Date(insurance.valid_from).toLocaleDateString("es-CL")}</div>
                        )}
                        {insurance.valid_to && (
                          <div>Hasta: {new Date(insurance.valid_to).toLocaleDateString("es-CL")}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {insurance.valid_to ? (
                        <Badge
                          variant={isExpired(insurance.valid_to) ? "destructive" : "default"}
                          className="rounded-lg"
                        >
                          {isExpired(insurance.valid_to) ? "Vencida" : "Vigente"}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="rounded-lg">
                          Sin fecha
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {insurance.policy_file_url ? (
                        <div className="flex items-center gap-2 text-primary">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">Adjunto</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sin adjunto</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <InsuranceActions 
                        insurance={insurance}
                        condoId={condoId}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay seguros registrados</h3>
              <p className="text-muted-foreground mb-4">Comienza registrando la primera póliza de seguro</p>
              <Button asChild className="rounded-xl">
                <Link href={`/condos/${condoId}/seguros/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Seguro
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
