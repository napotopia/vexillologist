# Feature Specification: Vexillologist — Flag Quiz Game

**Feature Branch**: `001-flag-quiz-game`
**Created**: 2026-04-28
**Status**: Draft

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Play a Scored Round (Priority: P1)

A player opens the app, clicks "Play", and is shown 10 country flags in sequence. For
each flag, they must select the correct country from 4 options before a 15-second timer
expires. At the end of the round their total score is displayed and saved locally.

**Why this priority**: This is the core game loop. Without it nothing else is meaningful.

**Independent Test**: Can be tested by starting the app, completing a 10-flag round, and
verifying a non-zero score appears on the result screen. No auth or prior data required.

**Acceptance Scenarios**:

1. **Given** a player on the home screen, **When** they click "Play", **Then** the game
   begins immediately and shows the first flag with a 4-option choice grid and a 15-second
   countdown.
2. **Given** a flag is displayed with a countdown, **When** the player selects the correct
   answer before the timer expires, **Then** the choice is marked correct, score increases
   by (1000 + seconds_remaining × 10), and the game advances to the next flag.
3. **Given** a flag is displayed, **When** the player selects a wrong answer, **Then** the
   choice is marked incorrect, the correct answer is revealed briefly, and 0 points are
   awarded for that flag.
4. **Given** a flag is displayed, **When** the 15-second timer reaches 0, **Then** the
   flag counts as wrong (0 points), the correct answer is revealed briefly, and the game
   advances.
5. **Given** the player has answered 10 flags, **When** the last flag resolves, **Then** a
   result screen shows total score and the round is saved to local history.

---

### User Story 2 — Streak Multiplier (Priority: P2)

A player on a correct-answer streak receives a multiplier bonus that amplifies their
score, incentivising consecutive correct answers.

**Why this priority**: Core scoring mechanic that adds depth to the game loop; depends on
US1 being complete.

**Independent Test**: Complete a round answering flags in a specific pattern (e.g., 3
correct in a row) and verify the displayed multiplier matches the expected tier and that
the score reflects it.

**Acceptance Scenarios**:

1. **Given** a player answers 3 consecutive flags correctly, **When** the 4th flag
   appears, **Then** a "1.5×" streak indicator is visibly displayed and the score for
   correct answers in this streak is multiplied by 1.5.
2. **Given** a player answers 6 consecutive flags correctly, **When** the 7th flag
   appears, **Then** the streak indicator updates to "2×" and correct answers are
   multiplied by 2.
3. **Given** a player is on a streak, **When** they answer incorrectly or the timer
   expires, **Then** the streak indicator resets to 1× immediately.

---

### User Story 3 — Local Leaderboard (Priority: P3)

The home screen displays the player's personal top-10 all-time scores so they can track
improvement and aim to beat their personal best.

**Why this priority**: Provides motivation to replay; requires US1 to generate scores.

**Independent Test**: Complete two rounds, navigate to the home screen, and verify both
scores appear in the leaderboard sorted by highest score first.

**Acceptance Scenarios**:

1. **Given** a player completes a round, **When** they return to the home screen, **Then**
   their score appears in the leaderboard with the date/time of the round.
2. **Given** more than 10 rounds have been played, **When** the leaderboard is shown,
   **Then** only the top 10 scores by value are displayed.
3. **Given** no rounds have been played yet, **When** the home screen is shown, **Then** a
   friendly empty-state message is shown in place of the leaderboard.

---

### User Story 4 — Offline Play After First Load (Priority: P4)

After the player has launched the app at least once with internet access, subsequent
sessions can be played without a network connection.

**Why this priority**: Quality-of-life for mobile users; depends on US1 infrastructure.

**Independent Test**: Load the app with network, disconnect network, reload the page, and
verify a full round can be completed.

**Acceptance Scenarios**:

1. **Given** the app has been loaded at least once with a network connection, **When** the
   player opens the app without a network connection, **Then** the game loads and all 10
   flags in a round are displayed correctly.
2. **Given** the app is running offline, **When** the player completes a round, **Then**
   the score is saved locally and visible on the leaderboard.

---

### Edge Cases

- What happens if fewer than 4 countries share a region with the correct answer? The
  distractor pool falls back to any 3 random countries from the full set.
- What happens if the REST Countries API is unreachable on first load? The app shows a
  clear error message and a "Retry" button; the game cannot start until data is loaded.
