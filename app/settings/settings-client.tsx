"use client"

import { useState, useTransition } from "react"
import {
  FaClinicMedical,
  FaCreditCard,
  FaUsers,
  FaPalette,
  FaCogs,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaTimes,
  FaPlus,
  FaTrash,
} from "react-icons/fa"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

interface ClinicSettings {
  clinic_name: string
  clinic_phone: string
  clinic_email: string
  clinic_address: string
  clinic_logo: string
  subscription_status: "active" | "inactive" | "trial"
  subscription_plan: "monthly" | "yearly"
  subscription_valid_till: string
  theme: "light" | "dark"
  default_view: "dashboard" | "appointments" | "admit"
  modules: {
    vaccines: boolean
    compliance: boolean
    lab_reports: boolean
    otc_billing: boolean
  }
}

interface StaffMember {
  id: string
  name: string
  email: string
  role: "doctor" | "receptionist" | "admin"
  status: "active" | "inactive"
  created_at: string
}

interface SettingsClientProps {
  initialSettings: ClinicSettings
  initialStaff: StaffMember[]
  saveSettings: (formData: FormData) => Promise<{ success: boolean; message: string }>
  addStaff: (formData: FormData) => Promise<{ success: boolean; message: string }>
  toggleStaffStatus: (staffId: string, currentStatus: string) => Promise<{ success: boolean; message: string }>
  deleteStaff: (staffId: string) => Promise<{ success: boolean; message: string }>
}

