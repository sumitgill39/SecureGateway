import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull(), // Admin, TPO, Developer, QA
  email: text("email").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  owner: text("owner").notNull(),
  environment: text("environment").notNull(), // DEV, QA, UAT, STAGE, PREPROD, PROD, DR
  criticality: text("criticality").notNull(), // High, Medium, Low
  tags: text("tags").array().default([]),
  description: text("description"),
  resourceCount: integer("resource_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => applications.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // server, container, database
  environment: text("environment").notNull(),
  host: text("host").notNull(),
  tags: text("tags").array().default([]),
  status: text("status").default("active"), // active, inactive, maintenance
  createdAt: timestamp("created_at").defaultNow(),
});

export const accessRequests = pgTable("access_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  applicationId: integer("application_id").references(() => applications.id),
  resourceId: integer("resource_id").references(() => resources.id),
  accessType: text("access_type").notNull(), // read-only, read-write, emergency
  duration: integer("duration").notNull(), // in minutes
  justification: text("justification").notNull(),
  status: text("status").default("pending"), // pending, approved, rejected
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  resourceId: integer("resource_id").references(() => resources.id),
  accessRequestId: integer("access_request_id").references(() => accessRequests.id),
  accessType: text("access_type").notNull(),
  status: text("status").default("active"), // active, terminated, expired
  commandCount: integer("command_count").default(0),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  expiresAt: timestamp("expires_at").notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  sessionId: integer("session_id").references(() => sessions.id),
  resourceId: integer("resource_id").references(() => resources.id),
  action: text("action").notNull(),
  command: text("command"),
  output: text("output"),
  status: text("status").notNull(), // success, blocked, error
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertApplicationSchema = createInsertSchema(applications).omit({ id: true, createdAt: true });
export const insertResourceSchema = createInsertSchema(resources).omit({ id: true, createdAt: true });
export const insertAccessRequestSchema = createInsertSchema(accessRequests).omit({ 
  id: true, 
  createdAt: true,
  approvedBy: true,
  approvedAt: true,
  expiresAt: true 
});
export const insertSessionSchema = createInsertSchema(sessions).omit({ 
  id: true, 
  startTime: true,
  endTime: true 
});
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, timestamp: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type AccessRequest = typeof accessRequests.$inferSelect;
export type InsertAccessRequest = z.infer<typeof insertAccessRequestSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
