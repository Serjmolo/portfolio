# Portfolio Site — Build & Deploy Checklist

Design reference: https://www.figma.com/design/c7yXpJlc6ESTuWA5unXTvg/RGS-ID-ideas?node-id=324-45
Deploy target: GitHub Pages (`username.github.io` or `username.github.io/repo-name`)

---

## 1. Project Setup

- [ ] Create a new GitHub repository (e.g. `username.github.io` for root deploy)
- [ ] Initialize project locally: plain HTML/CSS/JS (no build tool needed for static deploy)
- [ ] Set up folder structure:
  ```
  /
  ├── index.html
  ├── css/
  │   └── style.css
  ├── js/
  │   └── main.js
  ├── assets/
  │   ├── fonts/
  │   ├── images/
  │   └── icons/
  └── works/         ← individual case pages (optional)
  ```
- [ ] Add `.gitignore` (DS_Store, thumbs.db, etc.)

---

## 2. Fonts

Design uses two typeface families — both are commercial:
- **TT Neoris Trial** (Medium, Regular) — nav, badges, labels, copyright
- **TT Ramillas Trial** (Regular, Italic) — hero headings, body bio text

- [ ] Obtain font licenses or use the free Trial versions (check redistribution terms)
- [ ] Place `.woff2` files in `assets/fonts/`
- [ ] Define `@font-face` rules in CSS
- [ ] Fallback stack: `sans-serif` for TT Neoris, `serif` for TT Ramillas

---

## 3. Design Tokens (CSS Variables)

```css
:root {
  --bg:            #ffffff;
  --surface:       #f4f3ed;
  --text-primary:  #111111;
  --text-secondary:#818181;
  --accent:        #5428d6;   /* BCoin card background */
}
```

- [ ] Define all tokens in `:root` before writing component styles

---

## 4. Sections to Build

### NavBar
- [ ] Logo (DSGN WARRIOR) — left-aligned, SVG or image asset
- [ ] Navigation links: Works · About · Contact — right-aligned, uppercase, 126px gap
- [ ] Smooth scroll anchors for `#works`, `#about`, `#contact`
- [ ] Sticky on scroll (optional but recommended)

### Hero
- [ ] Large headline: `THE PAST DESIGNS` (TT Ramillas Regular) + `THE FUTURE` (TT Ramillas Italic)
- [ ] 110px font, −5.5px letter-spacing, uppercase, centered
- [ ] Sub-row: `THINK → ANALYZE → DESIGN` with arrow SVG separators
- [ ] Generous top/bottom padding (~180px)

### Works Grid (`#works`)
- [ ] Section label: "WORKS I MADE WITH LOVE FROM PRESENT TO PAST" — secondary text color
- [ ] 2-column CSS Grid, `gap: 30px`
- [ ] 8 case cards total (4 rows × 2 columns):
  | # | Title | Tags |
  |---|-------|------|
  | 1 | FAnton | Identity, App design |
  | 2 | Kalinka Realty | Web design |
  | 3 | RGS Online | Identity, Web design |
  | 4 | BCoin | Identity, App design |
  | 5 | Rusagroprom | Web design |
  | 6 | VSTZ | Identity, Web design |
  | 7 | Sogran | Web design |
  | 8 | Private Bank Otkritie | Web design |
- [ ] Each card: `400px` cover image + title row with tag badges
- [ ] Tag badges: `background: var(--surface)`, `border-radius: 8px`, `padding: 8px`
- [ ] Cover images: export/source final assets (Figma asset URLs expire in 7 days)
- [ ] Hover state on cards (subtle scale or overlay — not in Figma, designer's call)

### About (`#about`)
- [ ] Background: `var(--surface)` (`#f4f3ed`)
- [ ] Section label: "ABOUT" — secondary color
- [ ] Bio text: 48px TT Ramillas, centered, mixed regular/italic spans
- [ ] Arrow/divider SVG between text and photo
- [ ] Circular photo: `200×200px`, `border-radius: 48px`
- [ ] Export/source profile photo asset

### Footer / Contact (`#contact`)
- [ ] "LET'S TALK" heading — 48px TT Ramillas Italic, uppercase
- [ ] Social links row: LinkedIn · Telegram · Email (with line separators)
- [ ] Add real URLs for each social link
- [ ] Horizontal divider line
- [ ] Copyright row: `© 2026 Dsgn warrior` — left, `Version 1.0` — right

---

## 5. Assets to Export from Figma

- [ ] Logo (DSGN WARRIOR) — SVG preferred
- [ ] Arrow/Union separator SVG (used in hero and about sections)
- [ ] All 8 case cover images — export at 2× for retina (`1350×800px` minimum)
- [ ] Profile photo
- [ ] Horizontal line SVG (footer divider)

> Note: Figma MCP asset URLs expire in 7 days — download and commit them to `assets/images/`.

---

## 6. Responsive / Polish

- [ ] 100% fullscreen, fluid width grid — layout stretches edge-to-edge at any viewport width, no max-width cap
- [ ] Desktop baseline: 1440px wide, `30px` horizontal padding
- [ ] Tablet breakpoint (~768px): stack 2-col grid to 1-col
- [ ] Mobile breakpoint (~375px): reduce hero font size, adjust nav (hamburger menu?)
- [ ] Check font rendering on Windows (ClearType) — these fonts can look different
- [ ] Add `<meta name="viewport">` and basic `<meta>` tags (title, description, OG)
- [ ] Favicon — export a small version of the logo

---

## 7. GitHub Pages Deployment

- [ ] Push code to `main` branch (or `gh-pages` branch)
- [ ] In repo Settings → Pages → Source: `main` / `/(root)`
- [ ] Verify site is live at `https://username.github.io/`
- [ ] Test all anchor links, image loading, and fonts on the live URL
- [ ] (Optional) Set up a custom domain in Pages settings + add `CNAME` file

---

## 8. Nice-to-Have (Post-Launch)

- [ ] Page transitions / scroll animations (CSS or lightweight JS)
- [ ] Individual case study pages for each project
- [ ] Dark mode toggle (design is light-only for now)
- [ ] Contact form or mailto link on Email
- [ ] Google Analytics or Plausible for traffic tracking
