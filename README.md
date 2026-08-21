# Make It Pop

Websites for community projects, charities and small local businesses.
The public site for **Sarah J Hill**.

**Live:** https://sarahjhill.github.io/make-it-pop/

---

## What this is

A hand-built marketing site. No build step, no framework, no page builder —
open `index.html` in a browser and it runs.

- `index.html` — the whole site: hero, about, portfolio, process, contact
- `portfolio-project.html` — reusable case-study template
- `assets/css/custom.css` — all custom styling, scoped so it can't leak
- `assets/js/main.js` — one dependency-free script replacing ~20 vendor libraries
- `site.webmanifest` — icon and theme metadata for home-screen installs

## Running it locally

No tooling required:

```bash
open index.html
```

Or, if you want a local server so relative paths behave exactly as they do
in production:

```bash
python3 -m http.server 8000
```

## Deploying

GitHub Pages builds from `main`. Push and it goes live within a minute or
two.

```bash
git push
```

Favicons cache aggressively — hard refresh (Cmd+Shift+R) or use a private
window when checking icon changes.

## Accessibility and performance notes

- Every interactive element is reachable by keyboard
- Animations respect `prefers-reduced-motion`
- Images are WebP
- No render-blocking JavaScript

## Licence

Copyright © 2026 Sarah Hill, trading as Sarah J Hill. All rights reserved.

The original content, copy, custom CSS, JavaScript and branding in this
repository are not licensed for reuse — see [LICENSE](LICENSE).

Third-party components (Bootstrap, Font Awesome, Google Fonts, and the base
theme) carry their own licences — see
[THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
