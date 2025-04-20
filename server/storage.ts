import { 
  users, type User, type InsertUser, 
  transactions, type Transaction, type InsertTransaction,
  savingsGoals, type SavingsGoal, type InsertSavingsGoal,
  savingsPlans, type SavingsPlan, type InsertSavingsPlan,
  notifications, type Notification, type InsertNotification
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // Notification methods
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<Notification>;
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  
  // Transaction methods
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  
  // Savings Goal methods
  createSavingsGoal(goal: InsertSavingsGoal): Promise<SavingsGoal>;
  getSavingsGoal(id: number): Promise<SavingsGoal | undefined>;
  getSavingsGoalsByUserId(userId: number): Promise<SavingsGoal[]>;
  updateSavingsGoal(id: number, updates: Partial<SavingsGoal>): Promise<SavingsGoal>;
  
  // Savings Plan methods
  createSavingsPlan(plan: InsertSavingsPlan): Promise<SavingsPlan>;
  getSavingsPlan(id: number): Promise<SavingsPlan | undefined>;
  getSavingsPlansByUserId(userId: number): Promise<SavingsPlan[]>;
  updateSavingsPlan(id: number, updates: Partial<SavingsPlan>): Promise<SavingsPlan>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private savingsGoals: Map<number, SavingsGoal>;
  private savingsPlans: Map<number, SavingsPlan>;
  private notifications: Map<number, Notification>;
  
  private userCounter: number;
  private transactionCounter: number;
  private savingsGoalCounter: number;
  private savingsPlanCounter: number;
  private notificationCounter: number;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.savingsGoals = new Map();
    this.savingsPlans = new Map();
    this.notifications = new Map();
    
    this.userCounter = 1;
    this.transactionCounter = 1;
    this.savingsGoalCounter = 1;
    this.savingsPlanCounter = 1;
    this.notificationCounter = 1;
  }
  
  // Notification methods
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.notificationCounter++;
    const notification: Notification = { ...insertNotification, id };
    this.notifications.set(id, notification);
    return notification;
  }
  
  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async markNotificationAsRead(id: number): Promise<Notification> {
    const notification = this.notifications.get(id);
    if (!notification) {
      throw new Error(`Notification with ID ${id} not found`);
    }
    
    const updatedNotification = { ...notification, isRead: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Transaction methods
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionCounter++;
    const transaction: Transaction = { ...insertTransaction, id };
    this.transactions.set(id, transaction);
    return transaction;
  }
  
  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  // Savings Goal methods
  async createSavingsGoal(insertSavingsGoal: InsertSavingsGoal): Promise<SavingsGoal> {
    const id = this.savingsGoalCounter++;
    const savingsGoal: SavingsGoal = { ...insertSavingsGoal, id };
    this.savingsGoals.set(id, savingsGoal);
    return savingsGoal;
  }
  
  async getSavingsGoal(id: number): Promise<SavingsGoal | undefined> {
    return this.savingsGoals.get(id);
  }
  
  async getSavingsGoalsByUserId(userId: number): Promise<SavingsGoal[]> {
    return Array.from(this.savingsGoals.values())
      .filter(goal => goal.userId === userId)
      .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());
  }
  
  async updateSavingsGoal(id: number, updates: Partial<SavingsGoal>): Promise<SavingsGoal> {
    const savingsGoal = await this.getSavingsGoal(id);
    if (!savingsGoal) {
      throw new Error(`Savings goal with ID ${id} not found`);
    }
    
    const updatedSavingsGoal = { ...savingsGoal, ...updates };
    this.savingsGoals.set(id, updatedSavingsGoal);
    return updatedSavingsGoal;
  }
  
  // Savings Plan methods
  async createSavingsPlan(insertSavingsPlan: InsertSavingsPlan): Promise<SavingsPlan> {
    const id = this.savingsPlanCounter++;
    const savingsPlan: SavingsPlan = { ...insertSavingsPlan, id };
    this.savingsPlans.set(id, savingsPlan);
    return savingsPlan;
  }
  
  async getSavingsPlan(id: number): Promise<SavingsPlan | undefined> {
    return this.savingsPlans.get(id);
  }
  
  async getSavingsPlansByUserId(userId: number): Promise<SavingsPlan[]> {
    return Array.from(this.savingsPlans.values())
      .filter(plan => plan.userId === userId);
  }
  
  async updateSavingsPlan(id: number, updates: Partial<SavingsPlan>): Promise<SavingsPlan> {
    const savingsPlan = await this.getSavingsPlan(id);
    if (!savingsPlan) {
      throw new Error(`Savings plan with ID ${id} not found`);
    }
    
    const updatedSavingsPlan = { ...savingsPlan, ...updates };
    this.savingsPlans.set(id, updatedSavingsPlan);
    return updatedSavingsPlan;
  }
}

// Database implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        isVerified: false,
        balance: 0,
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    return user;
  }

  // Transaction methods
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date));
  }

  // Savings Goal methods
  async createSavingsGoal(insertSavingsGoal: InsertSavingsGoal): Promise<SavingsGoal> {
    const [savingsGoal] = await db
      .insert(savingsGoals)
      .values({
        ...insertSavingsGoal,
        currentAmount: 0,
      })
      .returning();
    return savingsGoal;
  }

  async getSavingsGoal(id: number): Promise<SavingsGoal | undefined> {
    const [savingsGoal] = await db
      .select()
      .from(savingsGoals)
      .where(eq(savingsGoals.id, id));
    return savingsGoal;
  }

  async getSavingsGoalsByUserId(userId: number): Promise<SavingsGoal[]> {
    return db
      .select()
      .from(savingsGoals)
      .where(eq(savingsGoals.userId, userId));
  }

  async updateSavingsGoal(id: number, updates: Partial<SavingsGoal>): Promise<SavingsGoal> {
    const [savingsGoal] = await db
      .update(savingsGoals)
      .set(updates)
      .where(eq(savingsGoals.id, id))
      .returning();

    if (!savingsGoal) {
      throw new Error(`Savings goal with ID ${id} not found`);
    }
    return savingsGoal;
  }

  // Savings Plan methods
  async createSavingsPlan(insertSavingsPlan: InsertSavingsPlan): Promise<SavingsPlan> {
    const [savingsPlan] = await db
      .insert(savingsPlans)
      .values({
        ...insertSavingsPlan,
        isActive: true,
      })
      .returning();
    return savingsPlan;
  }

  async getSavingsPlan(id: number): Promise<SavingsPlan | undefined> {
    const [savingsPlan] = await db
      .select()
      .from(savingsPlans)
      .where(eq(savingsPlans.id, id));
    return savingsPlan;
  }

  async getSavingsPlansByUserId(userId: number): Promise<SavingsPlan[]> {
    return db
      .select()
      .from(savingsPlans)
      .where(eq(savingsPlans.userId, userId));
  }

  async updateSavingsPlan(id: number, updates: Partial<SavingsPlan>): Promise<SavingsPlan> {
    const [savingsPlan] = await db
      .update(savingsPlans)
      .set(updates)
      .where(eq(savingsPlans.id, id))
      .returning();

    if (!savingsPlan) {
      throw new Error(`Savings plan with ID ${id} not found`);
    }
    return savingsPlan;
  }

  // Notification methods
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values({
        ...insertNotification,
        isRead: false,
      })
      .returning();
    return notification;
  }

  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: number): Promise<Notification> {
    const [notification] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();

    if (!notification) {
      throw new Error(`Notification with ID ${id} not found`);
    }
    return notification;
  }
}

// Use database storage instead of memory storage
export const storage = new DatabaseStorage();
