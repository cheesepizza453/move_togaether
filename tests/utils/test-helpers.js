// @ts-check

/**
 * Test helper utilities for Playwright tests
 */

/**
 * Wait for page to be fully loaded
 * @param {import('@playwright/test').Page} page
 */
async function waitForPageLoad(page) {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Take screenshot with timestamp
 * @param {import('@playwright/test').Page} page
 * @param {string} name
 */
async function takeScreenshot(page, name) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({
    path: `test-results/screenshots/${name}-${timestamp}.png`,
    fullPage: true
  });
}

/**
 * Check if element is in viewport
 * @param {import('@playwright/test').Locator} element
 */
async function isInViewport(element) {
  const boundingBox = await element.boundingBox();
  if (!boundingBox) return false;

  const viewport = await element.page().viewportSize();
  if (!viewport) return false;

  return (
    boundingBox.x >= 0 &&
    boundingBox.y >= 0 &&
    boundingBox.x + boundingBox.width <= viewport.width &&
    boundingBox.y + boundingBox.height <= viewport.height
  );
}

/**
 * Scroll element into view
 * @param {import('@playwright/test').Locator} element
 */
async function scrollIntoView(element) {
  await element.scrollIntoViewIfNeeded();
}

/**
 * Wait for animation to complete
 * @param {import('@playwright/test').Page} page
 * @param {number} timeout
 */
async function waitForAnimation(page, timeout = 1000) {
  await page.waitForTimeout(timeout);
}

/**
 * Generate random test data
 */
function generateTestData() {
  return {
    name: `Test User ${Math.random().toString(36).substring(7)}`,
    email: `test${Math.random().toString(36).substring(7)}@example.com`,
    phone: `010-${Math.random().toString().substring(2, 6)}-${Math.random().toString().substring(2, 6)}`
  };
}

/**
 * Check if running in CI environment
 */
function isCI() {
  return process.env.CI === 'true';
}

module.exports = {
  waitForPageLoad,
  takeScreenshot,
  isInViewport,
  scrollIntoView,
  waitForAnimation,
  generateTestData,
  isCI
};
