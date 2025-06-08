"use server"

import { activityModel } from "@/lib/models/activity"
import { requireAuth } from "./auth"

export async function getRecentActivities(limit = 5) {
  await requireAuth()

  try {
    const activities = activityModel.getRecent(limit)
    return { success: true, activities }
  } catch (error) {
    console.error("Get recent activities error:", error)
    return { success: false, message: "Failed to fetch recent activities" }
  }
}

export async function getActivitiesByEntity(entityType: string, entityId: number) {
  await requireAuth()

  try {
    const activities = activityModel.getByEntity(entityType, entityId)
    return { success: true, activities }
  } catch (error) {
    console.error("Get activities by entity error:", error)
    return { success: false, message: "Failed to fetch activities" }
  }
}

export async function getActivitiesByUser(userId: number, limit = 100) {
  await requireAuth()

  try {
    const activities = activityModel.getByUser(userId, limit)
    return { success: true, activities }
  } catch (error) {
    console.error("Get activities by user error:", error)
    return { success: false, message: "Failed to fetch activities" }
  }
}
