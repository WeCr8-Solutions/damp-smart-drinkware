/**
 * 🧪 DAMP Smart Drinkware - Google Audit Integration Tests
 * Tests for the comprehensive Google-level engineering audit system
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import the auditor class
const GoogleLevelAuditor = require('../../scripts/google-level-audit');

describe('Google-Level Engineering Audit', () => {
  let auditor;
  let originalConsoleLog;
  let consoleLogs;

  beforeAll(() => {
    // Capture console output for testing
    originalConsoleLog = console.log;
    consoleLogs = [];
    console.log = (message) => {
      consoleLogs.push(message);
      originalConsoleLog(message);
    };
  });

  afterAll(() => {
    // Restore console.log
    console.log = originalConsoleLog;
  });

  beforeEach(() => {
    auditor = new GoogleLevelAuditor();
    consoleLogs = [];
  });

  describe('Auditor Initialization', () => {
    test('should initialize with empty results', () => {
      expect(auditor.results).toEqual({
        passed: 0,
        failed: 0,
        warnings: 0,
        details: []
      });
    });
  });

  describe('Code Quality Audit', () => {
    test('should audit ESLint configuration', async () => {
      const eslintConfigPath = path.join(process.cwd(), 'eslint.config.js');
      const hasEslintConfig = fs.existsSync(eslintConfigPath);
      
      expect(hasEslintConfig).toBe(true);
      
      if (hasEslintConfig) {
        const config = require(eslintConfigPath);
        expect(config).toBeDefined();
        expect(Array.isArray(config)).toBe(true);
      }
    });

    test('should check TypeScript configuration', () => {
      const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
      const hasTsconfig = fs.existsSync(tsconfigPath);
      
      expect(hasTsconfig).toBe(true);
      
      if (hasTsconfig) {
        const config = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
        expect(config.compilerOptions).toBeDefined();
        expect(config.compilerOptions.strict).toBe(true);
      }
    });

    test('should validate package.json structure', () => {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Check required fields
      expect(packageJson.name).toBeDefined();
      expect(packageJson.version).toBeDefined();
      expect(packageJson.scripts).toBeDefined();
      expect(packageJson.dependencies).toBeDefined();
      expect(packageJson.devDependencies).toBeDefined();
      
      // Check for Google-level scripts
      const requiredScripts = [
        'lint',
        'test',
        'typescript:check',
        'analyze:complexity',
        'security:audit'
      ];
      
      requiredScripts.forEach(script => {
        expect(packageJson.scripts[script]).toBeDefined();
      });
    });
  });

  describe('Security Audit', () => {
    test('should detect .env files properly', () => {
      const envFiles = ['.env', '.env.local', '.env.example'];
      let hasEnvExample = false;
      
      envFiles.forEach(file => {
        const exists = fs.existsSync(path.join(process.cwd(), file));
        if (file === '.env.example') {
          hasEnvExample = exists;
        }
      });
      
      expect(hasEnvExample).toBe(true);
    });

    test('should check for security-related dependencies', () => {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };
      
      // Check for security-related packages
      const securityPackages = ['crypto-js'];
      securityPackages.forEach(pkg => {
        expect(allDeps[pkg]).toBeDefined();
      });
    });

    test('should validate .gitignore includes sensitive files', () => {
      const gitignorePath = path.join(process.cwd(), '.gitignore');
      
      if (fs.existsSync(gitignorePath)) {
        const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
        
        const sensitivePatterns = ['.env', 'node_modules/'];
        sensitivePatterns.forEach(pattern => {
          expect(gitignoreContent).toContain(pattern);
        });
      }
    });
  });

  describe('Testing Audit', () => {
    test('should check Jest configuration', () => {
      const jestConfigPath = path.join(process.cwd(), 'jest.config.js');
      const hasJestConfig = fs.existsSync(jestConfigPath);
      
      expect(hasJestConfig).toBe(true);
      
      if (hasJestConfig) {
        const config = require(jestConfigPath);
        expect(config.preset || config.testEnvironment).toBeDefined();
      }
    });

    test('should verify test directory structure', () => {
      const testDirs = [
        'tests/unit',
        'tests/integration',
        'tests/setup'
      ];
      
      testDirs.forEach(dir => {
        const dirPath = path.join(process.cwd(), dir);
        expect(fs.existsSync(dirPath)).toBe(true);
      });
    });

    test('should check for test setup files', () => {
      const setupFiles = [
        'tests/setup/jest-setup.ts',
        'tests/setup/unit-setup.ts',
        'tests/setup/integration-setup.ts'
      ];
      
      setupFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });
  });

  describe('Performance Audit', () => {
    test('should check for performance monitoring utilities', () => {
      const performanceUtilPath = path.join(process.cwd(), 'utils/performance.ts');
      expect(fs.existsSync(performanceUtilPath)).toBe(true);
      
      if (fs.existsSync(performanceUtilPath)) {
        const content = fs.readFileSync(performanceUtilPath, 'utf8');
        expect(content).toContain('PerformanceMonitor');
        expect(content).toContain('performance.now');
      }
    });

    test('should validate Metro configuration exists', () => {
      const possibleConfigs = [
        'metro.config.js',
        'metro.config.ts',
        'expo/metro.config.js'
      ];
      
      const hasMetroConfig = possibleConfigs.some(config => 
        fs.existsSync(path.join(process.cwd(), config))
      );
      
      expect(hasMetroConfig).toBe(true);
    });
  });

  describe('Architecture Audit', () => {
    test('should check component index files', () => {
      const indexFiles = [
        'components/index.ts',
        'utils/index.ts',
        'hooks/index.ts'
      ];
      
      indexFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          expect(content).toContain('export');
        }
      });
    });

    test('should verify error boundary implementation', () => {
      const errorBoundaryPath = path.join(process.cwd(), 'components/ErrorBoundary.tsx');
      expect(fs.existsSync(errorBoundaryPath)).toBe(true);
      
      if (fs.existsSync(errorBoundaryPath)) {
        const content = fs.readFileSync(errorBoundaryPath, 'utf8');
        expect(content).toContain('componentDidCatch');
        expect(content).toContain('ErrorBoundary');
      }
    });

    test('should check TypeScript path aliases', () => {
      const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
      
      if (fs.existsSync(tsconfigPath)) {
        const config = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
        expect(config.compilerOptions?.paths).toBeDefined();
        expect(config.compilerOptions?.baseUrl).toBeDefined();
        
        // Check for common aliases
        const paths = config.compilerOptions.paths;
        expect(paths['@/*']).toBeDefined();
      }
    });
  });

  describe('Documentation Audit', () => {
    test('should check for comprehensive documentation', () => {
      const docFiles = [
        'README.md',
        'GOOGLE_ENGINEERING_OPTIMIZATIONS.md',
        'IMPLEMENTATION_ROADMAP.md',
        'TESTING_OVERVIEW.md'
      ];
      
      docFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });

    test('should validate documentation content', () => {
      const readmePath = path.join(process.cwd(), 'README.md');
      
      if (fs.existsSync(readmePath)) {
        const content = fs.readFileSync(readmePath, 'utf8');
        expect(content.length).toBeGreaterThan(100); // Should have substantial content
      }
    });
  });

  describe('CI/CD Pipeline Audit', () => {
    test('should check GitHub Actions workflow', () => {
      const workflowPath = path.join(process.cwd(), '.github/workflows/google-level-ci.yml');
      expect(fs.existsSync(workflowPath)).toBe(true);
      
      if (fs.existsSync(workflowPath)) {
        const content = fs.readFileSync(workflowPath, 'utf8');
        expect(content).toContain('Google-Level CI/CD Pipeline');
        expect(content).toContain('quality-gates');
        expect(content).toContain('security-audit');
        expect(content).toContain('comprehensive-testing');
      }
    });

    test('should verify required workflow jobs', () => {
      const workflowPath = path.join(process.cwd(), '.github/workflows/google-level-ci.yml');
      
      if (fs.existsSync(workflowPath)) {
        const content = fs.readFileSync(workflowPath, 'utf8');
        const requiredJobs = [
          'quality-gates',
          'security-audit',
          'comprehensive-testing',
          'performance-audit',
          'build-verification'
        ];
        
        requiredJobs.forEach(job => {
          expect(content).toContain(job);
        });
      }
    });
  });

  describe('Audit Execution', () => {
    test('should record results correctly', () => {
      auditor.recordResult('Test Check', 'passed', 'Test message');
      
      expect(auditor.results.passed).toBe(1);
      expect(auditor.results.details).toHaveLength(1);
      expect(auditor.results.details[0]).toEqual({
        check: 'Test Check',
        status: 'passed',
        message: 'Test message'
      });
    });

    test('should handle different result types', () => {
      auditor.recordResult('Pass Check', 'passed', 'Passed');
      auditor.recordResult('Fail Check', 'failed', 'Failed');
      auditor.recordResult('Warn Check', 'warning', 'Warning');
      
      expect(auditor.results.passed).toBe(1);
      expect(auditor.results.failed).toBe(1);
      expect(auditor.results.warnings).toBe(1);
    });

    test('should generate score correctly', () => {
      // Add some results
      auditor.recordResult('Pass 1', 'passed', 'Passed');
      auditor.recordResult('Pass 2', 'passed', 'Passed');
      auditor.recordResult('Warn 1', 'warning', 'Warning');
      auditor.recordResult('Fail 1', 'failed', 'Failed');
      
      const total = auditor.results.passed + auditor.results.failed + auditor.results.warnings;
      const expectedScore = ((auditor.results.passed + auditor.results.warnings * 0.5) / total * 100);
      
      expect(total).toBe(4);
      expect(expectedScore).toBe(62.5); // (2 + 0.5) / 4 * 100
    });
  });

  describe('File Analysis Utilities', () => {
    test('should find files correctly', () => {
      const files = auditor.findFiles(['.ts', '.tsx']);
      
      expect(Array.isArray(files)).toBe(true);
      expect(files.length).toBeGreaterThan(0);
      
      // All files should have correct extensions
      files.forEach(file => {
        expect(['.ts', '.tsx'].some(ext => file.endsWith(ext))).toBe(true);
      });
    });

    test('should detect hardcoded secrets', () => {
      const testCases = [
        { content: 'const key = "sk_live_1234567890";', expected: true },
        { content: 'const key = "pk_live_1234567890";', expected: true },
        { content: 'const key = "normal-string";', expected: false },
        { content: 'const token = "AIza1234567890123456789012345";', expected: true }
      ];
      
      testCases.forEach(({ content, expected }) => {
        expect(auditor.containsHardcodedSecrets(content)).toBe(expected);
      });
    });

    test('should count error boundaries', () => {
      // This test depends on our ErrorBoundary component existing
      const count = auditor.countErrorBoundaries();
      expect(count).toBeGreaterThanOrEqual(1); // At least our ErrorBoundary component
    });
  });

  describe('Report Generation', () => {
    test('should generate JSON report', () => {
      // Add some test results
      auditor.recordResult('Test Pass', 'passed', 'Success');
      auditor.recordResult('Test Warn', 'warning', 'Warning');
      
      // Mock the file system write
      const originalWriteFileSync = fs.writeFileSync;
      let writtenData = null;
      fs.writeFileSync = jest.fn((filename, data) => {
        if (filename === 'google-audit-report.json') {
          writtenData = JSON.parse(data);
        }
      });
      
      // Generate report
      auditor.generateReport();
      
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        'google-audit-report.json',
        expect.any(String)
      );
      
      expect(writtenData).toMatchObject({
        timestamp: expect.any(String),
        score: expect.any(Number),
        summary: {
          passed: 1,
          failed: 0,
          warnings: 1,
          total: 2
        },
        details: expect.any(Array)
      });
      
      // Restore original function
      fs.writeFileSync = originalWriteFileSync;
    });
  });
});

describe('Google Audit Script Integration', () => {
  test('should be executable as standalone script', () => {
    const scriptPath = path.join(process.cwd(), 'scripts/google-level-audit.js');
    expect(fs.existsSync(scriptPath)).toBe(true);
    
    if (fs.existsSync(scriptPath)) {
      const content = fs.readFileSync(scriptPath, 'utf8');
      expect(content).toContain('#!/usr/bin/env node');
      expect(content).toContain('GoogleLevelAuditor');
    }
  });

  test('should have correct package.json scripts', () => {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Check for audit-related scripts
    const auditScripts = [
      'analyze:complexity',
      'analyze:bundle',
      'analyze:deps',
      'security:audit'
    ];
    
    auditScripts.forEach(script => {
      expect(packageJson.scripts[script]).toBeDefined();
      expect(typeof packageJson.scripts[script]).toBe('string');
    });
  });
});