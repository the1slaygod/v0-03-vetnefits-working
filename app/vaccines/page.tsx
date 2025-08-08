"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Download, Mail, Printer, Calendar, Syringe, AlertCircle, CheckCircle } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import { useClinicContext } from "@/lib/supabase-realtime"

interface VaccineRecord {
  id: string
  petId: string
  petName: string
  ownerName: string
  vaccineName: string
  dose: string
  dateAdministered: string
  nextDueDate: string
  vetSignature: string
  batchNumber: string
  manufacturer: string
  clinicId: string
  doctorId: string
  doctorName: string
  status: "completed" | "due" | "overdue"
  cost?: number
  createdAt: string
}

interface Pet {
  id: string
  name: string
  species: string
  breed: string
  ownerName: string
  ownerPhone: string
  microchipId?: string
}

export default function VaccinesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [showAddVaccine, setShowAddVaccine] = useState(false)
  const [activeTab, setActiveTab] = useState("search")
  const [pets, setPets] = useState<Pet[]>([])

  const clinicContext = useClinicContext()

  const [vaccines, setVaccines] = useState<VaccineRecord[]>([
    {
      id: "1",
      petId: "1",
      petName: "Buddy",
      ownerName: "John Smith",
      vaccineName: "DHPP",
      dose: "1ml",
      dateAdministered: "2024-01-15",
      nextDueDate: "2025-01-15",
      vetSignature: "Dr. Sarah Wilson",
      batchNumber: "BATCH123",
      manufacturer: "Zoetis",
      clinicId: "clinic1",
      doctorId: "doc1",
      doctorName: "Dr. Sarah Wilson",
      status: "completed",
      createdAt: "2024-01-15T10:00:00Z",
    },
    {
      id: "2",
      petId: "1",
      petName: "Buddy",
      ownerName: "John Smith",
      vaccineName: "Rabies",
      dose: "1ml",
      dateAdministered: "2023-12-01",
      nextDueDate: "2024-12-01",
      vetSignature: "Dr. Sarah Wilson",
      batchNumber: "BATCH456",
      manufacturer: "Merial",
      clinicId: "clinic1",
      doctorId: "doc1",
      doctorName: "Dr. Sarah Wilson",
      status: "overdue",
      createdAt: "2023-12-01T10:00:00Z",
    },
  ])

  const [newVaccine, setNewVaccine] = useState({
    vaccineName: "",
    dose: "",
    dateAdministered: "",
    vetSignature: "Dr. Sarah Wilson",
    batchNumber: "",
    manufacturer: "",
  })

  // Update the filteredPets to use real-time search:
  useEffect(() => {
    if (searchTerm.length < 2) return

    const searchPets = async () => {
      try {
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

        await supabase.rpc("set_clinic_context", { clinic_id: clinicContext?.clinicId })

        const { data: searchedPets, error } = await supabase
          .from("patients")
          .select("*")
          .or(`name.ilike.%${searchTerm}%,owner_name.ilike.%${searchTerm}%,microchip_id.ilike.%${searchTerm}%`)
          .limit(10)

        if (error) throw error

        const formattedPets = searchedPets.map((pet) => ({
          id: pet.id,
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          ownerName: pet.owner_name,
          ownerPhone: pet.owner_phone,
          microchipId: pet.microchip_id,
        }))

        setPets(formattedPets)
      } catch (error) {
        console.error("Search error:", error)
      }
    }

    const debounceTimer = setTimeout(searchPets, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchTerm, clinicContext])

  const calculateNextDueDate = (vaccineName: string, dateAdministered: string) => {
    const date = new Date(dateAdministered)
    switch (vaccineName.toLowerCase()) {
      case "dhpp":
      case "fvrcp":
        date.setFullYear(date.getFullYear() + 1)
        break
      case "rabies":
        date.setFullYear(date.getFullYear() + 3)
        break
      case "bordetella":
        date.setMonth(date.getMonth() + 6)
        break
      default:
        date.setFullYear(date.getFullYear() + 1)
    }
    return date.toISOString().split("T")[0]
  }

  const handleAddVaccine = async () => {
    if (!selectedPet || !newVaccine.vaccineName || !newVaccine.dateAdministered) return

    const nextDueDate = calculateNextDueDate(newVaccine.vaccineName, newVaccine.dateAdministered)

    const vaccineCosts = {
      DHPP: 2490,
      Rabies: 1660,
      FVRCP: 2075,
      Bordetella: 1245,
      Lyme: 2905,
    }

    const cost = vaccineCosts[newVaccine.vaccineName as keyof typeof vaccineCosts] || 1660

    const vaccine: VaccineRecord = {
      id: Date.now().toString(),
      petId: selectedPet.id,
      petName: selectedPet.name,
      ownerName: selectedPet.ownerName,
      ...newVaccine,
      nextDueDate,
      clinicId: clinicContext?.clinicId || "clinic1",
      doctorId: "doc1",
      doctorName: newVaccine.vetSignature,
      status: "completed",
      cost: cost,
      createdAt: new Date().toISOString(),
    }

    setVaccines([...vaccines, vaccine])
    setNewVaccine({
      vaccineName: "",
      dose: "",
      dateAdministered: "",
      vetSignature: "Dr. Sarah Wilson",
      batchNumber: "",
      manufacturer: "",
    })
    setShowAddVaccine(false)
  }

  const generateCertificate = (vaccine: VaccineRecord) => {
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Vaccination Certificate</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
              .content { margin: 20px 0; }
              .signature { margin-top: 50px; border-top: 1px solid #333; width: 200px; text-align: center; padding-top: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>VACCINATION CERTIFICATE</h1>
              <p>Vetnefits Veterinary Clinic</p>
            </div>
            <div class="content">
              <p><strong>Pet Name:</strong> ${vaccine.petName}</p>
              <p><strong>Owner:</strong> ${vaccine.ownerName}</p>
              <p><strong>Vaccine:</strong> ${vaccine.vaccineName}</p>
              <p><strong>Dose:</strong> ${vaccine.dose}</p>
              <p><strong>Date Administered:</strong> ${new Date(vaccine.dateAdministered).toLocaleDateString()}</p>
              <p><strong>Next Due Date:</strong> ${new Date(vaccine.nextDueDate).toLocaleDateString()}</p>
              <p><strong>Batch Number:</strong> ${vaccine.batchNumber}</p>
              <p><strong>Manufacturer:</strong> ${vaccine.manufacturer}</p>
            </div>
            <div class="signature">
              <p>${vaccine.vetSignature}</p>
              <p>Veterinarian</p>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "due":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "due":
        return <Calendar className="h-4 w-4" />
      case "overdue":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vaccine Module</h1>
          <p className="text-gray-600 mt-2">Manage pet vaccinations and certificates</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search">Search Patients</TabsTrigger>
          <TabsTrigger value="vaccines">Vaccine Records</TabsTrigger>
          <TabsTrigger value="due">Due Vaccines</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="mr-2 h-5 w-5" />
                Search for Patient
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Search by pet name, ID, or owner name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                {searchTerm && (
                  <div className="space-y-2">
                    {pets.map((pet) => (
                      <div
                        key={pet.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedPet?.id === pet.id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedPet(pet)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{pet.name}</h3>
                            <p className="text-sm text-gray-600">
                              {pet.species} • {pet.breed}
                            </p>
                            <p className="text-sm text-gray-600">Owner: {pet.ownerName}</p>
                            <p className="text-sm text-gray-600">Phone: {pet.ownerPhone}</p>
                            {pet.microchipId && <p className="text-sm text-gray-600">Microchip: {pet.microchipId}</p>}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">ID: {pet.id}</p>
                            {vaccines.filter((v) => v.petId === pet.id).length > 0 && (
                              <Badge variant="outline">
                                {vaccines.filter((v) => v.petId === pet.id).length} vaccines
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedPet && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Selected: {selectedPet.name}</h3>
                        <p className="text-sm text-gray-600">Owner: {selectedPet.ownerName}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => setShowAddVaccine(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Vaccine
                        </Button>
                        <Button variant="outline" onClick={() => setActiveTab("vaccines")}>
                          View History
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vaccines" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Syringe className="mr-2 h-5 w-5" />
                Vaccine Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vaccines.map((vaccine) => (
                  <div key={vaccine.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{vaccine.petName}</h3>
                          <Badge className={getStatusColor(vaccine.status)}>
                            {getStatusIcon(vaccine.status)}
                            <span className="ml-1">{vaccine.status}</span>
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p>
                              <strong>Vaccine:</strong> {vaccine.vaccineName}
                            </p>
                            <p>
                              <strong>Dose:</strong> {vaccine.dose}
                            </p>
                            <p>
                              <strong>Owner:</strong> {vaccine.ownerName}
                            </p>
                          </div>
                          <div>
                            <p>
                              <strong>Date Given:</strong> {new Date(vaccine.dateAdministered).toLocaleDateString()}
                            </p>
                            <p>
                              <strong>Next Due:</strong> {new Date(vaccine.nextDueDate).toLocaleDateString()}
                            </p>
                            <p>
                              <strong>Veterinarian:</strong> {vaccine.vetSignature}
                            </p>
                          </div>
                          <div>
                            <p>
                              <strong>Batch:</strong> {vaccine.batchNumber}
                            </p>
                            <p>
                              <strong>Manufacturer:</strong> {vaccine.manufacturer}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Button size="sm" onClick={() => generateCertificate(vaccine)}>
                          <Printer className="h-4 w-4 mr-1" />
                          Print
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => generateCertificate(vaccine)}>
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="h-4 w-4 mr-1" />
                          Email
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="due" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5" />
                Due & Overdue Vaccines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vaccines
                  .filter((v) => v.status === "due" || v.status === "overdue")
                  .map((vaccine) => (
                    <div key={vaccine.id} className="border rounded-lg p-4 border-l-4 border-l-red-500">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">
                            {vaccine.petName} - {vaccine.vaccineName}
                          </h3>
                          <p className="text-sm text-gray-600">Owner: {vaccine.ownerName}</p>
                          <p className="text-sm text-red-600">
                            Due: {new Date(vaccine.nextDueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(vaccine.status)}>{vaccine.status}</Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Vaccine Modal */}
      {showAddVaccine && selectedPet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Vaccine for {selectedPet.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Vaccine Name</label>
                <select
                  value={newVaccine.vaccineName}
                  onChange={(e) => setNewVaccine({ ...newVaccine, vaccineName: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select vaccine...</option>
                  <option value="DHPP">DHPP</option>
                  <option value="Rabies">Rabies</option>
                  <option value="FVRCP">FVRCP</option>
                  <option value="Bordetella">Bordetella</option>
                  <option value="Lyme">Lyme</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dose</label>
                <Input
                  value={newVaccine.dose}
                  onChange={(e) => setNewVaccine({ ...newVaccine, dose: e.target.value })}
                  placeholder="e.g., 1ml"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date Administered</label>
                <Input
                  type="date"
                  value={newVaccine.dateAdministered}
                  onChange={(e) => setNewVaccine({ ...newVaccine, dateAdministered: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Veterinarian</label>
                <select
                  value={newVaccine.vetSignature}
                  onChange={(e) => setNewVaccine({ ...newVaccine, vetSignature: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="Dr. Sarah Wilson">Dr. Sarah Wilson</option>
                  <option value="Dr. Mike Davis">Dr. Mike Davis</option>
                  <option value="Dr. Lisa Garcia">Dr. Lisa Garcia</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Batch Number</label>
                <Input
                  value={newVaccine.batchNumber}
                  onChange={(e) => setNewVaccine({ ...newVaccine, batchNumber: e.target.value })}
                  placeholder="Batch number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Manufacturer</label>
                <Input
                  value={newVaccine.manufacturer}
                  onChange={(e) => setNewVaccine({ ...newVaccine, manufacturer: e.target.value })}
                  placeholder="Manufacturer"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowAddVaccine(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddVaccine}>Add Vaccine</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
