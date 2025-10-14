class DAMPFooter extends HTMLElement {
    constructor() {
        super();
        this.isSubPage = false;
        this.basePath = '';
    }

    connectedCallback() {
        this.detectPageContext();
        this.render();
    }

    detectPageContext() {
        const pathname = window.location.pathname;
        this.isSubPage = pathname.includes('/pages/');
        this.basePath = this.isSubPage ? '../' : '';
    }

    render() {
        this.innerHTML = `
            <footer style="background: var(--bg-primary); padding: 60px 20px 30px; border-top: 1px solid var(--border-color); margin-top: 80px;">
                <div class="container" style="max-width: 1200px; margin: 0 auto;">
                    <!-- Logo and Tagline -->
                    <div style="text-align: center; margin-bottom: 50px;">
                        <div style="display: inline-flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                            <img src="${this.basePath}assets/images/logo/icon.png" alt="DAMP Logo" style="width: 48px; height: 48px;">
                            <h2 style="color: var(--text-primary); font-size: 1.75rem; margin: 0;">DAMP Smart Drinkware</h2>
                        </div>
                        <p style="color: var(--text-secondary); font-size: 1.1rem; line-height: 1.6; max-width: 700px; margin: 0 auto;">
                            <strong style="color: #00d4ff;">Make any cup smart.</strong> Universal smart drinkware attachments that work with YETI, Stanley, Hydro Flask, and all bottles. Don't replace it—upgrade it.
                        </p>
                    </div>

                    <!-- Quick Links Grid -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 40px; margin-bottom: 50px;">
                        <!-- Products -->
                        <div>
                            <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 1.125rem; font-weight: 600;">Products</h3>
                            <a href="${this.basePath}pages/products.html" style="display: block; color: var(--text-secondary); margin-bottom: 12px; text-decoration: none; transition: color 0.3s ease;" onmouseover="this.style.color='#00d4ff'" onmouseout="this.style.color='var(--text-secondary)'">All Products</a>
                            <a href="${this.basePath}pages/damp-handle-v1.0.html" style="display: block; color: var(--text-secondary); margin-bottom: 12px; text-decoration: none; transition: color 0.3s ease;" onmouseover="this.style.color='#00d4ff'" onmouseout="this.style.color='var(--text-secondary)'">DAMP Handle</a>
                            <a href="${this.basePath}pages/silicone-bottom-v1.0.html" style="display: block; color: var(--text-secondary); margin-bottom: 12px; text-decoration: none; transition: color 0.3s ease;" onmouseover="this.style.color='#00d4ff'" onmouseout="this.style.color='var(--text-secondary)'">Silicone Bottom</a>
                            <a href="${this.basePath}pages/cup-sleeve-v1.0.html" style="display: block; color: var(--text-secondary); text-decoration: none; transition: color 0.3s ease;" onmouseover="this.style.color='#00d4ff'" onmouseout="this.style.color='var(--text-secondary)'">Cup Sleeve</a>
                        </div>
                        
                        <!-- Community -->
                        <div>
                            <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 1.125rem; font-weight: 600;">Community</h3>
                            <a href="${this.basePath}pages/product-voting.html" style="display: block; color: var(--text-secondary); margin-bottom: 12px; text-decoration: none; transition: color 0.3s ease;" onmouseover="this.style.color='#00d4ff'" onmouseout="this.style.color='var(--text-secondary)'">Product Voting</a>
                            <a href="${this.basePath}pages/pre-sale-funnel.html" style="display: block; color: var(--text-secondary); margin-bottom: 12px; text-decoration: none; transition: color 0.3s ease;" onmouseover="this.style.color='#00d4ff'" onmouseout="this.style.color='var(--text-secondary)'">Pre-Sale Funnel</a>
                            <a href="${this.basePath}pages/support.html#contact" style="display: block; color: var(--text-secondary); text-decoration: none; transition: color 0.3s ease;" onmouseover="this.style.color='#00d4ff'" onmouseout="this.style.color='var(--text-secondary)'">Contact Us</a>
                        </div>
                        
                        <!-- Company -->
                        <div>
                            <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 1.125rem; font-weight: 600;">Company</h3>
                            <a href="${this.basePath}pages/about.html" style="display: block; color: var(--text-secondary); margin-bottom: 12px; text-decoration: none; transition: color 0.3s ease;" onmouseover="this.style.color='#00d4ff'" onmouseout="this.style.color='var(--text-secondary)'">About Us</a>
                            <a href="${this.basePath}pages/press.html" style="display: block; color: var(--text-secondary); margin-bottom: 12px; text-decoration: none; transition: color 0.3s ease;" onmouseover="this.style.color='#00d4ff'" onmouseout="this.style.color='var(--text-secondary)'">Press & Media</a>
                            <a href="${this.basePath}pages/damp-drinking-meaning.html" style="display: block; color: var(--text-secondary); text-decoration: none; transition: color 0.3s ease;" onmouseover="this.style.color='#00d4ff'" onmouseout="this.style.color='var(--text-secondary)'">DAMP Lifestyle</a>
                        </div>
                        
                        <!-- Support -->
                        <div>
                            <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 1.125rem; font-weight: 600;">Support</h3>
                            <a href="${this.basePath}pages/support.html" style="display: block; color: var(--text-secondary); margin-bottom: 12px; text-decoration: none; transition: color 0.3s ease;" onmouseover="this.style.color='#00d4ff'" onmouseout="this.style.color='var(--text-secondary)'">Help Center</a>
                            <a href="${this.basePath}pages/support.html#faq" style="display: block; color: var(--text-secondary); margin-bottom: 12px; text-decoration: none; transition: color 0.3s ease;" onmouseover="this.style.color='#00d4ff'" onmouseout="this.style.color='var(--text-secondary)'">FAQ</a>
                            <a href="${this.basePath}pages/how-it-works.html" style="display: block; color: var(--text-secondary); margin-bottom: 12px; text-decoration: none; transition: color 0.3s ease;" onmouseover="this.style.color='#00d4ff'" onmouseout="this.style.color='var(--text-secondary)'">How It Works</a>
                            <a href="${this.basePath}pages/privacy.html" style="display: block; color: var(--text-secondary); margin-bottom: 12px; text-decoration: none; transition: color 0.3s ease;" onmouseover="this.style.color='#00d4ff'" onmouseout="this.style.color='var(--text-secondary)'">Privacy Policy</a>
                            <a href="${this.basePath}pages/terms.html" style="display: block; color: var(--text-secondary); text-decoration: none; transition: color 0.3s ease;" onmouseover="this.style.color='#00d4ff'" onmouseout="this.style.color='var(--text-secondary)'">Terms of Service</a>
                        </div>
                    </div>
                    
                    <!-- Bottom Bar -->
                    <div style="text-align: center; padding-top: 30px; border-top: 1px solid var(--border-color);">
                        <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 10px;">
                            DAMP™ is a trademark of WeCr8 Solutions LLC
                        </p>
                        <p style="color: var(--text-secondary); font-size: 0.75rem;">
                            📧 <a href="mailto:zach@wecr8.info" style="color: #00d4ff; text-decoration: none;">zach@wecr8.info</a> | 
                            🌐 <a href="https://dampdrink.com" style="color: #00d4ff; text-decoration: none;">dampdrink.com</a>
                        </p>
                    </div>
                </div>
            </footer>
        `;
    }
}

customElements.define('damp-footer', DAMPFooter);