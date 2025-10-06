/**
 * DAMP Smart Drinkware - Cart Management System
 */

class DAMPCartManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('dampCart') || '[]');
        this.init();
    }

    init() {
        this.renderCart();
        this.setupEventListeners();
        this.updateOrderSummary();
        console.log('Cart Manager initialized');
    }

    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            // Setup checkout button
            const checkoutBtn = document.querySelector('.btn-primary.btn-lg');
            if (checkoutBtn) {
                checkoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.proceedToCheckout();
                });
            }

            // Setup continue shopping button
            const continueBtn = document.querySelector('.btn-secondary');
            if (continueBtn) {
                continueBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = '/pages/store.html';
                });
            }

            // Setup promo code button
            const promoBtn = document.querySelector('.promo-code-apply');
            if (promoBtn) {
                promoBtn.addEventListener('click', () => this.applyPromoCode());
            }
        });

        // Listen for "Add to Cart" events
        window.addEventListener('addToCart', (event) => {
            const product = event.detail;
            this.addItem(product);
        });
    }

    addItem(product) {
        const existingItem = this.cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }

        this.saveCart();
        this.renderCart();
        this.updateOrderSummary();

        // Track add to cart event
        if (typeof gtag !== 'undefined') {
            gtag('event', 'add_to_cart', {
                currency: 'USD',
                value: product.price,
                items: [{
                    item_id: product.id,
                    item_name: product.name,
                    category: 'Smart Drinkware',
                    quantity: 1,
                    price: product.price
                }]
            });
        }
    }

    updateQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeItem(productId);
            return;
        }

        const itemIndex = this.cart.findIndex(item => item.id === productId);
        if (itemIndex !== -1) {
            this.cart[itemIndex].quantity = newQuantity;
            this.saveCart();
            this.renderCart();
            this.updateOrderSummary();

            // Track quantity update
            if (typeof gtag !== 'undefined') {
                gtag('event', 'modify_cart', {
                    currency: 'USD',
                    value: this.cart[itemIndex].price * newQuantity,
                    items: [{
                        item_id: productId,
                        item_name: this.cart[itemIndex].name,
                        category: 'Smart Drinkware',
                        quantity: newQuantity,
                        price: this.cart[itemIndex].price
                    }]
                });
            }
        }
    }

    removeItem(productId) {
        const itemIndex = this.cart.findIndex(item => item.id === productId);
        if (itemIndex !== -1) {
            const item = this.cart[itemIndex];
            this.cart = this.cart.filter(item => item.id !== productId);
            this.saveCart();
            this.renderCart();
            this.updateOrderSummary();

            // Track remove from cart
            if (typeof gtag !== 'undefined') {
                gtag('event', 'remove_from_cart', {
                    currency: 'USD',
                    value: item.price * item.quantity,
                    items: [{
                        item_id: item.id,
                        item_name: item.name,
                        category: 'Smart Drinkware',
                        quantity: item.quantity,
                        price: item.price
                    }]
                });
            }
        }
    }

    renderCart() {
        const cartContainer = document.getElementById('cart-items');
        const emptyCart = document.getElementById('empty-cart');

        if (!cartContainer || !emptyCart) return;

        if (this.cart.length === 0) {
            cartContainer.classList.add('hidden');
            emptyCart.classList.remove('hidden');
            return;
        }

        emptyCart.classList.add('hidden');
        cartContainer.classList.remove('hidden');

        const cartHTML = this.cart.map(item => `
            <div class="cart-item" data-product-id="${item.id}">
                <div class="flex items-center gap-4 p-4 border rounded-lg">
                    <img src="${item.image || '../assets/images/products/' + item.id + '/' + item.id + '.png'}"
                         alt="${item.name}"
                         class="w-20 h-20 object-cover rounded">

                    <div class="flex-1">
                        <h3 class="font-semibold text-lg">${item.name}</h3>
                        <p class="text-secondary text-sm">${item.description || 'Smart drinkware accessory'}</p>
                        <div class="flex items-center gap-4 mt-2">
                            <span class="font-bold text-primary">$${item.price}</span>
                            <div class="quantity-controls flex items-center gap-2">
                                <button onclick="window.cartManager.updateQuantity('${item.id}', ${item.quantity - 1})"
                                        class="btn-sm bg-gray-200 hover:bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center">-</button>
                                <span class="quantity px-3 py-1 bg-gray-100 rounded">${item.quantity}</span>
                                <button onclick="window.cartManager.updateQuantity('${item.id}', ${item.quantity + 1})"
                                        class="btn-sm bg-gray-200 hover:bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center">+</button>
                            </div>
                        </div>
                    </div>

                    <div class="text-right">
                        <div class="font-bold text-lg">$${(item.price * item.quantity).toFixed(2)}</div>
                        <button onclick="window.cartManager.removeItem('${item.id}')"
                                class="text-red-500 hover:text-red-700 text-sm mt-1">Remove</button>
                    </div>
                </div>
            </div>
        `).join('');

        cartContainer.innerHTML = cartHTML;
    }

    updateOrderSummary() {
        const subtotalEl = document.getElementById('subtotal');
        const shippingEl = document.getElementById('shipping');
        const taxEl = document.getElementById('tax');
        const totalEl = document.getElementById('total');

        if (!subtotalEl || !shippingEl || !taxEl || !totalEl) return;

        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
        const tax = subtotal * 0.08; // 8% tax
        const total = subtotal + shipping + tax;

        subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        shippingEl.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
        taxEl.textContent = `$${tax.toFixed(2)}`;
        totalEl.textContent = `$${total.toFixed(2)}`;
    }

    async proceedToCheckout() {
        if (this.cart.length === 0) {
            alert('Your cart is empty. Please add some products first.');
            return;
        }

        const checkoutBtn = document.querySelector('.btn-primary.btn-lg');
        const originalText = checkoutBtn.textContent;

        try {
            checkoutBtn.disabled = true;
            checkoutBtn.textContent = 'Processing...';

            // Prepare line items for Stripe
            const lineItems = this.cart.map(item => ({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name,
                        description: item.description || 'DAMP Smart Drinkware Product',
                        images: [item.image || `https://dampdrink.com/assets/images/products/${item.id}/${item.id}.png`]
                    },
                    unit_amount: Math.round(item.price * 100) // Convert to cents
                },
                quantity: item.quantity
            }));

            // Create checkout session
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    line_items: lineItems,
                    mode: 'payment',
                    success_url: `${window.location.origin}/pages/order-success.html?session_id={CHECKOUT_SESSION_ID}`,
                    cancel_url: `${window.location.origin}/pages/cart.html`,
                    metadata: {
                        source: 'cart_checkout',
                        item_count: this.cart.length.toString(),
                        total_items: this.cart.reduce((sum, item) => sum + item.quantity, 0).toString()
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create checkout session');
            }

            const { sessionId } = await response.json();

            // Track checkout initiation
            if (typeof gtag !== 'undefined') {
                gtag('event', 'begin_checkout', {
                    currency: 'USD',
                    value: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                    items: this.cart.map(item => ({
                        item_id: item.id,
                        item_name: item.name,
                        category: 'Smart Drinkware',
                        quantity: item.quantity,
                        price: item.price
                    }))
                });
            }

            // Redirect to Stripe Checkout
            const stripe = Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
            const { error } = await stripe.redirectToCheckout({ sessionId });

            if (error) {
                throw new Error(error.message);
            }

        } catch (error) {
            console.error('Checkout error:', error);
            alert('Unable to process checkout. Please try again or contact support.');
        } finally {
            checkoutBtn.disabled = false;
            checkoutBtn.textContent = originalText;
        }
    }

    applyPromoCode() {
        const promoInput = document.querySelector('.promo-code-input');
        const promoCode = promoInput.value.trim().toUpperCase();

        // Valid promo codes
        const promoCodes = {
            'EARLY20': { discount: 0.20, description: '20% off early bird discount' },
            'SAVE10': { discount: 0.10, description: '10% off your order' },
            'FIRST500': { discount: 0.15, description: '15% off for first 500 customers' }
        };

        if (promoCodes[promoCode]) {
            const promo = promoCodes[promoCode];
            alert(`✅ Promo code applied! ${promo.description}`);
            // Apply discount logic here
            this.updateOrderSummary();

            // Track promo code usage
            if (typeof gtag !== 'undefined') {
                gtag('event', 'apply_promo_code', {
                    promo_code: promoCode,
                    discount_value: promoCodes[promoCode].discount
                });
            }
        } else {
            alert('❌ Invalid promo code. Please try again.');
        }

        promoInput.value = '';
    }

    saveCart() {
        localStorage.setItem('dampCart', JSON.stringify(this.cart));
        this.updateCartBadge();
    }

    updateCartBadge() {
        const cartBadge = document.querySelector('.cart-badge');
        if (cartBadge) {
            const itemCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartBadge.textContent = itemCount;
            cartBadge.style.display = itemCount > 0 ? 'block' : 'none';
        }
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.renderCart();
        this.updateOrderSummary();

        // Track clear cart
        if (typeof gtag !== 'undefined') {
            gtag('event', 'clear_cart');
        }
    }

    getCartTotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    getItemCount() {
        return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    getCartItems() {
        return [...this.cart];
    }
}

// Initialize cart when page loads
window.cartManager = new DAMPCartManager();