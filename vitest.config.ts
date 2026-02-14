/**
 * Vitest Configuration
 * Smart Inter-Wilaya Taxi v2
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Environment
    environment: 'jsdom',
    globals: true,
    
    // Setup files
    setupFiles: ['./tests/setup.ts'],
    
    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/types.ts',
      ],
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
    
    // Test patterns
    include: ['tests/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.next'],
    
    // Performance
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // Watch mode
    watch: false,
    
    // Reporters
    reporters: ['default', 'html'],
    
    // Pool
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 1,
        maxThreads: 4,
      },
    },
  },
  
  // Path aliases
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  // Define environment variables
  define: {
    'process.env.NODE_ENV': JSON.stringify('test'),
    'process.env.DATABASE_URL': JSON.stringify('postgresql://test:test@localhost:5432/smart_taxi_test'),
  },
});
