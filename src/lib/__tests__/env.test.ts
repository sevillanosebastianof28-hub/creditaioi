import { describe, it, expect } from 'vitest';
import { validateEnvironment } from '../env';

describe('Environment Validation', () => {
  it('should validate required environment variables', () => {
    // This will use the actual environment variables
    expect(() => validateEnvironment()).not.toThrow();
  });

  it('should return valid config object', () => {
    const config = validateEnvironment();
    expect(config).toHaveProperty('VITE_SUPABASE_URL');
    expect(config).toHaveProperty('VITE_SUPABASE_PUBLISHABLE_KEY');
    expect(config).toHaveProperty('VITE_SUPABASE_PROJECT_ID');
  });
});
