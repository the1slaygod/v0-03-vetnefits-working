"use client"

import { useState, useEffect } from "react"
import { FaUser, FaPaw, FaCalendarAlt, FaFileAlt, FaEye, FaEdit, FaClock } from "react-icons/fa"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getEMRRecords, EMRRecord } from "@/app/actions/emr-actions"

interface EMRRecordsListProps {
  filter: "all" | "recent" | "followup" | "pending"
}

export default function EMRRecordsList({ filter }: EMRRecordsListProps) {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const allRecords = await getEMRRecords()
        
        let filteredRecords = allRecords
        const now = new Date()
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

        switch (filter) {
          case "recent":
            filteredRecords = allRecords.filter(record => 
              new Date(record.visit_date) >= sevenDaysAgo
            )
            break
          case "followup":
            filteredRecords = allRecords.filter(record => 
              record.follow_up_required && 
              record.follow_up_date && 
              new Date(record.follow_up_date) <= now
            )
            break
          case "pending":
            // For now, consider records created today but not updated as pending review
            filteredRecords = allRecords.filter(record => {
              const created = new Date(record.created_at)
              const updated = new Date(record.updated_at)
              const today = new Date().toDateString()
              return created.toDateString() === today && 
                     Math.abs(updated.getTime() - created.getTime()) < 60000 // Less than 1 minute difference
            })
            break
          default:
            // "all" - use all records
            break
        }
        
        setRecords(filteredRecords)
      } catch (error) {
        console.error("Error loading EMR records:", error)
      } finally {
        setLoading(false)
      }
    }

    loadRecords()
  }, [filter])

  if (loading) {
    return <EMRRecordsListSkeleton />
  }

  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FaFileAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No EMR records found</h3>
          <p className="text-gray-600 mb-4">
            {filter === "all" 
              ? "Start by creating your first electronic medical record."
              : `No EMR records match the "${filter}" filter.`
            }
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <EMRRecordCard key={record.id} record={record} />
      ))}
    </div>
  )
}

function EMRRecordCard({ record }: { record: any }) {
  const getVisitTypeBadge = (type: string) => {
    const colors = {
      "routine_checkup": "bg-green-100 text-green-800",
      "emergency": "bg-red-100 text-red-800",
      "surgery": "bg-purple-100 text-purple-800",
      "vaccination": "bg-blue-100 text-blue-800",
      "follow_up": "bg-orange-100 text-orange-800",
      "consultation": "bg-gray-100 text-gray-800"
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
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FaPaw className="text-blue-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {record.patient_name} - {record.pet_name}
                </h3>
                <Badge className={getVisitTypeBadge(record.visit_type)}>
                  {record.visit_type.replace('_', ' ')}
                </Badge>
                {record.follow_up_required && (
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    <FaClock className="w-3 h-3 mr-1" />
                    Follow-up Due
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                <span className="flex items-center gap-1">
                  <FaUser className="w-3 h-3" />
                  {record.species} • {record.breed}
                </span>
                <span className="flex items-center gap-1">
                  <FaCalendarAlt className="w-3 h-3" />
                  {formatDate(record.visit_date)}
                </span>
              </div>
              
              <p className="text-gray-700 text-sm line-clamp-2">
                <strong>Chief Complaint:</strong> {record.chief_complaint}
              </p>
              
              {record.assessment && (
                <p className="text-gray-600 text-sm line-clamp-1 mt-1">
                  <strong>Assessment:</strong> {record.assessment}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <FaEye className="w-4 h-4 mr-2" />
              View
            </Button>
            <Button variant="outline" size="sm">
              <FaEdit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
        
        {/* Vital Signs Summary */}
        {(record.temperature || record.weight || record.heart_rate) && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-6 text-sm text-gray-600">
              {record.temperature && (
                <span>Temp: {record.temperature}°F</span>
              )}
              {record.weight && (
                <span>Weight: {record.weight} lbs</span>
              )}
              {record.heart_rate && (
                <span>HR: {record.heart_rate} bpm</span>
              )}
              {record.respiratory_rate && (
                <span>RR: {record.respiratory_rate} rpm</span>
              )}
            </div>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Created {formatDate(record.created_at)} at {formatTime(record.created_at)}</span>
          {record.created_by && <span>by {record.created_by}</span>}
        </div>
      </CardContent>
    </Card>
  )
}

function EMRRecordsListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="flex gap-2">
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