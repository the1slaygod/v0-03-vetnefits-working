"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { ClinicProvider } from "@/lib/supabase-realtime"
import DashboardLayout from "./DashboardLayout"

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()

  // Auth pages that should not use dashboard layout
  const authPages = ["/", "/login", "/signup"]
  const isAuthPage = authPages.includes(pathname)

  if (isAuthPage) {
    return <>{children}</>
  }

  // All other pages use dashboard layout with clinic context
  return (
    <ClinicProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </ClinicProvider>
  )
}
