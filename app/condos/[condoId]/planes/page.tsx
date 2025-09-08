import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, FileText, User } from "lucide-react"
import Link from "next/link"
import { PlanActions } from "./plan-actions"

export default async function PlanesPage({ params }: { params: Promise<{ condoId: string }> }) {
  const { condoId } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  // Get emergency plans for this condo
  const { data: plans, error } = await supabase
    .from("emergency_plans")
    .select("*")
    .eq("condo_id", condoId)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("Error fetching emergency plans:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Planes de Emergencia</h2>
          <p className="text-muted-foreground">Gestiona los planes de evacuación y emergencia</p>
        </div>
        <Button asChild className="rounded-xl">
          <Link href={`/condos/${condoId}/planes/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Plan
          </Link>
        </Button>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Lista de Planes de Emergencia</CardTitle>
          <CardDescription>Registro de planes de evacuación</CardDescription>
        </CardHeader>
        <CardContent>
          {plans && plans.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Versión</TableHead>
                  <TableHead>Profesional</TableHead>
                  <TableHead>Última Actualización</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.version || "Sin versión"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {plan.professional_name || "No especificado"}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(plan.updated_at).toLocaleDateString("es-CL")}</TableCell>
                    <TableCell>
                      {plan.plan_file_url ? (
                        <div className="flex items-center gap-2 text-primary">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">Adjunto</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sin adjunto</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <PlanActions 
                        plan={plan}
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
              <h3 className="text-lg font-semibold mb-2">No hay planes de emergencia registrados</h3>
              <p className="text-muted-foreground mb-4">Comienza registrando el primer plan de evacuación</p>
              <Button asChild className="rounded-xl">
                <Link href={`/condos/${condoId}/planes/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Plan
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
