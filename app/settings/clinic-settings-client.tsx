"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { validateEmail, validatePhone } from "@/lib/utils"
import { Upload, Building2, Loader2 } from "lucide-react"
import Image from "next/image"

// Default clinic ID - in a real app, this would come from auth context
const DEFAULT_CLINIC_ID = "550e8400-e29b-41d4-a716-446655440000"

interface FormData {
  clinic_name: string
  clinic_email: string
  clinic_phone: string
  clinic_address: string
  clinic_logo: string
}

export default function ClinicSettingsClient() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    clinic_name: "",
    clinic_email: "",
    clinic_phone: "",
    clinic_address: "",
    clinic_logo: "/placeholder-logo.png",
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})

  // Load clinic settings on component mount
  useEffect(() => {
    loadClinicSettings()
  }, [])

  const loadClinicSettings = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from("clinic_settings")
        .select("*")
        .eq("clinic_id", DEFAULT_CLINIC_ID)
        .single()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      if (data) {
        setFormData({
          clinic_name: data.clinic_name,
          clinic_email: data.clinic_email,
          clinic_phone: data.clinic_phone,
          clinic_address: data.clinic_address,
          clinic_logo: data.clinic_logo || "/placeholder-logo.png",
        })
      } else {
        // Create new record if not found
        await createDefaultSettings()
      }
    } catch (error) {
      console.error("Error loading clinic settings:", error)
      toast({
        title: "Error",
        description: "Failed to load clinic settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createDefaultSettings = async () => {
    try {
      const defaultSettings = {
        clinic_id: DEFAULT_CLINIC_ID,
        clinic_name: "Vetnefits Animal Hospital",
        clinic_email: "admin@vetnefits.com",
        clinic_phone: "+91 98765 43210",
        clinic_address: "123 Pet Street, Animal City, AC 12345",
        clinic_logo: "/placeholder-logo.png",
      }

      const { error } = await supabase.from("clinic_settings").insert(defaultSettings)

      if (error) throw error

      setFormData({
        clinic_name: defaultSettings.clinic_name,
        clinic_email: defaultSettings.clinic_email,
        clinic_phone: defaultSettings.clinic_phone,
        clinic_address: defaultSettings.clinic_address,
        clinic_logo: defaultSettings.clinic_logo,
      })

      toast({
        title: "Success",
        description: "Default clinic settings created successfully!",
      })
    } catch (error) {
      console.error("Error creating default settings:", error)
      toast({
        title: "Error",
        description: "Failed to create default settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.clinic_name.trim()) {
      newErrors.clinic_name = "Clinic name is required"
    }

    if (!formData.clinic_email.trim()) {
      newErrors.clinic_email = "Email is required"
    } else if (!validateEmail(formData.clinic_email)) {
      newErrors.clinic_email = "Please enter a valid email address"
    }

    if (!formData.clinic_phone.trim()) {
      newErrors.clinic_phone = "Phone number is required"
    } else if (!validatePhone(formData.clinic_phone)) {
      newErrors.clinic_phone = "Please enter a valid phone number"
    }

    if (!formData.clinic_address.trim()) {
      newErrors.clinic_address = "Address is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select a valid image file.",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB.",
        variant: "destructive",
      })
      return
    }

    try {
      setUploading(true)

      // Create a unique filename
      const fileExt = file.name.split(".").pop()
      const fileName = `clinic-logo-${DEFAULT_CLINIC_ID}-${Date.now()}.${fileExt}`

      // Upload to Supabase Storage (if configured)
      // For now, we'll simulate the upload and use a placeholder
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // In a real implementation, you would upload to Supabase Storage:
      // const { data, error } = await supabase.storage
      //   .from('clinic-logos')
      //   .upload(fileName, file)

      // For demo purposes, we'll use a placeholder URL
      const logoUrl = `/placeholder-logo.png?t=${Date.now()}`

      setFormData((prev) => ({ ...prev, clinic_logo: logoUrl }))

      toast({
        title: "Success",
        description: "Logo uploaded successfully!",
      })
    } catch (error) {
      console.error("Error uploading logo:", error)
      toast({
        title: "Error",
        description: "Failed to upload logo. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving.",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)

      const updateData = {
        clinic_name: formData.clinic_name.trim(),
        clinic_email: formData.clinic_email.trim(),
        clinic_phone: formData.clinic_phone.trim(),
        clinic_address: formData.clinic_address.trim(),
        clinic_logo: formData.clinic_logo,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("clinic_settings").update(updateData).eq("clinic_id", DEFAULT_CLINIC_ID)

      if (error) throw error

      toast({
        title: "Success",
        description: "Clinic settings saved successfully!",
      })
    } catch (error) {
      console.error("Error saving clinic settings:", error)
      toast({
        title: "Error",
        description: "Failed to save clinic settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading clinic settings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Building2 className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Clinic Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clinic Information</CardTitle>
          <CardDescription>Manage your clinic's basic information and branding.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Upload Section */}
          <div className="space-y-2">
            <Label htmlFor="logo">Clinic Logo</Label>
            <div className="flex items-center space-x-4">
              <div className="relative h-20 w-20 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
                <Image
                  src={formData.clinic_logo || "/placeholder.svg"}
                  alt="Clinic Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("logo")?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
              </div>
            </div>
          </div>

          {/* Clinic Name */}
          <div className="space-y-2">
            <Label htmlFor="clinic_name">Clinic Name *</Label>
            <Input
              id="clinic_name"
              value={formData.clinic_name}
              onChange={(e) => handleInputChange("clinic_name", e.target.value)}
              placeholder="Enter clinic name"
              className={errors.clinic_name ? "border-red-500" : ""}
            />
            {errors.clinic_name && <p className="text-sm text-red-500">{errors.clinic_name}</p>}
          </div>

          {/* Clinic Email */}
          <div className="space-y-2">
            <Label htmlFor="clinic_email">Clinic Email *</Label>
            <Input
              id="clinic_email"
              type="email"
              value={formData.clinic_email}
              onChange={(e) => handleInputChange("clinic_email", e.target.value)}
              placeholder="Enter clinic email"
              className={errors.clinic_email ? "border-red-500" : ""}
            />
            {errors.clinic_email && <p className="text-sm text-red-500">{errors.clinic_email}</p>}
          </div>

          {/* Clinic Phone */}
          <div className="space-y-2">
            <Label htmlFor="clinic_phone">Clinic Phone *</Label>
            <Input
              id="clinic_phone"
              type="tel"
              value={formData.clinic_phone}
              onChange={(e) => handleInputChange("clinic_phone", e.target.value)}
              placeholder="Enter clinic phone number"
              className={errors.clinic_phone ? "border-red-500" : ""}
            />
            {errors.clinic_phone && <p className="text-sm text-red-500">{errors.clinic_phone}</p>}
          </div>

          {/* Clinic Address */}
          <div className="space-y-2">
            <Label htmlFor="clinic_address">Clinic Address *</Label>
            <Textarea
              id="clinic_address"
              value={formData.clinic_address}
              onChange={(e) => handleInputChange("clinic_address", e.target.value)}
              placeholder="Enter clinic address"
              rows={3}
              className={errors.clinic_address ? "border-red-500" : ""}
            />
            {errors.clinic_address && <p className="text-sm text-red-500">{errors.clinic_address}</p>}
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
