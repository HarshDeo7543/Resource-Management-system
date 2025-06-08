import { getResourceById } from "@/app/actions/resources"
import { requireRole } from "@/app/actions/auth"
import { userModel } from "@/lib/models/user"
import ResourceForm from "@/components/resource-form"
import { notFound } from "next/navigation"

export default async function EditResourcePage({ params }: { params: { id: string } }) {
  // Only admin and power users can edit resources
  await requireRole(["admin", "poweruser"])

  const resourceId = Number.parseInt(params.id)
  const { resource } = await getResourceById(resourceId)

  if (!resource) {
    notFound()
  }

  // Get all users for the assigned user dropdown
  const users = userModel.getAll()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#2C3E50]">Edit Resource</h1>
          <p className="text-gray-600">Update resource information</p>
        </div>

        <ResourceForm users={users} resource={resource} isEdit={true} />
      </div>
    </div>
  )
}
