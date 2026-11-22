import { pgTable, varchar, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

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

export const insertUserSchema = createInsertSchema(usersTable);
export const selectUserSchema = createSelectSchema(usersTable);
export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;

export const insertLoginLogSchema = createInsertSchema(loginLogsTable);
export const selectLoginLogSchema = createSelectSchema(loginLogsTable);
export type LoginLog = typeof loginLogsTable.$inferSelect;
export type InsertLoginLog = typeof loginLogsTable.$inferInsert;
