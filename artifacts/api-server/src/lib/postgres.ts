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

export interface PostgresQueueToken {
  id: string;
  token_number: string;
  user_id?: string;
  patient_name: string;
  patient_phone?: string;
  patient_age?: number;
  patient_gender?: string;
  hospital_name: string;
  department_name: string;
  queue_position?: number;
  current_serving?: number;
  estimated_wait_minutes?: number;
  status?: string;
  doctor_name?: string;
  room_number?: string;
  problem?: string;
  booked_at?: string;
}

export interface PostgresMedicalReport {
  id: string;
  user_id?: string;
  patient_name: string;
  test_type: string;
  summary?: string;
  overall_status?: string;
  vitals_json?: string;
  created_at?: string;
}

export interface PostgresMedicineReminder {
  id: string;
  user_id?: string;
  medicine_name: string;
  dosage?: string;
  time?: string;
  frequency?: string;
  meal_timing?: string;
  active?: boolean;
  created_at?: string;
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
  tokensCount?: number;
  reportsCount?: number;
  remindersCount?: number;
  error?: string;
}

let pool: Pool | null = null;
let isInitialized = false;

export function isPostgresConfigured(): boolean {
  if (process.env.POSTGRES_URL) return true;
  if (process.env.DATABASE_URL?.startsWith("postgres://") || process.env.DATABASE_URL?.startsWith("postgresql://")) {
    return true;
  }
  if (process.env.PGHOST && process.env.PGUSER) return true;
  return false;
}

