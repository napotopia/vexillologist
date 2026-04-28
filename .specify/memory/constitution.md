<!--
SYNC IMPACT REPORT
Version change: [template] → 1.0.0
Modified principles: N/A (initial ratification)
Added sections: Core Principles, Tech Stack & Toolchain, Development Standards, Governance
Removed sections: All placeholder template sections replaced
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ aligned (Constitution Check gates apply)
  - .specify/templates/spec-template.md ✅ aligned (requirements format compatible)
  - .specify/templates/tasks-template.md ✅ aligned (phase structure compatible)
Follow-up TODOs: none
-->

# Vexillologist Constitution

## Core Principles

### I. TypeScript Strict — No Escape Hatches

All source files MUST use TypeScript with `strict: true`. The use of `any`, `@ts-ignore`,
and `as unknown as T` casts is forbidden except when wrapping a third-party library that
ships no types — in which case a single, isolated declaration file with a comment
explaining the absence of upstream types is required. `satisfies` and type predicates are
preferred over unsafe casts.

### II. Offline-First Gameplay

The game state machine MUST NOT make network requests during an active round. All country
data (names, flag URLs, regions, alt text) MUST be fetched once on first app load and
stored in `localStorage` under a versioned cache key. Subsequent sessions read from cache
and re-validate in the background. This keeps round latency at zero regardless of
connectivity.

### III. Accessibility is Non-Negotiable

Every flag image MUST render with the `alt` description provided by the REST Countries API
(e.g., "The flag of Portugal is …"). Interactive elements (answer buttons, timer, score)
MUST be reachable by keyboard (Tab/Shift-Tab, 1–4 digit keys for answer selection).
Colour alone MUST NOT convey state — urgency states (timer < 5 s) MUST use both colour
and a visible label/icon. Target WCAG AA compliance throughout.

### IV. Mobile-First Layout

All UI components MUST be designed and tested at 375 px viewport width first. Desktop
breakpoints are enhancements. Flag images MUST maintain aspect ratio and never overflow
their container. Touch targets MUST be at least 44 × 44 px. No horizontal scroll at any
supported viewport.

### V. Minimal, Purposeful Comments

Comments are written only when the WHY is non-obvious: a hidden external constraint, a
subtle invariant, or a workaround for a known third-party bug. Comments MUST NOT describe
what the code does (well-named identifiers do that). Multi-line comment blocks and
docstrings on obvious functions are forbidden.

### VI. Tests for Logic, Not Structure

Vitest tests (via Vite+ test) are REQUIRED for: scoring algorithm, streak multiplier,
distractor-selection logic, and the localStorage cache read/write layer. UI component
snapshot tests are NOT required. Tests MUST be co-located with source in `*.test.ts`
files. No mocking of `localStorage` — use a real implementation in the test environment.

## Tech Stack & Toolchain

- **Framework**: SvelteKit 2 + Svelte 5 (runes syntax preferred for new components)
- **Build / Dev**: Vite (via SvelteKit); Vite+ check for linting and type-checking;
  Vite+ test (Vitest) for unit tests
- **Styling**: Tailwind CSS 4 — utility classes only; no custom CSS files except for
  global resets
- **Flag data**: REST Countries API (`restcountries.com/v3.1`) — free, no API key;
  flag SVG from `flagcdn.com`
- **Database**: Drizzle ORM + Turso (LibSQL) — schema defined in `src/lib/db/schema.ts`
- **Auth**: Lucia — session-based auth backed by Turso
- **Local persistence**: `localStorage` for country cache and score history (MVP);
  server-side sync added when auth is enabled

## Development Standards

- All routes live under `src/routes/`; shared logic under `src/lib/`
- Game engine (state machine, scoring) lives in `src/lib/game/` — framework-agnostic
  TypeScript, importable from Svelte components and test files alike
- REST Countries API client lives in `src/lib/api/countries.ts` — single module
  responsible for fetch, cache read/write, and cache invalidation
- Drizzle schema changes require a migration file; no schema changes directly in
  production
- No feature flags, no backwards-compatibility shims — change the code directly

## Governance

This constitution supersedes all other development conventions for the vexillologist
project. Amendments require:
1. A documented reason (the problem or constraint that drives the change)
2. A version bump following semver semantics (MAJOR: principle removal or redefinition;
   MINOR: new principle or section; PATCH: clarification or wording fix)
3. The `Last Amended` date updated to today's date

All implementation plans and task lists MUST include a Constitution Check gate before
Phase 0 research. Any deviation from a principle in an implementation plan MUST be
documented in the Complexity Tracking table with justification.

**Version**: 1.0.0 | **Ratified**: 2026-04-28 | **Last Amended**: 2026-04-28
