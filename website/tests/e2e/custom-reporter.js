// @ts-check
const fs = require('fs').promises;
const path = require('path');

/**
 * @typedef {Object} TestInfo
 * @property {string} title
 * @property {string} status
 * @property {string} duration
 * @property {string} timestamp
 * @property {string} [error]
 * @property {string} [location]
 */

/**
 * @typedef {Object} TestRun
 * @property {string} id
 * @property {string} timestamp
 * @property {number} totalTests
 * @property {TestInfo[]} failedTests
 * @property {TestInfo[]} passedTests
 * @property {TestInfo[]} fixesNeeded
 * @property {string} [endTimestamp]
 * @property {string} [status]
 */

class FixTrackingReporter {
  constructor() {
    this.issuesPath = path.join(process.cwd(), 'test-reports', 'issues');
    this.fixesNeededFile = path.join(this.issuesPath, 'fixes-needed.md');
    this.testRunSummaryFile = path.join(this.issuesPath, 'test-runs.json');
    this.currentRunId = new Date().toISOString().replace(/[:.]/g, '-');
    /** @type {TestRun[]} */
    this.testRuns = [];
    /** @type {TestRun|undefined} */
    this.currentRun = undefined;
  }

  /**
   * @param {any} config
   * @param {any} suite
   */
  async onBegin(config, suite) {
    // Ensure directories exist
    await fs.mkdir(this.issuesPath, { recursive: true });
    
    // Initialize or load existing test runs
    try {
      this.testRuns = JSON.parse(await fs.readFile(this.testRunSummaryFile, 'utf8')).allRuns || [];
    } catch {
      this.testRuns = [];
    }

    /** @type {TestRun} */
    this.currentRun = {
      id: this.currentRunId,
      timestamp: new Date().toISOString(),
      totalTests: suite.allTests().length,
      failedTests: [],
      passedTests: [],
      fixesNeeded: [],
      endTimestamp: '',
      status: '',
    };
  }

  /**
   * @param {any} test
   */
  async onTestBegin(test) {
    // Track test start time
    this.testStartTime = process.hrtime();
  }

  /**
   * @param {any} test
   * @param {any} result
   */
  async onTestEnd(test, result) {
    const duration = process.hrtime(this.testStartTime);
    const durationMs = (duration[0] * 1000 + duration[1] / 1e6).toFixed(2);

    /** @type {TestInfo} */
    const testInfo = {
      title: test.title,
      status: result.status,
      duration: `${durationMs}ms`,
      timestamp: new Date().toISOString(),
    };

    if (result.status === 'failed') {
      if (this.currentRun) {
        this.currentRun.failedTests.push({
          ...testInfo,
          error: result.error?.message || '',
          location: `${test.location.file}:${test.location.line}`,
        });
      }

      // Generate fix entry
      const fixEntry = `## Failed Test: ${test.title}\n` +
        `- **Time**: ${new Date().toISOString()}\n` +
        `- **Location**: ${test.location.file}:${test.location.line}\n` +
        `- **Error**: ${result.error?.message}\n` +
        `- **Status**: 🔴 Fix Needed\n` +
        `- **Steps to Reproduce**:\n` +
        `  1. See test file at line ${test.location.line}\n` +
        `  2. Run test with: npx playwright test "${test.location.file}" --headed\n` +
        `\n---\n\n`;

      await fs.appendFile(this.fixesNeededFile, fixEntry);
    } else {
      if (this.currentRun) {
        this.currentRun.passedTests.push(testInfo);
      }
    }
  }

  /**
   * @param {any} result
   */
  async onEnd(result) {
    if (!this.currentRun) return;
    this.currentRun.endTimestamp = new Date().toISOString();
    this.currentRun.status = result.status || '';
    this.testRuns.push(this.currentRun);

    // Keep only last 10 runs
    if (this.testRuns.length > 10) {
      this.testRuns = this.testRuns.slice(-10);
    }

    // Generate summary report
    const summary = {
      latestRun: this.currentRun,
      allRuns: this.testRuns,
      fixesNeeded: this.currentRun.failedTests.length,
      lastUpdated: new Date().toISOString(),
    };

    // Save test runs history
    await fs.writeFile(
      this.testRunSummaryFile,
      JSON.stringify(summary, null, 2)
    );

    // Generate or update the HTML dashboard
    await this.generateDashboard();
  }

  async generateDashboard() {
    const run = this.currentRun || {
      timestamp: '',
      totalTests: 0,
      failedTests: [],
      passedTests: [],
    };
    const dashboardContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Test Fixes Dashboard</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .failed { color: red; }
        .passed { color: green; }
        .test-run { border: 1px solid #ccc; padding: 10px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <h1>Test Fixes Dashboard</h1>
      <h2>Latest Run (${run.timestamp})</h2>
      <div class="test-run">
        <p>Total Tests: ${run.totalTests}</p>
        <p>Failed Tests: <span class="failed">${run.failedTests.length}</span></p>
        <p>Passed Tests: <span class="passed">${run.passedTests.length}</span></p>
      </div>
      ${run.failedTests.map(test => `
        <div class="test-run failed">
          <h3>${test.title || ''}</h3>
          <p>Location: ${test.location || ''}</p>
          <p>Error: ${test.error || ''}</p>
        </div>
      `).join('')}
    </body>
    </html>`;

    await fs.writeFile(
      path.join(this.issuesPath, 'dashboard.html'),
      dashboardContent
    );
  }
}

module.exports = FixTrackingReporter;