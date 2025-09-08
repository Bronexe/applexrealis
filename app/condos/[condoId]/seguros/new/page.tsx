"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { EvidenceUploader } from "@/components/evidence-uploader"

export default function NewInsurancePage({ params }: { params: Promise<{ condoId: string }> }) {
  const { condoId } = React.use(params)
  const [policyNumber, setPolicyNumber] = useState("")
  const [insurer, setInsurer] = useState("")
  const [insuranceType, setInsuranceType] = useState("")
  const [validFrom, setValidFrom] = useState("")
  const [validTo, setValidTo] = useState("")
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const insuranceTypes = [
    { value: "incendio-espacios-comunes", label: "Seguro de Incendio Espacios Comunes" },
    { value: "os10-vigilantes-guardias", label: "Seguro OS10 Vigilantes y Guardias" },
    { value: "sismos", label: "Seguro Sismos" },
    { value: "responsabilidad-civil", label: "Responsabilidad Civil Administrador y Comités" },
    { value: "hogar", label: "Seguro Hogar" }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error } = await supabase.from("insurances").insert([
        {
          condo_id: condoId,
          policy_number: policyNumber,
          insurer,
          insurance_type: insuranceType,
          valid_from: validFrom || null,
          valid_to: validTo || null,
          policy_file_url: fileUrl,
        },
      ])

      if (error) throw error

      router.push(`/condos/${condoId}/seguros`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al crear el seguro")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="rounded-xl bg-transparent">
          <Link href={`/condos/${condoId}/seguros`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Nuevo Seguro</h2>
          <p className="text-muted-foreground">Registra una nueva póliza de seguro</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Información del Seguro</CardTitle>
            <CardDescription>Completa los datos de la póliza</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="policy_number">Número de Póliza</Label>
                <Input
                  id="policy_number"
                  type="text"
                  placeholder="Ej: POL-123456"
                  value={policyNumber}
                  onChange={(e) => setPolicyNumber(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="insurer">Compañía Aseguradora</Label>
                <Input
                  id="insurer"
                  type="text"
                  placeholder="Nombre de la compañía"
                  value={insurer}
                  onChange={(e) => setInsurer(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="insurance_type">Tipo de Seguro *</Label>
                <Select
                  value={insuranceType}
                  onValueChange={setInsuranceType}
                  required
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Selecciona el tipo de seguro" />
                  </SelectTrigger>
                  <SelectContent>
                    {insuranceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="valid_from">Vigente Desde</Label>
                  <Input
                    id="valid_from"
                    type="date"
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                    className="rounded-xl"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="valid_to">Vigente Hasta</Label>
                  <Input
                    id="valid_to"
                    type="date"
                    value={validTo}
                    onChange={(e) => setValidTo(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Póliza de Seguro</Label>
                <EvidenceUploader
                  condoId={condoId}
                  module="insurances"
                  onUploadComplete={(url) => setFileUrl(url)}
                  currentFileUrl={fileUrl}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading} className="rounded-xl">
                  {isLoading ? "Guardando..." : "Guardar Seguro"}
                </Button>
                <Button type="button" variant="outline" asChild className="rounded-xl bg-transparent">
                  <Link href={`/condos/${condoId}/seguros`}>Cancelar</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
