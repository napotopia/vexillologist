# Data Model: Vexillologist — Flag Quiz Game

**Branch**: `001-flag-quiz-game` | **Date**: 2026-04-28

## Client-Side Entities (TypeScript)

### Country

Sourced from REST Countries API. Normalized on fetch and cached.

```ts
interface Country {
  cca3: string;          // ISO 3166-1 alpha-3 — unique key
  name: string;          // English common name
  flagUrl: string;       // SVG URL from flagcdn.com
  flagAlt: string;       // Accessible description from API
  region: string;        // e.g. "Europe", "Africa", "Americas"
  subregion: string;     // e.g. "Western Europe", "Southern Africa"
}
```

**Uniqueness**: `cca3` is the unique identifier. No two countries share a `cca3`.
**Constraints**: `flagAlt` must be non-empty for WCAG AA compliance (FR-001).

---

### FlagQuestion

Represents one question within an active round.

```ts
interface FlagQuestion {
  correct: Country;
  distractors: [Country, Country, Country];  // always exactly 3
  choices: [Country, Country, Country, Country]; // shuffled: correct + distractors
  choiceOrder: [0, 1, 2, 3];                 // indices mapping keys 1–4 to choices[]
}
```

**Constraints**: `correct` must not appear in `distractors`. All 4 countries must be distinct.

---

### Round

Ephemeral — lives only in memory during an active game session.

```ts
interface Round {
  questions: FlagQuestion[];   // exactly 10, drawn without replacement
  currentIndex: number;        // 0–9
  pool: Country[];             // remaining countries available as image-load fallbacks
}
```

**Constraints**: `questions.length === 10`. `pool` must have enough entries to replace any failed flag image (drawn from remaining after the 10 are selected).

---

### AnsweredQuestion

Recorded after the player submits an answer (or timer expires).

```ts
interface AnsweredQuestion {
  question: FlagQuestion;
  selectedCca3: string | null;   // null = timeout
  wasCorrect: boolean;
  secondsRemainingAtAnswer: number;  // floor(seconds), 0–15
  baseScore: number;                 // 0 or (1000 + secondsRemaining * 10)
  multiplierApplied: number;         // 1, 1.5, or 2
  finalScore: number;                // baseScore * multiplierApplied
}
```

---

### ScoreEntry

Persisted to localStorage after a round completes.

```ts
interface ScoreEntry {
  totalScore: number;       // sum of all finalScore values
  correctCount: number;     // 0–10
  playedAt: number;         // Unix timestamp ms (Date.now())
}
```

**Persistence**: Up to 10 entries in localStorage key `vexillologist_scores_v1`, sorted by `totalScore` descending. On write, merge new entry, sort, slice to 10.

---

### GameState (discriminated union)

The complete state machine type driving the UI.

```ts
type GameState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'error'; message: string }
  | {
      phase: 'question_active';
      round: Round;
      question: FlagQuestion;
      streak: number;
      multiplier: 1 | 1.5 | 2;
      timeLeft: number;         // ms remaining (updated at 100 ms interval)
      answered: AnsweredQuestion[];
    }
  | {
      phase: 'feedback';
      round: Round;
      last: AnsweredQuestion;
      streak: number;
      multiplier: 1 | 1.5 | 2;
      answered: AnsweredQuestion[];
    }
  | {
      phase: 'round_complete';
      entry: ScoreEntry;
      answered: AnsweredQuestion[];
    };
```

---

## Server-Side Entities (Drizzle + Turso — MVP scaffold only)

These tables exist in the schema for Lucia auth. Score sync is post-MVP.

### users

```ts
// src/lib/db/schema.ts
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
```

### sessions (Lucia)

```ts
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
});
```

### score_entries (future — not active in MVP)

```ts
export const scoreEntries = sqliteTable('score_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id),
  totalScore: integer('total_score').notNull(),
  correctCount: integer('correct_count').notNull(),
  playedAt: integer('played_at', { mode: 'timestamp' }).notNull(),
});
```

---

## State Transitions

```
idle
  → loading          (player clicks "Play" or app first mounts)

loading
  → error            (fetch fails)
  → question_active  (data loaded, round built)

error
  → loading          (player clicks "Retry")

question_active
  → feedback         (player selects answer OR timer reaches 0)

feedback             (auto-advances after 1.5 s)
  → question_active  (currentIndex < 9)
  → round_complete   (currentIndex === 9)

round_complete
  → idle             (player clicks "Home" or "Play Again")
```

---

## Streak Multiplier Rules

| Consecutive correct | Multiplier |
|---------------------|------------|
| 0–2                 | 1×         |
| 3–5                 | 1.5×       |
| 6+                  | 2×         |

Resets to 0 (→ 1×) on wrong answer or timeout.
