import dns from "node:dns";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";
import { User } from "../models/User.model.js";

// Ensure Atlas SRV resolves even when local router DNS is flaky (see server.ts same fix)
try {
  const current = dns.getServers();
  if (!current.includes("8.8.8.8")) dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4", ...current]);
} catch {
  // ignore
}

/**
 * Connect to MongoDB with exponential backoff retry.
 * Follows Backend Pattern: Retry with Exponential Backoff
 */
export async function connectDB(maxRetries = 3): Promise<void> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      mongoose.set("strictQuery", true);
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000,
      });
      logger.info("MongoDB connected", {
        host: mongoose.connection.host,
        name: mongoose.connection.name,
      });
      await seedInitialUsers();
      return;
    } catch (error) {
      lastError = error;
      const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
      logger.warn(`MongoDB connection failed (attempt ${attempt + 1}/${maxRetries})`, {
        error: (error as Error).message,
        nextRetryInMs: attempt < maxRetries - 1 ? delay : undefined,
      });

      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  logger.error("MongoDB connection failed after retries", lastError as Error);
  throw lastError;
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  logger.info("MongoDB disconnected");
}

async function seedInitialUsers(): Promise<void> {
  try {
    const seeds = [
      {
        name: "BukSU SBO Admin Officer",
        studentId: "2023-01492",
        email: "admin@student.buksu.edu.ph",
        role: "Lead Printing Officer",
        department: "College of Technologies (COT)",
        password: "Admin123!",
      },
      {
        name: "COT SBO Staff Member",
        studentId: "2023-08912",
        email: "staff@student.buksu.edu.ph",
        role: "Printing Assistant",
        department: "College of Technologies (COT)",
        password: "Admin123!",
      },
    ];

    for (const s of seeds) {
      const exists = await User.findOne({ email: s.email }).exec();
      if (!exists) {
        const hash = await bcrypt.hash(s.password, env.BCRYPT_ROUNDS);
        await User.create({
          name: s.name,
          studentId: s.studentId,
          email: s.email,
          passwordHash: hash,
          role: s.role,
          department: s.department,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(s.email)}`,
          provider: "password",
        });
        logger.info(`Seeded user ${s.email} (password: ${s.password})`);
      }
    }
  } catch (error) {
    logger.warn("Seeding initial users failed", { error: (error as Error).message });
  }
}
