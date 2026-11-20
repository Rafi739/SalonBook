export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "cancelled"
  | "completed"

export type PaymentStatus = "unpaid" | "paid"

export type AppointmentServiceSummary = {
  id: string
  serviceName: string
  category: "Men's" | "Women's" | "Unisex"
  duration: number
  image: string
}

export type CustomerAppointment = {
  id: string
  serviceId: string
  customerId: string
  appointmentDate: string
  timeSlot: string
  message: string
  servicePrice: number
  paymentStatus: PaymentStatus
  status: AppointmentStatus
  createdAt: string
  updatedAt: string
  service: AppointmentServiceSummary | null
}

export type AppointmentHistoryResponse = {
  appointments: CustomerAppointment[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export type AppointmentSummary = {
  recentAppointments: CustomerAppointment[]
  total: number
  pending: number
  confirmed: number
  completed: number
}
