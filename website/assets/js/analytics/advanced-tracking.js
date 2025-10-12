/**
 * Advanced GA4 Tracking Module
 * Additional tracking for engagement, performance, forms, and user behavior
 *
 * @fileoverview Complete the GA4 implementation with advanced tracking
 * @author WeCr8 Solutions LLC
 * @version 3.0.0
 */

import { Logger } from '../store/utils/logger.js';

/**
 * Advanced Tracking Event Types
 */
export const AdvancedEventType = {
    // Engagement
    ENGAGEMENT_TIME: 'user_engagement',
    SCROLL_DEPTH: 'scroll',
    TIME_ON_PAGE: 'time_on_page',
    PAGE_EXIT: 'page_exit',
    
    // Forms
    FORM_START: 'form_start',
    FORM_PROGRESS: 'form_progress',
    FORM_ABANDON: 'form_abandon',
    FORM_ERROR: 'form_error',
    
    // Search
    SEARCH: 'search',
    SEARCH_RESULTS: 'view_search_results',
    
    // Video/Media
    VIDEO_START: 'video_start',
    VIDEO_PROGRESS: 'video_progress',
    VIDEO_COMPLETE: 'video_complete',
    
    // Social
    SHARE: 'share',
    SOCIAL_CLICK: 'social_click',
    
    // Performance
    WEB_VITALS: 'web_vitals',
    PAGE_LOAD: 'page_load_timing',
    
    // Errors
    ERROR: 'exception',
    PAGE_NOT_FOUND: '404_error',
    
    // PWA
    PWA_INSTALL_PROMPT: 'pwa_install_prompt',
    PWA_INSTALLED: 'pwa_installed',
    PWA_OFFLINE: 'pwa_offline_mode',
    
    // User Behavior
    COPY_TEXT: 'text_copied',
    PRINT_PAGE: 'page_printed',
    FILE_DOWNLOAD: 'file_download',
    EMAIL_CLICK: 'email_click',
    PHONE_CLICK: 'phone_click'
};

/**
 * Advanced Tracking Analytics Class
 */
export class AdvancedTracking {
    #logger = null;
    #debug = false;
    #measurementId = null;
    #formTracking = new Map();
    #scrollTracking = { maxDepth: 0, milestones: [25, 50, 75, 90, 100] };
    #videoTracking = new Map();
    #sessionStart = Date.now();

    constructor(config = {}) {
        this.#logger = new Logger('AdvancedTracking');
        this.#debug = config.debug || false;
        this.#measurementId = config.measurementId || 'G-YW2BN4SVPQ';
        
        this.#initialize();
    }

    /**
     * Initialize all advanced tracking
     * @private
     */
    #initialize() {
        if (typeof window === 'undefined') return;
        
