import { requireRole } from "@/app/actions/auth"
import UserForm from "@/components/user-form"

export default async function CreateUserPage() {
  // Only admins can create users
  await requireRole(["admin"])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#2C3E50]">Create New User</h1>
          <p className="text-gray-600">Add a new user to the system</p>
        </div>

        <UserForm />
      </div>
    </div>
  )
}
