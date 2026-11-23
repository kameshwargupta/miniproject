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

    if (!name || String(name).trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: "Full name is required (minimum 2 characters).",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(String(email).trim())) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid email address.",
      });
    }

    if (!password || String(password).length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password is required and must be at least 6 characters.",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const existing = await findUserByEmail(cleanEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: "An account with this email already exists. Please log in instead.",
      });
    }

    const engine = getActiveDbEngine();
    const user = await registerOrUpdateUser({
      name: String(name).trim(),
      email: cleanEmail,
      password: String(password),
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

    const { password: _, ...safeUser } = user as any;

    res.json({
      success: true,
      message: `Account created successfully! Welcome to CareWatch, ${user.name}.`,
      engine,
      user: safeUser,
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
    const { email, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(String(email).trim())) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid email address.",
      });
    }

    if (!password || String(password).trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Password is required to log in.",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = await findUserByEmail(cleanEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "No account found with this email. Please check your information or create an account.",
      });
    }

    // Verify password if user has password recorded
    if (user.password && user.password !== String(password)) {
      return res.status(401).json({
        success: false,
        error: "Incorrect password. Please enter the correct password.",
      });
    }

    const engine = getActiveDbEngine();
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

    const { password: _, ...safeUser } = user as any;

    res.json({
      success: true,
      message: `Welcome back, ${user.name}! Logged in successfully.`,
      engine,
      user: safeUser,
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
