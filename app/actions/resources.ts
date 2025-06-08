"use server"

import { resourceModel, type ResourceCreateInput, type ResourceUpdateInput } from "@/lib/models/resource"
import { activityModel } from "@/lib/models/activity"
import { requireAuth, requireRole } from "./auth"
import { revalidatePath } from "next/cache"

export async function getResources() {
  await requireAuth()

  try {
    const resources = resourceModel.getAll()
    return { success: true, resources }
  } catch (error) {
    console.error("Get resources error:", error)
    return { success: false, message: "Failed to fetch resources" }
  }
}

export async function getResourceById(id: number) {
  await requireAuth()

  try {
    const resource = resourceModel.getById(id)

    if (!resource) {
      return { success: false, message: "Resource not found" }
    }

    return { success: true, resource }
  } catch (error) {
    console.error("Get resource error:", error)
    return { success: false, message: "Failed to fetch resource" }
  }
}

export async function getResourcesByUserId(userId: number) {
  await requireAuth()

  try {
    const resources = resourceModel.getByUserId(userId)
    return { success: true, resources }
  } catch (error) {
    console.error("Get resources by user error:", error)
    return { success: false, message: "Failed to fetch resources" }
  }
}

export async function createResource(formData: FormData) {
  const user = await requireRole(["admin", "poweruser"])

  try {
    const resourceData: ResourceCreateInput = {
      resource_type: formData.get("resourceType") as string,
      manufacturer: formData.get("manufacturer") as string,
      model: formData.get("model") as string,
      serial_number: formData.get("serialNumber") as string,
      processor: formData.get("processor") as string,
      ram: formData.get("ram") as string,
      storage: formData.get("storage") as string,
      operating_system: formData.get("operatingSystem") as string,
      purchase_date: formData.get("purchaseDate") as string,
      warranty_expiry: formData.get("warrantyExpiry") as string,
      location: formData.get("location") as string,
      warranty_provider: formData.get("warrantyProvider") as string,
      support_contact: formData.get("supportContact") as string,
      comments: formData.get("comments") as string,
    }

    // Handle assigned user
    const assignedUserValue = formData.get("assignedUser") as string
    if (assignedUserValue && !isNaN(Number.parseInt(assignedUserValue))) {
      resourceData.assigned_user_id = Number.parseInt(assignedUserValue)
    }

    const resourceId = resourceModel.create(resourceData)

    // Log activity
    activityModel.create({
      action: "Created",
      entity_type: "resource",
      entity_id: resourceId,
      details: `Created ${resourceData.resource_type}`,
      performed_by: user.id,
    })

    revalidatePath("/resources")
    revalidatePath("/dashboard")

    return {
      success: true,
      message: "Resource created successfully",
      resourceId,
    }
  } catch (error) {
    console.error("Create resource error:", error)
    return { success: false, message: "Failed to create resource" }
  }
}

export async function updateResource(id: number, formData: FormData) {
  const user = await requireRole(["admin", "poweruser"])

  try {
    const resourceData: ResourceUpdateInput = {
      resource_type: formData.get("resourceType") as string,
      manufacturer: formData.get("manufacturer") as string,
      model: formData.get("model") as string,
      serial_number: formData.get("serialNumber") as string,
      processor: formData.get("processor") as string,
      ram: formData.get("ram") as string,
      storage: formData.get("storage") as string,
      operating_system: formData.get("operatingSystem") as string,
      purchase_date: formData.get("purchaseDate") as string,
      warranty_expiry: formData.get("warrantyExpiry") as string,
      location: formData.get("location") as string,
      warranty_provider: formData.get("warrantyProvider") as string,
      support_contact: formData.get("supportContact") as string,
      comments: formData.get("comments") as string,
      status: formData.get("status") as "Active" | "Retired",
    }

    // Handle assigned user
    const assignedUserValue = formData.get("assignedUser") as string
    if (assignedUserValue && !isNaN(Number.parseInt(assignedUserValue))) {
      resourceData.assigned_user_id = Number.parseInt(assignedUserValue)
    }

    resourceModel.update(id, resourceData)

    // Log activity
    activityModel.create({
      action: "Updated",
      entity_type: "resource",
      entity_id: id,
      details: `Updated ${resourceData.resource_type || "resource"}`,
      performed_by: user.id,
    })

    revalidatePath("/resources")
    revalidatePath(`/resources/${id}`)
    revalidatePath("/dashboard")

    return { success: true, message: "Resource updated successfully" }
  } catch (error) {
    console.error("Update resource error:", error)
    return { success: false, message: "Failed to update resource" }
  }
}

export async function deleteResource(id: number) {
  const user = await requireRole(["admin"])

  try {
    const resource = resourceModel.getById(id)

    if (!resource) {
      return { success: false, message: "Resource not found" }
    }

    resourceModel.delete(id)

    // Log activity
    activityModel.create({
      action: "Deleted",
      entity_type: "resource",
      entity_id: id,
      details: `Deleted ${resource.resource_type} (${resource.reg_number})`,
      performed_by: user.id,
    })

    revalidatePath("/resources")
    revalidatePath("/dashboard")

    return { success: true, message: "Resource deleted successfully" }
  } catch (error) {
    console.error("Delete resource error:", error)
    return { success: false, message: "Failed to delete resource" }
  }
}

export async function searchResources(query: string) {
  await requireAuth()

  try {
    const resources = resourceModel.search(query)
    return { success: true, resources }
  } catch (error) {
    console.error("Search resources error:", error)
    return { success: false, message: "Failed to search resources" }
  }
}

export async function getDashboardStats() {
  await requireAuth()

  try {
    const totalResources = resourceModel.count()
    const resourcesByStatus = resourceModel.countByStatus()
    const resourcesByType = resourceModel.countByType()
    const recentResources = resourceModel.getRecent(5)

    return {
      success: true,
      stats: {
        totalResources,
        resourcesByStatus,
        resourcesByType,
        recentResources,
      },
    }
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    return { success: false, message: "Failed to fetch dashboard statistics" }
  }
}
