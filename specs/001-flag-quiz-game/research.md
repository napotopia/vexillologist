# Research: Vexillologist — Flag Quiz Game

**Branch**: `001-flag-quiz-game` | **Date**: 2026-04-28

## 1. SvelteKit 2 + Svelte 5 Scaffold

**Decision**: Use `npx sv create` (the official SvelteKit CLI) with TypeScript and Vitest enabled.

**Rationale**: `sv` is the canonical tool as of SvelteKit 2. Svelte 5 runes (`$state`, `$derived`, `$effect`) replace the old store primitives and are the preferred pattern for new components.

**Scaffold command**:
```
npx sv create .  (run from project root, select skeleton, TypeScript, Vitest)
```

**Alternatives considered**: Vite + Svelte (no SSR routing) — rejected because SvelteKit's file-based routing and server hooks are needed for future auth middleware.

---

## 2. Tailwind CSS 4 Integration

**Decision**: Use the `@tailwindcss/vite` Vite plugin — the correct approach for Tailwind v4.

**Rationale**: Tailwind v4 removed the PostCSS-config and `tailwind.config.js` approach. The Vite plugin is the first-class integration for Vite-based projects.

**Setup**:
```
npm install tailwindcss @tailwindcss/vite
```
`vite.config.ts` — add to plugins: `tailwindcss()` before `sveltekit()`
`src/app.css`: `@import "tailwindcss";`

**Alternatives considered**: `@tailwindcss/postcss` — adds an extra config file; Vite plugin is simpler.

---

## 3. Vite+ Toolchain

**Decision**: Install `viteplus` as a dev dependency and wire `check` and `test` scripts.

**Rationale**: Vite+ check bundles Oxlint + Oxfmt + tsgo for fast linting, formatting, and type checking. Vite+ test is a Vitest wrapper. Both read the existing `vite.config.ts` without conflict.

**Package scripts**:
```json
"check": "viteplus check",
"test":  "viteplus test"
```

---

## 4. REST Countries API — Fetch & Cache Strategy

**Decision**: Fetch `https://restcountries.com/v3.1/all?fields=name,flags,region,subregion,cca3` once on first app load, normalize to internal `Country` type, store under `localStorage` key `vexillologist_countries_v2`.

**Fields used**: `name.common`, `flags.svg`, `flags.alt`, `region`, `subregion`, `cca3`.

**Cache shape**: `{ schemaVersion: 2, fetchedAt: number, countries: Country[] }`

**Cache invalidation**: On app start, check key + `schemaVersion`. Mismatch → re-fetch and overwrite. No background re-fetch in MVP to keep offline behaviour predictable.

**Error on fetch failure**: Full-screen error + "Retry" button; game cannot start until data loads.

**Alternatives considered**: Wikipedia/Wikidata — richer but no structured flag data; flagpedia.net — flags only, no country metadata.

---

## 5. Game State Machine

**Decision**: Discriminated-union state machine in pure TypeScript (`src/lib/game/engine.ts`), exposed to Svelte via a `.svelte.ts` store using Svelte 5 runes.

**States**: `idle` → `loading` → `error` | `question_active` → `feedback` (1.5 s) → `question_active` | `round_complete`

**Timer**: `setInterval` at 100 ms ticks. Elapsed computed from `performance.now()` start timestamp on each tick — tab backgrounding doesn't cause drift because absolute time is used, not accumulated deltas.

**Scoring**: `score = (1000 + floor(secondsRemaining) * 10) * streakMultiplier`, captured at exact moment of answer submission.

**Rationale**: Framework-agnostic engine is fully testable with Vitest without mounting components.

---

## 6. Distractor Selection

**Decision**: Three-tier fallback — same region → same subregion → random from full pool. All 4 options shuffled before display.

**Rationale**: Same-region distractors are harder (similar visual styles, geography clues). Fallback ensures correctness when regions are small.

---

## 7. Drizzle ORM + Turso

**Decision**: `drizzle-orm` + `@libsql/client`. Schema in `src/lib/db/schema.ts`, migrations via `drizzle-kit`. Connection via `TURSO_URL` + `TURSO_AUTH_TOKEN` env vars.

**MVP scope**: Schema-only scaffolding for Lucia session tables. localStorage is the active score store in MVP.

---

## 8. Lucia Auth

**Decision**: Lucia v3 with `@lucia-auth/adapter-drizzle` backed by Turso.

**Note**: Lucia v3 was archived by its maintainer in late 2024. It remains usable for MVP; migration to `better-auth` is recommended post-MVP.

**MVP scope**: Auth scaffolding present; game is fully playable anonymously. Auth enables future cloud score sync.

---

## 9. localStorage Schema

**Country cache key**: `vexillologist_countries_v2`
**Scores key**: `vexillologist_scores_v1`

**Scores shape**: `{ scores: ScoreEntry[] }` — max 10 entries, sorted by score descending.

**Unavailability handling**: try/catch on all reads/writes; game proceeds without persistence, shows non-blocking banner.
