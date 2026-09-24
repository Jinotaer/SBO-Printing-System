type LogLevel = "info" | "warn" | "error" | "debug";

interface LogContext {
  requestId?: string;
  userId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  durationMs?: number;
  [key: string]: unknown;
}

class Logger {
  private log(level: LogLevel, message: string, context?: LogContext): void {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context,
    };

    const line = JSON.stringify(entry);

    if (level === "error") {
      console.error(line);
    } else if (level === "warn") {
      console.warn(line);
    } else {
      console.log(line);
    }
  }

  info(message: string, context?: LogContext): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log("warn", message, context);
  }

  error(message: string, error?: unknown, context?: LogContext): void {
    const errorContext: LogContext = { ...context };
    if (error instanceof Error) {
      errorContext["error"] = error.message;
      errorContext["stack"] = error.stack;
    } else if (error !== undefined) {
      errorContext["error"] = String(error);
    }
    this.log("error", message, errorContext);
  }

  debug(message: string, context?: LogContext): void {
    if (process.env["NODE_ENV"] !== "production") {
      this.log("debug", message, context);
    }
  }
}

export const logger = new Logger();
