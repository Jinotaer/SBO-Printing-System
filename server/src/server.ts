import dns from "node:dns";
import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

// Fix for local router DNS (192.168.0.1) failing SRV lookup for Atlas.
// PowerShell Resolve-DnsName succeeds via 8.8.8.8 but Node's dns.promises.resolveSrv
// defaults to the system DNS first. Force reliable public resolvers before mongoose connects.
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch {
  // ignore if dns not available
}

const app = createApp();

async function start(): Promise<void> {
  try {
    const server = app.listen(env.PORT, () => {
      logger.info(`Server running`, {
        port: env.PORT,
        env: env.NODE_ENV,
        url: `http://localhost:${env.PORT}`,
      });
    });

    // Connect to MongoDB in background — don't block server startup
    // This keeps /api/health responsive even if DB is down (production: crash if required)
    void connectDB()
      .then(() => logger.info("MongoDB ready"))
      .catch((error: unknown) => {
        logger.warn("Starting without DB connection — API will return 500 for DB routes", {
          error: (error as Error).message,
        });
        if (env.NODE_ENV === "production") {
          logger.error("DB required in production, shutting down", error as Error);
          server.close(() => process.exit(1));
        }
      });

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`Received ${signal}, shutting down gracefully`);
      server.close(async () => {
        try {
          const mongoose = await import("mongoose");
          if (mongoose.default.connection.readyState === 1) {
            await mongoose.default.disconnect();
          }
        } catch {
          // ignore disconnect errors during shutdown
        }
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => void shutdown("SIGTERM"));
    process.on("SIGINT", () => void shutdown("SIGINT"));
  } catch (error) {
    logger.error("Failed to start server", error as Error);
    process.exit(1);
  }
}

// Global error handlers — prevent silent crashes
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection", reason as Error);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", error);
  process.exit(1);
});

void start();

export { app };
