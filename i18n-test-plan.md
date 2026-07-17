# i18n (es/ko) + Language Switcher — Live Test Plan

App: http://127.0.0.1:3000 · Seeded acct: test@test.com / password
Feature: `components/utility/language-switcher.tsx` mounted in `app/[locale]/layout.tsx`; catalogs in `public/locales/{es,ko}/translation.json`.

## Test 1 — Login screen renders per locale (URL prefix)
- Go to `/en/login` → button reads **Login**, labels **Email** / **Password**, brand **Chatbot UI** visible.
- Go to `/es/login` → button reads **Iniciar sesión**, labels **Correo electrónico** / **Contraseña**; brand still **Chatbot UI** (NOT translated).
- Go to `/ko/login` → button reads **로그인**, labels **이메일** / **비밀번호**; brand still **Chatbot UI**.
- FAIL if any label stays English on es/ko, or brand gets translated.

## Test 2 — Global switcher preserves route + changes language
- On `/en/login`, click the globe icon (top-right), choose **Español**.
- PASS: URL becomes `/es/login` (route preserved, still login) AND button now reads **Iniciar sesión**.
- Then choose **한국어** → URL `/ko/login`, button **로그인**.
- FAIL if URL drops `/login`, or text does not change language.

## Test 3 — Authenticated chat renders translated (es)
- On `/es/login`, log in with seeded acct → redirects to `/{workspaceId}/chat`.
- PASS: chat input placeholder is Spanish and still contains command tokens `@` and `#` verbatim; sidebar/Quick Settings labels show Spanish (e.g. **Ajustes rápidos**, **Buscar...**).
- FAIL if chat UI is English while on `/es`, or tokens `@`/`#` are missing/translated.

## Test 4 (Regression) — Model/brand terms stay English
- In chat (es), open Chat Info / model selector.
- PASS: model name/id (e.g. GPT-*) and provider names render in English regardless of locale.
