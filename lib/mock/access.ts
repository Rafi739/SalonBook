import type {
  AppointmentHistoryResponse,
  AppointmentStatus,
  AppointmentSummary,
  CustomerAppointment,
} from "@/lib/dashboard"
import type { ServiceCategory } from "@/lib/services"

import {
  mockAppointments,
  mockCustomerProfiles,
  mockServices,
  mockTransactions,
} from "./data"
import type {
  MockCustomerAppointment,
  MockCustomerProfile,
  MockService,
  MockServiceInput,
  MockTransaction,
  AppointmentStatusChange,
} from "./types"

export function readServices(): MockService[] {
  return mockServices.map((service) => ({ ...service }))
}

export function readServiceById(id: string): MockService | null {
  const service = mockServices.find((item) => item.id === id)
  return service ? { ...service } : null
}

export function searchServices(query: string): MockService[] {
  const normalizedQuery = query.trim().toLocaleLowerCase()
  if (!normalizedQuery) {
    return readServices()
  }

  return mockServices
    .filter((service) => {
      const searchable = `${service.name} ${service.description}`.toLocaleLowerCase()
      return searchable.includes(normalizedQuery)
    })
    .map((service) => ({ ...service }))
}

export function filterServicesByCategory(
  category: ServiceCategory | "all",
): MockService[] {
  return mockServices
    .filter((service) => category === "all" || service.category === category)
    .map((service) => ({ ...service }))
}

export function sortServicesByPrice(
  services: readonly MockService[],
  order: "asc" | "desc",
): MockService[] {
  return [...services].sort((a, b) =>
    order === "asc" ? a.price - b.price : b.price - a.price,
  )
}

export function readCustomerAppointments(
  customerId = "mock-customer-1",
  page = 1,
  limit = 20,
): AppointmentHistoryResponse {
  const appointments = mockAppointments
    .filter((appointment) => appointment.customerId === customerId)
    .map((appointment) => ({ ...appointment, customer: { ...appointment.customer } }))
  const start = (page - 1) * limit
  const pagedAppointments = appointments.slice(start, start + limit)
  const totalPages = Math.max(1, Math.ceil(appointments.length / limit))

  return {
    appointments: pagedAppointments,
    pagination: {
      page,
      limit,
      total: appointments.length,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  }
}

export function readAdminAppointments(
  status?: AppointmentStatus,
): MockCustomerAppointment[] {
  return mockAppointments
    .filter((appointment) => status === undefined || appointment.status === status)
    .map((appointment) => ({ ...appointment, customer: { ...appointment.customer } }))
}

export function readCustomerAppointmentSummary(
  customerId = "mock-customer-1",
): AppointmentSummary {
  const appointments = mockAppointments.filter(
    (appointment) => appointment.customerId === customerId,
  )

  return {
    recentAppointments: appointments.slice(0, 3),
    total: appointments.length,
    pending: appointments.filter((appointment) => appointment.status === "pending").length,
    confirmed: appointments.filter((appointment) => appointment.status === "confirmed").length,
    completed: appointments.filter((appointment) => appointment.status === "completed").length,
  }
}

export function readUsers(): MockCustomerProfile[] {
  return mockCustomerProfiles.map((profile) => ({ ...profile }))
}

export function readTransactions(): MockTransaction[] {
  return mockTransactions.map((transaction) => ({ ...transaction }))
}

export function updateCustomerProfile(
  customerId: string,
  updates: Pick<MockCustomerProfile, "name" | "email" | "phone">,
): MockCustomerProfile {
  const profile = mockCustomerProfiles.find((item) => item.id === customerId)
  if (!profile) {
    throw new Error("The demo customer could not be found.")
  }

  Object.assign(profile, updates)
  for (const appointment of mockAppointments) {
    if (appointment.customerId === customerId) {
      appointment.customer = { ...profile }
    }
  }

  return { ...profile }
}

export function cancelPendingCustomerAppointment(
  appointmentId: string,
  customerId = "mock-customer-1",
): CustomerAppointment {
  const appointment = mockAppointments.find(
    (item) => item.id === appointmentId && item.customerId === customerId,
  )
  if (!appointment) {
    throw new Error("The demo appointment could not be found.")
  }
  if (appointment.status !== "pending") {
    throw new Error("Only pending appointments can be cancelled in demo mode.")
  }

  appointment.status = "cancelled"
  appointment.updatedAt = new Date().toISOString()
  return { ...appointment }
}

export function changeAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatusChange,
): MockCustomerAppointment {
  const appointment = mockAppointments.find((item) => item.id === appointmentId)
  if (!appointment) {
    throw new Error("The demo appointment could not be found.")
  }

  appointment.status = status
  appointment.updatedAt = new Date().toISOString()
  return { ...appointment, customer: { ...appointment.customer } }
}

export function addService(input: MockServiceInput): MockService {
  const service: MockService = {
    ...input,
    id: `mock-service-${Date.now().toString(36)}`,
  }
  mockServices.push(service)
  return { ...service }
}

export function updateService(
  serviceId: string,
  updates: Partial<MockServiceInput>,
): MockService {
  const service = mockServices.find((item) => item.id === serviceId)
  if (!service) {
    throw new Error("The demo service could not be found.")
  }

  Object.assign(service, updates)
  return { ...service }
}

export function setServiceActive(
  serviceId: string,
  active: boolean,
): MockService {
  return updateService(serviceId, { active })
}

export function deleteService(serviceId: string): void {
  const index = mockServices.findIndex((item) => item.id === serviceId)
  if (index === -1) {
    throw new Error("The demo service could not be found.")
  }
  mockServices.splice(index, 1)
}

export function setUserBlocked(
  customerId: string,
  blocked: boolean,
): MockCustomerProfile {
  const profile = mockCustomerProfiles.find((item) => item.id === customerId)
  if (!profile) {
    throw new Error("The demo user could not be found.")
  }

  profile.blocked = blocked
  return { ...profile }
}
