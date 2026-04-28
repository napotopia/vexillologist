# Tasks: Vexillologist — Flag Quiz Game

**Input**: Design documents from `specs/001-flag-quiz-game/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

---

## Phase 1: Setup

**Purpose**: Scaffold the SvelteKit project and configure the full toolchain.

- [x] T001 Scaffold SvelteKit 2 + Svelte 5 project in repo root using `npx sv create .` (skeleton, TypeScript, Vitest) — verify `src/`, `vite.config.ts`, `svelte.config.js` are created
- [x] T002 [P] Install Tailwind CSS 4 and configure `@tailwindcss/vite` plugin in `vite.config.ts`; create `src/app.css` with `@import "tailwindcss";`
- [x] T003 [P] Install `viteplus` dev dependency; update `package.json` scripts: `"check": "viteplus check"` and `"test": "viteplus test"`
- [x] T004 [P] Install Drizzle ORM deps: `drizzle-orm @libsql/client drizzle-kit`
- [x] T005 [P] Install Lucia auth deps: `lucia @lucia-auth/adapter-drizzle`
- [x] T006 Import `src/app.css` in `src/routes/+layout.svelte`; verify Tailwind utility classes render in dev server

---

## Phase 2: Foundational

**Purpose**: Core infrastructure that ALL user stories depend on. MUST complete before any story work.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T007 Create `src/lib/db/schema.ts` with Drizzle table definitions: `users` (id, email, createdAt), `sessions` (id, userId, expiresAt), `scoreEntries` (id, userId, totalScore, correctCount, playedAt)
- [x] T008 Create `src/lib/db/client.ts` — server-only Turso LibSQL client reading `TURSO_URL` and `TURSO_AUTH_TOKEN` from `$env/static/private`
- [x] T009 Create `drizzle.config.ts` pointing to `src/lib/db/schema.ts` and Turso URL; add `.env.local` to `.gitignore`; document required env vars in `.env.example`
- [x] T010 Create `src/app.d.ts` extending `App.Locals` with `{ user: import('lucia').User | null; session: import('lucia').Session | null }`
- [x] T011 Create `src/hooks.server.ts` with Lucia session validation middleware that sets `event.locals.user` and `event.locals.session` on every request
- [x] T012 Define all shared TypeScript types in `src/lib/types.ts`: `Country`, `FlagQuestion`, `Round`, `AnsweredQuestion`, `ScoreEntry`, `GameState` (discriminated union) — exact shapes from `data-model.md`
- [x] T013 [P] Create `src/lib/api/countries.ts` — REST Countries API client: `fetchCountries()` hits `https://restcountries.com/v3.1/all?fields=name,flags,region,subregion,cca3`, normalizes to `Country[]`, returns raw data without caching
- [x] T014 [P] Create `src/lib/api/countries.test.ts` — Vitest tests for `fetchCountries()` response normalization: verify `cca3`, `name`, `flagUrl`, `flagAlt`, `region`, `subregion` are mapped correctly from mock API response

**Checkpoint**: Foundation ready — Drizzle schema, Lucia middleware, shared types, and Countries API client exist. User story implementation can now begin.

---

## Phase 3: User Story 1 — Play a Scored Round (Priority: P1) 🎯 MVP

**Goal**: Complete core game loop: load data → show flag → pick answer → score → round end.

**Independent Test**: Start dev server, click Play, complete 10 flags, verify a non-zero score on result screen. No auth or prior data required.

### Implementation for User Story 1

