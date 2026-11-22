import type {
  AppointmentStatus,
  CustomerAppointment,
  PaymentStatus,
} from "@/lib/dashboard"

import type {
  MockCustomerAppointment,
  MockCustomerProfile,
  MockService,
  MockTransaction,
} from "./types"

export const mockServices: MockService[] = [
  {
    id: "64f000000000000000000001",
    name: "Signature Precision Cut",
    category: "unisex",
    description: "A tailored consultation and precision cut finished to suit your texture and routine.",
    durationMinutes: 60,
    price: 45,
    imageUrl: "",
    active: true,
  },
  {
    id: "64f000000000000000000002",
    name: "Classic Fade",
    category: "mens",
    description: "A clean fade, detailed blend, and sharp finish with styling advice.",
    durationMinutes: 45,
    price: 35,
    imageUrl: "",
    active: true,
  },
  {
    id: "64f000000000000000000003",
    name: "Gloss and Blow-Dry",
    category: "womens",
    description: "A shine-enhancing gloss treatment and smooth salon blow-dry.",
    durationMinutes: 75,
    price: 58,
    imageUrl: "",
    active: true,
  },
  {
    id: "64f000000000000000000004",
    name: "Dimensional Balayage",
    category: "womens",
    description: "Hand-painted highlights that create soft, natural-looking dimension.",
    durationMinutes: 150,
    price: 145,
    imageUrl: "",
    active: true,
  },
  {
    id: "64f000000000000000000005",
    name: "Beard Sculpt",
    category: "mens",
    description: "Beard shaping, hot-towel preparation, and a polished, defined finish.",
    durationMinutes: 30,
    price: 28,
    imageUrl: "",
    active: true,
  },
  {
    id: "64f000000000000000000006",
    name: "Curl Care Ritual",
    category: "unisex",
    description: "A hydration treatment, curl-by-curl shaping, and lightweight styling.",
    durationMinutes: 90,
    price: 72,
    imageUrl: "",
    active: true,
  },
  {
    id: "64f000000000000000000007",
    name: "Scalp Reset",
    category: "unisex",
    description: "A clarifying scalp treatment with massage and restorative conditioning.",
    durationMinutes: 50,
    price: 52,
    imageUrl: "",
    active: true,
  },
  {
    id: "64f000000000000000000008",
    name: "Event Styling",
    category: "womens",
    description: "A polished occasion hairstyle tailored to your outfit and event.",
    durationMinutes: 75,
    price: 68,
    imageUrl: "",
    active: true,
  },
  {
    id: "64f000000000000000000009",
    name: "Seasonal Express Trim",
    category: "mens",
    description: "A quick maintenance trim for a tidy shape between full cuts.",
    durationMinutes: 25,
    price: 24,
    imageUrl: "",
    active: false,
  },
]

export const mockCustomerProfiles: MockCustomerProfile[] = [
  {
    id: "mock-customer-1",
    name: "Avery Morgan",
    email: "avery@example.com",
    phone: "+1 555 010 2201",
    createdAt: "2026-08-12T09:30:00.000Z",
    blocked: false,
  },
  {
    id: "mock-customer-2",
    name: "Jordan Lee",
    email: "jordan@example.com",
    phone: "+1 555 010 2202",
    createdAt: "2026-07-03T14:15:00.000Z",
    blocked: false,
  },
  {
    id: "mock-customer-3",
    name: "Samira Patel",
    email: "samira@example.com",
    phone: "+1 555 010 2203",
    createdAt: "2026-09-18T11:45:00.000Z",
    blocked: false,
  },
  {
    id: "mock-customer-4",
    name: "Theo Williams",
    email: "theo@example.com",
    phone: "+1 555 010 2204",
    createdAt: "2026-10-05T16:20:00.000Z",
    blocked: true,
  },
]

