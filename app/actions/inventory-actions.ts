"use server"

import { revalidatePath } from "next/cache"
import { Pool } from "pg"

// Use direct PostgreSQL connection for server actions
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export interface InventoryItem {
  id: string
  name: string
  category: string
  sku: string
  currentStock: number
  minimumStock: number
  unitPrice: number
  supplier: string
  expiryDate?: string
  clinicId: string
  createdAt: string
  updatedAt: string
}

export async function getAllInventoryItems(): Promise<InventoryItem[]> {
  try {
    const query = `
      SELECT 
        id,
        name,
        category,
        sku,
        current_stock as "currentStock",
        minimum_stock as "minimumStock",
        unit_price as "unitPrice",
        supplier,
        expiry_date as "expiryDate",
        clinic_id as "clinicId",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM inventory
      WHERE clinic_id = $1
      ORDER BY name ASC
    `

    const client = await pool.connect()
    try {
      const result = await client.query(query, ["ff4a1430-f7df-49b8-99bf-2240faa8d622"])
      return result.rows
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error in getAllInventoryItems:", error)
    return []
  }
}

export async function getInventoryItemById(id: string): Promise<InventoryItem | null> {
  try {
    const query = `
      SELECT 
        id,
        name,
        category,
        sku,
        current_stock as "currentStock",
        minimum_stock as "minimumStock",
        unit_price as "unitPrice",
        supplier,
        expiry_date as "expiryDate",
        clinic_id as "clinicId",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM inventory
      WHERE id = $1 AND clinic_id = $2
    `

    const client = await pool.connect()
    try {
      const result = await client.query(query, [id, "ff4a1430-f7df-49b8-99bf-2240faa8d622"])
      return result.rows[0] || null
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error in getInventoryItemById:", error)
    return null
  }
}

export async function createInventoryItem(itemData: any) {
  try {
    const query = `
      INSERT INTO inventory (
        clinic_id, name, category, sku, current_stock, 
        minimum_stock, unit_price, supplier, expiry_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `

    const client = await pool.connect()
    try {
      const result = await client.query(query, [
        "ff4a1430-f7df-49b8-99bf-2240faa8d622",
        itemData.name,
        itemData.category,
        itemData.sku,
        itemData.currentStock || 0,
        itemData.minimumStock || 0,
        itemData.unitPrice || 0,
        itemData.supplier,
        itemData.expiryDate || null
      ])
      
      revalidatePath('/inventory')
      return { success: true, id: result.rows[0].id }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error in createInventoryItem:", error)
    throw new Error("Failed to create inventory item")
  }
}

export async function updateInventoryItem(id: string, updates: any) {
  try {
    const query = `
      UPDATE inventory 
      SET 
        name = COALESCE($2, name),
        category = COALESCE($3, category),
        sku = COALESCE($4, sku),
        current_stock = COALESCE($5, current_stock),
        minimum_stock = COALESCE($6, minimum_stock),
        unit_price = COALESCE($7, unit_price),
        supplier = COALESCE($8, supplier),
        expiry_date = COALESCE($9, expiry_date),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND clinic_id = $10
      RETURNING id
    `

    const client = await pool.connect()
    try {
      const result = await client.query(query, [
        id,
        updates.name,
        updates.category,
        updates.sku,
        updates.currentStock,
        updates.minimumStock,
        updates.unitPrice,
        updates.supplier,
        updates.expiryDate,
        "ff4a1430-f7df-49b8-99bf-2240faa8d622"
      ])
      
      if (result.rows.length === 0) {
        throw new Error("Inventory item not found")
      }
      
      revalidatePath('/inventory')
      return { success: true }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error in updateInventoryItem:", error)
    throw new Error("Failed to update inventory item")
  }
}