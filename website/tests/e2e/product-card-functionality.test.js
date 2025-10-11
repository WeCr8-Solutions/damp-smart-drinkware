/**
 * Product Card Functionality E2E Test
 * Tests the add to cart flow for the pre-sale funnel
 */

const { test, expect } = require('@playwright/test');

test.describe('Product Card Functionality', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to pre-sale funnel page
        await page.goto('http://127.0.0.1:3000/pages/pre-sale-funnel.html');
        
        // Wait for page to be fully loaded
        await page.waitForLoadState('networkidle');
        
        // Wait for PreSaleFunnel to initialize
        await page.waitForFunction(() => window.preSaleFunnel !== undefined, {
            timeout: 5000
        });
        
        console.log('✅ Page loaded and PreSaleFunnel initialized');
    });

    test('should display all product cards with correct elements', async ({ page }) => {
        // Check that all 3 product cards are visible
        const productCards = await page.locator('.product-card').count();
        expect(productCards).toBe(3);
        
        // Check each product has required elements
        const products = ['silicone-bottom', 'damp-handle', 'cup-sleeve'];
        
        for (const productId of products) {
            const card = page.locator(`[data-product-id="${productId}"]`);
            await expect(card).toBeVisible();
            
            // Check quantity controls
            const plusBtn = page.locator(`[data-product="${productId}"].plus`);
            const minusBtn = page.locator(`[data-product="${productId}"].minus`);
            const quantity = page.locator(`[data-product="${productId}"].quantity`);
            const addBtn = page.locator(`[data-product-id="${productId}"]`).filter({ hasText: /Add.*Cart/ });
            
            await expect(plusBtn).toBeVisible();
            await expect(minusBtn).toBeVisible();
            await expect(quantity).toBeVisible();
            await expect(addBtn).toBeVisible();
            
            // Check initial quantity is 0
            const qtyText = await quantity.textContent();
            expect(qtyText.trim()).toBe('0');
            
            console.log(`✅ ${productId}: All elements visible and quantity = 0`);
        }
    });

    test('should update quantity when plus button is clicked', async ({ page }) => {
        const productId = 'silicone-bottom';
        
        // Get elements
        const plusBtn = page.locator(`[data-product="${productId}"].plus`);
        const quantity = page.locator(`[data-product="${productId}"].quantity`);
        
        // Verify initial state
        await expect(quantity).toHaveText('0');
        console.log('✅ Initial quantity: 0');
        
        // Click plus button
        await plusBtn.click();
        console.log('🖱️  Clicked plus button');
        
        // Wait a bit for the update
        await page.waitForTimeout(200);
        
        // Check if quantity updated
        const newQty = await quantity.textContent();
        console.log(`📊 New quantity: ${newQty}`);
        
        // Verify quantity changed to 1
        expect(newQty.trim()).toBe('1');
        console.log('✅ Quantity updated to 1');
        
        // Verify elements still exist and are visible
        await expect(plusBtn).toBeVisible();
        await expect(quantity).toBeVisible();
        console.log('✅ Plus button and quantity still visible after click');
    });

    test('should enable and update add to cart button when quantity > 0', async ({ page }) => {
        const productId = 'silicone-bottom';
        
        const plusBtn = page.locator(`[data-product="${productId}"].plus`);
        const addBtn = page.locator(`[data-product-id="${productId}"]`).filter({ hasText: /Add.*Cart/ });
        
        // Check initial button state
        const initialDisabled = await addBtn.isDisabled();
        const initialText = await addBtn.textContent();
        console.log(`📊 Initial button state: disabled=${initialDisabled}, text="${initialText}"`);
        
        // Click plus button
        await plusBtn.click();
        console.log('🖱️  Clicked plus button');
        
        // Wait for button to update
        await page.waitForTimeout(200);
        
        // Check button is now enabled
        const newDisabled = await addBtn.isDisabled();
        const newText = await addBtn.textContent();
        console.log(`📊 New button state: disabled=${newDisabled}, text="${newText}"`);
        
        expect(newDisabled).toBe(false);
        expect(newText).toContain('Add 1 to Cart');
        console.log('✅ Add to cart button enabled and shows correct text');
    });

    test('should not lose elements when clicking product image', async ({ page }) => {
        const productId = 'silicone-bottom';
        
        // Get elements
        const productImage = page.locator(`[data-product-id="${productId}"] .product-image`);
        const plusBtn = page.locator(`[data-product="${productId}"].plus`);
        const minusBtn = page.locator(`[data-product="${productId}"].minus`);
        const quantity = page.locator(`[data-product="${productId}"].quantity`);
        
        // Verify all visible initially
        await expect(productImage).toBeVisible();
        await expect(plusBtn).toBeVisible();
        await expect(minusBtn).toBeVisible();
        await expect(quantity).toBeVisible();
        console.log('✅ All elements visible before clicking image');
        
        // Click on the product image
        await productImage.click();
        console.log('🖱️  Clicked product image');
        
        // Wait a bit
        await page.waitForTimeout(200);
        
        // Verify all still visible
        await expect(plusBtn).toBeVisible();
        await expect(minusBtn).toBeVisible();
        await expect(quantity).toBeVisible();
        console.log('✅ All elements still visible after clicking image');
    });

    test('should add items to cart when add to cart button is clicked', async ({ page }) => {
        const productId = 'silicone-bottom';
        
        const plusBtn = page.locator(`[data-product="${productId}"].plus`);
        const quantity = page.locator(`[data-product="${productId}"].quantity`);
        const addBtn = page.locator(`[data-product-id="${productId}"]`).filter({ hasText: /Add.*Cart/ });
        
        // Increase quantity to 2
        await plusBtn.click();
        await plusBtn.click();
        await page.waitForTimeout(200);
        
        // Verify quantity is 2
        await expect(quantity).toHaveText('2');
        console.log('✅ Quantity set to 2');
        
        // Click add to cart
        await addBtn.click();
        console.log('🖱️  Clicked add to cart');
        
        await page.waitForTimeout(500);
        
        // Check that cart summary appears
        const cartSummary = page.locator('#cart-summary');
        await expect(cartSummary).toBeVisible();
        console.log('✅ Cart summary is visible');
        
        // Verify checkout button is enabled
        const checkoutBtn = page.locator('#checkout-button');
        await expect(checkoutBtn).not.toBeDisabled();
        
        const checkoutText = await checkoutBtn.textContent();
        console.log(`📊 Checkout button text: "${checkoutText}"`);
        expect(checkoutText).toContain('Checkout');
        expect(checkoutText).toContain('$');
        console.log('✅ Checkout button enabled with price');
    });

    test('should handle multiple quantity increases correctly', async ({ page }) => {
        const productId = 'damp-handle';
        
        const plusBtn = page.locator(`[data-product="${productId}"].plus`);
        const quantity = page.locator(`[data-product="${productId}"].quantity`);
        
        // Click plus button 5 times
        for (let i = 1; i <= 5; i++) {
            await plusBtn.click();
            await page.waitForTimeout(100);
            
            const currentQty = await quantity.textContent();
            console.log(`🔢 Click ${i}: quantity = ${currentQty}`);
            expect(currentQty.trim()).toBe(String(i));
        }
        
        console.log('✅ Multiple quantity increases work correctly');
    });

    test('should decrease quantity when minus button is clicked', async ({ page }) => {
        const productId = 'cup-sleeve';
        
        const plusBtn = page.locator(`[data-product="${productId}"].plus`);
        const minusBtn = page.locator(`[data-product="${productId}"].minus`);
        const quantity = page.locator(`[data-product="${productId}"].quantity`);
        
        // Increase to 3
        await plusBtn.click();
        await plusBtn.click();
        await plusBtn.click();
        await page.waitForTimeout(200);
        
        await expect(quantity).toHaveText('3');
        console.log('✅ Quantity increased to 3');
        
        // Decrease by 1
        await minusBtn.click();
        await page.waitForTimeout(100);
        
        await expect(quantity).toHaveText('2');
        console.log('✅ Quantity decreased to 2');
        
        // Verify elements still visible
        await expect(plusBtn).toBeVisible();
        await expect(minusBtn).toBeVisible();
        await expect(quantity).toBeVisible();
        console.log('✅ All elements still visible after decrease');
    });

    test('should not go below 0 when minus is clicked at 0', async ({ page }) => {
        const productId = 'silicone-bottom';
        
        const minusBtn = page.locator(`[data-product="${productId}"].minus`);
        const quantity = page.locator(`[data-product="${productId}"].quantity`);
        
        // Verify starts at 0
        await expect(quantity).toHaveText('0');
        
        // Try to decrease
        await minusBtn.click();
        await page.waitForTimeout(100);
        
        // Should still be 0
        await expect(quantity).toHaveText('0');
        console.log('✅ Quantity stays at 0 when decreasing from 0');
    });

    test('should reset quantity display after adding to cart', async ({ page }) => {
        const productId = 'damp-handle';
        
        const plusBtn = page.locator(`[data-product="${productId}"].plus`);
        const quantity = page.locator(`[data-product="${productId}"].quantity`);
        const addBtn = page.locator(`[data-product-id="${productId}"]`).filter({ hasText: /Add.*Cart/ });
        
        // Set quantity to 3
        await plusBtn.click();
        await plusBtn.click();
        await plusBtn.click();
        await page.waitForTimeout(200);
        
        await expect(quantity).toHaveText('3');
        console.log('✅ Quantity set to 3');
        
        // Add to cart
        await addBtn.click();
        await page.waitForTimeout(500);
        
        // Quantity should reset to 0
        await expect(quantity).toHaveText('0');
        console.log('✅ Quantity reset to 0 after adding to cart');
        
        // Button should show "Add More to Cart"
        const buttonText = await addBtn.textContent();
        expect(buttonText).toContain('Add More');
        console.log('✅ Button shows "Add More to Cart"');
    });
});

test.describe('Product Card Visual Regression', () => {
    test('product cards should not disappear or change layout on interaction', async ({ page }) => {
        await page.goto('http://127.0.0.1:3000/pages/pre-sale-funnel.html');
        await page.waitForLoadState('networkidle');
        await page.waitForFunction(() => window.preSaleFunnel !== undefined);
        
        const productId = 'silicone-bottom';
        const card = page.locator(`[data-product-id="${productId}"]`);
        
        // Get initial bounding box
        const initialBox = await card.boundingBox();
        console.log('📏 Initial card dimensions:', initialBox);
        
        // Click plus button
        const plusBtn = page.locator(`[data-product="${productId}"].plus`);
        await plusBtn.click();
        await page.waitForTimeout(200);
        
        // Get new bounding box
        const newBox = await card.boundingBox();
        console.log('📏 After click card dimensions:', newBox);
        
        // Verify card dimensions haven't changed significantly
        expect(Math.abs(newBox.width - initialBox.width)).toBeLessThan(5);
        expect(Math.abs(newBox.height - initialBox.height)).toBeLessThan(5);
        
        console.log('✅ Card layout remained stable after interaction');
    });
});