- [x] T015 [P] [US1] Create `src/lib/game/distractors.ts` — `selectDistractors(correct: Country, pool: Country[]): [Country, Country, Country]` using three-tier regional fallback from `contracts/gameEngine.md`
- [x] T016 [P] [US1] Create `src/lib/game/distractors.test.ts` — Vitest tests: same-region preference, subregion fallback, random fallback when pool is short, correct country never appears in distractors
- [x] T017 [US1] Create `src/lib/game/engine.ts` — pure TS functions: `buildRound(countries)`, `computeScore(secondsRemaining, multiplier)`, `nextMultiplier(streak)`, `replaceFlagOnError(round, failedIndex)` per `contracts/gameEngine.md` (depends on T015)
- [x] T018 [US1] Create `src/lib/game/engine.test.ts` — Vitest tests: `computeScore` formula (floor + multiplier), `nextMultiplier` thresholds (0-2→1×, 3-5→1.5×, 6+→2×), `buildRound` produces 10 distinct countries, `replaceFlagOnError` swaps from pool
- [x] T019 [US1] Create `src/lib/cache/countries.ts` — localStorage cache layer: `loadCountries(): Country[] | null` reads and validates `vexillologist_countries_v2`, `saveCountries(countries)` writes cache; all ops in try/catch; export `storageUnavailable: boolean` flag per `contracts/localStorage.md`
- [x] T020 [US1] Create `src/lib/cache/countries.test.ts` — Vitest tests using real localStorage (jsdom): cache hit returns data, schema version mismatch returns null, JSON parse error returns null, write then read round-trips correctly
- [x] T021 [US1] Create `src/lib/stores/game.svelte.ts` — Svelte 5 runes store: `$state<GameState>` wrapping engine; exports `startRound()`, `submitAnswer(cca3)`, `onTimerTick()`, `resetToIdle()`; uses `setInterval` at 100 ms with `performance.now()` for timer; calls `replaceFlagOnError` on flag load errors (depends on T017, T019)
- [x] T022 [US1] Create `src/routes/game/+page.ts` — `load` function that reads country cache (T019) and returns `{ countries }` before route renders; if cache miss, triggers fetch via T013
- [x] T023 [US1] Create `src/components/FlagImage.svelte` — `<img>` with `src={flagUrl}` and `alt={flagAlt}`; `onerror` handler calls store's `replaceFlagOnError`; aspect ratio preserved, never overflows container; `loading="eager"`
- [x] T024 [US1] Create `src/components/Timer.svelte` — receives `timeLeft: number` (ms) prop; displays `Math.ceil(timeLeft/1000)` seconds; applies `text-red-600` + `aria-label="Hurry!"` when `timeLeft < 5000`; includes progress bar
- [x] T025 [US1] Create `src/components/ChoiceGrid.svelte` — 2×2 grid of 4 answer buttons; props: `choices: Country[]`, `onSelect: (cca3: string) => void`, `disabled: boolean`; buttons have `aria-label="Option {n}: {name}"`; document-level keydown listener for digits 1–4; min 44×44 px touch targets
- [x] T026 [US1] Create `src/components/ScoreBar.svelte` — displays current total score and `{currentIndex + 1}/10` flag counter
- [x] T027 [US1] Create `src/routes/game/+page.svelte` — game screen composing FlagImage, Timer, ChoiceGrid, ScoreBar; subscribes to game store; shows feedback state (correct=green, wrong=red) for 1.5 s before auto-advancing; shows round_complete screen with final score and "Play Again" / "Home" buttons
- [x] T028 [US1] Create `src/lib/cache/scores.ts` — localStorage score persistence: `loadScores(): ScoreEntry[]` reads `vexillologist_scores_v1`, `saveScore(entry: ScoreEntry)` merges, sorts by totalScore desc, slices to 10, writes back; try/catch on all ops
- [x] T029 [US1] Wire `saveScore` call in game store when `round_complete` transition fires (depends on T028, T021)

**Checkpoint**: User Story 1 fully functional — complete a round, score appears, persists on refresh.

---

## Phase 4: User Story 2 — Streak Multiplier (Priority: P2)

**Goal**: Streak counter drives 1.5× and 2× score multipliers; visible indicator during play.

**Independent Test**: Complete a round with 3+ consecutive correct answers; verify multiplier badge shows "1.5×" and score reflects multiplication.

### Implementation for User Story 2

- [x] T030 [US2] Create `src/components/StreakBadge.svelte` — displays current multiplier (`1×` / `1.5×` / `2×`) with visual differentiation (e.g., gold colour at 1.5×, pulsing at 2×); hidden when multiplier is 1× and streak is 0
- [x] T031 [US2] Add `StreakBadge` to `src/routes/game/+page.svelte` game screen layout, positioned near ScoreBar (depends on T030, T027)
- [x] T032 [US2] Verify `engine.test.ts` covers streak reset on wrong answer/timeout and multiplier escalation at boundaries 3 and 6 — add missing cases to T018 if needed

**Checkpoint**: User Stories 1 and 2 work together — streak badge visible, score multiplied correctly.

---

## Phase 5: User Story 3 — Local Leaderboard (Priority: P3)

**Goal**: Home screen shows top-10 personal scores from localStorage with timestamps.

**Independent Test**: Complete two rounds; navigate to `/`; verify both scores appear sorted by score descending with formatted dates.

### Implementation for User Story 3