export default function SettingsClient({
  initialSettings,
  initialStaff,
  saveSettings,
  addStaff,
  toggleStaffStatus,
  deleteStaff,
}: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState("clinic")
  const [settings, setSettings] = useState<ClinicSettings>(initialSettings)
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff)
  const [showPassword, setShowPassword] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showAddStaff, setShowAddStaff] = useState(false)
  const [isPending, startTransition] = useTransition()

  const { toast } = useToast()

  const handleSaveSettings = async (formData: FormData) => {
    startTransition(async () => {
      const result = await saveSettings(formData)
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })
    })
  }

  const handleAddStaff = async (formData: FormData) => {
    startTransition(async () => {
      const result = await addStaff(formData)
      if (result.success) {
        setShowAddStaff(false)
        // Refresh the page to show new staff member
        window.location.reload()
      }
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })
    })
  }

  const handleToggleStaffStatus = async (staffId: string, currentStatus: string) => {
    startTransition(async () => {
      const result = await toggleStaffStatus(staffId, currentStatus)
      if (result.success) {
        setStaff((prev) =>
          prev.map((member) =>
            member.id === staffId ? { ...member, status: currentStatus === "active" ? "inactive" : "active" } : member,
          ),
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
      const result = await deleteStaff(staffId)
      if (result.success) {
        setStaff((prev) => prev.filter((member) => member.id !== staffId))
      }
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })
    })
  }

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      })
      return
    }

    // This would typically integrate with your auth system
    toast({
      title: "Info",
      description: "Password change functionality requires auth integration",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your clinic settings and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="clinic" className="flex items-center space-x-2">
            <FaClinicMedical className="w-4 h-4" />
            <span>Clinic</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center space-x-2">
            <FaCreditCard className="w-4 h-4" />
            <span>Billing</span>
          </TabsTrigger>
          <TabsTrigger value="access" className="flex items-center space-x-2">
            <FaUsers className="w-4 h-4" />
            <span>Access</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center space-x-2">
            <FaPalette className="w-4 h-4" />
            <span>Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="modules" className="flex items-center space-x-2">
            <FaCogs className="w-4 h-4" />
            <span>Modules</span>
          </TabsTrigger>
        </TabsList>

        {/* Clinic Profile Settings */}
        <TabsContent value="clinic">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaClinicMedical className="mr-2" />
                Clinic Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={handleSaveSettings} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="clinic_name">Clinic Name</Label>
                    <Input
                      id="clinic_name"
                      name="clinic_name"
                      defaultValue={settings.clinic_name}
                      placeholder="Enter clinic name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clinic_phone">Phone Number</Label>
                    <Input
                      id="clinic_phone"
                      name="clinic_phone"
                      defaultValue={settings.clinic_phone}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clinic_email">Email</Label>
                    <Input
                      id="clinic_email"
                      name="clinic_email"
                      type="email"
                      defaultValue={settings.clinic_email}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clinic_logo">Clinic Logo URL</Label>
                    <Input
                      id="clinic_logo"
                      name="clinic_logo"
                      defaultValue={settings.clinic_logo}
                      placeholder="Enter logo URL"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="clinic_address">Address</Label>
                  <Textarea
                    id="clinic_address"
                    name="clinic_address"
                    defaultValue={settings.clinic_address}
                    placeholder="Enter clinic address"
                    rows={3}
                  />
                </div>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription & Billing */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaCreditCard className="mr-2" />
                Subscription & Billing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label>Subscription Status</Label>
                  <div className="mt-2">
                    <Badge
                      variant={
                        settings.subscription_status === "active"
                          ? "default"
                          : settings.subscription_status === "trial"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {settings.subscription_status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Plan</Label>
                  <p className="mt-2 font-medium capitalize">{settings.subscription_plan}</p>
                </div>
                <div>
                  <Label>Valid Till</Label>
                  <p className="mt-2 font-medium">
                    {settings.subscription_valid_till
                      ? new Date(settings.subscription_valid_till).toLocaleDateString("en-IN")
                      : "N/A"}
                  </p>
                </div>
              </div>
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Payment History</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Yearly Subscription</p>
                      <p className="text-sm text-gray-600">Jan 15, 2024</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹29,999</p>
                      <Badge variant="default">Paid</Badge>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-4">
                <Button>Renew Subscription</Button>
                <Button variant="outline">Download Invoice</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account & Access */}
        <TabsContent value="access">
          <div className="space-y-6">
            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="new_password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirm_password">Confirm Password</Label>
                  <Input
                    id="confirm_password"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
                <Button onClick={changePassword}>Change Password</Button>
              </CardContent>
            </Card>

            {/* Staff Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <FaUsers className="mr-2" />
                    Staff Management
                  </span>
                  <Button onClick={() => setShowAddStaff(true)}>
                    <FaPlus className="mr-2 w-4 h-4" />
                    Add Staff
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showAddStaff && (
                  <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-medium mb-4">Add New Staff Member</h4>
                    <form action={handleAddStaff}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="staff_name">Name</Label>
                          <Input id="staff_name" name="name" placeholder="Enter name" required />
                        </div>
                        <div>
                          <Label htmlFor="staff_email">Email</Label>
                          <Input id="staff_email" name="email" type="email" placeholder="Enter email" required />
                        </div>
                        <div>
                          <Label htmlFor="staff_role">Role</Label>
                          <select
                            id="staff_role"
                            name="role"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                          >
                            <option value="receptionist">Receptionist</option>
                            <option value="doctor">Doctor</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <Button type="submit" disabled={isPending}>
                          {isPending ? "Adding..." : "Add Staff"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowAddStaff(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="space-y-4">
                  {staff.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                        <Badge variant="outline" className="mt-1">
                          {member.role}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={member.status === "active" ? "default" : "secondary"}>{member.status}</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStaffStatus(member.id, member.status)}
                          disabled={isPending}
                        >
                          {member.status === "active" ? <FaTimes /> : <FaCheck />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteStaff(member.id)}
                          className="text-red-600 hover:text-red-700"
                          disabled={isPending}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {staff.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FaUsers className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No staff members added yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaPalette className="mr-2" />
                Appearance Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={handleSaveSettings} className="space-y-6">
                <div>
                  <Label>Theme</Label>
                  <div className="flex items-center space-x-4 mt-2">
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="theme" value="light" defaultChecked={settings.theme === "light"} />
                      <span>Light</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="theme" value="dark" defaultChecked={settings.theme === "dark"} />
                      <span>Dark</span>
                    </label>
                  </div>
                </div>
                <div>
                  <Label>Default View</Label>
                  <div className="flex items-center space-x-4 mt-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="default_view"
                        value="dashboard"
                        defaultChecked={settings.default_view === "dashboard"}
                      />
                      <span>Dashboard</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="default_view"
                        value="appointments"
                        defaultChecked={settings.default_view === "appointments"}
                      />
                      <span>Appointments</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="default_view"
                        value="admit"
                        defaultChecked={settings.default_view === "admit"}
                      />
                      <span>Admit Screen</span>
                    </label>
                  </div>
                </div>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Module Toggles */}
        <TabsContent value="modules">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaCogs className="mr-2" />
                Module Settings
              </CardTitle>
              <p className="text-sm text-gray-600">Enable or disable modules for your clinic</p>
            </CardHeader>
            <CardContent>
              <form action={handleSaveSettings} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Vaccine Module</h3>
                      <p className="text-sm text-gray-600">Manage pet vaccinations and schedules</p>
                    </div>
                    <Switch name="modules_vaccines" defaultChecked={settings.modules.vaccines} />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Compliance</h3>
                      <p className="text-sm text-gray-600">Track compliance and regulatory requirements</p>
                    </div>
                    <Switch name="modules_compliance" defaultChecked={settings.modules.compliance} />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Lab Reports</h3>
                      <p className="text-sm text-gray-600">Manage laboratory test results</p>
                    </div>
                    <Switch name="modules_lab_reports" defaultChecked={settings.modules.lab_reports} />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">OTC Billing</h3>
                      <p className="text-sm text-gray-600">Over-the-counter sales and billing</p>
                    </div>
                    <Switch name="modules_otc_billing" defaultChecked={settings.modules.otc_billing} />
                  </div>
                </div>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
