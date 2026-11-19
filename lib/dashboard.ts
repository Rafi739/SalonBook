export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "cancelled"
  | "completed"

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded"

export type CustomerAppointment = {
  id: string
  serviceName: string
  appointmentDate: string
  timeSlot: string
  price: {
    amount: number
    currency: string
  }
  paymentStatus: PaymentStatus
  status: AppointmentStatus
}
