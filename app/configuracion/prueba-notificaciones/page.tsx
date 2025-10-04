"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Bell, 
  Calendar, 
  FileText,
  AlertCircle
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function PruebaNotificacionesPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [testTitle, setTestTitle] = useState("Prueba de Notificación")
  const [testMessage, setTestMessage] = useState("Este es un mensaje de prueba del sistema de notificaciones.")
  const [lastResults, setLastResults] = useState<any>(null)
  const { toast } = useToast()

  const testExpiringDocuments = async () => {
    setIsLoading(true)
    setLastResults(null)
    
    try {
      console.log("🔍 Probando notificaciones de vencimientos...")
      
      const response = await fetch('/api/cron/check-expiring-documents', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'test-secret'}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      console.log("📊 Resultado:", result)
      
      setLastResults({
        type: 'expiring',
        success: result.success,
        data: result.data,
        error: result.error
      })
      
      if (result.success) {
        toast({
          title: "✅ Prueba completada",
          description: `Se enviaron ${result.data?.totalSent || 0} notificaciones de vencimiento. ${result.data?.totalErrors || 0} errores.`,
        })
      } else {
        toast({
          title: "❌ Error en la prueba",
          description: result.error || "Error desconocido",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("❌ Error:", error)
      setLastResults({
        type: 'expiring',
        success: false,
        error: error instanceof Error ? error.message : "Error de conexión"
      })
      toast({
        title: "❌ Error",
        description: "No se pudo ejecutar la prueba. Verifica la consola para más detalles.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testAssemblyReminders = async () => {
    setIsLoading(true)
    setLastResults(null)
    
    try {
      console.log("🔍 Probando recordatorios de asambleas...")
      
      const response = await fetch('/api/cron/check-assembly-reminders', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'test-secret'}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      console.log("📊 Resultado:", result)
      
      setLastResults({
        type: 'assembly',
        success: result.success,
        data: result.data,
        error: result.error
      })
      
      if (result.success) {
        toast({
          title: "✅ Prueba completada",
          description: `Se enviaron ${result.data?.totalSent || 0} recordatorios de asambleas. ${result.data?.totalErrors || 0} errores.`,
        })
      } else {
        toast({
          title: "❌ Error en la prueba",
          description: result.error || "Error desconocido",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("❌ Error:", error)
      setLastResults({
        type: 'assembly',
        success: false,
        error: error instanceof Error ? error.message : "Error de conexión"
      })
      toast({
        title: "❌ Error",
        description: "No se pudo ejecutar la prueba. Verifica la consola para más detalles.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testCustomEmail = async () => {
    if (!testEmail) {
      toast({
        title: "⚠️ Email requerido",
        description: "Por favor ingresa un email para la prueba",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setLastResults(null)
    
    try {
      console.log("📧 Enviando email de prueba a:", testEmail)
      
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: testEmail,
          title: testTitle,
          message: testMessage
        })
      })

      const result = await response.json()
      console.log("📊 Resultado:", result)
      
      setLastResults({
        type: 'custom',
        success: result.success,
        data: result.data,
        error: result.error
      })
      
      if (result.success) {
        toast({
          title: "✅ Email enviado",
          description: `Email de prueba enviado exitosamente a ${testEmail}`,
        })
      } else {
        toast({
          title: "❌ Error",
          description: result.error || "No se pudo enviar el email",
          variant: "destructive",
        })
      }
      
    } catch (error) {
      console.error("❌ Error:", error)
      setLastResults({
        type: 'custom',
        success: false,
        error: error instanceof Error ? error.message : "Error de conexión"
      })
      toast({
        title: "❌ Error",
        description: "No se pudo enviar el email de prueba. Verifica la configuración de Resend.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bell className="h-8 w-8 text-primary" />
          Prueba de Notificaciones
        </h1>
        <p className="text-muted-foreground">
          Prueba el sistema de notificaciones por email del sistema
        </p>
      </div>

      {/* Información del Sistema */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Información Importante</AlertTitle>
        <AlertDescription>
          Para que las notificaciones funcionen correctamente, asegúrate de tener configurado:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Variable de entorno <code className="bg-muted px-1 rounded">RESEND_API_KEY</code> con una API key válida de Resend</li>
            <li>Variable de entorno <code className="bg-muted px-1 rounded">EMAIL_FROM</code> con tu email verificado</li>
            <li>Usuarios con <code className="bg-muted px-1 rounded">notification_settings</code> habilitadas</li>
            <li>Documentos o asambleas próximos a vencer para generar notificaciones</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Pruebas Automáticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Pruebas de Notificaciones Automáticas
          </CardTitle>
          <CardDescription>
            Ejecuta las verificaciones automáticas del sistema para enviar notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Prueba de Vencimientos */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-500" />
                  Documentos por Vencer
                </CardTitle>
                <CardDescription>
                  Verifica certificaciones y seguros próximos a vencer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={testExpiringDocuments}
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Probar Vencimientos
                </Button>
              </CardContent>
            </Card>

            {/* Prueba de Asambleas */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Recordatorios de Asambleas
                </CardTitle>
                <CardDescription>
                  Verifica asambleas próximas y envía recordatorios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={testAssemblyReminders}
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Probar Asambleas
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Email de Prueba Personalizado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Email de Prueba Personalizado
          </CardTitle>
          <CardDescription>
            Envía un email de prueba a cualquier dirección con contenido personalizado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="test-email">Email de Destino</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="ejemplo@correo.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="test-title">Título</Label>
              <Input
                id="test-title"
                placeholder="Título de la notificación"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="test-message">Mensaje</Label>
              <Textarea
                id="test-message"
                placeholder="Mensaje de la notificación"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                rows={4}
              />
            </div>

            <Button
              onClick={testCustomEmail}
              disabled={isLoading || !testEmail}
              variant="outline"
              size="lg"
              className="w-full"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Enviar Email de Prueba
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {lastResults && (
        <Card className={lastResults.success ? "border-green-500" : "border-red-500"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {lastResults.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Resultados de la Prueba
            </CardTitle>
            <CardDescription>
              {lastResults.type === 'expiring' 
                ? 'Documentos por Vencer' 
                : lastResults.type === 'assembly' 
                  ? 'Recordatorios de Asambleas'
                  : 'Email Personalizado'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <p className="text-lg font-semibold">
                    {lastResults.success ? (
                      <span className="text-green-600">✅ Exitoso</span>
                    ) : (
                      <span className="text-red-600">❌ Error</span>
                    )}
                  </p>
                </div>
                
                {lastResults.data && lastResults.type !== 'custom' && (
                  <>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Notificaciones Enviadas</p>
                      <p className="text-lg font-semibold text-green-600">
                        {lastResults.data.totalSent || 0}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Errores</p>
                      <p className="text-lg font-semibold text-red-600">
                        {lastResults.data.totalErrors || 0}
                      </p>
                    </div>
                  </>
                )}
                
                {lastResults.data && lastResults.type === 'custom' && (
                  <>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Destinatario</p>
                      <p className="text-lg font-semibold">
                        {lastResults.data.to}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Fecha/Hora</p>
                      <p className="text-lg font-semibold">
                        {new Date(lastResults.data.timestamp).toLocaleString('es-CL')}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {lastResults.error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription className="font-mono text-xs">
                    {lastResults.error}
                  </AlertDescription>
                </Alert>
              )}

              {lastResults.data?.results && lastResults.data.results.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Detalles:</p>
                  <div className="bg-muted p-4 rounded-lg max-h-60 overflow-y-auto">
                    <pre className="text-xs">
                      {JSON.stringify(lastResults.data.results, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instrucciones */}
      <Card>
        <CardHeader>
          <CardTitle>📚 Cómo Usar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold mb-2">1. Verifica la Configuración</h4>
              <p className="text-sm text-muted-foreground">
                Asegúrate de tener las variables de entorno configuradas en tu archivo <code className="bg-muted px-1 rounded">.env.local</code>
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">2. Configura las Notificaciones de Usuario</h4>
              <p className="text-sm text-muted-foreground">
                Los usuarios deben tener la tabla <code className="bg-muted px-1 rounded">notification_settings</code> configurada con notificaciones habilitadas
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">3. Crea Datos de Prueba</h4>
              <p className="text-sm text-muted-foreground">
                Para probar vencimientos, crea certificaciones o seguros con fechas próximas. Para probar asambleas, crea asambleas con fechas futuras.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">4. Ejecuta las Pruebas</h4>
              <p className="text-sm text-muted-foreground">
                Haz clic en los botones de prueba y revisa la consola del navegador para más detalles
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

