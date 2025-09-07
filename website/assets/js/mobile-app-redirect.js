/**
 * DAMP Smart Drinkware - Mobile App Redirect
 * Redirects PWA install prompts to the actual mobile app at https://dampdrink.com
 * Author: zach@wecr8.info
 */

(function() {
    'use strict';

    // Mobile App Configuration
    const MOBILE_APP_URL = 'https://dampdrink.com';
    const APP_STORE_URLS = {
        ios: 'https://apps.apple.com/app/damp-smart-drinkware/id123456789',
        android: 'https://play.google.com/store/apps/details?id=com.damp.smartdrinkware'
    };

    // Device detection
    function detectPlatform() {
        const userAgent = navigator.userAgent.toLowerCase();
        const isIOS = /iphone|ipad|ipod/.test(userAgent);
        const isAndroid = /android/.test(userAgent);
        const isMobile = /mobile|tablet|iphone|ipad|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/.test(userAgent);
        
        return {
            isIOS,
            isAndroid,
            isMobile,
            isDesktop: !isMobile
        };
    }

    // Show mobile app install prompt instead of PWA
    function showMobileAppPrompt() {
        const platform = detectPlatform();
        
        // Create install button
        const installBtn = document.createElement('button');
        installBtn.innerHTML = '📱 Get DAMP App';
        installBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(45deg, #00d4ff, #00ff88);
            color: #1a1a2e;
            border: none;
            padding: 15px 25px;
            border-radius: 30px;
            font-weight: 700;
            cursor: pointer;
            z-index: 9999;
            animation: pulse 2s infinite;
            box-shadow: 0 4px 20px rgba(0, 212, 255, 0.3);
            font-size: 16px;
            min-width: 140px;
            text-align: center;
        `;

        // Handle click based on platform
        installBtn.onclick = () => {
            // Track analytics
            if ('gtag' in window) {
                gtag('event', 'mobile_app_redirect', { 
                    event_category: 'engagement',
                    platform: platform.isIOS ? 'ios' : platform.isAndroid ? 'android' : 'desktop'
                });
            }

            // Redirect to mobile app
            if (platform.isMobile) {
                // On mobile, go directly to the mobile app
                window.open(MOBILE_APP_URL, '_blank');
            } else {
                // On desktop, show options or go to mobile app
                showAppDownloadOptions();
            }
            
            installBtn.remove();
        };

        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: -8px;
            right: -8px;
            background: #ff4444;
            color: white;
            border: none;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            installBtn.remove();
        };

        installBtn.appendChild(closeBtn);
        document.body.appendChild(installBtn);
    }

    // Show app download options for desktop users
    function showAppDownloadOptions() {
        const platform = detectPlatform();
        
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(26, 26, 46, 0.9);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
        `;

        // Create modal content
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border-radius: 20px;
            padding: 40px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            color: white;
            box-shadow: 0 20px 60px rgba(0, 212, 255, 0.2);
            border: 1px solid rgba(0, 212, 255, 0.3);
        `;

        modal.innerHTML = `
            <h2 style="color: #00d4ff; margin-bottom: 20px; font-size: 28px;">Get the DAMP App</h2>
            <p style="margin-bottom: 30px; font-size: 18px; line-height: 1.6;">
                Experience the full power of DAMP Smart Drinkware with our mobile app.
            </p>
            <div style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 30px;">
                <button id="web-app-btn" style="
                    background: linear-gradient(45deg, #00d4ff, #00ff88);
                    color: #1a1a2e;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 15px;
                    font-weight: 700;
                    cursor: pointer;
                    font-size: 16px;
                    transition: transform 0.2s;
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    🌐 Open Web App
                </button>
                ${platform.isIOS ? `
                <button id="ios-btn" style="
                    background: #007AFF;
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 15px;
                    font-weight: 700;
                    cursor: pointer;
                    font-size: 16px;
                    transition: transform 0.2s;
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    📱 Download for iOS
                </button>
                ` : ''}
                ${platform.isAndroid ? `
                <button id="android-btn" style="
                    background: #34A853;
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 15px;
                    font-weight: 700;
                    cursor: pointer;
                    font-size: 16px;
                    transition: transform 0.2s;
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    🤖 Download for Android
                </button>
                ` : ''}
            </div>
            <button id="close-modal" style="
                background: transparent;
                color: #888;
                border: 1px solid #444;
                padding: 10px 20px;
                border-radius: 10px;
                cursor: pointer;
                font-size: 14px;
            ">
                Close
            </button>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Add event listeners
        const webAppBtn = modal.querySelector('#web-app-btn');
        const iosBtn = modal.querySelector('#ios-btn');
        const androidBtn = modal.querySelector('#android-btn');
        const closeBtn = modal.querySelector('#close-modal');

        webAppBtn?.addEventListener('click', () => {
            window.open(MOBILE_APP_URL, '_blank');
            overlay.remove();
        });

        iosBtn?.addEventListener('click', () => {
            window.open(APP_STORE_URLS.ios, '_blank');
            overlay.remove();
        });

        androidBtn?.addEventListener('click', () => {
            window.open(APP_STORE_URLS.android, '_blank');
            overlay.remove();
        });

        closeBtn?.addEventListener('click', () => {
            overlay.remove();
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }

    // Override the default PWA install behavior
    function overridePWABehavior() {
        // Prevent default beforeinstallprompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            // Don't store the prompt, we'll redirect instead
            setTimeout(showMobileAppPrompt, 3000);
        });

        // Replace any existing showInstallPrompt functions
        window.showInstallPrompt = showMobileAppPrompt;
    }

    // Add pulse animation styles
    function addStyles() {
        const styles = document.createElement('style');
        styles.textContent = `
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            @media (display-mode: standalone) {
                body { padding-top: env(safe-area-inset-top); }
            }
        `;
        document.head.appendChild(styles);
    }

    // Initialize when DOM is ready
    function init() {
        addStyles();
        overridePWABehavior();
        
        // Show prompt after 3 seconds if not already shown
        setTimeout(() => {
            if (!document.querySelector('button[style*="Install App"]') && 
                !document.querySelector('button[style*="Get DAMP App"]')) {
                showMobileAppPrompt();
            }
        }, 3000);
    }

    // Start when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export for manual use
    window.DAMP = window.DAMP || {};
    window.DAMP.showMobileAppPrompt = showMobileAppPrompt;
    window.DAMP.showAppDownloadOptions = showAppDownloadOptions;
})();
