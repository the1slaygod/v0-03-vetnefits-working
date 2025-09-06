"use client"

import { useState, useEffect } from "react"
import { FaFlask, FaEye, FaEdit, FaTrash, FaDownload, FaExclamationTriangle, FaCheckCircle, FaClock, FaUser, FaPaw } from "react-icons/fa"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  getLabReports, 
  updateLabReport, 
  deleteLabReport,
  LabReport 
} from "@/app/actions/lab-reports-actions"
import { toast } from "sonner"

interface LabReportsListProps {
  filter: "all" | "pending" | "in_progress" | "completed" | "abnormal"
}

export default function LabReportsList({ filter }: LabReportsListProps) {
  const [reports, setReports] = useState<LabReport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadReports = async () => {
      try {
        const allReports = await getLabReports()
        
        let filteredReports = allReports
        
        switch (filter) {
          case "pending":
            filteredReports = allReports.filter(report => report.status === "ordered")
            break
          case "in_progress":
            filteredReports = allReports.filter(report => 
              report.status === "collected" || report.status === "in_progress"
            )
            break
          case "completed":
            filteredReports = allReports.filter(report => report.status === "completed")
            break
          case "abnormal":
            filteredReports = allReports.filter(report => 
              report.abnormal_findings && report.abnormal_findings.trim() !== ""
            )
            break
          default:
            // "all" - use all reports
            break
        }
        
        setReports(filteredReports)
      } catch (error) {
        console.error("Error loading lab reports:", error)
        toast.error("Failed to load lab reports")
      } finally {
        setLoading(false)
      }
    }

    loadReports()
  }, [filter])

  const handleStatusUpdate = async (id: string, newStatus: "ordered" | "collected" | "in_progress" | "completed" | "cancelled") => {
    try {
      const result = await updateLabReport(id, { 
        status: newStatus,
        ...(newStatus === "completed" ? { completed_date: new Date().toISOString() } : {})
      })
      
      if (result.success) {
        toast.success("Status updated successfully")
        // Update the report in the local state
        setReports(prev => prev.map(report => 
          report.id === id ? { ...report, status: newStatus } : report
        ))
      } else {
        toast.error(result.error || "Failed to update status")
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Failed to update status")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lab report?")) {
      return
    }

    try {
      const result = await deleteLabReport(id)
      
      if (result.success) {
        toast.success("Lab report deleted successfully")
        setReports(prev => prev.filter(report => report.id !== id))
      } else {
        toast.error(result.error || "Failed to delete lab report")
      }
    } catch (error) {
      console.error("Error deleting lab report:", error)
      toast.error("Failed to delete lab report")
    }
  }

  if (loading) {
    return <LabReportsListSkeleton />
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FaFlask className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No lab reports found</h3>
          <p className="text-gray-600 mb-4">
            {filter === "all" 
              ? "Start by creating your first lab report."
              : `No lab reports match the "${filter}" filter.`
            }
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <LabReportCard 
          key={report.id} 
          report={report} 
          onStatusUpdate={handleStatusUpdate}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}

function LabReportCard({ 
  report, 
  onStatusUpdate, 
  onDelete 
}: { 
  report: LabReport
  onStatusUpdate: (id: string, status: "ordered" | "collected" | "in_progress" | "completed" | "cancelled") => void
  onDelete: (id: string) => void
}) {
  const getStatusBadge = (status: string) => {
    const colors = {
      "ordered": "bg-yellow-100 text-yellow-800",
      "collected": "bg-blue-100 text-blue-800",
      "in_progress": "bg-orange-100 text-orange-800",
      "completed": "bg-green-100 text-green-800",
      "cancelled": "bg-red-100 text-red-800"
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getTestTypeBadge = (type: string) => {
    const colors = {
      "blood_work": "bg-red-100 text-red-800",
      "urine_analysis": "bg-yellow-100 text-yellow-800",
      "fecal_exam": "bg-brown-100 text-brown-800",
      "skin_scraping": "bg-pink-100 text-pink-800",
      "biopsy": "bg-purple-100 text-purple-800",
      "x_ray": "bg-gray-100 text-gray-800",
      "ultrasound": "bg-blue-100 text-blue-800",
      "other": "bg-gray-100 text-gray-800"
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaFlask className="text-blue-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {report.test_name}
                </h3>
                <Badge className={getStatusBadge(report.status)}>
                  {report.status === "completed" && <FaCheckCircle className="w-3 h-3 mr-1" />}
                  {report.status === "in_progress" && <FaClock className="w-3 h-3 mr-1" />}
                  {report.status.replace('_', ' ')}
                </Badge>
                <Badge className={getTestTypeBadge(report.test_type)}>
                  {report.test_type.replace('_', ' ')}
                </Badge>
                {report.abnormal_findings && (
                  <Badge className="bg-red-100 text-red-800">
                    <FaExclamationTriangle className="w-3 h-3 mr-1" />
                    Abnormal
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                <span className="flex items-center gap-1">
                  <FaUser className="w-3 h-3" />
                  {report.patient_name}
                </span>
                <span className="flex items-center gap-1">
                  <FaPaw className="w-3 h-3" />
                  {report.pet_name} ({report.species})
                </span>
                <span>
                  Ordered: {formatDate(report.ordered_date)}
                </span>
                {report.completed_date && (
                  <span>
                    Completed: {formatDate(report.completed_date)}
                  </span>
                )}
              </div>
              
              {report.lab_name && (
                <p className="text-gray-600 text-sm mb-1">
                  <strong>Lab:</strong> {report.lab_name}
                </p>
              )}
              
              <p className="text-gray-600 text-sm mb-1">
                <strong>Veterinarian:</strong> {report.veterinarian}
              </p>
              
              {report.results && (
                <p className="text-gray-700 text-sm line-clamp-2 mt-2">
                  <strong>Results:</strong> {report.results}
                </p>
              )}
              
              {report.abnormal_findings && (
                <p className="text-red-700 text-sm line-clamp-2 mt-1">
                  <strong>Abnormal Findings:</strong> {report.abnormal_findings}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {report.status === "ordered" && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onStatusUpdate(report.id, "collected")}
              >
                Mark Collected
              </Button>
            )}
            
            {report.status === "collected" && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onStatusUpdate(report.id, "in_progress")}
              >
                Start Processing
              </Button>
            )}
            
            {(report.status === "in_progress" || report.status === "collected") && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onStatusUpdate(report.id, "completed")}
              >
                <FaCheckCircle className="w-4 h-4 mr-2" />
                Complete
              </Button>
            )}
            
            <Button variant="outline" size="sm">
              <FaEye className="w-4 h-4 mr-2" />
              View
            </Button>
            
            <Button variant="outline" size="sm">
              <FaEdit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            
            {report.file_url && (
              <Button variant="outline" size="sm">
                <FaDownload className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDelete(report.id)}
            >
              <FaTrash className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Created {formatDate(report.created_at)} at {formatTime(report.created_at)}</span>
          {report.updated_at !== report.created_at && (
            <span>Updated {formatDate(report.updated_at)}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function LabReportsListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}