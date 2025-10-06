/**
 * DAMP Smart Drinkware Checkout Funnel
 * Handles cart management, Firebase integration, and Stripe checkout
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDoc, doc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { loadStripe } from '@stripe/stripe-js';

class CheckoutFunnel {
    constructor(firebaseConfig) {
        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        this.db = getFirestore(app);
        this.functions = getFunctions(app);

        // Initialize cart
        this.cart = {
            items: [],
            total: 0
        };

        // Initialize Stripe
        this.initializeStripe();
    }

    async initializeStripe() {
        this.stripe = await loadStripe(process.env.STRIPE_PUBLISHABLE_KEY);
    }

    // Product Management Methods
    addToCart(product) {
        const existingItem = this.cart.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.cart.items.push({...product, quantity: 1});
        }
        
        this.updateCartTotal();
    }

    removeFromCart(productId) {
        this.cart.items = this.cart.items.filter(item => item.id !== productId);
        this.updateCartTotal();
    }

    updateQuantity(productId, quantity) {
        const item = this.cart.items.find(item => item.id === productId);
        if (item) {
            item.quantity = quantity;
            this.updateCartTotal();
        }
    }

    updateCartTotal() {
        this.cart.total = this.cart.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    // Firebase Integration Methods
    async saveOrder(userId) {
        try {
            const orderData = {
                items: this.cart.items,
                total: this.cart.total,
                status: 'pending',
                userId,
                createdAt: new Date()
            };

            const orderRef = await addDoc(collection(this.db, 'orders'), orderData);
            return orderRef.id;
        } catch (error) {
            console.error('Error saving order:', error);
            throw error;
        }
    }

    async getProduct(productId) {
        try {
            const productDoc = await getDoc(doc(this.db, 'products', productId));
            if (productDoc.exists()) {
                return productDoc.data();
            }
            throw new Error('Product not found');
        } catch (error) {
            console.error('Error getting product:', error);
            throw error;
        }
    }

    // Stripe Integration Methods
    async createCheckoutSession() {
        try {
            const createStripeCheckout = httpsCallable(this.functions, 'createStripeCheckout');
            const { data } = await createStripeCheckout({
                items: this.cart.items,
                total: this.cart.total
            });
            return data.sessionId;
        } catch (error) {
            console.error('Error creating checkout session:', error);
            throw error;
        }
    }

    async redirectToCheckout(sessionId) {
        try {
            await this.stripe.redirectToCheckout({
                sessionId
            });
        } catch (error) {
            console.error('Error redirecting to checkout:', error);
            throw error;
        }
    }

    async processCheckout(userId) {
        try {
            // Save order to Firestore
            const orderId = await this.saveOrder(userId);
            
            // Create Stripe checkout session
            const sessionId = await this.createCheckoutSession();
            
            // Redirect to Stripe checkout
            await this.redirectToCheckout(sessionId);
            
            return { orderId, sessionId };
        } catch (error) {
            console.error('Error processing checkout:', error);
            throw error;
        }
    }
}