"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { checkUserCanCreateCondos } from "@/lib/actions/super-admin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { chileData, getCommunesByRegion } from "@/lib/data/chile-regions"

export default function NewCondoPage() {
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [regionId, setRegionId] = useState("")
  const [communeId, setCommuneId] = useState("")
  const [destinoUso, setDestinoUso] = useState("")
  const [cantidadCopropietarios, setCantidadCopropietarios] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Obtener comunas disponibles según la región seleccionada
  const availableCommunes = regionId ? getCommunesByRegion(regionId) : []

  const destinoUsoOptions = [
    { value: "habitacional", label: "Habitacional" },
    { value: "oficinas", label: "Oficinas" },
    { value: "local-comercial", label: "Local Comercial" },
    { value: "bodegaje", label: "Bodegaje" },
    { value: "estacionamientos", label: "Estacionamientos" },
    { value: "recintos-industriales", label: "Recintos Industriales" },
    { value: "sitios-urbanizados", label: "Sitios Urbanizados" }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      // Obtener el usuario actual
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        throw new Error("No se pudo obtener la información del usuario")
      }

      // Verificar si el usuario puede crear más condominios
      const limitCheck = await checkUserCanCreateCondos(user.id)
      if (!limitCheck.canCreate) {
        throw new Error(
          `Has alcanzado el límite de condominios (${limitCheck.currentCount}/${limitCheck.limitCount}). ` +
          `Contacta al administrador para aumentar tu límite.`
        )
      }

      // Obtener el nombre de la comuna seleccionada
      const selectedCommune = communeId ? availableCommunes.find(c => c.id === communeId) : null
      const communeName = selectedCommune ? selectedCommune.name : null

      // Crear condominio con user_id del usuario actual
      const { data, error } = await supabase
        .from("condos")
        .insert([{ 
          name, 
          address,
          region_id: regionId || null,
          commune_id: communeId || null,
          comuna: communeName, // Agregar el nombre de la comuna
          destino_uso: destinoUso, 
          cantidad_copropietarios: cantidadCopropietarios ? parseInt(cantidadCopropietarios) : null,
          user_id: user.id 
        }])
        .select()
        .single()

      if (error) throw error

      router.push(`/condos/${data.id}/dashboard`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al crear el condominio")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1">
        <div className="container mx-auto p-6">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" size="icon" asChild className="rounded-xl bg-transparent">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Nuevo Condominio</h1>
              <p className="text-muted-foreground">Registra un nuevo condominio en el sistema</p>
            </div>
          </div>

          <div className="max-w-2xl">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Información del Condominio</CardTitle>
                <CardDescription>Completa los datos básicos del condominio</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nombre del Condominio *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Ej: Condominio Los Robles"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="address">Dirección *</Label>
                    <Input
                      id="address"
                      type="text"
                      placeholder="Ej: Reñaca Norte 25"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="region">Región *</Label>
                    <Select
                      value={regionId}
                      onValueChange={(value) => {
                        setRegionId(value)
                        setCommuneId("") // Limpiar comuna cuando cambie la región
                      }}
                      required
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Selecciona una región" />
                      </SelectTrigger>
                      <SelectContent>
                        {chileData.regions.map((region) => (
                          <SelectItem key={region.id} value={region.id}>
                            {region.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="commune">Comuna *</Label>
                    <Select
                      value={communeId}
                      onValueChange={setCommuneId}
                      required
                      disabled={!regionId}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder={regionId ? "Selecciona una comuna" : "Primero selecciona una región"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCommunes.map((commune) => (
                          <SelectItem key={commune.id} value={commune.id}>
                            {commune.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="destino-uso">Destino/Uso del Inmueble *</Label>
                    <Select
                      value={destinoUso}
                      onValueChange={setDestinoUso}
                      required
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Selecciona el destino/uso del inmueble" />
                      </SelectTrigger>
                      <SelectContent>
                        {destinoUsoOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="cantidad-copropietarios">Cantidad de Copropietarios *</Label>
                    <Input
                      id="cantidad-copropietarios"
                      type="number"
                      min="1"
                      placeholder="Ej: 50"
                      required
                      value={cantidadCopropietarios}
                      onChange={(e) => setCantidadCopropietarios(e.target.value)}
                      className="rounded-xl"
                    />
                    <p className="text-sm text-muted-foreground">
                      Este dato es importante para calcular los quórum en las asambleas
                    </p>
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <div className="flex gap-4">
                    <Button type="submit" disabled={isLoading} className="rounded-xl">
                      {isLoading ? "Creando..." : "Crear Condominio"}
                    </Button>
                    <Button type="button" variant="outline" asChild className="rounded-xl bg-transparent">
                      <Link href="/dashboard">Cancelar</Link>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <footer className="border-t bg-card p-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© 2025 Lex Realis. Todos los Derechos Reservados.</p>
        </div>
      </footer>
    </div>
  )
}
