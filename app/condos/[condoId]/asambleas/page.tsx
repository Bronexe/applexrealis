import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Calendar, FileText, Download, Trash2, Edit } from "lucide-react"
import Link from "next/link"
import { AssemblyActions } from "./assembly-actions"

export default async function AsambleasPage({ params }: { params: Promise<{ condoId: string }> }) {
  const { condoId } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  // Get assemblies for this condo
  const { data: assemblies, error } = await supabase
    .from("assemblies")
    .select("*")
    .eq("condo_id", condoId)
    .order("date", { ascending: false })

  if (error) {
    console.error("Error fetching assemblies:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Asambleas</h2>
          <p className="text-muted-foreground">Gestiona las asambleas ordinarias y extraordinarias</p>
        </div>
        <Button asChild className="rounded-xl">
          <Link href={`/condos/${condoId}/asambleas/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Asamblea
          </Link>
        </Button>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Lista de Asambleas</CardTitle>
          <CardDescription>Registro de asambleas realizadas</CardDescription>
        </CardHeader>
        <CardContent>
          {assemblies && assemblies.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acta</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assemblies.map((assembly) => (
                  <TableRow key={assembly.id}>
                    <TableCell>
                      <Badge variant={assembly.type === "ordinaria" ? "default" : "secondary"} className="rounded-lg">
                        {assembly.type === "ordinaria" ? "Ordinaria" : "Extraordinaria"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(assembly.date).toLocaleDateString("es-CL")}
                      </div>
                    </TableCell>
                    <TableCell>
                      {assembly.act_file_url ? (
                        <div className="flex items-center gap-2 text-primary">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">Adjunto</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sin adjunto</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <AssemblyActions 
                        assembly={assembly}
                        condoId={condoId}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay asambleas registradas</h3>
              <p className="text-muted-foreground mb-4">Comienza registrando la primera asamblea</p>
              <Button asChild className="rounded-xl">
                <Link href={`/condos/${condoId}/asambleas/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Asamblea
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
