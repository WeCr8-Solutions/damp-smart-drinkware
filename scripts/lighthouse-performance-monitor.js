#!/usr/bin/env node

/**
 * DAMP Lighthouse Performance Monitor
 * Continuous performance monitoring and alerting system
 * Integrates with CI/CD pipeline for automated performance tracking
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DAMPPerformanceMonitor {
    constructor(options = {}) {
        this.config = {
            urls: [
                'https://dampdrink.com',
                'https://dampdrink.com/pages/products.html',
                'https://dampdrink.com/pages/damp-handle-v1.0.html',
                'https://dampdrink.com/pages/silicone-bottom-v1.0.html',
                'https://dampdrink.com/pages/pre-sale-funnel.html'
            ],
            thresholds: {
                performance: 80,
                accessibility: 90,
                bestPractices: 90,
                seo: 90,
                fcp: 2000,
                lcp: 4000,
                cls: 0.1,
                tbt: 300,
                si: 4000
            },
            outputDir: './performance-reports',
            slackWebhook: process.env.SLACK_WEBHOOK_URL,
            emailConfig: {
                enabled: process.env.EMAIL_NOTIFICATIONS === 'true',
                recipients: (process.env.NOTIFICATION_EMAILS || '').split(',').filter(Boolean)
            },
            ...options
        };
        
        this.results = [];
        this.alerts = [];
        
        this.ensureOutputDirectory();
    }
    
    ensureOutputDirectory() {
        if (!fs.existsSync(this.config.outputDir)) {
            fs.mkdirSync(this.config.outputDir, { recursive: true });
        }
    }
    
    async runAudit() {
        console.log('🚀 Starting DAMP Performance Monitoring...');
        console.log(`📊 Auditing ${this.config.urls.length} URLs`);
        
        for (const url of this.config.urls) {
            console.log(`\n🔍 Auditing: ${url}`);
            await this.auditUrl(url);
        }
        
        await this.generateReport();
        await this.checkThresholds();
        await this.sendAlerts();
        
        console.log('\n✅ Performance monitoring complete!');
        return this.results;
    }
    
    async auditUrl(url) {
        const timestamp = new Date().toISOString();
        const reportPath = path.join(
            this.config.outputDir,
            `lighthouse-${this.sanitizeUrl(url)}-${Date.now()}.json`
        );
        
        try {
            // Run Lighthouse audit
            const command = `npx lighthouse "${url}" --output=json --output-path="${reportPath}" --chrome-flags="--headless --no-sandbox --disable-dev-shm-usage"`;
            
            console.log(`  ⏳ Running Lighthouse audit...`);
            execSync(command, { stdio: 'pipe' });
            
            // Parse results
            const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
            const result = this.parseReport(report, url, timestamp);
            
            this.results.push(result);
            
            // Log results
            this.logResults(result);
            
        } catch (error) {
            console.error(`  ❌ Error auditing ${url}:`, error.message);
            
            this.results.push({
                url,
                timestamp,
                error: error.message,
                success: false
            });
        }
    }
    
    parseReport(report, url, timestamp) {
        const categories = report.lhr.categories;
        const audits = report.lhr.audits;
        
        return {
            url,
            timestamp,
            success: true,
            scores: {
                performance: Math.round(categories.performance.score * 100),
                accessibility: Math.round(categories.accessibility.score * 100),
                bestPractices: Math.round(categories['best-practices'].score * 100),
                seo: Math.round(categories.seo.score * 100)
            },
            metrics: {
                fcp: audits['first-contentful-paint']?.numericValue || 0,
                lcp: audits['largest-contentful-paint']?.numericValue || 0,
                cls: audits['cumulative-layout-shift']?.numericValue || 0,
                tbt: audits['total-blocking-time']?.numericValue || 0,
                si: audits['speed-index']?.numericValue || 0
            },
            opportunities: this.extractOpportunities(audits),
            reportPath: report.lhr.finalUrl
        };
    }
    
    extractOpportunities(audits) {
        const opportunities = [];
        
        const opportunityAudits = [
            'render-blocking-resources',
            'unused-css-rules',
            'unused-javascript',
            'modern-image-formats',
            'uses-optimized-images',
            'uses-text-compression',
            'unminified-css',
            'unminified-javascript'
        ];
        
        for (const auditId of opportunityAudits) {
            const audit = audits[auditId];
            if (audit && audit.score < 1) {
                opportunities.push({
                    id: auditId,
                    title: audit.title,
                    description: audit.description,
                    score: Math.round(audit.score * 100),
                    savings: audit.details?.overallSavingsMs || 0,
                    items: audit.details?.items?.length || 0
                });
            }
        }
        
        return opportunities.sort((a, b) => b.savings - a.savings);
    }
    
    logResults(result) {
        if (!result.success) {
            console.log(`  ❌ Audit failed`);
            return;
        }
        
        console.log(`  📊 Performance: ${result.scores.performance}/100`);
        console.log(`  ♿ Accessibility: ${result.scores.accessibility}/100`);
        console.log(`  🏆 Best Practices: ${result.scores.bestPractices}/100`);
        console.log(`  🔍 SEO: ${result.scores.seo}/100`);
        
        console.log(`  🎯 Core Web Vitals:`);
        console.log(`    FCP: ${Math.round(result.metrics.fcp)}ms`);
        console.log(`    LCP: ${Math.round(result.metrics.lcp)}ms`);
        console.log(`    CLS: ${result.metrics.cls.toFixed(3)}`);
        console.log(`    TBT: ${Math.round(result.metrics.tbt)}ms`);
        
        if (result.opportunities.length > 0) {
            console.log(`  💡 Top opportunities:`);
            result.opportunities.slice(0, 3).forEach(opp => {
                console.log(`    • ${opp.title} (${opp.savings}ms savings)`);
            });
        }
    }
    
    async checkThresholds() {
        console.log('\n🎯 Checking performance thresholds...');
        
        for (const result of this.results) {
            if (!result.success) continue;
            
            const violations = [];
            
            // Check score thresholds
            if (result.scores.performance < this.config.thresholds.performance) {
                violations.push(`Performance score ${result.scores.performance} below threshold ${this.config.thresholds.performance}`);
            }
            
            if (result.scores.accessibility < this.config.thresholds.accessibility) {
                violations.push(`Accessibility score ${result.scores.accessibility} below threshold ${this.config.thresholds.accessibility}`);
            }
            
            if (result.scores.bestPractices < this.config.thresholds.bestPractices) {
                violations.push(`Best Practices score ${result.scores.bestPractices} below threshold ${this.config.thresholds.bestPractices}`);
            }
            
            if (result.scores.seo < this.config.thresholds.seo) {
                violations.push(`SEO score ${result.scores.seo} below threshold ${this.config.thresholds.seo}`);
            }
            
            // Check Core Web Vitals thresholds
            if (result.metrics.fcp > this.config.thresholds.fcp) {
                violations.push(`FCP ${Math.round(result.metrics.fcp)}ms exceeds threshold ${this.config.thresholds.fcp}ms`);
            }
            
            if (result.metrics.lcp > this.config.thresholds.lcp) {
                violations.push(`LCP ${Math.round(result.metrics.lcp)}ms exceeds threshold ${this.config.thresholds.lcp}ms`);
            }
            
            if (result.metrics.cls > this.config.thresholds.cls) {
                violations.push(`CLS ${result.metrics.cls.toFixed(3)} exceeds threshold ${this.config.thresholds.cls}`);
            }
            
            if (result.metrics.tbt > this.config.thresholds.tbt) {
                violations.push(`TBT ${Math.round(result.metrics.tbt)}ms exceeds threshold ${this.config.thresholds.tbt}ms`);
            }
            
            if (violations.length > 0) {
                const alert = {
                    url: result.url,
                    timestamp: result.timestamp,
                    severity: 'warning',
                    violations,
                    scores: result.scores,
                    metrics: result.metrics
                };
                
                this.alerts.push(alert);
                
                console.log(`  ⚠️  ${result.url}:`);
                violations.forEach(violation => {
                    console.log(`    • ${violation}`);
                });
            } else {
                console.log(`  ✅ ${result.url}: All thresholds passed`);
            }
        }
        
        if (this.alerts.length === 0) {
            console.log('🎉 All performance thresholds passed!');
        } else {
            console.log(`⚠️  ${this.alerts.length} performance alerts generated`);
        }
    }
    
    async generateReport() {
        console.log('\n📊 Generating performance report...');
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalUrls: this.config.urls.length,
                successfulAudits: this.results.filter(r => r.success).length,
                failedAudits: this.results.filter(r => !r.success).length,
                averageScores: this.calculateAverageScores(),
                alertsGenerated: this.alerts.length
            },
            results: this.results,
            alerts: this.alerts,
            config: this.config
        };
        
        // Save detailed report
        const reportPath = path.join(this.config.outputDir, `performance-report-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        // Generate summary report
        const summaryPath = path.join(this.config.outputDir, 'latest-summary.json');
        const summary = {
            timestamp: report.timestamp,
            summary: report.summary,
            alerts: this.alerts.length,
            worstPerformingUrl: this.findWorstPerformingUrl(),
            topOpportunities: this.getTopOpportunities()
        };
        
        fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
        
        console.log(`  ✅ Detailed report saved: ${reportPath}`);
        console.log(`  ✅ Summary saved: ${summaryPath}`);
        
        return report;
    }
    
    calculateAverageScores() {
        const successfulResults = this.results.filter(r => r.success);
        
        if (successfulResults.length === 0) return null;
        
        const totals = successfulResults.reduce((acc, result) => {
            acc.performance += result.scores.performance;
            acc.accessibility += result.scores.accessibility;
            acc.bestPractices += result.scores.bestPractices;
            acc.seo += result.scores.seo;
            return acc;
        }, { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 });
        
        const count = successfulResults.length;
        
        return {
            performance: Math.round(totals.performance / count),
            accessibility: Math.round(totals.accessibility / count),
            bestPractices: Math.round(totals.bestPractices / count),
            seo: Math.round(totals.seo / count)
        };
    }
    
    findWorstPerformingUrl() {
        const successfulResults = this.results.filter(r => r.success);
        
        if (successfulResults.length === 0) return null;
        
        return successfulResults.reduce((worst, current) => {
            return current.scores.performance < worst.scores.performance ? current : worst;
        });
    }
    
    getTopOpportunities() {
        const allOpportunities = [];
        
        this.results.forEach(result => {
            if (result.success && result.opportunities) {
                result.opportunities.forEach(opp => {
                    opp.url = result.url;
                    allOpportunities.push(opp);
                });
            }
        });
        
        return allOpportunities
            .sort((a, b) => b.savings - a.savings)
            .slice(0, 10);
    }
    
    async sendAlerts() {
        if (this.alerts.length === 0) return;
        
        console.log('\n📢 Sending performance alerts...');
        
        // Send Slack notification
        if (this.config.slackWebhook) {
            await this.sendSlackAlert();
        }
        
        // Send email notifications
        if (this.config.emailConfig.enabled) {
            await this.sendEmailAlert();
        }
        
        // GitHub Issue (if in CI environment)
        if (process.env.GITHUB_ACTIONS) {
            await this.createGitHubIssue();
        }
    }
    
    async sendSlackAlert() {
        try {
            const message = this.formatSlackMessage();
            
            // This would typically use a Slack webhook
            console.log('📱 Slack alert formatted (webhook required for sending):');
            console.log(JSON.stringify(message, null, 2));
            
        } catch (error) {
            console.error('❌ Failed to send Slack alert:', error.message);
        }
    }
    
    formatSlackMessage() {
        const averageScores = this.calculateAverageScores();
        
        return {
            text: `🚨 DAMP Performance Alert - ${this.alerts.length} issues detected`,
            blocks: [
                {
                    type: 'header',
                    text: {
                        type: 'plain_text',
                        text: '🚨 Performance Alert - DAMP Smart Drinkware'
                    }
                },
                {
                    type: 'section',
                    fields: [
                        {
                            type: 'mrkdwn',
                            text: `*Performance:* ${averageScores?.performance || 'N/A'}/100`
                        },
                        {
                            type: 'mrkdwn',
                            text: `*Accessibility:* ${averageScores?.accessibility || 'N/A'}/100`
                        },
                        {
                            type: 'mrkdwn',
                            text: `*Best Practices:* ${averageScores?.bestPractices || 'N/A'}/100`
                        },
                        {
                            type: 'mrkdwn',
                            text: `*SEO:* ${averageScores?.seo || 'N/A'}/100`
                        }
                    ]
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*Issues Found:*\n${this.alerts.map(alert => 
                            `• ${alert.url}: ${alert.violations.length} violations`
                        ).join('\n')}`
                    }
                }
            ]
        };
    }
    
    async sendEmailAlert() {
        // Email sending would be implemented here
        console.log('📧 Email alert ready (SMTP configuration required)');
        console.log(`Recipients: ${this.config.emailConfig.recipients.join(', ')}`);
    }
    
    async createGitHubIssue() {
        // GitHub issue creation would be implemented here
        console.log('🐛 GitHub issue creation ready (GitHub API integration required)');
    }
    
    sanitizeUrl(url) {
        return url.replace(/https?:\/\//, '').replace(/[\/\?#]/g, '-').replace(/[^a-zA-Z0-9\-]/g, '');
    }
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const options = {};
    
    // Parse command line arguments
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        if (arg === '--url' && args[i + 1]) {
            options.urls = [args[i + 1]];
            i++;
        } else if (arg === '--output-dir' && args[i + 1]) {
            options.outputDir = args[i + 1];
            i++;
        } else if (arg === '--help') {
            console.log(`
DAMP Lighthouse Performance Monitor

Usage: node lighthouse-performance-monitor.js [options]

Options:
  --url <url>           Single URL to audit (default: all configured URLs)
  --output-dir <dir>    Output directory for reports (default: ./performance-reports)
  --help               Show this help message

Environment Variables:
  SLACK_WEBHOOK_URL     Slack webhook for notifications
  EMAIL_NOTIFICATIONS   Enable email notifications (true/false)
  NOTIFICATION_EMAILS   Comma-separated list of email recipients
  GITHUB_ACTIONS        Automatically detected in CI environment
            `);
            process.exit(0);
        }
    }
    
    const monitor = new DAMPPerformanceMonitor(options);
    
    monitor.runAudit()
        .then(() => {
            console.log('\n🎉 Performance monitoring completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Performance monitoring failed:', error.message);
            process.exit(1);
        });
}

module.exports = DAMPPerformanceMonitor;
