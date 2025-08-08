"use client"

import { createClient } from "@supabase/supabase-js"

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "error" | "success"
  priority: "low" | "medium" | "high"
  read: boolean
  created_at: string
  action_url?: string
  icon?: string
}

class NotificationManager {
  private notifications: Notification[] = []
  private listeners: ((notifications: Notification[]) => void)[] = []
  private supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  private clinicId: string | null = null
  private initialized = false

  // Initialize with clinic context
  async initialize(clinicId: string) {
    if (this.initialized && this.clinicId === clinicId) return

    this.clinicId = clinicId
    this.initialized = true

    await this.loadNotifications()
    this.initializeRealtime()
  }

  private initializeRealtime() {
    if (!this.clinicId) return

    // Listen for real-time notification updates
    const channel = this.supabase
      .channel(`notifications_${this.clinicId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `clinic_id=eq.${this.clinicId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            this.notifications.unshift(payload.new as Notification)
            this.notifyListeners()
            this.showBrowserNotification(payload.new as Notification)
          } else if (payload.eventType === "UPDATE") {
            const index = this.notifications.findIndex((n) => n.id === payload.new.id)
            if (index !== -1) {
              this.notifications[index] = payload.new as Notification
              this.notifyListeners()
            }
          } else if (payload.eventType === "DELETE") {
            this.notifications = this.notifications.filter((n) => n.id !== payload.old.id)
            this.notifyListeners()
          }
        },
      )
      .subscribe()
  }

  private async loadNotifications() {
    if (!this.clinicId) return

    try {
      const { data, error } = await this.supabase
        .from("notifications")
        .select("*")
        .eq("clinic_id", this.clinicId)
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) throw error

      this.notifications = data || []
      this.notifyListeners()
    } catch (error) {
      console.error("Error loading notifications:", error)
    }
  }

  private showBrowserNotification(notification: Notification) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico",
        tag: notification.id,
      })
    }
  }

  async requestPermission() {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission()
      return permission === "granted"
    }
    return false
  }

  subscribe(callback: (notifications: Notification[]) => void) {
    this.listeners.push(callback)
    callback(this.notifications) // Send current notifications immediately

    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== callback)
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.notifications))
  }

  async markAsRead(id: string) {
    if (!this.clinicId) return

    try {
      await this.supabase.from("notifications").update({ read: true }).eq("id", id).eq("clinic_id", this.clinicId)

      const notification = this.notifications.find((n) => n.id === id)
      if (notification) {
        notification.read = true
        this.notifyListeners()
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  async markAllAsRead() {
    if (!this.clinicId) return

    try {
      await this.supabase.from("notifications").update({ read: true }).eq("read", false).eq("clinic_id", this.clinicId)

      this.notifications.forEach((n) => (n.read = true))
      this.notifyListeners()
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  async deleteNotification(id: string) {
    if (!this.clinicId) return

    try {
      await this.supabase.from("notifications").delete().eq("id", id).eq("clinic_id", this.clinicId)

      this.notifications = this.notifications.filter((n) => n.id !== id)
      this.notifyListeners()
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

  getUnreadCount() {
    return this.notifications.filter((n) => !n.read).length
  }

  getNotifications() {
    return this.notifications
  }

  // Create system notifications
  async createNotification(notification: Omit<Notification, "id" | "created_at" | "read">) {
    if (!this.clinicId) return null

    try {
      const { data, error } = await this.supabase
        .from("notifications")
        .insert({
          ...notification,
          clinic_id: this.clinicId,
          read: false,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error creating notification:", error)
      return null
    }
  }
}

export const notificationManager = new NotificationManager()

// React hook for notifications
import { useState, useEffect } from "react"
import { useClinicContext } from "./supabase-realtime"

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const clinicContext = useClinicContext()

  useEffect(() => {
    if (!clinicContext?.clinicId) return

    const initializeNotifications = async () => {
      await notificationManager.initialize(clinicContext.clinicId)

      const unsubscribe = notificationManager.subscribe((newNotifications) => {
        setNotifications(newNotifications)
        setUnreadCount(newNotifications.filter((n) => !n.read).length)
        setLoading(false)
      })

      // Request notification permission
      notificationManager.requestPermission()

      return unsubscribe
    }

    initializeNotifications()
  }, [clinicContext?.clinicId])

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead: notificationManager.markAsRead.bind(notificationManager),
    markAllAsRead: notificationManager.markAllAsRead.bind(notificationManager),
    deleteNotification: notificationManager.deleteNotification.bind(notificationManager),
  }
}
