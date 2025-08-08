"use client"

import { useState } from "react"
import { FaSearch, FaTimes } from "react-icons/fa"

interface Filters {
  petName: string
  testType: string
  status: string
  dateRange: {
    from: string
    to: string
  }
}

interface LabReportsFiltersProps {
  onFilterChange: (filters: Filters) => void
}

export default function LabReportsFilters({ onFilterChange }: LabReportsFiltersProps) {
  const [filters, setFilters] = useState<Filters>({
    petName: "",
    testType: "all",
    status: "all",
    dateRange: {
      from: "",
      to: "",
    },
  })

  const handleFilterChange = (key: keyof Filters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleDateRangeChange = (key: "from" | "to", value: string) => {
    const newDateRange = { ...filters.dateRange, [key]: value }
    const newFilters = { ...filters, dateRange: newDateRange }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters: Filters = {
      petName: "",
      testType: "all",
      status: "all",
      dateRange: { from: "", to: "" },
    }
    setFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  const testTypes = [
    { value: "all", label: "All Test Types" },
    { value: "Blood Test", label: "Blood Test" },
    { value: "Urine Test", label: "Urine Test" },
    { value: "Imaging", label: "Imaging" },
    { value: "Pathology", label: "Pathology" },
    { value: "Microbiology", label: "Microbiology" },
  ]

  const statuses = [
    { value: "all", label: "All Statuses" },
    { value: "Pending", label: "Pending" },
    { value: "Completed", label: "Completed" },
    { value: "In Progress", label: "In Progress" },
  ]

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button onClick={clearFilters} className="flex items-center text-sm text-gray-500 hover:text-gray-700">
          <FaTimes className="mr-1 h-3 w-3" />
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pet/Owner Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pet or Owner Name</label>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              value={filters.petName}
              onChange={(e) => handleFilterChange("petName", e.target.value)}
              placeholder="Search pet or owner..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Test Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Test Type</label>
          <select
            value={filters.testType}
            onChange={(e) => handleFilterChange("testType", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {testTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <div className="space-y-2">
            <input
              type="date"
              value={filters.dateRange.from}
              onChange={(e) => handleDateRangeChange("from", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <input
              type="date"
              value={filters.dateRange.to}
              onChange={(e) => handleDateRangeChange("to", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
