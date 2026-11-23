import mysql, { type Pool, type RowDataPacket, type ResultSetHeader } from "mysql2/promise";
import { logger } from "./logger";

export interface TiDBUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  phone?: string;
  gender?: string;
  age?: number;
  blood_group?: string;
  city?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TiDBLoginLog {
  id: string;
  user_id?: string;
  user_email: string;
  user_name: string;
  role?: string;
  ip_address?: string;
  user_agent?: string;
  login_time?: string;
}

const TIDB_CONFIG = {
  host: process.env.TIDB_HOST || "gateway01.ap-northeast-1.prod.aws.tidbcloud.com",
  port: Number(process.env.TIDB_PORT || 4000),
  user: process.env.TIDB_USER || "2yubzc3at6JgYiJ.root",
  password: process.env.TIDB_PASSWORD || "r9MOcOtabXnQHFie",
  database: process.env.TIDB_DATABASE || "carewatch",
  ssl: {
    minVersion: "TLSv1.2" as const,
    rejectUnauthorized: false,
  },
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 5,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
};

let pool: Pool | null = null;
let isInitialized = false;

export function getTiDBPool(): Pool {
  if (!pool) {
    try {
      pool = mysql.createPool(TIDB_CONFIG);
      logger.info(
        { host: TIDB_CONFIG.host, port: TIDB_CONFIG.port, db: TIDB_CONFIG.database },
        "TiDB Cloud MySQL connection pool created",
      );
    } catch (err) {
      logger.error({ err }, "Failed to create TiDB connection pool");
      throw err;
    }
  }
  return pool;
}

/**
 * Automatically creates tables if not present
 */
export async function initTiDBDatabase(): Promise<boolean> {
  if (isInitialized) return true;
  try {
    const p = getTiDBPool();
    // 1. Create users table
    await p.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'patient',
        phone VARCHAR(50) DEFAULT '',
        gender VARCHAR(20) DEFAULT '',
        age INT DEFAULT 0,
        blood_group VARCHAR(10) DEFAULT '',
        city VARCHAR(100) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      );
    `);

    // 2. Create login_logs table
    await p.query(`
      CREATE TABLE IF NOT EXISTS login_logs (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64),
        user_email VARCHAR(255),
        user_name VARCHAR(255),
        role VARCHAR(50),
        ip_address VARCHAR(100) DEFAULT '',
        user_agent TEXT,
        login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    isInitialized = true;
    logger.info("TiDB Cloud tables verified/initialized successfully (users, login_logs)");
    return true;
  } catch (err: any) {
    logger.warn({ err: err.message }, "TiDB database init note");
    return false;
  }
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<TiDBUser | null> {
  try {
    const p = getTiDBPool();
    const [rows] = await p.query<RowDataPacket[]>(
      "SELECT id, name, email, password, role, phone, gender, age, blood_group, city, created_at FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1",
      [email.trim()],
    );
    if (rows && rows.length > 0) {
      return rows[0] as TiDBUser;
    }
    return null;
  } catch (err) {
    logger.error({ err, email }, "Error finding user by email in TiDB");
    return null;
  }
}

/**
 * Register or save user in TiDB
 */
export async function registerOrUpdateUser(user: {
  id?: string;
  name: string;
  email: string;
  password?: string;
  role?: string;
  phone?: string;
  gender?: string;
  age?: number;
  blood_group?: string;
  city?: string;
}): Promise<TiDBUser> {
  await initTiDBDatabase();
  const p = getTiDBPool();
  const id = user.id || `usr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const role = user.role || "patient";
  const pwd = user.password || "carewatch_pass_default";

  // Check if exists
  const existing = await findUserByEmail(user.email);
  if (existing) {
    // Update profile
    await p.query(
      `UPDATE users SET name = ?, role = ?, phone = ?, gender = ?, age = ?, blood_group = ?, city = ? WHERE id = ?`,
      [
        user.name || existing.name,
        role,
        user.phone || existing.phone || "",
        user.gender || existing.gender || "",
        user.age || existing.age || 0,
        user.blood_group || existing.blood_group || "",
        user.city || existing.city || "",
        existing.id,
      ],
    );
    return {
      ...existing,
      name: user.name || existing.name,
      role,
      phone: user.phone || existing.phone,
      gender: user.gender || existing.gender,
      age: user.age || existing.age,
      blood_group: user.blood_group || existing.blood_group,
      city: user.city || existing.city,
    };
  }

  // Insert new record
  await p.query<ResultSetHeader>(
    `INSERT INTO users (id, name, email, password, role, phone, gender, age, blood_group, city)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      user.name,
      user.email.toLowerCase().trim(),
      pwd,
      role,
      user.phone || "",
      user.gender || "",
      user.age || 0,
      user.blood_group || "",
      user.city || "",
    ],
  );

  return {
    id,
    name: user.name,
    email: user.email.toLowerCase().trim(),
    role,
    phone: user.phone || "",
    gender: user.gender || "",
    age: user.age || 0,
    blood_group: user.blood_group || "",
    city: user.city || "",
    created_at: new Date().toISOString(),
  };
}

