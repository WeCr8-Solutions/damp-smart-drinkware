/**
 * 🔄 DAMP Smart Drinkware - Website Integration Script
 * Ensures website uses same Firebase Functions as mobile app
 * Run this to update existing website pages
 */

// Import unified services
import dampServices from './unified-firebase-services.js';

// =============================================================================
// REPLACE EXISTING WEBSITE SERVICES
// =============================================================================

// Override existing authentication
if (window.authService) {
  console.log('🔄 Replacing existing auth service with unified version');
  window.authService = dampServices.auth;
}

// Override existing subscription handling
if (window.subscriptionService) {
  console.log('🔄 Replacing existing subscription service with unified version');
  window.subscriptionService = dampServices.subscriptions;
}

// Override existing voting system
if (window.votingSystem) {
  console.log('🔄 Replacing existing voting system with unified version');
  window.votingSystem = dampServices.voting;
}

// Override existing store functionality
if (window.storeService) {
  console.log('🔄 Replacing existing store service with unified version');
  window.storeService = dampServices.ecommerce;
}

// =============================================================================
// UPDATE EXISTING WEBSITE FUNCTIONS
// =============================================================================

// Update subscription checkout buttons
document.addEventListener('DOMContentLoaded', () => {
  // Update subscription buttons to use Firebase Functions
  const subscriptionButtons = document.querySelectorAll('[data-plan-id]');
  subscriptionButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      const planId = button.dataset.planId;
      
      if (!dampServices.auth.currentUser) {
        // Redirect to login if not authenticated
        window.location.href = '/pages/auth.html?redirect=' + encodeURIComponent(window.location.href);
        return;
      }

      try {
        button.disabled = true;
        button.textContent = 'Processing...';
        
        const result = await dampServices.subscriptions.createCheckout(planId);
        
        if (result.url) {
          window.location.href = result.url;
        } else {
          throw new Error(result.error || 'Failed to create checkout session');
        }
      } catch (error) {
        console.error('Subscription checkout error:', error);
        alert('Failed to start subscription. Please try again.');
      } finally {
        button.disabled = false;
        button.textContent = 'Subscribe Now';
      }
    });
  });

  // Update voting buttons to use unified service
  const voteButtons = document.querySelectorAll('[data-vote-product]');
  voteButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      const productId = button.dataset.voteProduct;
      
      if (!dampServices.auth.currentUser) {
        alert('Please log in to vote for products');
        return;
      }

      try {
        button.disabled = true;
        const originalText = button.textContent;
        button.textContent = 'Voting...';
        
        const result = await dampServices.voting.submitAuthenticatedVote(productId);
        
        if (result.success) {
          button.textContent = 'Voted!';
          button.disabled = true;
          
          // Show success message
          const successMsg = document.createElement('div');
          successMsg.textContent = 'Thank you for voting!';
          successMsg.style.cssText = 'color: green; font-size: 12px; margin-top: 5px;';
          button.parentNode.appendChild(successMsg);
          
          setTimeout(() => {
            if (successMsg.parentNode) {
              successMsg.parentNode.removeChild(successMsg);
            }
          }, 3000);
        } else {
          throw new Error(result.error || 'Failed to submit vote');
        }
      } catch (error) {
        console.error('Voting error:', error);
        button.textContent = originalText;
        button.disabled = false;
        alert('Failed to submit vote: ' + error.message);
      }
    });
  });

  // Update cart/checkout functionality
  const checkoutButton = document.querySelector('#checkout-button');
  if (checkoutButton) {
    checkoutButton.addEventListener('click', async (e) => {
      e.preventDefault();
      
      const cart = dampServices.ecommerce.getCart();
      if (cart.length === 0) {
        alert('Your cart is empty');
        return;
      }

      // Get shipping address from form
      const shippingForm = document.querySelector('#shipping-form');
      if (!shippingForm) {
        alert('Please fill in shipping information');
        return;
      }

      const formData = new FormData(shippingForm);
      const shippingAddress = {
        fullName: formData.get('fullName'),
        addressLine1: formData.get('addressLine1'),
        addressLine2: formData.get('addressLine2'),
        city: formData.get('city'),
        state: formData.get('state'),
        postalCode: formData.get('postalCode'),
        country: formData.get('country') || 'US',
        phone: formData.get('phone')
      };

      try {
        checkoutButton.disabled = true;
        checkoutButton.textContent = 'Processing...';
        
        const result = await dampServices.ecommerce.createCheckout(shippingAddress);
        
        if (result.success && result.url) {
          window.location.href = result.url;
        } else {
          throw new Error(result.error || 'Failed to create checkout session');
        }
      } catch (error) {
        console.error('Checkout error:', error);
        alert('Failed to start checkout: ' + error.message);
      } finally {
        checkoutButton.disabled = false;
        checkoutButton.textContent = 'Proceed to Checkout';
      }
    });
  }

  // Update authentication forms
  const loginForm = document.querySelector('#login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = loginForm.querySelector('[name="email"]').value;
      const password = loginForm.querySelector('[name="password"]').value;
      
      try {
        const submitButton = loginForm.querySelector('[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Signing in...';
        
        const result = await dampServices.auth.signIn(email, password);
        
        if (result.user) {
          // Redirect to dashboard or original page
          const urlParams = new URLSearchParams(window.location.search);
          const redirectUrl = urlParams.get('redirect') || '/pages/dashboard.html';
          window.location.href = redirectUrl;
        } else {
          throw new Error(result.error?.message || 'Login failed');
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('Login failed: ' + error.message);
        
        const submitButton = loginForm.querySelector('[type="submit"]');
        submitButton.disabled = false;
        submitButton.textContent = 'Sign In';
      }
    });
  }

  const signupForm = document.querySelector('#signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = signupForm.querySelector('[name="email"]').value;
      const password = signupForm.querySelector('[name="password"]').value;
      const displayName = signupForm.querySelector('[name="displayName"]')?.value;
      
      try {
        const submitButton = signupForm.querySelector('[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Creating account...';
        
        const result = await dampServices.auth.signUp(email, password, { displayName });
        
        if (result.user) {
          // Redirect to welcome page or dashboard
          window.location.href = '/pages/welcome.html';
        } else {
          throw new Error(result.error?.message || 'Signup failed');
        }
      } catch (error) {
        console.error('Signup error:', error);
        alert('Signup failed: ' + error.message);
        
        const submitButton = signupForm.querySelector('[type="submit"]');
        submitButton.disabled = false;
        submitButton.textContent = 'Create Account';
      }
    });
  }
});

