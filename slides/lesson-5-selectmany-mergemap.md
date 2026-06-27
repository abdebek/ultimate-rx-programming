---
layout: cover
class: text-center
level: 2
title: SelectMany (mergeMap) — keep every inner
---


# Lesson 5 · SelectMany / mergeMap

---
layout: default
class: px-8
---

## A dispatch center that never cancels

Picture a dispatch center that fires off every incoming job and lets them all run in parallel — no matter how many pile up. That's `SelectMany` (Rx.NET) ≡ `mergeMap` (RxJS): it subscribes to **every** inner stream and merges their emissions into one outer line. **Nothing is ever cancelled.**

## When to pick which

| You want… | Use |
| :-- | :-- |
| Only the latest inner; cancel the rest | `switchMap` / `Select().Switch()` |
| All inners, running concurrently | `mergeMap` / `SelectMany` |

<v-click>

> The key question: **is it safe to ignore earlier inners?** If yes → `switchMap`. If no → `mergeMap`/`SelectMany`. (Finer-grained variants like `concatMap` queue inners one at a time — handy, but beyond this intro.)

</v-click>

---
layout: default
class: px-8
---

## Same scenario as Lesson 4 — opposite policy

The input is **byte-for-byte identical** to Lesson 4: three clicks, same timing, same inner streams. The only difference is the operator. Predict the output before you reveal it.

<AnimatedMarble
  title="Three clicks (same as L4), mergeMap this time"
  :streams="[{ id: 'clicks', emissions: [{ id: 'click-1', value: '🔵', time: 0, lane: 0, role: 'source' }, { id: 'click-2', value: '🔵', time: 1.5, lane: 0, role: 'source' }, { id: 'click-3', value: '🔵', time: 3, lane: 0, role: 'source' }] }, { id: 'inner-1', emissions: [{ id: 'A1', value: 'A1', time: 0.2, lane: 1, role: 'inner' }, { id: 'A2', value: 'A2', time: 0.9, lane: 1, role: 'inner' }, { id: 'A3', value: 'A3', time: 1.6, lane: 1, role: 'inner' }], complete: true }, { id: 'inner-2', emissions: [{ id: 'B1', value: 'B1', time: 1.7, lane: 2, role: 'inner' }, { id: 'B2', value: 'B2', time: 2.4, lane: 2, role: 'inner' }, { id: 'B3', value: 'B3', time: 3.1, lane: 2, role: 'inner' }], complete: true }, { id: 'output', emissions: [{ id: 'out-A1', value: 'A1', time: 0.2, lane: 3, role: 'output' }, { id: 'out-A2', value: 'A2', time: 0.9, lane: 3, role: 'output' }, { id: 'out-A3', value: 'A3', time: 1.6, lane: 3, role: 'output' }, { id: 'out-B1', value: 'B1', time: 1.7, lane: 3, role: 'output' }, { id: 'out-B2', value: 'B2', time: 2.4, lane: 3, role: 'output' }, { id: 'out-B3', value: 'B3', time: 3.1, lane: 3, role: 'output' }], complete: true }]"
  :duration="4.1"
  :lanes="4"
  :visible-lanes="[0, 1, 2]"
/>

<v-click>

> 🤔 **Predict**: with `mergeMap` (no cancellation), does `A3` emit? How many values reach the output? Compare your mental answer to Lesson 4's output.

</v-click>


---
layout: default
class: px-8
---

## Reveal

<div class="text-sm opacity-70 mb-2">mergeMap / SelectMany keeps every inner</div>

<AnimatedMarble
  title="mergeMap / SelectMany: no inner is cancelled"
  :streams="[{ id: 'clicks', emissions: [{ id: 'click-1', value: '🔵', time: 0, lane: 0, role: 'source' }, { id: 'click-2', value: '🔵', time: 1.5, lane: 0, role: 'source' }, { id: 'click-3', value: '🔵', time: 3, lane: 0, role: 'source' }] }, { id: 'inner-1', emissions: [{ id: 'A1', value: 'A1', time: 0.2, lane: 1, role: 'inner' }, { id: 'A2', value: 'A2', time: 0.9, lane: 1, role: 'inner' }, { id: 'A3', value: 'A3', time: 1.6, lane: 1, role: 'inner' }], complete: true }, { id: 'inner-2', emissions: [{ id: 'B1', value: 'B1', time: 1.7, lane: 2, role: 'inner' }, { id: 'B2', value: 'B2', time: 2.4, lane: 2, role: 'inner' }, { id: 'B3', value: 'B3', time: 3.1, lane: 2, role: 'inner' }], complete: true }, { id: 'output', emissions: [{ id: 'out-A1', value: 'A1', time: 0.2, lane: 3, role: 'output' }, { id: 'out-A2', value: 'A2', time: 0.9, lane: 3, role: 'output' }, { id: 'out-A3', value: 'A3', time: 1.6, lane: 3, role: 'output' }, { id: 'out-B1', value: 'B1', time: 1.7, lane: 3, role: 'output' }, { id: 'out-B2', value: 'B2', time: 2.4, lane: 3, role: 'output' }, { id: 'out-B3', value: 'B3', time: 3.1, lane: 3, role: 'output' }], complete: true }]"
  :duration="4.1"
  :lanes="4"
/>

<v-click>

> ✅ **Output: `A1, A2, A3, B1, B2, B3` then `|`** — all six. Inner-1 **has a `|`** this time: `A3` emits, then it completes normally. Nothing was torn down. Compare with Lesson 4: same input, opposite policy, different output. **The choice of flattening operator is a semantic decision, not a stylistic one.**

</v-click>


---
layout: default
class: px-8
---

### RxJS · TypeScript · fire-and-forget

<<< @/snippets/lesson-5-mergemap.ts

---
layout: default
class: px-8
---

### Rx.NET · C# · fire-and-forget

<<< @/snippets/lesson-5-selectmany.cs

> **Input / Output (identical in both)**
> ```
> click 1 → job-1:start → job-1:done
> click 2 → job-2:start → job-2:done   (job-1 still running)
> click 3 → job-3:start → job-3:done
> ```

---
layout: default
class: px-8
---

## Summary

- `mergeMap` ≡ `SelectMany` — **all** inners run, none cancelled.
- Use it when every inner matters (telemetry, parallel requests, logging).
- Contrast with `switchMap`: same input shape, opposite cancellation policy.
- The choice is **semantic**, not stylistic.

---
layout: default
class: px-8
---

<QuizWidget :question-index="4" />
