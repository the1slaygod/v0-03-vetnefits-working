"use server"

import { Pool } from "pg"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "doctor" | "receptionist" | "technician"
  clinic_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Clinic {
  id: string
  name: string
  email: string
  phone: string
  address: string
  logo_url?: string
  settings: {
    modules: {
      patients: boolean
      appointments: boolean
      inventory: boolean
      billing: boolean
      emr: boolean
      lab_reports: boolean
      vaccines: boolean
      otc_billing: boolean
      admissions: boolean
      waiting_list: boolean
    }
    timezone: string
    currency: string
    tax_rate: number
  }
  subscription_plan: "free" | "basic" | "professional" | "enterprise"
  subscription_status: "active" | "trial" | "expired" | "cancelled"
  created_at: string
}

export interface AuthSession {
  user: User
  clinic: Clinic
  token: string
}

export async function signUp(data: {
  email: string
  password: string
  name: string
  clinicName: string
  clinicEmail: string
  clinicPhone: string
  clinicAddress: string
}) {
  try {
    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')

      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [data.email]
      )

      if (existingUser.rows.length > 0) {
        return { success: false, error: "User already exists with this email" }
      }

      // Create clinic first
      const clinicResult = await client.query(`
        INSERT INTO clinics (
          name, email, phone, address, 
          settings, subscription_plan, subscription_status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7
        ) RETURNING *
      `, [
        data.clinicName,
        data.clinicEmail,
        data.clinicPhone,
        data.clinicAddress,
        JSON.stringify({
          modules: {
            patients: true,
            appointments: true,
            inventory: true,
            billing: true,
            emr: true,
            lab_reports: false,
            vaccines: false,
            otc_billing: false,
            admissions: false,
            waiting_list: false
          },
          timezone: "America/New_York",
          currency: "USD",
          tax_rate: 0.08
        }),
        "free",
        "trial"
      ])

      const clinic = clinicResult.rows[0]

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12)

      // Create user as admin of the clinic
      const userResult = await client.query(`
        INSERT INTO users (
          email, password_hash, name, role, clinic_id, is_active
        ) VALUES (
          $1, $2, $3, $4, $5, $6
        ) RETURNING id, email, name, role, clinic_id, is_active, created_at, updated_at
      `, [
        data.email,
        hashedPassword,
        data.name,
        "admin",
        clinic.id,
        true
      ])

      const user = userResult.rows[0]

      await client.query('COMMIT')

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, clinicId: clinic.id, role: user.role },
        JWT_SECRET,
        { expiresIn: '30d' }
      )

      // Set cookie
      cookies().set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 // 30 days
      })

      return { 
        success: true, 
        data: { user, clinic, token }
      }
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error in signUp:", error)
    return { success: false, error: "Failed to create account" }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const client = await pool.connect()
    
    try {
      // Get user with clinic info
      const result = await client.query(`
        SELECT 
          u.id, u.email, u.name, u.role, u.clinic_id, u.is_active, 
          u.created_at, u.updated_at, u.password_hash,
          c.name as clinic_name, c.email as clinic_email, c.phone as clinic_phone,
          c.address as clinic_address, c.logo_url, c.settings, 
          c.subscription_plan, c.subscription_status, c.created_at as clinic_created_at
        FROM users u
        JOIN clinics c ON u.clinic_id = c.id
        WHERE u.email = $1 AND u.is_active = true
      `, [email])

      if (result.rows.length === 0) {
        return { success: false, error: "Invalid email or password" }
      }

      const userData = result.rows[0]

      // Verify password
      const isValidPassword = await bcrypt.compare(password, userData.password_hash)
      
      if (!isValidPassword) {
        return { success: false, error: "Invalid email or password" }
      }

      // Check if clinic subscription is active
      if (userData.subscription_status === 'expired' || userData.subscription_status === 'cancelled') {
        return { success: false, error: "Clinic subscription has expired. Please contact support." }
      }

      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        clinic_id: userData.clinic_id,
        is_active: userData.is_active,
        created_at: userData.created_at,
        updated_at: userData.updated_at
      }

      const clinic: Clinic = {
        id: userData.clinic_id,
        name: userData.clinic_name,
        email: userData.clinic_email,
        phone: userData.clinic_phone,
        address: userData.clinic_address,
        logo_url: userData.logo_url,
        settings: userData.settings,
        subscription_plan: userData.subscription_plan,
        subscription_status: userData.subscription_status,
        created_at: userData.clinic_created_at
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, clinicId: clinic.id, role: user.role },
        JWT_SECRET,
        { expiresIn: '30d' }
      )

      // Set cookie
      cookies().set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 // 30 days
      })

      return { 
        success: true, 
        data: { user, clinic, token }
      }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error in signIn:", error)
    return { success: false, error: "Failed to sign in" }
  }
}

export async function signOut() {
  cookies().delete('auth_token')
  redirect('/login')
}

export async function getCurrentUser(): Promise<AuthSession | null> {
  try {
    const token = cookies().get('auth_token')?.value
    
    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        SELECT 
          u.id, u.email, u.name, u.role, u.clinic_id, u.is_active, 
          u.created_at, u.updated_at,
          c.name as clinic_name, c.email as clinic_email, c.phone as clinic_phone,
          c.address as clinic_address, c.logo_url, c.settings, 
          c.subscription_plan, c.subscription_status, c.created_at as clinic_created_at
        FROM users u
        JOIN clinics c ON u.clinic_id = c.id
        WHERE u.id = $1 AND u.is_active = true
      `, [decoded.userId])

      if (result.rows.length === 0) {
        return null
      }

      const userData = result.rows[0]

      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        clinic_id: userData.clinic_id,
        is_active: userData.is_active,
        created_at: userData.created_at,
        updated_at: userData.updated_at
      }

      const clinic: Clinic = {
        id: userData.clinic_id,
        name: userData.clinic_name,
        email: userData.clinic_email,
        phone: userData.clinic_phone,
        address: userData.clinic_address,
        logo_url: userData.logo_url,
        settings: userData.settings,
        subscription_plan: userData.subscription_plan,
        subscription_status: userData.subscription_status,
        created_at: userData.clinic_created_at
      }

      return { user, clinic, token }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function updateUserRole(userId: string, role: "admin" | "doctor" | "receptionist" | "technician") {
  try {
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        UPDATE users 
        SET role = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, email, name, role, clinic_id, is_active, created_at, updated_at
      `, [role, userId])

      if (result.rows.length === 0) {
        return { success: false, error: "User not found" }
      }

      return { success: true, data: result.rows[0] }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error updating user role:", error)
    return { success: false, error: "Failed to update user role" }
  }
}

export async function deactivateUser(userId: string) {
  try {
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        UPDATE users 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, email, name, role, clinic_id, is_active, created_at, updated_at
      `, [userId])

      if (result.rows.length === 0) {
        return { success: false, error: "User not found" }
      }

      return { success: true, data: result.rows[0] }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error deactivating user:", error)
    return { success: false, error: "Failed to deactivate user" }
  }
}