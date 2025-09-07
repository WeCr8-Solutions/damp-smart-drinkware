/**
 * 🛒 DAMP Smart Drinkware - Unified Purchasing Service
 * Cross-platform purchasing system for products and subscriptions
 * Works on both web and mobile platforms with Stripe integration
 */

import { FeatureFlags } from '@/config/feature-flags';
import { auth, db } from '@/firebase/config';
import FirebaseStripeService from './firebase-stripe';

// Mock implementations for when Firebase is disabled
let getDoc: any, setDoc: any, updateDoc: any, doc: any, collection: any, addDoc: any, serverTimestamp: any;

if (FeatureFlags.FIREBASE) {
  try {
    const firestore = require('firebase/firestore');
    getDoc = firestore.getDoc;
    setDoc = firestore.setDoc;
    updateDoc = firestore.updateDoc;
    doc = firestore.doc;
    collection = firestore.collection;
    addDoc = firestore.addDoc;
    serverTimestamp = firestore.serverTimestamp;
  } catch (error) {
    console.warn('Firebase Firestore not available - using mocks');
    getDoc = () => Promise.resolve({ exists: () => false });
    setDoc = () => Promise.resolve();
    updateDoc = () => Promise.resolve();
    doc = () => ({});
    collection = () => ({});
    addDoc = () => Promise.resolve({ id: 'mock-id' });
    serverTimestamp = () => new Date();
  }
} else {
  getDoc = () => Promise.resolve({ exists: () => false });
  setDoc = () => Promise.resolve();
  updateDoc = () => Promise.resolve();
  doc = () => ({});
  collection = () => ({});
  addDoc = () => Promise.resolve({ id: 'mock-id' });
  serverTimestamp = () => new Date();
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'handle' | 'silicone-bottom' | 'cup-sleeve' | 'baby-bottle';
  images: string[];
  features: string[];
  stripePriceId: string;
  isAvailable: boolean;
  isPreOrder: boolean;
  estimatedShipping?: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface Order {
  id: string;
  userId?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  stripeSessionId?: string;
  trackingNumber?: string;
  createdAt: any;
  updatedAt: any;
}

export interface PreOrderData {
  email: string;
  productId: string;
  modelVersion: string;
  color: string;
  quantity: number;
  estimatedPrice: number;
  timestamp: any;
  platform: 'web' | 'mobile';
}

class PurchasingService {
  private cart: CartItem[] = [];

  /**
   * Get available products
   */
  async getProducts(): Promise<Product[]> {
    if (!FeatureFlags.FIREBASE) return [];

    try {
      const productsDoc = await getDoc(doc(db, 'store', 'products'));
      if (productsDoc.exists()) {
        const data = productsDoc.data();
        return Object.values(data.products || {}) as Product[];
      }

      // Initialize with default products if not exists
      const defaultProducts: Record<string, Product> = {
        'damp-handle-universal': {
          id: 'damp-handle-universal',
          name: 'DAMP Handle - Universal',
          description: 'Universal clip-on handle for any drinkware with smart temperature monitoring',
          price: 49.99,
          category: 'handle',
          images: ['/assets/images/products/handle/universal-main.jpg'],
          features: [
            'Universal clip-on design',
            'Temperature monitoring',
            'Bluetooth connectivity',
            'Mobile app integration',
            '30-day battery life'
          ],
          stripePriceId: 'price_handle_universal',
          isAvailable: false,
          isPreOrder: true,
          estimatedShipping: 'Q2 2025'
        },
        'silicone-bottom-v1': {
          id: 'silicone-bottom-v1',
          name: 'Silicone Bottom v1.0',
          description: 'Non-slip smart base for bottles and tumblers with hydration tracking',
          price: 34.99,
          category: 'silicone-bottom',
          images: ['/assets/images/products/silicone-bottom/v1-main.jpg'],
          features: [
            'Non-slip silicone base',
            'Hydration tracking',
            'Wireless charging pad',
            'Universal fit',
            'Water-resistant'
          ],
          stripePriceId: 'price_silicone_bottom_v1',
          isAvailable: false,
          isPreOrder: true,
          estimatedShipping: 'Q3 2025'
        },
        'cup-sleeve-adjustable': {
          id: 'cup-sleeve-adjustable',
          name: 'Cup Sleeve - Adjustable',
          description: 'Adjustable smart sleeve with thermal insulation and drink tracking',
          price: 39.99,
          category: 'cup-sleeve',
          images: ['/assets/images/products/cup-sleeve/adjustable-main.jpg'],
          features: [
            'Adjustable sizing',
            'Thermal insulation',
            'Drink temperature alerts',
            'Spill detection',
            'Easy cleaning'
          ],
          stripePriceId: 'price_cup_sleeve_adjustable',
          isAvailable: false,
          isPreOrder: true,
          estimatedShipping: 'Q4 2025'
        },
        'baby-bottle-smart': {
          id: 'baby-bottle-smart',
          name: 'Smart Baby Bottle v1.0',
          description: 'Smart baby bottle with feeding tracking and temperature monitoring',
          price: 59.99,
          category: 'baby-bottle',
          images: ['/assets/images/products/baby-bottle/smart-main.jpg'],
          features: [
            'Feeding time tracking',
            'Temperature monitoring',
            'Volume measurement',
            'Parent app notifications',
            'BPA-free materials'
          ],
          stripePriceId: 'price_baby_bottle_smart',
          isAvailable: false,
          isPreOrder: true,
          estimatedShipping: 'Q1 2026'
        }
      };

      await setDoc(doc(db, 'store', 'products'), {
        products: defaultProducts,
        lastUpdated: serverTimestamp()
      });

      return Object.values(defaultProducts);
    } catch (error) {
      console.error('Get products error:', error);
      return [];
    }
  }

  /**
   * Get single product by ID
   */
  async getProduct(productId: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find(p => p.id === productId) || null;
  }

  /**
   * Add item to cart
   */
  addToCart(item: CartItem): void {
    const existingIndex = this.cart.findIndex(
      cartItem => cartItem.productId === item.productId &&
                  cartItem.selectedColor === item.selectedColor &&
                  cartItem.selectedSize === item.selectedSize
    );

    if (existingIndex >= 0) {
      this.cart[existingIndex].quantity += item.quantity;
    } else {
      this.cart.push(item);
    }
  }

  /**
   * Remove item from cart
   */
  removeFromCart(productId: string, selectedColor?: string, selectedSize?: string): void {
    this.cart = this.cart.filter(
      item => !(item.productId === productId &&
               item.selectedColor === selectedColor &&
               item.selectedSize === selectedSize)
    );
  }

  /**
   * Update cart item quantity
   */
  updateCartItemQuantity(productId: string, quantity: number, selectedColor?: string, selectedSize?: string): void {
    const item = this.cart.find(
      cartItem => cartItem.productId === productId &&
                  cartItem.selectedColor === selectedColor &&
                  cartItem.selectedSize === selectedSize
    );

    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId, selectedColor, selectedSize);
      } else {
        item.quantity = quantity;
      }
    }
  }

  /**
   * Get current cart
   */
  getCart(): CartItem[] {
    return [...this.cart];
  }

  /**
   * Clear cart
   */
  clearCart(): void {
    this.cart = [];
  }

  /**
   * Calculate cart totals
   */
  calculateCartTotals(): { subtotal: number; tax: number; shipping: number; total: number } {
    const subtotal = this.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const tax = subtotal * 0.08; // 8% tax rate
    const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
    const total = subtotal + tax + shipping;

    return {
      subtotal: Number(subtotal.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      shipping: Number(shipping.toFixed(2)),
      total: Number(total.toFixed(2))
    };
  }

  /**
   * Create order
   */
  async createOrder(shippingAddress: ShippingAddress, billingAddress?: ShippingAddress): Promise<{ success: boolean; orderId?: string; error?: string }> {
    if (!FeatureFlags.FIREBASE) {
      return { success: false, error: 'Firebase disabled' };
    }

    if (this.cart.length === 0) {
      return { success: false, error: 'Cart is empty' };
    }

    try {
      const totals = this.calculateCartTotals();
      const order: Omit<Order, 'id'> = {
        userId: auth.currentUser?.uid,
        items: [...this.cart],
        subtotal: totals.subtotal,
        tax: totals.tax,
        shipping: totals.shipping,
        total: totals.total,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const orderRef = await addDoc(collection(db, 'orders'), order);

      return { success: true, orderId: orderRef.id };
    } catch (error) {
      console.error('Create order error:', error);
      return { success: false, error: 'Failed to create order' };
    }
  }

  /**
   * Submit pre-order
   */
  async submitPreOrder(preOrderData: PreOrderData): Promise<{ success: boolean; error?: string }> {
    if (!FeatureFlags.FIREBASE) {
      return { success: false, error: 'Firebase disabled' };
    }

    try {
      const preOrder = {
        ...preOrderData,
        timestamp: serverTimestamp(),
        platform: 'mobile' as const,
        userId: auth.currentUser?.uid
      };

      await addDoc(collection(db, 'preOrders'), preOrder);

      return { success: true };
    } catch (error) {
      console.error('Submit pre-order error:', error);
      return { success: false, error: 'Failed to submit pre-order' };
    }
  }

  /**
   * Get user's orders
   */
  async getUserOrders(): Promise<Order[]> {
    if (!FeatureFlags.FIREBASE || !auth.currentUser) return [];

    try {
      // This would typically use a query to get user's orders
      // For now, return empty array as we'd need to implement proper querying
      return [];
    } catch (error) {
      console.error('Get user orders error:', error);
      return [];
    }
  }

  /**
   * Initiate Stripe checkout for cart
   */
  async initiateCheckout(shippingAddress: ShippingAddress): Promise<{ success: boolean; error?: string }> {
    if (!FeatureFlags.STRIPE) {
      return { success: false, error: 'Stripe disabled' };
    }

    if (this.cart.length === 0) {
      return { success: false, error: 'Cart is empty' };
    }

    try {
      // Create order first
      const orderResult = await this.createOrder(shippingAddress);
      if (!orderResult.success) {
        return { success: false, error: orderResult.error };
      }

      // Convert cart items to Stripe line items
      const lineItems = this.cart.map(item => ({
        price: item.product.stripePriceId,
        quantity: item.quantity
      }));

      // Use Firebase Stripe service to create checkout session
      const checkoutResult = await FirebaseStripeService.createStoreCheckout(lineItems, orderResult.orderId!);

      if (checkoutResult.success && checkoutResult.url) {
        // Clear cart on successful checkout initiation
        this.clearCart();
        return { success: true };
      } else {
        return { success: false, error: checkoutResult.error || 'Failed to create checkout session' };
      }
    } catch (error) {
      console.error('Initiate checkout error:', error);
      return { success: false, error: 'Failed to initiate checkout' };
    }
  }

  /**
   * Handle successful purchase
   */
  async handlePurchaseSuccess(sessionId: string): Promise<{ success: boolean; error?: string }> {
    if (!FeatureFlags.FIREBASE) {
      return { success: false, error: 'Firebase disabled' };
    }

    try {
      // This would typically verify the payment with Stripe and update the order
      // For now, just return success
      return { success: true };
    } catch (error) {
      console.error('Handle purchase success error:', error);
      return { success: false, error: 'Failed to process purchase success' };
    }
  }
}

export default new PurchasingService();