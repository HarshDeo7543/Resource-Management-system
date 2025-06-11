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
      phone_number: formData.get("phoneNumber") as string,
      country_code: formData.get("countryCode") as string,
      emergency_contact_name: formData.get("emergencyContactName") as string,
      emergency_contact_relation: formData.get("emergencyContactRelation") as string,
      emergency_contact_phone: formData.get("emergencyContactPhone") as string,
      emergency_country_code: formData.get("emergencyCountryCode") as string,
      employee_id: formData.get("employeeId") as string,
      office_location: formData.get("officeLocation") as string,
      floor: formData.get("floor") as string,
      desk_number: formData.get("deskNumber") as string,
      office_phone: formData.get("officePhone") as string,
    }

    // Handle profile picture
    const profilePicture = formData.get("profilePicture") as File
    if (profilePicture && profilePicture.size > 0) {
      const userId = await userModel.create(userData)
      const profilePicturePath = await userModel.saveProfilePicture(userId, profilePicture)
      await userModel.update(userId, { profile_picture: profilePicturePath })

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
    } else {
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
    }
  } catch (error) {
    console.error("Create user error:", error)
    return { success: false, message: "Failed to create user" }
  }
}

export async function updateUser(id: number, formData: FormData) {
  const currentUser = await getCurrentUser()

  // Check if the user is updating their own profile or if they're an admin
  const isOwnProfile = currentUser?.id === id
  const isAdmin = currentUser?.role === "admin"

  if (!isOwnProfile && !isAdmin) {
    return { success: false, message: "You don't have permission to update this user" }
  }

  try {
    let userData: UserUpdateInput = {}

    // If admin, allow updating all fields
    if (isAdmin) {
      userData = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        role: formData.get("role") as "admin" | "poweruser" | "user",
        designation: formData.get("designation") as string,
        dob: formData.get("dob") as string,
        aadhar_number: formData.get("aadharNumber") as string,
        pan_number: formData.get("panNumber") as string,
        room_number: formData.get("roomNumber") as string,
        phone_number: formData.get("phoneNumber") as string,
        country_code: formData.get("countryCode") as string,
        emergency_contact_name: formData.get("emergencyContactName") as string,
        emergency_contact_relation: formData.get("emergencyContactRelation") as string,
        emergency_contact_phone: formData.get("emergencyContactPhone") as string,
        emergency_country_code: formData.get("emergencyCountryCode") as string,
        employee_id: formData.get("employeeId") as string,
        office_location: formData.get("officeLocation") as string,
        floor: formData.get("floor") as string,
        desk_number: formData.get("deskNumber") as string,
        office_phone: formData.get("officePhone") as string,
      }
    } else {
      // For regular users, only allow updating optional fields
      userData = {
        pan_number: formData.get("panNumber") as string,
        room_number: formData.get("roomNumber") as string,
        phone_number: formData.get("phoneNumber") as string,
        country_code: formData.get("countryCode") as string,
        emergency_contact_name: formData.get("emergencyContactName") as string,
        emergency_contact_relation: formData.get("emergencyContactRelation") as string,
        emergency_contact_phone: formData.get("emergencyContactPhone") as string,
        emergency_country_code: formData.get("emergencyCountryCode") as string,
        employee_id: formData.get("employeeId") as string,
        office_location: formData.get("officeLocation") as string,
        floor: formData.get("floor") as string,
        desk_number: formData.get("deskNumber") as string,
        office_phone: formData.get("officePhone") as string,
      }
    }

    // Password can be updated by any user (their own)
    const password = formData.get("password") as string
    if (password) {
      userData.password = password
    }

    // Handle profile picture
    const profilePicture = formData.get("profilePicture") as File
    if (profilePicture && profilePicture.size > 0) {
      const profilePicturePath = await userModel.saveProfilePicture(id, profilePicture)
      userData.profile_picture = profilePicturePath
    }

    await userModel.update(id, userData)

    // Log activity
    activityModel.create({
      action: "Updated",
      entity_type: "user",
      entity_id: id,
      details: isAdmin ? `Updated user profile` : `Updated own profile`,
      performed_by: currentUser!.id,
    })

    revalidatePath("/users")
    revalidatePath(`/users/${id}`)
    revalidatePath("/settings")
    revalidatePath("/dashboard")

    return { success: true, message: "User updated successfully" }
  } catch (error) {
    console.error("Update user error:", error)
    return { success: false, message: "Failed to update user" }
  }
}

export async function deleteUser(id: number) {
  await requireRole(["admin"])

  try {
    const user = userModel.getById(id)

    if (!user) {
      return { success: false, message: "User not found" }
    }

    // Prevent deleting yourself
    const currentUser = await getCurrentUser()
    if (currentUser?.id === id) {
      return { success: false, message: "You cannot delete your own account" }
    }

    userModel.delete(id)

    // Log activity
    activityModel.create({
      action: "Deleted",
      entity_type: "user",
      entity_id: id,
      details: `Deleted user ${user.name}`,
      performed_by: currentUser!.id,
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
