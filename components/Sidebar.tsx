"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Users,
  FileText,
  Package,
  DollarSign,
  Settings,
  Home,
  Stethoscope,
  ClipboardList,
  TestTube,
  Shield,
  Pill,
  UserPlus,
  Clock,
  ChevronDown,
  ChevronRight,
} from "lucide-react"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  children?: NavItem[]
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Appointments", href: "/appointments", icon: Calendar, badge: 5 },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Pets", href: "/pets", icon: Stethoscope },
  { name: "EMR", href: "/emr", icon: FileText },
  { name: "Lab Reports", href: "/lab-reports", icon: TestTube },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Billing", href: "/billing", icon: DollarSign },
  { name: "Vaccines", href: "/vaccines", icon: Pill },
  { name: "OTC", href: "/otc", icon: ClipboardList },
  { name: "Compliance", href: "/compliance", icon: Shield },
  { name: "Admissions", href: "/admissions", icon: UserPlus },
  { name: "Waiting List", href: "/waiting-list", icon: Clock },
  { name: "Misc", href: "/misc", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
]

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName) ? prev.filter((name) => name !== itemName) : [...prev, itemName],
    )
  }

  const renderNavItem = (item: NavItem, depth = 0) => {
    const isActive = pathname === item.href
    const isExpanded = expandedItems.includes(item.name)
    const hasChildren = item.children && item.children.length > 0

    return (
      <div key={item.name}>
        <Link
          href={item.href}
          onClick={onClose}
          className={cn(
            "flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
            depth > 0 && "ml-4",
            isActive
              ? "bg-blue-100 text-blue-700 border-r-2 border-blue-700"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
          )}
        >
          <div className="flex items-center">
            <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-blue-700" : "text-gray-400")} />
            <span>{item.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            {item.badge && (
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">{item.badge}</span>
            )}
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault()
                  toggleExpanded(item.name)
                }}
                className="p-0 h-auto"
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </Link>
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">{item.children?.map((child) => renderNavItem(child, depth + 1))}</div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900">Vetnefits</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => renderNavItem(item))}
          </nav>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">VH</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Vetnefits Hospital</p>
                <p className="text-xs text-gray-500 truncate">Premium Plan</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
