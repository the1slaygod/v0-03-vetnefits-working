"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

interface TimerCellProps {
  type: "waiting" | "turnaround"
  checkedInAt?: string | null
  attendingAt?: string | null
  completedAt?: string | null
}

export function TimerCell({ type, checkedInAt, attendingAt, completedAt }: TimerCellProps) {
  const [currentTime, setCurrentTime] = useState(Date.now())
  
  // Update every second for live timers
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  // Format duration in HH:MM format
  const formatDuration = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (hours > 0) {
      return `${hours}:${remainingMinutes.toString().padStart(2, '0')}`
    }
    return `${minutes}:00`
  }
  
  const calculateTimer = () => {
    if (type === "waiting") {
      // Waiting time = now - checkedInAt (until attending starts)
      if (!checkedInAt) return null
      
      const startTime = new Date(checkedInAt).getTime()
      const endTime = attendingAt ? new Date(attendingAt).getTime() : currentTime
      
      return endTime - startTime
    } else {
      // Turnaround time = attending to now (or completed)
      if (!attendingAt) return null
      
      const startTime = new Date(attendingAt).getTime()
      const endTime = completedAt ? new Date(completedAt).getTime() : currentTime
      
      return endTime - startTime
    }
  }
  
  const duration = calculateTimer()
  
  if (duration === null || duration < 0) {
    return (
      <div className="text-center text-muted-foreground text-sm">
        --
      </div>
    )
  }
  
  const isActive = type === "waiting" 
    ? checkedInAt && !attendingAt 
    : attendingAt && !completedAt
  
  return (
    <div className="flex items-center justify-center gap-1">
      {isActive && <Clock className="h-3 w-3 text-primary animate-pulse" />}
      <span className={`text-sm font-mono ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
        {formatDuration(duration)}
      </span>
    </div>
  )
}