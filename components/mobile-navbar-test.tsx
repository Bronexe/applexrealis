"use client"

import React from "react"
import { MobileLayout } from "./mobile-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  IconDashboard, 
  IconBuilding, 
  IconUser, 
  IconSettings, 
  IconReportAnalytics,
  IconShield,
  IconCheck,
  IconX
} from "@tabler/icons-react"

export function MobileNavbarTest() {
  const testPages = [
    { name: "Dashboard", path: "/dashboard", icon: <IconDashboard className="h-4 w-4" /> },
    { name: "Condominios", path: "/condos", icon: <IconBuilding className="h-4 w-4" /> },
    { name: "Administrador", path: "/administrador", icon: <IconUser className="h-4 w-4" /> },
    { name: "Configuración", path: "/configuracion", icon: <IconSettings className="h-4 w-4" /> },
    { name: "Reportes", path: "/reportes", icon: <IconReportAnalytics className="h-4 w-4" /> },
    { name: "Super Admin", path: "/super-admin", icon: <IconShield className="h-4 w-4" /> },
  ]

  return (
    <MobileLayout currentPath="/dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Prueba de Navbar Móvil</h1>
          <p className="text-muted-foreground">
            Verifica que el navbar móvil funciona correctamente
          </p>
        </div>

        {/* Test Cards */}
        <div className="grid gap-4">
          {testPages.map((page) => (
            <Card key={page.path} className="rounded-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  {page.icon}
                  <div>
                    <CardTitle className="text-lg">{page.name}</CardTitle>
                    <CardDescription>{page.path}</CardDescription>
                  </div>
                  <Badge variant="outline" className="ml-auto">
                    {page.name === "Super Admin" ? "Admin" : "Usuario"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <IconCheck className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">
                    Navegación disponible
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Test */}
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconCheck className="h-5 w-5 text-green-500" />
              Características del Navbar Móvil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <IconCheck className="h-4 w-4 text-green-500" />
              <span className="text-sm">Header con logo y menú hamburguesa</span>
            </div>
            <div className="flex items-center gap-2">
              <IconCheck className="h-4 w-4 text-green-500" />
              <span className="text-sm">Sheet lateral con navegación completa</span>
            </div>
            <div className="flex items-center gap-2">
              <IconCheck className="h-4 w-4 text-green-500" />
              <span className="text-sm">Navbar inferior con iconos</span>
            </div>
            <div className="flex items-center gap-2">
              <IconCheck className="h-4 w-4 text-green-500" />
              <span className="text-sm">Información de usuario</span>
            </div>
            <div className="flex items-center gap-2">
              <IconCheck className="h-4 w-4 text-green-500" />
              <span className="text-sm">Botón de cerrar sesión</span>
            </div>
            <div className="flex items-center gap-2">
              <IconCheck className="h-4 w-4 text-green-500" />
              <span className="text-sm">Detección automática de super admin</span>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Instrucciones de Prueba</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-2">
              <p>1. <strong>Header:</strong> Verifica que el logo y el botón de menú están visibles</p>
              <p>2. <strong>Menú lateral:</strong> Toca el botón de menú para abrir el sheet</p>
              <p>3. <strong>Navegación:</strong> Prueba todos los enlaces del menú lateral</p>
              <p>4. <strong>Navbar inferior:</strong> Verifica que los iconos están en la parte inferior</p>
              <p>5. <strong>Responsive:</strong> Cambia el tamaño de la ventana para probar la detección</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  )
}

















