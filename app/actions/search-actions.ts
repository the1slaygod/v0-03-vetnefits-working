"use server"

import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export interface SearchResult {
  id: string
  type: "patient" | "appointment" | "inventory" | "billing" | "emr" | "admission"
  title: string
  subtitle: string
  description: string
  url: string
  relevance: number
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) {
    return []
  }

  const searchTerm = `%${query.trim().toLowerCase()}%`
  const results: SearchResult[] = []

  try {
    const client = await pool.connect()
    
    try {
      // Search patients and pets
      const patientsQuery = `
        SELECT 
          p.id,
          p.name as patient_name,
          p.phone,
          p.email,
          pt.name as pet_name,
          pt.species,
          pt.breed
        FROM patients p
        LEFT JOIN pets pt ON p.id = pt.patient_id
        WHERE 
          p.clinic_id = $1 AND (
            LOWER(p.name) LIKE $2 OR
            LOWER(p.phone) LIKE $2 OR
            LOWER(p.email) LIKE $2 OR
            LOWER(pt.name) LIKE $2 OR
            LOWER(pt.species) LIKE $2 OR
            LOWER(pt.breed) LIKE $2
          )
        LIMIT 10
      `
      
      const patientResults = await client.query(patientsQuery, [
        "ff4a1430-f7df-49b8-99bf-2240faa8d622",
        searchTerm
      ])
      
      patientResults.rows.forEach(row => {
        results.push({
          id: row.id,
          type: "patient",
          title: row.patient_name,
          subtitle: row.pet_name ? `Pet: ${row.pet_name}` : "Patient",
          description: `${row.phone || ''} ${row.email || ''} ${row.species ? `• ${row.species}` : ''}`,
          url: `/patients/${row.id}`,
          relevance: 1.0
        })
      })

      // Search appointments
      const appointmentsQuery = `
        SELECT 
          a.id,
          p.name as patient_name,
          pt.name as pet_name,
          a.appointment_type,
          a.appointment_date,
          a.status,
          a.reason
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN pets pt ON a.pet_id = pt.id
        WHERE 
          a.clinic_id = $1 AND (
            LOWER(p.name) LIKE $2 OR
            LOWER(pt.name) LIKE $2 OR
            LOWER(a.appointment_type) LIKE $2 OR
            LOWER(a.reason) LIKE $2 OR
            LOWER(a.status) LIKE $2
          )
        ORDER BY a.appointment_date DESC
        LIMIT 10
      `
      
      const appointmentResults = await client.query(appointmentsQuery, [
        "ff4a1430-f7df-49b8-99bf-2240faa8d622",
        searchTerm
      ])
      
      appointmentResults.rows.forEach(row => {
        results.push({
          id: row.id,
          type: "appointment",
          title: `${row.patient_name} - ${row.pet_name}`,
          subtitle: `Appointment: ${row.appointment_type}`,
          description: `${new Date(row.appointment_date).toLocaleDateString()} • ${row.status} • ${row.reason}`,
          url: `/appointments?id=${row.id}`,
          relevance: 0.9
        })
      })

      // Search inventory
      const inventoryQuery = `
        SELECT 
          id,
          name,
          category,
          sku,
          supplier,
          current_stock,
          minimum_stock
        FROM inventory
        WHERE 
          clinic_id = $1 AND (
            LOWER(name) LIKE $2 OR
            LOWER(category) LIKE $2 OR
            LOWER(sku) LIKE $2 OR
            LOWER(supplier) LIKE $2
          )
        LIMIT 10
      `
      
      const inventoryResults = await client.query(inventoryQuery, [
        "ff4a1430-f7df-49b8-99bf-2240faa8d622",
        searchTerm
      ])
      
      inventoryResults.rows.forEach(row => {
        const stockStatus = row.current_stock <= row.minimum_stock ? "Low Stock" : "In Stock"
        results.push({
          id: row.id,
          type: "inventory",
          title: row.name,
          subtitle: `${row.category} • SKU: ${row.sku}`,
          description: `${row.supplier} • Stock: ${row.current_stock} • ${stockStatus}`,
          url: `/inventory?search=${row.sku}`,
          relevance: 0.8
        })
      })

      // Search billing (if billing records exist)
      const billingQuery = `
        SELECT 
          b.id,
          b.invoice_number,
          p.name as patient_name,
          pt.name as pet_name,
          b.total_amount,
          b.payment_status,
          b.invoice_date
        FROM billing b
        JOIN patients p ON b.patient_id = p.id
        LEFT JOIN pets pt ON b.pet_id = pt.id
        WHERE 
          b.clinic_id = $1 AND (
            LOWER(p.name) LIKE $2 OR
            LOWER(pt.name) LIKE $2 OR
            LOWER(b.invoice_number) LIKE $2 OR
            LOWER(b.payment_status) LIKE $2
          )
        ORDER BY b.invoice_date DESC
        LIMIT 10
      `
      
      const billingResults = await client.query(billingQuery, [
        "ff4a1430-f7df-49b8-99bf-2240faa8d622",
        searchTerm
      ])
      
      billingResults.rows.forEach(row => {
        results.push({
          id: row.id,
          type: "billing",
          title: `Invoice ${row.invoice_number}`,
          subtitle: `${row.patient_name}${row.pet_name ? ` - ${row.pet_name}` : ''}`,
          description: `$${parseFloat(row.total_amount).toFixed(2)} • ${row.payment_status} • ${new Date(row.invoice_date).toLocaleDateString()}`,
          url: `/billing?invoice=${row.id}`,
          relevance: 0.7
        })
      })

    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error in globalSearch:", error)
  }

  // Sort by relevance and return
  return results.sort((a, b) => b.relevance - a.relevance)
}