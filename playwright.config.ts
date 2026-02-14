/**
 * Playwright Configuration
 * Smart Inter-Wilaya Taxi v2
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test directory
  testDir: './tests/e2e',
  
  // Test patterns
  testMatch: '**/*.e2e.ts',
  
  // Fully parallel tests
  fullyParallel: true,
  
  // Fail build on CI if you accidentally left test.only
  forbidOnly: !!process.env.CI,
  
  // Retry on CI
  retries: process.env.CI ? 2 : 0,
  
  // Parallel workers
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  
  // Global settings
  use: {
    // Base URL
    baseURL: 'http://localhost:3000',
    
    // Trace on failure
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'on-first-retry',
    
    // Browser context
    contextOptions: {
      ignoreHTTPSErrors: true,
    },
  },
  
  // Configure projects
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  
  // Web server
  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
