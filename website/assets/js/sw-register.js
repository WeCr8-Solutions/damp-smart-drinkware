// Service Worker Registration
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });
            
            console.log('[PWA] Service worker registered:', registration.scope);
            
            // Listen for any SW lifecycle changes
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('[PWA] Service Worker update found!');
                
                newWorker.addEventListener('statechange', () => {
                    console.log('[PWA] Service Worker state:', newWorker.state);
                    if (newWorker.state === 'activated') {
                        console.log('[PWA] Service Worker activated - site ready for offline use');
                    }
                });
            });
            
            // Check for updates every hour
            setInterval(() => {
                registration.update();
            }, 60 * 60 * 1000);
            
        } catch (error) {
            console.error('[PWA] Service worker registration failed:', error);
        }
    } else {
        console.log('[PWA] Service workers are not supported');
    }
}

// Register SW when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerServiceWorker);
} else {
    registerServiceWorker();
}