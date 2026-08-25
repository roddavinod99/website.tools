const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Collect console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    
    // Check CSP header
    const response = await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    const cspHeader = response.headers()['content-security-policy'];
    
    console.log('=== CSP HEADER ===');
    console.log(cspHeader);
    console.log();
    
    // Check for CSP violations in console
    console.log('=== CSP VIOLATIONS IN CONSOLE ===');
    const cspViolations = consoleErrors.filter(e => e.includes('Content Security Policy'));
    if (cspViolations.length > 0) {
      cspViolations.forEach(v => console.log('VIOLATION:', v));
    } else {
      console.log('No CSP violations detected in console');
    }
    
    // Check GTM/GA availability
    const gtagAvailable = await page.evaluate(() => typeof window.gtag === 'function');
    console.log('GTM/GA gtag available:', gtagAvailable);
    
    // Check if page loads successfully
    const bodyText = await page.textContent('body');
    console.log('Page loaded successfully:', bodyText.length > 100);
    console.log('Header visible:', await page.isVisible('header'));
    
  } catch (e) {
    console.error('Error:', e.message);
  }
  
  await browser.close();
})();