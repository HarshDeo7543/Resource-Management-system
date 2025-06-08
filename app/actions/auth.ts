"use server"

import { cookies } from "next/headers"
import { userModel } from "@/lib/models/user"
import { activityModel } from "@/lib/models/activity"
import { redirect } from "next/navigation"

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    const user = await userModel.verifyCredentials(email, password)

    if (!user) {
      return { success: false, message: "Invalid email or password" }
    }

    // Set cookies for authentication
    const cookieStore = cookies()
    cookieStore.set("userId", user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })
    cookieStore.set("userRole", user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })
    cookieStore.set("userName", user.name, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    // Log activity
    activityModel.create({
      action: "Login",
      entity_type: "user",
      entity_id: user.id,
      performed_by: user.id,
    })

    return { success: true, user }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, message: "An error occurred during login" }
  }
}

export async function logout() {
  const cookieStore = cookies()

  // Get the user ID before clearing cookies for activity logging
  const userId = cookieStore.get("userId")?.value

  // Clear authentication cookies
  cookieStore.delete("userId")
  cookieStore.delete("userRole")
  cookieStore.delete("userName")

  // Log activity if we have a user ID
  if (userId) {
    activityModel.create({
      action: "Logout",
      entity_type: "user",
      entity_id: Number.parseInt(userId),
      performed_by: Number.parseInt(userId),
    })
  }

  redirect("/login")
}

export async function getCurrentUser() {
  const cookieStore = cookies()
  const userId = cookieStore.get("userId")?.value

  if (!userId) {
    return null
  }

  try {
    const user = userModel.getById(Number.parseInt(userId))
    return user || null
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

export async function getUserRole() {
  const cookieStore = cookies()
  return cookieStore.get("userRole")?.value || null
}

export async function getUserName() {
  const cookieStore = cookies()
  return cookieStore.get("userName")?.value || null
}

export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return user
}

export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth()

  if (!allowedRoles.includes(user.role)) {
    redirect("/dashboard")
  }

  return user
}
