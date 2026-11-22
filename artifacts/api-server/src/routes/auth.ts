import { Router, type Request, type Response } from "express";
import {
  registerOrUpdateUser,
  findUserByEmail,
  logUserLogin,
  getAllUsers,
  getRecentLogins,
  checkTiDBHealth,
  initTiDBDatabase,
} from "../lib/tidb";
import { logger } from "../lib/logger";

const router = Router();

// Auto-initialize DB on module load
initTiDBDatabase().catch((err) => {
  logger.warn({ err }, "TiDB background initialization error");
});

/**
 * Health & Live TiDB Connection Status
 * GET /api/auth/db-status
 */
router.get("/auth/db-status", async (_req: Request, res: Response) => {
  try {
    const health = await checkTiDBHealth();
    res.json({
      success: true,
      data: health,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/**
 * User Registration
 * POST /api/auth/register
 */
router.post("/auth/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, phone, gender, age, blood_group, city } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        error: "Name and Email are required to register.",
      });
    }

    const user = await registerOrUpdateUser({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      password: password ? String(password) : "carewatch_pass_123",
      role: role ? String(role) : "patient",
      phone: phone ? String(phone) : "",
      gender: gender ? String(gender) : "",
      age: age ? Number(age) : 0,
      blood_group: blood_group ? String(blood_group) : "",
      city: city ? String(city) : "",
    });

    const clientIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "";
    const userAgent = req.headers["user-agent"] || "";

    await logUserLogin({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      ipAddress: clientIp,
      userAgent,
    });

    res.json({
      success: true,
      message: "User registered successfully into TiDB Cloud!",
      user,
      token: `cw-tidb-token-${user.id}-${Date.now()}`,
    });
  } catch (err: any) {
    logger.error({ err }, "Registration error");
    res.status(500).json({
      success: false,
      error: err.message || "Failed to register user into TiDB",
    });
  }
});

/**
 * User Login (Auto-captures any login straight to TiDB Cloud)
 * POST /api/auth/login
 */
router.post("/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, phone } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required to log in.",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    let user = await findUserByEmail(cleanEmail);

    // If user does not exist yet, auto-register them so every login is captured into TiDB!
    if (!user) {
      const derivedName = name
        ? String(name).trim()
        : cleanEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

      user = await registerOrUpdateUser({
        name: derivedName,
        email: cleanEmail,
        password: password ? String(password) : "carewatch_default_auth",
        role: role ? String(role) : "patient",
        phone: phone ? String(phone) : "",
      });
    }

    const clientIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "";
    const userAgent = req.headers["user-agent"] || "";

    // Record login into TiDB login_logs table
    await logUserLogin({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: role || user.role,
      ipAddress: clientIp,
      userAgent,
    });

    res.json({
      success: true,
      message: "Logged in successfully! Saved to TiDB Cloud.",
      user,
      token: `cw-tidb-token-${user.id}-${Date.now()}`,
    });
  } catch (err: any) {
    logger.error({ err }, "Login error");
    res.status(500).json({
      success: false,
      error: err.message || "Login failed",
    });
  }
});

/**
 * Get all registered users from TiDB Cloud
 * GET /api/auth/users
 */
router.get("/auth/users", async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit || 50);
    const users = await getAllUsers(limit);
    res.json({
      success: true,
      total: users.length,
      users,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/**
 * Get recent logins from TiDB Cloud
 * GET /api/auth/logs
 */
router.get("/auth/logs", async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit || 50);
    const logs = await getRecentLogins(limit);
    res.json({
      success: true,
      total: logs.length,
      logs,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

export default router;
