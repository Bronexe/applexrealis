"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { recalculateCompliance } from "@/lib/actions/compliance"
import { useToast } from "@/hooks/use-toast"

interface RecalculateComplianceButtonProps {
  condoId: string
}

export function RecalculateComplianceButton({ condoId }: RecalculateComplianceButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleRecalculate = async () => {
    setIsLoading(true)
    try {
      await recalculateCompliance(condoId)
      toast({
        title: "Cumplimiento actualizado",
        description: "Las reglas de cumplimiento han sido evaluadas correctamente",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo recalcular el cumplimiento",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleRecalculate} disabled={isLoading} className="rounded-xl">
      <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
      {isLoading ? "Recalculando..." : "Recalcular Cumplimiento"}
    </Button>
  )
}
