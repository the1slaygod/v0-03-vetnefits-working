"use client"

import { useState } from "react"
import Sidebar from "../../components/Sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, CheckCircle, Plus, Phone, Calendar, User, AlertCircle } from "lucide-react"

interface WaitingListEntry {
  id: string
  petName: string
  ownerName: string
  ownerPhone: string
  ownerEmail: string
  species: string
  breed: string
  reason: string
  priority: "low" | "medium" | "high" | "emergency"
  status: "waiting" | "contacted" | "scheduled" | "cancelled"
  addedAt: string
  estimatedWait: string
  notes?: string
  contactedAt?: string
  scheduledFor?: string
}

export default function WaitingListPage() {
  const [activeTab, setActiveTab] = useState("waiting")
  const [showAddEntry, setShowAddEntry] = useState(false)

  const [entries, setEntries] = useState<WaitingListEntry[]>([
    {
      id: "1",
      petName: "Max",
      ownerName: "John Smith",
      ownerPhone: "(555) 123-4567",
      ownerEmail: "john@example.com",
      species: "Dog",
      breed: "Golden Retriever",
      reason: "Annual checkup",
      priority: "low",
      status: "waiting",
      addedAt: "2024-01-25T10:00:00Z",
      estimatedWait: "2-3 days",
      notes: "Prefers morning appointments",
    },
    {
      id: "2",
      petName: "Luna",
      ownerName: "Sarah Johnson",
      ownerPhone: "(555) 987-6543",
      ownerEmail: "sarah@example.com",
      species: "Cat",
      breed: "Persian",
      reason: "Vaccination",
      priority: "medium",
      status: "contacted",
      addedAt: "2024-01-24T14:30:00Z",
      estimatedWait: "1-2 days",
      contactedAt: "2024-01-25T09:00:00Z",
    },
    {
      id: "3",
      petName: "Rocky",
      ownerName: "Mike Davis",
      ownerPhone: "(555) 456-7890",
      ownerEmail: "mike@example.com",
      species: "Dog",
      breed: "German Shepherd",
      reason: "Limping",
      priority: "high",
      status: "scheduled",
      addedAt: "2024-01-23T16:00:00Z",
      estimatedWait: "Same day",
      scheduledFor: "2024-01-26T11:00:00Z",
    },
  ])

  const [newEntry, setNewEntry] = useState({
    petName: "",
    ownerName: "",
    ownerPhone: "",
    ownerEmail: "",
    species: "",
    breed: "",
    reason: "",
    priority: "medium" as "low" | "medium" | "high" | "emergency",
    estimatedWait: "",
    notes: "",
  })

  const handleAddEntry = () => {
    if (!newEntry.petName || !newEntry.ownerName || !newEntry.ownerPhone || !newEntry.reason) return

    const entry: WaitingListEntry = {
      id: Date.now().toString(),
      ...newEntry,
      status: "waiting",
      addedAt: new Date().toISOString(),
    }

    setEntries([entry, ...entries])
    setNewEntry({
      petName: "",
      ownerName: "",
      ownerPhone: "",
      ownerEmail: "",
      species: "",
      breed: "",
      reason: "",
      priority: "medium",
      estimatedWait: "",
      notes: "",
    })
    setShowAddEntry(false)
  }

  const updateEntryStatus = (entryId: string, status: "waiting" | "contacted" | "scheduled" | "cancelled") => {
    setEntries(
      entries.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              status,
              contactedAt: status === "contacted" ? new Date().toISOString() : entry.contactedAt,
            }
          : entry,
      ),
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "emergency":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-blue-100 text-blue-800"
      case "contacted":
        return "bg-yellow-100 text-yellow-800"
      case "scheduled":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "waiting":
        return <Clock className="h-4 w-4" />
      case "contacted":
        return <Phone className="h-4 w-4" />
      case "scheduled":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const stats = {
    waiting: entries.filter((e) => e.status === "waiting").length,
    contacted: entries.filter((e) => e.status === "contacted").length,
    scheduled: entries.filter((e) => e.status === "scheduled").length,
    total: entries.length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Waiting List</h1>
              <p className="text-gray-600 mt-2">Manage appointment requests and queue</p>
            </div>
            <Button onClick={() => setShowAddEntry(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add to List
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="flex items-center p-4">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats.waiting}</div>
                  <div className="text-sm text-gray-600">Waiting</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-4">
                <Phone className="h-5 w-5 text-yellow-600 mr-2" />
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{stats.contacted}</div>
                  <div className="text-sm text-gray-600">Contacted</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-4">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.scheduled}</div>
                  <div className="text-sm text-gray-600">Scheduled</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-4">
                <User className="h-5 w-5 text-purple-600 mr-2" />
                <div>
                  <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total Entries</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="waiting">Waiting ({stats.waiting})</TabsTrigger>
              <TabsTrigger value="contacted">Contacted ({stats.contacted})</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled ({stats.scheduled})</TabsTrigger>
              <TabsTrigger value="all">All Entries</TabsTrigger>
            </TabsList>

            <TabsContent value="waiting" className="mt-6">
              <div className="space-y-4">
                {entries
                  .filter((entry) => entry.status === "waiting")
                  .map((entry) => (
                    <Card key={entry.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium">{entry.petName}</h3>
                              <Badge className={getPriorityColor(entry.priority)}>{entry.priority}</Badge>
                              <Badge className={getStatusColor(entry.status)}>
                                {getStatusIcon(entry.status)}
                                <span className="ml-1">{entry.status}</span>
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <p>
                                  <strong>Owner:</strong> {entry.ownerName}
                                </p>
                                <p>
                                  <strong>Phone:</strong> {entry.ownerPhone}
                                </p>
                                <p>
                                  <strong>Email:</strong> {entry.ownerEmail}
                                </p>
                              </div>
                              <div>
                                <p>
                                  <strong>Species:</strong> {entry.species}
                                </p>
                                <p>
                                  <strong>Breed:</strong> {entry.breed}
                                </p>
                                <p>
                                  <strong>Reason:</strong> {entry.reason}
                                </p>
                              </div>
                              <div>
                                <p>
                                  <strong>Added:</strong> {new Date(entry.addedAt).toLocaleDateString()}
                                </p>
                                <p>
                                  <strong>Est. Wait:</strong> {entry.estimatedWait}
                                </p>
                                {entry.notes && (
                                  <p>
                                    <strong>Notes:</strong> {entry.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            <Button size="sm" onClick={() => updateEntryStatus(entry.id, "contacted")}>
                              <Phone className="h-4 w-4 mr-1" />
                              Contact
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateEntryStatus(entry.id, "scheduled")}
                            >
                              <Calendar className="h-4 w-4 mr-1" />
                              Schedule
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateEntryStatus(entry.id, "cancelled")}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                {entries.filter((entry) => entry.status === "waiting").length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No one waiting</h3>
                      <p className="text-gray-600">The waiting list is empty</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="contacted" className="mt-6">
              <div className="space-y-4">
                {entries
                  .filter((entry) => entry.status === "contacted")
                  .map((entry) => (
                    <Card key={entry.id} className="border-l-4 border-l-yellow-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium">{entry.petName}</h3>
                              <Badge className={getPriorityColor(entry.priority)}>{entry.priority}</Badge>
                              <Badge className={getStatusColor(entry.status)}>
                                {getStatusIcon(entry.status)}
                                <span className="ml-1">{entry.status}</span>
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <p>
                                  <strong>Owner:</strong> {entry.ownerName}
                                </p>
                                <p>
                                  <strong>Phone:</strong> {entry.ownerPhone}
                                </p>
                                <p>
                                  <strong>Reason:</strong> {entry.reason}
                                </p>
                              </div>
                              <div>
                                <p>
                                  <strong>Added:</strong> {new Date(entry.addedAt).toLocaleDateString()}
                                </p>
                                {entry.contactedAt && (
                                  <p>
                                    <strong>Contacted:</strong> {new Date(entry.contactedAt).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            <Button size="sm" onClick={() => updateEntryStatus(entry.id, "scheduled")}>
                              <Calendar className="h-4 w-4 mr-1" />
                              Schedule
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => updateEntryStatus(entry.id, "waiting")}>
                              Back to Waiting
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="scheduled" className="mt-6">
              <div className="space-y-4">
                {entries
                  .filter((entry) => entry.status === "scheduled")
                  .map((entry) => (
                    <Card key={entry.id} className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium">{entry.petName}</h3>
                              <Badge className={getStatusColor(entry.status)}>
                                {getStatusIcon(entry.status)}
                                <span className="ml-1">{entry.status}</span>
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <p>
                                  <strong>Owner:</strong> {entry.ownerName}
                                </p>
                                <p>
                                  <strong>Phone:</strong> {entry.ownerPhone}
                                </p>
                              </div>
                              <div>
                                {entry.scheduledFor && (
                                  <p>
                                    <strong>Scheduled:</strong> {new Date(entry.scheduledFor).toLocaleString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="all" className="mt-6">
              <div className="space-y-4">
                {entries.map((entry) => (
                  <Card
                    key={entry.id}
                    className={`border-l-4 ${
                      entry.status === "waiting"
                        ? "border-l-blue-500"
                        : entry.status === "contacted"
                          ? "border-l-yellow-500"
                          : entry.status === "scheduled"
                            ? "border-l-green-500"
                            : "border-l-gray-500"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{entry.petName}</h3>
                            <Badge className={getPriorityColor(entry.priority)}>{entry.priority}</Badge>
                            <Badge className={getStatusColor(entry.status)}>
                              {getStatusIcon(entry.status)}
                              <span className="ml-1">{entry.status}</span>
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p>
                                <strong>Owner:</strong> {entry.ownerName}
                              </p>
                              <p>
                                <strong>Phone:</strong> {entry.ownerPhone}
                              </p>
                            </div>
                            <div>
                              <p>
                                <strong>Reason:</strong> {entry.reason}
                              </p>
                              <p>
                                <strong>Added:</strong> {new Date(entry.addedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Add Entry Modal */}
          {showAddEntry && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">Add to Waiting List</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Pet Name</label>
                    <Input
                      value={newEntry.petName}
                      onChange={(e) => setNewEntry({ ...newEntry, petName: e.target.value })}
                      placeholder="Pet name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Owner Name</label>
                    <Input
                      value={newEntry.ownerName}
                      onChange={(e) => setNewEntry({ ...newEntry, ownerName: e.target.value })}
                      placeholder="Owner name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <Input
                      value={newEntry.ownerPhone}
                      onChange={(e) => setNewEntry({ ...newEntry, ownerPhone: e.target.value })}
                      placeholder="Phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                      type="email"
                      value={newEntry.ownerEmail}
                      onChange={(e) => setNewEntry({ ...newEntry, ownerEmail: e.target.value })}
                      placeholder="Email address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Species</label>
                    <select
                      value={newEntry.species}
                      onChange={(e) => setNewEntry({ ...newEntry, species: e.target.value })}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select species...</option>
                      <option value="Dog">Dog</option>
                      <option value="Cat">Cat</option>
                      <option value="Bird">Bird</option>
                      <option value="Rabbit">Rabbit</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Breed</label>
                    <Input
                      value={newEntry.breed}
                      onChange={(e) => setNewEntry({ ...newEntry, breed: e.target.value })}
                      placeholder="Breed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Reason for Visit</label>
                    <Input
                      value={newEntry.reason}
                      onChange={(e) => setNewEntry({ ...newEntry, reason: e.target.value })}
                      placeholder="Reason for visit"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Priority</label>
                    <select
                      value={newEntry.priority}
                      onChange={(e) => setNewEntry({ ...newEntry, priority: e.target.value as any })}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Estimated Wait</label>
                    <Input
                      value={newEntry.estimatedWait}
                      onChange={(e) => setNewEntry({ ...newEntry, estimatedWait: e.target.value })}
                      placeholder="e.g., 2-3 days"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Notes</label>
                    <textarea
                      value={newEntry.notes}
                      onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                      rows={3}
                      className="w-full p-2 border rounded-md"
                      placeholder="Additional notes"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setShowAddEntry(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddEntry}>Add to List</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
