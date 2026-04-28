# Contract: Game Engine API

**Type**: TypeScript module interface
**File**: `src/lib/game/engine.ts`
**Date**: 2026-04-28

The game engine is a pure TypeScript module (no Svelte imports). It exposes a factory
function that returns a state machine controller. Svelte components interact with it only
through the store in `src/lib/stores/game.svelte.ts`.

---

## Exported Types

```ts
export type Country = { ... };          // see data-model.md
export type FlagQuestion = { ... };
export type Round = { ... };
export type AnsweredQuestion = { ... };
export type ScoreEntry = { ... };
export type GameState = { ... };        // discriminated union — see data-model.md
```

---

## Exported Functions

### `buildRound(countries: Country[]): Round`

Draws 10 distinct countries at random from the provided pool. Builds a `FlagQuestion` for
each, including distractors selected by the three-tier regional strategy. Returns a `Round`
with `currentIndex: 0` and a `pool` of remaining countries for image-load fallbacks.

**Constraints**: `countries.length` must be ≥ 13 (10 for round + 3 minimum distractors).
Throws `Error('Insufficient country data')` if violated.

---

### `computeScore(secondsRemaining: number, multiplier: 1 | 1.5 | 2): number`

Returns `(1000 + Math.floor(secondsRemaining) * 10) * multiplier`.
`secondsRemaining` is clamped to [0, 15] before computation.

---

### `nextMultiplier(streak: number): 1 | 1.5 | 2`

Returns the streak multiplier for the given streak count:
- 0–2 → `1`
- 3–5 → `1.5`
- 6+  → `2`

---

### `selectDistractors(correct: Country, pool: Country[]): [Country, Country, Country]`

Implements the three-tier fallback strategy. Returns exactly 3 distractors.
`pool` must not contain `correct` (caller's responsibility).

---

### `replaceFlagOnError(round: Round, failedIndex: number): Round`

Returns a new `Round` with the failed question replaced by the next country from
`round.pool`. If `pool` is empty, the failed question is kept as-is (extremely rare edge
case with < 10 countries in cache — treated as acceptable degradation).

---

## Constraints

- No `fetch`, `localStorage`, `setTimeout`, or DOM calls in this module
- All functions are pure (same input → same output for non-random functions)
- `buildRound` and `selectDisractors` use a seedable Fisher-Yates shuffle (seeded from
  `Math.random()` in production; injectable for tests)
