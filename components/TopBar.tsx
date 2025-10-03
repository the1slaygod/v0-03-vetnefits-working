"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Search, Settings, User, Menu, X } from "lucide-react"
import Image from "next/image"

interface TopBarProps {
  onMenuClick: () => void
  isSidebarOpen: boolean
}

export default function TopBar({ onMenuClick, isSidebarOpen }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      {/* Left section */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        <div className="hidden lg:flex items-center space-x-2">
          <Image src="/placeholder-logo.png" alt="Vetnefits Logo" width={32} height={32} className="rounded" />
          <h1 className="text-xl font-bold text-gray-900">Vetnefits</h1>
        </div>
      </div>

      {/* Center section - Search */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search patients, appointments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 w-full"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            3
          </span>
        </Button>

        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>

        <div className="flex items-center space-x-2 pl-2 border-l border-gray-200">
          <Image src="/placeholder-user.jpg" alt="User Avatar" width={32} height={32} className="rounded-full" />
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900">Dr. Sarah Johnson</p>
            <p className="text-xs text-gray-500">Veterinarian</p>
          </div>
          <Button variant="ghost" size="icon">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
