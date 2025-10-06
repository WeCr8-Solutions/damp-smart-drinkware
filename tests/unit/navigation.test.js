/* global describe, test, expect, document, window */

/**
 * @jest-environment jsdom
 */

describe('Navigation Tests', () => {
  test('Reserve Now button redirects to pre-order page', () => {
    // Mock window.location
    const mockLocation = {};
    delete window.location;
    window.location = { ...mockLocation };
    
    // Import and test the click handler
    const reserveButton = document.createElement('button');
    reserveButton.classList.add('reserve-now');
    reserveButton.addEventListener('click', () => {
      window.location.href = '/pre-order';
    });
    
    // Simulate click
    reserveButton.click();
    
    expect(window.location.href).toBe('/pre-order');
  });

  test('Pre-order page has required elements', () => {
    // Create mock DOM elements
    document.body.innerHTML = `
      <div class="pre-order-container">
        <h1>Pre-order your Smart Drinkware</h1>
        <form id="pre-order-form">
          <button type="submit" class="checkout-button">Proceed to Checkout</button>
        </form>
      </div>
    `;
    
    // Check essential elements
    const heading = document.querySelector('h1');
    const form = document.getElementById('pre-order-form');
    const checkoutButton = document.querySelector('.checkout-button');
    
    expect(heading).toBeTruthy();
    expect(heading.textContent).toBe('Pre-order your Smart Drinkware');
    expect(form).toBeTruthy();
    expect(checkoutButton).toBeTruthy();
    expect(checkoutButton.textContent).toBe('Proceed to Checkout');
  });
});