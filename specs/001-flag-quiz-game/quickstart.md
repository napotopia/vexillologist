# Quickstart: Vexillologist — Flag Quiz Game

**Branch**: `001-flag-quiz-game` | **Date**: 2026-04-28

## Prerequisites

- Node.js 20+ (`node --version`)
- npm 10+ (`npm --version`)
- A Turso account and CLI (`turso --version`) — optional for MVP (auth scaffold only)

---

## 1. Scaffold the SvelteKit project

From the project root (`/vexillologist`):

```bash
npx sv create .
# Select: Skeleton project, TypeScript, Vitest (yes), Prettier (yes)
```

---

## 2. Install dependencies

```bash
npm install tailwindcss @tailwindcss/vite
npm install drizzle-orm @libsql/client
npm install lucia @lucia-auth/adapter-drizzle
npm install -D drizzle-kit viteplus
```

---

## 3. Configure Tailwind

Add to `vite.config.ts`:
```ts
import tailwindcss from '@tailwindcss/vite';
// plugins: [tailwindcss(), sveltekit()]
```

Create `src/app.css`:
```css
@import "tailwindcss";
```

Import in `src/routes/+layout.svelte`:
```svelte
<script>
  import '../app.css';
</script>
```

---

## 4. Update package.json scripts

```json
{
  "scripts": {
    "dev":   "vite dev",
    "build": "vite build",
    "check": "viteplus check",
    "test":  "viteplus test"
  }
}
```

---

## 5. Set up Turso (optional — for auth scaffold)

```bash
turso db create vexillologist
turso db tokens create vexillologist
```

Create `.env.local`:
```
TURSO_URL=libsql://vexillologist-<account>.turso.io
TURSO_AUTH_TOKEN=<token>
```

Run migrations:
```bash
npx drizzle-kit migrate
```

---

## 6. Run the dev server

```bash
npm run dev
# → http://localhost:5173
```

---

## 7. Validate the golden path

1. Open `http://localhost:5173` — home screen loads, leaderboard shows empty state
2. Click "Play" — app fetches country data (check Network tab: one request to `restcountries.com`)
3. Complete a round — score appears on result screen
4. Navigate home — score appears in leaderboard
5. Refresh — score persists (localStorage)
6. Throttle network to offline in DevTools — start new round — flags still load from cache
7. Run `npm run check` — zero errors
8. Run `npm run test` — all tests pass
