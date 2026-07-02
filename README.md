# AstralWeb V3.1 — Warm Editorial Luxury

Bilingual (SQ/EN) agency site built with Vite. Zero paid hosting required — deploys free on GitHub Pages.

## Local development

```bash
npm install
npm run dev        # local dev server at http://localhost:5173
npm run build      # production build into dist/
npm run preview    # preview the production build locally
```

## Free hosting on GitHub Pages (step by step)

1. Create a new repository on GitHub (e.g. `astralweb`).
2. Push the **contents of this folder** as the repository root:
   ```bash
   git init
   git add .
   git commit -m "AstralWeb v3.1"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/astralweb.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Source → GitHub Actions**.
4. Done. The included workflow (`.github/workflows/deploy.yml`) builds the site and
   publishes it automatically on every push to `main`.
   Your site will be live at `https://YOUR_USERNAME.github.io/astralweb/`.

The Vite config uses `base: './'` (relative paths), so the site works at any URL —
project pages, custom domains, anything.

## Before going live

- Replace `YOUR_WEB3FORMS_ACCESS_KEY` in both `index.html` and `en/index.html`
  with a real key from [web3forms.com](https://web3forms.com) (free) so the
  contact form delivers to your inbox.

## What's new in V3.1

- Cinematic masked-line hero headline reveal with italic serif accent
- Editorial stats band with scroll-triggered count-up numbers
- Serif marquee divider (outline/solid alternating, pauses on hover)
- Magnetic CTA buttons with shine sweep (desktop)
- Mobile hero stat chips, staggered mobile nav, WhatsApp quick action
- Smooth FAQ open/close physics, film-grain texture, giant footer watermark
- `prefers-reduced-motion` support end-to-end, focus-visible states, font preconnects
