# Third-party notices

This site is built on work by other people. Their licences apply to their
material, not the licence in `LICENSE`. Several of these licences *require*
that this attribution stays in place, so please don't delete this file.

---

## "Shock" — Creative Multipurpose Bootstrap 5 Template

`assets/css/theme.css`, `assets/css/core.css`, `assets/css/main.css`

By **Codings** — ThemeForest item `g7OgNzSh`
Documentation: https://shock-html.codings.dev/docs

Licensed under a **purchased ThemeForest licence**, held by Sarah Hill.
Per the licence README supplied with the template, the package is split:

- The **PHP code and integrated HTML** are licensed under the **GPL v2**
  (a copy ships with the purchase as `Licensing/GPL.txt`)
- **Everything else** — including the CSS, images and design — is licensed
  under the purchased ThemeForest licence
  (https://themeforest.net/licenses)

That covers use on this site. What it does **not** permit is redistributing
the theme source itself, which is why the purchased package is deliberately
kept out of this public repository.

**What has been changed:** the three stylesheets have been rebranded to
SJ Development, stripped of components this site never uses, and simplified.
The template's PHP mailer (`php/PHPMailer/`) was never used — this site has
no server-side code at all — so none of the GPL portion is present here.

---

## Bootstrap 5.2.0

`assets/css/vendor/bootstrap.min.css`

Copyright 2011–2022 The Bootstrap Authors
Copyright 2011–2022 Twitter, Inc.
Licensed under the **MIT License** — https://github.com/twbs/bootstrap/blob/main/LICENSE

MIT permits commercial use, modification and redistribution provided the
copyright notice is retained. Retaining it is what this file does.

---

## Font Awesome Free 6.1.2 — subset

`assets/css/icons.css`
`assets/fonts/icons/sj-icons-solid.woff`
`assets/fonts/icons/sj-icons-brands.woff`

Copyright 2022 Fonticons, Inc. — https://fontawesome.com/license/free

Split licence:

- Icons — **CC BY 4.0** (attribution required)
- Fonts — **SIL OFL 1.1**
- Code — **MIT**

The CC BY 4.0 terms on the icons are why this attribution is not optional.

**What has been changed:** rather than shipping the full library, the two
font files here are subsets containing only the 19 icons this site uses,
generated with fontTools. The artwork is unaltered; unused glyphs are simply
removed. The OFL expressly permits subsetting, and the fonts remain under it.
This took the icon payload from roughly 1,020 KB to 4 KB.

Icons in use: arrow-right, arrow-right-long, arrow-up-right-from-square,
briefcase, check, clock, code, envelope, github, heart, linkedin, list-check,
location-dot, lock-open, mobile-screen-button, paper-plane, pen-ruler, reply,
user.

---

## Google Fonts — Poppins and Lato

Loaded from `fonts.googleapis.com`. Poppins glyph outlines are also embedded
in `assets/images/favicon.svg` and `logo-sjh-mark.svg`.

Both licensed under the **SIL Open Font License 1.1**.

- Poppins — Indian Type Foundry, Jonny Pinhorn
- Lato — Łukasz Dziedzic

The OFL permits embedding outlines in a logo or icon as done here.

---

## What is mine

Not third-party, and covered by `LICENSE`:

- `assets/css/custom.css` — every custom style, written from scratch
- `assets/css/icons.css` — the subset stylesheet
- `assets/js/main.js` — rewritten from scratch to replace roughly twenty
  vendor libraries (jQuery, Bootstrap JS, GSAP, anime.js, Swiper, Shuffle,
  Lightbox, Typed.js, ProgressBar.js, lax.js and others) with one small
  dependency-free script
- All page copy, structure and imagery
- The SJ Development logo, favicon and icon set
