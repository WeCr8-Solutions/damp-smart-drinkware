/**
 * DAMP Image Optimization System
 * Advanced lazy loading, WebP conversion, and responsive images
 * Google Engineering Standards with Performance Focus
 * Copyright 2025 WeCr8 Solutions LLC
 */

class DAMPImageOptimizer {
    constructor() {
        this.webpSupport = this.checkWebPSupport();
        this.avifSupport = this.checkAVIFSupport();
        this.lazyImages = new Set();
        this.imageCache = new Map();
        this.loadingImages = new Map();
        this.observer = null;
        
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.processExistingImages();
        this.setupDynamicImageHandling();
        this.setupResponsiveImages();
        
        console.log('🖼️ DAMP Image Optimizer initialized', {
            webpSupport: this.webpSupport,
            avifSupport: this.avifSupport
        });
    }

    // ==========================================================================
    // FORMAT SUPPORT DETECTION
    // ==========================================================================

    checkWebPSupport() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    checkAVIFSupport() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        try {
            return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
        } catch {
            return false;
        }
    }

    // ==========================================================================
    // INTERSECTION OBSERVER SETUP
    // ==========================================================================

    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) {
            // Fallback for older browsers
            this.loadAllImages();
            return;
        }

        const options = {
            root: null,
            rootMargin: '50px 0px 50px 0px',
            threshold: [0, 0.1, 0.5, 1.0]
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, options);
    }

    // ==========================================================================
    // IMAGE PROCESSING
    // ==========================================================================

    processExistingImages() {
        // Process images with data-src (lazy loading)
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            this.setupLazyImage(img);
        });

        // Process regular images for optimization
        const regularImages = document.querySelectorAll('img:not([data-src])');
        regularImages.forEach(img => {
            this.optimizeImage(img);
        });
    }

    setupLazyImage(img) {
        // Add placeholder if not present
        if (!img.src && !img.dataset.placeholder) {
            img.src = this.generatePlaceholder(img);
        }

        // Add loading class
        img.classList.add('lazy-loading');
        
        // Observe for intersection
        if (this.observer) {
            this.observer.observe(img);
        } else {
            // Fallback: load immediately
            this.loadImage(img);
        }
    }

    async loadImage(img) {
        if (this.lazyImages.has(img) || this.loadingImages.has(img)) {
            return; // Already loading or loaded
        }

        this.loadingImages.set(img, true);

        try {
            const originalSrc = img.dataset.src || img.src;
            const optimizedSrc = await this.getOptimizedImageSrc(originalSrc);
            
            // Preload the image
            const preloadImg = new Image();
            preloadImg.onload = () => {
                // Apply the optimized source
                img.src = optimizedSrc;
                img.classList.remove('lazy-loading');
                img.classList.add('lazy-loaded');
                
                // Remove data-src to prevent reprocessing
                delete img.dataset.src;
                
                // Apply fade-in effect
                this.applyFadeInEffect(img);
                
                this.lazyImages.add(img);
                this.loadingImages.delete(img);
            };

            preloadImg.onerror = () => {
                // Fallback to original source
                img.src = originalSrc;
                img.classList.remove('lazy-loading');
                img.classList.add('lazy-error');
                this.loadingImages.delete(img);
            };

            preloadImg.src = optimizedSrc;

        } catch (error) {
            console.error('Image loading failed:', error);
            img.classList.remove('lazy-loading');
            img.classList.add('lazy-error');
            this.loadingImages.delete(img);
        }
    }

    async getOptimizedImageSrc(src) {
        // Check cache first
        if (this.imageCache.has(src)) {
            return this.imageCache.get(src);
        }

        let optimizedSrc = src;

        // Try to get WebP/AVIF version
        if (this.avifSupport) {
            optimizedSrc = this.convertToAVIF(src);
        } else if (this.webpSupport) {
            optimizedSrc = this.convertToWebP(src);
        }

        // Add responsive sizing
        optimizedSrc = this.addResponsiveSizing(optimizedSrc);

        // Cache the result
        this.imageCache.set(src, optimizedSrc);
        
        return optimizedSrc;
    }

    convertToWebP(src) {
        // If the image is already WebP, return as-is
        if (src.includes('.webp')) {
            return src;
        }

        // Convert extension to WebP
        return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }

    convertToAVIF(src) {
        // If the image is already AVIF, return as-is
        if (src.includes('.avif')) {
            return src;
        }

        // Convert extension to AVIF
        return src.replace(/\.(jpg|jpeg|png|webp)$/i, '.avif');
    }

    addResponsiveSizing(src) {
        // Add responsive sizing parameters if supported
        const devicePixelRatio = window.devicePixelRatio || 1;
        const viewportWidth = window.innerWidth;
        
        // Calculate optimal image width
        let targetWidth = Math.min(viewportWidth * devicePixelRatio, 1920);
        targetWidth = Math.ceil(targetWidth / 100) * 100; // Round to nearest 100

        // Add sizing parameters (this would work with a CDN that supports it)
        if (src.includes('unsplash.com') || src.includes('dampdrink.com')) {
            return `${src}?w=${targetWidth}&q=80&fm=webp`;
        }

        return src;
    }

    // ==========================================================================
    // PLACEHOLDER GENERATION
    // ==========================================================================

    generatePlaceholder(img) {
        const width = img.getAttribute('width') || 400;
        const height = img.getAttribute('height') || 300;
        
        // Generate a simple SVG placeholder
        const svg = `
            <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#0f0f23;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#1a1a2e;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#grad)"/>
                <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#00d4ff" font-family="Arial" font-size="14">
                    Loading...
                </text>
            </svg>
        `;
        
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    }

    // ==========================================================================
    // VISUAL EFFECTS
    // ==========================================================================

    applyFadeInEffect(img) {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease-in-out';
        
        // Trigger fade-in
        requestAnimationFrame(() => {
            img.style.opacity = '1';
        });
    }

    // ==========================================================================
    // RESPONSIVE IMAGES
    // ==========================================================================

    setupResponsiveImages() {
        // Handle window resize for responsive images
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.updateResponsiveImages();
            }, 250);
        });
    }

    updateResponsiveImages() {
        // Update responsive images on viewport change
        const responsiveImages = document.querySelectorAll('img[data-responsive="true"]');
        responsiveImages.forEach(img => {
            if (!img.dataset.originalSrc) {
                img.dataset.originalSrc = img.src;
            }
            
            const optimizedSrc = this.addResponsiveSizing(img.dataset.originalSrc);
            if (optimizedSrc !== img.src) {
                img.src = optimizedSrc;
            }
        });
    }

    // ==========================================================================
    // DYNAMIC IMAGE HANDLING
    // ==========================================================================

    setupDynamicImageHandling() {
        // Watch for new images added to the DOM
        if ('MutationObserver' in window) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.processDynamicImages(node);
                        }
                    });
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    processDynamicImages(element) {
        // Process images in the new element
        const images = element.tagName === 'IMG' ? [element] : element.querySelectorAll('img');
        
        images.forEach(img => {
            if (img.dataset.src && !this.lazyImages.has(img)) {
                this.setupLazyImage(img);
            } else if (!img.dataset.src && !img.dataset.optimized) {
                this.optimizeImage(img);
            }
        });
    }

    optimizeImage(img) {
        if (img.dataset.optimized) return;
        
        img.dataset.optimized = 'true';
        
        // Add responsive attribute if not present
        if (!img.dataset.responsive) {
            img.dataset.responsive = 'true';
        }

        // Apply loading="lazy" if not present
        if (!img.loading) {
            img.loading = 'lazy';
        }

        // Add proper alt text if missing
        if (!img.alt && img.dataset.alt) {
            img.alt = img.dataset.alt;
        }
    }

    // ==========================================================================
    // FALLBACK FOR OLDER BROWSERS
    // ==========================================================================

    loadAllImages() {
        console.log('📱 Loading all images (fallback mode)');
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            this.loadImage(img);
        });
    }

    // ==========================================================================
    // PUBLIC API
    // ==========================================================================

    // Manually trigger image loading
    loadImageNow(img) {
        if (this.observer) {
            this.observer.unobserve(img);
        }
        this.loadImage(img);
    }

    // Add new lazy image
    addLazyImage(img) {
        this.setupLazyImage(img);
    }

    // Get optimization stats
    getStats() {
        return {
            lazyImagesCount: this.lazyImages.size,
            cachedImagesCount: this.imageCache.size,
            loadingImagesCount: this.loadingImages.size,
            webpSupport: this.webpSupport,
            avifSupport: this.avifSupport
        };
    }

    // Force refresh of all cached images
    refreshCache() {
        this.imageCache.clear();
        console.log('🔄 Image cache refreshed');
    }
}

// Initialize image optimizer
window.addEventListener('DOMContentLoaded', () => {
    window.dampImageOptimizer = new DAMPImageOptimizer();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DAMPImageOptimizer;
}
