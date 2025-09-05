"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Upload, Camera } from "lucide-react"

interface PhotoUploadCellProps {
  currentPhotoUrl?: string | null
  onPhotoUpdate: (fileUrl: string) => void
}

export function PhotoUploadCell({ currentPhotoUrl, onPhotoUpdate }: PhotoUploadCellProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    setIsUploading(true)
    
    try {
      // In a real implementation, you would upload to Supabase Storage
      // For now, we'll create a local URL
      const url = URL.createObjectURL(file)
      onPhotoUpdate(url)
    } catch (error) {
      console.error("Failed to upload photo:", error)
    } finally {
      setIsUploading(false)
    }
  }
  
  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }
  
  return (
    <div className="flex items-center justify-center">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      {currentPhotoUrl ? (
        <div className="relative group">
          <Avatar className="h-10 w-10 cursor-pointer" onClick={triggerFileInput}>
            <AvatarImage src={currentPhotoUrl} alt="Patient photo" />
            <AvatarFallback>
              <Camera className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
            <Upload className="h-4 w-4 text-white" />
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={triggerFileInput}
          disabled={isUploading}
          className="h-10 w-10 p-0 rounded-full border-2 border-dashed border-muted-foreground hover:border-primary"
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent border-primary" />
          ) : (
            <Camera className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      )}
    </div>
  )
}