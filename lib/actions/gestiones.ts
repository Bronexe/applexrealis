"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export interface Gestion {
  id: string
  tipo: string
  titulo: string
  descripcion: string | null
  estado: string
  prioridad: string
  condominio_id: string
  unidad_id: string | null
  solicitante_id: string | null
  responsable_id: string
  fecha_creacion: string
  fecha_limite: string | null
  fecha_cierre: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
}

export interface CreateGestionData {
  tipo: string
  titulo: string
  descripcion?: string
  estado: string
  prioridad: string
  condominio_id: string
  unidad_id?: string | null
  solicitante_id?: string | null
  fecha_limite?: string | null
  tags?: string[]
}

export interface UpdateGestionData {
  tipo?: string
  titulo?: string
  descripcion?: string
  estado?: string
  prioridad?: string
  condominio_id?: string
  unidad_id?: string | null
  solicitante_id?: string | null
  fecha_limite?: string | null
  fecha_cierre?: string | null
  tags?: string[]
}

// Obtener todas las gestiones del usuario o todas si es super-admin
export async function getGestiones(): Promise<{ gestiones: Gestion[], error: string | null }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { gestiones: [], error: 'Usuario no autenticado' }
  }

  try {
    let query = supabase
      .from('gestiones')
      .select('*')
      .order('fecha_creacion', { ascending: false })

    // Si no es super-admin, solo mostrar sus gestiones
    const { data: userData } = await supabase.auth.getUser()
    if (userData?.user?.email !== 'sebaleon@gmail.com') {
      // Verificar si es super-admin en la tabla administrators
      const { data: adminData } = await supabase
        .from('administrators')
        .select('role, is_active')
        .eq('user_id', user.id)
        .single()

      if (!adminData || adminData.role !== 'super_admin' || !adminData.is_active) {
        query = query.eq('responsable_id', user.id)
      }
    }

    const { data: gestiones, error } = await query

    if (error) {
      console.error('Error fetching gestiones:', error)
      return { gestiones: [], error: error.message }
    }

    return { gestiones: gestiones || [], error: null }

  } catch (error) {
    console.error('Error in getGestiones:', error)
    return { gestiones: [], error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Obtener una gestión específica
export async function getGestionById(id: string): Promise<{ gestion: Gestion | null, error: string | null }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { gestion: null, error: 'Usuario no autenticado' }
  }

  try {
    const { data: gestion, error } = await supabase
      .from('gestiones')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching gestion:', error)
      return { gestion: null, error: error.message }
    }

    return { gestion, error: null }

  } catch (error) {
    console.error('Error in getGestionById:', error)
    return { gestion: null, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Crear una nueva gestión
export async function createGestion(gestionData: CreateGestionData): Promise<{ success: boolean, error: string | null }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' }
  }

  try {
    const { error } = await supabase
      .from('gestiones')
      .insert({
        ...gestionData,
        responsable_id: user.id
      })

    if (error) {
      console.error('Error creating gestion:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/gestiones')
    return { success: true, error: null }

  } catch (error) {
    console.error('Error in createGestion:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Actualizar una gestión
export async function updateGestion(id: string, gestionData: UpdateGestionData): Promise<{ success: boolean, error: string | null }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' }
  }

  try {
    // Verificar que el usuario puede editar esta gestión
    const { data: existingGestion, error: fetchError } = await supabase
      .from('gestiones')
      .select('responsable_id')
      .eq('id', id)
      .single()

    if (fetchError) {
      return { success: false, error: 'Gestión no encontrada' }
    }

    // Verificar permisos (solo el responsable o super-admin)
    const isSuperAdmin = user.email === 'sebaleon@gmail.com' || 
      await supabase
        .from('administrators')
        .select('role, is_active')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => data?.role === 'super_admin' && data?.is_active)

    if (existingGestion.responsable_id !== user.id && !isSuperAdmin) {
      return { success: false, error: 'No tienes permisos para editar esta gestión' }
    }

    const { error } = await supabase
      .from('gestiones')
      .update(gestionData)
      .eq('id', id)

    if (error) {
      console.error('Error updating gestion:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/gestiones')
    revalidatePath(`/gestiones/${id}`)
    return { success: true, error: null }

  } catch (error) {
    console.error('Error in updateGestion:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Eliminar una gestión
export async function deleteGestion(id: string): Promise<{ success: boolean, error: string | null }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' }
  }

  try {
    // Verificar que el usuario puede eliminar esta gestión
    const { data: existingGestion, error: fetchError } = await supabase
      .from('gestiones')
      .select('responsable_id')
      .eq('id', id)
      .single()

    if (fetchError) {
      return { success: false, error: 'Gestión no encontrada' }
    }

    // Verificar permisos (solo el responsable o super-admin)
    const isSuperAdmin = user.email === 'sebaleon@gmail.com' || 
      await supabase
        .from('administrators')
        .select('role, is_active')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => data?.role === 'super_admin' && data?.is_active)

    if (existingGestion.responsable_id !== user.id && !isSuperAdmin) {
      return { success: false, error: 'No tienes permisos para eliminar esta gestión' }
    }

    const { error } = await supabase
      .from('gestiones')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting gestion:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/gestiones')
    return { success: true, error: null }

  } catch (error) {
    console.error('Error in deleteGestion:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Obtener estadísticas de gestiones
export async function getGestionesStats(condominioId?: string): Promise<{ stats: any, error: string | null }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { stats: null, error: 'Usuario no autenticado' }
  }

  try {
    const { data: stats, error } = await supabase
      .rpc('get_gestiones_stats', {
        p_condominio_id: condominioId || null
      })

    if (error) {
      console.error('Error fetching gestiones stats:', error)
      return { stats: null, error: error.message }
    }

    return { stats: stats?.[0] || {}, error: null }

  } catch (error) {
    console.error('Error in getGestionesStats:', error)
    return { stats: null, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Obtener condominios del usuario para el selector
export async function getUserCondos(): Promise<{ condos: any[], error: string | null }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { condos: [], error: 'Usuario no autenticado' }
  }

  try {
    let query = supabase
      .from('condos')
      .select('id, name, comuna, region_id, commune_id')
      .order('name')

    // Si no es super-admin, solo mostrar sus condominios
    const isSuperAdmin = user.email === 'sebaleon@gmail.com' || 
      await supabase
        .from('administrators')
        .select('role, is_active')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => data?.role === 'super_admin' && data?.is_active)

    if (!isSuperAdmin) {
      query = query.eq('user_id', user.id)
    }

    const { data: condos, error } = await query

    if (error) {
      console.error('Error fetching condos:', error)
      return { condos: [], error: error.message }
    }

    return { condos: condos || [], error: null }

  } catch (error) {
    console.error('Error in getUserCondos:', error)
    return { condos: [], error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}





