/**
 * DAMP Navigation - Test Suite
 * Copyright 2025 WeCr8 Solutions LLC
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import DAMPNavigation from './navigation-enhanced.js';

/* global jest, test, describe, beforeEach, afterEach, expect, window, document, KeyboardEvent, Event */

jest.useFakeTimers();

// Helper function to create custom events
const createCustomEvent = (eventName, eventInit = {}) => {
    if (eventName === 'keydown') {
        return new KeyboardEvent(eventName, {
            bubbles: true,
            cancelable: true,
            ...eventInit
        });
    }
    return new Event(eventName, {
        bubbles: true,
        cancelable: true,
        ...eventInit
    });
};

describe('DAMPNavigation', () => {
    let navigation;
    let container;

    // Mock DOM elements
    const createMockNavigation = () => {
        container = document.createElement('div');
        container.innerHTML = `
            <nav class="damp-nav">
                <button class="hamburger" aria-label="Toggle navigation menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                <div class="mobile-menu">
                    <div class="nav-links">
                        <a href="/">Home</a>
                        <a href="/products">Products</a>
                        <a href="/about">About</a>
                        <a href="/contact">Contact</a>
                    </div>
                </div>
            </nav>
        `;
        document.body.appendChild(container);
    };

    beforeEach(() => {
        // Reset window properties
        window.pageYOffset = 0;
        window.innerWidth = 767; // Default to mobile
        createMockNavigation();
        navigation = new DAMPNavigation({ debug: false });
    });

    afterEach(() => {
        container.remove();
        jest.clearAllMocks();
        document.body.style.overflow = '';
    });

    describe('Initialization', () => {
        test('should initialize with default options', () => {
            expect(navigation.config.scrollThreshold).toBe(50);
            expect(navigation.config.mobileBreakpoint).toBe(767);
            expect(navigation.config.animationDuration).toBe(300);
        });

        test('should find all required DOM elements', () => {
            expect(navigation.elements.nav).toBeTruthy();
            expect(navigation.elements.mobileMenu).toBeTruthy();
            expect(navigation.elements.hamburger).toBeTruthy();
            expect(navigation.elements.backdrop).toBeTruthy();
            expect(navigation.elements.navLinks).toBeTruthy();
        });

        test('should create backdrop if missing', () => {
            container.querySelector('.menu-backdrop')?.remove();
            navigation = new DAMPNavigation();
            expect(document.querySelector('.menu-backdrop')).toBeTruthy();
        });
    });

    describe('Mobile Menu Functionality', () => {
        test('should toggle menu on hamburger click', () => {
            const hamburger = navigation.elements.hamburger;
            hamburger.click();
            jest.advanceTimersByTime(300); // Advance past animation duration

            expect(navigation.state.isMenuOpen).toBe(true);
            expect(navigation.elements.mobileMenu.classList.contains('is-active')).toBe(true);
            expect(hamburger.getAttribute('aria-expanded')).toBe('true');

            hamburger.click();
            jest.advanceTimersByTime(300); // Advance past animation duration

            expect(navigation.state.isMenuOpen).toBe(false);
            expect(navigation.elements.mobileMenu.classList.contains('is-active')).toBe(false);
            expect(hamburger.getAttribute('aria-expanded')).toBe('false');
        });

        test('should close menu on backdrop click', () => {
            navigation.openMenu();
            jest.advanceTimersByTime(300); // Advance past animation duration
            navigation.elements.backdrop.click();
            jest.advanceTimersByTime(300); // Advance past animation duration
            
            expect(navigation.state.isMenuOpen).toBe(false);
            expect(navigation.elements.mobileMenu.classList.contains('is-active')).toBe(false);
        });

        test('should close menu on escape key', () => {
            navigation.openMenu();
            jest.advanceTimersByTime(300); // Advance past animation duration
            
            // Simulate an Escape keydown event
            const event = document.createEvent('Event');
            event.initEvent('keydown', true, true);
            Object.defineProperty(event, 'keyCode', {value: 27}); // Escape key
            Object.defineProperty(event, 'code', {value: 'Escape'});
            Object.defineProperty(event, 'key', {value: 'Escape'});

            document.dispatchEvent(event);
            
            jest.advanceTimersByTime(300); // Advance past animation duration
            expect(navigation.state.isMenuOpen).toBe(false);
        });

        test('should prevent multiple transitions', () => {
            navigation.state.isTransitioning = true;
            navigation.toggleMenu();
            expect(navigation.state.isMenuOpen).toBe(false);
        });
    });

    describe('Scroll Behavior', () => {
        test('should add scrolled class on scroll', () => {
            window.pageYOffset = 100;
            
            const scrollEvent = document.createEvent('Event');
            scrollEvent.initEvent('scroll', true, true);
            window.dispatchEvent(scrollEvent);
            
            jest.runOnlyPendingTimers();
            jest.advanceTimersByTime(16); // rAF

            expect(navigation.elements.nav.classList.contains('nav-scrolled')).toBe(true);
        });

        test('should handle scroll direction', () => {
            window.pageYOffset = 200;
            const scrollEvent = document.createEvent('Event');
            scrollEvent.initEvent('scroll', true, true);
            window.dispatchEvent(scrollEvent);
            
            jest.runOnlyPendingTimers();
            jest.advanceTimersByTime(16); // rAF

            window.pageYOffset = 300;
            const secondScrollEvent = document.createEvent('Event');
            secondScrollEvent.initEvent('scroll', true, true);
            window.dispatchEvent(secondScrollEvent);
            
            jest.runOnlyPendingTimers();
            jest.advanceTimersByTime(16); // rAF

            expect(navigation.elements.nav.classList.contains('nav-hidden')).toBe(true);
        });
    });

    describe('Responsive Behavior', () => {
        test('should handle resize events', () => {
            window.innerWidth = 400;
            const resizeEvent = document.createEvent('Event');
            resizeEvent.initEvent('resize', true, true);
            window.dispatchEvent(resizeEvent);
            
            jest.runOnlyPendingTimers();
            expect(navigation.state.isMobile).toBe(true);

            window.innerWidth = 1024;
            const desktopResizeEvent = document.createEvent('Event');
            desktopResizeEvent.initEvent('resize', true, true);
            window.dispatchEvent(desktopResizeEvent);
            
            jest.runOnlyPendingTimers();
            expect(navigation.state.isMobile).toBe(false);
            expect(navigation.state.isMenuOpen).toBe(false);
        });

        test('should reset mobile menu on desktop transition', () => {
            navigation.openMenu();
            jest.advanceTimersByTime(50); // Advance past animation
            
            window.innerWidth = 1024;
            const resizeEvent = document.createEvent('Event');
            resizeEvent.initEvent('resize', true, true);
            window.dispatchEvent(resizeEvent);
            
            jest.runOnlyPendingTimers();
            expect(navigation.elements.mobileMenu.classList.contains('is-active')).toBe(false);
            expect(document.body.style.overflow).toBe('');
        });
    });

    describe('Accessibility', () => {
        test('should have proper ARIA attributes', () => {
            expect(navigation.elements.hamburger.getAttribute('aria-label')).toBe('Toggle navigation menu');
            expect(navigation.elements.hamburger.getAttribute('aria-expanded')).toBe('false');
            expect(navigation.elements.mobileMenu.getAttribute('role')).toBe('navigation');
        });

        test('should handle keyboard navigation', () => {
            const firstLink = navigation.elements.menuItems[0];
            const clickSpy = jest.spyOn(firstLink, 'click');
            // Simulate an Enter keydown event
            const event = document.createEvent('Event');
            event.initEvent('keydown', true, true);
            Object.defineProperty(event, 'keyCode', {value: 13}); // Enter key
            Object.defineProperty(event, 'code', {value: 'Enter'});
            Object.defineProperty(event, 'key', {value: 'Enter'});

            firstLink.dispatchEvent(event);
            expect(clickSpy).toHaveBeenCalled();
        });
    });

    describe('Active Link Management', () => {
        test('should set active link correctly', () => {
            navigation.setActiveLink('/products');
            const productsLink = Array.from(navigation.elements.menuItems)
                .find(item => item.getAttribute('href') === '/products');

            expect(productsLink.classList.contains('active')).toBe(true);
            expect(navigation.state.activeLink).toBe(productsLink);
        });

        test('should remove active class from other links', () => {
            navigation.setActiveLink('/products');
            navigation.setActiveLink('/about');

            const productsLink = Array.from(navigation.elements.menuItems)
                .find(item => item.getAttribute('href') === '/products');

            expect(productsLink.classList.contains('active')).toBe(false);
        });
    });
});

// Tests are now in the other test suite