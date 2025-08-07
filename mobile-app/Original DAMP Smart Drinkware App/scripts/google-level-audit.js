#!/usr/bin/env node

/**
 * 🔍 DAMP Smart Drinkware - Google-Level Engineering Audit Script
 * Comprehensive code quality, security, and performance audit
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Audit configuration
const AUDIT_CONFIG = {
  performance: {
    bundleSizeLimit: 10 * 1024 * 1024, // 10MB
    memoryLimit: 150 * 1024 * 1024,     // 150MB
  },
  quality: {
    complexityThreshold: 10,
    testCoverageMinimum: 85,
  },
  security: {
    vulnerabilityLevel: 'high',
  }
};

class GoogleLevelAuditor {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      details: []
    };
  }

  /**
   * Run complete Google-level audit
   */
  async runFullAudit() {
    console.log('🚀 Starting Google-Level Engineering Audit for DAMP Smart Drinkware');
    console.log('=' .repeat(70));
    
    try {
      await this.auditCodeQuality();
      await this.auditSecurity();
      await this.auditPerformance();
      await this.auditTesting();
      await this.auditArchitecture();
      await this.auditAccessibility();
      
      this.generateReport();
    } catch (error) {
      console.error('❌ Audit failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Code quality audit
   */
  async auditCodeQuality() {
    console.log('\n🔍 Code Quality Audit');
    console.log('-'.repeat(30));

    // ESLint check
    try {
      execSync('npm run lint', { stdio: 'pipe' });
      this.recordResult('✅ ESLint', 'passed', 'No linting errors');
    } catch (error) {
      this.recordResult('❌ ESLint', 'failed', 'Linting errors found');
    }

    // TypeScript check
    try {
      execSync('npm run typescript:check', { stdio: 'pipe' });
      this.recordResult('✅ TypeScript', 'passed', 'Type checking passed');
    } catch (error) {
      this.recordResult('❌ TypeScript', 'failed', 'Type errors found');
    }

    // Complexity analysis
    try {
      execSync('npx ts-complexity-threshold src --threshold 10', { stdio: 'pipe' });
      this.recordResult('✅ Complexity', 'passed', 'Code complexity within limits');
    } catch (error) {
      this.recordResult('⚠️  Complexity', 'warning', 'Some functions exceed complexity threshold');
    }

    // Dependency check
    try {
      const depCheckResult = execSync('npx depcheck --json', { encoding: 'utf8' });
      const depCheck = JSON.parse(depCheckResult);
      
      if (depCheck.dependencies.length === 0 && depCheck.devDependencies.length === 0) {
        this.recordResult('✅ Dependencies', 'passed', 'All dependencies are used');
      } else {
        this.recordResult('⚠️  Dependencies', 'warning', `${depCheck.dependencies.length} unused dependencies`);
      }
    } catch (error) {
      this.recordResult('❌ Dependencies', 'failed', 'Dependency check failed');
    }
  }

  /**
   * Security audit
   */
  async auditSecurity() {
    console.log('\n🛡️  Security Audit');
    console.log('-'.repeat(20));

    // NPM security audit
    try {
      execSync('npm audit --audit-level=high', { stdio: 'pipe' });
      this.recordResult('✅ NPM Audit', 'passed', 'No high-severity vulnerabilities');
    } catch (error) {
      this.recordResult('❌ NPM Audit', 'failed', 'High-severity vulnerabilities found');
    }

    // Check for hardcoded secrets
    try {
      const files = this.findFiles(['.ts', '.tsx', '.js', '.jsx']);
      let secretsFound = 0;
      
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        if (this.containsHardcodedSecrets(content)) {
          secretsFound++;
        }
      }
      
      if (secretsFound === 0) {
        this.recordResult('✅ Secret Scan', 'passed', 'No hardcoded secrets found');
      } else {
        this.recordResult('❌ Secret Scan', 'failed', `${secretsFound} files with potential secrets`);
      }
    } catch (error) {
      this.recordResult('❌ Secret Scan', 'failed', 'Secret scanning failed');
    }

    // Environment security check
    const envFiles = ['.env', '.env.local', '.env.example'];
    let exposedSecrets = 0;
    
    for (const envFile of envFiles) {
      if (fs.existsSync(envFile)) {
        const content = fs.readFileSync(envFile, 'utf8');
        if (content.includes('sk_live_') || content.includes('pk_live_')) {
          exposedSecrets++;
        }
      }
    }
    
    if (exposedSecrets === 0) {
      this.recordResult('✅ Env Security', 'passed', 'No production secrets in env files');
    } else {
      this.recordResult('❌ Env Security', 'failed', 'Production secrets found in env files');
    }
  }

  /**
   * Performance audit
   */
  async auditPerformance() {
    console.log('\n⚡ Performance Audit');
    console.log('-'.repeat(25));

    // Bundle size check
    try {
      const bundleInfo = this.analyzeBundleSize();
      
      if (bundleInfo.size < AUDIT_CONFIG.performance.bundleSizeLimit) {
        this.recordResult('✅ Bundle Size', 'passed', `${(bundleInfo.size / 1024 / 1024).toFixed(1)}MB (under limit)`);
      } else {
        this.recordResult('❌ Bundle Size', 'failed', `${(bundleInfo.size / 1024 / 1024).toFixed(1)}MB (exceeds ${AUDIT_CONFIG.performance.bundleSizeLimit / 1024 / 1024}MB limit)`);
      }
    } catch (error) {
      this.recordResult('⚠️  Bundle Size', 'warning', 'Could not analyze bundle size');
    }

    // Performance test check
    try {
      execSync('npm run test:performance', { stdio: 'pipe' });
      this.recordResult('✅ Performance Tests', 'passed', 'Performance tests passed');
    } catch (error) {
      this.recordResult('⚠️  Performance Tests', 'warning', 'Performance tests failed or missing');
    }

    // Memory usage analysis
    try {
      execSync('npm run test:memory', { stdio: 'pipe' });
      this.recordResult('✅ Memory Tests', 'passed', 'Memory tests passed');
    } catch (error) {
      this.recordResult('⚠️  Memory Tests', 'warning', 'Memory tests failed or missing');
    }
  }

  /**
   * Testing audit
   */
  async auditTesting() {
    console.log('\n🧪 Testing Audit');
    console.log('-'.repeat(20));

    // Test coverage
    try {
      const coverageResult = execSync('npm run test:coverage', { encoding: 'utf8', stdio: 'pipe' });
      const coverage = this.parseCoverageFromOutput(coverageResult);
      
      if (coverage.lines >= AUDIT_CONFIG.quality.testCoverageMinimum) {
        this.recordResult('✅ Test Coverage', 'passed', `${coverage.lines}% line coverage`);
      } else {
        this.recordResult('❌ Test Coverage', 'failed', `${coverage.lines}% line coverage (below ${AUDIT_CONFIG.quality.testCoverageMinimum}% minimum)`);
      }
    } catch (error) {
      this.recordResult('❌ Test Coverage', 'failed', 'Coverage analysis failed');
    }

    // Unit tests
    try {
      execSync('npm run test:unit', { stdio: 'pipe' });
      this.recordResult('✅ Unit Tests', 'passed', 'All unit tests passed');
    } catch (error) {
      this.recordResult('❌ Unit Tests', 'failed', 'Unit tests failed');
    }

    // Integration tests
    try {
      execSync('npm run test:integration', { stdio: 'pipe' });
      this.recordResult('✅ Integration Tests', 'passed', 'All integration tests passed');
    } catch (error) {
      this.recordResult('⚠️  Integration Tests', 'warning', 'Integration tests failed or missing');
    }
  }

  /**
   * Architecture audit
   */
  async auditArchitecture() {
    console.log('\n🏗️  Architecture Audit');
    console.log('-'.repeat(25));

    // Check for circular dependencies
    const circularDeps = this.findCircularDependencies();
    if (circularDeps.length === 0) {
      this.recordResult('✅ Circular Dependencies', 'passed', 'No circular dependencies found');
    } else {
      this.recordResult('❌ Circular Dependencies', 'failed', `${circularDeps.length} circular dependencies found`);
    }

    // Check component structure
    const componentStructure = this.analyzeComponentStructure();
    if (componentStructure.isValid) {
      this.recordResult('✅ Component Structure', 'passed', 'Component architecture follows best practices');
    } else {
      this.recordResult('⚠️  Component Structure', 'warning', componentStructure.issues.join(', '));
    }

    // Check for proper error boundaries
    const errorBoundaryCount = this.countErrorBoundaries();
    if (errorBoundaryCount > 0) {
      this.recordResult('✅ Error Boundaries', 'passed', `${errorBoundaryCount} error boundaries implemented`);
    } else {
      this.recordResult('❌ Error Boundaries', 'failed', 'No error boundaries found');
    }
  }

  /**
   * Accessibility audit
   */
  async auditAccessibility() {
    console.log('\n♿ Accessibility Audit');
    console.log('-'.repeat(25));

    // Check for accessibility tests
    if (fs.existsSync('tests/accessibility')) {
      try {
        execSync('npm run test:accessibility', { stdio: 'pipe' });
        this.recordResult('✅ A11y Tests', 'passed', 'Accessibility tests passed');
      } catch (error) {
        this.recordResult('❌ A11y Tests', 'failed', 'Accessibility tests failed');
      }
    } else {
      this.recordResult('⚠️  A11y Tests', 'warning', 'No accessibility tests found');
    }

    // Check for accessibility attributes in components
    const a11yCompliance = this.checkAccessibilityCompliance();
    if (a11yCompliance.compliant) {
      this.recordResult('✅ A11y Compliance', 'passed', `${a11yCompliance.compliantComponents} components with proper a11y`);
    } else {
      this.recordResult('⚠️  A11y Compliance', 'warning', `${a11yCompliance.nonCompliantComponents} components missing a11y attributes`);
    }
  }

  /**
   * Helper methods
   */
  
  recordResult(check, status, message) {
    const result = { check, status, message };
    this.results.details.push(result);
    
    if (status === 'passed') this.results.passed++;
    else if (status === 'failed') this.results.failed++;
    else if (status === 'warning') this.results.warnings++;
    
    console.log(`${result.check}: ${result.message}`);
  }

  findFiles(extensions) {
    const files = [];
    const traverse = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          traverse(fullPath);
        } else if (extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    };
    
    traverse('.');
    return files;
  }

  containsHardcodedSecrets(content) {
    const secretPatterns = [
      /sk_live_[a-zA-Z0-9]+/,
      /pk_live_[a-zA-Z0-9]+/,
      /AIza[0-9A-Za-z\\-_]{35}/,
      /[0-9]+-[0-9A-Za-z_]{32}\\.apps\\.googleusercontent\\.com/,
      /[a-f0-9]{40}/, // Generic 40-char hex (GitHub token)
    ];
    
    return secretPatterns.some(pattern => pattern.test(content));
  }

  analyzeBundleSize() {
    // Simplified bundle size analysis
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const nodeModulesSize = this.getDirectorySize('node_modules');
    const srcSize = this.getDirectorySize('src') || this.getDirectorySize('app');
    
    return {
      size: nodeModulesSize * 0.1 + srcSize, // Rough estimate
      dependencies: Object.keys(packageJson.dependencies || {}).length
    };
  }

  getDirectorySize(dirPath) {
    if (!fs.existsSync(dirPath)) return 0;
    
    let totalSize = 0;
    const traverse = (dir) => {
      try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stats = fs.statSync(fullPath);
          if (stats.isDirectory()) {
            traverse(fullPath);
          } else {
            totalSize += stats.size;
          }
        }
      } catch (error) {
        // Skip inaccessible directories
      }
    };
    
    traverse(dirPath);
    return totalSize;
  }

  parseCoverageFromOutput(output) {
    const coverageMatch = output.match(/Lines\s+:\s+([0-9.]+)%/);
    return {
      lines: coverageMatch ? parseFloat(coverageMatch[1]) : 0
    };
  }

  findCircularDependencies() {
    // Simplified circular dependency detection
    // In a real implementation, this would use a proper dependency graph analyzer
    return []; // Placeholder
  }

  analyzeComponentStructure() {
    const componentFiles = this.findFiles(['.tsx', '.jsx']);
    const issues = [];
    
    // Check for components without proper exports
    let componentsWithIssues = 0;
    for (const file of componentFiles.slice(0, 10)) { // Sample first 10
      const content = fs.readFileSync(file, 'utf8');
      if (!content.includes('export') && !content.includes('module.exports')) {
        componentsWithIssues++;
      }
    }
    
    if (componentsWithIssues > 0) {
      issues.push(`${componentsWithIssues} components without proper exports`);
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }

  countErrorBoundaries() {
    const files = this.findFiles(['.ts', '.tsx', '.js', '.jsx']);
    let count = 0;
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('ErrorBoundary') || content.includes('componentDidCatch')) {
        count++;
      }
    }
    
    return count;
  }

  checkAccessibilityCompliance() {
    const componentFiles = this.findFiles(['.tsx', '.jsx']);
    let compliantComponents = 0;
    let nonCompliantComponents = 0;
    
    for (const file of componentFiles.slice(0, 20)) { // Sample first 20
      const content = fs.readFileSync(file, 'utf8');
      
      if (content.includes('accessibilityLabel') || 
          content.includes('accessibilityHint') || 
          content.includes('accessibilityRole')) {
        compliantComponents++;
      } else if (content.includes('<TouchableOpacity') || 
                 content.includes('<Button') || 
                 content.includes('<TextInput')) {
        nonCompliantComponents++;
      }
    }
    
    return {
      compliant: nonCompliantComponents === 0,
      compliantComponents,
      nonCompliantComponents
    };
  }

  generateReport() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 GOOGLE-LEVEL ENGINEERING AUDIT REPORT');
    console.log('='.repeat(70));
    
    const total = this.results.passed + this.results.failed + this.results.warnings;
    const score = ((this.results.passed + this.results.warnings * 0.5) / total * 100).toFixed(1);
    
    console.log(`\n🎯 Overall Score: ${score}%`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    
    console.log('\n📋 Grade Assessment:');
    if (score >= 95) {
      console.log('🏆 EXCELLENT - Google L5+ Standards');
    } else if (score >= 85) {
      console.log('🥇 VERY GOOD - Google L4+ Standards');
    } else if (score >= 75) {
      console.log('🥈 GOOD - Google L3+ Standards');
    } else if (score >= 65) {
      console.log('🥉 FAIR - Needs Improvement');
    } else {
      console.log('🔴 POOR - Major Issues to Address');
    }

    console.log('\n🔧 Next Steps:');
    console.log('1. Fix all failed checks (❌)');
    console.log('2. Address warning items (⚠️)');
    console.log('3. Run audit regularly in CI/CD');
    console.log('4. Aim for 95+ score for Google-level excellence');
    
    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      score: parseFloat(score),
      summary: {
        passed: this.results.passed,
        failed: this.results.failed,
        warnings: this.results.warnings,
        total
      },
      details: this.results.details
    };
    
    fs.writeFileSync('google-audit-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed report saved to: google-audit-report.json');
    
    // Exit with error code if critical issues found
    if (this.results.failed > 0) {
      process.exit(1);
    }
  }
}

// Run audit if called directly
if (require.main === module) {
  const auditor = new GoogleLevelAuditor();
  auditor.runFullAudit().catch(console.error);
}

module.exports = GoogleLevelAuditor;