"use client"
import { requireRole } from "@/app/actions/auth"
import { userModel } from "@/lib/models/user"
import ResourceForm from "@/components/resource-form"
import { useRouter } from "next/navigation"

export default async function RegisterResourcePage() {
  // Only admin and power users can register resources
  await requireRole(["admin", "poweruser"])

  // Get all users for the assigned user dropdown
  const users = userModel.getAll()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#2C3E50]">Register New Resource</h1>
          <p className="text-gray-600">Add a new resource to the system</p>
        </div>

        <ResourceForm users={users} />
      </div>
    </div>
  )
}
