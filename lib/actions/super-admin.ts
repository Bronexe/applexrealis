"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface UserData {
  id: string
  user_id: string
  full_name: string
  rut: string
  registration_date: string
  regions: string[]
  certification_file_url: string | null
  role: 'super_admin' | 'admin' | 'user'
  is_active: boolean
  last_login: string | null
  created_at: string
  updated_at: string
  email: string
  condos_limit: number | null
  current_condos: number
  can_create_more: boolean
  remaining_condos: number | null
}

export interface CreateUserData {
  email: string
  password: string
  full_name: string
  rut: string
  registration_date: string
  regions: string[]
  role: 'admin' | 'user'
}

export interface UpdateUserData {
  full_name?: string
  rut?: string
  registration_date?: string
  regions?: string[]
  certification_file_url?: string | null
  role?: 'super_admin' | 'admin' | 'user'
  is_active?: boolean
  condos_limit?: number | null
}

// Verificar si el usuario actual es super administrador
export async function isSuperAdmin(): Promise<boolean> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return false
  }

  // Verificación específica para sebaleon@gmail.com
  if (user.email === 'sebaleon@gmail.com') {
    return true
  }

  // Verificación adicional en la tabla administrators
  const { data, error } = await supabase
    .from('administrators')
    .select('role, is_active')
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    return false
  }
  
  return data.role === 'super_admin' && data.is_active === true
}

