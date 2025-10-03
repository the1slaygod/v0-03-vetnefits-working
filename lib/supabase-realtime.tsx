"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface ClinicSettings {
  clinicName: string
  clinicLogo: string
  address: string
  phone: string
  email: string
  modules: {
    vaccines: boolean
    otc_billing: boolean
    compliance: boolean
  }
}

interface ClinicContextType extends ClinicSettings {
  updateClinicSettings: (settings: Partial<ClinicSettings>) => void
  loading: boolean
}

const ClinicContext = createContext<ClinicContextType | null>(null)

export function ClinicProvider({ children }: { children: ReactNode }) {
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings>({
    clinicName: "Vetnefits Animal Hospital",
    clinicLogo: "/placeholder-logo.png",
    address: "123 Pet Street, Animal City, AC 12345",
    phone: "+91 98765 43210",
    email: "admin@vetnefits.com",
    modules: {
      vaccines: true,
      otc_billing: true,
      compliance: true,
    },
  })
  const [loading, setLoading] = useState(false)

  const updateClinicSettings = (newSettings: Partial<ClinicSettings>) => {
    setClinicSettings((prev) => ({
      ...prev,
      ...newSettings,
    }))
  }

  const contextValue: ClinicContextType = {
    ...clinicSettings,
    updateClinicSettings,
    loading,
  }

  return <ClinicContext.Provider value={contextValue}>{children}</ClinicContext.Provider>
}

export function useClinicContext() {
  const context = useContext(ClinicContext)
  if (!context) {
    throw new Error("useClinicContext must be used within a ClinicProvider")
  }
  return context
}