- What if localStorage is unavailable (e.g., private browsing with storage blocked)? The
  game still plays but scores are not persisted; a non-blocking notice informs the player.
- What if the player navigates away mid-round? The round is abandoned; no partial score is
  saved.
- What if the same flag appears twice in one round? Not allowed — each round draws 10
  distinct countries without replacement.
- What if an individual flag image fails to load during a round? The failed country is
  silently replaced with the next unused country from the pre-drawn pool. The round always
  completes with exactly 10 scored questions.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a country flag image with an accessible text
  description for each question.
- **FR-002**: The system MUST present exactly 4 answer choices per flag: 1 correct and 3
  distractors.
- **FR-003**: Distractor countries MUST be selected preferentially from the same
  geographic region as the correct country.
- **FR-004**: Each round MUST consist of exactly 10 distinct countries drawn randomly
  without replacement.
- **FR-005**: A visible countdown timer MUST count from 15 to 0 seconds for each flag.
- **FR-006**: The timer display MUST change appearance (colour and label) when 5 or fewer
  seconds remain to communicate urgency.
- **FR-007**: The score for a correct answer MUST equal (1000 + (floor(seconds_remaining) × 10))
  multiplied by the active streak multiplier, where seconds_remaining is floored to the
  nearest whole second at the moment the answer is submitted.
- **FR-008**: An incorrect answer or timer expiry MUST award 0 points and reveal the
  correct answer for exactly 1.5 seconds before automatically advancing to the next flag.
  The player cannot skip the feedback period.
- **FR-009**: The streak multiplier MUST be 1.5× after 3 consecutive correct answers and
  2× after 6 consecutive correct answers, resetting to 1× on any wrong answer or timeout.
- **FR-010**: A visible streak indicator MUST be shown during play.
- **FR-011**: After a round ends, the final score MUST be saved to local browser storage.
- **FR-012**: The home screen MUST display the top 10 all-time scores from local storage,
  sorted by score descending, each with a timestamp.
- **FR-013**: Players MUST be able to select answers using keyboard digit keys 1–4.
- **FR-014**: All country data MUST be cached in local browser storage after the first
  successful network load, enabling offline play.
- **FR-015**: The cache MUST be versioned so that future data schema changes invalidate
  stale cached data automatically.

### Key Entities

- **Country**: Name (common), flag image URL, flag alt-text description, geographic
  region, subregion.
- **Round**: Ordered list of 10 Country entries drawn for a single game session.
- **Flag Question**: One Country (the correct answer) + 3 distractor Countries + remaining
  seconds when answered.
- **Score Entry**: Total score (integer), timestamp, number of correct answers out of 10.
- **Streak**: Current consecutive-correct count (integer ≥ 0); derived, not stored.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A player can start and complete a full 10-flag round in under 3 minutes.
- **SC-002**: Flag images and all 4 answer choices are visible and selectable on screens
  320 px wide and above.
- **SC-003**: A completed round score appears on the home screen leaderboard within 1
  second of the player returning to the home screen.
- **SC-004**: The game is fully playable after first load without any network connection.
- **SC-005**: Keyboard navigation (digit keys 1–4, Tab/Shift-Tab) allows completing a
  full round without touching a mouse or touchscreen.
- **SC-006**: Every flag image includes a text alternative that accurately describes the
  flag's visual appearance.

## Clarifications

### Session 2026-04-28

- Q: How long is the feedback period after a wrong answer or timeout, and can the player skip it? → A: 1.5 seconds, auto-advance, not skippable.
- Q: What happens when an individual flag image fails to load mid-round? → A: Silently replace with the next unused country from the pool; round always completes with 10 questions.
- Q: Should seconds_remaining in the scoring formula use whole seconds or fractional? → A: Floor to nearest whole second at time of answer submission.

## Assumptions

- The REST Countries API (`restcountries.com`) is used as the sole source for country data
  and flag imagery; no additional flag datasets are included in the MVP.
- Only sovereign countries (~250 entries) are in scope; sub-national flags (states,
  provinces, territories) are excluded.
- Scores are personal/local only; no server-side leaderboard or social sharing in MVP.
- There is no user authentication in MVP; all data is anonymous and device-local.
- The app is a single-page web application accessed via a modern browser (Chrome, Firefox,
  Safari, Edge — current and one prior major version).
- The game is played in English only; country names are the English common names from the
  REST Countries API.
- Distractor quality is best-effort: if fewer than 3 other countries exist in the same
  region, the remainder are drawn randomly from the full country pool.
