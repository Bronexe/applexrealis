"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { isSuperAdmin } from "./super-admin"

export interface CondoAssignment {
  id: string
  condo_id: string
  user_id: string
  assigned_by: string
  assigned_at: string
  notes: string | null
  user_name?: string
  user_email?: string
  condo_name?: string
}

export interface AssignableUser {
  id: string
  user_id: string
  full_name: string
  email: string
  is_active: boolean
}

export interface AssignableCondo {
  id: string
  name: string
  address: string
  owner_name: string
}

// Obtener todos los condominios disponibles para asignar
export async function getAssignableCondos(): Promise<{
  condos: AssignableCondo[]
  error: string | null
}> {
  const supabase = await createClient()
  
  // Verificar permisos de super admin
  if (!(await isSuperAdmin())) {
    return { condos: [], error: "No tienes permisos para acceder a esta información" }
  }

  try {
    const { data: condos, error } = await supabase
      .from("condos")
      .select(`
        id,
        name,
        address,
        user_id
      `)
      .order("name")

    if (error) {
      console.error("Error obteniendo condominios:", error)
      return { condos: [], error: error.message }
    }

    // Obtener información de los propietarios
    const condosWithOwners = await Promise.all(
      (condos || []).map(async (condo) => {
        const { data: admin } = await supabase
          .from("administrators")
          .select("full_name")
          .eq("user_id", condo.user_id)
          .single()

        return {
          id: condo.id,
          name: condo.name,
          address: condo.address || "",
          owner_name: admin?.full_name || "Propietario desconocido"
        }
      })
    )

    return { condos: condosWithOwners, error: null }
  } catch (error) {
    console.error("Error en getAssignableCondos:", error)
    return { condos: [], error: error instanceof Error ? error.message : "Error desconocido" }
  }
}

// Obtener todos los usuarios que pueden ser asignados
export async function getAssignableUsers(): Promise<{
  users: AssignableUser[]
  error: string | null
}> {
  const supabase = await createClient()
  
  // Verificar permisos de super admin
  if (!(await isSuperAdmin())) {
    return { users: [], error: "No tienes permisos para acceder a esta información" }
  }

  try {
    const { data: administrators, error } = await supabase
      .from("administrators")
      .select("id, user_id, full_name, email, is_active, role")
      .order("full_name")

    if (error) {
      console.error("Error obteniendo usuarios:", error)
      return { users: [], error: error.message }
    }

    const users: AssignableUser[] = (administrators || []).map(admin => ({
      id: admin.id,
      user_id: admin.user_id,
      full_name: admin.full_name,
      email: admin.email || `ID: ${admin.user_id.slice(0, 8)}...`,
      is_active: admin.is_active
    }))

    return { users, error: null }
  } catch (error) {
    console.error("Error en getAssignableUsers:", error)
    return { users: [], error: error instanceof Error ? error.message : "Error desconocido" }
  }
}

// Obtener asignaciones de un condominio específico
export async function getCondoAssignments(condoId: string): Promise<{
  assignments: CondoAssignment[]
  error: string | null
}> {
  const supabase = await createClient()
  
  // Verificar permisos de super admin
  if (!(await isSuperAdmin())) {
    return { assignments: [], error: "No tienes permisos para acceder a esta información" }
  }

  try {
    const { data, error } = await supabase
      .rpc("get_condo_assignments_with_details", { p_condo_id: condoId })

    if (error) {
      console.error("Error obteniendo asignaciones:", error)
      return { assignments: [], error: error.message }
    }

    const assignments: CondoAssignment[] = (data || []).map((item: any) => ({
      id: item.assignment_id,
      condo_id: condoId,
      user_id: item.user_id,
      assigned_by: "",
      assigned_at: item.assigned_at,
      notes: item.notes,
      user_name: item.user_name,
      user_email: item.user_email
    }))

    return { assignments, error: null }
  } catch (error) {
    console.error("Error en getCondoAssignments:", error)
    return { assignments: [], error: error instanceof Error ? error.message : "Error desconocido" }
  }
}

