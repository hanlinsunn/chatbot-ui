# BASELINE (English fallback) videos

These videos capture the **current behaviour of the app BEFORE any Spanish
(`es`) or Korean (`ko`) translations were implemented.**

At the time these were recorded, only `public/locales/en/translation.json` and
`public/locales/de/translation.json` existed. Because the app uses the English
string as the i18n key and i18next falls back to the key text when a key is
missing, visiting `/es/...` or `/ko/...` renders the entire app **in English**.

Each video drives the locale purely via the URL prefix (there is no language
toggle in this baseline branch) and does a slow walkthrough of login → setup →
chat, including the sidebar, Quick Settings, and Chat Info.

| Locale | File | Expected rendering |
| ------ | ---- | ------------------ |
| `en` (control) | `en/baseline-en-english-fallback.webm` | English (native) |
| `es` | `es/baseline-es-english-fallback.webm` | **English (fallback — no `es` file yet)** |
| `ko` | `ko/baseline-ko-english-fallback.webm` | **English (fallback — no `ko` file yet)** |

> NOTE: The `es` and `ko` videos intentionally appear in English. That is the
> documented "before" state. The post-implementation videos (on the
> translation branch) show these locales rendered in Spanish and Korean.
