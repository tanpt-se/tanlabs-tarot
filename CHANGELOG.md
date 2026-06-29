# Changelog

All notable changes to **Tanlabs Tarot** are documented in this file.

## [0.7.0] — 2026-06-29

### Daily card (Guided Reading)

- **One card per day** — today's daily draw is saved in `localStorage` and reused for the rest of the day.
- **Quick draw** — the wood button in the setup bubble (`Yes, draw one card…`) opens the full **ReadingPanel** immediately: daily label, card name, upright/reversed, art, keywords, meaning, and today's reflection.
- **No extra “new reading”** for daily — you cannot draw again until the next calendar day.
- **Returning later** — choosing **Draw a daily card** again on the same day reopens today's reading.
- **Optional topic** — you can still describe a focus in the text box below for the classic shuffle → reveal flow.

### Guided Reading UI

- Clarifying prompt and placeholder copy updated for the single-card flow.
- History moved to the app chrome (next to Settings); hidden during interpret-choice.
- Home menu: primary actions + compact grid with icons.
- Three-card spread temporarily disabled (coming soon).

### Cleanup

- Removed unused daily topics mock panel and related i18n.
- Extracted `daily-card-store`, `daily-reading`, and shared `beginDailyReading` flow.

## [0.6.0]

- Guided Reading available from the home menu.
- Self Reading and Guided Reading clearly labeled on home.
- Self-view spread persists on refresh; clears when leaving the tab or resetting the table.
- History opens as a centered modal; tap an entry to replay on the table.
- Game-style transitions for self-view and modals.
