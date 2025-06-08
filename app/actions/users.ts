"use server"

import { userModel, type UserCreateInput, type UserUpdateInput } from "@/lib/models/user"
import { activityModel } from "@/lib/models/activity"
import { getCurrentUser, requireAuth, requireRole } from "./auth"
import { revalidatePath } from "next/cache"

export async function getUsers() {
  await requireRole(["admin", "poweruser"])

  try {
    const users = userModel.getAll()
    return { success: true, users }
  } catch (error) {
    console.error("Get users error:", error)
    return { success: false, message: "Failed to fetch users" }
  }
}

export async function getUserById(id: number) {
  await requireAuth()

  try {
    const user = userModel.getById(id)

    if (!user) {
      return { success: false, message: "User not found" }
    }

    return { success: true, user }
  } catch (error) {
    console.error("Get user error:", error)
    return { success: false, message: "Failed to fetch user" }
  }
}

export async function createUser(formData: FormData) {
  await requireRole(["admin"])

  try {
    const userData: UserCreateInput = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      role: formData.get("role") as "admin" | "poweruser" | "user",
      designation: formData.get("designation") as string,
      dob: formData.get("dob") as string,
      aadhar_number: formData.get("aadharNumber") as string,
      pan_number: formData.get("panNumber") as string,
      room_number: formData.get("roomNumber") as string,
    }

    const userId = await userModel.create(userData)
    const currentUser = await getCurrentUser()

    // Log activity
    activityModel.create({
      action: "Created",
      entity_type: "user",
      entity_id: userId,
      details: `Created user ${userData.name} with role ${userData.role}`,
      performed_by: currentUser!.id,
    })

    revalidatePath("/users")
    revalidatePath("/dashboard")

    return {
      success: true,
      message: "User created successfully",
      userId,
    }
  } catch (error) {
    console.error("Create user error:", error)
    return { success: false, message: "Failed to create user" }
  }
}

export async function updateUser(id: number, formData: FormData) {
  await requireRole(["admin", "poweruser"])

  // Fetch target user
  const target = userModel.getById(id)
  if (!target) {
    return { success: false, message: "User not found" }
  }

  const currentUser = await getCurrentUser()!
  const currentRole = currentUser.role

  // Define hierarchy by array index: lower === less privilege
  const hierarchy = ["user", "poweruser", "admin"]
  const currentIndex = hierarchy.indexOf(currentRole)
  const targetIndex = hierarchy.indexOf(target.role)

  // Block if not admin AND current role is <= target role
  if (currentRole !== "admin" && currentIndex <= targetIndex) {
    return {
      success: false,
      message: "You do not have permission to modify this user."
    }
  }

  try {
    const userData: UserUpdateInput = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      role: formData.get("role") as "admin" | "poweruser" | "user",
      designation: formData.get("designation") as string,
      dob: formData.get("dob") as string,
      aadhar_number: formData.get("aadharNumber") as string,
      pan_number: formData.get("panNumber") as string,
      room_number: formData.get("roomNumber") as string,
    }

    const password = formData.get("password") as string
    if (password) userData.password = password

    await userModel.update(id, userData)
    const refresher = await getCurrentUser()!

    activityModel.create({
      action: "Updated",
      entity_type: "user",
      entity_id: id,
      details: `Updated user ${userData.name || "profile"}`,
      performed_by: refresher.id,
    })

    revalidatePath("/users")
    revalidatePath(`/users/${id}`)
    revalidatePath("/dashboard")

    return { success: true, message: "User updated successfully" }
  } catch (error) {
    console.error("Update user error:", error)
    return { success: false, message: "Failed to update user" }
  }
}



export async function deleteUser(id: number) {
  await requireRole(["admin", "poweruser"])

  const target = userModel.getById(id)
  if (!target) {
    return { success: false, message: "User not found" }
  }

  const currentUser = await getCurrentUser()!
  const currentRole = currentUser.role

  const hierarchy = ["user", "poweruser", "admin"]
  const currentIndex = hierarchy.indexOf(currentRole)
  const targetIndex = hierarchy.indexOf(target.role)

  if (currentRole !== "admin" && currentIndex <= targetIndex) {
    return { success: false, message: "You do not have permission to delete this user." }
  }

  if (currentUser.id === id) {
    return { success: false, message: "You cannot delete your own account" }
  }

  try {
    userModel.delete(id)
    activityModel.create({
      action: "Deleted",
      entity_type: "user",
      entity_id: id,
      details: `Deleted user ${target.name}`,
      performed_by: currentUser.id,
    })

    revalidatePath("/users")
    revalidatePath("/dashboard")

    return { success: true, message: "User deleted successfully" }
  } catch (error) {
    console.error("Delete user error:", error)
    return { success: false, message: "Failed to delete user" }
  }
}


export async function searchUsers(query: string) {
  await requireRole(["admin", "poweruser"])

  try {
    const users = userModel
      .getAll()
      .filter(
        (user) =>
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase()) ||
          user.designation.toLowerCase().includes(query.toLowerCase()),
      )

    return { success: true, users }
  } catch (error) {
    console.error("Search users error:", error)
    return { success: false, message: "Failed to search users" }
  }
}

export async function getUserStats() {
  await requireAuth()

  try {
    const userCounts = userModel.countByRole()

    return {
      success: true,
      stats: {
        totalUsers: userCounts.admin + userCounts.poweruser + userCounts.user,
        userCounts,
      },
    }
  } catch (error) {
    console.error("Get user stats error:", error)
    return { success: false, message: "Failed to fetch user statistics" }
  }
}
