/**
 * DAMP Navigation - Enhanced Universal Navigation System
 * Copyright 2025 WeCr8 Solutions LLC
 */

class DAMPNavigation {
    constructor(options = {}) {
        // Configuration
        this.config = {
            debug: options.debug || false,
            scrollThreshold: options.scrollThreshold || 50,
            mobileBreakpoint: options.mobileBreakpoint || 767,
            animationDuration: options.animationDuration || 300,
            ...options
        };

        // Core elements
        this.elements = {
            nav: null,
            mobileMenu: null,
            hamburger: null,
            backdrop: null,
            navLinks: null,
            menuItems: []
        };

        // State
        this.state = {
            isMenuOpen: false,
            isScrolled: false,
            lastScrollY: 0,
            isTransitioning: false,
            activeLink: null,
            isMobile: false
        };

        // Initialize
        this.init();
    }

    /**
     * Initialize the navigation system
     */
    init() {
        this.findElements();
        this.setupEventListeners();
        this.checkMobileState();
        this.setupAccessibility();
        this.setupAnimations();
        
        if (this.config.debug) {
            console.log('🧭 DAMP Navigation initialized:', { config: this.config, elements: this.elements });
        }
    }

    /**
     * Find all required DOM elements
     */
    findElements() {
        // Main navigation elements
        this.elements.nav = document.querySelector('.damp-nav');
        this.elements.mobileMenu = document.querySelector('.mobile-menu');
        this.elements.hamburger = document.querySelector('.hamburger');
        this.elements.backdrop = document.querySelector('.menu-backdrop');
        this.elements.navLinks = document.querySelector('.nav-links');

        // Create backdrop if it doesn't exist
        if (!this.elements.backdrop) {
            this.elements.backdrop = document.createElement('div');
            this.elements.backdrop.className = 'menu-backdrop';
            document.body.appendChild(this.elements.backdrop);
        }

        // Cache menu items for animations
        if (this.elements.navLinks) {
            this.elements.menuItems = Array.from(this.elements.navLinks.children);
        }

        this.validateElements();
    }

