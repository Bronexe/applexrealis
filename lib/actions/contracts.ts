"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createContract(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  const contractData = {
    condo_id: formData.get("condo_id") as string,
    user_id: user.id,
    contract_number: formData.get("contract_number") as string,
    contract_type: formData.get("contract_type") as string,
    start_date: formData.get("start_date") as string,
    end_date: formData.get("end_date") as string || null,
    duration_type: formData.get("duration_type") as string,
    currency: formData.get("currency") as string,
    total_amount: parseFloat(formData.get("total_amount") as string),
    tax_amount: parseFloat(formData.get("tax_amount") as string) || 0,
    net_amount: parseFloat(formData.get("net_amount") as string) || parseFloat(formData.get("total_amount") as string),
    payment_method: formData.get("payment_method") as string,
    provider_name: formData.get("provider_name") as string,
    provider_rut: formData.get("provider_rut") as string,
    provider_address: formData.get("provider_address") as string || null,
    provider_phone: formData.get("provider_phone") as string || null,
    provider_email: formData.get("provider_email") as string || null,
    status: formData.get("status") as string,
    contract_file_url: formData.get("contract_file_url") as string || null,
  }

  const { data, error } = await supabase
    .from("contracts")
    .insert([contractData])
    .select()

  if (error) {
    throw new Error(`Error al crear el contrato: ${error.message}`)
  }

  revalidatePath(`/condos/${contractData.condo_id}/contratos`)
  return data[0]
}

export async function updateContract(contractId: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  const contractData = {
    contract_number: formData.get("contract_number") as string,
    contract_type: formData.get("contract_type") as string,
    start_date: formData.get("start_date") as string,
    end_date: formData.get("end_date") as string || null,
    duration_type: formData.get("duration_type") as string,
    currency: formData.get("currency") as string,
    total_amount: parseFloat(formData.get("total_amount") as string),
    tax_amount: parseFloat(formData.get("tax_amount") as string) || 0,
    net_amount: parseFloat(formData.get("net_amount") as string) || parseFloat(formData.get("total_amount") as string),
    payment_method: formData.get("payment_method") as string,
    provider_name: formData.get("provider_name") as string,
    provider_rut: formData.get("provider_rut") as string,
    provider_address: formData.get("provider_address") as string || null,
    provider_phone: formData.get("provider_phone") as string || null,
    provider_email: formData.get("provider_email") as string || null,
    status: formData.get("status") as string,
    contract_file_url: formData.get("contract_file_url") as string || null,
  }

  const { data, error } = await supabase
    .from("contracts")
    .update(contractData)
    .eq("id", contractId)
    .select()

  if (error) {
    throw new Error(`Error al actualizar el contrato: ${error.message}`)
  }

  revalidatePath(`/condos/${data[0].condo_id}/contratos`)
  revalidatePath(`/condos/${data[0].condo_id}/contratos/${contractId}`)
  return data[0]
}

export async function deleteContract(contractId: string) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  // Obtener el condo_id antes de eliminar
  const { data: contract, error: fetchError } = await supabase
    .from("contracts")
    .select("condo_id")
    .eq("id", contractId)
    .single()

  if (fetchError) {
    throw new Error(`Error al obtener el contrato: ${fetchError.message}`)
  }

  const { error } = await supabase
    .from("contracts")
    .delete()
    .eq("id", contractId)

  if (error) {
    throw new Error(`Error al eliminar el contrato: ${error.message}`)
  }

  revalidatePath(`/condos/${contract.condo_id}/contratos`)
}

export async function getContract(contractId: string) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("id", contractId)
    .single()

  if (error) {
    throw new Error(`Error al obtener el contrato: ${error.message}`)
  }

  return data
}

export async function getContractsByCondo(condoId: string) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("condo_id", condoId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`Error al obtener los contratos: ${error.message}`)
  }

  return data
}

export async function generateContractNumber() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  try {
    const { data, error } = await supabase.rpc('generate_contract_number')

    if (error) {
      // Si la función no existe, generar un número local
      const timestamp = Date.now()
      const randomNum = Math.floor(Math.random() * 1000)
      const localNumber = `CON-${String(timestamp).slice(-4)}${String(randomNum).padStart(2, '0')}`
      return localNumber
    }

    return data
  } catch (error) {
    // Fallback: generar número local
    const timestamp = Date.now()
    const randomNum = Math.floor(Math.random() * 1000)
    const localNumber = `CON-${String(timestamp).slice(-4)}${String(randomNum).padStart(2, '0')}`
    return localNumber
  }
}
