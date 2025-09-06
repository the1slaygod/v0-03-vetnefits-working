"use client"

import { useState, useEffect } from "react"
import { Clock, AlertTriangle, Play, Check, X, User, Cat, Edit } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  getWaitingList, 
  updateWaitingListStatus, 
  updateWaitingListPriority,
  removeFromWaitingList,
  WaitingListEntry 
} from "@/app/actions/waiting-list-actions"
import { toast } from "sonner"

interface WaitingListQueueProps {
  filter: "active" | "completed"
}

export default function WaitingListQueue({ filter }: WaitingListQueueProps) {
  const [entries, setEntries] = useState<WaitingListEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadEntries = async () => {
      try {
        const allEntries = await getWaitingList()
        
        let filteredEntries = allEntries
        if (filter === "completed") {
          // For completed view, get entries from today that were completed
          filteredEntries = allEntries.filter(entry => 
            (entry.status === "completed" || entry.status === "cancelled") &&
            new Date(entry.created_at).toDateString() === new Date().toDateString()
          )
        } else {
          // For active view, get waiting and in-progress entries
          filteredEntries = allEntries.filter(entry => 
            entry.status === "waiting" || entry.status === "in_progress"
          )
        }
        
        setEntries(filteredEntries)
      } catch (error) {
        console.error("Error loading waiting list:", error)
        toast.error("Failed to load waiting list")
      } finally {
        setLoading(false)
      }
    }

    loadEntries()
    
    // Set up polling for real-time updates
    const interval = setInterval(loadEntries, 30000) // Refresh every 30 seconds
    
    return () => clearInterval(interval)
  }, [filter])

  const handleStatusChange = async (id: string, newStatus: "waiting" | "in_progress" | "completed" | "cancelled") => {
    try {
      const result = await updateWaitingListStatus(id, newStatus)
      
      if (result.success) {
        toast.success("Status updated successfully")
        // Refresh the list
        const allEntries = await getWaitingList()
        let filteredEntries = allEntries
        
        if (filter === "completed") {
          filteredEntries = allEntries.filter(entry => 
            (entry.status === "completed" || entry.status === "cancelled") &&
            new Date(entry.created_at).toDateString() === new Date().toDateString()
          )
        } else {
          filteredEntries = allEntries.filter(entry => 
            entry.status === "waiting" || entry.status === "in_progress"
          )
        }
        
        setEntries(filteredEntries)
      } else {
        toast.error(result.error || "Failed to update status")
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Failed to update status")
    }
  }

  const handlePriorityChange = async (id: string, newPriority: "low" | "normal" | "high" | "urgent") => {
    try {
      const result = await updateWaitingListPriority(id, newPriority)
      
      if (result.success) {
        toast.success("Priority updated successfully")
        // Update the entry in the local state
        setEntries(prev => prev.map(entry => 
          entry.id === id ? { ...entry, priority: newPriority } : entry
        ))
      } else {
        toast.error(result.error || "Failed to update priority")
      }
    } catch (error) {
      console.error("Error updating priority:", error)
      toast.error("Failed to update priority")
    }
  }

  const handleRemove = async (id: string) => {
    if (!confirm("Are you sure you want to remove this entry from the waiting list?")) {
      return
    }

    try {
      const result = await removeFromWaitingList(id)
      
      if (result.success) {
        toast.success("Removed from waiting list")
        setEntries(prev => prev.filter(entry => entry.id !== id))
      } else {
        toast.error(result.error || "Failed to remove from waiting list")
      }
    } catch (error) {
      console.error("Error removing from waiting list:", error)
      toast.error("Failed to remove from waiting list")
    }
  }

  if (loading) {
    return <WaitingListQueueSkeleton />
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {filter === "completed" ? "No completed entries today" : "No patients in queue"}
          </h3>
          <p className="text-gray-600 mb-4">
            {filter === "completed" 
              ? "No patients have been seen today."
              : "The waiting list is empty. Add patients as they check in."
            }
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {entries.map((entry, index) => (
        <WaitingListEntryCard 
          key={entry.id} 
          entry={entry} 
          position={index + 1}
          onStatusChange={handleStatusChange}
          onPriorityChange={handlePriorityChange}
          onRemove={handleRemove}
          isCompleted={filter === "completed"}
        />
      ))}
    </div>
  )
}

function WaitingListEntryCard({ 
  entry, 
  position, 
  onStatusChange, 
  onPriorityChange, 
  onRemove,
  isCompleted 
}: { 
  entry: WaitingListEntry
  position: number
  onStatusChange: (id: string, status: "waiting" | "in_progress" | "completed" | "cancelled") => void
  onPriorityChange: (id: string, priority: "low" | "normal" | "high" | "urgent") => void
  onRemove: (id: string) => void
  isCompleted: boolean
}) {
  const getPriorityBadge = (priority: string) => {
    const colors = {
      "low": "bg-gray-100 text-gray-800",
      "normal": "bg-blue-100 text-blue-800",
      "high": "bg-orange-100 text-orange-800",
      "urgent": "bg-red-100 text-red-800"
    }
    return colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      "waiting": "bg-yellow-100 text-yellow-800",
      "in_progress": "bg-green-100 text-green-800",
      "completed": "bg-blue-100 text-blue-800",
      "cancelled": "bg-red-100 text-red-800"
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getWaitTime = () => {
    const checkedIn = new Date(entry.checked_in_at)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - checkedIn.getTime()) / (1000 * 60))
    return diffMinutes
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {!isCompleted && (
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                {position}
              </div>
            )}
            
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Cat className="text-gray-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {entry.patient_name} - {entry.pet_name}
                </h3>
                <Badge className={getPriorityBadge(entry.priority)}>
                  {entry.priority === "urgent" && <AlertTriangle className="w-3 h-3 mr-1" />}
                  {entry.priority}
                </Badge>
                <Badge className={getStatusBadge(entry.status)}>
                  {entry.status.replace('_', ' ')}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {entry.species}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Checked in: {formatTime(entry.checked_in_at)}
                </span>
                {!isCompleted && (
                  <span className="flex items-center gap-1 text-orange-600">
                    <Clock className="w-3 h-3" />
                    Waiting: {getWaitTime()}min
                  </span>
                )}
              </div>
              
              <p className="text-gray-700 text-sm">
                <strong>Reason:</strong> {entry.reason}
              </p>
              
              {entry.notes && (
                <p className="text-gray-600 text-sm mt-1">
                  <strong>Notes:</strong> {entry.notes}
                </p>
              )}
            </div>
          </div>
          
          {!isCompleted && (
            <div className="flex items-center gap-2">
              <Select
                value={entry.priority}
                onValueChange={(value) => onPriorityChange(entry.id, value as any)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>

              {entry.status === "waiting" && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onStatusChange(entry.id, "in_progress")}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Call
                </Button>
              )}

              {entry.status === "in_progress" && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onStatusChange(entry.id, "completed")}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Complete
                </Button>
              )}

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onRemove(entry.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
        
        {isCompleted && entry.completed_at && (
          <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
            Completed at {formatTime(entry.completed_at)}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function WaitingListQueueSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}