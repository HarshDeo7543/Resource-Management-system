// app/resources/register/page.tsx
import { requireRole } from "@/app/actions/auth"
import { userModel } from "@/lib/models/user"
import ResourceForm from "@/components/resource-form"

export default async function RegisterResourcePage() {
  // Server‐side guard
  await requireRole(["admin", "poweruser"])

  // Server‐side fetch of users for assignment dropdown
  const users = userModel.getAll()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-[#2C3E50]">Register New Resource</h1>
        <p className="text-gray-600">Add a new resource to the system</p>

        {/* Pass users down to the client form */}
        <ResourceForm users={users} />
      </div>
    </div>
  )
}
