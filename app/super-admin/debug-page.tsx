"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { 
  Users, 
  UserPlus, 
  Shield, 
  RefreshCw,
  AlertTriangle
} from "lucide-react"

export default function DebugSuperAdminPage() {
  const [users, setUsers] = useState<any[]>([])
  const [administrators, setAdministrators] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState<any>({})
  const { toast } = useToast()

  useEffect(() => {
    loadDebugData()
  }, [])

  const loadDebugData = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      
      // Obtener usuario actual
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      console.log('Usuario actual:', user)
      setCurrentUser(user)

      // Obtener todos los usuarios de auth.users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      console.log('Usuarios de auth:', authUsers)
      
      if (authError) {
        console.error('Error obteniendo usuarios de auth:', authError)
      } else {
        setUsers(authUsers?.users || [])
      }

      // Obtener administradores
      const { data: adminData, error: adminError } = await supabase
        .from('administrators')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('Administradores:', adminData)
      
      if (adminError) {
        console.error('Error obteniendo administradores:', adminError)
      } else {
        setAdministrators(adminData || [])
      }

      // Verificar si el usuario actual es super admin
      let isSuperAdmin = false
      if (user) {
        const { data: adminUser, error: adminUserError } = await supabase
          .from('administrators')
          .select('role, is_active')
          .eq('user_id', user.id)
          .single()

        console.log('Datos de administrador del usuario actual:', adminUser)
        
        if (!adminUserError && adminUser) {
          isSuperAdmin = adminUser.role === 'super_admin' && adminUser.is_active === true
        }
      }

      setDebugInfo({
        currentUser: user,
        isSuperAdmin,
        authUsersCount: authUsers?.users?.length || 0,
        administratorsCount: adminData?.length || 0,
        authError: authError?.message,
        adminError: adminError?.message
      })

    } catch (error) {
      console.error('Error cargando datos de debug:', error)
      toast({
        title: "Error",
        description: "Error cargando datos de debug",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const assignSuperAdminRole = async () => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "No hay usuario autenticado",
        variant: "destructive",
      })
      return
    }

    try {
      const supabase = createClient()
      
      // Verificar si ya existe en administrators
      const { data: existingAdmin, error: checkError } = await supabase
        .from('administrators')
        .select('id')
        .eq('user_id', currentUser.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingAdmin) {
        // Actualizar rol existente
        const { error: updateError } = await supabase
          .from('administrators')
          .update({
            role: 'super_admin',
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', currentUser.id)

        if (updateError) throw updateError
      } else {
        // Crear nuevo registro
        const { error: insertError } = await supabase
          .from('administrators')
          .insert({
            user_id: currentUser.id,
            full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Super Admin',
            rut: currentUser.user_metadata?.rut || '',
            registration_date: currentUser.created_at,
            regions: currentUser.user_metadata?.regions || [],
            role: 'super_admin',
            is_active: true
          })

        if (insertError) throw insertError
      }

      toast({
        title: "Éxito",
        description: "Rol de super administrador asignado correctamente",
      })

      loadDebugData()
    } catch (error) {
      console.error('Error asignando rol:', error)
      toast({
        title: "Error",
        description: `Error asignando rol: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando datos de debug...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            Debug Super Admin
          </h1>
          <p className="text-muted-foreground">
            Página de debug para diagnosticar problemas de permisos
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadDebugData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={assignSuperAdminRole} size="sm">
            <Shield className="h-4 w-4 mr-2" />
            Asignar Super Admin
          </Button>
        </div>
      </div>

      {/* Información de Debug */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Debug</CardTitle>
          <CardDescription>
            Estado actual del sistema y permisos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Usuario Actual</h4>
              <div className="text-sm text-muted-foreground">
                <p><strong>ID:</strong> {currentUser?.id || 'No autenticado'}</p>
                <p><strong>Email:</strong> {currentUser?.email || 'N/A'}</p>
                <p><strong>Es Super Admin:</strong> {debugInfo.isSuperAdmin ? 'Sí' : 'No'}</p>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Estadísticas</h4>
              <div className="text-sm text-muted-foreground">
                <p><strong>Usuarios Auth:</strong> {debugInfo.authUsersCount}</p>
                <p><strong>Administradores:</strong> {debugInfo.administratorsCount}</p>
                <p><strong>Error Auth:</strong> {debugInfo.authError || 'Ninguno'}</p>
                <p><strong>Error Admin:</strong> {debugInfo.adminError || 'Ninguno'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usuarios de Auth */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios de Auth ({users.length})</CardTitle>
          <CardDescription>
            Usuarios registrados en Supabase Auth
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead>Último Acceso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-xs">
                      {user.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('es-CL')}
                    </TableCell>
                    <TableCell>
                      {user.last_sign_in_at 
                        ? new Date(user.last_sign_in_at).toLocaleDateString('es-CL')
                        : 'Nunca'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Administradores */}
      <Card>
        <CardHeader>
          <CardTitle>Administradores ({administrators.length})</CardTitle>
          <CardDescription>
            Usuarios en la tabla administrators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Creado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {administrators.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-mono text-xs">
                      {admin.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {admin.user_id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>{admin.full_name}</TableCell>
                    <TableCell>
                      <Badge variant={
                        admin.role === 'super_admin' ? 'destructive' :
                        admin.role === 'admin' ? 'default' : 'secondary'
                      }>
                        {admin.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={admin.is_active ? 'default' : 'secondary'}>
                        {admin.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(admin.created_at).toLocaleDateString('es-CL')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}














