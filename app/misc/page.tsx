"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Plus, Tag, Users, Paperclip, Search, Calendar, Download } from "lucide-react"

interface MiscNote {
  id: string
  title: string
  content: string
  type: "note" | "task" | "reminder" | "idea"
  tags: string[]
  attachments: Attachment[]
  assignedTo?: string
  createdBy: string
  createdAt: string
  updatedAt: string
  priority: "low" | "medium" | "high"
  status: "active" | "completed" | "archived"
  dueDate?: string
}

interface Attachment {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploadedAt: string
}

export default function MiscPage() {
  const [activeTab, setActiveTab] = useState("notes")
  const [showAddNote, setShowAddNote] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTag, setSelectedTag] = useState("all")

  const [notes, setNotes] = useState<MiscNote[]>([
    {
      id: "1",
      title: "Clinic Renovation Plans",
      content:
        "Planning to renovate the waiting area next month. Need to coordinate with contractors and ensure minimal disruption to operations.",
      type: "note",
      tags: ["renovation", "planning", "facilities"],
      attachments: [
        {
          id: "att1",
          name: "renovation_blueprint.pdf",
          type: "application/pdf",
          size: 2048000,
          url: "/files/renovation_blueprint.pdf",
          uploadedAt: "2024-01-15T10:00:00Z",
        },
      ],
      assignedTo: "Dr. Sarah Wilson",
      createdBy: "Dr. Sarah Wilson",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
      priority: "high",
      status: "active",
      dueDate: "2024-02-15",
    },
    {
      id: "2",
      title: "Staff Training Schedule",
      content:
        "Organize quarterly training sessions for all staff members. Topics include new equipment usage and emergency procedures.",
      type: "task",
      tags: ["training", "staff", "education"],
      attachments: [],
      assignedTo: "Dr. Mike Davis",
      createdBy: "Dr. Sarah Wilson",
      createdAt: "2024-01-10T14:30:00Z",
      updatedAt: "2024-01-10T14:30:00Z",
      priority: "medium",
      status: "active",
      dueDate: "2024-03-01",
    },
    {
      id: "3",
      title: "Equipment Maintenance Log",
      content: "Regular maintenance completed on X-ray machine and ultrasound equipment. Next service due in 6 months.",
      type: "note",
      tags: ["maintenance", "equipment", "log"],
      attachments: [
        {
          id: "att2",
          name: "maintenance_report.pdf",
          type: "application/pdf",
          size: 1024000,
          url: "/files/maintenance_report.pdf",
          uploadedAt: "2024-01-12T09:00:00Z",
        },
      ],
      createdBy: "Dr. Lisa Garcia",
      createdAt: "2024-01-12T09:00:00Z",
      updatedAt: "2024-01-12T09:00:00Z",
      priority: "low",
      status: "completed",
    },
    {
      id: "4",
      title: "New Microchip Scanner",
      content:
        "Research and evaluate new microchip scanner options. Current scanner is outdated and needs replacement.",
      type: "idea",
      tags: ["equipment", "microchip", "upgrade"],
      attachments: [],
      createdBy: "Dr. Mike Davis",
      createdAt: "2024-01-08T16:00:00Z",
      updatedAt: "2024-01-08T16:00:00Z",
      priority: "medium",
      status: "active",
    },
  ])

  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    type: "note" as "note" | "task" | "reminder" | "idea",
    tags: [] as string[],
    assignedTo: "",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: "",
  })

  const [newTag, setNewTag] = useState("")

  const staff = ["Dr. Sarah Wilson", "Dr. Mike Davis", "Dr. Lisa Garcia", "Nurse Jennifer", "Receptionist Mary"]

  const allTags = Array.from(new Set(notes.flatMap((note) => note.tags)))

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTag = selectedTag === "all" || note.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  })

  const handleAddNote = () => {
    if (!newNote.title || !newNote.content) return

    const note: MiscNote = {
      id: Date.now().toString(),
      ...newNote,
      attachments: [],
      createdBy: "Dr. Sarah Wilson",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "active",
    }

    setNotes([note, ...notes])
    setNewNote({
      title: "",
      content: "",
      type: "note",
      tags: [],
      assignedTo: "",
      priority: "medium",
      dueDate: "",
    })
    setShowAddNote(false)
  }

  const addTag = () => {
    if (newTag && !newNote.tags.includes(newTag)) {
      setNewNote({
        ...newNote,
        tags: [...newNote.tags, newTag],
      })
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setNewNote({
      ...newNote,
      tags: newNote.tags.filter((tag) => tag !== tagToRemove),
    })
  }

  const updateNoteStatus = (noteId: string, status: "active" | "completed" | "archived") => {
    setNotes(
      notes.map((note) => (note.id === noteId ? { ...note, status, updatedAt: new Date().toISOString() } : note)),
    )
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "note":
        return "bg-blue-100 text-blue-800"
      case "task":
        return "bg-green-100 text-green-800"
      case "reminder":
        return "bg-yellow-100 text-yellow-800"
      case "idea":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
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
      case "active":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const stats = {
    total: notes.length,
    active: notes.filter((n) => n.status === "active").length,
    completed: notes.filter((n) => n.status === "completed").length,
    tasks: notes.filter((n) => n.type === "task").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Miscellaneous Module</h1>
          <p className="text-gray-600 mt-2">Internal notes, tasks, and custom tools</p>
        </div>
        <Button onClick={() => setShowAddNote(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Note
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <FileText className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Notes</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <Calendar className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <Users className="h-5 w-5 text-purple-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-purple-600">{stats.tasks}</div>
              <div className="text-sm text-gray-600">Tasks</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <Tag className="h-5 w-5 text-orange-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-orange-600">{allTags.length}</div>
              <div className="text-sm text-gray-600">Tags</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="p-2 border rounded-md"
              >
                <option value="all">All Tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notes">All Notes</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="ideas">Ideas</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="mt-6">
          <div className="space-y-4">
            {filteredNotes.map((note) => (
              <Card key={note.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-lg">{note.title}</h3>
                        <Badge className={getTypeColor(note.type)}>{note.type}</Badge>
                        <Badge className={getPriorityColor(note.priority)}>{note.priority}</Badge>
                        <Badge className={getStatusColor(note.status)}>{note.status}</Badge>
                      </div>
                      <p className="text-gray-700 mb-3">{note.content}</p>

                      {/* Tags */}
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {note.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Attachments */}
                      {note.attachments.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium mb-2">Attachments:</h4>
                          <div className="space-y-1">
                            {note.attachments.map((attachment) => (
                              <div key={attachment.id} className="flex items-center gap-2 text-sm">
                                <Paperclip className="h-4 w-4 text-gray-400" />
                                <span>{attachment.name}</span>
                                <span className="text-gray-500">({formatFileSize(attachment.size)})</span>
                                <Button size="sm" variant="ghost">
                                  <Download className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Created by: {note.createdBy}</span>
                        {note.assignedTo && <span>Assigned to: {note.assignedTo}</span>}
                        <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
                        {note.dueDate && (
                          <span className="text-orange-600">Due: {new Date(note.dueDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {note.status === "active" && (
                        <>
                          <Button size="sm" onClick={() => updateNoteStatus(note.id, "completed")}>
                            Complete
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => updateNoteStatus(note.id, "archived")}>
                            Archive
                          </Button>
                        </>
                      )}
                      {note.status === "completed" && (
                        <Button size="sm" variant="outline" onClick={() => updateNoteStatus(note.id, "archived")}>
                          Archive
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredNotes.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <div className="space-y-4">
            {filteredNotes
              .filter((note) => note.type === "task")
              .map((note) => (
                <Card key={note.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-lg">{note.title}</h3>
                          <Badge className={getPriorityColor(note.priority)}>{note.priority}</Badge>
                          <Badge className={getStatusColor(note.status)}>{note.status}</Badge>
                        </div>
                        <p className="text-gray-700 mb-3">{note.content}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {note.assignedTo && <span>Assigned to: {note.assignedTo}</span>}
                          {note.dueDate && (
                            <span className="text-orange-600">Due: {new Date(note.dueDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      {note.status === "active" && (
                        <Button size="sm" onClick={() => updateNoteStatus(note.id, "completed")}>
                          Complete Task
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="ideas" className="mt-6">
          <div className="space-y-4">
            {filteredNotes
              .filter((note) => note.type === "idea")
              .map((note) => (
                <Card key={note.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-lg">{note.title}</h3>
                      <Badge className={getTypeColor(note.type)}>{note.type}</Badge>
                    </div>
                    <p className="text-gray-700 mb-3">{note.content}</p>
                    <div className="text-sm text-gray-500">
                      Created by: {note.createdBy} on {new Date(note.createdAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="archived" className="mt-6">
          <div className="space-y-4">
            {filteredNotes
              .filter((note) => note.status === "archived")
              .map((note) => (
                <Card key={note.id} className="opacity-75">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-lg">{note.title}</h3>
                          <Badge className={getTypeColor(note.type)}>{note.type}</Badge>
                          <Badge className={getStatusColor(note.status)}>{note.status}</Badge>
                        </div>
                        <p className="text-gray-700 mb-3">{note.content}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => updateNoteStatus(note.id, "active")}>
                        Restore
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Note Modal */}
      {showAddNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add New Note</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  placeholder="Note title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={newNote.type}
                  onChange={(e) => setNewNote({ ...newNote, type: e.target.value as any })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="note">Note</option>
                  <option value="task">Task</option>
                  <option value="reminder">Reminder</option>
                  <option value="idea">Idea</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  rows={4}
                  className="w-full p-2 border rounded-md"
                  placeholder="Note content"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={newNote.priority}
                  onChange={(e) => setNewNote({ ...newNote, priority: e.target.value as any })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              {newNote.type === "task" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Assign To</label>
                    <select
                      value={newNote.assignedTo}
                      onChange={(e) => setNewNote({ ...newNote, assignedTo: e.target.value })}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select staff member...</option>
                      {staff.map((member) => (
                        <option key={member} value={member}>
                          {member}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Due Date</label>
                    <Input
                      type="date"
                      value={newNote.dueDate}
                      onChange={(e) => setNewNote({ ...newNote, dueDate: e.target.value })}
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Tags</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag"
                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                  />
                  <Button type="button" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {newNote.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowAddNote(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddNote}>Add Note</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
