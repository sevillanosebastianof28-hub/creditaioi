/**
 * Production-grade logging utility
 * Provides structured logging with levels and safe error handling
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = import.meta.env.MODE === 'development';
  private logLevel: LogLevel = import.meta.env.PROD ? 'warn' : 'debug';

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private sendToMonitoring(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    // In production, send to monitoring service (e.g., Sentry, LogRocket)
    if (import.meta.env.PROD && level === 'error') {
      // TODO: Integrate with error monitoring service
      // Example: Sentry.captureException(error, { extra: context });
    }
  }

  debug(message: string, context?: LogContext) {
    if (!this.shouldLog('debug')) return;
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext) {
    if (!this.shouldLog('info')) return;
    if (this.isDevelopment) {
      console.info(this.formatMessage('info', message, context));
    }
    this.sendToMonitoring('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    if (!this.shouldLog('warn')) return;
    if (this.isDevelopment) {
      console.warn(this.formatMessage('warn', message, context));
    }
    this.sendToMonitoring('warn', message, context);
  }

  error(message: string, error?: Error, context?: LogContext) {
    if (!this.shouldLog('error')) return;
    
    const errorContext = {
      ...context,
      errorMessage: error?.message,
      errorStack: error?.stack,
      errorName: error?.name,
    };

    if (this.isDevelopment) {
      console.error(this.formatMessage('error', message, errorContext));
      if (error) console.error(error);
    }
    
    this.sendToMonitoring('error', message, errorContext, error);
  }

  // Production-safe performance tracking
  time(label: string) {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label: string) {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for testing
export default logger;
