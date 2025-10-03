"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { FaPlus, FaTrash, FaToggleOn, FaToggleOff } from "react-icons/fa"
import { useToast } from "@/hooks/use-toast"
import { saveClinicSettings, saveModuleSettings, addStaffMember, toggleStaffStatus, deleteStaffMember } from "./actions"

interface StaffMember {
  id: string
  name: string
  email: string
  role: string
  phone: string
  isActive: boolean
}

export default function SettingsClient() {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [showAddStaff, setShowAddStaff] = useState(false)

  // Mock staff data
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      email: "sarah@vetnefits.com",
      role: "Veterinarian",
      phone: "+1 (555) 123-4567",
      isActive: true,
    },
    {
      id: "2",
      name: "Mike Wilson",
      email: "mike@vetnefits.com",
      role: "Veterinary Technician",
      phone: "+1 (555) 234-5678",
      isActive: true,
    },
    {
      id: "3",
      name: "Lisa Chen",
      email: "lisa@vetnefits.com",
      role: "Receptionist",
      phone: "+1 (555) 345-6789",
      isActive: false,
    },
  ])

  const handleClinicSettingsSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await saveClinicSettings(formData)
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })
    })
  }

  const handleModuleSettingsSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await saveModuleSettings(formData)
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })
    })
  }

  const handleAddStaff = async (formData: FormData) => {
    startTransition(async () => {
      const result = await addStaffMember(formData)
      if (result.success) {
        setShowAddStaff(false)
        // Add to local state for demo
        const newStaff: StaffMember = {
          id: Date.now().toString(),
          name: formData.get("name") as string,
          email: formData.get("email") as string,
          role: formData.get("role") as string,
          phone: formData.get("phone") as string,
          isActive: true,
        }
        setStaffMembers((prev) => [...prev, newStaff])
      }
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })
    })
  }

  const handleToggleStaff = async (staffId: string, currentStatus: boolean) => {
    startTransition(async () => {
      const result = await toggleStaffStatus(staffId, !currentStatus)
      if (result.success) {
        setStaffMembers((prev) =>
          prev.map((staff) => (staff.id === staffId ? { ...staff, isActive: !currentStatus } : staff)),
        )
      }
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })
    })
  }

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return

    startTransition(async () => {
      const result = await deleteStaffMember(staffId)
      if (result.success) {
        setStaffMembers((prev) => prev.filter((staff) => staff.id !== staffId))
      }
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your clinic settings and preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Clinic Information</CardTitle>
              <CardDescription>Update your clinic's basic information</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={handleClinicSettingsSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clinicName">Clinic Name</Label>
                    <Input
                      id="clinicName"
                      name="clinicName"
                      defaultValue="Vetnefits Animal Hospital"
                      placeholder="Enter clinic name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" defaultValue="+1 (555) 123-4567" placeholder="Enter phone number" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue="admin@vetnefits.com"
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    defaultValue="123 Pet Street, Animal City, AC 12345"
                    placeholder="Enter clinic address"
                  />
                </div>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules">
          <Card>
            <CardHeader>
              <CardTitle>Module Settings</CardTitle>
              <CardDescription>Enable or disable specific modules for your clinic</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={handleModuleSettingsSubmit} className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="vaccines">Vaccines Module</Label>
                    <p className="text-sm text-gray-500">Manage vaccination schedules and records</p>
                  </div>
                  <Switch id="vaccines" name="vaccines" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="otcBilling">OTC Billing</Label>
                    <p className="text-sm text-gray-500">Over-the-counter sales and billing</p>
                  </div>
                  <Switch id="otcBilling" name="otcBilling" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="compliance">Compliance Module</Label>
                    <p className="text-sm text-gray-500">Regulatory compliance and reporting</p>
                  </div>
                  <Switch id="compliance" name="compliance" defaultChecked />
                </div>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : "Save Module Settings"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Staff Management</h3>
                <p className="text-sm text-gray-500">Manage your clinic staff members</p>
              </div>
              <Button onClick={() => setShowAddStaff(true)}>
                <FaPlus className="w-4 h-4 mr-2" />
                Add Staff
              </Button>
            </div>

            {showAddStaff && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Staff Member</CardTitle>
                </CardHeader>
                <CardContent>
                  <form action={handleAddStaff} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" name="name" placeholder="Enter full name" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="Enter email" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Input id="role" name="role" placeholder="e.g., Veterinarian, Technician" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" name="phone" placeholder="Enter phone number" required />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button type="submit" disabled={isPending}>
                        {isPending ? "Adding..." : "Add Staff Member"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddStaff(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Current Staff</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {staffMembers.map((staff) => (
                    <div key={staff.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{staff.name}</h4>
                        <p className="text-sm text-gray-500">{staff.role}</p>
                        <p className="text-sm text-gray-500">
                          {staff.email} • {staff.phone}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            staff.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {staff.isActive ? "Active" : "Inactive"}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStaff(staff.id, staff.isActive)}
                          disabled={isPending}
                        >
                          {staff.isActive ? <FaToggleOff className="w-4 h-4" /> : <FaToggleOn className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteStaff(staff.id)}
                          disabled={isPending}
                        >
                          <FaTrash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
