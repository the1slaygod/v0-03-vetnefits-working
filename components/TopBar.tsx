"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FaBell, FaUser, FaSearch, FaBars, FaTimes, FaAngleLeft, FaAngleRight } from "react-icons/fa"
import { useClinicContext } from "@/lib/supabase-realtime"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface TopBarProps {
  onMenuToggle: () => void
  onSidebarToggle?: () => void
  isMobileMenuOpen: boolean
  isSidebarCollapsed?: boolean
  isMobile?: boolean
}

export default function TopBar({ onMenuToggle, onSidebarToggle, isMobileMenuOpen, isSidebarCollapsed = false, isMobile = false }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const clinicContext = useClinicContext()
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/patients?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
    }
  }

  const handleLogout = () => {
    // Clear any stored auth data
    localStorage.removeItem("clinic_session")
    router.push("/")
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section - Menu Toggles */}
        <div className="flex items-center space-x-2">
          {/* Mobile Menu Toggle */}
          <Button variant="ghost" size="sm" onClick={onMenuToggle} className="lg:hidden">
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </Button>
          
          {/* Desktop Sidebar Toggle */}
          {!isMobile && onSidebarToggle && (
            <Button variant="ghost" size="sm" onClick={onSidebarToggle} className="hidden lg:flex">
              {isSidebarCollapsed ? <FaAngleRight /> : <FaAngleLeft />}
            </Button>
          )}

          {/* Clinic Logo and Name - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-3">
            <img
              src={clinicContext?.clinicLogo || "/images/clinic-logo.png"}
              alt="Clinic Logo"
              className="h-8 w-8 rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg?height=32&width=32&text=Logo"
              }}
            />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{clinicContext?.clinicName || "Vetnefits"}</h1>
            </div>
          </div>
        </div>

        {/* Center Section - Search Bar */}
        <div className="flex-1 max-w-md mx-4">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search patients, pets, or records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>
        </div>

        {/* Right Section - Notifications and User Menu */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <FaBell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <DropdownMenuItem className="p-4 border-b">
                  <div>
                    <p className="font-medium text-sm">Appointment Reminder</p>
                    <p className="text-xs text-gray-600">Buddy's checkup at 2:00 PM</p>
                    <p className="text-xs text-gray-400">5 minutes ago</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-4 border-b">
                  <div>
                    <p className="font-medium text-sm">Low Stock Alert</p>
                    <p className="text-xs text-gray-600">Rabies vaccine running low</p>
                    <p className="text-xs text-gray-400">1 hour ago</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-4">
                  <div>
                    <p className="font-medium text-sm">New Patient Registered</p>
                    <p className="text-xs text-gray-600">Max (Golden Retriever) added</p>
                    <p className="text-xs text-gray-400">2 hours ago</p>
                  </div>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <FaUser className="w-4 h-4 text-gray-600" />
                <span className="hidden md:inline text-sm text-gray-700">Dr. Admin</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push("/profile")}>Profile Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings")}>Clinic Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
