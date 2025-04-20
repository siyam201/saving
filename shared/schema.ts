import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  isVerified: boolean("is_verified").default(false),
  otp: text("otp"),
  otpExpiry: text("otp_expiry"),
  balance: doublePrecision("balance").default(0).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
  password: true,
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: doublePrecision("amount").notNull(),
  type: text("type").notNull(), // 'deposit', 'add_funds', 'withdrawal'
  description: text("description"),
  savingsGoalId: integer("savings_goal_id"),
  savingsPlanId: integer("savings_plan_id"),
  date: text("date").notNull(), // ISO string
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
});

// Savings Goals table
export const savingsGoals = pgTable("savings_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  targetAmount: doublePrecision("target_amount").notNull(),
  currentAmount: doublePrecision("current_amount").default(0).notNull(),
  targetDate: text("target_date").notNull(), // ISO string
  description: text("description"),
});

export const insertSavingsGoalSchema = createInsertSchema(savingsGoals).omit({
  id: true,
});

// Savings Plans table
export const savingsPlans = pgTable("savings_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: doublePrecision("amount").notNull(),
  frequency: text("frequency").notNull(), // 'daily', 'weekly', 'monthly'
  dayOfWeek: text("day_of_week"), // Optional for weekly plans
  dayOfMonth: integer("day_of_month"), // Optional for monthly plans
  savingsGoalId: integer("savings_goal_id"), // Optional link to a savings goal
  isActive: boolean("is_active").default(true),
});

export const insertSavingsPlanSchema = createInsertSchema(savingsPlans).omit({
  id: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type SavingsGoal = typeof savingsGoals.$inferSelect;
export type InsertSavingsGoal = z.infer<typeof insertSavingsGoalSchema>;

export type SavingsPlan = typeof savingsPlans.$inferSelect;
export type InsertSavingsPlan = z.infer<typeof insertSavingsPlanSchema>;
