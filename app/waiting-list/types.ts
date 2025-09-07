export interface WhiteboardRow {
  id: string
  clinic_id: string
  apptTimeISO: string
  checkedInAtISO: string | null
  attendingAtISO: string | null
  completedAtISO: string | null
  client: string
  patient: string
  apptType: string
  confirmed: boolean
  complaint: string
  provider: string
  createdBy: string
  invoices: string
  sno: number
  status: "waiting" | "attending" | "completed" | "no_show" | "cancelled"
  photoUrl: string | null
  // Additional fields for waiting list functionality
  patient_id: string
  pet_id: string
  priority: "low" | "normal" | "high" | "urgent"
  reason: string
  notes?: string
  estimated_duration?: number
}

export interface WhiteboardFilters {
  dateISO: string
  show: "all" | "waiting" | "attending" | "completed" | "scheduled"
  providerId: string
  apptType: string
  q: string
}

export interface PatientSearchResult {
  id: string
  name: string
  email: string
  phone: string
  pets: PetSearchResult[]
}

export interface PetSearchResult {
  id: string
  name: string
  species: string
  breed: string
  age: number
}

export interface WhiteboardStats {
  total: number
  waiting: number
  attending: number
  completed: number
  averageWaitTime: number
}