import db from "../db"
import { hash, compare } from "bcrypt"

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
}

export const userModel = {
  // Get all users
  getAll: (): User[] => {
    return db
      .prepare(
        "SELECT id, name, email, role, designation, dob, aadhar_number, pan_number, room_number, date_created FROM users",
      )
      .all()
  },

  // Get user by ID
  getById: (id: number): User | undefined => {
    return db
      .prepare(
        "SELECT id, name, email, role, designation, dob, aadhar_number, pan_number, room_number, date_created FROM users WHERE id = ?",
      )
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
      INSERT INTO users (name, email, password, role, designation, dob, aadhar_number, pan_number, room_number, date_created)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        room_number = COALESCE(?, room_number)
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
      id,
    )
  },

  // Delete user
  delete: (id: number): void => {
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