function appointment(
  id: string,
  customer: MockCustomerProfile,
  service: MockService,
  date: string,
  time: string,
  status: AppointmentStatus,
  paymentStatus: PaymentStatus,
  message: string,
): MockCustomerAppointment {
  const now = "2026-11-20T10:00:00.000Z"
  const customerAppointment: CustomerAppointment = {
    id,
    serviceId: service.id,
    customerId: customer.id,
    appointmentDate: date,
    timeSlot: time,
    message,
    servicePrice: service.price,
    paymentStatus,
    status,
    createdAt: "2026-11-18T09:15:00.000Z",
    updatedAt: now,
    service: {
      id: service.id,
      serviceName: service.name,
      category: service.category === "mens"
        ? "Men's"
        : service.category === "womens"
          ? "Women's"
          : "Unisex",
      duration: service.durationMinutes,
      image: service.imageUrl,
    },
  }

  return { ...customerAppointment, customer }
}

export const mockAppointments: MockCustomerAppointment[] = [
  appointment("mock-appointment-1", mockCustomerProfiles[0], mockServices[0], "2026-11-24", "10:30", "confirmed", "paid", "Keep the natural texture around my jawline."),
  appointment("mock-appointment-2", mockCustomerProfiles[0], mockServices[2], "2026-12-02", "13:00", "pending", "unpaid", "I would like something soft and low-maintenance."),
  appointment("mock-appointment-3", mockCustomerProfiles[1], mockServices[1], "2026-11-21", "15:30", "completed", "paid", "A medium fade with a clean neckline."),
  appointment("mock-appointment-4", mockCustomerProfiles[1], mockServices[6], "2026-11-28", "11:00", "pending", "unpaid", "My scalp feels tight after workouts."),
  appointment("mock-appointment-5", mockCustomerProfiles[2], mockServices[5], "2026-12-05", "09:30", "confirmed", "paid", "Please focus on moisture and gentle curl shaping."),
  appointment("mock-appointment-6", mockCustomerProfiles[2], mockServices[3], "2026-12-12", "14:00", "pending", "unpaid", "Warm caramel tones, if possible."),
  appointment("mock-appointment-7", mockCustomerProfiles[3], mockServices[4], "2026-11-19", "16:30", "completed", "paid", "Keep the beard slightly fuller."),
  appointment("mock-appointment-8", mockCustomerProfiles[0], mockServices[7], "2026-10-28", "12:15", "cancelled", "unpaid", "Cancelled because of a schedule change."),
]

export const mockTransactions: MockTransaction[] = [
  {
    id: "mock-transaction-1",
    appointmentId: "mock-appointment-1",
    customerId: "mock-customer-1",
    customerName: "Avery Morgan",
    serviceName: "Signature Precision Cut",
    amount: 45,
    status: "paid",
    recordedAt: "2026-11-20T09:10:00.000Z",
  },
  {
    id: "mock-transaction-2",
    appointmentId: "mock-appointment-3",
    customerId: "mock-customer-2",
    customerName: "Jordan Lee",
    serviceName: "Classic Fade",
    amount: 35,
    status: "paid",
    recordedAt: "2026-11-21T16:20:00.000Z",
  },
  {
    id: "mock-transaction-3",
    appointmentId: "mock-appointment-5",
    customerId: "mock-customer-3",
    customerName: "Samira Patel",
    serviceName: "Curl Care Ritual",
    amount: 72,
    status: "paid",
    recordedAt: "2026-12-05T10:15:00.000Z",
  },
  {
    id: "mock-transaction-4",
    appointmentId: "mock-appointment-7",
    customerId: "mock-customer-4",
    customerName: "Theo Williams",
    serviceName: "Beard Sculpt",
    amount: 28,
    status: "paid",
    recordedAt: "2026-11-19T17:05:00.000Z",
  },
  {
    id: "mock-transaction-5",
    appointmentId: "mock-appointment-2",
    customerId: "mock-customer-1",
    customerName: "Avery Morgan",
    serviceName: "Gloss and Blow-Dry",
    amount: 58,
    status: "unpaid",
    recordedAt: "2026-11-18T12:30:00.000Z",
  },
]