// =============================================================================
// REAL-TIME VOTING UPDATES (Matches Mobile App)
// =============================================================================

// Update voting displays in real-time
function initializeVotingUpdates() {
  const votingContainer = document.querySelector('#voting-results');
  if (!votingContainer) return;

  // Subscribe to real-time voting updates
  const unsubscribe = dampServices.voting.subscribeToVotingUpdates((data) => {
    if (!data) return;

    // Update voting display
    Object.entries(data.products).forEach(([productId, product]) => {
      const productElement = document.querySelector(`[data-product-id="${productId}"]`);
      if (productElement) {
        // Update vote count
        const voteCount = productElement.querySelector('.vote-count');
        if (voteCount) {
          voteCount.textContent = `${product.votes.toLocaleString()} votes`;
        }

        // Update percentage
        const percentage = productElement.querySelector('.vote-percentage');
        if (percentage) {
          percentage.textContent = `${product.percentage}%`;
        }

        // Update progress bar
        const progressBar = productElement.querySelector('.progress-fill');
        if (progressBar) {
          progressBar.style.width = `${product.percentage}%`;
        }
      }
    });

    // Update total votes
    const totalVotesElement = document.querySelector('#total-votes');
    if (totalVotesElement) {
      totalVotesElement.textContent = data.totalVotes.toLocaleString();
    }
  });

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    unsubscribe();
  });
}

// Initialize voting updates when DOM is ready
document.addEventListener('DOMContentLoaded', initializeVotingUpdates);

// =============================================================================
// AUTHENTICATION STATE MANAGEMENT
// =============================================================================

// Update UI based on authentication state
dampServices.auth.onAuthStateChange((user, loading) => {
  if (loading) return;

  // Update navigation
  const authButtons = document.querySelectorAll('.auth-button');
  const userButtons = document.querySelectorAll('.user-button');
  const loginRequired = document.querySelectorAll('.login-required');

  if (user) {
    // User is authenticated
    authButtons.forEach(btn => btn.style.display = 'none');
    userButtons.forEach(btn => btn.style.display = 'inline-block');
    loginRequired.forEach(el => el.style.display = 'block');

    // Update user display name
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(el => {
      el.textContent = user.displayName || user.email;
    });
  } else {
    // User is not authenticated
    authButtons.forEach(btn => btn.style.display = 'inline-block');
    userButtons.forEach(btn => btn.style.display = 'none');
    loginRequired.forEach(el => el.style.display = 'none');
  }
});

// =============================================================================
// CONSOLE CONFIRMATION
// =============================================================================

console.log('✅ DAMP Website integrated with unified Firebase services');
console.log('🔥 Using same Firebase Functions as mobile app');
console.log('📱 Cross-platform consistency achieved');
console.log('🎯 Website role: Information + Commerce');
console.log('📲 Mobile role: Full DAMP Experience + Cup Tracking');

export default dampServices;