// Obtener todos los condominios asignados a un usuario
export async function getUserAssignments(userId: string): Promise<{
  assignments: CondoAssignment[]
  error: string | null
}> {
  const supabase = await createClient()
  
  // Verificar permisos de super admin
  if (!(await isSuperAdmin())) {
    return { assignments: [], error: "No tienes permisos para acceder a esta información" }
  }

  try {
    const { data: assignments, error } = await supabase
      .from("condo_assignments")
      .select(`
        id,
        condo_id,
        user_id,
        assigned_by,
        assigned_at,
        notes,
        condos (
          name
        )
      `)
      .eq("user_id", userId)
      .order("assigned_at", { ascending: false })

    if (error) {
      console.error("Error obteniendo asignaciones del usuario:", error)
      return { assignments: [], error: error.message }
    }

    const formattedAssignments: CondoAssignment[] = (assignments || []).map((item: any) => ({
      id: item.id,
      condo_id: item.condo_id,
      user_id: item.user_id,
      assigned_by: item.assigned_by,
      assigned_at: item.assigned_at,
      notes: item.notes,
      condo_name: item.condos?.name || "Condominio desconocido"
    }))

    return { assignments: formattedAssignments, error: null }
  } catch (error) {
    console.error("Error en getUserAssignments:", error)
    return { assignments: [], error: error instanceof Error ? error.message : "Error desconocido" }
  }
}

// Asignar un condominio a un usuario
export async function assignCondoToUser(
  condoId: string,
  userId: string,
  notes?: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()
  
  // Verificar permisos de super admin
  if (!(await isSuperAdmin())) {
    return { success: false, error: "No tienes permisos para realizar esta acción" }
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "Usuario no autenticado" }
    }

    // Verificar que el condominio existe
    const { data: condo, error: condoError } = await supabase
      .from("condos")
      .select("id, name, user_id")
      .eq("id", condoId)
      .single()

    if (condoError || !condo) {
      return { success: false, error: "Condominio no encontrado" }
    }

    // Verificar que no sea el propietario
    if (condo.user_id === userId) {
      return { success: false, error: "No puedes asignar un condominio a su propietario" }
    }

    // Verificar que el usuario existe
    const { data: targetUser, error: userError } = await supabase
      .from("administrators")
      .select("user_id, full_name, is_active")
      .eq("user_id", userId)
      .single()

    if (userError || !targetUser) {
      return { success: false, error: "Usuario no encontrado" }
    }

    if (!targetUser.is_active) {
      return { success: false, error: "El usuario está inactivo" }
    }

    // Verificar que no esté ya asignado
    const { data: existingAssignment } = await supabase
      .from("condo_assignments")
      .select("id")
      .eq("condo_id", condoId)
      .eq("user_id", userId)
      .maybeSingle()

    if (existingAssignment) {
      return { success: false, error: "El usuario ya tiene acceso a este condominio" }
    }

    // Crear la asignación
    const { error: insertError } = await supabase
      .from("condo_assignments")
      .insert({
        condo_id: condoId,
        user_id: userId,
        assigned_by: user.id,
        notes: notes || null
      })

    if (insertError) {
      console.error("Error creando asignación:", insertError)
      return { success: false, error: insertError.message }
    }

    revalidatePath("/super-admin")
    revalidatePath("/dashboard")
    return { success: true, error: null }
  } catch (error) {
    console.error("Error en assignCondoToUser:", error)
    return { success: false, error: error instanceof Error ? error.message : "Error desconocido" }
  }
}

// Remover la asignación de un condominio a un usuario
export async function removeCondoAssignment(
  assignmentId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()
  
  // Verificar permisos de super admin
  if (!(await isSuperAdmin())) {
    return { success: false, error: "No tienes permisos para realizar esta acción" }
  }

  try {
    const { error } = await supabase
      .from("condo_assignments")
      .delete()
      .eq("id", assignmentId)

    if (error) {
      console.error("Error eliminando asignación:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/super-admin")
    revalidatePath("/dashboard")
    return { success: true, error: null }
  } catch (error) {
    console.error("Error en removeCondoAssignment:", error)
    return { success: false, error: error instanceof Error ? error.message : "Error desconocido" }
  }
}

// Obtener condominios accesibles para el usuario actual (propios + asignados)
export async function getAccessibleCondos(): Promise<{
  condos: any[]
  error: string | null
}> {
  const supabase = await createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { condos: [], error: "Usuario no autenticado" }
    }

    const { data, error } = await supabase
      .rpc("get_accessible_condos", { p_user_id: user.id })

    if (error) {
      console.error("Error obteniendo condominios accesibles:", error)
      return { condos: [], error: error.message }
    }

    return { condos: data || [], error: null }
  } catch (error) {
    console.error("Error en getAccessibleCondos:", error)
    return { condos: [], error: error instanceof Error ? error.message : "Error desconocido" }
  }
}

