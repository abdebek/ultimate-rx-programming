# Ultimate Reactive Programming

An interactive Slidev course teaching the fundamentals of Reactive Programming with animated marble diagrams and quizzes. Covers RxJS and Rx.NET side by side.

## Quick Start

```bash
npm install
npm run dev
```

Open the printed URL (default `http://localhost:3030/`).

## Scripts

| Command | Description |
| :-- | :-- |
| `npm run dev` | Start the dev server with live reload |
| `npm run build` | Build the static SPA into `dist/` |
| `npm run export` | Export slides to PDF |
| `npm run export-pptx` | Export slides to PPTX |

## Course Structure

9 lessons, each following the same pattern:

1. **Explanation** — analogy-led intro with concept tables
2. **Visualization** — animated marble diagrams (predict before reveal)
3. **RxJS example** — TypeScript code snippet
4. **Rx.NET example** — C# code snippet (matching I/O)
5. **Summary** — key takeaways
6. **Quiz** — multiple choice with explanations

### Lessons

| # | Topic | Key Operators |
| :- | :-- | :-- |
| 1 | Observables & Subscriptions | `new Observable`, `subscribe` |
| 2 | Creation Operators | `of`, `from`, `range` |
| 3 | Transformation & Filtering | `map`, `filter`, `take` |
| 4 | Higher-Order Mapping | `switchMap` |
| 5 | SelectMany / mergeMap | `mergeMap`, `SelectMany` |
| 6 | Subjects & Memory | `Subject`, `BehaviorSubject` |
| 7 | Combining Streams | `combineLatest` |
| 8 | Error Handling | `catchError`, `retry` |
| 9 | Recap & Final Quiz | — |

## Project Layout

```
.
├── components/
│   ├── AnimatedMarble.vue   # Marble diagram engine (play/pause/reset/step)
│   └── QuizWidget.vue        # Accessible multiple-choice quiz
├── setup/
│   ├── types.ts              # Strict TypeScript interfaces
│   └── quiz-data.ts          # Centralized quiz bank (9 questions)
├── snippets/                 # RxJS (.ts) and Rx.NET (.cs) code examples
├── slides/                   # Generated lesson markdown
├── styles/
│   ├── tokens.css            # Design tokens (light/dark, role-based palette)
│   └── index.ts              # Style entry (imports tokens.css)
├── slides.md                 # Main entry — imports lessons via src:
└── .temp/scripts/            # Lesson + quiz generators (gitignored)
```

## Architecture

### Role-Based Color System

Marble colors are **semantic roles**, not hues. The actual color is a view-mode-dependent detail owned by `styles/tokens.css`:

| Role | Meaning |
| :-- | :-- |
| `source` | Input stream |
| `inner` | Nested stream (higher-order mapping) |
| `output` | Transformed result |
| `fallback` | Recovery stream (error handling) |
| `error` | Terminal failure |
| `discarded` | Filtered out |
| `hot` | Multicast / Subject |

Changing a role's color is a one-line edit in `tokens.css` — no component or lesson changes.

### AnimatedMarble Component

- Animation driven by `marble.time` (never hardcoded CSS delays)
- Exposes `play()`, `pause()`, `reset()`, `step()` via `defineExpose`
- Integrates with Slidev click progression (`$clicks`)
- Supports `visibleLanes` prop for the predict-before-reveal beat
- Auto-plays on slide enter, resets on leave
- CSS keyframes + transforms (no animation libraries)

### QuizWidget Component

- Keyboard accessible (Arrow/Enter/Space/Escape)
- Immediate feedback with explanation
- Prevents accidental reselection
- Consumes centralized quiz bank by index

### Dark Mode

All colors use CSS custom properties with `:root` (light) and `.dark` (dark) variants. Toggle via Slidev's theme switch — every diagram and quiz adapts automatically.

## Regenerating Lessons

Lessons are generated from scripts in `.temp/scripts/`:

```bash
node .temp/scripts/lesson-1.cjs   # Lessons 1-3
node .temp/scripts/lesson-2.cjs   # Lessons 4-9
node .temp/scripts/quiz-data.cjs  # Quiz bank
```

Generated files go to `.temp/scripts/*.md` — copy them to `slides/`:

```bash
cp .temp/scripts/lesson-*.md slides/
```

## Tech Stack

- [Slidev](https://sli.dev) v52
- Vue 3.5 (`<script setup lang="ts">`)
- TypeScript (strict mode)
- UnoCSS (bundled with Slidev)
- Standard CSS (no external animation/UI libraries)

## License

MIT