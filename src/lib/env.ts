/**
 * Environment validation utility
 * Validates required environment variables at startup
 */

import { logger } from './logger';

interface EnvConfig {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_PUBLISHABLE_KEY: string;
  VITE_SUPABASE_PROJECT_ID: string;
}

const requiredEnvVars: (keyof EnvConfig)[] = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'VITE_SUPABASE_PROJECT_ID',
];

/**
 * Validates that all required environment variables are present
 * @throws Error if any required variables are missing
 */
export function validateEnvironment(): EnvConfig {
  const missing: string[] = [];
  const invalid: string[] = [];

  for (const key of requiredEnvVars) {
    const value = import.meta.env[key];
    
    if (!value) {
      missing.push(key);
      continue;
    }

    // Validate format
    if (key === 'VITE_SUPABASE_URL' && !value.startsWith('https://')) {
      invalid.push(`${key} must be a valid HTTPS URL`);
    }

    if (key === 'VITE_SUPABASE_PUBLISHABLE_KEY' && !value.startsWith('eyJ')) {
      invalid.push(`${key} appears to be invalid (should start with 'eyJ')`);
    }
  }

  if (missing.length > 0) {
    const error = `Missing required environment variables: ${missing.join(', ')}. Please check your .env file.`;
    logger.error('Environment validation failed', new Error(error), { missing });
    throw new Error(error);
  }

  if (invalid.length > 0) {
    const error = `Invalid environment variables: ${invalid.join('; ')}`;
    logger.error('Environment validation failed', new Error(error), { invalid });
    throw new Error(error);
  }

  logger.info('Environment validation successful');

  return {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    VITE_SUPABASE_PROJECT_ID: import.meta.env.VITE_SUPABASE_PROJECT_ID,
  };
}

/**
 * Get validated environment configuration
 * Safe to use after validateEnvironment() has been called
 */
export function getEnvConfig(): EnvConfig {
  return {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    VITE_SUPABASE_PROJECT_ID: import.meta.env.VITE_SUPABASE_PROJECT_ID,
  };
}

/**
 * Check if running in production
 */
export const isProduction = import.meta.env.PROD;

/**
 * Check if running in development
 */
export const isDevelopment = import.meta.env.DEV;
