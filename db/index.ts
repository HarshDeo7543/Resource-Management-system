import path from "path";
import { fileURLToPath } from "url";
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";

// ESM __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the database
const DB_PATH = path.join(__dirname, "resource.db");

// Declare the type for your database instance
let dbPromise: Promise<Database<sqlite3.Database, sqlite3.Statement>> | null = null;

export async function getDb(): Promise<Database<sqlite3.Database, sqlite3.Statement>> {
  if (!dbPromise) {
    dbPromise = open({
      filename: DB_PATH,
      driver: sqlite3.Database,
    }).then(async (db) => {
      // Explicitly type `db` to avoid the TS7006 error
      const typedDb: Database<sqlite3.Database, sqlite3.Statement> = db;

      await typedDb.exec(`
        CREATE TABLE IF NOT EXISTS Users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          full_name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          designation TEXT,
          role TEXT NOT NULL CHECK(role IN ('Admin','Power User','User')),
          dob TEXT,
          aadhar TEXT,
          pan TEXT,
          room_no TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await typedDb.exec(`
        CREATE TABLE IF NOT EXISTS Resources (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          registration_no TEXT UNIQUE NOT NULL,
          type TEXT NOT NULL,
          manufacturer TEXT,
          model TEXT,
          serial_no TEXT,
          processor TEXT,
          ram TEXT,
          storage TEXT,
          os TEXT,
          purchase_date TEXT,
          warranty_expiry TEXT,
          location TEXT,
          warranty_provider TEXT,
          support_contact TEXT,
          assigned_user_id INTEGER,
          status TEXT NOT NULL DEFAULT 'Active' CHECK(status IN ('Active','Retired')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (assigned_user_id) REFERENCES Users(id) ON DELETE SET NULL
        );
      `);

      const defaultAdminEmail = "harshdeo7543@gmail.com";
      const defaultAdminPassword = "12345678"; // ⚠ In production, hash this

      const existingAdmin = await typedDb.get(
        `SELECT id FROM Users WHERE email = ?`,
        defaultAdminEmail
      );

      if (!existingAdmin) {
        await typedDb.run(
          `INSERT INTO Users (full_name, email, password, designation, role) VALUES (?, ?, ?, ?, ?)`,
          "Default Admin",
          defaultAdminEmail,
          defaultAdminPassword,
          "Administrator",
          "Admin"
        );
        console.log("Inserted default Admin:", defaultAdminEmail);
      } else {
        console.log("Default Admin already exists:", defaultAdminEmail);
      }

      return typedDb;
    });
  }

  return dbPromise;
}
