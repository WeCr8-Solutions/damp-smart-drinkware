/**
 * DAMP Smart Drinkware - Founder's Note Component
 * 
 * Handles both popup modal and dedicated page functionality
 */

class DAMPFoundersNote {
    constructor() {
        this.modal = null;
        this.storageKey = 'damp_founders_note_seen';
        this.timer = null;
        this.isOpen = false;
        
        // Check if we're on the dedicated page
        this.isDedicatedPage = window.location.pathname.includes('founders-note.html');
        
        if (!this.isDedicatedPage) {
            this.init();
        }
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // Create modal HTML
        this.createModal();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Check if we should show the popup
        this.checkAndSchedulePopup();
    }

    createModal() {
        // Check if modal already exists
        if (document.getElementById('foundersNoteModal')) {
            return;
        }

        const modalHTML = `
            <div id="foundersNoteModal" class="founders-note-modal">
                <div class="founders-note-modal-overlay"></div>
                <div class="founders-note-modal-content">
                    <div class="founders-note-modal-header">
                        <button class="founders-note-modal-close" aria-label="Close founder's note">&times;</button>
                    </div>
                    <div class="founders-note-modal-body">
                        <h1 class="founders-note-modal-title">DAMP Founder's Note</h1>
                        <div class="founders-note-modal-text">
                            <p>
                                DAMP started as a solo-built project, created in the small gaps of time between family, work, and building WeCr8 Solutions. It represents the same spirit that carried me through every major challenge in my life — do the hard things, start with what you have, and build forward even when the path isn't clear.
                            </p>
                            <p>
                                I'm launching DAMP with a presale first, because I want this to be a community-supported product from day one. Your early support directly fuels the molds, electronics, testing, and the first production run. This isn't a mega-corporation with endless resources — this is me, building something meaningful piece by piece, determined to bring a smart, durable, American-built drinkware system into the world.
                            </p>
                            <p>
                                Every order, every share, every message pushes DAMP one step closer to becoming real hardware in your hands.
                            </p>
                            <p class="founders-note-modal-signature">
                                Thank you for believing in what one person can build,
                            </p>
                            <p class="founders-note-modal-signature-name">
                                — Zach Goodbody
                            </p>
                        </div>
                        <div class="founders-note-modal-cta" style="margin-top: 30px; text-align: center;">
                            <a href="/pages/pre-sale-funnel.html" class="btn btn-primary" style="font-size: 1.1rem; padding: 18px 45px; display: inline-block; text-decoration: none;">
                                🚀 Make Your Cup Smart - Starting $29.99
                            </a>
                        </div>
                    </div>
                    <div class="founders-note-modal-footer">
                        <a href="/pages/founders-note.html" class="founders-note-view-full-page">
                            📄 View Full Page
                        </a>
                        <button class="founders-note-modal-close-btn" type="button" aria-label="Close founder's note">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('foundersNoteModal');
    }

    setupEventListeners() {
        if (!this.modal) return;

        // Close button
        const closeBtn = this.modal.querySelector('.founders-note-modal-close');
        const closeBtnFooter = this.modal.querySelector('.founders-note-modal-close-btn');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
        
        if (closeBtnFooter) {
            closeBtnFooter.addEventListener('click', () => this.close());
        }

        // Overlay click to close
        const overlay = this.modal.querySelector('.founders-note-modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => this.close());
        }

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    checkAndSchedulePopup() {
        // Check if user has already seen it
        if (this.hasSeenNote()) {
            console.log('DAMP: Founder\'s note already seen, skipping popup');
            return;
        }

        // Wait for animation to complete, then set 30-second timer
        this.waitForAnimationComplete();
    }

    waitForAnimationComplete() {
        // Check if animation is already complete
        if (document.body.classList.contains('animation-complete')) {
            this.schedulePopup();
            return;
        }

        // Listen for animation completion
        const checkInterval = setInterval(() => {
            if (document.body.classList.contains('animation-complete')) {
                clearInterval(checkInterval);
                this.schedulePopup();
            }
        }, 100);

        // Fallback: if animation doesn't complete within 15 seconds, schedule anyway
        setTimeout(() => {
            clearInterval(checkInterval);
            if (!this.timer) {
                this.schedulePopup();
            }
        }, 15000);
    }

    schedulePopup() {
        // Clear any existing timer
        if (this.timer) {
            clearTimeout(this.timer);
        }

        // Set 30-second timer
        console.log('DAMP: Scheduling founder\'s note popup in 30 seconds');
        this.timer = setTimeout(() => {
            this.show();
        }, 30000);
    }

    show() {
        // Double-check if user has seen it (in case they navigated away and came back)
        if (this.hasSeenNote()) {
            return;
        }

        if (!this.modal) {
            this.createModal();
            this.setupEventListeners();
        }

        if (this.modal) {
            this.modal.classList.add('active');
            this.isOpen = true;
            document.body.classList.add('founders-note-modal-open');
            // Prevent body scroll
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            console.log('DAMP: Founder\'s note popup shown');
        }
    }

    close() {
        if (this.modal) {
            this.modal.classList.remove('active');
            this.isOpen = false;
            document.body.classList.remove('founders-note-modal-open');
            
            // Restore body scroll
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
            
            // Mark as seen in localStorage
            this.markAsSeen();
            
            console.log('DAMP: Founder\'s note popup closed');
        }
    }

    hasSeenNote() {
        try {
            const seen = localStorage.getItem(this.storageKey);
            return seen === 'true';
        } catch (e) {
            console.warn('DAMP: Could not check localStorage:', e);
            return false;
        }
    }

    markAsSeen() {
        try {
            localStorage.setItem(this.storageKey, 'true');
            console.log('DAMP: Founder\'s note marked as seen');
        } catch (e) {
            console.warn('DAMP: Could not save to localStorage:', e);
        }
    }

    // Public method to manually show the popup (for testing or direct links)
    showManually() {
        if (!this.modal) {
            this.createModal();
            this.setupEventListeners();
        }
        this.show();
    }

    // Public method to reset (for testing)
    reset() {
        try {
            localStorage.removeItem(this.storageKey);
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
            }
            console.log('DAMP: Founder\'s note reset');
        } catch (e) {
            console.warn('DAMP: Could not reset:', e);
        }
    }
}

// Initialize globally
let dampFoundersNote = null;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        dampFoundersNote = new DAMPFoundersNote();
        window.dampFoundersNote = dampFoundersNote;
    });
} else {
    dampFoundersNote = new DAMPFoundersNote();
    window.dampFoundersNote = dampFoundersNote;
}