- [x] T033 [US3] Create `src/components/LeaderBoard.svelte` — reads `loadScores()` from T028; renders sorted list of up to 10 entries with score, `correctCount/10`, and formatted date (`Intl.DateTimeFormat`); shows friendly empty-state message when no scores exist
- [x] T034 [US3] Create `src/components/PlayButton.svelte` — large CTA button navigating to `/game`; min 44×44 px touch target
- [x] T035 [US3] Create `src/routes/+page.svelte` — home screen composing LeaderBoard and PlayButton; app title; layout works at 320 px width

**Checkpoint**: All three stories independently functional — leaderboard updates after each round.

---

## Phase 6: User Story 4 — Offline Play After First Load (Priority: P4)

**Goal**: Game plays fully without network after at least one successful load.

**Independent Test**: Load app with network, disconnect, reload page, complete a full round — all flags display correctly from cache.

### Implementation for User Story 4

- [x] T036 [US4] Add `storageUnavailable` banner to `src/routes/+layout.svelte` — non-blocking notice shown once per session when localStorage is unavailable (reads flag from T019)
- [x] T037 [US4] Verify `src/routes/game/+page.ts` load function handles cache-hit path (no network call) and cache-miss path (fetch + save) correctly; add inline test scenario to `quickstart.md`
- [x] T038 [US4] Add fetch error UI to `src/routes/game/+page.svelte` — full-screen error message + "Retry" button shown when `GameState.phase === 'error'`

**Checkpoint**: All 4 user stories complete. Offline play verified via DevTools network throttle.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility audit, keyboard nav validation, type checking, final test run.

- [x] T039 [P] Run `npm run check` (Vite+ check) — fix all TypeScript and lint errors to zero
- [x] T040 [P] Run `npm run test` (Vite+ test / Vitest) — confirm all tests in engine.test.ts, distractors.test.ts, countries.test.ts, countries.test.ts (cache) pass
- [x] T041 Keyboard audit: verify digit keys 1–4 select answers in `ChoiceGrid.svelte`; Tab/Shift-Tab navigates interactive elements; no keyboard trap on feedback overlay
- [x] T042 Mobile audit at 320 px and 375 px: flag image maintains aspect ratio, choice grid is 2×2 without horizontal scroll, all touch targets ≥ 44×44 px
- [x] T043 [P] Add `<svelte:head>` with page title and meta description to `src/routes/+layout.svelte` and `src/routes/game/+page.svelte`
- [x] T044 Run quickstart.md golden path validation end-to-end (see `quickstart.md` step 7)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately; T002–T005 run in parallel after T001
- **Foundational (Phase 2)**: Depends on Phase 1 — T012–T014 can run in parallel with T007–T011
- **User Stories (Phase 3–6)**: All depend on Phase 2 completion
  - US1 (Phase 3) must complete before US2 (Phase 4) — streak badge integrates with game screen
  - US3 (Phase 5) depends on T028 (score persistence) from US1
  - US4 (Phase 6) depends on T019 (cache layer) from US1
- **Polish (Phase 7)**: Depends on all user stories being complete

### Within User Story 1

- T015, T016 (distractors) → T017, T018 (engine) — sequential
- T019, T020 (cache) — parallel with T015–T018
- T021 (store) — depends on T017, T019
- T022–T026 (route + components) — parallel with each other, depend on T021
- T027 (game page) — depends on T022–T026
- T028 (scores cache) → T029 (wire save) — after T027

### Parallel Opportunities

```bash
# Phase 1 — after T001 scaffolds:
T002 (Tailwind) & T003 (Vite+) & T004 (Drizzle) & T005 (Lucia)

# Phase 2:
T007-T011 (DB/auth) & T013-T014 (countries client)

# Phase 3 — US1:
T015-T016 (distractors) & T019-T020 (cache layer)
T022 (route load) & T023 (FlagImage) & T024 (Timer) & T025 (ChoiceGrid) & T026 (ScoreBar)

# Phase 7:
T039 (check) & T040 (test) & T043 (meta tags)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Play a full round, verify score persists after refresh
5. Continue to Phase 4 (streak UI) — adds depth without risk

### Incremental Delivery

1. Phase 1 + 2 → Foundation ready
2. Phase 3 (US1) → Playable game MVP
3. Phase 4 (US2) → Streak multiplier
4. Phase 5 (US3) → Leaderboard
5. Phase 6 (US4) → Offline guarantee
6. Phase 7 → Polish & ship

---

## Notes

- `[P]` = parallelizable (different files, no incomplete dependencies)
- `[US#]` maps to user story in spec.md
- Tests are included for logic-heavy modules per constitution Principle VI (scoring, streak, distractor, cache)
- UI component tests (snapshot) are NOT included per constitution
- All tasks include exact file paths — no guessing required during implementation
