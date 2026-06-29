# Tanlabs Tarot

<p align="center">
  <img src="public/brand/home-logo.png" alt="Tanlabs Tarot" width="320" />
</p>

A tarot reading web app with a casual game-like ritual — shuffle, draw, reveal, and reflect. Built with **React 19**, **Vite 7**, **TypeScript**, and deployable to **Cloudflare Workers** (Hono).

**Version:** 0.7.0

**Live preview:** [https://tanlabs-tarot.nikinpham.com](https://tanlabs-tarot.nikinpham.com)

## Features

### Self Reading

Spread and read the cards yourself on a virtual table — no narrator, no scripted meanings. Includes deck shuffle animations, card flip/reveal, focus overlay, and session history.

### Guided Reading

Narrator-led flow with spread setup, clarifying questions, shuffle, reveal, and interpretation panels.

- **Daily card (single)** — one draw per calendar day, persisted locally. Use the prompt bubble to describe a topic, or tap **Yes, draw one card** for an instant reading panel (card name, upright/reversed, keywords, meaning).
- **Three-card spread** — temporarily disabled (coming soon).
- **Six-card spread** — gated for a future token unlock.

### Shared

- English / Vietnamese (i18n)
- Background music and SFX (toggle in settings)
- Reading history (guided + self-view)
- Responsive layout, reduced-motion support, WebP tarot assets

## Tech stack

| Layer | Tools |
|--------|--------|
| UI | React 19, Framer Motion, GSAP, custom CSS (no Tailwind) |
| Build | Vite 7, TypeScript 5.9 |
| Edge | Hono on Cloudflare Workers |
| Test | Vitest |

## Project structure

```
src/react-app/
  components/     UI (spread, self-view, home, modals, character/narrator)
  hooks/          React hooks (locale, history, sfx, music, …)
  i18n/           en.ts, vi.ts
  lib/
    guided/       Clarifying flow, daily reading helpers
    storage/      localStorage (readings, daily card, self-view, guided session)
    tarot/        Deck, draw, card text, images, spreads
    features/     Feature flags (guided, three-card, six-card)
  providers/      Locale, music, SFX, self-view session
worker/           Hono API (health, static via Vite plugin)
```

## Getting started

```bash
pnpm install   # or npm install
pnpm dev       # http://localhost:5173
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server with HMR |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview production build |
| `npm run test` | Run Vitest |
| `npm run lint` | ESLint |
| `npm run deploy` | Deploy to Cloudflare Workers |

## Configuration

Feature flags live in `src/react-app/lib/features/guided-reading.ts`:

- `GUIDED_READING_ENABLED`
- `GUIDED_THREE_CARD_ENABLED`
- `GUIDED_SIX_CARD_ENABLED`

Daily card persistence: `src/react-app/lib/storage/daily-card-store.ts` (keyed by local calendar date).

## Release notes

See [CHANGELOG.md](./CHANGELOG.md) for version history. In-app **About → What's new** mirrors the latest release.

## Deploy

```bash
npm run build && npm run deploy
```

Requires [Wrangler](https://developers.cloudflare.com/workers/wrangler/) and a Cloudflare account.

## License

Private project — Tanlabs.
