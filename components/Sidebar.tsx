"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useClinicContext } from "@/lib/supabase-realtime"
import {
  FaTachometerAlt,
  FaPaw,
  FaCalendarAlt,
  FaBoxes,
  FaFileInvoiceDollar,
  FaBed,
  FaFlask,
  FaSyringe,
  FaShoppingCart,
  FaClock,
  FaClipboardCheck,
  FaStickyNote,
  FaCog,
  FaChevronDown,
  FaChevronRight,
  FaTimes,
} from "react-icons/fa"

interface SidebarProps {
  isCollapsed: boolean
  isMobile: boolean
  mobileMenuOpen: boolean
  onMobileMenuClose: () => void
}

interface MenuItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  children?: MenuItem[]
}

export default function Sidebar({ isCollapsed, isMobile, mobileMenuOpen, onMobileMenuClose }: SidebarProps) {
  const pathname = usePathname()
  const clinicContext = useClinicContext()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName) ? prev.filter((item) => item !== itemName) : [...prev, itemName],
    )
  }

  const menuItems: MenuItem[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: FaTachometerAlt,
    },
    {
      name: "Patients",
      href: "/patients",
      icon: FaPaw,
    },
    {
      name: "Appointments",
      href: "/appointments",
      icon: FaCalendarAlt,
    },
    {
      name: "EMR",
      href: "/emr",
      icon: FaFlask,
    },
    {
      name: "Admissions",
      href: "/admissions",
      icon: FaBed,
    },
    {
      name: "Inventory",
      href: "/inventory",
      icon: FaBoxes,
    },
    {
      name: "Billing",
      href: "/billing",
      icon: FaFileInvoiceDollar,
    },
    {
      name: "Lab Reports",
      href: "/lab-reports",
      icon: FaFlask,
    },
    ...(clinicContext?.modules?.vaccines
      ? [
          {
            name: "Vaccines",
            href: "/vaccines",
            icon: FaSyringe,
          },
        ]
      : []),
    ...(clinicContext?.modules?.otc_billing
      ? [
          {
            name: "OTC Sales",
            href: "/otc",
            icon: FaShoppingCart,
          },
        ]
      : []),
    {
      name: "Waiting List",
      href: "/waiting-list",
      icon: FaClock,
    },
    ...(clinicContext?.modules?.compliance
      ? [
          {
            name: "Compliance",
            href: "/compliance",
            icon: FaClipboardCheck,
          },
        ]
      : []),
    {
      name: "Miscellaneous",
      href: "/misc",
      icon: FaStickyNote,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: FaCog,
    },
  ]

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname.startsWith(href)
  }

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.name)
    const active = isActive(item.href)

    return (
      <div key={item.name}>
        <div
          className={`
            flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors
            ${active ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"}
            ${isCollapsed && !isMobile ? "justify-center" : ""}
            ${level > 0 ? "ml-4" : ""}
          `}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleExpanded(item.name)}
              className="flex items-center w-full"
              disabled={isCollapsed && !isMobile}
            >
              <item.icon className={`${isCollapsed && !isMobile ? "h-5 w-5" : "h-4 w-4 mr-3"}`} />
              {(!isCollapsed || isMobile) && (
                <>
                  <span className="flex-1 text-left">{item.name}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-2">{item.badge}</span>
                  )}
                  {isExpanded ? (
                    <FaChevronDown className="h-3 w-3 ml-2" />
                  ) : (
                    <FaChevronRight className="h-3 w-3 ml-2" />
                  )}
                </>
              )}
            </button>
          ) : (
            <Link
              href={item.href}
              onClick={isMobile ? onMobileMenuClose : undefined}
              className="flex items-center w-full"
            >
              <item.icon className={`${isCollapsed && !isMobile ? "h-5 w-5" : "h-4 w-4 mr-3"}`} />
              {(!isCollapsed || isMobile) && (
                <>
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-2">{item.badge}</span>
                  )}
                </>
              )}
            </Link>
          )}
        </div>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (!isCollapsed || isMobile) && (
          <div className="ml-4 mt-1 space-y-1">{item.children!.map((child) => renderMenuItem(child, level + 1))}</div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 z-30 transition-all duration-300 overflow-hidden
          ${isMobile ? "hidden" : "block"}
          ${isCollapsed ? "w-16" : "w-64"}
        `}
      >
        <div className="p-4 h-full overflow-y-auto overflow-x-hidden">
          <nav className="space-y-2">{menuItems.map((item) => renderMenuItem(item))}</nav>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 z-50 transition-transform duration-300 overflow-hidden
          ${isMobile ? "block" : "hidden"}
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button onClick={onMobileMenuClose} className="p-2 rounded-md hover:bg-gray-100">
            <FaTimes className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 h-full overflow-y-auto overflow-x-hidden">
          <nav className="space-y-2">{menuItems.map((item) => renderMenuItem(item))}</nav>
        </div>
      </aside>
    </>
  )
}
