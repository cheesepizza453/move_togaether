// @ts-check

/**
 * Global teardown for Playwright tests
 * This file runs once after all tests
 */
async function globalTeardown() {
  console.log('🧹 Starting Playwright global teardown...');

  // Add any global cleanup logic here
  // For example: cleanup test data, close connections, etc.

  console.log('✅ Global teardown completed');
}

module.exports = globalTeardown;
