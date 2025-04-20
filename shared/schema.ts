import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
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

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: text("created_at").notNull(), // ISO string
  type: text("type").notNull(), // 'balance', 'goal_achieved', 'reminder', etc.
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
  savingsGoals: many(savingsGoals),
  savingsPlans: many(savingsPlans),
  notifications: many(notifications),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const savingsGoalsRelations = relations(savingsGoals, ({ one, many }) => ({
  user: one(users, {
    fields: [savingsGoals.userId],
    references: [users.id],
  }),
  savingsPlans: many(savingsPlans),
}));

export const savingsPlansRelations = relations(savingsPlans, ({ one }) => ({
  user: one(users, {
    fields: [savingsPlans.userId],
    references: [users.id],
  }),
  savingsGoal: one(savingsGoals, {
    fields: [savingsPlans.savingsGoalId],
    references: [savingsGoals.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type SavingsGoal = typeof savingsGoals.$inferSelect;
export type InsertSavingsGoal = z.infer<typeof insertSavingsGoalSchema>;

export type SavingsPlan = typeof savingsPlans.$inferSelect;
export type InsertSavingsPlan = z.infer<typeof insertSavingsPlanSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
