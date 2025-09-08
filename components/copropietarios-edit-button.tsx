"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Edit, Save, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface CopropietariosEditButtonProps {
  condoId: string
  currentCount: number | null
  condoName: string
}

export function CopropietariosEditButton({ condoId, currentCount, condoName }: CopropietariosEditButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [cantidad, setCantidad] = useState(currentCount?.toString() || "")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSave = async () => {
    if (!cantidad || parseInt(cantidad) < 1) {
      toast({
        title: "Error",
        description: "La cantidad debe ser mayor a 0",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("condos")
        .update({ cantidad_copropietarios: parseInt(cantidad) })
        .eq("id", condoId)

      if (error) throw error

      toast({
        title: "Cantidad actualizada",
        description: `Se actualizó la cantidad de copropietarios a ${cantidad}`,
      })

      setIsOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la cantidad de copropietarios",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setCantidad(currentCount?.toString() || "")
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-xl">
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>👥</span>
            Editar Copropietarios
          </DialogTitle>
          <DialogDescription>
            Actualiza la cantidad de copropietarios para {condoName}. Este dato es importante para calcular los quórum en las asambleas.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="cantidad">Cantidad de Copropietarios</Label>
            <Input
              id="cantidad"
              type="number"
              min="1"
              placeholder="Ej: 50"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="rounded-xl"
            />
            <p className="text-sm text-muted-foreground">
              El quórum mínimo será: {cantidad ? Math.ceil(parseInt(cantidad) * 0.5) : 0} copropietarios (50% + 1)
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading} className="rounded-xl">
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="rounded-xl">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
