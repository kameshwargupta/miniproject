import { pgTable, varchar, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

// 1. Users Table (Real Registered Users)
export const usersTable = pgTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).default("patient"),
  phone: varchar("phone", { length: 50 }).default(""),
  gender: varchar("gender", { length: 20 }).default(""),
  age: integer("age").default(0),
  bloodGroup: varchar("blood_group", { length: 10 }).default(""),
  city: varchar("city", { length: 100 }).default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// 2. Login Logs Table (Real User Login Sessions)
export const loginLogsTable = pgTable("login_logs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("user_id", { length: 64 }),
  userEmail: varchar("user_email", { length: 255 }).notNull(),
  userName: varchar("user_name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).default("patient"),
  ipAddress: varchar("ip_address", { length: 100 }).default(""),
  userAgent: text("user_agent"),
  loginTime: timestamp("login_time", { withTimezone: true }).defaultNow(),
});

// 3. Queue Tokens Table (Real OPD Appointments & Smart Queue Passes)
export const queueTokensTable = pgTable("queue_tokens", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tokenNumber: varchar("token_number", { length: 50 }).notNull(),
  userId: varchar("user_id", { length: 64 }),
  patientName: varchar("patient_name", { length: 255 }).notNull(),
  patientPhone: varchar("patient_phone", { length: 50 }).default(""),
  patientAge: integer("patient_age").default(0),
  patientGender: varchar("patient_gender", { length: 20 }).default(""),
  hospitalName: varchar("hospital_name", { length: 255 }).notNull(),
  departmentName: varchar("department_name", { length: 255 }).notNull(),
  queuePosition: integer("queue_position").default(1),
  currentServing: integer("current_serving").default(1),
  estimatedWaitMinutes: integer("estimated_wait_minutes").default(15),
  status: varchar("status", { length: 50 }).default("Waiting"),
  doctorName: varchar("doctor_name", { length: 255 }).default(""),
  roomNumber: varchar("room_number", { length: 100 }).default(""),
  problem: text("problem").default(""),
  bookedAt: timestamp("booked_at", { withTimezone: true }).defaultNow(),
});

// 4. Medical Reports Table (Real Patient Clinical Reports Scanned)
export const medicalReportsTable = pgTable("medical_reports", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("user_id", { length: 64 }),
  patientName: varchar("patient_name", { length: 255 }).notNull(),
  testType: varchar("test_type", { length: 255 }).notNull(),
  summary: text("summary"),
  overallStatus: varchar("overall_status", { length: 50 }).default("Normal"),
  vitalsJson: text("vitals_json").default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 5. Medicine Reminders Table (Real Patient Dosage Reminders)
export const medicineRemindersTable = pgTable("medicine_reminders", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("user_id", { length: 64 }),
  medicineName: varchar("medicine_name", { length: 255 }).notNull(),
  dosage: varchar("dosage", { length: 100 }).default(""),
  time: varchar("time", { length: 50 }).default(""),
  frequency: varchar("frequency", { length: 100 }).default(""),
  mealTiming: varchar("meal_timing", { length: 100 }).default(""),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable);
export const selectUserSchema = createSelectSchema(usersTable);
export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;

export const insertLoginLogSchema = createInsertSchema(loginLogsTable);
export const selectLoginLogSchema = createSelectSchema(loginLogsTable);
export type LoginLog = typeof loginLogsTable.$inferSelect;
export type InsertLoginLog = typeof loginLogsTable.$inferInsert;
