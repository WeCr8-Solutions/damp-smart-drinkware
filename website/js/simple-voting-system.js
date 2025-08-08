// Simple Voting System - Immediate fallback without Firebase dependencies
// This ensures votes are recorded even if Firebase fails to load

class SimpleVotingSystem {
    constructor() {
        this.votes = this.loadVotes();
        this.hasVoted = this.loadUserVote();
        this.initialized = false;
    }

    init() {
        console.log('🗳️ Simple Voting System initialized');
        this.initialized = true;
        this.updateDisplay();
        return Promise.resolve();
    }

    // Load votes from localStorage
    loadVotes() {
        try {
            const saved = localStorage.getItem('damp_votes');
            return saved ? JSON.parse(saved) : {
                'handle': 0,
                'siliconeBottom': 0,
                'cupSleeve': 0,
                'babyBottle': 0
            };
        } catch (error) {
            console.error('Failed to load votes:', error);
            return {
                'handle': 0,
                'siliconeBottom': 0,
                'cupSleeve': 0,
                'babyBottle': 0
            };
        }
    }

    // Load user's vote from localStorage
    loadUserVote() {
        try {
            return localStorage.getItem('damp_user_vote');
        } catch (error) {
            return null;
        }
    }

    // Save votes to localStorage
    saveVotes() {
        try {
            localStorage.setItem('damp_votes', JSON.stringify(this.votes));
        } catch (error) {
            console.error('Failed to save votes:', error);
        }
    }

    // Save user's vote
    saveUserVote(productId) {
        try {
            localStorage.setItem('damp_user_vote', productId);
            this.hasVoted = productId;
        } catch (error) {
            console.error('Failed to save user vote:', error);
        }
    }

    // Submit a vote
    async submitVote(productId) {
        if (this.hasVoted) {
            console.log('⚠️ User has already voted for:', this.hasVoted);
            return false;
        }

        // Add vote
        this.votes[productId] = (this.votes[productId] || 0) + 1;
        this.saveVotes();
        this.saveUserVote(productId);

        console.log(`✅ Vote recorded for ${productId}! Total votes:`, this.votes);
        
        // Update display
        this.updateDisplay();
        
        // Show success message
        this.showSuccessMessage(productId);
        
        return true;
    }

    // Update vote display on page
    updateDisplay() {
        const total = Object.values(this.votes).reduce((sum, count) => sum + count, 0);
        
        Object.keys(this.votes).forEach(productId => {
            const count = this.votes[productId];
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
            
            // Update vote count displays
            const voteElement = document.querySelector(`[data-product="${productId}"] .vote-count`);
            if (voteElement) {
                voteElement.textContent = count;
            }
            
            // Update percentage displays
            const percentageElement = document.querySelector(`[data-product="${productId}"] .vote-percentage`);
            if (percentageElement) {
                percentageElement.textContent = `${percentage}%`;
            }
            
            // Update progress bars
            const progressBar = document.querySelector(`[data-product="${productId}"] .progress-fill`);
            if (progressBar) {
                progressBar.style.width = `${percentage}%`;
            }
        });
        
        // Update total votes display
        const totalElement = document.querySelector('.total-votes');
        if (totalElement) {
            totalElement.textContent = total;
        }
    }

    // Show success message
    showSuccessMessage(productId) {
        const productNames = {
            'handle': 'DAMP Handle',
            'siliconeBottom': 'Silicone Bottom',
            'cupSleeve': 'Cup Sleeve',
            'babyBottle': 'Baby Bottle'
        };
        
        const productName = productNames[productId] || productId;
        
        // Create success notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #00d4ff, #00ff88);
            color: #1a1a2e;
            padding: 15px 25px;
            border-radius: 30px;
            font-weight: 600;
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 15px;
            animation: slideDown 0.3s ease-out;
        `;
        
        notification.innerHTML = `
            <span>🗳️</span>
            <span>Vote recorded for ${productName}!</span>
            <button onclick="this.parentElement.remove()" style="background:rgba(26,26,46,0.2);color:#1a1a2e;border:none;padding:8px 16px;border-radius:20px;font-weight:600;cursor:pointer;">×</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Get current vote counts
    getVotes() {
        return { ...this.votes };
    }

    // Check if user has voted
    hasUserVoted() {
        return !!this.hasVoted;
    }

    // Get user's vote
    getUserVote() {
        return this.hasVoted;
    }
}

// Initialize simple voting system globally
window.simpleVotingSystem = new SimpleVotingSystem();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.simpleVotingSystem.init();
    });
} else {
    window.simpleVotingSystem.init();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimpleVotingSystem;
}