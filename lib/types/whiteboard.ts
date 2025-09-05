export interface WhiteboardRow {
  id: string
  clinic_id: string
  apptTimeISO: string
  checkedInAtISO?: string | null
  attendingAtISO?: string | null
  completedAtISO?: string | null
  client: string
  patient: string
  apptType: string
  confirmed: boolean
  complaint: string
  provider: string
  createdBy?: string | null
  invoices: string
  sno: number
  status: "scheduled" | "waiting" | "attending" | "completed" | "no_show" | "cancelled"
  photoUrl?: string | null
}

export interface WhiteboardFilters {
  dateISO: string
  show: "all" | "waiting" | "attending" | "completed" | "scheduled"
  providerId?: string
  apptType?: string
  q?: string // search query
}