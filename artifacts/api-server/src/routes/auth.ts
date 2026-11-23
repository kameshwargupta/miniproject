import { Router, type Request, type Response } from "express";
import {
  registerOrUpdateUser,
  findUserByEmail,
  logUserLogin,
  getAllUsers,
  getRecentLogins,
  checkDatabaseHealth,
  initDatabase,
  getActiveDbEngine,
  createQueueToken,
  getQueueTokens,
  createMedicalReport,
  getMedicalReports,
  createMedicineReminder,
  getMedicineReminders,
} from "../lib/unifiedDb";
import { logger } from "../lib/logger";

const router = Router();

// Auto-initialize DB on module load
initDatabase().catch((err) => {
  logger.warn({ err }, "Database background initialization notice");
});

/**
 * Health & Live Database Status (All 5 Tables)
 * GET /api/auth/db-status
 */
router.get("/auth/db-status", async (_req: Request, res: Response) => {
  try {
    const health = await checkDatabaseHealth();
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

// ----------------- REAL USER REGISTRATION & LOGIN -----------------
router.post("/auth/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, phone, gender, age, blood_group, city } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        error: "Name and Email are required to register.",
      });
    }

    const engine = getActiveDbEngine();
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
      message: `User registered successfully into ${engine}!`,
      engine,
      user,
      token: `cw-token-${user.id}-${Date.now()}`,
    });
  } catch (err: any) {
    logger.error({ err }, "Registration error");
    res.status(500).json({
      success: false,
      error: err.message || "Failed to register user into database",
    });
  }
});

router.post("/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, phone } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required to log in.",
      });
    }

    const engine = getActiveDbEngine();
    const cleanEmail = String(email).trim().toLowerCase();
    let user = await findUserByEmail(cleanEmail);

    // If user does not exist yet, auto-register them so every real login is captured!
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
      message: `Logged in successfully! Synced with ${engine}.`,
      engine,
      user,
      token: `cw-token-${user.id}-${Date.now()}`,
    });
  } catch (err: any) {
    logger.error({ err }, "Login error");
    res.status(500).json({
      success: false,
      error: err.message || "Login failed",
    });
  }
});

router.get("/auth/users", async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit || 50);
    const users = await getAllUsers(limit);
    const engine = getActiveDbEngine();
    res.json({
      success: true,
      engine,
      total: users.length,
      users,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/auth/logs", async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit || 50);
    const logs = await getRecentLogins(limit);
    const engine = getActiveDbEngine();
    res.json({
      success: true,
      engine,
      total: logs.length,
      logs,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------- REAL OPD QUEUE TOKENS -----------------
router.post("/data/tokens", async (req: Request, res: Response) => {
  try {
    const token = await createQueueToken(req.body);
    res.json({ success: true, token });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/data/tokens", async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string | undefined;
    const tokens = await getQueueTokens(userId);
    res.json({ success: true, total: tokens.length, tokens });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------- REAL MEDICAL REPORTS -----------------
router.post("/data/reports", async (req: Request, res: Response) => {
  try {
    const report = await createMedicalReport(req.body);
    res.json({ success: true, report });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/data/reports", async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string | undefined;
    const reports = await getMedicalReports(userId);
    res.json({ success: true, total: reports.length, reports });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------- REAL MEDICINE REMINDERS -----------------
router.post("/data/reminders", async (req: Request, res: Response) => {
  try {
    const reminder = await createMedicineReminder(req.body);
    res.json({ success: true, reminder });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/data/reminders", async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string | undefined;
    const reminders = await getMedicineReminders(userId);
    res.json({ success: true, total: reminders.length, reminders });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
