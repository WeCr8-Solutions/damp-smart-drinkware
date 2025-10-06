import fs from 'fs';
import path from 'path';

class TestLogger {
    constructor() {
        this.logDir = path.join(process.cwd(), 'logs', 'e2e-tests');
        this.setupLogDirectory();
        this.currentTestLog = [];
        this.startTime = new Date();
        this.filename = `e2e-test-${this.startTime.toISOString().replace(/[:.]/g, '-')}.log`;
    }

    setupLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    log(message, type = 'INFO') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${type}] ${message}`;
        this.currentTestLog.push(logEntry);
        console.log(logEntry);
    }

    logConsole(message) {
        this.log(`Console: ${message}`, 'BROWSER');
    }

    logNavigation(url) {
        this.log(`Navigation: ${url}`, 'NAVIGATION');
    }

    logError(error) {
        this.log(error.toString(), 'ERROR');
        if (error.stack) {
            this.log(error.stack, 'STACK');
        }
    }

    logNetworkRequest(request) {
        this.log(`Network Request: ${request.method()} ${request.url()}`, 'NETWORK');
    }

    logScreenshot(screenshotPath) {
        this.log(`Screenshot saved: ${screenshotPath}`, 'SCREENSHOT');
    }

    saveLog() {
        const endTime = new Date();
        const duration = endTime - this.startTime;
        
        const summary = [
            '----------------------------------------',
            'E2E Test Execution Summary',
            '----------------------------------------',
            `Start Time: ${this.startTime.toISOString()}`,
            `End Time: ${endTime.toISOString()}`,
            `Duration: ${duration}ms`,
            '----------------------------------------',
            '',
            ...this.currentTestLog
        ].join('\n');

        const logPath = path.join(this.logDir, this.filename);
        fs.writeFileSync(logPath, summary);
        console.log(`Test log saved to: ${logPath}`);
        return logPath;
    }
}

export const logger = new TestLogger();
export default logger;