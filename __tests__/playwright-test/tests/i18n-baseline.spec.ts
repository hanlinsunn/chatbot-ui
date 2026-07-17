import { test, expect, Page } from '@playwright/test';
import { execSync } from 'child_process';

/**
 * BASELINE (English fallback) i18n walkthrough.
 *
 * This spec documents the CURRENT behaviour of the app for each locale BEFORE
 * any Spanish/Korean translation files exist. Because only `en` and `de`
 * translation files are present today and i18next falls back to the key text
 * (English) for missing keys, visiting `/es` or `/ko` renders the app entirely
 * in English. These videos capture that "before" state.
 *
 * Locale is driven purely by the URL prefix (no toggle exists yet). We do NOT
 * assert translated text; we optionally assert the UI is still English to
 * document the fallback.
 */

const LOCALES = ['en', 'es', 'ko'] as const;

const TEST_EMAIL = 'test@test.com';
const TEST_PASSWORD = 'password';

/**
 * Reset the seeded test profile back to a pre-onboarding state so that every
 * locale run reliably flows login -> setup -> chat. Best-effort: if docker /
 * psql is not reachable the walkthrough still records login (+ setup/chat when
 * reachable).
 */
function resetOnboarding() {
  try {
    execSync(
      `docker exec $(docker ps -q -f name=supabase_db) psql -U postgres -d postgres ` +
        `-c "update public.profiles set has_onboarded = false;"`,
      { stdio: 'ignore', shell: '/bin/bash' }
    );
  } catch {
    // ignore - environment without docker/psql
  }
}

async function slowScan(page: Page) {
  // Slow walkthrough so the video captures each part of the screen.
  await page.waitForTimeout(1500);
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(1000);
  await page.mouse.wheel(0, -400);
  await page.waitForTimeout(1000);
}

// Run serially so the shared test profile onboarding state is deterministic.
test.describe.configure({ mode: 'serial' });

for (const locale of LOCALES) {
  test(`baseline walkthrough (English fallback) - ${locale}`, async ({
    page
  }) => {
    test.setTimeout(180000);
    resetOnboarding();

    // 1. LOGIN screen, driven purely by the URL prefix.
    await page.goto(`/${locale}/login`);
    await page.waitForLoadState('networkidle');
    await slowScan(page);

    // Document the fallback: login UI is in English regardless of locale.
    await expect(
      page.getByRole('button', { name: 'Login' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Sign Up' })
    ).toBeVisible();

    // Authenticate (see tests/login.spec.ts for the auth reference).
    await page.getByPlaceholder('you@example.com').fill(TEST_EMAIL);
    await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD);
    await slowScan(page);
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    // 2. SETUP screen (reachable because the profile is not onboarded).
    try {
      await page.waitForURL(/\/setup/, { timeout: 15000 });
      await page.waitForLoadState('networkidle');
      await slowScan(page);

      // Profile step -> API step -> Finish step, capturing each.
      const nextButton = page.getByRole('button', { name: 'Next' });
      await expect(nextButton).toBeVisible({ timeout: 10000 });
      await nextButton.click(); // -> API step
      await page.waitForTimeout(1500);
      await slowScan(page);
      await nextButton.click(); // -> Finish step
      await page.waitForTimeout(1500);
      await slowScan(page);
      await nextButton.click(); // -> save + go to chat
    } catch {
      // If setup was not reachable, fall through to whatever screen loaded.
    }

    // 3. CHAT screen after auth. Slow walkthrough of the app chrome.
    try {
      await page.waitForURL(/\/chat/, { timeout: 20000 });
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Chat input placeholder is English via fallback.
      const chatInput = page.getByPlaceholder(/Ask anything/i);
      await expect(chatInput).toBeVisible({ timeout: 15000 });

      // Open Quick Settings dropdown.
      const quickSettings = page.getByRole('button', {
        name: /Quick Settings/i
      });
      if (await quickSettings.isVisible().catch(() => false)) {
        await quickSettings.click();
        await page.waitForTimeout(1500);
        await page.keyboard.press('Escape');
      }

      // Hover the Chat Info icon to reveal the tooltip content.
      await page.mouse.move(1000, 60);
      await page.waitForTimeout(1500);

      await slowScan(page);
    } catch {
      // Chat may not be reachable in every environment; the video still records.
    }

    await page.waitForTimeout(1000);
  });
}
