import db from "../db"
import { hash, compare } from "bcrypt"
import fs from "fs"
import path from "path"

export interface User {
  id: number
  name: string
  email: string
  role: "admin" | "poweruser" | "user"
  designation: string
  dob?: string
  aadhar_number?: string
  pan_number?: string
  room_number?: string
  profile_picture?: string
  phone_number?: string
  country_code?: string
  emergency_contact_name?: string
  emergency_contact_relation?: string
  emergency_contact_phone?: string
  emergency_country_code?: string
  employee_id?: string
  office_location?: string
  floor?: string
  desk_number?: string
  office_phone?: string
  date_created: string
}

export interface UserWithPassword extends User {
  password: string
}

export interface UserCreateInput {
  name: string
  email: string
  password: string
  role: "admin" | "poweruser" | "user"
  designation: string
  dob?: string
  aadhar_number?: string
  pan_number?: string
  room_number?: string
  profile_picture?: string
  phone_number?: string
  country_code?: string
  emergency_contact_name?: string
  emergency_contact_relation?: string
  emergency_contact_phone?: string
  emergency_country_code?: string
  employee_id?: string
  office_location?: string
  floor?: string
  desk_number?: string
  office_phone?: string
}

export interface UserUpdateInput {
  name?: string
  email?: string
  password?: string
  role?: "admin" | "poweruser" | "user"
  designation?: string
  dob?: string
  aadhar_number?: string
  pan_number?: string
  room_number?: string
  profile_picture?: string
  phone_number?: string
  country_code?: string
  emergency_contact_name?: string
  emergency_contact_relation?: string
  emergency_contact_phone?: string
  emergency_country_code?: string
  employee_id?: string
  office_location?: string
  floor?: string
  desk_number?: string
  office_phone?: string
}

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "public", "uploads", "profiles")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

export const userModel = {
  // Get all users
  getAll: (): User[] => {
    return db
      .prepare(`
        SELECT id, name, email, role, designation, dob, aadhar_number, pan_number, 
               room_number, profile_picture, phone_number, country_code, 
               emergency_contact_name, emergency_contact_relation, emergency_contact_phone, 
               emergency_country_code, employee_id, office_location, floor, 
               desk_number, office_phone, date_created 
        FROM users
      `)
      .all()
  },

  // Get user by ID
  getById: (id: number): User | undefined => {
    return db
      .prepare(`
        SELECT id, name, email, role, designation, dob, aadhar_number, pan_number, 
               room_number, profile_picture, phone_number, country_code, 
               emergency_contact_name, emergency_contact_relation, emergency_contact_phone, 
               emergency_country_code, employee_id, office_location, floor, 
               desk_number, office_phone, date_created 
        FROM users WHERE id = ?
      `)
      .get(id)
  },

  // Get user by email
  getByEmail: (email: string): UserWithPassword | undefined => {
    return db.prepare("SELECT * FROM users WHERE email = ?").get(email)
  },

  // Create new user
  create: async (userData: UserCreateInput): Promise<number> => {
    const hashedPassword = await hash(userData.password, 10)

    const result = db
      .prepare(`
        INSERT INTO users (
          name, email, password, role, designation, dob, aadhar_number, pan_number, 
          room_number, profile_picture, phone_number, country_code, 
          emergency_contact_name, emergency_contact_relation, emergency_contact_phone, 
          emergency_country_code, employee_id, office_location, floor, 
          desk_number, office_phone, date_created
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        userData.name,
        userData.email,
        hashedPassword,
        userData.role,
        userData.designation,
        userData.dob || null,
        userData.aadhar_number || null,
        userData.pan_number || null,
        userData.room_number || null,
        userData.profile_picture || null,
        userData.phone_number || null,
        userData.country_code || null,
        userData.emergency_contact_name || null,
        userData.emergency_contact_relation || null,
        userData.emergency_contact_phone || null,
        userData.emergency_country_code || null,
        userData.employee_id || null,
        userData.office_location || null,
        userData.floor || null,
        userData.desk_number || null,
        userData.office_phone || null,
        new Date().toISOString(),
      )

    return result.lastInsertRowid as number
  },

  // Update user
  update: async (id: number, userData: UserUpdateInput): Promise<void> => {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id)
    if (!user) throw new Error("User not found")

    let hashedPassword = user.password
    if (userData.password) {
      hashedPassword = await hash(userData.password, 10)
    }

    db.prepare(`
      UPDATE users SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        password = COALESCE(?, password),
        role = COALESCE(?, role),
        designation = COALESCE(?, designation),
        dob = COALESCE(?, dob),
        aadhar_number = COALESCE(?, aadhar_number),
        pan_number = COALESCE(?, pan_number),
        room_number = COALESCE(?, room_number),
        profile_picture = COALESCE(?, profile_picture),
        phone_number = COALESCE(?, phone_number),
        country_code = COALESCE(?, country_code),
        emergency_contact_name = COALESCE(?, emergency_contact_name),
        emergency_contact_relation = COALESCE(?, emergency_contact_relation),
        emergency_contact_phone = COALESCE(?, emergency_contact_phone),
        emergency_country_code = COALESCE(?, emergency_country_code),
        employee_id = COALESCE(?, employee_id),
        office_location = COALESCE(?, office_location),
        floor = COALESCE(?, floor),
        desk_number = COALESCE(?, desk_number),
        office_phone = COALESCE(?, office_phone)
      WHERE id = ?
    `).run(
      userData.name || null,
      userData.email || null,
      hashedPassword,
      userData.role || null,
      userData.designation || null,
      userData.dob || null,
      userData.aadhar_number || null,
      userData.pan_number || null,
      userData.room_number || null,
      userData.profile_picture || null,
      userData.phone_number || null,
      userData.country_code || null,
      userData.emergency_contact_name || null,
      userData.emergency_contact_relation || null,
      userData.emergency_contact_phone || null,
      userData.emergency_country_code || null,
      userData.employee_id || null,
      userData.office_location || null,
      userData.floor || null,
      userData.desk_number || null,
      userData.office_phone || null,
      id,
    )
  },

  // Save profile picture
  saveProfilePicture: async (userId: number, file: File): Promise<string> => {
    const fileExtension = file.name.split(".").pop()
    const fileName = `user-${userId}-${Date.now()}.${fileExtension}`
    const filePath = path.join(uploadsDir, fileName)

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Save file to disk
    fs.writeFileSync(filePath, buffer)

    // Return the public URL path
    return `/uploads/profiles/${fileName}`
  },

  // Delete user
  delete: (id: number): void => {
    // Get user to check for profile picture
    const user = db.prepare("SELECT profile_picture FROM users WHERE id = ?").get(id) as User | undefined

    // Delete profile picture file if exists
    if (user?.profile_picture) {
      const filePath = path.join(process.cwd(), "public", user.profile_picture)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }

    db.prepare("DELETE FROM users WHERE id = ?").run(id)
  },

  // Count users by role
  countByRole: (): { admin: number; poweruser: number; user: number } => {
    const counts = {
      admin: 0,
      poweruser: 0,
      user: 0,
    }

    const rows = db.prepare("SELECT role, COUNT(*) as count FROM users GROUP BY role").all()
    rows.forEach((row: any) => {
      if (row.role in counts) {
        counts[row.role as keyof typeof counts] = row.count
      }
    })

    return counts
  },

  // Verify user credentials
  verifyCredentials: async (email: string, password: string): Promise<User | null> => {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as UserWithPassword | undefined

    if (!user) return null

    const passwordValid = await compare(password, user.password)
    if (!passwordValid) return null

    // Don't return the password
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  },
}
