"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, X, Loader2, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { createGestion, getUserCondos } from "@/lib/actions/gestiones"
import { useToast } from "@/hooks/use-toast"

const TIPO_OPTIONS = [
  { value: "administrativo", label: "Administrativo" },
  { value: "cobranza", label: "Cobranza" },
  { value: "mantencion", label: "Mantención" },
  { value: "asamblea", label: "Asamblea" },
  { value: "legal", label: "Legal" },
  { value: "financiero", label: "Financiero" },
  { value: "mantenimiento", label: "Mantenimiento" },
  { value: "seguridad", label: "Seguridad" },
  { value: "otro", label: "Otro" },
]

const ESTADO_OPTIONS = [
  { value: "borrador", label: "Borrador", color: "secondary" },
  { value: "en_gestion", label: "En Gestión", color: "default" },
  { value: "pendiente", label: "Pendiente", color: "destructive" },
  { value: "resuelto", label: "Resuelto", color: "success" },
]

const PRIORIDAD_OPTIONS = [
  { value: "baja", label: "Baja", color: "secondary" },
  { value: "media", label: "Media", color: "default" },
  { value: "alta", label: "Alta", color: "destructive" },
  { value: "critica", label: "Crítica", color: "destructive" },
]

interface Condo {
  id: string
  name: string
  comuna: string | null
  region_id: string | null
  commune_id: string | null
}

export function GestionForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [condos, setCondos] = useState<Condo[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [date, setDate] = useState<Date>()

  // Estados del formulario
  const [formData, setFormData] = useState({
    tipo: "",
    titulo: "",
    descripcion: "",
    estado: "borrador",
    prioridad: "media",
    condominio_id: "",
    fecha_limite: "",
  })

  // Cargar condominios al montar el componente
  useEffect(() => {
    const loadCondos = async () => {
      try {
        const { condos: userCondos, error } = await getUserCondos()
        if (error) {
          toast({
            title: "Error",
            description: "No se pudieron cargar los condominios",
            variant: "destructive",
          })
        } else {
          setCondos(userCondos)
        }
      } catch (error) {
        console.error("Error loading condos:", error)
      }
    }
    loadCondos()
  }, [toast])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const gestionData = {
        ...formData,
        fecha_limite: date ? date.toISOString() : null,
        tags: tags.length > 0 ? tags : undefined,
      }

      const { success, error } = await createGestion(gestionData)

      if (success) {
        toast({
          title: "Éxito",
          description: "Gestión creada correctamente",
        })
        router.push("/gestiones")
      } else {
        toast({
          title: "Error",
          description: error || "No se pudo crear la gestión",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle>Información de la Gestión</CardTitle>
            <CardDescription>
              Completa los datos para crear una nueva gestión o trámite
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo y Título */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Gestión *</Label>
              <Select value={formData.tipo} onValueChange={(value) => handleInputChange("tipo", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPO_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => handleInputChange("titulo", e.target.value)}
                placeholder="Título descriptivo de la gestión"
                required
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleInputChange("descripcion", e.target.value)}
              placeholder="Describe los detalles de la gestión..."
              rows={3}
            />
          </div>

          {/* Estado y Prioridad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ESTADO_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <Badge variant={option.color as any} className="mr-2">
                        {option.label}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prioridad">Prioridad</Label>
              <Select value={formData.prioridad} onValueChange={(value) => handleInputChange("prioridad", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORIDAD_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <Badge variant={option.color as any} className="mr-2">
                        {option.label}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Condominio */}
          <div className="space-y-2">
            <Label htmlFor="condominio">Condominio *</Label>
            <Select value={formData.condominio_id} onValueChange={(value) => handleInputChange("condominio_id", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el condominio" />
              </SelectTrigger>
              <SelectContent>
                {condos.map((condo) => (
                  <SelectItem key={condo.id} value={condo.id}>
                    {condo.name} {condo.comuna && `- ${condo.comuna}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fecha Límite */}
          <div className="space-y-2">
            <Label>Fecha Límite</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: es }) : "Selecciona una fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Agregar tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.titulo || !formData.tipo || !formData.condominio_id}
              className="flex-1"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Gestión
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
