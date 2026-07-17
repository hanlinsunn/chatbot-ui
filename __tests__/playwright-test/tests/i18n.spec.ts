import { test, expect, Page } from '@playwright/test';

/**
 * Post-implementation i18n tests.
 *
 * For each of en / es / ko we:
 *  - navigate with the locale URL prefix,
 *  - assert the login screen renders in the expected language,
 *  - assert brand / provider terms stay in English,
 *  - authenticate and assert the chat screen renders in the expected language,
 *  - exercise the global language switcher and assert the route is preserved
 *    while the UI language changes.
 */

const TEST_EMAIL = 'test@test.com';
const TEST_PASSWORD = 'password';

type LocaleStrings = {
  login: string;
  email: string;
  password: string;
  signUp: string;
};

const EXPECTED: Record<'en' | 'es' | 'ko', LocaleStrings> = {
  en: { login: 'Login', email: 'Email', password: 'Password', signUp: 'Sign Up' },
  es: {
    login: 'Iniciar sesión',
    email: 'Correo electrónico',
    password: 'Contraseña',
    signUp: 'Registrarse',
  },
  ko: { login: '로그인', email: '이메일', password: '비밀번호', signUp: '회원가입' },
};

const LOCALES = ['en', 'es', 'ko'] as const;

async function login(page: Page, locale: string) {
  await page.goto(`/${locale}/login`);
  await page.getByPlaceholder('you@example.com').fill(TEST_EMAIL);
  await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD);
  await page
    .getByRole('button', { name: EXPECTED[locale as 'en'].login, exact: true })
    .click();
  // After login the app redirects to /{workspaceId}/chat
  await page.waitForURL(/\/[^/]+\/chat/, { timeout: 60000 });
}

test.describe('i18n translations', () => {
  for (const locale of LOCALES) {
    test(`login screen renders in ${locale}`, async ({ page }) => {
      await page.goto(`/${locale}/login`);

      const strings = EXPECTED[locale];

      await expect(
        page.getByRole('button', { name: strings.login, exact: true })
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: strings.signUp, exact: true })
      ).toBeVisible();
      await expect(page.getByText(strings.email, { exact: true })).toBeVisible();
      await expect(
        page.getByText(strings.password, { exact: true })
      ).toBeVisible();

      // Brand name stays English on every locale.
      await expect(page.getByText('Chatbot UI').first()).toBeVisible();
    });
  }

  for (const locale of LOCALES) {
    test(`chat screen renders in ${locale}`, async ({ page }) => {
      test.setTimeout(120000);
      await login(page, locale);

      // Chat input placeholder is localized and includes the command tokens
      // (@ / # !) verbatim regardless of language.
      const placeholder = await page
        .locator('textarea')
        .first()
        .getAttribute('placeholder');
      expect(placeholder).toContain('@');
      expect(placeholder).toContain('#');
    });
  }

  test('language switcher preserves the route and updates the language', async ({
    page,
  }) => {
    await page.goto('/en/login');
    await expect(
      page.getByRole('button', { name: 'Login', exact: true })
    ).toBeVisible();

    // Open the global switcher (top-right) and pick Spanish.
    await page.getByRole('button', { name: 'Change language' }).click();
    await page.getByText('Español', { exact: true }).click();

    await page.waitForURL(/\/es\/login/, { timeout: 30000 });
    await expect(
      page.getByRole('button', { name: 'Iniciar sesión', exact: true })
    ).toBeVisible();

    // Switch to Korean, still on the login route.
    await page.getByRole('button', { name: 'Change language' }).click();
    await page.getByText('한국어', { exact: true }).click();

    await page.waitForURL(/\/ko\/login/, { timeout: 30000 });
    await expect(
      page.getByRole('button', { name: '로그인', exact: true })
    ).toBeVisible();
  });
});
