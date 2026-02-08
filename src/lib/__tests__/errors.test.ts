import { describe, it, expect } from 'vitest';
import { 
  AppError, 
  NetworkError, 
  AuthenticationError, 
  ValidationError,
  getUserFriendlyMessage 
} from '../errors';

describe('Error Classes', () => {
  it('should create AppError with correct properties', () => {
    const error = new AppError('Test error', 'TEST_CODE', 500);
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_CODE');
    expect(error.statusCode).toBe(500);
  });

  it('should create NetworkError', () => {
    const error = new NetworkError();
    expect(error.name).toBe('NetworkError');
    expect(error.statusCode).toBe(503);
  });

  it('should create AuthenticationError', () => {
    const error = new AuthenticationError();
    expect(error.name).toBe('AuthenticationError');
    expect(error.statusCode).toBe(401);
  });

  it('should create ValidationError', () => {
    const error = new ValidationError();
    expect(error.name).toBe('ValidationError');
    expect(error.statusCode).toBe(400);
  });

  it('should get user-friendly message from AppError', () => {
    const error = new AppError('User friendly message');
    const message = getUserFriendlyMessage(error);
    expect(message).toBe('User friendly message');
  });

  it('should get user-friendly message from generic Error', () => {
    const error = new Error('Technical error message');
    const message = getUserFriendlyMessage(error);
    expect(message).toBe('Technical error message');
  });

  it('should handle fetch errors', () => {
    const error = new Error('fetch failed');
    const message = getUserFriendlyMessage(error);
    expect(message).toContain('connect to server');
  });
});
