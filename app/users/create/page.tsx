import { requireRole } from "@/app/actions/auth"
import UserForm from "@/components/user-form"

export default async function CreateUserPage() {
  // Only admins can create users
  await requireRole(["admin"])

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-6 border-b bg-white">
        <div>
          <h1 className="text-3xl font-bold text-[#2C3E50]">Create New User</h1>
          <p className="text-gray-600">Add a new user to the system</p>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            <UserForm />
          </div>
        </div>
      </div>
    </div>
  )
}
