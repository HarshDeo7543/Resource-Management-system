import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

// Ensure the data directory exists
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "resource-management.db");
const db = new Database(dbPath);

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Create tables if they don't exist
function initializeDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'poweruser', 'user')),
      designation TEXT NOT NULL,
      dob TEXT,
      aadhar_number TEXT,
      pan_number TEXT,
      room_number TEXT,
      date_created TEXT NOT NULL
    )
  `);

  // Resources table
  db.exec(`
    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reg_number TEXT UNIQUE NOT NULL,
      resource_type TEXT NOT NULL,
      manufacturer TEXT,
      model TEXT,
      serial_number TEXT NOT NULL,
      processor TEXT,
      ram TEXT,
      storage TEXT,
      operating_system TEXT,
      purchase_date TEXT,
      warranty_expiry TEXT,
      location TEXT,
      assigned_user_id INTEGER,
      warranty_provider TEXT,
      support_contact TEXT,
      comments TEXT,
      status TEXT NOT NULL DEFAULT 'Active',
      date_created TEXT NOT NULL,
      FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Activity Log table
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER NOT NULL,
      details TEXT,
      performed_by INTEGER NOT NULL,
      date_performed TEXT NOT NULL,
      FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Check if admin user exists, if not create default users
  const adminExists = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = ?").get("admin");

  if (adminExists.count === 0) {
    // Generate a proper bcrypt hash for the default password
    const defaultPassword = "12345678";
    const passwordHash = bcrypt.hashSync(defaultPassword, 10);

    // Create default admin user
    db.prepare(`
      INSERT INTO users (name, email, password, role, designation, date_created)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      "Harsh Deo",
      "harshdeo7543@gmail.com",
      passwordHash,
      "admin",
      "System Administrator",
      new Date().toISOString(),
    );

    // Create default power user
    db.prepare(`
      INSERT INTO users (name, email, password, role, designation, date_created)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      "Power User",
      "poweruser@example.com",
      passwordHash,
      "poweruser",
      "Team Lead",
      new Date().toISOString(),
    );

    // Create default regular user
    db.prepare(`
      INSERT INTO users (name, email, password, role, designation, date_created)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      "Regular User",
      "user@example.com",
      passwordHash,
      "user",
      "Analyst",
      new Date().toISOString(),
    );

    // Create some sample resources
    const resourceTypes = ["PC", "Laptop", "Server", "Printer"];
    const locations = ["Room 305", "Room 412", "Server Room", "Room 201"];
    const manufacturers = ["Dell", "HP", "Lenovo", "Canon"];
    const models = ["OptiPlex 7090", "EliteBook 840", "ThinkPad T14", "ImageRunner 2530i"];

    for (let i = 0; i < 4; i++) {
      const type = resourceTypes[i];
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomNum = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      const regNumber = `${type.toUpperCase()}-REG-${timestamp}-${randomNum}`;

      db.prepare(`
        INSERT INTO resources (
          reg_number, resource_type, manufacturer, model, serial_number,
          location, assigned_user_id, status, date_created
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        regNumber,
        type,
        manufacturers[i],
        models[i],
        `SN${Math.floor(Math.random() * 1000000)}`,
        locations[i],
        (i % 3) + 1, // Assign to one of the three default users
        "Active",
        new Date().toISOString(),
      );
    }
  }
}

// Initialize the database
initializeDatabase();

export default db;
