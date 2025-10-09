// DAMP Smart Drinkware - Real Stripe Analytics Display
// Fetches and displays REAL sales data from Stripe

class StripeAnalyticsDisplay {
    constructor() {
        this.apiEndpoint = '/api/stripe-analytics';
        this.cacheKey = 'damp_stripe_analytics';
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
        this.analytics = null;
    }

    // Fetch real analytics from Stripe
    async fetchAnalytics() {
        // Check cache first
        const cached = this.getFromCache();
        if (cached) {
            console.log('📊 Using cached Stripe analytics');
            return cached;
        }

        try {
            console.log('📡 Fetching real Stripe analytics...');
            const response = await fetch(this.apiEndpoint);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch analytics`);
            }

            const result = await response.json();
            
            if (result.success && result.data) {
                this.analytics = result.data;
                this.saveToCache(this.analytics);
                console.log('✅ Real Stripe analytics loaded:', this.analytics);
                return this.analytics;
            } else {
                throw new Error('Invalid response format');
            }

        } catch (error) {
            console.error('❌ Failed to fetch Stripe analytics:', error);
            // Return empty analytics instead of fake data
            return {
                totalPreOrders: 0,
                totalRevenue: 0,
                averageOrderValue: 0,
                lastOrderDate: null,
                productBreakdown: {},
                recentOrders: []
            };
        }
    }

    // Cache management
    saveToCache(data) {
        try {
            const cacheData = {
                data: data,
                timestamp: Date.now()
            };
            localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
        } catch (error) {
            console.warn('Failed to cache analytics:', error);
        }
    }

    getFromCache() {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            if (!cached) return null;

            const cacheData = JSON.parse(cached);
            const age = Date.now() - cacheData.timestamp;

            if (age < this.cacheExpiry) {
                return cacheData.data;
            }

            // Cache expired
            localStorage.removeItem(this.cacheKey);
            return null;
        } catch (error) {
            console.warn('Failed to read cache:', error);
            return null;
        }
    }

    // Display total pre-orders
    async displayTotalPreOrders(elementId) {
        const analytics = await this.fetchAnalytics();
        const element = document.getElementById(elementId);
        
        if (element && analytics.totalPreOrders > 0) {
            element.textContent = analytics.totalPreOrders.toLocaleString();
            element.style.display = 'inline';
            element.closest('.stats-display')?.style.display = 'block';
        } else if (element) {
            // Hide if no orders yet
            element.closest('.stats-display')?.style.display = 'none';
        }
    }

    // Display total revenue
    async displayTotalRevenue(elementId) {
        const analytics = await this.fetchAnalytics();
        const element = document.getElementById(elementId);
        
        if (element && analytics.totalRevenue > 0) {
            element.textContent = `$${analytics.totalRevenue.toLocaleString()}`;
            element.style.display = 'inline';
        }
    }

    // Display product breakdown
    async displayProductBreakdown(containerId) {
        const analytics = await this.fetchAnalytics();
        const container = document.getElementById(containerId);
        
        if (!container || Object.keys(analytics.productBreakdown).length === 0) {
            return;
        }

        const productNames = {
            'damp-handle': 'DAMP Handle',
            'silicone-bottom': 'Silicone Bottom',
            'cup-sleeve': 'Cup Sleeve',
            'baby-bottle': 'Baby Bottle'
        };

        let html = '<div class="product-stats">';
        for (const [productId, quantity] of Object.entries(analytics.productBreakdown)) {
            const name = productNames[productId] || productId;
            html += `
                <div class="product-stat-item">
                    <span class="product-name">${name}</span>
                    <span class="product-quantity">${quantity} sold</span>
                </div>
            `;
        }
        html += '</div>';

        container.innerHTML = html;
        container.style.display = 'block';
    }

    // Display last order time (relative)
    async displayLastOrder(elementId) {
        const analytics = await this.fetchAnalytics();
        const element = document.getElementById(elementId);
        
        if (!element || !analytics.lastOrderDate) {
            element?.style.display = 'none';
            return;
        }

        const lastOrder = new Date(analytics.lastOrderDate);
        const now = new Date();
        const diffMs = now - lastOrder;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        let timeText;
        if (diffMins < 60) {
            timeText = `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        } else if (diffHours < 24) {
            timeText = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        } else {
            timeText = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        }

        element.textContent = `Last order: ${timeText}`;
        element.style.display = 'block';
    }

    // Initialize all displays on page
    async initializeAll() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeAll());
            return;
        }

        // Only show stats if there are real orders
        const analytics = await this.fetchAnalytics();
        
        if (analytics.totalPreOrders === 0) {
            console.log('ℹ️ No orders yet - hiding stats displays');
            document.querySelectorAll('.stats-display, .real-stats').forEach(el => {
                el.style.display = 'none';
            });
            return;
        }

        // Display real data
        console.log('📊 Displaying real Stripe data on page');
        
        // Common element IDs
        if (document.getElementById('total-pre-orders')) {
            await this.displayTotalPreOrders('total-pre-orders');
        }
        
        if (document.getElementById('total-revenue')) {
            await this.displayTotalRevenue('total-revenue');
        }
        
        if (document.getElementById('last-order-time')) {
            await this.displayLastOrder('last-order-time');
        }
        
        if (document.getElementById('product-breakdown')) {
            await this.displayProductBreakdown('product-breakdown');
        }
    }
}

// Create global instance
window.stripeAnalytics = new StripeAnalyticsDisplay();

// Auto-initialize if script is loaded normally
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.stripeAnalytics.initializeAll();
    });
} else {
    window.stripeAnalytics.initializeAll();
}

