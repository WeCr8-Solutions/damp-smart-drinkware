/**
 * Custom Jest Test Logger
 * Saves test results to timestamped log files
 */

const fs = require('fs');
const path = require('path');

class TestLogger {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
    this.testResults = [];
    this.startTime = new Date();
  }

  onRunStart() {
    this.startTime = new Date();
    console.log(`\n📊 Test run started at ${this.startTime.toLocaleString()}\n`);
  }

  onTestResult(test, testResult, aggregatedResult) {
    this.testResults.push({
      testPath: testResult.testFilePath,
      numPassingTests: testResult.numPassingTests,
      numFailingTests: testResult.numFailingTests,
      numPendingTests: testResult.numPendingTests,
      testResults: testResult.testResults,
      failureMessage: testResult.failureMessage
    });
  }

  onRunComplete(contexts, results) {
    const endTime = new Date();
    const duration = (endTime - this.startTime) / 1000;
    
    // Create logs directory if it doesn't exist
    const logsDir = path.join(__dirname, '../../test-logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Generate timestamp for filename
    const timestamp = this.startTime.toISOString().replace(/[:.]/g, '-').split('T');
    const dateStr = timestamp[0];
    const timeStr = timestamp[1].split('.')[0];
    const filename = `test-run-${dateStr}_${timeStr}.log`;
    const filepath = path.join(logsDir, filename);

    // Build log content
    let logContent = this.generateLogContent(results, endTime, duration);

    // Write to file
    fs.writeFileSync(filepath, logContent, 'utf8');

    // Also create a latest.log symlink/copy
    const latestPath = path.join(logsDir, 'latest.log');
    fs.writeFileSync(latestPath, logContent, 'utf8');

    // Console output
    console.log(`\n📝 Test log saved to: ${filepath}`);
    console.log(`📝 Latest log: ${latestPath}\n`);
  }

  generateLogContent(results, endTime, duration) {
    const lines = [];
    
    // Header
    lines.push('═'.repeat(80));
    lines.push('DAMP SMART DRINKWARE - TEST RUN LOG');
    lines.push('═'.repeat(80));
    lines.push('');
    lines.push(`Started:  ${this.startTime.toLocaleString()}`);
    lines.push(`Finished: ${endTime.toLocaleString()}`);
    lines.push(`Duration: ${duration.toFixed(2)}s`);
    lines.push('');
    
    // Summary
    lines.push('─'.repeat(80));
    lines.push('TEST SUMMARY');
    lines.push('─'.repeat(80));
    lines.push(`Total Test Suites: ${results.numTotalTestSuites}`);
    lines.push(`  ✓ Passed: ${results.numPassedTestSuites}`);
    lines.push(`  ✗ Failed: ${results.numFailedTestSuites}`);
    lines.push('');
    lines.push(`Total Tests: ${results.numTotalTests}`);
    lines.push(`  ✓ Passed: ${results.numPassedTests}`);
    lines.push(`  ✗ Failed: ${results.numFailedTests}`);
    lines.push(`  ○ Pending: ${results.numPendingTests}`);
    lines.push('');
    
    // Overall result
    const status = results.success ? '✅ PASSED' : '❌ FAILED';
    lines.push(`Overall Status: ${status}`);
    lines.push('');
    
    // Detailed results per test file
    if (this.testResults.length > 0) {
      lines.push('─'.repeat(80));
      lines.push('DETAILED RESULTS');
      lines.push('─'.repeat(80));
      lines.push('');
      
      this.testResults.forEach((result, index) => {
        const testName = path.basename(result.testPath);
        lines.push(`${index + 1}. ${testName}`);
        lines.push(`   Passed: ${result.numPassingTests}`);
        lines.push(`   Failed: ${result.numFailingTests}`);
        lines.push(`   Pending: ${result.numPendingTests}`);
        lines.push('');
        
        // List individual tests
        result.testResults.forEach(test => {
          const icon = test.status === 'passed' ? '✓' : test.status === 'failed' ? '✗' : '○';
          const time = test.duration ? `(${test.duration}ms)` : '';
          lines.push(`   ${icon} ${test.title} ${time}`);
          
          // Show failure messages
          if (test.status === 'failed' && test.failureMessages && test.failureMessages.length > 0) {
            test.failureMessages.forEach(msg => {
              const cleanMsg = msg.split('\n')[0]; // First line only
              lines.push(`     Error: ${cleanMsg.substring(0, 100)}...`);
            });
          }
        });
        lines.push('');
      });
    }
    
    // Failures detail
    if (results.numFailedTests > 0) {
      lines.push('─'.repeat(80));
      lines.push('FAILURE DETAILS');
      lines.push('─'.repeat(80));
      lines.push('');
      
      this.testResults.forEach(result => {
        if (result.failureMessage) {
          const testName = path.basename(result.testPath);
          lines.push(`File: ${testName}`);
          lines.push('');
          lines.push(result.failureMessage);
          lines.push('');
          lines.push('─'.repeat(80));
          lines.push('');
        }
      });
    }
    
    // Environment info
    lines.push('─'.repeat(80));
    lines.push('ENVIRONMENT');
    lines.push('─'.repeat(80));
    lines.push(`Node Version: ${process.version}`);
    lines.push(`Platform: ${process.platform}`);
    lines.push(`Architecture: ${process.arch}`);
    lines.push(`CI: ${process.env.CI || 'false'}`);
    lines.push('');
    
    // Footer
    lines.push('═'.repeat(80));
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push('═'.repeat(80));
    
    return lines.join('\n');
  }
}

module.exports = TestLogger;

