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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#2C3E50]">Edit User</h1>
          <p className="text-gray-600">Update user information</p>
        </div>

        <UserForm user={user} isEdit={true} />
      </div>
    </div>
  )
}
