/**
 * DAMP Smart Drinkware - Unified API Service
 * Handles API calls for both Netlify and Firebase Functions
 * Automatically detects environment and uses appropriate endpoints
 */

class DAMPApiService {
    constructor() {
        // Detect if we're on Firebase or Netlify
        this.isFirebase = window.location.hostname.includes('firebaseapp.com') || 
                         window.location.hostname.includes('web.app') ||
                         window.location.hostname === 'dampdrink.com';
        
        // Base URL for API calls
        this.baseUrl = this.isFirebase 
            ? '/api'  // Firebase rewrites /api/* to functions
            : '/.netlify/functions';  // Netlify functions
        
        console.log('🌐 API Service initialized:', {
            platform: this.isFirebase ? 'Firebase' : 'Netlify',
            baseUrl: this.baseUrl
        });
    }

    /**
     * Make API request with CORS and error handling
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(error.error || error.message || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`❌ API request failed [${endpoint}]:`, error);
            throw error;
        }
    }

    /**
     * Create Stripe checkout session
     */
    async createCheckoutSession(data) {
        return this.request('/create-checkout-session', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * Get Stripe checkout session
     */
    async getCheckoutSession(sessionId) {
        return this.request(`/get-checkout-session?session_id=${sessionId}`, {
            method: 'GET'
        });
    }

    /**
     * Get sales statistics
     */
    async getSalesStats() {
        return this.request('/get-sales-stats', {
            method: 'GET'
        });
    }

    /**
     * Submit a vote
     */
    async submitVote(productId, fingerprint, userId = null, voteType = 'public') {
        return this.request('/submit-vote', {
            method: 'POST',
            body: JSON.stringify({
                productId,
                fingerprint,
                userId,
                voteType
            })
        });
    }

    /**
     * Get voting results
     */
    async getVotingResults() {
        return this.request('/get-voting-results', {
            method: 'GET'
        });
    }

    /**
     * Check vote status
     */
    async checkVoteStatus(fingerprint, userId = null, voteType = 'public') {
        return this.request('/check-vote-status', {
            method: 'POST',
            body: JSON.stringify({
                fingerprint,
                userId,
                voteType
            })
        });
    }

    /**
     * Save email to waitlist
     */
    async saveEmail(email, name = '', source = 'waitlist') {
        return this.request('/save-email', {
            method: 'POST',
            body: JSON.stringify({
                email,
                name,
                source
            })
        });
    }

    /**
     * Get waitlist count
     */
    async getWaitlistCount() {
        return this.request('/get-waitlist-count', {
            method: 'GET'
        });
    }
}

// Initialize global API service
window.DAMPApi = new DAMPApiService();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DAMPApiService;
}