    /**
     * Validate required elements exist
     */
    validateElements() {
        const requiredElements = ['nav', 'mobileMenu', 'hamburger', 'backdrop', 'navLinks'];
        const missingElements = requiredElements.filter(el => !this.elements[el]);

        if (missingElements.length && this.config.debug) {
            console.warn('🧭 Missing required elements:', missingElements);
        }
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Throttled scroll handler
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        // Resize handler with debounce
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this.handleResize(), 100);
        });

        // Menu toggle
        if (this.elements.hamburger) {
            this.elements.hamburger.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMenu();
            });
        }

        // Backdrop click
        if (this.elements.backdrop) {
            this.elements.backdrop.addEventListener('click', () => this.closeMenu());
        }

        // Escape key handler
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.state.isMenuOpen) {
                this.closeMenu();
            }
        });

        // Handle clicks outside menu
        document.addEventListener('click', (e) => {
            if (this.state.isMenuOpen && 
                !e.target.closest('.mobile-menu') && 
                !e.target.closest('.hamburger')) {
                this.closeMenu();
            }
        });
    }

    /**
     * Handle scroll events
     */
    handleScroll() {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        const scrollDelta = scrollY - this.state.lastScrollY;

        // Update nav classes based on scroll
        if (scrollY > this.config.scrollThreshold) {
            this.elements.nav.classList.add('nav-scrolled');
            this.state.isScrolled = true;
            
            // Hide nav on scroll down, show on scroll up
            if (scrollDelta > 0 && scrollY > this.config.scrollThreshold * 2) {
                this.elements.nav.classList.add('nav-hidden');
            } else {
                this.elements.nav.classList.remove('nav-hidden');
            }
        } else {
            this.elements.nav.classList.remove('nav-scrolled', 'nav-hidden');
            this.state.isScrolled = false;
        }

        this.state.lastScrollY = scrollY;
    }

    /**
     * Handle resize events
     */
    handleResize() {
        this.checkMobileState();
        
        // Close menu if switching to desktop
        if (!this.state.isMobile && this.state.isMenuOpen) {
            this.closeMenu();
        }
    }

    /**
     * Check and update mobile state
     */
    checkMobileState() {
        const wasMobile = this.state.isMobile;
        this.state.isMobile = window.innerWidth <= this.config.mobileBreakpoint;

        // Handle transition between mobile and desktop
        if (wasMobile !== this.state.isMobile) {
            this.handleBreakpointChange();
            if (!this.state.isMobile) {
                // Close menu when transitioning to desktop
                this.closeMenu();
            }
        }
    }

    /**
     * Handle mobile/desktop transition
     */
    handleBreakpointChange() {
        if (!this.state.isMobile) {
            // Reset mobile menu state when switching to desktop
            this.elements.mobileMenu?.classList.remove('is-active');
            this.elements.backdrop?.classList.remove('is-active');
            this.elements.hamburger?.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    }

    /**
     * Toggle mobile menu
     */
    toggleMenu() {
        if (this.state.isTransitioning) return;
        if (this.state.isMenuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    /**
     * Open mobile menu
     */
    openMenu() {
        if (!this.state.isMobile) return;
        
        this.state.isTransitioning = true;
        this.state.isMenuOpen = true;

        // Update UI
        this.elements.mobileMenu.classList.add('is-active');
        this.elements.backdrop.classList.add('is-active');
        this.elements.hamburger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';

        // Animate menu items
        this.elements.menuItems.forEach((item, i) => {
            setTimeout(() => {
                item.style.transform = 'translateY(0)';
                item.style.opacity = '1';
            }, 50 * i);
        });

        // Reset transition state
        setTimeout(() => {
            this.state.isTransitioning = false;
        }, this.config.animationDuration);
    }

    /**
     * Close mobile menu
     */
    closeMenu() {
        if (!this.state.isMenuOpen || this.state.isTransitioning) return;
        
        this.state.isTransitioning = true;
        this.state.isMenuOpen = false;

        // Update UI
        this.elements.mobileMenu.classList.remove('is-active');
        this.elements.backdrop.classList.remove('is-active');
        this.elements.hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';

        // Animate menu items
        this.elements.menuItems.forEach((item, i) => {
            item.style.transform = 'translateY(10px)';
            item.style.opacity = '0';
        });

        // Reset transition state
        setTimeout(() => {
            this.state.isTransitioning = false;
        }, this.config.animationDuration);
    }

    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        // Ensure proper ARIA attributes
        this.elements.hamburger?.setAttribute('aria-label', 'Toggle navigation menu');
        this.elements.hamburger?.setAttribute('aria-expanded', 'false');
        this.elements.hamburger?.setAttribute('aria-controls', 'mobile-menu');
        
        this.elements.mobileMenu?.setAttribute('role', 'navigation');
        this.elements.mobileMenu?.setAttribute('aria-label', 'Mobile navigation menu');

        // Add keyboard navigation for menu items
        this.elements.menuItems.forEach(item => {
            if (item.tagName === 'A') {
                item.setAttribute('role', 'menuitem');
                item.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        item.click();
                    }
                });
            }
        });
    }

    /**
     * Setup animation system
     */
    setupAnimations() {
        // Add animation classes to menu items
        this.elements.menuItems.forEach((item, index) => {
            item.style.transitionDelay = `${index * 50}ms`;
        });
    }

    /**
     * Public method to programmatically close menu
     */
    close() {
        this.closeMenu();
    }

    /**
     * Public method to update active link
     */
    setActiveLink(href) {
        this.elements.menuItems.forEach(item => {
            if (item.tagName === 'A') {
                if (item.getAttribute('href') === href) {
                    item.classList.add('active');
                    this.state.activeLink = item;
                } else {
                    item.classList.remove('active');
                }
            }
        });
    }

    /**
     * Get current state
     */
    getState() {
        return { ...this.state };
    }
}

// Export for modern JS environments
export default DAMPNavigation;