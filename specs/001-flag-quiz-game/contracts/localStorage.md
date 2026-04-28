# Contract: localStorage Interface

**Type**: Client-side storage contract
**Date**: 2026-04-28

This document defines the exact shape of every key written to `localStorage`.
Any change to a key name or value schema requires a version bump of the key suffix.

---

## Key: `vexillologist_countries_v2`

**Written by**: `src/lib/api/countries.ts` on first successful fetch (or cache miss)
**Read by**: `src/lib/api/countries.ts` on every app start

```ts
type CountryCachePayload = {
  schemaVersion: 2;
  fetchedAt: number;       // Unix ms timestamp
  countries: {
    cca3: string;
    name: string;
    flagUrl: string;
    flagAlt: string;
    region: string;
    subregion: string;
  }[];
};
```

**Invariants**:
- `schemaVersion` is a literal `2` — mismatch triggers full re-fetch
- `countries.length` is 200–300 (REST Countries API returns ~250)
- `flagAlt` is non-empty for every entry (entries with empty alt are filtered out at fetch time)
- If the key is absent or JSON.parse throws, treat as cache miss

---

## Key: `vexillologist_scores_v1`

**Written by**: `src/lib/game/engine.ts` on `round_complete` transition
**Read by**: `src/routes/+page.svelte` (home/leaderboard)

```ts
type ScoreStoragePayload = {
  scores: {
    totalScore: number;     // integer ≥ 0
    correctCount: number;   // integer 0–10
    playedAt: number;       // Unix ms timestamp
  }[];
};
```

**Invariants**:
- `scores.length` ≤ 10 (trimmed to top-10 by `totalScore` descending on each write)
- `scores` is always sorted descending by `totalScore`
- If the key is absent or unparseable, treat as empty `{ scores: [] }`

---

## Error Handling

All reads and writes are wrapped in try/catch. On any localStorage error:
- Reads: return the documented empty/null default
- Writes: silently swallow; set a module-level `storageUnavailable` flag so the UI can show a non-blocking banner (shown once per session)
