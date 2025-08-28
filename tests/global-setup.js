// @ts-check
const { chromium } = require('@playwright/test');

/**
 * Global setup for Playwright tests
 * This file runs once before all tests
 */
async function globalSetup() {
  console.log('🚀 Starting Playwright global setup...');

  // Check if development server is accessible
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Wait for the development server to be ready
    await page.goto('http://localhost:3008', { waitUntil: 'networkidle' });
    console.log('✅ Development server is accessible');
  } catch (error) {
    console.log('⚠️  Development server not accessible, tests will start the server');
  } finally {
    await browser.close();
  }

  console.log('✅ Global setup completed');
}

module.exports = globalSetup;
