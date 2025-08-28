// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('UI Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Button Component', () => {
    test('should render buttons with correct styles', async ({ page }) => {
      const buttons = page.locator('button');
      await expect(buttons).toHaveCount(3); // 시작하기, 더 알아보기, 시작하기

      // Check primary button
      const primaryButton = page.locator('button:has-text("시작하기")').first();
      await expect(primaryButton).toHaveClass(/bg-primary/);
    });

    test('should have proper button states', async ({ page }) => {
      const button = page.locator('button:has-text("시작하기")').first();

      // Check initial state
      await expect(button).toBeEnabled();

      // Check hover state (if CSS supports it)
      await button.hover();
      await expect(button).toBeVisible();
    });
  });

  test.describe('Card Component', () => {
    test('should render cards with proper structure', async ({ page }) => {
      const cards = page.locator('[data-slot="card"]');
      await expect(cards).toHaveCount(6); // 1 welcome card + 4 feature cards + 1 CTA card
    });

    test('should display card content correctly', async ({ page }) => {
      const welcomeCard = page.locator('text=🎉 환영합니다!').locator('..').locator('..');
      await expect(welcomeCard).toBeVisible();

      // Check if card has proper spacing and styling
      await expect(welcomeCard).toHaveClass(/rounded-xl/);
    });
  });

  test.describe('Layout Components', () => {
    test('should have proper header structure', async ({ page }) => {
      const header = page.locator('header');
      await expect(header).toBeVisible();

      const h1 = header.locator('h1');
      await expect(h1).toBeVisible();
      await expect(h1).toContainText('Move Togaether');
    });

    test('should have proper footer structure', async ({ page }) => {
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();

      const footerText = footer.locator('p');
      await expect(footerText).toContainText('© 2024 Move Togaether');
    });
  });

  test.describe('Responsive Design', () => {
    test('should adapt to tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      // Check if layout adapts to tablet
      const main = page.locator('main');
      await expect(main).toBeVisible();

      // Check if grid layout changes
      const grid = page.locator('[class*="grid"]');
      await expect(grid).toBeVisible();
    });

    test('should adapt to desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });

      // Check if layout adapts to desktop
      const container = page.locator('.container');
      await expect(container).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1);

      const h3 = page.locator('h3');
      await expect(h3).toHaveCount(1); // CTA card title
    });

    test('should have proper button labels', async ({ page }) => {
      const buttons = page.locator('button');

      for (let i = 0; i < await buttons.count(); i++) {
        const button = buttons.nth(i);
        const text = await button.textContent();
        expect(text).toBeTruthy();
        expect(text.trim().length).toBeGreaterThan(0);
      }
    });
  });
});
