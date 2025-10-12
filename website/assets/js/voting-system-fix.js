/**
 * DAMP Enhanced Voting System - Fixed Implementation
 * Fixes authentication, public voting, and Firebase integration issues
 */

class FixedVotingSystem {
    constructor() {
        this.firebaseInitialized = false;
        this.authInitialized = false;
        this.currentUser = null;
        this.currentMode = 'public'; // Start with public mode as default
        this.votingData = null;
        this.publicVotingData = null;
        this.browserFingerprint = null;
        this.userVote = null;
        this.publicVote = null;
        this.isVotingActive = true;
        this.isPublicVotingActive = true;
        this.isAdmin = false;
        this.retryCount = 0;
        this.maxRetries = 3;

        // Products configuration
        this.products = [
            {
                id: 'handle',
                name: 'DAMP Handle v1.0',
                image: '../assets/images/optimized/products/damp-handle/damp-handle-medium.png',
                description: 'Universal attachment for any drinkware',
                votes: 0,
                percentage: 0
            },
            {
                id: 'siliconeBottom',
                name: 'Silicone Bottom v1.0',
                image: '../assets/images/optimized/products/silicone-bottom/silicone-bottom-medium.png',
                description: 'Non-slip silicone base',
                votes: 0,
                percentage: 0
            },
            {
                id: 'cupSleeve',
                name: 'Cup Sleeve v1.0',
                image: '../assets/images/optimized/products/cup-sleeve/cup-sleeve-medium.png',
                description: 'Adjustable fit for most cups',
                votes: 0,
                percentage: 0
            },
            {
                id: 'babyBottle',
                name: 'Baby Bottle v1.0',
                image: '../assets/images/optimized/products/baby-bottle/baby-bottle-medium.png',
                description: 'BPA-free smart bottle',
                votes: 0,
                percentage: 0
            }
        ];

        this.init();
    }

    async init() {
        console.log('🚀 Initializing Fixed Voting System...');

        try {
            // Initialize browser fingerprint first
            this.browserFingerprint = this.generateBrowserFingerprint();
            console.log('🔐 Browser fingerprint generated:', this.browserFingerprint);

            // Try to initialize Firebase
            await this.initializeFirebase();

            // Set up fallback data if Firebase fails
            if (!this.firebaseInitialized) {
                this.setupFallbackData();
            }

            // Render the voting interface
            this.renderVotingInterface();

            // Set up event listeners
            this.setupEventListeners();

            console.log('✅ Fixed Voting System initialized successfully');
            this.showStatus('success', '✅ Voting system ready - Choose your preferred mode above');

        } catch (error) {
            console.error('❌ Voting system initialization error:', error);
            this.showStatus('error', '⚠️ Using offline mode - votes will be stored locally');
            this.setupFallbackData();
            this.renderVotingInterface();
        }
    }

    async initializeFirebase() {
        // First, try to get Firebase services from global scope
        if (window.firebaseServices) {
            console.log('🔥 Firebase services found in global scope');
            this.firebaseInitialized = true;

            // Initialize Firebase voting collections
            try {
                await window.firebaseServices.initializeFirebaseServices();

                // Set up authentication listener
                if (window.firebaseServices.authService?.onAuthStateChanged) {
                    window.firebaseServices.authService.onAuthStateChanged((user) => {
                        this.handleAuthStateChange(user);
                    });
                    this.authInitialized = true;
                }

                // Set up real-time listeners
                this.setupFirebaseListeners();

                console.log('✅ Firebase voting system connected');
                return true;

            } catch (error) {
                console.error('❌ Firebase initialization error:', error);
                throw error;
            }
        } else {
            // Try to load Firebase services dynamically
            console.log('🔄 Attempting to load Firebase services...');
            await this.loadFirebaseServices();
        }
    }