        this.#setupEngagementTracking();
        this.#setupFormTracking();
        this.#setupScrollTracking();
        this.#setupPerformanceTracking();
        this.#setupErrorTracking();
        this.#setupPWATracking();
        this.#setupUserBehaviorTracking();
        this.#setupVideoTracking();
        this.#setupSearchTracking();
        this.#setupSocialTracking();
    }

    /**
     * Track user engagement time
     * @private
     */
    #setupEngagementTracking() {
        let engagementStart = Date.now();
        let totalEngagementTime = 0;
        
        // Track visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                const engagementTime = Date.now() - engagementStart;
                totalEngagementTime += engagementTime;
                
                this.#sendEvent(AdvancedEventType.ENGAGEMENT_TIME, {
                    engagement_time_msec: engagementTime,
                    total_engagement_time_msec: totalEngagementTime
                });
            } else {
                engagementStart = Date.now();
            }
        });

        // Track page exit
        window.addEventListener('beforeunload', () => {
            const sessionTime = Date.now() - this.#sessionStart;
            this.#sendEvent(AdvancedEventType.PAGE_EXIT, {
                session_time: sessionTime,
                total_engagement_time: totalEngagementTime,
                scroll_depth: this.#scrollTracking.maxDepth
            });
        });

        // Periodic engagement ping (every 30 seconds)
        setInterval(() => {
            if (!document.hidden) {
                const currentEngagement = Date.now() - engagementStart;
                this.#sendEvent(AdvancedEventType.ENGAGEMENT_TIME, {
                    engagement_time_msec: currentEngagement,
                    is_active: true
                });
            }
        }, 30000);
    }

    /**
     * Track form interactions and abandonment
     * @private
     */
    #setupFormTracking() {
        // Track form starts
        document.addEventListener('focus', (e) => {
            if (e.target.matches('input, textarea, select')) {
                const form = e.target.closest('form');
                if (form && !this.#formTracking.has(form)) {
                    const formData = {
                        formId: form.id || form.name || 'unnamed_form',
                        fieldCount: form.querySelectorAll('input, textarea, select').length,
                        startTime: Date.now(),
                        fields: new Set(),
                        errors: []
                    };
                    
                    this.#formTracking.set(form, formData);
                    
                    this.#sendEvent(AdvancedEventType.FORM_START, {
                        form_id: formData.formId,
                        form_name: form.name || formData.formId,
                        field_count: formData.fieldCount,
                        form_destination: form.action
                    });
                }
                
                // Track field interaction
                const formData = this.#formTracking.get(form);
                if (formData) {
                    formData.fields.add(e.target.name || e.target.id || 'unnamed_field');
                    
                    // Track progress
                    const progress = Math.round((formData.fields.size / formData.fieldCount) * 100);
                    if (progress % 25 === 0 && progress > 0) {
                        this.#sendEvent(AdvancedEventType.FORM_PROGRESS, {
                            form_id: formData.formId,
                            progress_percentage: progress,
                            fields_completed: formData.fields.size,
                            total_fields: formData.fieldCount
                        });
                    }
                }
            }
        }, true);

        // Track form errors
        document.addEventListener('invalid', (e) => {
            const form = e.target.closest('form');
            if (form) {
                const formData = this.#formTracking.get(form);
                if (formData) {
                    formData.errors.push({
                        field: e.target.name || e.target.id,
                        message: e.target.validationMessage
                    });
                    
                    this.#sendEvent(AdvancedEventType.FORM_ERROR, {
                        form_id: formData.formId,
                        field_name: e.target.name || e.target.id,
                        error_message: e.target.validationMessage,
                        error_count: formData.errors.length
                    });
                }
            }
        }, true);

        // Track form abandonment
        window.addEventListener('beforeunload', () => {
            this.#formTracking.forEach((formData, form) => {
                if (formData.fields.size > 0 && !formData.submitted) {
                    const timeSpent = Date.now() - formData.startTime;
                    const progress = Math.round((formData.fields.size / formData.fieldCount) * 100);
                    
                    this.#sendEvent(AdvancedEventType.FORM_ABANDON, {
                        form_id: formData.formId,
                        progress_percentage: progress,
                        fields_completed: formData.fields.size,
                        total_fields: formData.fieldCount,
                        time_spent: timeSpent,
                        error_count: formData.errors.length
                    });
                }
            });
        });

        // Track form submissions
        document.addEventListener('submit', (e) => {
            const form = e.target;
            const formData = this.#formTracking.get(form);
            if (formData) {
                formData.submitted = true;
                const timeSpent = Date.now() - formData.startTime;
                
                // Form submission tracked elsewhere, just mark as submitted
                this.#logger.debug('Form submitted', { formId: formData.formId, timeSpent });
            }
        });
    }

    /**
     * Track scroll depth
     * @private
     */
    #setupScrollTracking() {
        let scrollTimeout;
        
        const trackScroll = () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = window.scrollY;
            const scrollPercent = Math.round((scrolled / scrollHeight) * 100);
            
            if (scrollPercent > this.#scrollTracking.maxDepth) {
                this.#scrollTracking.maxDepth = scrollPercent;
                
                // Track milestone achievements
                this.#scrollTracking.milestones.forEach(milestone => {
                    if (scrollPercent >= milestone && this.#scrollTracking.maxDepth - scrollPercent < 5) {
                        this.#sendEvent(AdvancedEventType.SCROLL_DEPTH, {
                            percent_scrolled: milestone,
                            scroll_depth: scrolled,
                            page_height: scrollHeight + window.innerHeight
                        });
                    }
                });
            }
        };
        
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(trackScroll, 100);
        }, { passive: true });
    }

    /**
     * Track Core Web Vitals and performance
     * @private
     */
    #setupPerformanceTracking() {
        // Track Core Web Vitals
        if ('PerformanceObserver' in window) {
            // Largest Contentful Paint (LCP)
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    
                    this.#sendEvent(AdvancedEventType.WEB_VITALS, {
                        metric_name: 'LCP',
                        metric_value: Math.round(lastEntry.startTime),
                        metric_rating: this.#getRating('LCP', lastEntry.startTime)
                    });
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                this.#logger.warn('LCP observer failed', e);
            }

            // First Input Delay (FID)
            try {
                const fidObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        const fid = entry.processingStart - entry.startTime;
                        this.#sendEvent(AdvancedEventType.WEB_VITALS, {
                            metric_name: 'FID',
                            metric_value: Math.round(fid),
                            metric_rating: this.#getRating('FID', fid)
                        });
                    });
                });
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                this.#logger.warn('FID observer failed', e);
            }

            // Cumulative Layout Shift (CLS)
            try {
                let clsValue = 0;
                const clsObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    }
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });
                
                // Report CLS on page unload
                window.addEventListener('beforeunload', () => {
                    this.#sendEvent(AdvancedEventType.WEB_VITALS, {
                        metric_name: 'CLS',
                        metric_value: Math.round(clsValue * 1000) / 1000,
                        metric_rating: this.#getRating('CLS', clsValue)
                    });
                });
            } catch (e) {
                this.#logger.warn('CLS observer failed', e);
            }
        }

        // Track page load timing
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    this.#sendEvent(AdvancedEventType.PAGE_LOAD, {
                        dns_time: Math.round(perfData.domainLookupEnd - perfData.domainLookupStart),
                        connection_time: Math.round(perfData.connectEnd - perfData.connectStart),
                        request_time: Math.round(perfData.responseStart - perfData.requestStart),
                        response_time: Math.round(perfData.responseEnd - perfData.responseStart),
                        dom_load_time: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
                        total_load_time: Math.round(perfData.loadEventEnd - perfData.fetchStart)
                    });
                }
            }, 0);
        });
    }

    /**
     * Get performance rating
     * @private
     */
    #getRating(metric, value) {
        const thresholds = {
            'LCP': { good: 2500, needsImprovement: 4000 },
            'FID': { good: 100, needsImprovement: 300 },
            'CLS': { good: 0.1, needsImprovement: 0.25 }
        };
        
        const threshold = thresholds[metric];
        if (!threshold) return 'unknown';
        
        if (value <= threshold.good) return 'good';
        if (value <= threshold.needsImprovement) return 'needs_improvement';
        return 'poor';
    }

    /**
     * Track JavaScript errors
     * @private
     */
    #setupErrorTracking() {
        window.addEventListener('error', (event) => {
            this.#sendEvent(AdvancedEventType.ERROR, {
                description: `${event.message} at ${event.filename}:${event.lineno}:${event.colno}`,
                fatal: false,
                error_message: event.message,
                error_stack: event.error?.stack,
                error_filename: event.filename,
                error_line: event.lineno,
                error_column: event.colno
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.#sendEvent(AdvancedEventType.ERROR, {
                description: `Unhandled Promise Rejection: ${event.reason}`,
                fatal: false,
                error_type: 'promise_rejection',
                error_reason: event.reason
            });
        });
    }

    /**
     * Track PWA events
     * @private
     */
    #setupPWATracking() {
        // Track install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            this.#sendEvent(AdvancedEventType.PWA_INSTALL_PROMPT, {
                prompt_shown: true,
                platform: navigator.platform
            });
            
            // Track user choice
            e.userChoice?.then(choiceResult => {
                this.#sendEvent(AdvancedEventType.PWA_INSTALL_PROMPT, {
                    prompt_shown: true,
                    user_choice: choiceResult.outcome,
                    platform: choiceResult.platform
                });
            });
        });

        // Track successful installation
        window.addEventListener('appinstalled', () => {
            this.#sendEvent(AdvancedEventType.PWA_INSTALLED, {
                installed: true,
                platform: navigator.platform
            });
        });

        // Track offline mode
        window.addEventListener('online', () => {
            this.#sendEvent(AdvancedEventType.PWA_OFFLINE, {
                online: true
            });
        });

        window.addEventListener('offline', () => {
            this.#sendEvent(AdvancedEventType.PWA_OFFLINE, {
                online: false
            });
        });
    }

    /**
     * Track user behavior (copy, print, etc.)
     * @private
     */
    #setupUserBehaviorTracking() {
        // Track text copying
        document.addEventListener('copy', () => {
            const selection = window.getSelection()?.toString();
            if (selection) {
                this.#sendEvent(AdvancedEventType.COPY_TEXT, {
                    text_length: selection.length,
                    page_section: this.#getPageSection()
                });
            }
        });

        // Track print
        window.addEventListener('beforeprint', () => {
            this.#sendEvent(AdvancedEventType.PRINT_PAGE, {
                page_title: document.title,
                page_url: window.location.href
            });
        });

        // Track file downloads
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.download) {
                this.#sendEvent(AdvancedEventType.FILE_DOWNLOAD, {
                    file_name: link.download || link.href.split('/').pop(),
                    file_url: link.href,
                    file_extension: link.href.split('.').pop()
                });
            }
        });

        // Track email and phone clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href) {
                if (link.href.startsWith('mailto:')) {
                    this.#sendEvent(AdvancedEventType.EMAIL_CLICK, {
                        email_address: link.href.replace('mailto:', '').split('?')[0]
                    });
                } else if (link.href.startsWith('tel:')) {
                    this.#sendEvent(AdvancedEventType.PHONE_CLICK, {
                        phone_number: link.href.replace('tel:', '')
                    });
                }
            }
        });
    }

    /**
     * Track video engagement
     * @private
     */
    #setupVideoTracking() {
        const trackVideo = (video) => {
            const videoId = video.id || video.src || 'unknown_video';
            
            if (this.#videoTracking.has(videoId)) return;
            
            const videoData = {
                startTime: null,
                milestones: new Set()
            };
            
            this.#videoTracking.set(videoId, videoData);
            
            video.addEventListener('play', () => {
                if (!videoData.startTime) {
                    videoData.startTime = Date.now();
                    this.#sendEvent(AdvancedEventType.VIDEO_START, {
                        video_id: videoId,
                        video_title: video.title || videoId,
                        video_duration: video.duration,
                        video_url: video.src
                    });
                }
            });
            
            video.addEventListener('timeupdate', () => {
                const percent = Math.round((video.currentTime / video.duration) * 100);
                [25, 50, 75].forEach(milestone => {
                    if (percent >= milestone && !videoData.milestones.has(milestone)) {
                        videoData.milestones.add(milestone);
                        this.#sendEvent(AdvancedEventType.VIDEO_PROGRESS, {
                            video_id: videoId,
                            video_percent: milestone,
                            video_current_time: video.currentTime
                        });
                    }
                });
            });
            
            video.addEventListener('ended', () => {
                const watchTime = Date.now() - videoData.startTime;
                this.#sendEvent(AdvancedEventType.VIDEO_COMPLETE, {
                    video_id: videoId,
                    video_duration: video.duration,
                    watch_time: watchTime
                });
            });
        };
        
        // Track existing videos
        document.querySelectorAll('video').forEach(trackVideo);
        
        // Track dynamically added videos
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.tagName === 'VIDEO') {
                        trackVideo(node);
                    } else if (node.querySelectorAll) {
                        node.querySelectorAll('video').forEach(trackVideo);
                    }
                });
            });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }

    /**
     * Track site search
     * @private
     */
    #setupSearchTracking() {
        // Track search form submissions
        document.addEventListener('submit', (e) => {
            const form = e.target;
            const searchInput = form.querySelector('input[type="search"], input[name*="search"], input[name*="query"], input[name*="q"]');
            
            if (searchInput && searchInput.value) {
                this.#sendEvent(AdvancedEventType.SEARCH, {
                    search_term: searchInput.value,
                    search_location: form.id || 'unknown'
                });
            }
        });
    }

    /**
     * Track social sharing
     * @private
     */
    #setupSocialTracking() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a, button');
            if (link) {
                const href = link.href || link.dataset.href || '';
                const text = link.textContent?.toLowerCase() || '';
                
                // Detect social media links
                const socialNetworks = {
                    'facebook.com': 'Facebook',
                    'twitter.com': 'Twitter',
                    'x.com': 'X',
                    'linkedin.com': 'LinkedIn',
                    'instagram.com': 'Instagram',
                    'pinterest.com': 'Pinterest',
                    'youtube.com': 'YouTube',
                    'tiktok.com': 'TikTok'
                };
                
                for (const [domain, network] of Object.entries(socialNetworks)) {
                    if (href.includes(domain) || text.includes(network.toLowerCase())) {
                        this.#sendEvent(AdvancedEventType.SOCIAL_CLICK, {
                            social_network: network,
                            link_url: href,
                            content_type: this.#getContentType()
                        });
                        break;
                    }
                }
                
                // Detect share intent
                if (text.includes('share') || link.classList.contains('share') || href.includes('share')) {
                    this.#sendEvent(AdvancedEventType.SHARE, {
                        method: this.#detectShareMethod(href),
                        content_type: this.#getContentType(),
                        page_location: window.location.href
                    });
                }
            }
        });

        // Track Web Share API
        if (navigator.share) {
            const originalShare = navigator.share.bind(navigator);
            navigator.share = async (data) => {
                this.#sendEvent(AdvancedEventType.SHARE, {
                    method: 'Web Share API',
                    content_type: data.title || document.title,
                    share_url: data.url || window.location.href
                });
                return originalShare(data);
            };
        }
    }

    /**
     * Detect share method from URL
     * @private
     */
    #detectShareMethod(url) {
        if (url.includes('facebook.com/sharer')) return 'Facebook';
        if (url.includes('twitter.com/intent/tweet')) return 'Twitter';
        if (url.includes('linkedin.com/shareArticle')) return 'LinkedIn';
        if (url.includes('mailto:')) return 'Email';
        return 'Other';
    }

    /**
     * Get content type
     * @private
     */
    #getContentType() {
        const path = window.location.pathname;
        if (path.includes('/product')) return 'product';
        if (path.includes('/blog') || path.includes('/article')) return 'article';
        if (path === '/' || path === '/index.html') return 'homepage';
        return 'page';
    }

    /**
     * Get page section
     * @private
     */
    #getPageSection() {
        const path = window.location.pathname;
        if (path.includes('/pages/')) return path.split('/pages/')[1]?.split('.')[0] || 'unknown';
        return 'home';
    }

    /**
     * Send event to GA4
     * @private
     */
    #sendEvent(eventType, eventData) {
        if (typeof window === 'undefined' || !window.gtag) {
            this.#logger.warn('GA4 not available', { eventType });
            return;
        }

        try {
            window.gtag('event', eventType, {
                ...eventData,
                timestamp: Date.now(),
                page_location: window.location.href,
                page_title: document.title
            });

            if (this.#debug) {
                this.#logger.debug('Advanced event tracked', { type: eventType, data: eventData });
            }
        } catch (error) {
            this.#logger.error('Failed to send advanced event', error);
        }
    }

    /**
     * Enable debug mode
     */
    setDebugMode(enabled = true) {
        this.#debug = enabled;
        this.#logger.info('Advanced tracking debug mode', { enabled });
    }
}

// Export singleton instance
const advancedTracking = new AdvancedTracking();
export default advancedTracking;

