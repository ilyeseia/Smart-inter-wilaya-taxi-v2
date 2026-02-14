/**
 * Production Code Audit Configuration
 * Smart Inter-Wilaya Taxi v2
 */

module.exports = {
  // Performance budgets
  performance: {
    // Core Web Vitals thresholds
    lcp: 2500, // Largest Contentful Paint (ms)
    fid: 100,  // First Input Delay (ms)
    cls: 0.1,  // Cumulative Layout Shift
    fcp: 1800, // First Contentful Paint (ms)
    tti: 3800, // Time to Interactive (ms)
    
    // Bundle size limits
    maxBundleSize: 300 * 1024, // 300 KB
    maxChunkSize: 100 * 1024, // 100 KB
    maxAssetSize: 50 * 1024,  // 50 KB
  },

  // Security checks
  security: {
    // Content Security Policy
    csp: {
      enabled: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'", "https://api.github.com"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
      },
    },

    // Headers
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    },

    // CORS
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    },
  },

  // Accessibility checks
  accessibility: {
    wcagLevel: 'AA',
    rules: [
      'color-contrast',
      'document-title',
      'html-has-lang',
      'html-lang-valid',
      'image-alt',
      'label',
      'link-name',
      'meta-viewport',
      'region',
      'skip-link',
      'tabindex',
    ],
  },

  // SEO checks
  seo: {
    requiredMeta: [
      'title',
      'description',
      'viewport',
      'robots',
      'og:title',
      'og:description',
      'og:image',
      'twitter:card',
    ],
    maxTitleLength: 60,
    maxDescriptionLength: 160,
  },

  // Environment variables validation
  envValidation: {
    required: [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
    ],
    optional: [
      'REDIS_URL',
      'SENTRY_DSN',
      'VERCEL_TOKEN',
    ],
    sensitivePatterns: [
      /secret/i,
      /key/i,
      /token/i,
      /password/i,
      /api[_-]?key/i,
    ],
  },
};
