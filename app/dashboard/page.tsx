"use client"

import { useState, useEffect } from "react"
import { useClinicContext } from "@/lib/supabase-realtime"
import {
  FaPaw,
  FaCalendarAlt,
  FaBoxes,
  FaFileInvoice,
  FaClock,
  FaRupeeSign,
  FaSyringe,
  FaExclamationTriangle,
  FaBed,
  FaChartLine,
} from "react-icons/fa"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface DashboardStats {
  totalPets: number
  upcomingAppointments: number
  lowStockItems: number
  pendingInvoices: number
  todayRevenue: number
  overdueVaccines: number
  activeAdmissions: number
  waitingPatients: number
  todayOTCSales: number
  monthlyRevenue: number
}

interface RecentActivity {
  id: string
  type: "appointment" | "patient" | "inventory" | "billing" | "vaccine" | "admission"
  message: string
  timestamp: string
  priority?: "high" | "medium" | "low"
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPets: 0,
    upcomingAppointments: 0,
    lowStockItems: 0,
    pendingInvoices: 0,
    todayRevenue: 0,
    overdueVaccines: 0,
    activeAdmissions: 0,
    waitingPatients: 0,
    todayOTCSales: 0,
    monthlyRevenue: 0,
  })

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const clinicContext = useClinicContext()

  // Format currency to INR
  const formatINR = (amount: number) => {
    return amount.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  }

  // Mock data for now since we're focusing on layout
  useEffect(() => {
    const loadMockData = () => {
      setStats({
        totalPets: 156,
        upcomingAppointments: 12,
        lowStockItems: 3,
        pendingInvoices: 8,
        todayRevenue: 15420,
        overdueVaccines: 2,
        activeAdmissions: 5,
        waitingPatients: 4,
        todayOTCSales: 2340,
        monthlyRevenue: 245600,
      })

      setRecentActivity([
        {
          id: "1",
          type: "appointment",
          message: "New appointment scheduled for Buddy with Dr. Sarah Wilson",
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          priority: "medium",
        },
        {
          id: "2",
          type: "inventory",
          message: "Low stock alert: Heartworm medication (5 units remaining)",
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          priority: "high",
        },
        {
          id: "3",
          type: "billing",
          message: "Payment received from John Smith - ₹2,500",
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          priority: "low",
        },
        {
          id: "4",
          type: "vaccine",
          message: "Vaccination reminder: Max needs rabies booster",
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          priority: "medium",
        },
        {
          id: "5",
          type: "admission",
          message: "Luna admitted for overnight observation",
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          priority: "high",
        },
      ])

      setLoading(false)
    }

    loadMockData()
  }, [clinicContext])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return FaCalendarAlt
      case "patient":
        return FaPaw
      case "inventory":
        return FaBoxes
      case "billing":
        return FaFileInvoice
      case "vaccine":
        return FaSyringe
      case "admission":
        return FaBed
      default:
        return FaClock
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const statCards = [
    {
      title: "Total Pets",
      value: stats.totalPets.toLocaleString(),
      icon: FaPaw,
      color: "bg-blue-500",
      link: "/patients",
      change: "+12%",
    },
    {
      title: "Today's Appointments",
      value: stats.upcomingAppointments.toLocaleString(),
      icon: FaCalendarAlt,
      color: "bg-green-500",
      link: "/appointments",
      change: "+5%",
    },
    {
      title: "Today's Revenue",
      value: formatINR(stats.todayRevenue + stats.todayOTCSales),
      icon: FaRupeeSign,
      color: "bg-purple-500",
      link: "/billing",
      change: "+18%",
      isAmount: true,
    },
    {
      title: "Active Admissions",
      value: stats.activeAdmissions.toLocaleString(),
      icon: FaBed,
      color: "bg-orange-500",
      link: "/admissions",
      change: "+2%",
    },
    {
      title: "Low Stock Items",
      value: stats.lowStockItems.toLocaleString(),
      icon: FaBoxes,
      color: stats.lowStockItems > 5 ? "bg-red-500" : "bg-yellow-500",
      link: "/inventory",
      urgent: stats.lowStockItems > 5,
    },
    {
      title: "Overdue Vaccines",
      value: stats.overdueVaccines.toLocaleString(),
      icon: FaSyringe,
      color: stats.overdueVaccines > 0 ? "bg-red-500" : "bg-green-500",
      link: "/vaccines",
      urgent: stats.overdueVaccines > 0,
    },
    {
      title: "Waiting Patients",
      value: stats.waitingPatients.toLocaleString(),
      icon: FaClock,
      color: "bg-indigo-500",
      link: "/waiting-list",
      change: "-3%",
    },
    {
      title: "Monthly Revenue",
      value: formatINR(stats.monthlyRevenue),
      icon: FaChartLine,
      color: "bg-pink-500",
      link: "/billing",
      change: "+15%",
      isAmount: true,
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white rounded-lg p-6 shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back to {clinicContext?.clinicName || "Vetnefits"}!</p>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <FaExclamationTriangle className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="font-medium text-red-800">Error Loading Dashboard</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 bg-transparent"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, Dr. Sarah Wilson!</h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening at {clinicContext?.clinicName || "Vetnefits"} today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <Link key={index} href={card.link} className="group">
            <Card className="hover:shadow-lg transition-all duration-200 group-hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${card.color} relative`}>
                      <card.icon className="h-6 w-6 text-white" />
                      {card.urgent && (
                        <div className="absolute -top-1 -right-1">
                          <FaExclamationTriangle className="h-4 w-4 text-red-500 animate-pulse" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">{card.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                      {card.change && (
                        <p className={`text-xs ${card.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                          {card.change} from last week
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FaClock className="mr-2 h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((activity) => {
                const ActivityIcon = getActivityIcon(activity.type)
                return (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div
                        className={`p-2 rounded-full ${
                          activity.priority === "high"
                            ? "bg-red-100"
                            : activity.priority === "medium"
                              ? "bg-yellow-100"
                              : "bg-gray-100"
                        }`}
                      >
                        <ActivityIcon
                          className={`h-4 w-4 ${
                            activity.priority === "high"
                              ? "text-red-600"
                              : activity.priority === "medium"
                                ? "text-yellow-600"
                                : "text-gray-600"
                          }`}
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <div className="flex items-center mt-1 space-x-2">
                        <p className="text-xs text-gray-500 flex items-center">
                          <FaClock className="h-3 w-3 mr-1" />
                          {formatTimeAgo(activity.timestamp)}
                        </p>
                        {activity.priority === "high" && (
                          <Badge variant="destructive" className="text-xs">
                            Urgent
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FaClock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
