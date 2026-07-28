/**
 * Logger Manual - IÓN MAX
 * Sistema de logging sin dependencias externas
 * Para producción usar Sentry o similar
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  error?: Error;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private currentLevel: LogLevel = this.getLogLevelFromEnv();

  private getLogLevelFromEnv(): LogLevel {
    if (typeof window === 'undefined') {
      const envLevel = process.env.LOG_LEVEL || 'INFO';
      return LogLevel[envLevel as keyof typeof LogLevel] ?? LogLevel.INFO;
    }
    return LogLevel.INFO;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLevel;
  }

  private formatLog(entry: LogEntry): string {
    const levelName = LogLevel[entry.level];
    const contextStr = entry.context ? ` | Context: ${JSON.stringify(entry.context)}` : '';
    const userIdStr = entry.userId ? ` | User: ${entry.userId}` : '';
    const errorStr = entry.error ? ` | Error: ${entry.error.message}` : '';
    
    return `[${entry.timestamp}] [${levelName}]${userIdStr} ${entry.message}${contextStr}${errorStr}`;
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Mantener solo los últimos maxLogs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    
    // En producción, enviar a servicio de logging
    if (typeof window === 'undefined' && entry.level >= LogLevel.ERROR) {
      this.sendToExternalService(entry);
    }
  }

  private sendToExternalService(entry: LogEntry): void {
    // En producción, integrar con Sentry, LogRocket, etc.
    // Por ahora, solo console.error
    console.error(this.formatLog(entry));
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, userId?: string, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      userId,
      error,
    };

    this.addLog(entry);

    // Console output para desarrollo
    if (process.env.NODE_ENV === 'development') {
      const formatted = this.formatLog(entry);
      
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formatted);
          break;
        case LogLevel.INFO:
          console.info(formatted);
          break;
        case LogLevel.WARN:
          console.warn(formatted);
          break;
        case LogLevel.ERROR:
        case LogLevel.FATAL:
          console.error(formatted);
          break;
      }
    }
  }

  debug(message: string, context?: Record<string, any>, userId?: string): void {
    this.log(LogLevel.DEBUG, message, context, userId);
  }

  info(message: string, context?: Record<string, any>, userId?: string): void {
    this.log(LogLevel.INFO, message, context, userId);
  }

  warn(message: string, context?: Record<string, any>, userId?: string): void {
    this.log(LogLevel.WARN, message, context, userId);
  }

  error(message: string, error?: Error, context?: Record<string, any>, userId?: string): void {
    this.log(LogLevel.ERROR, message, context, userId, error);
  }

  fatal(message: string, error?: Error, context?: Record<string, any>, userId?: string): void {
    this.log(LogLevel.FATAL, message, context, userId, error);
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level >= level);
    }
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  setLogLevel(level: LogLevel): void {
    this.currentLevel = level;
  }
}

// Singleton instance
export const logger = new Logger();

// Logging específico para diferentes contextos
export const apiLogger = {
  request: (method: string, path: string, userId?: string) => {
    logger.info(`API Request: ${method} ${path}`, { method, path }, userId);
  },
  response: (method: string, path: string, status: number, duration: number, userId?: string) => {
    logger.info(`API Response: ${method} ${path} - ${status} (${duration}ms)`, { method, path, status, duration }, userId);
  },
  error: (method: string, path: string, error: Error, userId?: string) => {
    logger.error(`API Error: ${method} ${path}`, error, { method, path }, userId);
  },
};

export const authLogger = {
  login: (userId: string, email: string) => {
    logger.info(`User login: ${email}`, { userId }, userId);
  },
  logout: (userId: string) => {
    logger.info(`User logout`, {}, userId);
  },
  failedLogin: (email: string, reason: string) => {
    logger.warn(`Failed login attempt: ${email}`, { email, reason });
  },
  register: (userId: string, email: string) => {
    logger.info(`User registered: ${email}`, { userId }, userId);
  },
};

export const paymentLogger = {
  paymentInitiated: (orderId: string, amount: number, userId?: string) => {
    logger.info(`Payment initiated: Order ${orderId}`, { orderId, amount }, userId);
  },
  paymentCompleted: (orderId: string, amount: number, userId?: string) => {
    logger.info(`Payment completed: Order ${orderId}`, { orderId, amount }, userId);
  },
  paymentFailed: (orderId: string, amount: number, reason: string, userId?: string) => {
    logger.error(`Payment failed: Order ${orderId}`, undefined, { orderId, amount, reason }, userId);
  },
};

export const aiLogger = {
  request: (userId: string, promptLength: number) => {
    logger.info(`AI request: ${promptLength} chars`, { promptLength }, userId);
  },
  response: (userId: string, responseLength: number, duration: number) => {
    logger.info(`AI response: ${responseLength} chars (${duration}ms)`, { responseLength, duration }, userId);
  },
  error: (userId: string, error: Error) => {
    logger.error(`AI error`, error, {}, userId);
  },
};

export const securityLogger = {
  suspiciousActivity: (userId: string, activity: string, context?: Record<string, any>) => {
    logger.warn(`Suspicious activity: ${activity}`, context, userId);
  },
  rateLimitExceeded: (identifier: string, endpoint: string) => {
    logger.warn(`Rate limit exceeded: ${identifier} on ${endpoint}`, { identifier, endpoint });
  },
  invalidInput: (userId: string, field: string, value: any) => {
    logger.warn(`Invalid input: ${field}`, { field, value }, userId);
  },
  unauthorizedAccess: (userId: string, resource: string) => {
    logger.error(`Unauthorized access attempt: ${resource}`, undefined, { resource }, userId);
  },
};
