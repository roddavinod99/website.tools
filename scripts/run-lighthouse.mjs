import lighthouse from 'lighthouse';
import { chromium } from 'playwright';

async function runLighthouse() {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] 
  });
  
  try {
    const port = browser.wsEndpoint().split(':')[2].split('/')[0];
    
    const results = await lighthouse('https://tools.devstackio.com', {
      port: parseInt(port),
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
      chromeFlags: '--headless --no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage --disable-gpu',
    }, {
      extends: 'lighthouse:default',
      settings: {
        formFactor: 'desktop',
        screenEmulation: { disabled: true },
      }
    });
    
    const report = results.lhr;
    const scores = {
      performance: Math.round(report.categories.performance.score * 100),
      accessibility: Math.round(report.categories.accessibility.score * 100),
      'best-practices': Math.round(report.categories['best-practices'].score * 100),
      seo: Math.round(report.categories.seo.score * 100),
      pwa: report.categories.pwa ? Math.round(report.categories.pwa.score * 100) : 'N/A',
    };
    
    console.log('\n========== LIGHTHOUSE SCORES ==========');
    console.log(`Performance:       ${scores.performance}/100`);
    console.log(`Accessibility:     ${scores.accessibility}/100`);
    console.log(`Best Practices:    ${scores['best-practices']}/100`);
    console.log(`SEO:               ${scores.seo}/100`);
    console.log(`PWA:               ${scores.pwa}/100`);
    console.log('========================================\n');
    
    // Core Web Vitals
    const metrics = report.audits;
    console.log('--- Core Web Vitals ---');
    console.log(`LCP: ${metrics['largest-contentful-paint']?.displayValue || 'N/A'}`);
    console.log(`CLS: ${metrics['cumulative-layout-shift']?.displayValue || 'N/A'}`);
    console.log(`INP: ${metrics['interaction-to-next-paint']?.displayValue || 'N/A'}`);
    console.log(`FCP: ${metrics['first-contentful-paint']?.displayValue || 'N/A'}`);
    console.log(`TBt: ${metrics['total-blocking-time']?.displayValue || 'N/A'}`);
    console.log(`SI:  ${metrics['speed-index']?.displayValue || 'N/A'}`);
    
    // Failed audits
    console.log('\n--- Failed Audits ---');
    Object.entries(report.audits).forEach(([key, audit]) => {
      if (audit.score === 0 || audit.score === null) {
        console.log(`❌ ${key}: ${audit.title} - ${audit.displayValue || audit.description}`);
      }
    });
    
    // Passed audits (sample)
    console.log('\n--- Key Passed Audits ---');
    const keyAudits = [
      'meta-description', 'document-title', 'html-has-lang', 'image-alt',
      'viewport', 'robots-txt', 'sitemap-xml', 'canonical',
      'structured-data', 'hreflang', 'csp-xss', 'hsts', 'x-frame-options'
    ];
    keyAudits.forEach(key => {
      const audit = report.audits[key];
      if (audit) {
        const status = audit.score === 1 ? '✅' : audit.score === 0 ? '❌' : '⚠️';
        console.log(`${status} ${key}: ${audit.title}`);
      }
    });
    
    return report;
  } finally {
    await browser.close();
  }
}

runLighthouse().catch(console.error);