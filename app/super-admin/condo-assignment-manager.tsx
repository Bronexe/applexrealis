"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  getAssignableCondos,
  getAssignableUsers,
  getUserAssignments,
  assignCondoToUser,
  removeCondoAssignment,
  type AssignableUser,
  type AssignableCondo,
  type CondoAssignment
} from "@/lib/actions/condo-assignments"
import { Building2, UserPlus, Trash2, RefreshCw, Users } from "lucide-react"

export function CondoAssignmentManager() {
  const [condos, setCondos] = useState<AssignableCondo[]>([])
  const [users, setUsers] = useState<AssignableUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [selectedCondo, setSelectedCondo] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [userAssignments, setUserAssignments] = useState<{ [userId: string]: CondoAssignment[] }>({})
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [condosResult, usersResult] = await Promise.all([
        getAssignableCondos(),
        getAssignableUsers()
      ])

      if (condosResult.error) {
        toast({
          title: "Error",
          description: condosResult.error,
          variant: "destructive",
        })
      } else {
        setCondos(condosResult.condos)
      }

      if (usersResult.error) {
        toast({
          title: "Error",
          description: usersResult.error,
          variant: "destructive",
        })
      } else {
        setUsers(usersResult.users)
        
        // Cargar asignaciones para cada usuario
        const assignments: { [userId: string]: CondoAssignment[] } = {}
        for (const user of usersResult.users) {
          const result = await getUserAssignments(user.user_id)
          if (!result.error) {
            assignments[user.user_id] = result.assignments
          }
        }
        setUserAssignments(assignments)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error cargando datos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssignCondo = async () => {
    if (!selectedUser || !selectedCondo) {
      toast({
        title: "Error",
        description: "Debes seleccionar un usuario y un condominio",
        variant: "destructive",
      })
      return
    }

    const result = await assignCondoToUser(selectedCondo, selectedUser, notes)
    
    if (result.success) {
      toast({
        title: "Éxito",
        description: "Condominio asignado correctamente",
      })
      setShowAssignDialog(false)
      setSelectedUser("")
      setSelectedCondo("")
      setNotes("")
      loadData()
    } else {
      toast({
        title: "Error",
        description: result.error || "Error asignando condominio",
        variant: "destructive",
      })
    }
  }

  const handleRemoveAssignment = async (assignmentId: string, userName: string, condoName: string) => {
    if (!confirm(`¿Estás seguro de que quieres remover el acceso de ${userName} al condominio "${condoName}"?`)) {
      return
    }

    const result = await removeCondoAssignment(assignmentId)
    
    if (result.success) {
      toast({
        title: "Éxito",
        description: "Asignación removida correctamente",
      })
      loadData()
    } else {
      toast({
        title: "Error",
        description: result.error || "Error removiendo asignación",
        variant: "destructive",
      })
    }
  }

  const toggleUserExpanded = (userId: string) => {
    const newExpanded = new Set(expandedUsers)
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId)
    } else {
      newExpanded.add(userId)
    }
    setExpandedUsers(newExpanded)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Cargando asignaciones...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Asignación de Condominios
              </CardTitle>
              <CardDescription>
                Asigna condominios a usuarios para que puedan acceder y editarlos
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={loadData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
              <Button onClick={() => setShowAssignDialog(true)} size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Nueva Asignación
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Total de usuarios: {users.length} | Total de condominios: {condos.length}
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Condominios Asignados</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const assignments = userAssignments[user.user_id] || []
                    const isExpanded = expandedUsers.has(user.user_id)
                    
                    return (
                      <React.Fragment key={user.id}>
                        <TableRow>
                          <TableCell>
                            <div className="font-medium">{user.full_name}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{user.email}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.is_active ? "default" : "secondary"}>
                              {user.is_active ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {assignments.length}
                              </Badge>
                              {assignments.length > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleUserExpanded(user.user_id)}
                                  className="h-6 px-2 text-xs"
                                >
                                  {isExpanded ? "Ocultar" : "Ver detalles"}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user.user_id)
                                setShowAssignDialog(true)
                              }}
                              title="Asignar condominio"
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        
                        {/* Fila expandida con detalles de asignaciones */}
                        {isExpanded && assignments.length > 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="bg-muted/50">
                              <div className="py-2 px-4 space-y-2">
                                <div className="text-sm font-semibold mb-2">Condominios asignados:</div>
                                {assignments.map((assignment) => (
                                  <div key={assignment.id} className="flex items-center justify-between py-2 px-3 bg-background rounded-md">
                                    <div className="flex items-center gap-3">
                                      <Building2 className="h-4 w-4 text-muted-foreground" />
                                      <div>
                                        <div className="font-medium text-sm">{assignment.condo_name}</div>
                                        <div className="text-xs text-muted-foreground">
                                          Asignado el {new Date(assignment.assigned_at).toLocaleDateString("es-CL")}
                                        </div>
                                        {assignment.notes && (
                                          <div className="text-xs text-muted-foreground mt-1">
                                            Nota: {assignment.notes}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveAssignment(assignment.id, user.full_name, assignment.condo_name || "")}
                                      className="text-destructive hover:text-destructive"
                                      title="Remover asignación"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    )
                  })}
                  
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No hay usuarios disponibles
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para asignar condominio */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Asignar Condominio a Usuario</DialogTitle>
            <DialogDescription>
              Selecciona un usuario y un condominio para crear una nueva asignación
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user-select">Usuario</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger id="user-select">
                  <SelectValue placeholder="Selecciona un usuario" />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(u => u.is_active).map((user) => (
                    <SelectItem key={user.id} value={user.user_id}>
                      {user.full_name} - {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condo-select">Condominio</Label>
              <Select value={selectedCondo} onValueChange={setSelectedCondo}>
                <SelectTrigger id="condo-select">
                  <SelectValue placeholder="Selecciona un condominio" />
                </SelectTrigger>
                <SelectContent>
                  {condos.map((condo) => (
                    <SelectItem key={condo.id} value={condo.id}>
                      {condo.name} - {condo.owner_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Añade notas sobre esta asignación..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAssignDialog(false)
              setSelectedUser("")
              setSelectedCondo("")
              setNotes("")
            }}>
              Cancelar
            </Button>
            <Button onClick={handleAssignCondo}>
              Asignar Condominio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

