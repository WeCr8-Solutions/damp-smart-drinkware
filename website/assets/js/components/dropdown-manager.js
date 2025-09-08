/**
 * DAMP Dropdown Manager - Enhanced Dropdown Functionality
 * Fixes common dropdown issues and provides robust functionality
 */

class DAMPDropdownManager {
    constructor() {
        this.activeDropdowns = new Set();
        this.dropdowns = new Map();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeDropdowns();
        this.setupClickOutsideHandling();
        this.setupKeyboardNavigation();
    }

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Handle clicks on dropdown toggles
        document.addEventListener('click', (e) => {
            const toggle = e.target.closest('[data-dropdown-toggle]');
            if (toggle) {
                e.preventDefault();
                e.stopPropagation();
                this.toggleDropdown(toggle);
            }
        });

        // Handle clicks on dropdown items
        document.addEventListener('click', (e) => {
            const item = e.target.closest('[data-dropdown-item]');
            if (item) {
                this.handleDropdownItemClick(item);
            }
        });

        // Handle escape key to close dropdowns
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllDropdowns();
            }
        });
    }

    /**
     * Initialize existing dropdowns
     */
    initializeDropdowns() {
        // Find all dropdown toggles
        const toggles = document.querySelectorAll('[data-dropdown-toggle]');
        toggles.forEach(toggle => {
            this.registerDropdown(toggle);
        });

        // Also handle legacy dropdowns
        const legacyToggles = document.querySelectorAll('.dropdown-toggle');
        legacyToggles.forEach(toggle => {
            this.registerLegacyDropdown(toggle);
        });
    }

    /**
     * Register a new dropdown
     */
    registerDropdown(toggle) {
        const dropdownId = toggle.getAttribute('data-dropdown-toggle');
        const dropdown = document.querySelector(`[data-dropdown="${dropdownId}"]`);
        
        if (!dropdown) {
            console.warn(`Dropdown with ID "${dropdownId}" not found`);
            return;
        }

        this.dropdowns.set(toggle, {
            id: dropdownId,
            toggle,
            dropdown,
            isOpen: false
        });

        // Add ARIA attributes for accessibility
        toggle.setAttribute('aria-haspopup', 'true');
        toggle.setAttribute('aria-expanded', 'false');
        dropdown.setAttribute('role', 'menu');
        dropdown.setAttribute('aria-hidden', 'true');
    }

    /**
     * Register legacy dropdown (for backward compatibility)
     */
    registerLegacyDropdown(toggle) {
        const dropdown = toggle.nextElementSibling;
        if (!dropdown || !dropdown.classList.contains('dropdown-menu')) {
            return;
        }

        this.dropdowns.set(toggle, {
            id: `legacy-${Date.now()}`,
            toggle,
            dropdown,
            isOpen: false
        });

        // Add ARIA attributes
        toggle.setAttribute('aria-haspopup', 'true');
        toggle.setAttribute('aria-expanded', 'false');
        dropdown.setAttribute('role', 'menu');
        dropdown.setAttribute('aria-hidden', 'true');
    }

    /**
     * Toggle dropdown state
     */
    toggleDropdown(toggle) {
        const dropdownData = this.dropdowns.get(toggle);
        if (!dropdownData) return;

        if (dropdownData.isOpen) {
            this.closeDropdown(toggle);
        } else {
            this.openDropdown(toggle);
        }
    }

    /**
     * Open a specific dropdown
     */
    openDropdown(toggle) {
        const dropdownData = this.dropdowns.get(toggle);
        if (!dropdownData) return;

        // Close other dropdowns first
        this.closeAllDropdowns();

        // Open this dropdown
        dropdownData.isOpen = true;
        dropdownData.dropdown.classList.add('show');
        this.activeDropdowns.add(toggle);

        // Update ARIA attributes
        toggle.setAttribute('aria-expanded', 'true');
        dropdownData.dropdown.setAttribute('aria-hidden', 'false');

        // Add animation classes
        dropdownData.dropdown.style.opacity = '0';
        dropdownData.dropdown.style.transform = 'translateY(-10px)';
        
        requestAnimationFrame(() => {
            dropdownData.dropdown.style.transition = 'all 0.2s ease';
            dropdownData.dropdown.style.opacity = '1';
            dropdownData.dropdown.style.transform = 'translateY(0)';
        });

        // Focus first focusable item
        this.focusFirstItem(dropdownData.dropdown);

        // Emit custom event
        this.emitEvent('dropdown:opened', {
            toggle,
            dropdown: dropdownData.dropdown,
            id: dropdownData.id
        });
    }

    /**
     * Close a specific dropdown
     */
    closeDropdown(toggle) {
        const dropdownData = this.dropdowns.get(toggle);
        if (!dropdownData || !dropdownData.isOpen) return;

        dropdownData.isOpen = false;
        dropdownData.dropdown.classList.remove('show');
        this.activeDropdowns.delete(toggle);

        // Update ARIA attributes
        toggle.setAttribute('aria-expanded', 'false');
        dropdownData.dropdown.setAttribute('aria-hidden', 'true');

        // Add closing animation
        dropdownData.dropdown.style.transition = 'all 0.2s ease';
        dropdownData.dropdown.style.opacity = '0';
        dropdownData.dropdown.style.transform = 'translateY(-10px)';

        // Emit custom event
        this.emitEvent('dropdown:closed', {
            toggle,
            dropdown: dropdownData.dropdown,
            id: dropdownData.id
        });
    }

    /**
     * Close all open dropdowns
     */
    closeAllDropdowns() {
        this.activeDropdowns.forEach(toggle => {
            this.closeDropdown(toggle);
        });
    }

    /**
     * Handle clicks outside dropdowns
     */
    setupClickOutsideHandling() {
        document.addEventListener('click', (e) => {
            // Check if click is outside any dropdown
            const isInsideDropdown = e.target.closest('[data-dropdown]') || 
                                   e.target.closest('.dropdown-menu') ||
                                   e.target.closest('[data-dropdown-toggle]') ||
                                   e.target.closest('.dropdown-toggle');

            if (!isInsideDropdown && this.activeDropdowns.size > 0) {
                this.closeAllDropdowns();
            }
        });
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (this.activeDropdowns.size === 0) return;

            const activeToggle = Array.from(this.activeDropdowns)[0];
            const dropdownData = this.dropdowns.get(activeToggle);
            if (!dropdownData) return;

            const focusableItems = this.getFocusableItems(dropdownData.dropdown);
            const currentIndex = focusableItems.indexOf(document.activeElement);

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    this.focusNextItem(focusableItems, currentIndex);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.focusPreviousItem(focusableItems, currentIndex);
                    break;
                case 'Home':
                    e.preventDefault();
                    this.focusFirstItem(dropdownData.dropdown);
                    break;
                case 'End':
                    e.preventDefault();
                    this.focusLastItem(dropdownData.dropdown);
                    break;
                case 'Tab':
                    // Allow normal tab behavior but close on shift+tab from first item
                    if (e.shiftKey && currentIndex === 0) {
                        this.closeDropdown(activeToggle);
                    }
                    break;
            }
        });
    }

    /**
     * Get focusable items in dropdown
     */
    getFocusableItems(dropdown) {
        const focusableSelectors = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ];
        
        return Array.from(dropdown.querySelectorAll(focusableSelectors.join(', ')));
    }

    /**
     * Focus first item in dropdown
     */
    focusFirstItem(dropdown) {
        const focusableItems = this.getFocusableItems(dropdown);
        if (focusableItems.length > 0) {
            focusableItems[0].focus();
        }
    }

    /**
     * Focus last item in dropdown
     */
    focusLastItem(dropdown) {
        const focusableItems = this.getFocusableItems(dropdown);
        if (focusableItems.length > 0) {
            focusableItems[focusableItems.length - 1].focus();
        }
    }

    /**
     * Focus next item
     */
    focusNextItem(focusableItems, currentIndex) {
        const nextIndex = currentIndex < focusableItems.length - 1 ? currentIndex + 1 : 0;
        focusableItems[nextIndex]?.focus();
    }

    /**
     * Focus previous item
     */
    focusPreviousItem(focusableItems, currentIndex) {
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : focusableItems.length - 1;
        focusableItems[prevIndex]?.focus();
    }

    /**
     * Handle dropdown item clicks
     */
    handleDropdownItemClick(item) {
        const action = item.getAttribute('data-dropdown-action');
        
        if (action) {
            this.emitEvent('dropdown:action', {
                action,
                item,
                data: item.dataset
            });
        }

        // Close dropdown after action (unless it's a form element)
        if (!item.matches('input, select, textarea')) {
            const dropdown = item.closest('[data-dropdown], .dropdown-menu');
            const toggle = dropdown?.previousElementSibling;
            if (toggle) {
                this.closeDropdown(toggle);
            }
        }
    }

    /**
     * Emit custom events
     */
    emitEvent(eventName, detail) {
        const event = new CustomEvent(eventName, {
            detail,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(event);
    }

    /**
     * Public API methods
     */
    
    /**
     * Create a new dropdown programmatically
     */
    createDropdown(toggleId, dropdownId, options = {}) {
        const toggle = document.getElementById(toggleId);
        const dropdown = document.getElementById(dropdownId);
        
        if (!toggle || !dropdown) {
            console.error('Toggle or dropdown element not found');
            return false;
        }

        toggle.setAttribute('data-dropdown-toggle', dropdownId);
        dropdown.setAttribute('data-dropdown', dropdownId);
        
        this.registerDropdown(toggle);
        return true;
    }

    /**
     * Update dropdown content
     */
    updateDropdownContent(dropdownId, content) {
        const dropdown = document.querySelector(`[data-dropdown="${dropdownId}"]`);
        if (dropdown) {
            dropdown.innerHTML = content;
            this.emitEvent('dropdown:updated', { dropdownId, dropdown });
        }
    }

    /**
     * Get dropdown state
     */
    isDropdownOpen(toggle) {
        const dropdownData = this.dropdowns.get(toggle);
        return dropdownData ? dropdownData.isOpen : false;
    }

    /**
     * Destroy dropdown manager
     */
    destroy() {
        this.closeAllDropdowns();
        this.dropdowns.clear();
        this.activeDropdowns.clear();
    }
}

// Initialize global dropdown manager
window.dampDropdownManager = new DAMPDropdownManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DAMPDropdownManager;
}
