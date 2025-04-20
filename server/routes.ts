import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertTransactionSchema, 
  insertSavingsPlanSchema, 
  insertSavingsGoalSchema 
} from "@shared/schema";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "./mailer";
import { 
  sendTransactionNotification, 
  sendGoalAchievedNotification 
} from "./notification";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "7d";

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const router = express.Router();
  
  // Register user
  router.post("/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes
      
      // Create user with pending status
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
        otp,
        otpExpiry: otpExpiry.toISOString(),
        isVerified: false,
        balance: 0,
      });
      
      // Send verification email
      await sendVerificationEmail(user.email, otp);
      
      res.status(201).json({ 
        message: "User registered successfully. Please check your email for verification OTP.",
        userId: user.id
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Server error during registration" });
      }
    }
  });
  
  // Verify OTP
  router.post("/auth/verify-otp", async (req, res) => {
    try {
      const { userId, otp } = req.body;
      
      if (!userId || !otp) {
        return res.status(400).json({ message: "User ID and OTP are required" });
      }
      
      const user = await storage.getUser(Number(userId));
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.isVerified) {
        return res.status(400).json({ message: "User is already verified" });
      }
      
      if (user.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
      }
      
      const otpExpiry = new Date(user.otpExpiry);
      if (otpExpiry < new Date()) {
        return res.status(400).json({ message: "OTP has expired" });
      }
      
      // Verify user
      await storage.updateUser(user.id, { isVerified: true, otp: null, otpExpiry: null });
      
      res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
      console.error("OTP verification error:", error);
      res.status(500).json({ message: "Server error during OTP verification" });
    }
  });
  
  // Login
  router.post("/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      if (!user.isVerified) {
        return res.status(401).json({ message: "Please verify your email before logging in" });
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error during login" });
    }
  });
  
  // Resend OTP
  router.post("/auth/resend-otp", async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const user = await storage.getUser(Number(userId));
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.isVerified) {
        return res.status(400).json({ message: "User is already verified" });
      }
      
      // Generate new OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes
      
      // Update user with new OTP
      await storage.updateUser(user.id, { 
        otp, 
        otpExpiry: otpExpiry.toISOString() 
      });
      
      // Send verification email
      await sendVerificationEmail(user.email, otp);
      
      res.status(200).json({ message: "OTP resent successfully" });
    } catch (error) {
      console.error("Resend OTP error:", error);
      res.status(500).json({ message: "Server error while resending OTP" });
    }
  });
  
  // User profile
  router.get("/user/profile", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user's active savings goals
      const savingsGoals = await storage.getSavingsGoalsByUserId(user.id);
      
      // Get user's active savings plans
      const savingsPlans = await storage.getSavingsPlansByUserId(user.id);
      
      // Calculate total savings from transactions
      const transactions = await storage.getTransactionsByUserId(user.id);
      const totalSavings = transactions
        .filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0);
      
      res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        totalSavings,
        savingsGoals,
        savingsPlans
      });
    } catch (error) {
      console.error("Profile fetch error:", error);
      res.status(500).json({ message: "Server error while fetching profile" });
    }
  });
  
  // Add funds to balance (Cash only)
  router.post("/user/add-funds", authenticateToken, async (req: any, res) => {
    try {
      const { amount } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }
      
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update user balance (Cash is the only payment method)
      const newBalance = user.balance + Number(amount);
      await storage.updateUser(user.id, { balance: newBalance });
      
      // Record transaction
      await storage.createTransaction({
        userId: user.id,
        amount: Number(amount),
        type: "add_funds",
        description: `নগদ টাকা জমা করা হয়েছে`,
        date: new Date().toISOString()
      });
      
      // Get updated user with new balance
      const updatedUser = await storage.getUser(req.user.id);
      
      // Send email notification about balance update
      if (updatedUser) {
        try {
          // Use imported notification service directly
          await sendTransactionNotification(updatedUser, Number(amount), "add_funds");
        } catch (notificationError) {
          console.error("Notification error:", notificationError);
          // Don't fail the transaction if notification fails
        }
      }
      
      res.status(200).json({ 
        message: "Funds added successfully", 
        newBalance 
      });
    } catch (error) {
      console.error("Add funds error:", error);
      res.status(500).json({ message: "Server error while adding funds" });
    }
  });
  
  // Make deposit to savings
  router.post("/user/deposit", authenticateToken, async (req: any, res) => {
    try {
      const { amount, savingsGoalId, note } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }
      
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.balance < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Update user balance
      const newBalance = user.balance - Number(amount);
      await storage.updateUser(user.id, { balance: newBalance });
      
      let savingsGoal;
      
      // If savingsGoalId is provided, update goal progress
      if (savingsGoalId) {
        savingsGoal = await storage.getSavingsGoal(Number(savingsGoalId));
        
        if (!savingsGoal || savingsGoal.userId !== user.id) {
          return res.status(404).json({ message: "Savings goal not found" });
        }
        
        const newCurrentAmount = savingsGoal.currentAmount + Number(amount);
        await storage.updateSavingsGoal(savingsGoal.id, { currentAmount: newCurrentAmount });
        
        // Check if goal has been achieved
        const updatedGoal = await storage.getSavingsGoal(Number(savingsGoalId));
        if (updatedGoal && updatedGoal.currentAmount >= updatedGoal.targetAmount) {
          try {
            // Use imported notification service directly
            await sendGoalAchievedNotification(user, updatedGoal.name);
          } catch (notificationError) {
            console.error("Goal achievement notification error:", notificationError);
            // Don't fail the transaction if notification fails
          }
        }
      }
      
      // Record transaction
      const description = savingsGoalId 
        ? `${savingsGoal?.name} সেভিংস গোলে জমা করা হয়েছে` 
        : "সাধারণ সেভিংসে জমা করা হয়েছে";
      
      await storage.createTransaction({
        userId: user.id,
        amount: Number(amount),
        type: "deposit",
        description: note ? `${description}: ${note}` : description,
        savingsGoalId: savingsGoalId ? Number(savingsGoalId) : null,
        date: new Date().toISOString()
      });
      
      // Get updated user with new balance
      const updatedUser = await storage.getUser(req.user.id);
      
      // Send email notification about balance update
      if (updatedUser) {
        try {
          // Use imported notification service
          const notificationService = await import('./notification');
          await notificationService.sendTransactionNotification(updatedUser, Number(amount), "deposit");
        } catch (notificationError) {
          console.error("Notification error:", notificationError);
          // Don't fail the transaction if notification fails
        }
      }
      
      res.status(200).json({ 
        message: "Deposit successful", 
        newBalance 
      });
    } catch (error) {
      console.error("Deposit error:", error);
      res.status(500).json({ message: "Server error while making deposit" });
    }
  });
  
  // Create savings goal
  router.post("/savings-goals", authenticateToken, async (req: any, res) => {
    try {
      const goalData = insertSavingsGoalSchema.parse({
        ...req.body,
        userId: req.user.id,
        currentAmount: 0
      });
      
      const savingsGoal = await storage.createSavingsGoal(goalData);
      
      res.status(201).json({
        message: "Savings goal created successfully",
        savingsGoal
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        console.error("Create savings goal error:", error);
        res.status(500).json({ message: "Server error while creating savings goal" });
      }
    }
  });
  
  // Get savings goals
  router.get("/savings-goals", authenticateToken, async (req: any, res) => {
    try {
      const savingsGoals = await storage.getSavingsGoalsByUserId(req.user.id);
      
      res.status(200).json(savingsGoals);
    } catch (error) {
      console.error("Get savings goals error:", error);
      res.status(500).json({ message: "Server error while fetching savings goals" });
    }
  });
  
  // Create savings plan
  router.post("/savings-plans", authenticateToken, async (req: any, res) => {
    try {
      const planData = insertSavingsPlanSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const savingsPlan = await storage.createSavingsPlan(planData);
      
      res.status(201).json({
        message: "Savings plan created successfully",
        savingsPlan
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        console.error("Create savings plan error:", error);
        res.status(500).json({ message: "Server error while creating savings plan" });
      }
    }
  });
  
  // Get savings plans
  router.get("/savings-plans", authenticateToken, async (req: any, res) => {
    try {
      const savingsPlans = await storage.getSavingsPlansByUserId(req.user.id);
      
      res.status(200).json(savingsPlans);
    } catch (error) {
      console.error("Get savings plans error:", error);
      res.status(500).json({ message: "Server error while fetching savings plans" });
    }
  });
  
  // Get transactions
  router.get("/transactions", authenticateToken, async (req: any, res) => {
    try {
      const transactions = await storage.getTransactionsByUserId(req.user.id);
      
      res.status(200).json(transactions);
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ message: "Server error while fetching transactions" });
    }
  });
  
  // Define API routes with '/api' prefix
  app.use("/api", router);

  const httpServer = createServer(app);

  return httpServer;
}