export function getPostgresPool(): Pool | null {
  if (!isPostgresConfigured()) return null;
  if (pool) return pool;

  try {
    const connStr =
      process.env.POSTGRES_URL ||
      (process.env.DATABASE_URL?.startsWith("postgres") ? process.env.DATABASE_URL : undefined);

    if (connStr) {
      const cleanConnStr = connStr.replace(/([&?])channel_binding=[^&]*/, "$1").replace(/[?&]$/, "");
      const isSsl = cleanConnStr.includes("sslmode=require") || process.env.PGSSL === "true";
      pool = new PgPool({
        connectionString: cleanConnStr,
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
        database: process.env.PGDATABASE || "neondb",
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
 * Initializes all 5 project tables in PostgreSQL
 */
export async function initPostgresDatabase(): Promise<boolean> {
  if (isInitialized) return true;
  const p = getPostgresPool();
  if (!p) return false;

  try {
    // 1. Users
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

    // 2. Login Logs
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

    // 3. Queue Tokens (Real Appointments)
    await p.query(`
      CREATE TABLE IF NOT EXISTS queue_tokens (
        id VARCHAR(64) PRIMARY KEY,
        token_number VARCHAR(50) NOT NULL,
        user_id VARCHAR(64),
        patient_name VARCHAR(255) NOT NULL,
        patient_phone VARCHAR(50) DEFAULT '',
        patient_age INT DEFAULT 0,
        patient_gender VARCHAR(20) DEFAULT '',
        hospital_name VARCHAR(255) NOT NULL,
        department_name VARCHAR(255) NOT NULL,
        queue_position INT DEFAULT 1,
        current_serving INT DEFAULT 1,
        estimated_wait_minutes INT DEFAULT 15,
        status VARCHAR(50) DEFAULT 'Waiting',
        doctor_name VARCHAR(255) DEFAULT '',
        room_number VARCHAR(100) DEFAULT '',
        problem TEXT DEFAULT '',
        booked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Medical Reports (Real Patient Reports)
    await p.query(`
      CREATE TABLE IF NOT EXISTS medical_reports (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64),
        patient_name VARCHAR(255) NOT NULL,
        test_type VARCHAR(255) NOT NULL,
        summary TEXT,
        overall_status VARCHAR(50) DEFAULT 'Normal',
        vitals_json TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Medicine Reminders (Real Reminders)
    await p.query(`
      CREATE TABLE IF NOT EXISTS medicine_reminders (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64),
        medicine_name VARCHAR(255) NOT NULL,
        dosage VARCHAR(100) DEFAULT '',
        time VARCHAR(50) DEFAULT '',
        frequency VARCHAR(100) DEFAULT '',
        meal_timing VARCHAR(100) DEFAULT '',
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    isInitialized = true;
    logger.info("PostgreSQL all 5 healthcare tables verified/initialized (users, login_logs, queue_tokens, medical_reports, medicine_reminders)");
    return true;
  } catch (err: any) {
    logger.warn({ err: err.message }, "PostgreSQL table init notice");
    return false;
  }
}

// ----------------- USER AUTH & PROFILES -----------------
export async function findPostgresUserByEmail(email: string): Promise<PostgresUser | null> {
  const p = getPostgresPool();
  if (!p) return null;
  try {
    const res = await p.query(
      "SELECT id, name, email, password, role, phone, gender, age, blood_group, city, created_at FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1",
      [email.trim()],
    );
    return (res.rows[0] as PostgresUser) || null;
  } catch (err) {
    logger.error({ err, email }, "Error finding user in PostgreSQL");
    return null;
  }
}

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
  } catch (err: any) {
    logger.warn({ err: err.message }, "Could not record login log in PostgreSQL");
  }
}

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
    return [];
  }
}

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
    return [];
  }
}

// ----------------- QUEUE TOKENS (APPOINTMENTS) -----------------
export async function createPostgresQueueToken(token: Partial<PostgresQueueToken>): Promise<PostgresQueueToken> {
  await initPostgresDatabase();
  const p = getPostgresPool();
  if (!p) throw new Error("Database pool unavailable");

  const id = token.id || `tok-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const tokenNum = token.token_number || `A-${Math.floor(100 + Math.random() * 900)}`;

  const res = await p.query(
    `INSERT INTO queue_tokens (
      id, token_number, user_id, patient_name, patient_phone, patient_age, patient_gender,
      hospital_name, department_name, queue_position, current_serving, estimated_wait_minutes,
      status, doctor_name, room_number, problem
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING *;`,
    [
      id,
      tokenNum,
      token.user_id || null,
      token.patient_name,
      token.patient_phone || "",
      token.patient_age || 0,
      token.patient_gender || "",
      token.hospital_name,
      token.department_name,
      token.queue_position || 1,
      token.current_serving || 1,
      token.estimated_wait_minutes || 15,
      token.status || "Waiting",
      token.doctor_name || "",
      token.room_number || "",
      token.problem || "",
    ],
  );
  return res.rows[0] as PostgresQueueToken;
}

export async function getPostgresQueueTokens(userId?: string, limit = 50): Promise<PostgresQueueToken[]> {
  const p = getPostgresPool();
  if (!p) return [];
  try {
    await initPostgresDatabase();
    if (userId) {
      const res = await p.query(
        "SELECT * FROM queue_tokens WHERE user_id = $1 ORDER BY booked_at DESC LIMIT $2",
        [userId, limit],
      );
      return res.rows as PostgresQueueToken[];
    }
    const res = await p.query("SELECT * FROM queue_tokens ORDER BY booked_at DESC LIMIT $1", [limit]);
    return res.rows as PostgresQueueToken[];
  } catch (err) {
    return [];
  }
}

// ----------------- MEDICAL REPORTS -----------------
export async function createPostgresMedicalReport(report: Partial<PostgresMedicalReport>): Promise<PostgresMedicalReport> {
  await initPostgresDatabase();
  const p = getPostgresPool();
  if (!p) throw new Error("Database pool unavailable");

  const id = report.id || `rep-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const res = await p.query(
    `INSERT INTO medical_reports (id, user_id, patient_name, test_type, summary, overall_status, vitals_json)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *;`,
    [
      id,
      report.user_id || null,
      report.patient_name,
      report.test_type,
      report.summary || "",
      report.overall_status || "Normal",
      report.vitals_json || "",
    ],
  );
  return res.rows[0] as PostgresMedicalReport;
}

export async function getPostgresMedicalReports(userId?: string, limit = 50): Promise<PostgresMedicalReport[]> {
  const p = getPostgresPool();
  if (!p) return [];
  try {
    await initPostgresDatabase();
    if (userId) {
      const res = await p.query(
        "SELECT * FROM medical_reports WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2",
        [userId, limit],
      );
      return res.rows as PostgresMedicalReport[];
    }
    const res = await p.query("SELECT * FROM medical_reports ORDER BY created_at DESC LIMIT $1", [limit]);
    return res.rows as PostgresMedicalReport[];
  } catch (err) {
    return [];
  }
}

// ----------------- MEDICINE REMINDERS -----------------
export async function createPostgresMedicineReminder(reminder: Partial<PostgresMedicineReminder>): Promise<PostgresMedicineReminder> {
  await initPostgresDatabase();
  const p = getPostgresPool();
  if (!p) throw new Error("Database pool unavailable");

  const id = reminder.id || `rem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const res = await p.query(
    `INSERT INTO medicine_reminders (id, user_id, medicine_name, dosage, time, frequency, meal_timing, active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *;`,
    [
      id,
      reminder.user_id || null,
      reminder.medicine_name,
      reminder.dosage || "",
      reminder.time || "",
      reminder.frequency || "",
      reminder.meal_timing || "",
      reminder.active !== undefined ? reminder.active : true,
    ],
  );
  return res.rows[0] as PostgresMedicineReminder;
}

export async function getPostgresMedicineReminders(userId?: string, limit = 50): Promise<PostgresMedicineReminder[]> {
  const p = getPostgresPool();
  if (!p) return [];
  try {
    await initPostgresDatabase();
    if (userId) {
      const res = await p.query(
        "SELECT * FROM medicine_reminders WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2",
        [userId, limit],
      );
      return res.rows as PostgresMedicineReminder[];
    }
    const res = await p.query("SELECT * FROM medicine_reminders ORDER BY created_at DESC LIMIT $1", [limit]);
    return res.rows as PostgresMedicineReminder[];
  } catch (err) {
    return [];
  }
}

// ----------------- COMPREHENSIVE HEALTH CHECK -----------------
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
    let tokensCount = 0;
    let reportsCount = 0;
    let remindersCount = 0;

    try {
      const [u, l, tk, rp, rm] = await Promise.all([
        p.query("SELECT COUNT(*) as c FROM users;"),
        p.query("SELECT COUNT(*) as c FROM login_logs;"),
        p.query("SELECT COUNT(*) as c FROM queue_tokens;"),
        p.query("SELECT COUNT(*) as c FROM medical_reports;"),
        p.query("SELECT COUNT(*) as c FROM medicine_reminders;"),
      ]);
      usersCount = Number(u.rows[0]?.c || 0);
      loginsCount = Number(l.rows[0]?.c || 0);
      tokensCount = Number(tk.rows[0]?.c || 0);
      reportsCount = Number(rp.rows[0]?.c || 0);
      remindersCount = Number(rm.rows[0]?.c || 0);
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
      tokensCount,
      reportsCount,
      remindersCount,
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
