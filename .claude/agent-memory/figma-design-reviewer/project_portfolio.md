---
name: Portfolio site project
description: Core project context — static HTML/CSS/JS portfolio for Sergey Golosov (DSGN WARRIOR), deployed to GitHub Pages
type: project
---

Static HTML/CSS/JS portfolio site for Sergey Golosov, art director (brand: DSGN WARRIOR). Deployed to GitHub Pages.

**Why:** Personal portfolio showcasing 10 years of design work in fintech, insurance, B2B/B2E product design.

**How to apply:** Respect existing file structure (index.html, css/style.css, js/main.js, assets/). No build tools beyond package.json. No frameworks — pure HTML/CSS/JS. No emojis in code or reports.

## Design tokens (from :root in style.css)
- `--bg: #ffffff`
- `--surface: #f4f3ed`
- `--text-primary: #111111`
- `--text-secondary: #818181`
- `--accent: #5428d6`
- `--gap: 30px`
- `--pad-x: 30px`
- `--neoris: 'TT Neoris Trial', sans-serif`
- `--ramillas: 'TT Ramillas Trial', serif`

## Typography scale
- Hero title: Ramillas 110px (clamp 40px–140px), line-height 1.1, letter-spacing -0.05em, uppercase
- Hero tagline: Ramillas 30px (clamp), line-height 1, letter-spacing -0.01em, uppercase
- Works/About labels: Neoris Medium 20px, line-height 1, uppercase, color text-secondary
- Case names: Neoris Medium 24px, line-height 1, uppercase
- Badges: Neoris Regular 16px, line-height 1, bg surface, border-radius 8px, padding 8px
- Nav links: Neoris Medium 16px, uppercase
- About bio: Ramillas Regular 48px, line-height 1.2, letter-spacing -1.44px, centered
- Footer links: Neoris Medium 16px, uppercase
- Footer copyright: Neoris Medium 14px, uppercase, color text-secondary

## Spacing system
- Section horizontal padding (most sections): 30px (`--pad-x`)
- About section horizontal padding: 120px (from Figma node 388:3347)
- About section vertical padding: 96px top and bottom
- Gap between About section children: 48px
- Nav padding: 40px vertical, 30px horizontal
- Works section: 48px top, 96px bottom
- Footer: 96px top, 48px bottom

## About section (Figma node 388:3347) — confirmed specs
- Background: var(--surface, #f4f3ed)
- Padding: 96px 120px
- Gap: 48px (flex column, centered)
- Label: Neoris Medium 20px, uppercase, text-secondary
- Bio: Ramillas Regular 48px, line-height 1.2, letter-spacing -1.44px, width 100%, centered
- Photo: 200x200px, border-radius 48px, object-fit cover
