import pg, { type Pool, type QueryResult } from "pg";
import { logger } from "./logger";

const { Pool: PgPool } = pg;

export interface PostgresUser {
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

export interface PostgresLoginLog {
  id: string;
  user_id?: string;
  user_email: string;
  user_name: string;
  role?: string;
  ip_address?: string;
  user_agent?: string;
  login_time?: string;
}

export interface PostgresHealth {
  connected: boolean;
  engine: "PostgreSQL";
  host?: string;
  port?: number;
  database?: string;
  version?: string;
  latencyMs?: number;
  usersCount?: number;
  loginsCount?: number;
  error?: string;
}

let pool: Pool | null = null;
let isInitialized = false;

/**
 * Checks if PostgreSQL configuration exists in environment variables
 */
export function isPostgresConfigured(): boolean {
  if (process.env.POSTGRES_URL) return true;
  if (process.env.DATABASE_URL?.startsWith("postgres://") || process.env.DATABASE_URL?.startsWith("postgresql://")) {
    return true;
  }
  if (process.env.PGHOST && process.env.PGUSER) return true;
  return false;
}

/**
 * Returns PostgreSQL Pool instance
 */
export function getPostgresPool(): Pool | null {
  if (!isPostgresConfigured()) return null;
  if (pool) return pool;

  try {
    const connStr =
      process.env.POSTGRES_URL ||
      (process.env.DATABASE_URL?.startsWith("postgres") ? process.env.DATABASE_URL : undefined);

    if (connStr) {
      const isSsl = connStr.includes("sslmode=require") || process.env.PGSSL === "true";
      pool = new PgPool({
        connectionString: connStr,
        ssl: isSsl ? { rejectUnauthorized: false } : undefined,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
    } else {
      const isSsl = process.env.PGSSL === "true";
      pool = new PgPool({
        host: process.env.PGHOST || "localhost",
        port: Number(process.env.PGPORT || 5432),
        database: process.env.PGDATABASE || "carewatch",
        user: process.env.PGUSER || "postgres",
        password: process.env.PGPASSWORD || "",
        ssl: isSsl ? { rejectUnauthorized: false } : undefined,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
    }

    pool.on("error", (err) => {
      logger.error({ err }, "PostgreSQL unexpected client pool error");
    });

    logger.info("PostgreSQL client pool initialized successfully");
    return pool;
  } catch (err) {
    logger.error({ err }, "Failed to create PostgreSQL client pool");
    return null;
  }
}

/**
 * Automatically creates tables in PostgreSQL if not present
 */
export async function initPostgresDatabase(): Promise<boolean> {
  if (isInitialized) return true;
  const p = getPostgresPool();
  if (!p) return false;

  try {
    // 1. Create users table
    await p.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'patient',
        phone VARCHAR(50) DEFAULT '',
        gender VARCHAR(20) DEFAULT '',
        age INT DEFAULT 0,
        blood_group VARCHAR(10) DEFAULT '',
        city VARCHAR(100) DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Create login_logs table
    await p.query(`
      CREATE TABLE IF NOT EXISTS login_logs (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64),
        user_email VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        role VARCHAR(50),
        ip_address VARCHAR(100) DEFAULT '',
        user_agent TEXT,
        login_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    isInitialized = true;
    logger.info("PostgreSQL tables verified/initialized successfully (users, login_logs)");
    return true;
  } catch (err: any) {
    logger.warn({ err: err.message }, "PostgreSQL table init notice");
    return false;
  }
}

/**
 * Find user by email in PostgreSQL
 */
export async function findPostgresUserByEmail(email: string): Promise<PostgresUser | null> {
  const p = getPostgresPool();
  if (!p) return null;

  try {
    const res: QueryResult = await p.query(
      "SELECT id, name, email, role, phone, gender, age, blood_group, city, created_at FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1",
      [email.trim()],
    );
    if (res.rows && res.rows.length > 0) {
      return res.rows[0] as PostgresUser;
    }
    return null;
  } catch (err) {
    logger.error({ err, email }, "Error finding user in PostgreSQL");
    return null;
  }
}

/**
 * Register or update user in PostgreSQL
 */
export async function registerOrUpdatePostgresUser(user: {
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
}): Promise<PostgresUser> {
  await initPostgresDatabase();
  const p = getPostgresPool();
  if (!p) throw new Error("PostgreSQL pool not available");

  const id = user.id || `usr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const role = user.role || "patient";
  const pwd = user.password || "carewatch_pass_default";
  const cleanEmail = user.email.toLowerCase().trim();

  const query = `
    INSERT INTO users (id, name, email, password, role, phone, gender, age, blood_group, city)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (email)
    DO UPDATE SET
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      phone = COALESCE(NULLIF(EXCLUDED.phone, ''), users.phone),
      gender = COALESCE(NULLIF(EXCLUDED.gender, ''), users.gender),
      age = CASE WHEN EXCLUDED.age > 0 THEN EXCLUDED.age ELSE users.age END,
      blood_group = COALESCE(NULLIF(EXCLUDED.blood_group, ''), users.blood_group),
      city = COALESCE(NULLIF(EXCLUDED.city, ''), users.city),
      updated_at = CURRENT_TIMESTAMP
    RETURNING id, name, email, role, phone, gender, age, blood_group, city, created_at;
  `;

  const values = [
    id,
    user.name,
    cleanEmail,
    pwd,
    role,
    user.phone || "",
    user.gender || "",
    user.age || 0,
    user.blood_group || "",
    user.city || "",
  ];

  const res = await p.query(query, values);
  return res.rows[0] as PostgresUser;
}

/**
 * Log user login in PostgreSQL
 */
export async function logPostgresUserLogin(log: {
  userId?: string;
  email: string;
  name: string;
  role?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  const p = getPostgresPool();
  if (!p) return;

  try {
    await initPostgresDatabase();
    const logId = `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    await p.query(
      `INSERT INTO login_logs (id, user_id, user_email, user_name, role, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
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
    logger.info({ user: log.email, role: log.role }, "User login recorded in PostgreSQL");
  } catch (err: any) {
    logger.warn({ err: err.message }, "Could not record login log in PostgreSQL");
  }
}

/**
 * Get all users from PostgreSQL
 */
export async function getAllPostgresUsers(limit = 100): Promise<PostgresUser[]> {
  const p = getPostgresPool();
  if (!p) return [];

  try {
    await initPostgresDatabase();
    const res = await p.query(
      "SELECT id, name, email, role, phone, gender, age, blood_group, city, created_at FROM users ORDER BY created_at DESC LIMIT $1",
      [limit],
    );
    return res.rows as PostgresUser[];
  } catch (err) {
    logger.error({ err }, "Error fetching users from PostgreSQL");
    return [];
  }
}

/**
 * Get recent logins from PostgreSQL
 */
export async function getRecentPostgresLogins(limit = 50): Promise<PostgresLoginLog[]> {
  const p = getPostgresPool();
  if (!p) return [];

  try {
    await initPostgresDatabase();
    const res = await p.query(
      "SELECT id, user_id, user_email, user_name, role, ip_address, user_agent, login_time FROM login_logs ORDER BY login_time DESC LIMIT $1",
      [limit],
    );
    return res.rows as PostgresLoginLog[];
  } catch (err) {
    logger.error({ err }, "Error fetching login logs from PostgreSQL");
    return [];
  }
}

/**
 * Check PostgreSQL health status and record counts
 */
export async function checkPostgresHealth(): Promise<PostgresHealth> {
  const start = Date.now();
  const p = getPostgresPool();
  if (!p) {
    return {
      connected: false,
      engine: "PostgreSQL",
      error: "PostgreSQL is not configured in environment variables",
    };
  }

  try {
    const verRes = await p.query("SELECT version() as version;");
    const latencyMs = Date.now() - start;
    const version = verRes.rows[0]?.version || "PostgreSQL";

    let usersCount = 0;
    let loginsCount = 0;
    try {
      const uRes = await p.query("SELECT COUNT(*) as count FROM users;");
      usersCount = Number(uRes.rows[0]?.count || 0);
      const lRes = await p.query("SELECT COUNT(*) as count FROM login_logs;");
      loginsCount = Number(lRes.rows[0]?.count || 0);
    } catch {
      // tables may not yet exist
    }

    return {
      connected: true,
      engine: "PostgreSQL",
      version,
      latencyMs,
      usersCount,
      loginsCount,
    };
  } catch (err: any) {
    return {
      connected: false,
      engine: "PostgreSQL",
      latencyMs: Date.now() - start,
      error: err.message,
    };
  }
}
