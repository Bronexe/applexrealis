"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Bell, Calendar, AlertTriangle, ClipboardList, Building } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface NotificationSettings {
  id?: string
  user_id: string
  // Notificaciones de vencimiento
  expiration_notifications_enabled: boolean
  expiration_days_before: number
  expiration_email_enabled: boolean
  // Recordatorios de asambleas
  assembly_reminders_enabled: boolean
  assembly_reminder_days_before: number
  assembly_reminder_email_enabled: boolean
  // Notificaciones de gestiones
  gestiones_notifications_enabled: boolean
  gestiones_email_enabled: boolean
  gestiones_reminder_days_before: number
  // Notificaciones de condos
  condos_notifications_enabled: boolean
  condos_email_enabled: boolean
  // Notificaciones generales
  general_notifications_enabled: boolean
  general_email_enabled: boolean
  // Configuración de tiempo
  notification_time: string
  timezone: string
}

export default function ConfiguracionClient() {
  const [settings, setSettings] = useState<NotificationSettings>({
    user_id: "",
    expiration_notifications_enabled: true,
    expiration_days_before: 30,
    expiration_email_enabled: true,
    assembly_reminders_enabled: true,
    assembly_reminder_days_before: 7,
    assembly_reminder_email_enabled: true,
    gestiones_notifications_enabled: true,
    gestiones_email_enabled: true,
    gestiones_reminder_days_before: 3,
    condos_notifications_enabled: true,
    condos_email_enabled: true,
    general_notifications_enabled: true,
    general_email_enabled: true,
    notification_time: "09:00",
    timezone: "America/Santiago"
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchSettings = async () => {
      const supabase = createClient()
      
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push("/auth/login")
          return
        }

        const { data: settingsData, error } = await supabase
          .from("notification_settings")
          .select("*")
          .eq("user_id", user.id)
          .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error("Error fetching notification settings:", error)
          setError("Error al cargar la configuración")
        } else if (settingsData) {
          setSettings({
            id: settingsData.id,
            user_id: settingsData.user_id,
            expiration_notifications_enabled: settingsData.expiration_notifications_enabled,
            expiration_days_before: settingsData.expiration_days_before,
            expiration_email_enabled: settingsData.expiration_email_enabled,
            assembly_reminders_enabled: settingsData.assembly_reminders_enabled,
            assembly_reminder_days_before: settingsData.assembly_reminder_days_before,
            assembly_reminder_email_enabled: settingsData.assembly_reminder_email_enabled,
            gestiones_notifications_enabled: settingsData.gestiones_notifications_enabled || true,
            gestiones_email_enabled: settingsData.gestiones_email_enabled || true,
            gestiones_reminder_days_before: settingsData.gestiones_reminder_days_before || 3,
            condos_notifications_enabled: settingsData.condos_notifications_enabled || true,
            condos_email_enabled: settingsData.condos_email_enabled || true,
            general_notifications_enabled: settingsData.general_notifications_enabled,
            general_email_enabled: settingsData.general_email_enabled,
            notification_time: settingsData.notification_time,
            timezone: settingsData.timezone
          })
          setIsEditing(true)
        } else {
          // Usar valores por defecto
          setSettings(prev => ({ ...prev, user_id: user.id }))
        }
      } catch (error: unknown) {
        console.error("Error fetching notification settings:", error)
        setError("Error al cargar la configuración")
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchSettings()
  }, [router])

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const dataToSubmit = {
        user_id: user.id,
        expiration_notifications_enabled: settings.expiration_notifications_enabled,
        expiration_days_before: settings.expiration_days_before,
        expiration_email_enabled: settings.expiration_email_enabled,
        assembly_reminders_enabled: settings.assembly_reminders_enabled,
        assembly_reminder_days_before: settings.assembly_reminder_days_before,
        assembly_reminder_email_enabled: settings.assembly_reminder_email_enabled,
        gestiones_notifications_enabled: settings.gestiones_notifications_enabled,
        gestiones_email_enabled: settings.gestiones_email_enabled,
        gestiones_reminder_days_before: settings.gestiones_reminder_days_before,
        condos_notifications_enabled: settings.condos_notifications_enabled,
        condos_email_enabled: settings.condos_email_enabled,
        general_notifications_enabled: settings.general_notifications_enabled,
        general_email_enabled: settings.general_email_enabled,
        notification_time: settings.notification_time,
        timezone: settings.timezone
      }

      if (isEditing && settings.id) {
        // Actualizar configuración existente
        const { error } = await supabase
          .from("notification_settings")
          .update(dataToSubmit)
          .eq("id", settings.id)

        if (error) throw error

        toast({
          title: "Configuración actualizada",
          description: "Las configuraciones de notificación se han actualizado correctamente",
        })
      } else {
        // Crear nueva configuración
        const { error } = await supabase
          .from("notification_settings")
          .insert([dataToSubmit])

        if (error) throw error

        toast({
          title: "Configuración guardada",
          description: "Las configuraciones de notificación se han guardado correctamente",
        })
        setIsEditing(true)
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al guardar la configuración")
      toast({
        title: "Error",
        description: "No se pudieron guardar las configuraciones",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Cargando...</h2>
          <p className="text-muted-foreground">Cargando configuración de notificaciones</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configuración</h2>
        <p className="text-muted-foreground">Gestiona las notificaciones y configuraciones del sistema</p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Notificaciones de Vencimiento */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificaciones de Vencimiento
            </CardTitle>
            <CardDescription>
              Configura las notificaciones para documentos que están por vencer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Habilitar notificaciones de vencimiento</Label>
                <p className="text-sm text-muted-foreground">
                  Recibe alertas cuando los documentos estén próximos a vencer
                </p>
              </div>
              <Switch
                checked={settings.expiration_notifications_enabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, expiration_notifications_enabled: checked }))}
              />
            </div>

            {settings.expiration_notifications_enabled && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="expiration_days">Días antes del vencimiento</Label>
                  <Input
                    id="expiration_days"
                    type="number"
                    min="1"
                    max="365"
                    value={settings.expiration_days_before}
                    onChange={(e) => setSettings(prev => ({ ...prev, expiration_days_before: parseInt(e.target.value) || 30 }))}
                    className="rounded-xl"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones por email</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibe notificaciones en tu correo electrónico
                    </p>
                  </div>
                  <Switch
                    checked={settings.expiration_email_enabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, expiration_email_enabled: checked }))}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recordatorios de Asambleas */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recordatorios de Asambleas
            </CardTitle>
            <CardDescription>
              Configura los recordatorios para asambleas anuales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Habilitar recordatorios de asambleas</Label>
                <p className="text-sm text-muted-foreground">
                  Recibe recordatorios para asambleas anuales
                </p>
              </div>
              <Switch
                checked={settings.assembly_reminders_enabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, assembly_reminders_enabled: checked }))}
              />
            </div>

            {settings.assembly_reminders_enabled && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="assembly_days">Días antes de la asamblea</Label>
                  <Input
                    id="assembly_days"
                    type="number"
                    min="1"
                    max="30"
                    value={settings.assembly_reminder_days_before}
                    onChange={(e) => setSettings(prev => ({ ...prev, assembly_reminder_days_before: parseInt(e.target.value) || 7 }))}
                    className="rounded-xl"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Recordatorios por email</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibe recordatorios en tu correo electrónico
                    </p>
                  </div>
                  <Switch
                    checked={settings.assembly_reminder_email_enabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, assembly_reminder_email_enabled: checked }))}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Notificaciones de Gestiones */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Notificaciones de Gestiones
            </CardTitle>
            <CardDescription>
              Configura las notificaciones para gestiones y trámites
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Habilitar notificaciones de gestiones</Label>
                <p className="text-sm text-muted-foreground">
                  Recibe notificaciones sobre el estado de tus gestiones
                </p>
              </div>
              <Switch
                checked={settings.gestiones_notifications_enabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, gestiones_notifications_enabled: checked }))}
              />
            </div>

            {settings.gestiones_notifications_enabled && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="gestiones_days">Días antes del recordatorio</Label>
                  <Input
                    id="gestiones_days"
                    type="number"
                    min="1"
                    max="30"
                    value={settings.gestiones_reminder_days_before}
                    onChange={(e) => setSettings(prev => ({ ...prev, gestiones_reminder_days_before: parseInt(e.target.value) || 3 }))}
                    className="rounded-xl"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones por email</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibe notificaciones en tu correo electrónico
                    </p>
                  </div>
                  <Switch
                    checked={settings.gestiones_email_enabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, gestiones_email_enabled: checked }))}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Notificaciones de Condos */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Notificaciones de Condominios
            </CardTitle>
            <CardDescription>
              Configura las notificaciones para actividades de condominios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Habilitar notificaciones de condominios</Label>
                <p className="text-sm text-muted-foreground">
                  Recibe notificaciones sobre actividades de tus condominios
                </p>
              </div>
              <Switch
                checked={settings.condos_notifications_enabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, condos_notifications_enabled: checked }))}
              />
            </div>

            {settings.condos_notifications_enabled && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificaciones por email</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibe notificaciones en tu correo electrónico
                  </p>
                </div>
                <Switch
                  checked={settings.condos_email_enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, condos_email_enabled: checked }))}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notificaciones Generales */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Notificaciones Generales
            </CardTitle>
            <CardDescription>
              Configura las notificaciones generales del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Habilitar notificaciones generales</Label>
                <p className="text-sm text-muted-foreground">
                  Recibe notificaciones generales del sistema
                </p>
              </div>
              <Switch
                checked={settings.general_notifications_enabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, general_notifications_enabled: checked }))}
              />
            </div>

            {settings.general_notifications_enabled && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificaciones por email</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibe notificaciones en tu correo electrónico
                  </p>
                </div>
                <Switch
                  checked={settings.general_email_enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, general_email_enabled: checked }))}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuración de Tiempo */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración de Tiempo
            </CardTitle>
            <CardDescription>
              Configura la hora y zona horaria para las notificaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="notification_time">Hora de notificación</Label>
              <Input
                id="notification_time"
                type="time"
                value={settings.notification_time}
                onChange={(e) => setSettings(prev => ({ ...prev, notification_time: e.target.value }))}
                className="rounded-xl"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="timezone">Zona horaria</Label>
              <Select
                value={settings.timezone}
                onValueChange={(value) => setSettings(prev => ({ ...prev, timezone: value }))}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Selecciona una zona horaria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Santiago">Chile (Santiago)</SelectItem>
                  <SelectItem value="America/Argentina/Buenos_Aires">Argentina (Buenos Aires)</SelectItem>
                  <SelectItem value="America/Lima">Perú (Lima)</SelectItem>
                  <SelectItem value="America/Bogota">Colombia (Bogotá)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-4">
          <Button onClick={handleSubmit} disabled={isLoading} className="rounded-xl">
            {isLoading ? "Guardando..." : "Guardar Configuración"}
          </Button>
        </div>
      </div>
    </div>
  )
}


















