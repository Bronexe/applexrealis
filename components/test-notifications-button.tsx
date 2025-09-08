"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Send } from "lucide-react"

interface TestNotificationsButtonProps {
  condoId?: string
}

export function TestNotificationsButton({ condoId }: TestNotificationsButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const testExpiringDocuments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/cron/check-expiring-documents', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'test-secret'}`
        }
      })

      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Prueba completada",
          description: `Se enviaron ${result.data?.totalSent || 0} notificaciones de vencimiento`,
        })
      } else {
        toast({
          title: "Error en la prueba",
          description: result.error || "Error desconocido",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo ejecutar la prueba",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testAssemblyReminders = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/cron/check-assembly-reminders', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'test-secret'}`
        }
      })

      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Prueba completada",
          description: `Se enviaron ${result.data?.totalSent || 0} recordatorios de asambleas`,
        })
      } else {
        toast({
          title: "Error en la prueba",
          description: result.error || "Error desconocido",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo ejecutar la prueba",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Pruebas de Notificaciones</h4>
      <div className="flex gap-2">
        <Button
          onClick={testExpiringDocuments}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="rounded-xl"
        >
          <Send className="h-4 w-4 mr-2" />
          Probar Vencimientos
        </Button>
        <Button
          onClick={testAssemblyReminders}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="rounded-xl"
        >
          <Send className="h-4 w-4 mr-2" />
          Probar Asambleas
        </Button>
      </div>
    </div>
  )
}
