"use server"

import { Pool } from "pg"
import { revalidatePath } from "next/cache"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export interface BillingRecord {
  id: string
  patient_id: string
  pet_id?: string
  appointment_id?: string
  emr_id?: string
  invoice_number: string
  invoice_date: string
  due_date: string
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  payment_status: "unpaid" | "partial" | "paid" | "overdue"
  payment_method?: string
  payment_date?: string
  notes?: string
  clinic_id: string
  created_at: string
  updated_at: string
}

export interface BillingLineItem {
  id: string
  billing_id: string
  item_type: "service" | "medication" | "supply" | "procedure"
  item_id?: string
  description: string
  quantity: number
  unit_price: number
  total_price: number
}

export async function createBillingRecord(data: {
  patient_id: string
  pet_id?: string
  appointment_id?: string
  emr_id?: string
  line_items: Omit<BillingLineItem, 'id' | 'billing_id'>[]
  discount_amount?: number
  tax_rate?: number
  payment_method?: string
  notes?: string
}) {
  try {
    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')

      // Calculate totals
      const subtotal = data.line_items.reduce((sum, item) => sum + item.total_price, 0)
      const tax_amount = subtotal * (data.tax_rate || 0.08) // Default 8% tax
      const discount_amount = data.discount_amount || 0
      const total_amount = subtotal + tax_amount - discount_amount

      // Generate invoice number
      const invoiceResult = await client.query(`
        SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 4) AS INTEGER)), 0) + 1 as next_num
        FROM billing 
        WHERE clinic_id = $1 AND invoice_number LIKE 'INV%'
      `, ["ff4a1430-f7df-49b8-99bf-2240faa8d622"])
      
      const invoice_number = `INV${invoiceResult.rows[0].next_num.toString().padStart(5, '0')}`

      // Create billing record
      const billingResult = await client.query(`
        INSERT INTO billing (
          patient_id, pet_id, appointment_id, emr_id, invoice_number,
          invoice_date, due_date, subtotal, tax_amount, discount_amount, total_amount,
          payment_status, payment_method, notes, clinic_id
        ) VALUES (
          $1, $2, $3, $4, $5, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days',
          $6, $7, $8, $9, $10, $11, $12, $13
        ) RETURNING *
      `, [
        data.patient_id,
        data.pet_id,
        data.appointment_id,
        data.emr_id,
        invoice_number,
        subtotal,
        tax_amount,
        discount_amount,
        total_amount,
        total_amount === 0 ? 'paid' : 'unpaid',
        data.payment_method,
        data.notes,
        "ff4a1430-f7df-49b8-99bf-2240faa8d622"
      ])

      const billing_id = billingResult.rows[0].id

      // Create line items
      for (const item of data.line_items) {
        await client.query(`
          INSERT INTO billing_line_items (
            billing_id, item_type, item_id, description, quantity, unit_price, total_price
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          billing_id,
          item.item_type,
          item.item_id,
          item.description,
          item.quantity,
          item.unit_price,
          item.total_price
        ])

        // If it's a medication or supply, deduct from inventory
        if (item.item_type === 'medication' || item.item_type === 'supply') {
          if (item.item_id) {
            await client.query(`
              UPDATE inventory 
              SET current_stock = current_stock - $1,
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = $2 AND clinic_id = $3 AND current_stock >= $1
            `, [item.quantity, item.item_id, "ff4a1430-f7df-49b8-99bf-2240faa8d622"])
          }
        }
      }

      await client.query('COMMIT')
      
      revalidatePath("/billing")
      revalidatePath("/inventory")
      return { success: true, data: billingResult.rows[0] }
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error creating billing record:", error)
    return { success: false, error: "Failed to create billing record" }
  }
}

export async function getBillingRecords(patientId?: string, status?: string) {
  try {
    const client = await pool.connect()
    
    try {
      let query = `
        SELECT 
          b.*,
          p.name as patient_name,
          p.phone as patient_phone,
          p.email as patient_email,
          pt.name as pet_name,
          pt.species
        FROM billing b
        JOIN patients p ON b.patient_id = p.id
        LEFT JOIN pets pt ON b.pet_id = pt.id
        WHERE b.clinic_id = $1
      `
      
      const params = ["ff4a1430-f7df-49b8-99bf-2240faa8d622"]
      
      if (patientId) {
        query += ` AND b.patient_id = $${params.length + 1}`
        params.push(patientId)
      }
      
      if (status) {
        query += ` AND b.payment_status = $${params.length + 1}`
        params.push(status)
      }
      
      query += ` ORDER BY b.invoice_date DESC, b.created_at DESC`
      
      const result = await client.query(query, params)
      return result.rows.map(row => ({
        ...row,
        subtotal: parseFloat(row.subtotal),
        tax_amount: parseFloat(row.tax_amount),
        discount_amount: parseFloat(row.discount_amount),
        total_amount: parseFloat(row.total_amount)
      }))
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error fetching billing records:", error)
    return []
  }
}

export async function getBillingRecord(id: string) {
  try {
    const client = await pool.connect()
    
    try {
      // Get billing record
      const billingResult = await client.query(`
        SELECT 
          b.*,
          p.name as patient_name,
          p.phone as patient_phone,
          p.email as patient_email,
          p.address as patient_address,
          pt.name as pet_name,
          pt.species,
          pt.breed
        FROM billing b
        JOIN patients p ON b.patient_id = p.id
        LEFT JOIN pets pt ON b.pet_id = pt.id
        WHERE b.id = $1 AND b.clinic_id = $2
      `, [id, "ff4a1430-f7df-49b8-99bf-2240faa8d622"])

      if (billingResult.rows.length === 0) {
        return null
      }

      const billing = billingResult.rows[0]
      
      // Get line items
      const lineItemsResult = await client.query(`
        SELECT * FROM billing_line_items 
        WHERE billing_id = $1 
        ORDER BY id
      `, [id])

      return {
        ...billing,
        subtotal: parseFloat(billing.subtotal),
        tax_amount: parseFloat(billing.tax_amount),
        discount_amount: parseFloat(billing.discount_amount),
        total_amount: parseFloat(billing.total_amount),
        line_items: lineItemsResult.rows.map(item => ({
          ...item,
          unit_price: parseFloat(item.unit_price),
          total_price: parseFloat(item.total_price)
        }))
      }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error fetching billing record:", error)
    return null
  }
}

export async function updatePaymentStatus(id: string, status: string, payment_method?: string, payment_date?: string) {
  try {
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        UPDATE billing 
        SET payment_status = $1, 
            payment_method = $2, 
            payment_date = $3,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4 AND clinic_id = $5
        RETURNING *
      `, [
        status,
        payment_method,
        payment_date || (status === 'paid' ? new Date().toISOString() : null),
        id,
        "ff4a1430-f7df-49b8-99bf-2240faa8d622"
      ])

      if (result.rows.length === 0) {
        return { success: false, error: "Billing record not found" }
      }

      revalidatePath("/billing")
      return { success: true, data: result.rows[0] }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error updating payment status:", error)
    return { success: false, error: "Failed to update payment status" }
  }
}