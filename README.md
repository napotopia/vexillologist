# Vexillologist

A flag guessing game. A country flag is shown — pick the correct name from four options before the timer runs out.

## Gameplay

- **10 flags per round**, drawn randomly from ~250 countries
- **15-second countdown** per flag; faster answers score more points
- **Score formula**: `(1000 + floor(seconds_remaining) × 10) × streak_multiplier`
- **Streak multiplier**: 1.5× after 3 correct in a row, 2× after 6
- **Wrong answer or timeout**: 0 points, correct answer revealed for 1.5 s
- **Distractors** are picked preferentially from the same geographic region
- **Top-10 scores** saved locally; works offline after first load
- **Keyboard**: digit keys 1–4 to select answers

## Tech stack

- [SvelteKit 2](https://kit.svelte.dev) + [Svelte 5](https://svelte.dev) (runes)
- [Tailwind CSS 4](https://tailwindcss.com)
- [REST Countries API](https://restcountries.com) — free, no key required
- [Drizzle ORM](https://orm.drizzle.team) + [Turso](https://turso.tech) (auth scaffold)
- [Lucia](https://lucia-auth.com) v3 (auth scaffold — anonymous in MVP)
- [Vitest](https://vitest.dev) for unit tests

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run check` | Type-check with `svelte-check` |
| `npm run test` | Run Vitest test suite |

## Environment variables

Only needed when enabling auth (optional in MVP):

```
# .env.local
TURSO_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token
```

See `.env.example`. The game runs fully without these — scores are stored in `localStorage`.

## Project structure

```
src/
  lib/
    api/countries.ts       # REST Countries fetch + normalization
    cache/countries.ts     # localStorage cache (versioned)
    cache/scores.ts        # Top-10 score persistence
    game/engine.ts         # Pure TS state machine + scoring
    game/distractors.ts    # Regional distractor selection
    stores/game.svelte.ts  # Svelte 5 runes store
    db/schema.ts           # Drizzle schema (users, sessions)
    auth.ts                # Lucia setup (optional)
  components/              # FlagImage, Timer, ChoiceGrid, etc.
  routes/
    +page.svelte           # Home + leaderboard
    game/+page.svelte      # Active game
specs/001-flag-quiz-game/  # Spec-kit SDD artifacts
```

## Testing

```bash
npm run test
```

29 unit tests covering the scoring formula, streak multiplier thresholds, distractor selection, API response normalization, and localStorage cache read/write.

## Offline support

On first load the app fetches all country data from the REST Countries API and stores it in `localStorage`. Subsequent sessions — including offline ones — read from cache. The cache key is versioned (`vexillologist_countries_v2`) so schema changes automatically invalidate stale data.
