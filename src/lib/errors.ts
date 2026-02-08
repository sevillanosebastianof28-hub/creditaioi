/**
 * Centralized error handling utilities
 * Provides consistent error handling and user-friendly messages
 */

import { logger } from './logger';
import { toast } from 'sonner';

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network error occurred', context?: Record<string, unknown>) {
    super(message, 'NETWORK_ERROR', 503, context);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', context?: Record<string, unknown>) {
    super(message, 'AUTH_ERROR', 401, context);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', context?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, context);
    this.name = 'ValidationError';
  }
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Map common errors to user-friendly messages
    if (error.message.includes('fetch')) {
      return 'Unable to connect to server. Please check your internet connection.';
    }
    if (error.message.includes('JWT') || error.message.includes('auth')) {
      return 'Session expired. Please log in again.';
    }
    if (error.message.includes('Invalid email')) {
      return 'Please enter a valid email address.';
    }
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Handle error with logging and user notification
 */
export function handleError(error: unknown, customMessage?: string) {
  const message = customMessage || getUserFriendlyMessage(error);
  
  // Log the error
  if (error instanceof Error) {
    logger.error(message, error, {
      code: error instanceof AppError ? error.code : undefined,
    });
  } else {
    logger.error(message, undefined, { error });
  }

  // Show toast notification
  toast.error(message);
}

/**
 * Async error boundary wrapper
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  errorMessage?: string
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    handleError(error, errorMessage);
    return null;
  }
}

/**
 * Error boundary for React components
 */
export class ErrorBoundary {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  static componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('React error boundary caught error', error, {
      componentStack: errorInfo.componentStack,
    });
  }
}

/**
 * Retry logic for failed operations
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries) {
        logger.warn(`Operation failed, retrying (${attempt}/${maxRetries})`, {
          error: lastError.message,
          attempt,
        });
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }

  throw new NetworkError(`Operation failed after ${maxRetries} attempts`, {
    lastError: lastError?.message,
  });
}
