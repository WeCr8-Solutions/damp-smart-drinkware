/**
 * DAMP Voting Service
 * Handles voting via API service (works with both Netlify and Firebase)
 */

class NetlifyVotingService {
    constructor() {
        // Use unified API service if available, otherwise fallback to Netlify
        this.apiService = window.DAMPApi || null;
        this.baseUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:8888/.netlify/functions'
            : '/.netlify/functions';
        
        console.log('🌐 Voting Service initialized:', {
            hasApiService: !!this.apiService,
            baseUrl: this.baseUrl
        });
    }

    /**
     * Submit a vote
     * @param {string} productId - Product identifier
     * @param {string} fingerprint - Browser fingerprint (for public votes)
     * @param {string} userId - Firebase user ID (for authenticated votes)
     * @param {string} voteType - 'public' or 'authenticated'
     */
    async submitVote(productId, fingerprint, userId = null, voteType = 'public') {
        try {
            // Use unified API service if available
            if (this.apiService) {
                const data = await this.apiService.submitVote(productId, fingerprint, userId, voteType);
                return { success: true, data };
            }

            // Fallback to direct fetch
            const response = await fetch(`${this.baseUrl}/submit-vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId,
                    fingerprint,
                    userId,
                    voteType
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Vote submission failed');
            }

            console.log('✅ Vote submitted successfully:', data);
            return {
                success: true,
                data
            };

        } catch (error) {
            console.error('❌ Vote submission failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get current voting results
     */
    async getResults() {
        try {
            // Use unified API service if available
            if (this.apiService) {
                const data = await this.apiService.getVotingResults();
                return { success: true, data };
            }

            // Fallback to direct fetch
            const response = await fetch(`${this.baseUrl}/get-voting-results`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch results');
            }

            console.log('✅ Voting results fetched:', data);
            return {
                success: true,
                data
            };

        } catch (error) {
            console.error('❌ Failed to fetch results:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Check if user/device has voted
     */
    async checkVoteStatus(fingerprint, userId = null, voteType = 'public') {
        try {
            // Use unified API service if available
            if (this.apiService) {
                const data = await this.apiService.checkVoteStatus(fingerprint, userId, voteType);
                return { success: true, data };
            }

            // Fallback to direct fetch
            const response = await fetch(`${this.baseUrl}/check-vote-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fingerprint,
                    userId,
                    voteType
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to check vote status');
            }

            console.log('✅ Vote status checked:', data);
            return {
                success: true,
                data
            };

        } catch (error) {
            console.error('❌ Failed to check vote status:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Generate browser fingerprint for public voting
     */
    generateBrowserFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('fingerprint', 2, 2);
        const canvasData = canvas.toDataURL();

        const fingerprint = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            screenResolution: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            canvasHash: this.hashCode(canvasData)
        };

        return 'fp_' + this.hashCode(JSON.stringify(fingerprint));
    }

    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }
}

// Export for use in other modules
window.NetlifyVotingService = NetlifyVotingService;

