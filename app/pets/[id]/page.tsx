"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import DashboardLayout from "../../../components/DashboardLayout"
import { createClient } from "@supabase/supabase-js"
import { useClinicContext } from "@/lib/supabase-realtime"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, Syringe, Phone, Mail, MapPin, Edit, Download, Share } from "lucide-react"

interface Pet {
  id: string
  name: string
  species: string
  breed: string
  age: number
  gender: string
  weight: string
  color: string
  microchip_id?: string
  owner_name: string
  owner_email: string
  owner_phone: string
  owner_address?: string
  profile_image?: string
  tags: string[]
  created_at: string
  updated_at: string
}

interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  type: string
  status: string
  veterinarian_name: string
  notes?: string
  total_cost?: number
}

interface Vaccine {
  id: string
  vaccine_name: string
  date_administered: string
  next_due_date: string
  veterinarian_name: string
  batch_number: string
  manufacturer: string
  status: string
}

interface Invoice {
  id: string
  invoice_number: string
  invoice_date: string
  total_amount: number
  status: string
  due_date: string
}

interface SOAPNote {
  id: string
  visit_date: string
  visit_type: string
  chief_complaint: string
  subjective: string
  objective: any
  assessment: string
  plan: string
  veterinarian_name: string
}

export default function PetProfile() {
  const params = useParams()
  const router = useRouter()
  const petId = params.id as string
  const clinicContext = useClinicContext()

  const [pet, setPet] = useState<Pet | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [vaccines, setVaccines] = useState<Vaccine[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [soapNotes, setSoapNotes] = useState<SOAPNote[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  // Format currency to INR
  const formatINR = (amount: number) => {
    return (amount * 83).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  }

  useEffect(() => {
    const fetchPetData = async () => {
      if (!clinicContext?.clinicId || !petId) return

      try {
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

        // Set clinic context
        await supabase.rpc("set_clinic_context", { clinic_id: clinicContext.clinicId })

        // Fetch pet details
        const { data: petData, error: petError } = await supabase.from("patients").select("*").eq("id", petId).single()

        if (petError) throw petError
        setPet(petData)

        // Fetch appointments
        const { data: appointmentsData } = await supabase
          .from("appointments")
          .select("*")
          .eq("patient_id", petId)
          .order("appointment_date", { ascending: false })

        setAppointments(appointmentsData || [])

        // Fetch vaccines
        const { data: vaccinesData } = await supabase
          .from("vaccines")
          .select("*")
          .eq("patient_id", petId)
          .order("date_administered", { ascending: false })

        setVaccines(vaccinesData || [])

        // Fetch invoices
        const { data: invoicesData } = await supabase
          .from("invoices")
          .select("*")
          .eq("patient_id", petId)
          .order("invoice_date", { ascending: false })

        setInvoices(invoicesData || [])

        // Fetch SOAP notes
        const { data: soapData } = await supabase
          .from("soap_notes")
          .select("*")
          .eq("patient_id", petId)
          .order("visit_date", { ascending: false })

        setSoapNotes(soapData || [])
      } catch (error) {
        console.error("Error fetching pet data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPetData()
  }, [clinicContext, petId])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "paid":
        return "bg-green-100 text-green-800"
      case "scheduled":
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalSpent = invoices
    .filter((invoice) => invoice.status === "paid")
    .reduce((sum, invoice) => sum + invoice.total_amount, 0)

  const overdueVaccines = vaccines.filter(
    (vaccine) => new Date(vaccine.next_due_date) < new Date() && vaccine.status !== "completed",
  ).length

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!pet) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Pet not found</h2>
          <Link href="/patients">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Patients
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/patients">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
              <p className="text-gray-600">
                {pet.breed} • {pet.species} • {pet.age} years old
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Pet Info Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                {/* Pet Photo */}
                <div className="text-center mb-6">
                  <div className="h-32 w-32 bg-blue-100 rounded-full flex items-center justify-center text-6xl mx-auto mb-4 overflow-hidden">
                    {pet.profile_image ? (
                      <img
                        src={pet.profile_image || "/placeholder.svg"}
                        alt={pet.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>
                        {pet.species.toLowerCase() === "dog" ? "🐕" : pet.species.toLowerCase() === "cat" ? "🐱" : "🐾"}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold">{pet.name}</h3>
                  <p className="text-gray-600">{pet.breed}</p>
                </div>

                {/* Pet Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-600">Species</p>
                      <p className="text-gray-900">{pet.species}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-600">Age</p>
                      <p className="text-gray-900">{pet.age} years</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-600">Gender</p>
                      <p className="text-gray-900">{pet.gender}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-600">Weight</p>
                      <p className="text-gray-900">{pet.weight}</p>
                    </div>
                  </div>

                  {pet.microchip_id && (
                    <div>
                      <p className="font-medium text-gray-600 text-sm">Microchip ID</p>
                      <p className="text-gray-900 font-mono text-sm">{pet.microchip_id}</p>
                    </div>
                  )}

                  {/* Tags */}
                  {pet.tags && pet.tags.length > 0 && (
                    <div>
                      <p className="font-medium text-gray-600 text-sm mb-2">Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {pet.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Owner Info */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium text-gray-900 mb-3">Owner Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-600 w-16">Name:</span>
                      <span className="text-gray-900">{pet.owner_name}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{pet.owner_phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{pet.owner_email}</span>
                    </div>
                    {pet.owner_address && (
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                        <span className="text-gray-900">{pet.owner_address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium text-gray-900 mb-3">Quick Stats</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Visits:</span>
                      <span className="font-medium">{appointments.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Spent:</span>
                      <span className="font-medium text-green-600">{formatINR(totalSpent)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vaccines:</span>
                      <span className="font-medium">{vaccines.length}</span>
                    </div>
                    {overdueVaccines > 0 && (
                      <div className="flex justify-between">
                        <span className="text-red-600">Overdue Vaccines:</span>
                        <Badge variant="destructive" className="text-xs">
                          {overdueVaccines}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="vaccines">Vaccines</TabsTrigger>
                <TabsTrigger value="medical">Medical Records</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Recent Appointments */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Calendar className="mr-2 h-5 w-5" />
                        Recent Appointments
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {appointments.slice(0, 3).map((appointment) => (
                          <div
                            key={appointment.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{appointment.type}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(appointment.appointment_date).toLocaleDateString()} at{" "}
                                {appointment.appointment_time}
                              </p>
                              <p className="text-sm text-gray-600">Dr. {appointment.veterinarian_name}</p>
                            </div>
                            <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                          </div>
                        ))}
                        {appointments.length === 0 && (
                          <p className="text-gray-500 text-center py-4">No appointments yet</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Vaccine Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Syringe className="mr-2 h-5 w-5" />
                        Vaccine Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {vaccines.slice(0, 3).map((vaccine) => (
                          <div key={vaccine.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{vaccine.vaccine_name}</p>
                              <p className="text-sm text-gray-600">
                                Given: {new Date(vaccine.date_administered).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-600">
                                Next due: {new Date(vaccine.next_due_date).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge className={getStatusColor(vaccine.status)}>{vaccine.status}</Badge>
                          </div>
                        ))}
                        {vaccines.length === 0 && (
                          <p className="text-gray-500 text-center py-4">No vaccines recorded</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="appointments" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>All Appointments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {appointments.map((appointment) => (
                        <div key={appointment.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{appointment.type}</h3>
                            <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Date & Time</p>
                              <p className="font-medium">
                                {new Date(appointment.appointment_date).toLocaleDateString()} at{" "}
                                {appointment.appointment_time}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Veterinarian</p>
                              <p className="font-medium">Dr. {appointment.veterinarian_name}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Cost</p>
                              <p className="font-medium text-green-600">
                                {appointment.total_cost ? formatINR(appointment.total_cost) : "N/A"}
                              </p>
                            </div>
                          </div>
                          {appointment.notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded">
                              <p className="text-sm">{appointment.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="vaccines" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Vaccination History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {vaccines.map((vaccine) => (
                        <div key={vaccine.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{vaccine.vaccine_name}</h3>
                            <Badge className={getStatusColor(vaccine.status)}>{vaccine.status}</Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Date Given</p>
                              <p className="font-medium">{new Date(vaccine.date_administered).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Next Due</p>
                              <p className="font-medium">{new Date(vaccine.next_due_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Veterinarian</p>
                              <p className="font-medium">Dr. {vaccine.veterinarian_name}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Batch</p>
                              <p className="font-medium font-mono">{vaccine.batch_number}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="medical" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Medical Records (SOAP Notes)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {soapNotes.map((note) => (
                        <div key={note.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium">{note.visit_type}</h3>
                            <span className="text-sm text-gray-500">
                              {new Date(note.visit_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-sm text-gray-600 mb-1">Chief Complaint</h4>
                              <p className="text-sm bg-blue-50 p-2 rounded">{note.chief_complaint}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm text-gray-600 mb-1">Assessment</h4>
                              <p className="text-sm bg-yellow-50 p-2 rounded">{note.assessment}</p>
                            </div>
                          </div>
                          <div className="mt-3">
                            <h4 className="font-medium text-sm text-gray-600 mb-1">Plan</h4>
                            <p className="text-sm bg-green-50 p-2 rounded">{note.plan}</p>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">By Dr. {note.veterinarian_name}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="billing" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {invoices.map((invoice) => (
                        <div key={invoice.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">Invoice #{invoice.invoice_number}</h3>
                            <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Invoice Date</p>
                              <p className="font-medium">{new Date(invoice.invoice_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Due Date</p>
                              <p className="font-medium">{new Date(invoice.due_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Amount</p>
                              <p className="font-medium text-green-600">{formatINR(invoice.total_amount)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {invoices.length === 0 && <p className="text-gray-500 text-center py-4">No invoices yet</p>}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
