import db from "../db"

export interface Activity {
  id: number
  action: string
  entity_type: string
  entity_id: number
  details?: string
  performed_by: number
  date_performed: string
  user_name?: string
}

export interface ActivityCreateInput {
  action: string
  entity_type: string
  entity_id: number
  details?: string
  performed_by: number
}

export const activityModel = {
  // Get all activities with user information
  getAll: (limit = 100): Activity[] => {
    return db
      .prepare(`
      SELECT 
        a.*,
        u.name as user_name
      FROM activity_log a
      JOIN users u ON a.performed_by = u.id
      ORDER BY a.date_performed DESC
      LIMIT ?
    `)
      .all(limit)
  },

  // Get recent activities
  getRecent: (limit = 5): Activity[] => {
    return db
      .prepare(`
      SELECT 
        a.*,
        u.name as user_name
      FROM activity_log a
      JOIN users u ON a.performed_by = u.id
      ORDER BY a.date_performed DESC
      LIMIT ?
    `)
      .all(limit)
  },

  // Get activities by entity
  getByEntity: (entityType: string, entityId: number): Activity[] => {
    return db
      .prepare(`
      SELECT 
        a.*,
        u.name as user_name
      FROM activity_log a
      JOIN users u ON a.performed_by = u.id
      WHERE a.entity_type = ? AND a.entity_id = ?
      ORDER BY a.date_performed DESC
    `)
      .all(entityType, entityId)
  },

  // Get activities by user
  getByUser: (userId: number, limit = 100): Activity[] => {
    return db
      .prepare(`
      SELECT 
        a.*,
        u.name as user_name
      FROM activity_log a
      JOIN users u ON a.performed_by = u.id
      WHERE a.performed_by = ?
      ORDER BY a.date_performed DESC
      LIMIT ?
    `)
      .all(userId, limit)
  },

  // Create new activity log
  create: (activityData: ActivityCreateInput): number => {
    const result = db
      .prepare(`
      INSERT INTO activity_log (
        action, entity_type, entity_id, details, performed_by, date_performed
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `)
      .run(
        activityData.action,
        activityData.entity_type,
        activityData.entity_id,
        activityData.details || null,
        activityData.performed_by,
        new Date().toISOString(),
      )

    return result.lastInsertRowid as number
  },
}
