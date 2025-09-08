"use server"

import { createClient } from "@/lib/supabase/server"

export async function recalculateCompliance(condoId: string) {
  const supabase = await createClient()

  // Get all active rules
  const { data: rules, error: rulesError } = await supabase.from("rules").select("*").eq("active", true)

  if (rulesError) {
    throw new Error("Error fetching rules")
  }

  // Clear existing alerts for this condo
  await supabase.from("alerts").delete().eq("condo_id", condoId)

  // Evaluate each rule
  for (const rule of rules) {
    let status: "open" | "ok" = "ok"
    let details: any = {}

    switch (rule.id) {
      case "ASAMBLEA-ANUAL": {
        // Check if there's an ordinary assembly in the last 365 days with act file
        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

        const { data: assemblies } = await supabase
          .from("assemblies")
          .select("*")
          .eq("condo_id", condoId)
          .eq("type", "ordinaria")
          .gte("date", oneYearAgo.toISOString().split("T")[0])
          .not("act_file_url", "is", null)

        if (!assemblies || assemblies.length === 0) {
          status = "open"
          details = { message: "No hay asamblea ordinaria en los últimos 365 días con acta adjunta" }
        }
        break
      }

      case "PLAN-EVAC-ANUAL": {
        // Check if emergency plan is updated in the last 365 days
        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

        const { data: plans } = await supabase
          .from("emergency_plans")
          .select("*")
          .eq("condo_id", condoId)
          .gte("updated_at", oneYearAgo.toISOString().split("T")[0])

        if (!plans || plans.length === 0) {
          status = "open"
          details = { message: "Plan de evacuación no actualizado en los últimos 365 días" }
        }
        break
      }

      case "SEGURO-VIGENTE": {
        // Check if there's a valid Seguro de Incendio Espacios Comunes (normative requirement)
        const today = new Date().toISOString().split("T")[0]

        const { data: incendioInsurance } = await supabase
          .from("insurances")
          .select("*")
          .eq("condo_id", condoId)
          .eq("insurance_type", "incendio-espacios-comunes")
          .gte("valid_to", today)

        if (!incendioInsurance || incendioInsurance.length === 0) {
          status = "open"
          details = { message: "No hay Seguro de Incendio Espacios Comunes vigente (requisito normativo obligatorio)" }
        }
        break
      }

      case "CERTIF-VIGENTE": {
        // Check if there's at least one valid certification
        const today = new Date().toISOString().split("T")[0]

        const { data: certifications } = await supabase
          .from("certifications")
          .select("*")
          .eq("condo_id", condoId)
          .gte("valid_to", today)

        if (!certifications || certifications.length === 0) {
          status = "open"
          details = { message: "No hay certificaciones vigentes" }
        }
        break
      }
    }

    // Insert alert
    await supabase.from("alerts").insert({
      condo_id: condoId,
      rule_id: rule.id,
      status,
      details,
    })
  }
}
