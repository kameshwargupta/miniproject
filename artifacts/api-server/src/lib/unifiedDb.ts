import {
  isPostgresConfigured,
  initPostgresDatabase,
  findPostgresUserByEmail,
  registerOrUpdatePostgresUser,
  logPostgresUserLogin,
  getAllPostgresUsers,
  getRecentPostgresLogins,
  checkPostgresHealth,
  createPostgresQueueToken,
  getPostgresQueueTokens,
  createPostgresMedicalReport,
  getPostgresMedicalReports,
  createPostgresMedicineReminder,
  getPostgresMedicineReminders,
  type PostgresUser,
  type PostgresLoginLog,
  type PostgresQueueToken,
  type PostgresMedicalReport,
  type PostgresMedicineReminder,
} from "./postgres";
import {
  initTiDBDatabase,
  findUserByEmail as findTiDBUserByEmail,
  registerOrUpdateUser as registerTiDBUser,
  logUserLogin as logTiDBUserLogin,
  getAllUsers as getAllTiDBUsers,
  getRecentLogins as getRecentTiDBLogins,
  checkTiDBHealth,
  type TiDBUser,
  type TiDBLoginLog,
} from "./tidb";
import { logger } from "./logger";

export type DbUser = PostgresUser | TiDBUser;
export type DbLoginLog = PostgresLoginLog | TiDBLoginLog;

export function getActiveDbEngine(): "PostgreSQL" | "TiDB Cloud Serverless" {
  if (isPostgresConfigured()) {
    return "PostgreSQL";
  }
  return "TiDB Cloud Serverless";
}

export async function initDatabase(): Promise<boolean> {
  const engine = getActiveDbEngine();
  logger.info({ engine }, "Initializing active database engine with all 5 healthcare tables");
  if (engine === "PostgreSQL") {
    return initPostgresDatabase();
  }
  return initTiDBDatabase();
}

// ----------------- USERS & AUTH -----------------
export async function findUserByEmail(email: string): Promise<DbUser | null> {
  if (isPostgresConfigured()) {
    return findPostgresUserByEmail(email);
  }
  return findTiDBUserByEmail(email);
}

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
}): Promise<DbUser> {
  if (isPostgresConfigured()) {
    return registerOrUpdatePostgresUser(user);
  }
  return registerTiDBUser(user);
}

export async function logUserLogin(log: {
  userId?: string;
  email: string;
  name: string;
  role?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  if (isPostgresConfigured()) {
    return logPostgresUserLogin(log);
  }
  return logTiDBUserLogin(log);
}

export async function getAllUsers(limit = 100): Promise<DbUser[]> {
  if (isPostgresConfigured()) {
    return getAllPostgresUsers(limit);
  }
  return getAllTiDBUsers(limit);
}

export async function getRecentLogins(limit = 50): Promise<DbLoginLog[]> {
  if (isPostgresConfigured()) {
    return getRecentPostgresLogins(limit);
  }
  return getRecentTiDBLogins(limit);
}

// ----------------- HEALTHCARE DATA TABLES -----------------
export async function createQueueToken(token: Partial<PostgresQueueToken>) {
  if (isPostgresConfigured()) {
    return createPostgresQueueToken(token);
  }
  return { id: `tok-${Date.now()}`, ...token };
}

export async function getQueueTokens(userId?: string, limit = 50) {
  if (isPostgresConfigured()) {
    return getPostgresQueueTokens(userId, limit);
  }
  return [];
}

export async function createMedicalReport(report: Partial<PostgresMedicalReport>) {
  if (isPostgresConfigured()) {
    return createPostgresMedicalReport(report);
  }
  return { id: `rep-${Date.now()}`, ...report };
}

export async function getMedicalReports(userId?: string, limit = 50) {
  if (isPostgresConfigured()) {
    return getPostgresMedicalReports(userId, limit);
  }
  return [];
}

export async function createMedicineReminder(reminder: Partial<PostgresMedicineReminder>) {
  if (isPostgresConfigured()) {
    return createPostgresMedicineReminder(reminder);
  }
  return { id: `rem-${Date.now()}`, ...reminder };
}

export async function getMedicineReminders(userId?: string, limit = 50) {
  if (isPostgresConfigured()) {
    return getPostgresMedicineReminders(userId, limit);
  }
  return [];
}

// ----------------- HEALTH & STATS -----------------
export async function checkDatabaseHealth(): Promise<{
  activeEngine: "PostgreSQL" | "TiDB Cloud Serverless";
  postgresConfigured: boolean;
  postgresStatus?: any;
  tidbStatus?: any;
}> {
  const pgConfigured = isPostgresConfigured();
  const activeEngine = getActiveDbEngine();

  const [postgresStatus, tidbStatus] = await Promise.all([
    pgConfigured ? checkPostgresHealth() : Promise.resolve({ connected: false, engine: "PostgreSQL" }),
    checkTiDBHealth(),
  ]);

  return {
    activeEngine,
    postgresConfigured: pgConfigured,
    postgresStatus,
    tidbStatus,
  };
}