    async loadFirebaseServices() {
        // Wait for Firebase services to be available
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 30; // 3 seconds max wait

            const checkFirebase = () => {
                if (window.firebaseServices) {
                    console.log('✅ Firebase services loaded');
                    this.firebaseInitialized = true;
                    resolve();
                } else if (attempts >= maxAttempts) {
                    console.warn('⚠️ Firebase services not available, using fallback');
                    reject(new Error('Firebase services not available'));
                } else {
                    attempts++;
                    setTimeout(checkFirebase, 100);
                }
            };

            checkFirebase();
        });
    }

    setupFirebaseListeners() {
        if (!this.firebaseInitialized || !window.firebaseServices?.votingService) {
            return;
        }

        try {
            // Listen to authenticated voting changes
            window.firebaseServices.votingService.onVotingChange((data) => {
                console.log('📊 Customer voting data updated:', data);
                this.votingData = data;
                this.isVotingActive = data.isActive;

                if (this.currentMode === 'customer') {
                    this.updateProductsFromFirebase(data);
                    this.renderProducts();
                    this.updateStats();
                }
            });

            // Listen to public voting changes
            window.firebaseServices.votingService.onPublicVotingChange((data) => {
                console.log('🌍 Public voting data updated:', data);
                this.publicVotingData = data;
                this.isPublicVotingActive = data.isActive;

                if (this.currentMode === 'public') {
                    this.updateProductsFromFirebase(data);
                    this.renderProducts();
                    this.updateStats();
                }
            });

            console.log('✅ Firebase real-time listeners setup complete');

        } catch (error) {
            console.error('❌ Error setting up Firebase listeners:', error);
        }
    }

    async handleAuthStateChange(user) {
        this.currentUser = user;

        if (user) {
            console.log('👤 User authenticated:', user.email);

            try {
                // Check admin status
                if (window.firebaseServices?.authService?.isAdmin) {
                    this.isAdmin = await window.firebaseServices.authService.isAdmin(user);
                }

                // Get user's vote status
                if (window.firebaseServices?.votingService?.getUserVote) {
                    this.userVote = await window.firebaseServices.votingService.getUserVote(user);
                }

                console.log('👤 Admin status:', this.isAdmin, 'Vote status:', this.userVote);

            } catch (error) {
                console.error('❌ Error checking user status:', error);
            }
        } else {
            console.log('👤 User signed out');
            this.isAdmin = false;
            this.userVote = null;
        }

        // Update UI
        this.updateAuthUI();
        this.renderProducts();
    }

    setupFallbackData() {
        console.log('🔄 Setting up fallback voting data...');

        // Load from localStorage if available
        const storedData = localStorage.getItem('damp_voting_fallback');
        if (storedData) {
            try {
                const data = JSON.parse(storedData);
                this.products = data.products || this.products;
                console.log('📂 Loaded voting data from localStorage');
            } catch (error) {
                console.error('❌ Error loading fallback data:', error);
            }
        }

        // Keep all votes at zero for live data only
        this.products.forEach((product, index) => {
            if (!product.votes) {
                product.votes = 0;
            }
        });

        this.calculatePercentages();
        this.saveFallbackData();
    }

    calculatePercentages() {
        const totalVotes = this.products.reduce((sum, product) => sum + product.votes, 0);

        if (totalVotes > 0) {
            this.products.forEach(product => {
                product.percentage = (product.votes / totalVotes * 100).toFixed(1);
            });
        }
    }

    saveFallbackData() {
        try {
            const data = {
                products: this.products,
                timestamp: Date.now(),
                mode: this.currentMode
            };
            localStorage.setItem('damp_voting_fallback', JSON.stringify(data));
        } catch (error) {
            console.error('❌ Error saving fallback data:', error);
        }
    }

    generateBrowserFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('DAMP Voting System', 2, 2);

        const fingerprint = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            canvas.toDataURL()
        ].join('|');

        // Create hash
        let hash = 0;
        for (let i = 0; i < fingerprint.length; i++) {
            const char = fingerprint.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }

        return 'fix_' + Math.abs(hash).toString(36);
    }

    renderVotingInterface() {
        this.renderModeToggle();
        this.renderProducts();
        this.updateStats();
        this.updateAuthUI();
    }

    renderModeToggle() {
        const customerBtn = document.getElementById('customerModeBtn');
        const publicBtn = document.getElementById('publicModeBtn');

        if (customerBtn && publicBtn) {
            // Update active states
            if (this.currentMode === 'customer') {
                customerBtn.classList.add('active');
                publicBtn.classList.remove('active');
            } else {
                publicBtn.classList.add('active');
                customerBtn.classList.remove('active');
            }
        }
    }

    renderProducts() {
        const grid = document.getElementById('votingGrid');
        if (!grid) return;

        // Sort products by votes
        const sortedProducts = [...this.products].sort((a, b) => b.votes - a.votes);

        grid.innerHTML = sortedProducts.map((product, index) => {
            const percentage = this.getTotalVotes() > 0 ? (product.votes / this.getTotalVotes() * 100) : 0;
            const fillHeight = Math.min((product.votes / 1000) * 100, 95); // Assuming target of 1000
            const ballPosition = Math.max(fillHeight, 5);

            const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : '';

            // Determine button state
            const buttonState = this.getButtonState(product.id);

            return `
                <div class="product-vote-card" data-product="${product.id}">
                    ${rankClass ? `<div class="product-rank ${rankClass}">${index + 1}</div>` : ''}
                    ${buttonState.userVotedForThis ? '<div class="user-vote-indicator">🎯 Your Choice</div>' : ''}

                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}" loading="lazy"
                             onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2280%22 height=%2280%22><rect width=%2280%22 height=%2280%22 fill=%22%2300d4ff%22/><text x=%2240%22 y=%2240%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22white%22 font-size=%2212%22>DAMP</text></svg>'">
                    </div>

                    <h3 class="product-name">${product.name}</h3>
                    <p style="color: rgba(255, 255, 255, 0.7); font-size: 0.9rem; margin-bottom: 20px;">
                        ${product.description}
                    </p>

                    <div class="vote-glass-container">
                        <div class="vote-glass">
                            <div class="vote-liquid" style="height: ${Math.max(fillHeight, 0)}%"></div>
                            <div class="damp-ball" style="bottom: ${ballPosition}%"></div>
                        </div>
                    </div>

                    <div class="vote-count">${product.votes.toLocaleString()}</div>
                    <div class="vote-percentage">${percentage.toFixed(1)}% of votes</div>

                    <button class="vote-button ${buttonState.buttonClass}"
                            onclick="fixedVotingSystem.vote('${product.id}')"
                            ${buttonState.buttonDisabled ? 'disabled' : ''}>
                        ${buttonState.buttonText}
                    </button>
                </div>
            `;
        }).join('');

        // Update vote target display
        const voteTarget = document.getElementById('voteTarget');
        if (voteTarget) {
            voteTarget.textContent = this.getTotalVotes().toLocaleString();
        }
    }

    getButtonState(productId) {
        let buttonText, buttonClass, buttonDisabled = false, userVotedForThis = false;

        if (this.currentMode === 'customer') {
            // Customer voting logic
            const hasUserVoted = this.userVote && this.userVote.hasVoted;
            userVotedForThis = hasUserVoted && this.userVote.productId === productId;

            if (userVotedForThis) {
                buttonText = '✅ Your Vote';
                buttonClass = 'voted';
                buttonDisabled = true;
            } else if (hasUserVoted) {
                buttonText = '✓ Already Voted';
                buttonClass = 'voted disabled';
                buttonDisabled = true;
            } else if (!this.currentUser) {
                buttonText = '🔐 Sign In to Vote';
                buttonClass = 'auth-required';
                buttonDisabled = false;
            } else if (!this.isVotingActive) {
                buttonText = '🚫 Voting Disabled';
                buttonClass = 'disabled';
                buttonDisabled = true;
            } else {
                buttonText = '🗳️ Vote Now';
                buttonClass = '';
                buttonDisabled = false;
            }
        } else {
            // Public voting logic
            const localVote = localStorage.getItem('damp_public_vote');
            let hasPublicVoted = false;

            if (localVote) {
                try {
                    const voteData = JSON.parse(localVote);
                    hasPublicVoted = voteData.productId === productId;
                    userVotedForThis = hasPublicVoted;
                } catch (e) {
                    localStorage.removeItem('damp_public_vote');
                }
            }

            if (userVotedForThis) {
                buttonText = '✅ Your Vote';
                buttonClass = 'voted';
                buttonDisabled = true;
            } else if (hasPublicVoted) {
                buttonText = '✓ Device Voted';
                buttonClass = 'voted disabled';
                buttonDisabled = true;
            } else if (!this.isPublicVotingActive) {
                buttonText = '🚫 Voting Disabled';
                buttonClass = 'disabled';
                buttonDisabled = true;
            } else {
                buttonText = '🌍 Vote Now';
                buttonClass = '';
                buttonDisabled = false;
            }
        }

        return { buttonText, buttonClass, buttonDisabled, userVotedForThis };
    }

    async vote(productId) {
        console.log(`🗳️ Vote initiated for: ${productId} (${this.currentMode} mode)`);

        // Show loading state
        const button = document.querySelector(`[data-product="${productId}"] .vote-button`);
        if (button) {
            button.classList.add('loading');
            button.textContent = 'Recording Vote...';
            button.disabled = true;
        }

        try {
            if (this.currentMode === 'customer') {
                await this.submitCustomerVote(productId);
            } else {
                await this.submitPublicVote(productId);
            }
        } catch (error) {
            console.error('❌ Vote submission failed:', error);
            this.showMessage('error', 'Vote Failed', error.message);

            // Reset button state
            if (button) {
                button.classList.remove('loading');
                button.disabled = false;
                button.textContent = this.currentMode === 'customer' ? '🗳️ Vote Now' : '🌍 Vote Now';
            }
        }
    }

    async submitCustomerVote(productId) {
        // Check authentication
        if (!this.currentUser) {
            // Show sign-in modal or redirect
            this.showMessage('info', 'Sign In Required', 'Please sign in to participate in customer voting.');
            // In a real implementation, show sign-in modal here
            return;
        }

        // Check if already voted
        if (this.userVote && this.userVote.hasVoted) {
            throw new Error(`You already voted for ${this.userVote.productId}. Only one vote per user is allowed.`);
        }

        try {
            if (this.firebaseInitialized && window.firebaseServices?.votingService?.submitVote) {
                // Use Firebase
                await window.firebaseServices.votingService.submitVote(productId, this.currentUser);
                this.userVote = await window.firebaseServices.votingService.getUserVote(this.currentUser);
            } else {
                // Fallback to localStorage
                this.submitFallbackVote(productId, 'customer');
            }

            this.showMessage('success', 'Vote Recorded!',
                `Your customer vote for ${this.getProductName(productId)} has been recorded. Thank you!`);

        } catch (error) {
            console.error('❌ Customer vote error:', error);
            throw error;
        }
    }

    async submitPublicVote(productId) {
        // Check if device already voted
        const localVote = localStorage.getItem('damp_public_vote');
        if (localVote) {
            try {
                const voteData = JSON.parse(localVote);
                throw new Error(`This device already voted for ${voteData.productId}. Only one vote per device is allowed.`);
            } catch (parseError) {
                localStorage.removeItem('damp_public_vote');
            }
        }

        try {
            if (this.firebaseInitialized && window.firebaseServices?.votingService?.submitPublicVote) {
                // Use Firebase
                await window.firebaseServices.votingService.submitPublicVote(productId, this.browserFingerprint);
                this.publicVote = await window.firebaseServices.votingService.getPublicVote(this.browserFingerprint);
            } else {
                // Fallback to localStorage
                this.submitFallbackVote(productId, 'public');
            }

            this.showMessage('success', 'Vote Recorded!',
                `Your public vote for ${this.getProductName(productId)} has been recorded. Thank you!`);

        } catch (error) {
            console.error('❌ Public vote error:', error);
            throw error;
        }
    }

    submitFallbackVote(productId, voteType) {
        // Update product votes
        const product = this.products.find(p => p.id === productId);
        if (product) {
            product.votes += 1;
            this.calculatePercentages();
            this.saveFallbackData();
        }

        // Store vote record
        if (voteType === 'public') {
            localStorage.setItem('damp_public_vote', JSON.stringify({
                productId,
                votedAt: Date.now(),
                sessionId: this.browserFingerprint,
                mode: 'fallback'
            }));
        } else {
            localStorage.setItem('damp_customer_vote', JSON.stringify({
                productId,
                votedAt: Date.now(),
                userId: this.currentUser?.uid || 'fallback_user',
                mode: 'fallback'
            }));

            this.userVote = {
                productId,
                hasVoted: true,
                votedAt: Date.now(),
                voteType: 'authenticated'
            };
        }

        // Re-render UI
        this.renderProducts();
        this.updateStats();

        console.log(`✅ Fallback vote recorded: ${productId} (${voteType})`);
    }

    switchMode(mode) {
        if (this.currentMode === mode) return;

        console.log(`🔄 Switching to ${mode} voting mode`);
        this.currentMode = mode;

        // Update UI
        this.renderModeToggle();
        this.renderProducts();
        this.updateStats();
        this.updateStatus();

        // Track mode switch
        this.trackEvent('voting_mode_switch', { new_mode: mode });
    }

    updateProductsFromFirebase(data) {
        if (data.products) {
            this.products.forEach(product => {
                const firebaseProduct = data.products[product.id];
                if (firebaseProduct) {
                    product.votes = firebaseProduct.votes || 0;
                    product.percentage = firebaseProduct.percentage || 0;
                }
            });
            console.log(`✅ Products updated from Firebase - Total votes: ${data.totalVotes}`);
        }
    }

    getTotalVotes() {
        return this.products.reduce((total, product) => total + product.votes, 0);
    }

    getProductName(productId) {
        const product = this.products.find(p => p.id === productId);
        return product ? product.name : productId;
    }

    updateStats() {
        const totalVotes = this.getTotalVotes();
        const leadingProduct = [...this.products].sort((a, b) => b.votes - a.votes)[0];

        const elements = {
            totalVotes: document.getElementById('totalVotes'),
            leadingProduct: document.getElementById('leadingProduct'),
            completionRate: document.getElementById('completionRate'),
            participantCount: document.getElementById('participantCount')
        };

        if (elements.totalVotes) elements.totalVotes.textContent = totalVotes.toLocaleString();
        if (elements.leadingProduct) {
            elements.leadingProduct.textContent =
                leadingProduct.votes > 0 ? leadingProduct.name.split(' ')[0] : '—';
        }
        if (elements.completionRate) {
            const rate = totalVotes > 0 ? ((totalVotes / 1000) * 100) : 0;
            elements.completionRate.textContent = rate.toFixed(1) + '%';
        }
        if (elements.participantCount) elements.participantCount.textContent = totalVotes.toLocaleString();
    }

    updateAuthUI() {
        // Update any authentication-related UI elements
        const authElements = document.querySelectorAll('[data-auth-required]');
        authElements.forEach(element => {
            if (this.currentUser) {
                element.style.display = 'block';
            } else {
                element.style.display = 'none';
            }
        });
    }

    updateStatus() {
        const statusIndicator = document.getElementById('votingStatus');
        if (!statusIndicator) return;

        let status, className;

        if (this.currentMode === 'customer') {
            if (!this.currentUser) {
                status = '🔐 Sign in to participate in verified customer voting';
                className = 'voting-status auth-required';
            } else if (this.userVote && this.userVote.hasVoted) {
                status = `✅ You voted for ${this.userVote.productId}`;
                className = 'voting-status voted';
            } else if (!this.isVotingActive) {
                status = '🚫 Customer voting is currently disabled';
                className = 'voting-status disabled';
            } else {
                status = '🗳️ Customer voting active - Your vote counts more!';
                className = 'voting-status active';
            }
        } else {
            const localVote = localStorage.getItem('damp_public_vote');
            if (localVote) {
                try {
                    const voteData = JSON.parse(localVote);
                    status = `✅ This device voted for ${voteData.productId}`;
                    className = 'voting-status voted';
                } catch (e) {
                    status = '🌍 Public voting active - Vote as a community member';
                    className = 'voting-status active';
                }
            } else if (!this.isPublicVotingActive) {
                status = '🚫 Public voting is currently disabled';
                className = 'voting-status disabled';
            } else {
                status = '🌍 Public voting active - Vote as a community member';
                className = 'voting-status active';
            }
        }

        statusIndicator.innerHTML = status;
        statusIndicator.className = className;
    }

    showStatus(type, message) {
        const statusIndicator = document.getElementById('votingStatus');
        if (!statusIndicator) return;

        statusIndicator.innerHTML = message;
        statusIndicator.className = `voting-status ${type}`;
    }

    showMessage(type, title, text) {
        const overlay = document.getElementById('messageOverlay');
        const icon = document.getElementById('messageIcon');
        const titleEl = document.getElementById('messageTitle');
        const textEl = document.getElementById('messageText');

        if (overlay && icon && titleEl && textEl) {
            icon.textContent = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
            titleEl.textContent = title;
            textEl.textContent = text;
            overlay.classList.add('show');
        } else {
            // Fallback alert
            alert(`${title}: ${text}`);
        }
    }

    setupEventListeners() {
        // Mode toggle listeners
        const customerBtn = document.getElementById('customerModeBtn');
        const publicBtn = document.getElementById('publicModeBtn');

        if (customerBtn) {
            customerBtn.addEventListener('click', () => this.switchMode('customer'));
        }

        if (publicBtn) {
            publicBtn.addEventListener('click', () => this.switchMode('public'));
        }

        // Refresh data button
        const refreshBtn = document.querySelector('[onclick="refreshData()"]');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }
    }

    async refreshData() {
        console.log('🔄 Refreshing voting data...');

        try {
            if (this.firebaseInitialized) {
                // Refresh Firebase data
                if (this.currentUser && window.firebaseServices?.votingService?.getUserVote) {
                    this.userVote = await window.firebaseServices.votingService.getUserVote(this.currentUser);
                }

                if (window.firebaseServices?.votingService?.getPublicVote) {
                    this.publicVote = await window.firebaseServices.votingService.getPublicVote(this.browserFingerprint);
                }
            }

            // Re-render everything
            this.renderProducts();
            this.updateStats();
            this.updateStatus();

            this.showStatus('success', '🔄 Data refreshed successfully');

        } catch (error) {
            console.error('❌ Refresh error:', error);
            this.showStatus('error', '⚠️ Refresh failed - using cached data');
        }
    }

    trackEvent(eventName, properties = {}) {
        try {
            if (window.gtag) {
                gtag('event', eventName, {
                    event_category: 'voting',
                    ...properties
                });
            }

            if (window.firebaseServices?.analyticsService) {
                window.firebaseServices.analyticsService.trackEvent(eventName, properties);
            }

            console.log('📊 Event tracked:', eventName, properties);
        } catch (error) {
            console.warn('⚠️ Analytics tracking failed:', error);
        }
    }
}

// Initialize the fixed voting system
let fixedVotingSystem;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starting Fixed Voting System...');
    fixedVotingSystem = new FixedVotingSystem();
});

// Global functions for UI compatibility
window.switchVotingMode = (mode) => {
    if (fixedVotingSystem) {
        fixedVotingSystem.switchMode(mode);
    }
};

window.hideMessage = () => {
    const overlay = document.getElementById('messageOverlay');
    if (overlay) {
        overlay.classList.remove('show');
    }
};

window.refreshData = () => {
    if (fixedVotingSystem) {
        fixedVotingSystem.refreshData();
    }
};

// Export for debugging
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FixedVotingSystem;
}