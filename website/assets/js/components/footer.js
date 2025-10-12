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
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 40px; margin-bottom: 40px;">
                        <!-- About Section -->
                        <div>
                            <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 1.25rem;">DAMP Smart Drinkware</h3>
                            <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 15px;">
                                Never leave your drink behind with our smart tracking technology for any drinkware.
                            </p>
                            <p style="color: var(--text-secondary); font-size: 0.875rem;">
                                © 2025 WeCr8 Solutions LLC<br>
                                All rights reserved
                            </p>
                        </div>
                        
                        <!-- Products Section -->
                        <div>
                            <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 1.125rem;">Products</h3>
                            <a href="${this.basePath}pages/damp-handle-v1.0.html" style="display: block; color: var(--text-secondary); margin-bottom: 10px; text-decoration: none; transition: color 0.3s ease;" onmouseover="this.style.color='#00d4ff'" onmouseout="this.style.color='var(--text-secondary)'">DAMP Handle</a>
                            <a href="${this.basePath}pages/silicone-bottom-v1.0.html" style="display: block; color: var(--text-secondary); margin-bottom: 10px; text-decoration: none; transition: color 0.3s ease;" onmouseover="this.style.color='#00d4ff'" onmouseout="this.style.color='var(--text-secondary)'">Silicone Bottom</a>
                            <a href="${this.basePath}pages/cup-sleeve-v1.0.html" style="display: block; color: var(--text-secondary); margin-bottom: 10px; text-decoration: none; transition: color 0.3s ease;" onmouseover="this.style.color='#00d4ff'" onmouseout="this.style.color='var(--text-secondary)'">Cup Sleeve</a>
                            <a href="${this.basePath}pages/pre-sale-funnel.html" style="display: block; color: var(--text-secondary); text-decoration: none; transition: color 0.3s ease;" onmouseover="this.style.color='#00d4ff'" onmouseout="this.style.color='var(--text-secondary)'">Pre-Order</a>
                        </div>
                        
                        <!-- Company Section -->
                        <div>
                            <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 1.125rem;">Company</h3>
                            <a href="${this.basePath}pages/about.html" style="display: block; color: var(--text-secondary); margin-bottom: 10px; text-decoration: none; transition: color 0.3s ease;" onmouseover="this.style.color='#00d4ff'" onmouseout="this.style.color='var(--text-secondary)'">About Us</a>
                            <a href="${this.basePath}pages/press.html" style="display: block; color: var(--text-secondary); margin-bottom: 10px; text-decoration: none; transition: color 0.3s ease;" onmouseover="this.style.color='#00d4ff'" onmouseout="this.style.color='var(--text-secondary)'">Press & Media</a>
                            <a href="${this.basePath}pages/damp-drinking-meaning.html" style="display: block; color: var(--text-secondary); margin-bottom: 10px; text-decoration: none; transition: color 0.3s ease;" onmouseover="this.style.color='#00d4ff'" onmouseout="this.style.color='var(--text-secondary)'">DAMP Lifestyle</a>
                            <a href="${this.basePath}pages/product-voting.html" style="display: block; color: var(--text-secondary); text-decoration: none; transition: color 0.3s ease;" onmouseover="this.style.color='#00d4ff'" onmouseout="this.style.color='var(--text-secondary)'">Product Voting</a>
                        </div>
                        
                        <!-- Resources Section -->
                        <div>
                            <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 1.125rem;">Resources</h3>
                            <a href="${this.basePath}pages/how-it-works.html" style="display: block; color: var(--text-secondary); margin-bottom: 10px; text-decoration: none; transition: color 0.3s ease;" onmouseover="this.style.color='#00d4ff'" onmouseout="this.style.color='var(--text-secondary)'">How It Works</a>
                            <a href="${this.basePath}pages/support.html" style="display: block; color: var(--text-secondary); margin-bottom: 10px; text-decoration: none; transition: color 0.3s ease;" onmouseover="this.style.color='#00d4ff'" onmouseout="this.style.color='var(--text-secondary)'">Support</a>
                            <a href="${this.basePath}pages/privacy.html" style="display: block; color: var(--text-secondary); margin-bottom: 10px; text-decoration: none; transition: color 0.3s ease;" onmouseover="this.style.color='#00d4ff'" onmouseout="this.style.color='var(--text-secondary)'">Privacy Policy</a>
                            <a href="${this.basePath}index.html#contact" style="display: block; color: var(--text-secondary); text-decoration: none; transition: color 0.3s ease;" onmouseover="this.style.color='#00d4ff'" onmouseout="this.style.color='var(--text-secondary)'">Contact</a>
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