/**
 * Log a user login in TiDB Cloud login_logs
 */
export async function logUserLogin(log: {
  userId?: string;
  email: string;
  name: string;
  role?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  try {
    await initTiDBDatabase();
    const p = getTiDBPool();
    const logId = `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    await p.query(
      `INSERT INTO login_logs (id, user_id, user_email, user_name, role, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        logId,
        log.userId || null,
        log.email,
        log.name,
        log.role || "patient",
        log.ipAddress || "",
        (log.userAgent || "").slice(0, 500),
      ],
    );
    logger.info({ user: log.email, role: log.role }, "User login recorded in TiDB Cloud");
  } catch (err: any) {
    logger.warn({ err: err.message }, "Could not record login log in TiDB");
  }
}

/**
 * List all users from TiDB Cloud
 */
export async function getAllUsers(limit = 100): Promise<TiDBUser[]> {
  try {
    await initTiDBDatabase();
    const p = getTiDBPool();
    const [rows] = await p.query<RowDataPacket[]>(
      "SELECT id, name, email, role, phone, gender, age, blood_group, city, created_at FROM users ORDER BY created_at DESC LIMIT ?",
      [limit],
    );
    return rows as TiDBUser[];
  } catch (err) {
    logger.error({ err }, "Error fetching users from TiDB");
    return [];
  }
}

/**
 * List recent login logs from TiDB Cloud
 */
export async function getRecentLogins(limit = 50): Promise<TiDBLoginLog[]> {
  try {
    await initTiDBDatabase();
    const p = getTiDBPool();
    const [rows] = await p.query<RowDataPacket[]>(
      "SELECT id, user_id, user_email, user_name, role, ip_address, user_agent, login_time FROM login_logs ORDER BY login_time DESC LIMIT ?",
      [limit],
    );
    return rows as TiDBLoginLog[];
  } catch (err) {
    logger.error({ err }, "Error fetching login logs from TiDB");
    return [];
  }
}

/**
 * Check TiDB Cloud connection health and stats
 */
export async function checkTiDBHealth(): Promise<{
  connected: boolean;
  host: string;
  port: number;
  database: string;
  version?: string;
  latencyMs?: number;
  usersCount?: number;
  loginsCount?: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    const p = getTiDBPool();
    const [verRows] = await p.query<RowDataPacket[]>("SELECT VERSION() as version");
    const latencyMs = Date.now() - start;
    const version = verRows[0]?.version || "8.0-TiDB";

    // Table counts
    let usersCount = 0;
    let loginsCount = 0;
    try {
      const [uRows] = await p.query<RowDataPacket[]>("SELECT COUNT(*) as cnt FROM users");
      usersCount = Number(uRows[0]?.cnt || 0);
      const [lRows] = await p.query<RowDataPacket[]>("SELECT COUNT(*) as cnt FROM login_logs");
      loginsCount = Number(lRows[0]?.cnt || 0);
    } catch {
      // tables might not yet have rows
    }

    return {
      connected: true,
      host: TIDB_CONFIG.host,
      port: TIDB_CONFIG.port,
      database: TIDB_CONFIG.database,
      version,
      latencyMs,
      usersCount,
      loginsCount,
    };
  } catch (err: any) {
    return {
      connected: false,
      host: TIDB_CONFIG.host,
      port: TIDB_CONFIG.port,
      database: TIDB_CONFIG.database,
      latencyMs: Date.now() - start,
      error: err.message,
    };
  }
}
