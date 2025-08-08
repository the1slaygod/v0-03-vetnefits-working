"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckSquare, Plus, Calendar, AlertTriangle, Clock, Mail, Bell, User } from "lucide-react"

interface ComplianceTask {
  id: string
  petId: string
  petName: string
  ownerName: string
  ownerEmail: string
  ownerPhone: string
  task: string
  description: string
  dueDate: string
  status: "pending" | "completed" | "overdue" | "cancelled"
  priority: "low" | "medium" | "high"
  assignedTo: string
  createdBy: string
  createdAt: string
  completedAt?: string
  notes?: string
  reminderSent?: boolean
  nextReminderDate?: string
}

interface Pet {
  id: string
  name: string
  species: string
  breed: string
  ownerName: string
  ownerEmail: string
  ownerPhone: string
}

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState("pending")
  const [showAddTask, setShowAddTask] = useState(false)
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)

  // Mock data
  const [pets] = useState<Pet[]>([
    {
      id: "1",
      name: "Buddy",
      species: "Dog",
      breed: "Golden Retriever",
      ownerName: "John Smith",
      ownerEmail: "john@example.com",
      ownerPhone: "(555) 123-4567",
    },
    {
      id: "2",
      name: "Whiskers",
      species: "Cat",
      breed: "Persian",
      ownerName: "Sarah Johnson",
      ownerEmail: "sarah@example.com",
      ownerPhone: "(555) 987-6543",
    },
  ])

  const [tasks, setTasks] = useState<ComplianceTask[]>([
    {
      id: "1",
      petId: "1",
      petName: "Buddy",
      ownerName: "John Smith",
      ownerEmail: "john@example.com",
      ownerPhone: "(555) 123-4567",
      task: "2nd Rabies Dose",
      description: "Second rabies vaccination due",
      dueDate: "2024-08-14",
      status: "pending",
      priority: "high",
      assignedTo: "Dr. Sarah Wilson",
      createdBy: "Dr. Sarah Wilson",
      createdAt: "2024-01-15T10:00:00Z",
      notes: "Owner has been notified",
      reminderSent: true,
      nextReminderDate: "2024-08-10",
    },
    {
      id: "2",
      petId: "1",
      petName: "Buddy",
      ownerName: "John Smith",
      ownerEmail: "john@example.com",
      ownerPhone: "(555) 123-4567",
      task: "Heartworm Prevention",
      description: "Monthly heartworm medication due",
      dueDate: "2024-02-01",
      status: "overdue",
      priority: "medium",
      assignedTo: "Dr. Sarah Wilson",
      createdBy: "Dr. Sarah Wilson",
      createdAt: "2024-01-01T10:00:00Z",
      notes: "Owner missed last dose",
    },
    {
      id: "3",
      petId: "2",
      petName: "Whiskers",
      ownerName: "Sarah Johnson",
      ownerEmail: "sarah@example.com",
      ownerPhone: "(555) 987-6543",
      task: "Dental Cleaning Follow-up",
      description: "Post-dental cleaning check-up",
      dueDate: "2024-01-20",
      status: "completed",
      priority: "low",
      assignedTo: "Dr. Mike Davis",
      createdBy: "Dr. Mike Davis",
      createdAt: "2024-01-10T10:00:00Z",
      completedAt: "2024-01-20T14:30:00Z",
      notes: "Completed successfully",
    },
  ])

  const [newTask, setNewTask] = useState({
    petId: "",
    task: "",
    description: "",
    dueDate: "",
    priority: "medium" as "low" | "medium" | "high",
    assignedTo: "Dr. Sarah Wilson",
  })

  const handleAddTask = () => {
    if (!newTask.petId || !newTask.task || !newTask.dueDate) return

    const pet = pets.find((p) => p.id === newTask.petId)
    if (!pet) return

    const task: ComplianceTask = {
      id: Date.now().toString(),
      petId: newTask.petId,
      petName: pet.name,
      ownerName: pet.ownerName,
      ownerEmail: pet.ownerEmail,
      ownerPhone: pet.ownerPhone,
      task: newTask.task,
      description: newTask.description,
      dueDate: newTask.dueDate,
      status: "pending",
      priority: newTask.priority,
      assignedTo: newTask.assignedTo,
      createdBy: "Dr. Sarah Wilson",
      createdAt: new Date().toISOString(),
    }

    setTasks([task, ...tasks])
    setNewTask({
      petId: "",
      task: "",
      description: "",
      dueDate: "",
      priority: "medium",
      assignedTo: "Dr. Sarah Wilson",
    })
    setShowAddTask(false)
  }

  const updateTaskStatus = (taskId: string, status: "pending" | "completed" | "overdue" | "cancelled") => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status,
              completedAt: status === "completed" ? new Date().toISOString() : task.completedAt,
            }
          : task,
      ),
    )
  }

  const sendReminder = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              reminderSent: true,
              nextReminderDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            }
          : task,
      ),
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "completed":
        return <CheckSquare className="h-4 w-4" />
      case "overdue":
        return <AlertTriangle className="h-4 w-4" />
      case "cancelled":
        return <Clock className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString()
  }

  // Update overdue tasks
  const updatedTasks = tasks.map((task) => ({
    ...task,
    status: task.status === "pending" && isOverdue(task.dueDate) ? ("overdue" as const) : task.status,
  }))

  const stats = {
    pending: updatedTasks.filter((t) => t.status === "pending").length,
    overdue: updatedTasks.filter((t) => t.status === "overdue").length,
    completed: updatedTasks.filter((t) => t.status === "completed").length,
    total: updatedTasks.length,
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance Module</h1>
          <p className="text-gray-600 mt-2">Track follow-ups, missed doses, and client actions</p>
        </div>
        <Button onClick={() => setShowAddTask(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <Clock className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending Tasks</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <div className="text-sm text-gray-600">Overdue</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <CheckSquare className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <User className="h-5 w-5 text-purple-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({stats.overdue})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <div className="space-y-4">
            {updatedTasks
              .filter((task) => task.status === "pending")
              .map((task) => (
                <Card key={task.id} className="border-l-4 border-l-yellow-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{task.task}</h3>
                          <Badge className={getStatusColor(task.status)}>
                            {getStatusIcon(task.status)}
                            <span className="ml-1">{task.status}</span>
                          </Badge>
                          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p>
                              <strong>Pet:</strong> {task.petName}
                            </p>
                            <p>
                              <strong>Owner:</strong> {task.ownerName}
                            </p>
                            <p>
                              <strong>Phone:</strong> {task.ownerPhone}
                            </p>
                          </div>
                          <div>
                            <p>
                              <strong>Due Date:</strong> {new Date(task.dueDate).toLocaleDateString()}
                            </p>
                            <p>
                              <strong>Assigned To:</strong> {task.assignedTo}
                            </p>
                            <p>
                              <strong>Created:</strong> {new Date(task.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p>
                              <strong>Description:</strong> {task.description}
                            </p>
                            {task.notes && (
                              <p>
                                <strong>Notes:</strong> {task.notes}
                              </p>
                            )}
                            {task.reminderSent && (
                              <p className="text-green-600">
                                <strong>Reminder Sent</strong>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Button size="sm" onClick={() => updateTaskStatus(task.id, "completed")}>
                          <CheckSquare className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sendReminder(task.id)}
                          disabled={task.reminderSent}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          {task.reminderSent ? "Sent" : "Remind"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => updateTaskStatus(task.id, "cancelled")}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            {updatedTasks.filter((task) => task.status === "pending").length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pending tasks</h3>
                  <p className="text-gray-600">All tasks are up to date!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="overdue" className="mt-6">
          <div className="space-y-4">
            {updatedTasks
              .filter((task) => task.status === "overdue")
              .map((task) => (
                <Card key={task.id} className="border-l-4 border-l-red-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{task.task}</h3>
                          <Badge className={getStatusColor(task.status)}>
                            {getStatusIcon(task.status)}
                            <span className="ml-1">{task.status}</span>
                          </Badge>
                          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p>
                              <strong>Pet:</strong> {task.petName}
                            </p>
                            <p>
                              <strong>Owner:</strong> {task.ownerName}
                            </p>
                            <p>
                              <strong>Phone:</strong> {task.ownerPhone}
                            </p>
                          </div>
                          <div>
                            <p className="text-red-600">
                              <strong>Due Date:</strong> {new Date(task.dueDate).toLocaleDateString()}
                            </p>
                            <p>
                              <strong>Days Overdue:</strong>{" "}
                              {Math.floor(
                                (new Date().getTime() - new Date(task.dueDate).getTime()) / (1000 * 60 * 60 * 24),
                              )}
                            </p>
                            <p>
                              <strong>Assigned To:</strong> {task.assignedTo}
                            </p>
                          </div>
                          <div>
                            <p>
                              <strong>Description:</strong> {task.description}
                            </p>
                            {task.notes && (
                              <p>
                                <strong>Notes:</strong> {task.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Button size="sm" onClick={() => updateTaskStatus(task.id, "completed")}>
                          <CheckSquare className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => sendReminder(task.id)}>
                          <Bell className="h-4 w-4 mr-1" />
                          Urgent Reminder
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            {updatedTasks.filter((task) => task.status === "overdue").length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No overdue tasks</h3>
                  <p className="text-gray-600">Great job staying on top of everything!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="space-y-4">
            {updatedTasks
              .filter((task) => task.status === "completed")
              .map((task) => (
                <Card key={task.id} className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{task.task}</h3>
                          <Badge className={getStatusColor(task.status)}>
                            {getStatusIcon(task.status)}
                            <span className="ml-1">{task.status}</span>
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p>
                              <strong>Pet:</strong> {task.petName}
                            </p>
                            <p>
                              <strong>Owner:</strong> {task.ownerName}
                            </p>
                          </div>
                          <div>
                            <p>
                              <strong>Due Date:</strong> {new Date(task.dueDate).toLocaleDateString()}
                            </p>
                            <p>
                              <strong>Completed:</strong>{" "}
                              {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : "N/A"}
                            </p>
                            <p>
                              <strong>Assigned To:</strong> {task.assignedTo}
                            </p>
                          </div>
                          <div>
                            <p>
                              <strong>Description:</strong> {task.description}
                            </p>
                            {task.notes && (
                              <p>
                                <strong>Notes:</strong> {task.notes}
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
            {updatedTasks.map((task) => (
              <Card
                key={task.id}
                className={`border-l-4 ${
                  task.status === "pending"
                    ? "border-l-yellow-500"
                    : task.status === "overdue"
                      ? "border-l-red-500"
                      : task.status === "completed"
                        ? "border-l-green-500"
                        : "border-l-gray-500"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{task.task}</h3>
                        <Badge className={getStatusColor(task.status)}>
                          {getStatusIcon(task.status)}
                          <span className="ml-1">{task.status}</span>
                        </Badge>
                        <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p>
                            <strong>Pet:</strong> {task.petName}
                          </p>
                          <p>
                            <strong>Owner:</strong> {task.ownerName}
                          </p>
                        </div>
                        <div>
                          <p>
                            <strong>Due Date:</strong> {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                          <p>
                            <strong>Assigned To:</strong> {task.assignedTo}
                          </p>
                        </div>
                        <div>
                          <p>
                            <strong>Description:</strong> {task.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    {task.status === "pending" && (
                      <div className="flex flex-col gap-2 ml-4">
                        <Button size="sm" onClick={() => updateTaskStatus(task.id, "completed")}>
                          <CheckSquare className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Compliance Task</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Pet</label>
                <select
                  value={newTask.petId}
                  onChange={(e) => setNewTask({ ...newTask, petId: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select pet...</option>
                  {pets.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name} - {pet.ownerName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Task</label>
                <Input
                  value={newTask.task}
                  onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
                  placeholder="e.g., 2nd Rabies Dose"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Task description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as "low" | "medium" | "high" })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Assigned To</label>
                <select
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="Dr. Sarah Wilson">Dr. Sarah Wilson</option>
                  <option value="Dr. Mike Davis">Dr. Mike Davis</option>
                  <option value="Dr. Lisa Garcia">Dr. Lisa Garcia</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowAddTask(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTask}>Add Task</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
