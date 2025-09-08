import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Shield, FileText } from "lucide-react"
import Link from "next/link"
import { CertificationActions } from "./certification-actions"

export default async function CertificacionesPage({ params }: { params: Promise<{ condoId: string }> }) {
  const { condoId } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  // Get certifications for this condo
  const { data: certifications, error } = await supabase
    .from("certifications")
    .select("*")
    .eq("condo_id", condoId)
    .order("valid_to", { ascending: false })

  if (error) {
    console.error("Error fetching certifications:", error)
  }

  const getKindLabel = (kind: string) => {
    switch (kind) {
      case "gas":
        return "Gas"
      case "ascensor":
        return "Ascensor"
      case "otros":
        return "Otros"
      default:
        return kind
    }
  }

  const isExpired = (validTo: string) => {
    return new Date(validTo) < new Date()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Certificaciones</h2>
          <p className="text-muted-foreground">Gestiona las certificaciones de gas, ascensor y otros</p>
        </div>
        <Button asChild className="rounded-xl">
          <Link href={`/condos/${condoId}/certificaciones/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Certificación
          </Link>
        </Button>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Lista de Certificaciones</CardTitle>
          <CardDescription>Registro de certificaciones vigentes y vencidas</CardDescription>
        </CardHeader>
        <CardContent>
          {certifications && certifications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Vigencia</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Certificado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certifications.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell>
                      <Badge variant="outline" className="rounded-lg">
                        {getKindLabel(cert.kind)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {cert.valid_from && <div>Desde: {new Date(cert.valid_from).toLocaleDateString("es-CL")}</div>}
                        {cert.valid_to && <div>Hasta: {new Date(cert.valid_to).toLocaleDateString("es-CL")}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {cert.valid_to ? (
                        <Badge variant={isExpired(cert.valid_to) ? "destructive" : "default"} className="rounded-lg">
                          {isExpired(cert.valid_to) ? "Vencida" : "Vigente"}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="rounded-lg">
                          Sin fecha
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {cert.cert_file_url ? (
                        <div className="flex items-center gap-2 text-primary">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">Adjunto</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sin adjunto</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <CertificationActions 
                        certification={cert}
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
              <h3 className="text-lg font-semibold mb-2">No hay certificaciones registradas</h3>
              <p className="text-muted-foreground mb-4">Comienza registrando la primera certificación</p>
              <Button asChild className="rounded-xl">
                <Link href={`/condos/${condoId}/certificaciones/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Certificación
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
