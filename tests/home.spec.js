// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page before each test
    await page.goto('/');
  });

  test('should load home page successfully', async ({ page }) => {
    // Check if page title is correct
    await expect(page).toHaveTitle(/Move Togaether/);

    // Check if main heading is visible
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Move Togaether');
  });

  test('should display welcome card', async ({ page }) => {
    // Check if welcome card is visible
    const welcomeCard = page.locator('text=🎉 환영합니다!');
    await expect(welcomeCard).toBeVisible();

    // Check if welcome description is visible
    const description = page.locator('text=새로운 프로젝트가 성공적으로 설정되었습니다');
    await expect(description).toBeVisible();
  });

  test('should display feature cards', async ({ page }) => {
    // Check if all feature cards are visible
    const featureCards = page.locator('text=📱 모바일 우선, text=🎨 현대적 UI, text=🚀 빠른 성능, text=🔧 확장 가능');

    await expect(page.locator('text=📱 모바일 우선')).toBeVisible();
    await expect(page.locator('text=🎨 현대적 UI')).toBeVisible();
    await expect(page.locator('text=🚀 빠른 성능')).toBeVisible();
    await expect(page.locator('text=🔧 확장 가능')).toBeVisible();
  });

  test('should have working start button', async ({ page }) => {
    // Check if start button is visible and clickable
    const startButton = page.locator('button:has-text("시작하기")').first();
    await expect(startButton).toBeVisible();
    await expect(startButton).toBeEnabled();
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if layout adapts to mobile
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Check if cards stack vertically on mobile
    const cards = page.locator('[class*="grid"]');
    await expect(cards).toBeVisible();
  });

  test('should have proper meta tags', async ({ page }) => {
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /Move Togaether/);

    // Check viewport meta tag
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toBeVisible();
  });
});
