---
layout: cover
class: text-center
level: 2
title: exhaustMap — ignore new emissions while an inner is active
---


# Lesson 11 · exhaustMap

---
layout: default-content
---

## A bouncer at the door

A bouncer lets one guest in at a time. While that guest is being served, anyone else who shows up is **turned away at the door** — no queue, no waiting room, just a polite "not now." That's `exhaustMap`: while the current inner subscription is **active**, every new source emission is **ignored**.

This is the fourth and final higher-order mapping strategy ("the four horsemen"):

| Strategy | RxJS | Rx.NET | Behavior |
| :-- | :-- | :-- | :-- |
| **Switch** | `switchMap` | `Select().Switch()` | Cancel previous inner |
| **Merge** | `mergeMap` | `SelectMany` | Let all inners run concurrently |
| **Concat** | `concatMap` | `Select().Concat()` | Queue inners, run one at a time |
| **Exhaust** | `exhaustMap` | `Select().Exhaust()` | Ignore new emissions while inner is active |

<v-click>

> The question you ask yourself: **are duplicate emissions wasteful?** If a second emission during an in-flight operation would only repeat work you're already doing (refresh, poll, submit) → `exhaustMap`. If every emission must produce a result → `mergeMap` / `concatMap` / `switchMap`.

</v-click>

---
layout: default-content
---

## The scenario · two clicks, same timing as Lessons 4 & 5

Same setup you've seen with switchMap and mergeMap: two clicks at t=0 and t=1, each spawning a ~1.5s inner. But this time — `exhaustMap`.

<AnimatedMarble
  title="Two clicks and their inner streams"
  :streams="[{ id: 'clicks', emissions: [{ id: 'click-1', value: '🔵', time: 0, lane: 0, role: 'source' }, { id: 'click-2', value: '🔵', time: 1, lane: 0, role: 'source' }] }, { id: 'inner-1', emissions: [{ id: 'A1', value: 'A1', time: 0.5, lane: 1, role: 'inner' }, { id: 'A2', value: 'A2', time: 1, lane: 1, role: 'inner' }, { id: 'A3', value: 'A3', time: 1.5, lane: 1, role: 'inner' }], complete: true }, { id: 'inner-2', emissions: [{ id: 'B1', value: 'B1', time: 2, lane: 2, role: 'inner' }, { id: 'B2', value: 'B2', time: 2.5, lane: 2, role: 'inner' }, { id: 'B3', value: 'B3', time: 3, lane: 2, role: 'inner' }], complete: true }, { id: 'output', emissions: [{ id: 'out-A1', value: 'A1', time: 0.5, lane: 3, role: 'output' }, { id: 'out-A2', value: 'A2', time: 1, lane: 3, role: 'output' }, { id: 'out-A3', value: 'A3', time: 1.5, lane: 3, role: 'output' }], complete: true }]"
  :duration="4"
  :lanes="4"
  :visible-lanes="[0, 1, 2]"
/>

<v-click>

> 🤔 **Predict**: click-2 arrives at t=1, while inner-1 is still active (it doesn't complete until t=1.5). With `exhaustMap`, what happens to click-2? Does inner-2 ever start? **Count the values on the output lane.**

</v-click>


---
layout: default-content
---

## Reveal

<div class="text-sm opacity-70 mb-2">exhaustMap ignores click-2 — inner-2 never starts</div>

<AnimatedMarble
  title="exhaustMap: ignore new emissions while the current inner is active"
  :streams="[{ id: 'clicks', emissions: [{ id: 'click-1', value: '🔵', time: 0, lane: 0, role: 'source' }, { id: 'click-2', value: '🔵', time: 1, lane: 0, role: 'source' }] }, { id: 'inner-1', emissions: [{ id: 'A1', value: 'A1', time: 0.5, lane: 1, role: 'inner' }, { id: 'A2', value: 'A2', time: 1, lane: 1, role: 'inner' }, { id: 'A3', value: 'A3', time: 1.5, lane: 1, role: 'inner' }], complete: true }, { id: 'output', emissions: [{ id: 'out-A1', value: 'A1', time: 0.5, lane: 3, role: 'output' }, { id: 'out-A2', value: 'A2', time: 1, lane: 3, role: 'output' }, { id: 'out-A3', value: 'A3', time: 1.5, lane: 3, role: 'output' }], complete: true }]"
  :duration="4"
  :lanes="4"
/>

<v-click>

> ✅ **Output: `A1, A2, A3` then `|`** — only three values. Click-2 at t=1 arrived while inner-1 was still active (completes at t=1.5), so it was **silently dropped**. Inner-2 never started — notice it has no emissions and no completion marker. Compare with switchMap (5 values, A3 cancelled) and mergeMap (6 values, interleaved). **The operator is a semantic decision.**

</v-click>


---
layout: default-content
---

## When to use exhaustMap

<v-clicks>

- **Refresh button** — user double-clicks "Refresh"; the second click is wasteful while the first request is in-flight. `exhaustMap` silently drops it.
- **Submit / pay** — prevent accidental double-submit of a form or payment. The second click is ignored until the first transaction completes.
- **Polling** — a timer fires every 1s but each poll takes 2s. `exhaustMap` keeps only one poll in-flight; overlapping polls are skipped.
- **Login** — prevent credential submission race when the user impatiently clicks "Sign in" twice.

</v-clicks>

<v-click>

> ⚠️ **Beware**: `exhaustMap` **drops** source emissions. If every emission must produce a result (e.g. every keystroke matters), use `concatMap` (queue) or `mergeMap` (parallel) instead. `exhaustMap` is for **de-duplication of in-flight work** — not for ordered or total throughput.

</v-click>

---
layout: default-content
---

### RxJS · TypeScript · refresh button

<<< @/snippets/lesson-11-exhaustmap.ts

---
layout: default-content
---

### Rx.NET · C# · refresh button

<<< @/snippets/lesson-11-exhaustmap.cs

> **Output (identical in both)**
> ```
> Refreshing…     ← first click
> Done: Loaded    ← 2s later
> (second click was ignored)
> ```

---
layout: default-content
---

## Summary

- `exhaustMap` — **ignore** new source emissions while the current inner subscription is active. Dropped emissions are silently discarded.
- RxJS: `exhaustMap(fn)`. Rx.NET: `.Select(fn).Exhaust()`.
- Use it when **duplicate emissions are wasteful** — refresh, submit, poll, login.
- Avoid it when **every emission must be processed** — it drops, it does not queue.
- The four horsemen are complete: `switchMap` (cancel), `mergeMap` (concurrent), `concatMap` (serial), `exhaustMap` (ignore) — next lesson recaps all four side by side.

---
layout: default-content
---

<QuizWidget :question-index="10" />