/**
 * DAMP Smart Drinkware - Comprehensive Debug Logger
 * 
 * Centralized debugging system with configurable levels and categories
 * Enable debugging by setting localStorage.DAMP_DEBUG = 'true'
 * Or for specific modules: localStorage.DAMP_DEBUG = 'auth,firebase,stripe'
 */

class DAMPDebugLogger {
    constructor() {
        this.enabled = this.checkDebugMode();
        this.categories = this.parseDebugCategories();
        this.logHistory = [];
        this.maxHistorySize = 1000;
        
        // Log levels
        this.levels = {
            ERROR: { color: '#ff4444', emoji: '❌', priority: 0 },
            WARN: { color: '#ffaa00', emoji: '⚠️', priority: 1 },
            INFO: { color: '#4CAF50', emoji: 'ℹ️', priority: 2 },
            DEBUG: { color: '#2196F3', emoji: '🔍', priority: 3 },
            TRACE: { color: '#9E9E9E', emoji: '📍', priority: 4 }
        };
        
        // Module categories with colors
        this.moduleColors = {
            auth: '#FF6B6B',
            firebase: '#FFA500',
            stripe: '#6772E5',
            analytics: '#4285F4',
            cart: '#34A853',
            performance: '#FBBC04',
            adsense: '#EA4335',
            general: '#757575'
        };
        
        this.initDebugControls();
    }
    
    /**
     * Check if debug mode is enabled
     */
    checkDebugMode() {
        try {
            const debugSetting = localStorage.getItem('DAMP_DEBUG');
            return debugSetting === 'true' || debugSetting === '*' || !!debugSetting;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Parse which categories to debug
     */
    parseDebugCategories() {
        try {
            const debugSetting = localStorage.getItem('DAMP_DEBUG');
            if (!debugSetting || debugSetting === 'true' || debugSetting === '*') {
                return ['*']; // All categories
            }
            return debugSetting.split(',').map(c => c.trim().toLowerCase());
        } catch (e) {
            return [];
        }
    }
    
    /**
     * Check if a category should be logged
     */
    shouldLog(category) {
        if (!this.enabled) return false;
        if (this.categories.includes('*')) return true;
        return this.categories.includes(category.toLowerCase());
    }
    
    /**
     * Initialize debug controls in console
     */
    initDebugControls() {
        window.DAMP_DEBUG = {
            enable: (categories = '*') => {
                localStorage.setItem('DAMP_DEBUG', categories);
                this.enabled = true;
                this.categories = this.parseDebugCategories();
                console.log('🎯 DAMP Debug Mode Enabled:', categories);
            },
            disable: () => {
                localStorage.removeItem('DAMP_DEBUG');
                this.enabled = false;
                console.log('🔇 DAMP Debug Mode Disabled');
            },
            history: () => this.logHistory,
            clear: () => {
                this.logHistory = [];
                console.log('🗑️ Debug history cleared');
            },
            categories: () => Object.keys(this.moduleColors),
            help: () => {
                console.log(`
🎯 DAMP Debug Logger Help
═══════════════════════════

Enable debugging:
  DAMP_DEBUG.enable()          // Enable all
  DAMP_DEBUG.enable('auth')    // Auth only
  DAMP_DEBUG.enable('auth,stripe') // Multiple

Disable debugging:
  DAMP_DEBUG.disable()

View history:
  DAMP_DEBUG.history()

Available categories:
  ${Object.keys(this.moduleColors).join(', ')}

Examples:
  DAMP_DEBUG.enable('auth')    // Debug auth flows
  DAMP_DEBUG.enable('*')       // Debug everything
                `);
            }
        };
        
        if (this.enabled) {
            console.log('🎯 DAMP Debug Mode Active:', this.categories.join(', '));
        }
    }
    
    /**
     * Main logging method
     */
    log(level, category, message, data = null, context = {}) {
        if (!this.shouldLog(category)) return;
        
        const timestamp = new Date().toISOString();
        const levelInfo = this.levels[level] || this.levels.INFO;
        const moduleColor = this.moduleColors[category] || this.moduleColors.general;
        
        // Store in history
        const logEntry = {
            timestamp,
            level,
            category,
            message,
            data,
            context
        };
        
        this.logHistory.push(logEntry);
        if (this.logHistory.length > this.maxHistorySize) {
            this.logHistory.shift();
        }
        
        // Format console output
        const prefix = `${levelInfo.emoji} [${category.toUpperCase()}]`;
        const timeStr = new Date().toLocaleTimeString();
        
        // Console styling
        const styles = [
            `color: ${moduleColor}; font-weight: bold`,
            `color: ${levelInfo.color}; font-weight: normal`,
            'color: inherit; font-weight: normal'
        ];
        
        // Log to console
        if (data) {
            console.log(
                `%c${prefix}%c ${message}%c @ ${timeStr}`,
                ...styles
            );
            console.log('  Data:', data);
        } else {
            console.log(
                `%c${prefix}%c ${message}%c @ ${timeStr}`,
                ...styles
            );
        }
        
        // Add context if provided
        if (context && Object.keys(context).length > 0) {
            console.log('  Context:', context);
        }
    }
    
    /**
     * Convenience methods for different log levels
     */
    error(category, message, data, context) {
        this.log('ERROR', category, message, data, context);
        console.error('Stack trace:', new Error().stack);
    }
    
    warn(category, message, data, context) {
        this.log('WARN', category, message, data, context);
    }
    
    info(category, message, data, context) {
        this.log('INFO', category, message, data, context);
    }
    
    debug(category, message, data, context) {
        this.log('DEBUG', category, message, data, context);
    }
    
    trace(category, message, data, context) {
        this.log('TRACE', category, message, data, context);
    }
    
    /**
     * Create a scoped logger for a specific module
     */
    createModuleLogger(category) {
        return {
            error: (msg, data, context) => this.error(category, msg, data, context),
            warn: (msg, data, context) => this.warn(category, msg, data, context),
            info: (msg, data, context) => this.info(category, msg, data, context),
            debug: (msg, data, context) => this.debug(category, msg, data, context),
            trace: (msg, data, context) => this.trace(category, msg, data, context),
            
            // Performance timing
            time: (label) => {
                const key = `${category}:${label}`;
                console.time(key);
                return key;
            },
            timeEnd: (key) => {
                console.timeEnd(key);
            }
        };
    }
    
    /**
     * Track performance metrics
     */
    trackPerformance(category, operation, duration) {
        this.info(category, `⏱️ Performance: ${operation}`, {
            duration: `${duration.toFixed(2)}ms`,
            category,
            operation
        });
    }
    
    /**
     * Track errors with full context
     */
    trackError(category, error, context = {}) {
        this.error(category, `Error: ${error.message}`, {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack
        }, context);
    }
}

// Create global instance
const debugLogger = new DAMPDebugLogger();

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = debugLogger;
}

// Make available globally
window.debugLogger = debugLogger;

// Log initialization
if (debugLogger.enabled) {
    console.log('🎯 DAMP Debug Logger Initialized');
    console.log('   Categories:', debugLogger.categories.join(', '));
    console.log('   Type DAMP_DEBUG.help() for usage');
}

