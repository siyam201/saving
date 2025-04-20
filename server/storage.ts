import { 
  users, type User, type InsertUser, 
  transactions, type Transaction, type InsertTransaction,
  savingsGoals, type SavingsGoal, type InsertSavingsGoal,
  savingsPlans, type SavingsPlan, type InsertSavingsPlan
} from "@shared/schema";

export interface IStorage {
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
  
  private userCounter: number;
  private transactionCounter: number;
  private savingsGoalCounter: number;
  private savingsPlanCounter: number;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.savingsGoals = new Map();
    this.savingsPlans = new Map();
    
    this.userCounter = 1;
    this.transactionCounter = 1;
    this.savingsGoalCounter = 1;
    this.savingsPlanCounter = 1;
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

export const storage = new MemStorage();
