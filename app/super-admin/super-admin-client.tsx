"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { 
  getAllUsers, 
  createUser, 
  updateUser, 
  toggleUserStatus, 
  deleteUser, 
  getAuditLogs, 
  getSystemStats,
  updateCondosLimit,
  type UserData,
  type CreateUserData 
} from "@/lib/actions/super-admin"
import { UserManagementForm } from "./user-management-form"
import { UserEditForm } from "./user-edit-form"
import { 
  Users, 
  UserPlus, 
  Settings, 
  Activity, 
  Shield, 
  UserCheck, 
  UserX, 
  Trash2,
  Edit,
  Eye,
  RefreshCw,
  ArrowLeft,
  Building,
  Plus,
  Minus,
  Building2
} from "lucide-react"
import { CondoAssignmentManager } from "./condo-assignment-manager"

export default function SuperAdminClient() {
  const router = useRouter()
  const [users, setUsers] = useState<UserData[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [systemStats, setSystemStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [activeTab, setActiveTab] = useState("users")
  const { toast } = useToast()

  // Cargar datos iniciales
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [usersResult, logsResult, statsResult] = await Promise.all([
        getAllUsers(),
        getAuditLogs(20),
        getSystemStats()
      ])

      if (usersResult.error) {
        console.error("Error obteniendo usuarios:", usersResult.error)
        toast({
          title: "Error",
          description: usersResult.error,
          variant: "destructive",
        })
      } else {
        console.log("Usuarios obtenidos:", usersResult.users.length)
        setUsers(usersResult.users)
      }

      if (logsResult.error) {
        console.error("Error cargando logs:", logsResult.error)
      } else {
        setAuditLogs(logsResult.logs)
      }

      if (statsResult.error) {
        console.error("Error cargando estadísticas:", statsResult.error)
      } else {
        setSystemStats(statsResult.stats)
      }
    } catch (error) {
      console.error("Error en loadData:", error)
      toast({
        title: "Error",
        description: "Error cargando datos del sistema",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = async (userData: CreateUserData) => {
    const result = await createUser(userData)
    if (result.success) {
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente",
      })
      setShowCreateForm(false)
      loadData()
    } else {
      toast({
        title: "Error",
        description: result.error || "Error creando usuario",
        variant: "destructive",
      })
    }
  }

  const handleUpdateUser = async (userId: string, userData: any) => {
    const result = await updateUser(userId, userData)
    if (result.success) {
      toast({
        title: "Usuario actualizado",
        description: "El usuario ha sido actualizado exitosamente",
      })
      setShowEditForm(false)
      setSelectedUser(null)
      loadData()
    } else {
      toast({
        title: "Error",
        description: result.error || "Error actualizando usuario",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async (userId: string) => {
    const result = await toggleUserStatus(userId)
    if (result.success) {
      toast({
        title: "Estado actualizado",
        description: "El estado del usuario ha sido actualizado",
      })
      loadData()
    } else {
      toast({
        title: "Error",
        description: result.error || "Error actualizando estado",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar al usuario "${userName}"? Esta acción no se puede deshacer.`)) {
      return
    }

    const result = await deleteUser(userId)
    if (result.success) {
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado exitosamente",
      })
      loadData()
    } else {
      toast({
        title: "Error",
        description: result.error || "Error eliminando usuario",
        variant: "destructive",
      })
    }
  }

  const handleEditUser = (user: UserData) => {
    setSelectedUser(user)
    setShowEditForm(true)
  }

  const handleGoBack = () => {
    // Intentar volver a la página anterior, si no hay historial, ir al dashboard
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/dashboard')
    }
  }

  const handleUpdateCondosLimit = async (userId: string, newLimit: number | null) => {
    try {
      console.log('=== INICIANDO handleUpdateCondosLimit ===')
      console.log('Parámetros recibidos:', { userId, newLimit, userIdType: typeof userId, newLimitType: typeof newLimit })
      
      // Validar que userId sea válido
      if (!userId || userId.trim() === '') {
        console.error('User ID inválido:', userId)
        toast({
          title: "Error",
          description: "ID de usuario inválido",
          variant: "destructive",
        })
        return
      }
      
      console.log('Llamando a updateCondosLimit...')
      const result = await updateCondosLimit(userId, newLimit)
      console.log('Resultado de updateCondosLimit:', result)
      
      if (result.success) {
        console.log('✅ Límite actualizado exitosamente')
        toast({
          title: "Límite actualizado",
          description: `El límite de condominios ha sido actualizado exitosamente`,
        })
        loadData()
      } else {
        console.error('❌ Error en updateCondosLimit:', result.error)
        toast({
          title: "Error",
          description: result.error || "Error actualizando límite de condominios",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('❌ Error inesperado en handleUpdateCondosLimit:', error)
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
      toast({
        title: "Error",
        description: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      })
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'destructive'
      case 'admin':
        return 'default'
      case 'user':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Shield className="h-4 w-4" />
      case 'admin':
        return <UserCheck className="h-4 w-4" />
      case 'user':
        return <Users className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando datos del sistema...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        {/* Botón Volver */}
        <div className="flex items-center">
          <Button onClick={handleGoBack} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        
        {/* Título y Acciones */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-destructive" />
              Super Administrador
            </h1>
            <p className="text-muted-foreground">
              Gestión completa del sistema y usuarios
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button onClick={() => setShowCreateForm(true)} size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button>
          </div>
        </div>
      </div>

      {/* Estadísticas del Sistema */}
      {systemStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {systemStats.activeUsers} activos
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
              <Shield className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.superAdmins}</div>
              <p className="text-xs text-muted-foreground">
                Acceso completo
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administradores</CardTitle>
              <UserCheck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.admins}</div>
              <p className="text-xs text-muted-foreground">
                Gestión limitada
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.regularUsers}</div>
              <p className="text-xs text-muted-foreground">
                Acceso básico
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Asignaciones
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Auditoría
          </TabsTrigger>
        </TabsList>

        {/* Tab de Usuarios */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>
                Administra todos los usuarios del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Límite Condominios</TableHead>
                      <TableHead>Último Acceso</TableHead>
                      <TableHead>Regiones</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.full_name}</div>
                            <div className="text-xs text-muted-foreground">RUT: {user.rut}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {user.email.startsWith('ID:') ? (
                              <span className="text-muted-foreground">{user.email}</span>
                            ) : (
                              <span className="font-medium">{user.email}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1 w-fit">
                            {getRoleIcon(user.role)}
                            {user.role === 'super_admin' ? 'Super Admin' : 
                             user.role === 'admin' ? 'Admin' : 'Usuario'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.is_active ? 'default' : 'secondary'}>
                            {user.is_active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">
                                {user.current_condos}/{user.condos_limit || '∞'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newLimit = prompt(
                                    `Límite actual: ${user.condos_limit || 'Sin límite'}\n` +
                                    `Condominios actuales: ${user.current_condos}\n\n` +
                                    `Ingresa el nuevo límite (deja vacío para sin límite):`
                                  )
                                  if (newLimit !== null) {
                                    const limit = newLimit.trim() === '' ? null : parseInt(newLimit)
                                    if (limit === null || (!isNaN(limit) && limit >= user.current_condos)) {
                                      console.log('Enviando actualización de límite:', { 
                                        user_id: user.user_id, 
                                        user_id_type: typeof user.user_id,
                                        limit,
                                        user_full_name: user.full_name 
                                      })
                                      handleUpdateCondosLimit(user.user_id, limit)
                                    } else {
                                      toast({
                                        title: "Error",
                                        description: "El límite no puede ser menor al número actual de condominios",
                                        variant: "destructive",
                                      })
                                    }
                                  }
                                }}
                                title="Editar límite de condominios"
                                className="h-6 w-6 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          {user.condos_limit && (
                            <div className="text-xs text-muted-foreground">
                              {user.can_create_more ? 
                                `${user.remaining_condos} restantes` : 
                                'Límite alcanzado'
                              }
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.last_login 
                            ? new Date(user.last_login).toLocaleDateString('es-CL')
                            : 'Nunca'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.regions.slice(0, 2).map((region, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {region}
                              </Badge>
                            ))}
                            {user.regions.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{user.regions.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                              title="Editar usuario"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(user.id)}
                              title={user.is_active ? "Desactivar" : "Activar"}
                              disabled={user.role === 'super_admin' && user.is_active}
                            >
                              {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id, user.full_name)}
                              title="Eliminar usuario"
                              disabled={user.role === 'super_admin'}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Asignaciones */}
        <TabsContent value="assignments" className="space-y-4">
          <CondoAssignmentManager />
        </TabsContent>

        {/* Tab de Auditoría */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Log de Auditoría</CardTitle>
              <CardDescription>
                Registro de todas las acciones realizadas por administradores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Administrador</TableHead>
                      <TableHead>Acción</TableHead>
                      <TableHead>Tabla</TableHead>
                      <TableHead>Usuario Objetivo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {new Date(log.created_at).toLocaleString('es-CL')}
                        </TableCell>
                        <TableCell>
                          {log.admin_user?.email || 'Sistema'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {log.action.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {log.table_name || '-'}
                        </TableCell>
                        <TableCell>
                          {log.target_user?.email || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Formularios modales */}
      {showCreateForm && (
        <UserManagementForm
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateUser}
        />
      )}

      {showEditForm && selectedUser && (
        <UserEditForm
          user={selectedUser}
          onClose={() => {
            setShowEditForm(false)
            setSelectedUser(null)
          }}
          onSubmit={(userData) => handleUpdateUser(selectedUser.id, userData)}
        />
      )}
    </div>
  )
}





