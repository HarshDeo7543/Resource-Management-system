import db from "../db"

export interface Resource {
  id: number
  reg_number: string
  resource_type: string
  manufacturer?: string
  model?: string
  serial_number: string
  processor?: string
  ram?: string
  storage?: string
  operating_system?: string
  purchase_date?: string
  warranty_expiry?: string
  location?: string
  assigned_user_id?: number
  warranty_provider?: string
  support_contact?: string
  comments?: string
  status: "Active" | "Retired"
  date_created: string
}

export interface ResourceWithUser extends Resource {
  assigned_user_name?: string
  assigned_user_role?: string
}

export interface ResourceCreateInput {
  resource_type: string
  manufacturer?: string
  model?: string
  serial_number: string
  processor?: string
  ram?: string
  storage?: string
  operating_system?: string
  purchase_date?: string
  warranty_expiry?: string
  location?: string
  assigned_user_id?: number
  warranty_provider?: string
  support_contact?: string
  comments?: string
  status?: "Active" | "Retired"
}

export interface ResourceUpdateInput {
  resource_type?: string
  manufacturer?: string
  model?: string
  serial_number?: string
  processor?: string
  ram?: string
  storage?: string
  operating_system?: string
  purchase_date?: string
  warranty_expiry?: string
  location?: string
  assigned_user_id?: number
  warranty_provider?: string
  support_contact?: string
  comments?: string
  status?: "Active" | "Retired"
}

export const resourceModel = {
  // Get all resources with user information
  getAll: (): ResourceWithUser[] => {
    return db
      .prepare(`
      SELECT 
        r.*,
        u.name as assigned_user_name,
        u.role as assigned_user_role
      FROM resources r
      LEFT JOIN users u ON r.assigned_user_id = u.id
    `)
      .all()
  },

  // Get resource by ID with user information
  getById: (id: number): ResourceWithUser | undefined => {
    return db
      .prepare(`
      SELECT 
        r.*,
        u.name as assigned_user_name,
        u.role as assigned_user_role
      FROM resources r
      LEFT JOIN users u ON r.assigned_user_id = u.id
      WHERE r.id = ?
    `)
      .get(id)
  },

  // Get resources by assigned user ID
  getByUserId: (userId: number): ResourceWithUser[] => {
    return db
      .prepare(`
      SELECT 
        r.*,
        u.name as assigned_user_name,
        u.role as assigned_user_role
      FROM resources r
      LEFT JOIN users u ON r.assigned_user_id = u.id
      WHERE r.assigned_user_id = ?
    `)
      .all(userId)
  },

  // Search resources
  search: (query: string): ResourceWithUser[] => {
    const searchTerm = `%${query}%`
    return db
      .prepare(`
      SELECT 
        r.*,
        u.name as assigned_user_name,
        u.role as assigned_user_role
      FROM resources r
      LEFT JOIN users u ON r.assigned_user_id = u.id
      WHERE 
        r.reg_number LIKE ? OR
        r.resource_type LIKE ? OR
        r.manufacturer LIKE ? OR
        r.model LIKE ? OR
        r.serial_number LIKE ? OR
        r.location LIKE ? OR
        u.name LIKE ?
    `)
      .all(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm)
  },

  // Create new resource
  create: (resourceData: ResourceCreateInput): number => {
    // Generate registration number
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "")
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    const regNumber = `${resourceData.resource_type.toUpperCase()}-REG-${timestamp}-${randomNum}`

    const result = db
      .prepare(`
      INSERT INTO resources (
        reg_number, resource_type, manufacturer, model, serial_number,
        processor, ram, storage, operating_system, purchase_date,
        warranty_expiry, location, assigned_user_id, warranty_provider,
        support_contact, comments, status, date_created
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
      .run(
        regNumber,
        resourceData.resource_type,
        resourceData.manufacturer || null,
        resourceData.model || null,
        resourceData.serial_number,
        resourceData.processor || null,
        resourceData.ram || null,
        resourceData.storage || null,
        resourceData.operating_system || null,
        resourceData.purchase_date || null,
        resourceData.warranty_expiry || null,
        resourceData.location || null,
        resourceData.assigned_user_id || null,
        resourceData.warranty_provider || null,
        resourceData.support_contact || null,
        resourceData.comments || null,
        resourceData.status || "Active",
        new Date().toISOString(),
      )

    return result.lastInsertRowid as number
  },

  // Update resource
  update: (id: number, resourceData: ResourceUpdateInput): void => {
    const resource = db.prepare("SELECT * FROM resources WHERE id = ?").get(id)
    if (!resource) throw new Error("Resource not found")

    db.prepare(`
      UPDATE resources SET
        resource_type = COALESCE(?, resource_type),
        manufacturer = COALESCE(?, manufacturer),
        model = COALESCE(?, model),
        serial_number = COALESCE(?, serial_number),
        processor = COALESCE(?, processor),
        ram = COALESCE(?, ram),
        storage = COALESCE(?, storage),
        operating_system = COALESCE(?, operating_system),
        purchase_date = COALESCE(?, purchase_date),
        warranty_expiry = COALESCE(?, warranty_expiry),
        location = COALESCE(?, location),
        assigned_user_id = COALESCE(?, assigned_user_id),
        warranty_provider = COALESCE(?, warranty_provider),
        support_contact = COALESCE(?, support_contact),
        comments = COALESCE(?, comments),
        status = COALESCE(?, status)
      WHERE id = ?
    `).run(
      resourceData.resource_type || null,
      resourceData.manufacturer || null,
      resourceData.model || null,
      resourceData.serial_number || null,
      resourceData.processor || null,
      resourceData.ram || null,
      resourceData.storage || null,
      resourceData.operating_system || null,
      resourceData.purchase_date || null,
      resourceData.warranty_expiry || null,
      resourceData.location || null,
      resourceData.assigned_user_id || null,
      resourceData.warranty_provider || null,
      resourceData.support_contact || null,
      resourceData.comments || null,
      resourceData.status || null,
      id,
    )
  },

  // Delete resource
  delete: (id: number): void => {
    db.prepare("DELETE FROM resources WHERE id = ?").run(id)
  },

  // Count resources
  count: (): number => {
    const result = db.prepare("SELECT COUNT(*) as count FROM resources").get()
    return result.count
  },

  // Count resources by status
  countByStatus: (): { Active: number; Retired: number } => {
    const counts = {
      Active: 0,
      Retired: 0,
    }

    const rows = db.prepare("SELECT status, COUNT(*) as count FROM resources GROUP BY status").all()
    rows.forEach((row: any) => {
      if (row.status in counts) {
        counts[row.status as keyof typeof counts] = row.count
      }
    })

    return counts
  },

  // Count resources by type
  countByType: (): Record<string, number> => {
    const counts: Record<string, number> = {}

    const rows = db.prepare("SELECT resource_type, COUNT(*) as count FROM resources GROUP BY resource_type").all()
    rows.forEach((row: any) => {
      counts[row.resource_type] = row.count
    })

    return counts
  },

  // Get recent resources (last 7 days)
  getRecent: (limit = 5): ResourceWithUser[] => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    return db
      .prepare(`
      SELECT 
        r.*,
        u.name as assigned_user_name,
        u.role as assigned_user_role
      FROM resources r
      LEFT JOIN users u ON r.assigned_user_id = u.id
      WHERE r.date_created > ?
      ORDER BY r.date_created DESC
      LIMIT ?
    `)
      .all(sevenDaysAgo.toISOString(), limit)
  },
}
