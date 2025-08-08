"use client"

import { useState } from "react"
import { FaPlus, FaFilter, FaShare, FaEye } from "react-icons/fa"

// Import components
import LabReportsFilters from "@/components/lab-reports/LabReportsFilters"
import ReportsList from "@/components/lab-reports/ReportsList"
import UploadReportModal from "@/components/lab-reports/UploadReportModal"
import AddTestResultModal from "@/components/lab-reports/AddTestResultModal"
import ViewReportModal from "@/components/lab-reports/ViewReportModal"
import ShareReportModal from "@/components/lab-reports/ShareReportModal"

// Types
interface Report {
  id: string
  petId: string
  petName: string
  ownerName: string
  testType: string
  subType: string
  date: string
  status: string
  reportType: string
  results?: Record<string, any>
  doctorName: string
  shared: boolean
  sharedVia: string[]
  fileName?: string
  appointmentId?: string
  notes?: string
}

interface Filters {
  petName: string
  testType: string
  status: string
  dateRange: {
    from: string
    to: string
  }
}

// Mock data
const mockReports: Report[] = [
  {
    id: "RPT001",
    petId: "PET001",
    petName: "Max",
    ownerName: "John Smith",
    testType: "Blood Test",
    subType: "CBC",
    date: "2024-01-15",
    status: "Completed",
    reportType: "structured",
    results: {
      wbc: { value: 7.2, unit: "K/μL", range: "5.0-15.0", status: "normal" },
      rbc: { value: 6.8, unit: "M/μL", range: "5.5-8.5", status: "normal" },
      platelets: { value: 350, unit: "K/μL", range: "200-500", status: "normal" },
    },
    doctorName: "Dr. Smith",
    shared: true,
    sharedVia: ["email"],
  },
]

export default function LabReportsPage() {
  const [reports, setReports] = useState<Report[]>(mockReports)
  const [filteredReports, setFilteredReports] = useState<Report[]>(mockReports)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showAddTestModal, setShowAddTestModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const handleFilterChange = (filters: Filters) => {
    let filtered = reports

    if (filters.petName) {
      filtered = filtered.filter(
        (report) =>
          report.petName.toLowerCase().includes(filters.petName.toLowerCase()) ||
          report.ownerName.toLowerCase().includes(filters.petName.toLowerCase()),
      )
    }

    if (filters.testType && filters.testType !== "all") {
      filtered = filtered.filter((report) => report.testType === filters.testType)
    }

    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((report) => report.status === filters.status)
    }

    if (filters.dateRange.from) {
      filtered = filtered.filter((report) => new Date(report.date) >= new Date(filters.dateRange.from))
    }

    if (filters.dateRange.to) {
      filtered = filtered.filter((report) => new Date(report.date) <= new Date(filters.dateRange.to))
    }

    setFilteredReports(filtered)
  }

  const handleViewReport = (report: Report) => {
    setSelectedReport(report)
    setShowViewModal(true)
  }

  const handleShareReport = (report: Report) => {
    setSelectedReport(report)
    setShowShareModal(true)
  }

  const handleDownloadReport = (report: Report) => {
    // Simulate PDF download
    const link = document.createElement("a")
    link.href = `/api/reports/${report.id}/download`
    link.download = `${report.petName}_${report.testType}_${report.date}.pdf`
    link.click()
  }

  const handleAddReport = (newReport: Partial<Report>) => {
    const report: Report = {
      id: `RPT${String(reports.length + 1).padStart(3, "0")}`,
      date: new Date().toISOString().split("T")[0],
      status: "Completed",
      shared: false,
      sharedVia: [],
      ...newReport,
    } as Report

    setReports([report, ...reports])
    setFilteredReports([report, ...filteredReports])
  }

  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === "Pending").length,
    completed: reports.filter((r) => r.status === "Completed").length,
    shared: reports.filter((r) => r.shared).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lab & Reports</h1>
          <p className="text-gray-600 mt-2">Manage lab reports and test results</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaFilter className="mr-2 h-4 w-4" />
            Filters
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus className="mr-2 h-4 w-4" />
            Upload Report
          </button>
          <button
            onClick={() => setShowAddTestModal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaPlus className="mr-2 h-4 w-4" />
            Add Test Result
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaEye className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FaEye className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaEye className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FaShare className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Shared</p>
              <p className="text-2xl font-bold text-gray-900">{stats.shared}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div>
          <LabReportsFilters onFilterChange={handleFilterChange} />
        </div>
      )}

      {/* Reports List */}
      <ReportsList
        reports={filteredReports}
        onViewReport={handleViewReport}
        onShareReport={handleShareReport}
        onDownloadReport={handleDownloadReport}
      />

      {/* Modals */}
      {showUploadModal && <UploadReportModal onClose={() => setShowUploadModal(false)} onSubmit={handleAddReport} />}

      {showAddTestModal && <AddTestResultModal onClose={() => setShowAddTestModal(false)} onSubmit={handleAddReport} />}

      {showViewModal && selectedReport && (
        <ViewReportModal report={selectedReport} onClose={() => setShowViewModal(false)} />
      )}

      {showShareModal && selectedReport && (
        <ShareReportModal
          report={selectedReport}
          onClose={() => setShowShareModal(false)}
          onShare={(method: string) => {
            // Update report shared status
            const updatedReports = reports.map((r) =>
              r.id === selectedReport.id ? { ...r, shared: true, sharedVia: [...r.sharedVia, method] } : r,
            )
            setReports(updatedReports)
            setFilteredReports(updatedReports)
            setShowShareModal(false)
          }}
        />
      )}
    </div>
  )
}
