import {
  isPostgresConfigured,
  initPostgresDatabase,
  findPostgresUserByEmail,
  registerOrUpdatePostgresUser,
  logPostgresUserLogin,
  getAllPostgresUsers,
  getRecentPostgresLogins,
  checkPostgresHealth,
  type PostgresUser,
  type PostgresLoginLog,
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

/**
 * Returns which database engine is currently active
 */
export function getActiveDbEngine(): "PostgreSQL" | "TiDB Cloud Serverless" {
  if (isPostgresConfigured()) {
    return "PostgreSQL";
  }
  return "TiDB Cloud Serverless";
}

/**
 * Initialize active database
 */
export async function initDatabase(): Promise<boolean> {
  const engine = getActiveDbEngine();
  logger.info({ engine }, "Initializing active database engine");
  if (engine === "PostgreSQL") {
    return initPostgresDatabase();
  }
  return initTiDBDatabase();
}

/**
 * Find user by email from active database
 */
export async function findUserByEmail(email: string): Promise<DbUser | null> {
  if (isPostgresConfigured()) {
    return findPostgresUserByEmail(email);
  }
  return findTiDBUserByEmail(email);
}

/**
 * Register or update user in active database
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
}): Promise<DbUser> {
  if (isPostgresConfigured()) {
    return registerOrUpdatePostgresUser(user);
  }
  return registerTiDBUser(user);
}

/**
 * Log user login in active database
 */
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

/**
 * Get all users from active database
 */
export async function getAllUsers(limit = 100): Promise<DbUser[]> {
  if (isPostgresConfigured()) {
    return getAllPostgresUsers(limit);
  }
  return getAllTiDBUsers(limit);
}

/**
 * Get recent logins from active database
 */
export async function getRecentLogins(limit = 50): Promise<DbLoginLog[]> {
  if (isPostgresConfigured()) {
    return getRecentPostgresLogins(limit);
  }
  return getRecentTiDBLogins(limit);
}

/**
 * Comprehensive healthcheck across database engines
 */
export async function checkDatabaseHealth(): Promise<{
  activeEngine: "PostgreSQL" | "TiDB Cloud Serverless";
  postgresConfigured: boolean;
  postgresStatus?: any;
  tidbStatus?: any;
}> {
  const pgConfigured = isPostgresConfigured();
  const activeEngine = getActiveDbEngine();

  const [postgresStatus, tidbStatus] = await Promise.all([
    pgConfigured ? checkPostgresHealth() : Promise.resolve({ connected: false, engine: "PostgreSQL", error: "Not configured" }),
    checkTiDBHealth(),
  ]);

  return {
    activeEngine,
    postgresConfigured: pgConfigured,
    postgresStatus,
    tidbStatus,
  };
}
