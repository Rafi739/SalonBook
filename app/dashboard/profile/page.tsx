import type { Metadata } from "next"

import { DashboardProfile } from "@/components/dashboard/dashboard-profile"

export const metadata: Metadata = {
  title: "My Profile",
}

export default function ProfilePage() {
  return <DashboardProfile />
}
