import { getUserById } from "@/app/actions/users"
import { requireRole } from "@/app/actions/auth"
import UserForm from "@/components/user-form"
import { notFound } from "next/navigation"

export default async function EditUserPage({ params }: { params: { id: string } }) {
  // Only admins can edit users
  await requireRole(["admin"])

  const userId = Number.parseInt(params.id)
  const { user } = await getUserById(userId)

  if (!user) {
    notFound()
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-6 border-b bg-white">
        <div>
          <h1 className="text-3xl font-bold text-[#2C3E50]">Edit User</h1>
          <p className="text-gray-600">Update user information</p>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            <UserForm user={user} isEdit={true} />
          </div>
        </div>
      </div>
    </div>
  )
}
