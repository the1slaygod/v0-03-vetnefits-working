"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Sidebar from "./Sidebar"
import TopBar from "./TopBar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  // Handle responsive sidebar
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        setIsSidebarCollapsed(false) // Reset collapse state on mobile
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const toggleSidebar = () => {
    if (!isMobile) {
      setIsSidebarCollapsed(!isSidebarCollapsed)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <TopBar 
        onMenuToggle={toggleMobileMenu} 
        onSidebarToggle={toggleSidebar}
        isMobileMenuOpen={isMobileMenuOpen}
        isSidebarCollapsed={isSidebarCollapsed}
        isMobile={isMobile}
      />

      <div className="flex h-screen pt-16">
        {/* Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          isMobile={isMobile}
          mobileMenuOpen={isMobileMenuOpen}
          onMobileMenuClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Mobile overlay */}
        {isMobile && isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main 
          className={`
            flex-1 overflow-x-hidden overflow-y-auto bg-gray-50
            transition-all duration-300
            ${isMobile ? 'ml-0' : isSidebarCollapsed ? 'ml-16' : 'ml-64'}
          `}
        >
          <div className="p-4 lg:p-6">
            <div className="max-w-full">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}
