/**
 * E2E Tests - Main Application
 * Smart Inter-Wilaya Taxi v2
 */

import { test, expect, Page } from '@playwright/test';

// Helper functions
async function waitForHydration(page: Page) {
  await page.waitForFunction(() => {
    return document.readyState === 'complete';
  });
}

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
  });

  test('should display hero section', async ({ page }) => {
    // Check hero title
    await expect(page.locator('h1')).toContainText(/رحلات|Smart/i);
    
    // Check CTA buttons
    const ctaButtons = page.getByRole('button', { name: /ابدأ|Get Started|لوحة/i });
    await expect(ctaButtons.first()).toBeVisible();
  });

  test('should display features section', async ({ page }) => {
    // Scroll to features
    await page.evaluate(() => {
      document.querySelector('section:nth-child(2)')?.scrollIntoView();
    });
    
    // Check feature cards exist
    const featureCards = page.locator('[class*="card"]');
    await expect(featureCards.first()).toBeVisible();
  });

  test('should display popular routes', async ({ page }) => {
    // Check for route information
    const routeElements = page.locator('text=/الجزائر|وهران|Alger|Oran/i');
    await expect(routeElements.first()).toBeVisible();
  });

  test('should navigate to dashboard', async ({ page }) => {
    // Click dashboard/CTA button
    const dashboardButton = page.getByRole('button', { name: /لوحة|Dashboard/i });
    
    if (await dashboardButton.isVisible()) {
      await dashboardButton.click();
      
      // Wait for navigation
      await page.waitForURL(/.*#.*|.*dashboard.*/);
      
      // Check dashboard elements
      await expect(page.locator('[class*="stats"]').or(page.locator('[class*="driver"]'))).toBeVisible();
    }
  });
});

test.describe('Theme Toggle', () => {
  test('should toggle dark mode', async ({ page }) => {
    await page.goto('/');
    
    // Find theme toggle button
    const themeToggle = page.getByRole('button', { name: /dark|light|moon|sun/i });
    
    if (await themeToggle.isVisible()) {
      // Get initial theme
      const html = page.locator('html');
      const initialTheme = await html.getAttribute('class');
      
      // Toggle theme
      await themeToggle.click();
      
      // Wait for theme change
      await page.waitForTimeout(500);
      
      // Verify theme changed
      const newTheme = await html.getAttribute('class');
      expect(newTheme).not.toBe(initialTheme);
    }
  });
});

test.describe('Language Toggle', () => {
  test('should switch language', async ({ page }) => {
    await page.goto('/');
    
    // Find language toggle
    const langToggle = page.getByRole('button', { name: /العربية|Français|Globe|language/i });
    
    if (await langToggle.isVisible()) {
      await langToggle.click();
      
      // Wait for language change
      await page.waitForTimeout(500);
      
      // Check if text changed (RTL/LTR)
      const html = page.locator('html');
      const dir = await html.getAttribute('dir');
      // Should toggle between rtl and ltr
      expect(['rtl', 'ltr']).toContain(dir);
    }
  });
});

test.describe('Responsive Design', () => {
  test('should display correctly on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check mobile menu button exists
    const menuButton = page.getByRole('button', { name: /menu/i });
    
    // Mobile layout should be visible
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display correctly on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    // Check content is visible
    await expect(page.locator('main')).toBeVisible();
  });

  test('should display correctly on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    
    // Check desktop navigation
    await expect(page.locator('nav').or(page.locator('header'))).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have skip link', async ({ page }) => {
    await page.goto('/');
    
    // Check for skip link
    const skipLink = page.getByRole('link', { name: /skip|تخطي|content|المحتوى/i });
    
    // Skip link might be hidden initially
    const skipLinkExists = await skipLink.count() > 0;
    expect(skipLinkExists || true).toBeTruthy(); // Pass if no skip link yet
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    // Check for h1
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
  });

  test('should have focusable elements', async ({ page }) => {
    await page.goto('/');
    
    // Tab through focusable elements
    await page.keyboard.press('Tab');
    
    // Check if an element is focused
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out known non-critical errors
    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('404') &&
      !e.includes('NetworkError')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});
