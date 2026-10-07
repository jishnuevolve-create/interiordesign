# Oakline Studio: Interior Design Website

A responsive single-page site for an interior design studio, built with semantic HTML, hand-written CSS and vanilla JavaScript. There's no build step and no dependencies.

```
index.html            all sections, SEO meta, Open Graph, LocalBusiness JSON-LD
assets/css/styles.css design tokens (CSS variables) + components, mobile-first
assets/js/main.js     nav, menu, parallax, reveal, count-up, carousels, filter, forms
assets/img/favicon.svg
site.webmanifest, robots.txt
```

## Run it

Open `index.html` in a browser, or serve the folder:

```bash
npx serve .        # or: python -m http.server
```

## Replace the placeholders

| Placeholder | Where |
|---|---|
| `Oakline Studio` (name) | `index.html` (title, meta, logo, JSON-LD, footer) |
| `Austin`, `1208 Willow Lane…`, `78702` | hero badge, contact card, JSON-LD, map `src` |
| `2001` (established) | hero card, footer tagline, JSON-LD `foundingDate` |
| `+1 (512) 555-0142` / `15125550142` | `tel:` links, `wa.me/` links, JSON-LD |
| `hello@oaklinestudio.com` | contact card, JSON-LD |
| `https://www.oaklinestudio.com/` | canonical, `og:url`, JSON-LD, `robots.txt` |
| Stats (5k+, 4.8, 25+, 98%, 15+) | hero cards, About `data-count` values |
| `/login`, `/privacy`, `/terms` | nav and footer links |
| Project tiles' `href="#contact"` | point at your case-study pages |

Change the brand colours, type scale, radii, shadows and spacing in the `:root` block at the top of `styles.css`.

## Things to wire up before launch

1. **Contact form.** `main.js` (section 9) simulates the request. Swap the `setTimeout` for a real `fetch` call to Formspree, Netlify Forms or your own API; a commented example is included. A honeypot field already catches simple bots.
2. **Newsletter.** Validation and the success message work, but nothing is sent yet. Connect it to Mailchimp, Brevo or similar.
3. **Images.** The photos are Unsplash placeholders served as WebP with `srcset`. Replace them with your own project photography. Keep the `width`/`height` attributes to avoid layout shift, and write new `alt` text.
4. **Map.** Update the `iframe` query, or use a Google Maps "Share → Embed" URL for your exact location.
5. **OG image.** Ideally a 1200×630 branded image hosted on your own domain.

## What's built in

- **Performance:** the hero image is preloaded with `fetchpriority="high"` (the LCP element). Everything else lazy-loads behind a shimmer skeleton. There's no framework and a single JS file, loaded with `defer`.
- **Accessibility:**
  - Skip link, semantic landmarks and visible `:focus-visible` rings.
  - Carousels respond to the arrow keys and the Home/End keys, and carry ARIA slide labels.
  - The menu traps focus and closes on Esc.
  - Form errors are linked with `aria-describedby` and `aria-invalid`.
  - `prefers-reduced-motion` turns animation off.
  - Text colour pairs were chosen to meet WCAG AA contrast.
- **Progressive enhancement:** with JavaScript off, all content is visible and the carousels still scroll natively.
- **Mobile:**
  - Tap targets are at least 44px.
  - On phones, floating WhatsApp and call buttons appear once you scroll past the hero and hide again near the contact form.
  - The layout has been checked from 320px to 1920px.
