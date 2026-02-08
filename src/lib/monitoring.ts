/**
 * Monitoring and observability utilities
 * Provides performance tracking and health monitoring
 */

import { logger } from './logger';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  error?: string;
}

class MonitoringService {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000;

  /**
   * Track a performance metric
   */
  trackMetric(name: string, value: number, metadata?: Record<string, unknown>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    logger.debug('Performance metric tracked', { name, value, metadata });
  }

  /**
   * Track API call performance
   */
  async trackApiCall<T>(
    name: string,
    operation: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      
      this.trackMetric(`api.${name}.duration`, duration, {
        ...metadata,
        status: 'success',
      });

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      this.trackMetric(`api.${name}.duration`, duration, {
        ...metadata,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  /**
   * Track page load performance
   */
  trackPageLoad() {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (perfData) {
        this.trackMetric('page.load.total', perfData.loadEventEnd - perfData.fetchStart);
        this.trackMetric('page.load.dom', perfData.domContentLoadedEventEnd - perfData.fetchStart);
        this.trackMetric('page.load.resources', perfData.loadEventEnd - perfData.domContentLoadedEventEnd);
      }
    });
  }

  /**
   * Track web vitals (Core Web Vitals)
   */
  trackWebVitals() {
    if (typeof window === 'undefined') return;

    // Track First Contentful Paint (FCP)
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.trackMetric('vitals.fcp', entry.startTime);
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['paint'] });
    } catch (error) {
      logger.warn('Failed to observe paint metrics', { error });
    }

    // Track Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any[]) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          this.trackMetric('vitals.cls', clsValue);
        }
      }
    });

    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      logger.warn('Failed to observe layout shift metrics', { error });
    }
  }

  /**
   * Perform health check on a service
   */
  async healthCheck(service: string, checkFn: () => Promise<boolean>): Promise<HealthCheck> {
    const startTime = performance.now();
    
    try {
      const isHealthy = await Promise.race([
        checkFn(),
        new Promise<boolean>((_, reject) => 
          setTimeout(() => reject(new Error('Health check timeout')), 5000)
        ),
      ]);

      const latency = performance.now() - startTime;

      return {
        service,
        status: isHealthy ? 'healthy' : 'unhealthy',
        latency,
      };
    } catch (error) {
      const latency = performance.now() - startTime;
      
      return {
        service,
        status: 'unhealthy',
        latency,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get average metric value
   */
  getAverageMetric(name: string, timeWindowMs: number = 60000): number | null {
    const now = Date.now();
    const relevantMetrics = this.metrics.filter(
      m => m.name === name && now - m.timestamp <= timeWindowMs
    );

    if (relevantMetrics.length === 0) return null;

    const sum = relevantMetrics.reduce((acc, m) => acc + m.value, 0);
    return sum / relevantMetrics.length;
  }

  /**
   * Get all metrics for reporting
   */
  getMetrics(timeWindowMs?: number): PerformanceMetric[] {
    if (!timeWindowMs) return [...this.metrics];

    const now = Date.now();
    return this.metrics.filter(m => now - m.timestamp <= timeWindowMs);
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics = [];
  }
}

// Export singleton instance
export const monitoring = new MonitoringService();

// Initialize web vitals tracking
if (typeof window !== 'undefined') {
  monitoring.trackPageLoad();
  monitoring.trackWebVitals();
}

export default monitoring;
