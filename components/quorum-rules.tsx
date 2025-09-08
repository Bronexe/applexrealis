"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, CheckCircle, AlertCircle } from "lucide-react"

interface QuorumRulesProps {
  cantidadCopropietarios: number | null
}

export function QuorumRules({ cantidadCopropietarios }: QuorumRulesProps) {
  if (!cantidadCopropietarios) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Reglas de Quórum
          </CardTitle>
          <CardDescription>
            Configura la cantidad de copropietarios para ver las reglas de quórum
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Cantidad de copropietarios no configurada</h3>
            <p className="text-muted-foreground">
              Edita la cantidad de copropietarios para ver las reglas de quórum aplicables
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const calcularQuorum = (porcentaje: number) => {
    return Math.ceil(cantidadCopropietarios * (porcentaje / 100))
  }

  const quorum33 = calcularQuorum(33)
  const quorum50 = calcularQuorum(50)
  const quorum66 = calcularQuorum(66)

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Reglas de Quórum
        </CardTitle>
        <CardDescription>
          Reglas para la constitución de quórum según el tipo de asamblea
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Asamblea Ordinaria */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="rounded-lg">
                Asamblea Ordinaria
              </Badge>
            </div>
            <div className="grid gap-3 pl-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Para constituir sesión:</p>
                  <p className="text-sm text-muted-foreground">
                    Al menos <span className="font-semibold text-primary">{quorum33} copropietarios</span> 
                    (33% de los derechos del condominio)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Para adoptar acuerdos:</p>
                  <p className="text-sm text-muted-foreground">
                    Mayoría absoluta de los asistentes 
                    <span className="font-semibold text-primary"> (50% + 1 de los presentes)</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Asamblea Extraordinaria - Mayoría Absoluta */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-lg">
                Asamblea Extraordinaria - Mayoría Absoluta
              </Badge>
            </div>
            <div className="grid gap-3 pl-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Para constituir sesión:</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-primary">{quorum50} copropietarios</span> 
                    (mayoría absoluta de los derechos del condominio)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Para adoptar acuerdos:</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-primary">{quorum50} copropietarios</span> 
                    (mayoría absoluta de los derechos del condominio)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Asamblea Extraordinaria - Mayoría Reforzada */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="rounded-lg">
                Asamblea Extraordinaria - Mayoría Reforzada
              </Badge>
            </div>
            <div className="grid gap-3 pl-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Para constituir sesión:</p>
                  <p className="text-sm text-muted-foreground">
                    Al menos <span className="font-semibold text-primary">{quorum66} copropietarios</span> 
                    (66% de los derechos del condominio)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Para adoptar acuerdos:</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-primary">{quorum66} copropietarios</span> 
                    (66% de los derechos del condominio)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-6 p-4 bg-muted/50 rounded-xl">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Información importante:</p>
                <p className="text-xs text-muted-foreground">
                  Estas reglas están basadas en la legislación chilena para copropiedades. 
                  Los cálculos se realizan sobre el total de {cantidadCopropietarios} copropietarios registrados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
