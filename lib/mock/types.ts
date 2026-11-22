import type {
  AppointmentStatus,
  CustomerAppointment,
  PaymentStatus,
} from "@/lib/dashboard"
import type { Service } from "@/lib/services"

export type MockService = Service & {
  active: boolean
}

export type MockCustomerProfile = {
  id: string
  name: string
  email: string
  phone: string
  createdAt: string
  blocked: boolean
}

export type MockCustomerAppointment = CustomerAppointment & {
  customer: MockCustomerProfile
}

export type MockTransaction = {
  id: string
  appointmentId: string
  customerId: string
  customerName: string
  serviceName: string
  amount: number
  status: PaymentStatus
  recordedAt: string
}

export type MockServiceInput = Omit<MockService, "id">

export type AppointmentStatusChange =
  | Extract<AppointmentStatus, "confirmed" | "rejected" | "cancelled" | "completed">
