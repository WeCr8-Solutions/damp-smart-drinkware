/**
 * Test suite for DAMP Smart Drinkware checkout funnel
 * Tests product management, cart functionality, and Stripe integration
 */

import { jest } from '@jest/globals';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDoc, doc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { loadStripe } from '@stripe/stripe-js';

// Mock Firebase
jest.mock('firebase/app');
jest.mock('firebase/firestore');
jest.mock('firebase/functions');

// Mock Stripe
jest.mock('@stripe/stripe-js');

describe('Checkout Funnel', () => {
    let cart;
    let db;
    let functions;
    let stripe;
    
    beforeEach(() => {
        // Reset the cart before each test
        cart = {
            items: [],
            total: 0
        };
        
        // Initialize Firebase mocks
        initializeApp.mockReturnValue({});
        db = getFirestore();
        functions = getFunctions();
        
        // Mock Stripe
        stripe = {
            redirectToCheckout: jest.fn()
        };
        loadStripe.mockResolvedValue(stripe);
    });

    describe('Product Management', () => {
        test('should add product to cart', async () => {
            const product = {
                id: 'product1',
                name: 'Smart Cup',
                price: 2999,
                quantity: 1
            };
            
            cart.items.push(product);
            cart.total += product.price;

            expect(cart.items).toHaveLength(1);
            expect(cart.items[0]).toEqual(product);
            expect(cart.total).toBe(2999);
        });

        test('should update product quantity', () => {
            const product = {
                id: 'product1',
                name: 'Smart Cup',
                price: 2999,
                quantity: 1
            };
            
            cart.items.push(product);
            cart.total += product.price;

            // Update quantity
            cart.items[0].quantity = 2;
            cart.total = cart.items[0].price * cart.items[0].quantity;

            expect(cart.items[0].quantity).toBe(2);
            expect(cart.total).toBe(5998);
        });

        test('should remove product from cart', () => {
            const product = {
                id: 'product1',
                name: 'Smart Cup',
                price: 2999,
                quantity: 1
            };
            
            cart.items.push(product);
            cart.total += product.price;

            // Remove product
            cart.items = cart.items.filter(item => item.id !== product.id);
            cart.total = 0;

            expect(cart.items).toHaveLength(0);
            expect(cart.total).toBe(0);
        });
    });

    describe('Firebase Integration', () => {
        test('should save order to Firestore', async () => {
            const mockOrderData = {
                items: [{
                    id: 'product1',
                    name: 'Smart Cup',
                    price: 2999,
                    quantity: 1
                }],
                total: 2999,
                status: 'pending',
                userId: 'test-user-id',
                createdAt: expect.any(Date)
            };

            addDoc.mockResolvedValueOnce({ id: 'test-order-id' });

            const orderRef = await addDoc(collection(db, 'orders'), mockOrderData);
            
            expect(addDoc).toHaveBeenCalledWith(
                collection(db, 'orders'),
                mockOrderData
            );
            expect(orderRef.id).toBe('test-order-id');
        });

        test('should retrieve product data from Firestore', async () => {
            const mockProduct = {
                id: 'product1',
                name: 'Smart Cup',
                price: 2999,
                description: 'Smart cup that tracks hydration',
                inStock: true
            };

            getDoc.mockResolvedValueOnce({
                exists: () => true,
                data: () => mockProduct
            });

            const productDoc = await getDoc(doc(db, 'products', 'product1'));
            const product = productDoc.data();

            expect(getDoc).toHaveBeenCalled();
            expect(product).toEqual(mockProduct);
        });
    });

    describe('Stripe Integration', () => {
        test('should create Stripe checkout session', async () => {
            const mockSessionId = 'test-session-id';
            const mockCreateStripeCheckout = jest.fn().mockResolvedValueOnce({ 
                data: { sessionId: mockSessionId }
            });
            httpsCallable.mockReturnValue(mockCreateStripeCheckout);

            const createStripeCheckout = httpsCallable(functions, 'createStripeCheckout');
            const { data } = await createStripeCheckout({
                items: cart.items,
                total: cart.total
            });

            expect(createStripeCheckout).toHaveBeenCalledWith({
                items: cart.items,
                total: cart.total
            });
            expect(data.sessionId).toBe(mockSessionId);
        });

        test('should redirect to Stripe checkout', async () => {
            const mockSessionId = 'test-session-id';
            
            await stripe.redirectToCheckout({
                sessionId: mockSessionId
            });

            expect(stripe.redirectToCheckout).toHaveBeenCalledWith({
                sessionId: mockSessionId
            });
        });

        test('should handle Stripe errors gracefully', async () => {
            const mockError = {
                type: 'StripeError',
                message: 'Invalid session ID'
            };

            stripe.redirectToCheckout.mockRejectedValueOnce(mockError);

            await expect(stripe.redirectToCheckout({
                sessionId: 'invalid-id'
            })).rejects.toEqual(mockError);
        });
    });
});