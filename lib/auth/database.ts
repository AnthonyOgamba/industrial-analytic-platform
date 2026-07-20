import "server-only";

import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";

let instance: Database.Database | null = null;

export function getDatabase() {
  if (instance) return instance;
  const file = process.env.DIVU_DATABASE_PATH || path.join(process.cwd(), "data", "divu.sqlite");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  instance = new Database(file);
  instance.pragma("journal_mode = WAL");
  instance.pragma("foreign_keys = ON");
  const migration = fs.readFileSync(path.join(process.cwd(), "migrations", "001_auth.sql"), "utf8");
  instance.exec(migration);
  bootstrapAdmin(instance);
  return instance;
}

function bootstrapAdmin(db: Database.Database) {
  const username = process.env.DIVU_BOOTSTRAP_ADMIN_USERNAME?.trim();
  const email = process.env.DIVU_BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.DIVU_BOOTSTRAP_ADMIN_PASSWORD;
  if (!username || !email || !password) return;
  const exists = db.prepare("SELECT id FROM users WHERE normalized_username = ?").get(username.toLowerCase());
  if (exists) return;
  const now = new Date().toISOString();
  const passwordHash = bcrypt.hashSync(password, 12);
  db.prepare(
    `INSERT INTO users
      (username, normalized_username, email, normalized_email, password_hash, role, active, created_at_utc, updated_at_utc)
     VALUES (?, ?, ?, ?, ?, 'super_admin', 1, ?, ?)`,
  ).run(username, username.toLowerCase(), email, email, passwordHash, now, now);
}

export type DbUser = {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: string;
  active: number;
};

export function findUser(identifier: string) {
  return getDatabase()
    .prepare(
      `SELECT id, username, email, password_hash, role, active FROM users
       WHERE normalized_username = ? OR normalized_email = ?`,
    )
    .get(identifier.toLowerCase(), identifier.toLowerCase()) as DbUser | undefined;
}