// Obtener todos los usuarios (solo super administradores)
export async function getAllUsers(): Promise<{ users: UserData[], error: string | null }> {
  const supabase = await createClient()
  
  // Verificar permisos
  if (!(await isSuperAdmin())) {
    console.log('getAllUsers: Usuario no tiene permisos de super admin')
    return { users: [], error: 'No tienes permisos para acceder a esta información' }
  }

  console.log('getAllUsers: Usuario tiene permisos, obteniendo administradores...')

  try {
    // Obtener todos los administradores
    const { data: administrators, error: adminError } = await supabase
      .from('administrators')
      .select('*')
      .order('created_at', { ascending: false })

    if (adminError) {
      console.error('Error obteniendo administradores:', adminError)
      return { users: [], error: adminError.message }
    }

    console.log('Administradores obtenidos:', administrators?.length || 0)

    if (!administrators || administrators.length === 0) {
      console.log('No hay administradores en la tabla')
      return { users: [], error: null }
    }

    // Obtener información de límites de condominios para cada usuario
    const usersWithLimits = await Promise.all(
      administrators.map(async (admin) => {
        // Obtener información de límite usando la función SQL
        const { data: limitInfo, error: limitError } = await supabase
          .rpc('get_condos_limit_info', { p_user_id: admin.user_id })
        
        const limitData = limitInfo?.[0] || {
          current_condos: 0,
          condos_limit: admin.condos_limit || 1, // Límite por defecto: 1
          can_create_more: true,
          remaining_count: null
        }
        
        return {
          id: admin.id,
          user_id: admin.user_id,
          full_name: admin.full_name,
          rut: admin.rut,
          registration_date: admin.registration_date,
          regions: admin.regions || [],
          certification_file_url: admin.certification_file_url,
          role: admin.role,
          is_active: admin.is_active,
          last_login: admin.last_login,
          created_at: admin.created_at,
          updated_at: admin.updated_at,
          email: admin.email || `ID: ${admin.user_id.slice(0, 8)}...`,
          condos_limit: admin.condos_limit,
          current_condos: limitData.current_condos || 0,
          can_create_more: limitData.can_create_more || true,
          remaining_condos: limitData.remaining_count
        }
      })
    )

    // Convertir a formato UserData
    const users: UserData[] = usersWithLimits

    console.log('Usuarios procesados:', users.length)

    return { users, error: null }

  } catch (error) {
    console.error('Error en getAllUsers:', error)
    return { users: [], error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Obtener un usuario específico por ID
export async function getUserById(userId: string): Promise<{ user: UserData | null, error: string | null }> {
  const supabase = await createClient()
  
  // Verificar permisos
  if (!(await isSuperAdmin())) {
    return { user: null, error: 'No tienes permisos para acceder a esta información' }
  }

  const { data, error } = await supabase
    .from('administrators')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    return { user: null, error: error.message }
  }

  const user: UserData = {
    id: data.id,
    user_id: data.user_id,
    full_name: data.full_name,
    rut: data.rut,
    registration_date: data.registration_date,
    regions: data.regions,
    certification_file_url: data.certification_file_url,
    role: data.role,
    is_active: data.is_active,
    last_login: data.last_login,
    created_at: data.created_at,
    updated_at: data.updated_at,
    email: `ID: ${data.user_id.slice(0, 8)}...`
  }

  return { user, error: null }
}

// Crear un nuevo usuario
export async function createUser(userData: CreateUserData): Promise<{ success: boolean, error: string | null }> {
  const supabase = await createClient()
  
  // Verificar permisos
  if (!(await isSuperAdmin())) {
    return { success: false, error: 'No tienes permisos para crear usuarios' }
  }

  try {
    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true
    })

    if (authError) {
      return { success: false, error: `Error creando usuario: ${authError.message}` }
    }

    if (!authData.user) {
      return { success: false, error: 'No se pudo crear el usuario' }
    }

    // Crear registro en la tabla administrators
    const { error: adminError } = await supabase
      .from('administrators')
      .insert({
        user_id: authData.user.id,
        full_name: userData.full_name,
        rut: userData.rut,
        registration_date: userData.registration_date,
        regions: userData.regions,
        role: userData.role,
        is_active: true
      })

    if (adminError) {
      // Si falla la creación del administrador, eliminar el usuario de auth
      await supabase.auth.admin.deleteUser(authData.user.id)
      return { success: false, error: `Error creando administrador: ${adminError.message}` }
    }

    revalidatePath('/super-admin')
    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Actualizar un usuario
export async function updateUser(userId: string, userData: UpdateUserData): Promise<{ success: boolean, error: string | null }> {
  const supabase = await createClient()
  
  // Verificar permisos
  if (!(await isSuperAdmin())) {
    return { success: false, error: 'No tienes permisos para actualizar usuarios' }
  }

  const { error } = await supabase
    .from('administrators')
    .update({
      ...userData,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/super-admin')
  return { success: true, error: null }
}

// Activar/desactivar usuario
export async function toggleUserStatus(userId: string): Promise<{ success: boolean, error: string | null }> {
  const supabase = await createClient()
  
  // Verificar permisos
  if (!(await isSuperAdmin())) {
    return { success: false, error: 'No tienes permisos para cambiar el estado de usuarios' }
  }

  // Obtener el estado actual
  const { data: currentUser, error: fetchError } = await supabase
    .from('administrators')
    .select('is_active, role')
    .eq('id', userId)
    .single()

  if (fetchError) {
    return { success: false, error: fetchError.message }
  }

  // No permitir desactivar super administradores
  if (currentUser.role === 'super_admin' && currentUser.is_active) {
    return { success: false, error: 'No se puede desactivar un super administrador' }
  }

  const { error } = await supabase
    .from('administrators')
    .update({
      is_active: !currentUser.is_active,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/super-admin')
  return { success: true, error: null }
}

// Eliminar usuario
export async function deleteUser(userId: string): Promise<{ success: boolean, error: string | null }> {
  const supabase = await createClient()
  
  // Verificar permisos
  if (!(await isSuperAdmin())) {
    return { success: false, error: 'No tienes permisos para eliminar usuarios' }
  }

  // Obtener información del usuario
  const { data: userData, error: fetchError } = await supabase
    .from('administrators')
    .select('user_id, role')
    .eq('id', userId)
    .single()

  if (fetchError) {
    return { success: false, error: fetchError.message }
  }

  // No permitir eliminar super administradores
  if (userData.role === 'super_admin') {
    return { success: false, error: 'No se puede eliminar un super administrador' }
  }

  try {
    // Eliminar de la tabla administrators
    const { error: adminError } = await supabase
      .from('administrators')
      .delete()
      .eq('id', userId)

    if (adminError) {
      return { success: false, error: adminError.message }
    }

    // Eliminar de Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userData.user_id)
    
    if (authError) {
      console.error('Error eliminando usuario de auth:', authError)
      // No retornamos error aquí porque el administrador ya fue eliminado
    }

    revalidatePath('/super-admin')
    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Obtener logs de auditoría
export async function getAuditLogs(limit: number = 50): Promise<{ logs: any[], error: string | null }> {
  const supabase = await createClient()
  
  // Verificar permisos
  if (!(await isSuperAdmin())) {
    return { logs: [], error: 'No tienes permisos para ver los logs de auditoría' }
  }

  try {
    // Obtener solo los logs básicos sin relaciones
    const { data: logsData, error: logsError } = await supabase
      .from('admin_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (logsError) {
      return { logs: [], error: logsError.message }
    }

    if (!logsData || logsData.length === 0) {
      return { logs: [], error: null }
    }

    // Procesar los logs sin hacer consultas adicionales problemáticas
    const logs = logsData.map(log => ({
      ...log,
      admin_user: log.admin_user_id ? {
        full_name: `Usuario ${log.admin_user_id.slice(0, 8)}...`,
        email: `ID: ${log.admin_user_id.slice(0, 8)}...`
      } : null,
      target_user: log.target_user_id ? {
        full_name: `Usuario ${log.target_user_id.slice(0, 8)}...`,
        email: `ID: ${log.target_user_id.slice(0, 8)}...`
      } : null
    }))

    return { logs, error: null }

  } catch (error) {
    console.error('Error en getAuditLogs:', error)
    return { logs: [], error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Obtener estadísticas del sistema
export async function getSystemStats(): Promise<{ stats: any, error: string | null }> {
  const supabase = await createClient()
  
  // Verificar permisos
  if (!(await isSuperAdmin())) {
    return { stats: null, error: 'No tienes permisos para ver las estadísticas del sistema' }
  }

  try {
    // Obtener usuarios usando la misma lógica que getAllUsers
    const { users, error: usersError } = await getAllUsers()
    
    if (usersError) {
      return { stats: null, error: usersError }
    }

    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.is_active).length,
      inactiveUsers: users.filter(u => !u.is_active).length,
      superAdmins: users.filter(u => u.role === 'super_admin' && u.is_active).length,
      admins: users.filter(u => u.role === 'admin' && u.is_active).length,
      regularUsers: users.filter(u => u.role === 'user' && u.is_active).length,
      lastUpdated: new Date().toISOString()
    }

    return { stats, error: null }

  } catch (error) {
    return { stats: null, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Actualizar límite de condominios para un usuario
export async function updateCondosLimit(
  userId: string, 
  newLimit: number | null
): Promise<{ success: boolean, error: string | null }> {
  const supabase = await createClient()
  
  console.log('=== INICIANDO updateCondosLimit ===')
  console.log('Parámetros:', { userId, newLimit, userIdType: typeof userId, newLimitType: typeof newLimit })
  
  // Verificar permisos
  if (!(await isSuperAdmin())) {
    console.error('Usuario no es super admin')
    return { success: false, error: 'No tienes permisos para actualizar límites de condominios' }
  }

  try {
    // Validar que el límite no sea negativo
    if (newLimit !== null && newLimit < 0) {
      return { success: false, error: 'El límite no puede ser negativo' }
    }

    // Verificar que el usuario existe
    const { data: userExists, error: userError } = await supabase
      .from('administrators')
      .select('user_id, full_name, condos_limit')
      .eq('user_id', userId)
      .maybeSingle() // Cambiar de .single() a .maybeSingle()
    
    if (userError) {
      console.error('Error consultando usuario:', userError)
      return { success: false, error: `Error consultando usuario: ${userError.message}` }
    }
    
    if (!userExists) {
      console.error('Usuario no encontrado en administrators')
      return { success: false, error: 'Usuario no encontrado en la tabla de administradores' }
    }
    
    console.log('Usuario encontrado:', userExists)
    
    // Contar condominios actuales
    const { count: condoCount, error: countError } = await supabase
      .from('condos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    
    if (countError) {
      console.error('Error contando condominios:', countError)
      return { success: false, error: `Error contando condominios: ${countError.message}` }
    }
    
    const currentCondos = condoCount || 0
    console.log('Condominios actuales:', currentCondos)
    
    // Validar que el nuevo límite no sea menor a los condominios actuales
    if (newLimit !== null && newLimit < currentCondos) {
      console.error('Límite menor a condominios actuales:', { newLimit, currentCondos })
      return { 
        success: false, 
        error: `El límite (${newLimit}) no puede ser menor al número actual de condominios (${currentCondos})` 
      }
    }

    console.log('Llamando a update_condos_limit RPC...')
    // Usar la función SQL para actualizar el límite
    const { data, error } = await supabase
      .rpc('update_condos_limit', { 
        p_user_id: userId, 
        p_new_limit: newLimit 
      })

    console.log('Resultado RPC:', { data, error })

    if (error) {
      console.error('Error en RPC update_condos_limit:', error)
      return { success: false, error: `Error en base de datos: ${error.message}` }
    }

    if (!data) {
      console.error('RPC devolvió false - validación falló')
      return { 
        success: false, 
        error: `No se pudo actualizar el límite. Usuario: ${userExists.full_name}, Condominios actuales: ${currentCondos}, Límite actual: ${userExists.condos_limit}. Verifica que el límite no sea menor al número actual de condominios.` 
      }
    }

    console.log('Límite actualizado exitosamente')
    // Revalidar la página para mostrar los cambios
    revalidatePath('/super-admin')

    return { success: true, error: null }

  } catch (error) {
    console.error('Error inesperado en updateCondosLimit:', error)
    return { success: false, error: `Error interno del servidor: ${error instanceof Error ? error.message : 'Error desconocido'}` }
  }
}

// Verificar si un usuario puede crear más condominios
export async function checkUserCanCreateCondos(userId: string): Promise<{
  canCreate: boolean,
  currentCount: number,
  limitCount: number | null,
  remainingCount: number | null,
  error: string | null
}> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .rpc('check_condos_limit', { p_user_id: userId })

    if (error) {
      console.error('Error verificando límite de condominios:', error)
      return {
        canCreate: false,
        currentCount: 0,
        limitCount: null,
        remainingCount: null,
        error: error.message
      }
    }

    const result = data?.[0]
    if (!result) {
      return {
        canCreate: false,
        currentCount: 0,
        limitCount: null,
        remainingCount: null,
        error: 'No se pudo verificar el límite de condominios'
      }
    }

    return {
      canCreate: result.can_create,
      currentCount: result.current_count,
      limitCount: result.limit_count,
      remainingCount: result.remaining_count,
      error: null
    }

  } catch (error) {
    console.error('Error en checkUserCanCreateCondos:', error)
    return {
      canCreate: false,
      currentCount: 0,
      limitCount: null,
      remainingCount: null,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}




