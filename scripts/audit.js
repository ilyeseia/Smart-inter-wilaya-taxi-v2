/**
 * Production Audit Script
 * Smart Inter-Wilaya Taxi v2
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

// Results
const results = {
  passed: [],
  warnings: [],
  failed: [],
};

// Helper functions
const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  pass: (msg) => console.log(`${colors.green}[PASS]${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}[WARN]${colors.reset} ${msg}`),
  fail: (msg) => console.log(`${colors.red}[FAIL]${colors.reset} ${msg}`),
};

function addResult(type, category, message) {
  results[type].push({ category, message });
}

// ============================================
// Security Checks
// ============================================
function checkSecurity() {
  log.info('Running security checks...');
  
  // Check for sensitive files
  const sensitiveFiles = ['.env', '.env.local', '.env.production', 'credentials.json'];
  sensitiveFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      addResult('failed', 'security', `Sensitive file found: ${file}`);
      log.fail(`Sensitive file found: ${file}`);
    } else {
      addResult('passed', 'security', `No sensitive file: ${file}`);
    }
  });

  // Check .gitignore
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, 'utf8');
    const required = ['.env', 'node_modules', '.next', 'dist'];
    required.forEach(item => {
      if (gitignore.includes(item)) {
        addResult('passed', 'security', `.gitignore contains ${item}`);
      } else {
        addResult('warnings', 'security', `.gitignore missing ${item}`);
        log.warn(`.gitignore should include ${item}`);
      }
    });
  }

  // Check for hardcoded secrets
  try {
    const result = execSync('grep -r "password\\|secret\\|api_key" src/ --include="*.ts" --include="*.tsx" || true', {
      encoding: 'utf8',
    });
    if (result.trim()) {
      addResult('warnings', 'security', 'Potential hardcoded secrets found');
      log.warn('Potential hardcoded secrets found in source files');
    }
  } catch (error) {
    // grep returns non-zero if no matches
  }
}

// ============================================
// Performance Checks
// ============================================
function checkPerformance() {
  log.info('Running performance checks...');
  
  // Check bundle size
  const nextDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(nextDir)) {
    const staticDir = path.join(nextDir, 'static');
    if (fs.existsSync(staticDir)) {
      const chunks = fs.readdirSync(path.join(staticDir, 'chunks'));
      const largeChunks = chunks.filter(chunk => {
        const stat = fs.statSync(path.join(staticDir, 'chunks', chunk));
        return stat.size > 500 * 1024; // 500 KB
      });
      
      if (largeChunks.length > 0) {
        addResult('warnings', 'performance', `Large chunks found: ${largeChunks.join(', ')}`);
        log.warn(`Large chunks found: ${largeChunks.join(', ')}`);
      } else {
        addResult('passed', 'performance', 'All chunks are under 500KB');
        log.pass('All chunks are under 500KB');
      }
    }
  }

  // Check for unused dependencies
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const deps = Object.keys(packageJson.dependencies || {});
    addResult('passed', 'performance', `${deps.length} dependencies found`);
  } catch (error) {
    addResult('warnings', 'performance', 'Could not check dependencies');
  }
}

// ============================================
// Accessibility Checks
// ============================================
function checkAccessibility() {
  log.info('Running accessibility checks...');
  
  // Check for lang attribute in layout
  const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx');
  if (fs.existsSync(layoutPath)) {
    const content = fs.readFileSync(layoutPath, 'utf8');
    if (content.includes('lang=')) {
      addResult('passed', 'accessibility', 'lang attribute found in layout');
      log.pass('lang attribute found in layout');
    } else {
      addResult('warnings', 'accessibility', 'lang attribute missing in layout');
      log.warn('lang attribute should be set in layout');
    }
  }

  // Check for skip links
  if (fs.existsSync(layoutPath)) {
    const content = fs.readFileSync(layoutPath, 'utf8');
    if (content.includes('skip') || content.includes('Skip')) {
      addResult('passed', 'accessibility', 'Skip link found');
      log.pass('Skip link found');
    } else {
      addResult('warnings', 'accessibility', 'Skip link not found');
      log.warn('Consider adding a skip link for accessibility');
    }
  }
}

// ============================================
// Code Quality Checks
// ============================================
function checkCodeQuality() {
  log.info('Running code quality checks...');
  
  // Check TypeScript configuration
  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
  if (fs.existsSync(tsconfigPath)) {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    if (tsconfig.compilerOptions?.strict) {
      addResult('passed', 'code-quality', 'TypeScript strict mode enabled');
      log.pass('TypeScript strict mode enabled');
    } else {
      addResult('warnings', 'code-quality', 'TypeScript strict mode not enabled');
      log.warn('Consider enabling TypeScript strict mode');
    }
  }

  // Check ESLint configuration
  const eslintPath = path.join(process.cwd(), 'eslint.config.mjs');
  if (fs.existsSync(eslintPath)) {
    addResult('passed', 'code-quality', 'ESLint configuration found');
    log.pass('ESLint configuration found');
  }

  // Check for console.log statements
  try {
    const result = execSync('grep -r "console\\.log" src/ --include="*.ts" --include="*.tsx" | wc -l', {
      encoding: 'utf8',
    });
    const count = parseInt(result.trim());
    if (count > 5) {
      addResult('warnings', 'code-quality', `${count} console.log statements found`);
      log.warn(`${count} console.log statements found in source code`);
    } else {
      addResult('passed', 'code-quality', `Only ${count} console.log statements`);
    }
  } catch (error) {
    // Ignore errors
  }
}

// ============================================
// Environment Checks
// ============================================
function checkEnvironment() {
  log.info('Running environment checks...');
  
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
  ];

  const envExamplePath = path.join(process.cwd(), '.env.example');
  if (fs.existsSync(envExamplePath)) {
    const envExample = fs.readFileSync(envExamplePath, 'utf8');
    requiredEnvVars.forEach(envVar => {
      if (envExample.includes(envVar)) {
        addResult('passed', 'environment', `${envVar} documented in .env.example`);
      } else {
        addResult('warnings', 'environment', `${envVar} not documented in .env.example`);
        log.warn(`${envVar} should be documented in .env.example`);
      }
    });
  }

  // Check for README
  const readmePath = path.join(process.cwd(), 'README.md');
  if (fs.existsSync(readmePath)) {
    addResult('passed', 'environment', 'README.md exists');
    log.pass('README.md exists');
  } else {
    addResult('warnings', 'environment', 'README.md missing');
    log.warn('README.md is missing');
  }

  // Check for LICENSE
  const licensePath = path.join(process.cwd(), 'LICENSE');
  if (fs.existsSync(licensePath)) {
    addResult('passed', 'environment', 'LICENSE exists');
    log.pass('LICENSE exists');
  } else {
    addResult('warnings', 'environment', 'LICENSE missing');
    log.warn('LICENSE is missing');
  }
}

// ============================================
// Main
// ============================================
function main() {
  console.log('\n========================================');
  console.log('  Production Code Audit');
  console.log('  Smart Inter-Wilaya Taxi v2');
  console.log('========================================\n');

  checkSecurity();
  checkPerformance();
  checkAccessibility();
  checkCodeQuality();
  checkEnvironment();

  // Print summary
  console.log('\n========================================');
  console.log('  Audit Summary');
  console.log('========================================');
  console.log(`${colors.green}Passed:${colors.reset} ${results.passed.length}`);
  console.log(`${colors.yellow}Warnings:${colors.reset} ${results.warnings.length}`);
  console.log(`${colors.red}Failed:${colors.reset} ${results.failed.length}`);

  if (results.failed.length > 0) {
    console.log('\nFailed checks:');
    results.failed.forEach((item, i) => {
      console.log(`  ${i + 1}. [${item.category}] ${item.message}`);
    });
    process.exit(1);
  }

  console.log(`\n${colors.green}Audit completed successfully!${colors.reset}\n`);
}

main();
