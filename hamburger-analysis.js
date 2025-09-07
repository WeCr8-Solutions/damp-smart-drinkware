const fs = require('fs');

console.log('DAMP Hamburger Menu Analysis');
console.log('============================\n');

try {
  const headerContent = fs.readFileSync('website/assets/js/components/header.js', 'utf8');
  const cssContent = fs.readFileSync('website/assets/css/navigation.css', 'utf8');

  // Check hamburger implementation
  const hasHamburger = headerContent.includes('class="hamburger"');
  const hasMobileMenu = headerContent.includes('mobile-menu');
  const hasEventListeners = headerContent.includes('addEventListener') || headerContent.includes('click');

  console.log('Hamburger Implementation Analysis:');
  console.log('Hamburger Button:', hasHamburger ? 'YES' : 'NO');
  console.log('Mobile Menu:', hasMobileMenu ? 'YES' : 'NO');
  console.log('Event Handlers:', hasEventListeners ? 'YES' : 'NO');

  // Check CSS responsiveness
  const responsiveBreakpoints = (cssContent.match(/@media.*width/g) || []).length;
  const hasHamburgerCSS = cssContent.includes('.hamburger');
  const hasMobileMenuCSS = cssContent.includes('.mobile-menu');

  console.log('\nCSS Responsiveness Analysis:');
  console.log('Responsive Breakpoints:', responsiveBreakpoints);
  console.log('Hamburger CSS:', hasHamburgerCSS ? 'YES' : 'NO');
  console.log('Mobile Menu CSS:', hasMobileMenuCSS ? 'YES' : 'NO');

  // Extract navigation links
  const linkMatches = headerContent.match(/href="([^"]*\.html[^"]*)"/g) || [];
  const uniqueLinks = [...new Set(linkMatches)];

  console.log('\nNavigation Links Found:', uniqueLinks.length);
  uniqueLinks.forEach(link => {
    const href = link.match(/href="([^"]*)"/)[1];
    console.log('  -', href);
  });

  // Overall assessment
  const score = (hasHamburger + hasMobileMenu + hasEventListeners + (responsiveBreakpoints > 0) + hasHamburgerCSS + hasMobileMenuCSS) / 6 * 100;

  console.log('\nOverall Score:', Math.round(score) + '%');

  if (score >= 80) {
    console.log('STATUS: Hamburger menu is well implemented!');
  } else if (score >= 60) {
    console.log('STATUS: Hamburger menu needs some improvements.');
  } else {
    console.log('STATUS: Hamburger menu has significant issues.');
  }

} catch (error) {
  console.error('Error reading files:', error.message);
}
