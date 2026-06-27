---
layout: cover
class: text-center
level: 2
title: Higher-Order Mapping — switchMap
---


# Lesson 4 · Higher-Order Mapping

You type in a search box. Each keystroke fires an HTTP request. Each request is *itself* a stream of results. So now you have a **stream of streams** — and Promises/Tasks give you no clean way to handle that.

Reactive programming's killer feature is **higher-order mapping**: operators that flatten nested streams into one. The two you must know differ in one policy decision — *what happens to the previous inner when a new one arrives?*

---
layout: default
class: px-8
---

## The two strategies

| Strategy | RxJS | Rx.NET | When a new inner arrives… |
| :-- | :-- | :-- | :-- |
| **Switch / latest** | `switchMap(fn)` | `.Select(fn).Switch()` | Cancels the previous inner |
| **Merge / concurrent** | `mergeMap(fn)` | `SelectMany(fn)` | Lets it keep running |

<v-click>

> The names are the trickiest part. **`switchMap` ≡ `Select().Switch()`** and **`mergeMap` ≡ `SelectMany`**. Same idea, different surface. (Finer-grained variants like `concatMap` queue inners one at a time — handy, but beyond this intro.)

</v-click>

---
layout: default
class: px-8
---

## The scenario · three clicks, each spawns an inner stream

Three clicks arrive (top lane). Each click starts a **purple** inner stream that takes ~2s to complete. **Click 2 arrives before inner-1 finishes** — so the two strategies diverge here.

<AnimatedMarble
  title="Three clicks, each spawning a 2s inner stream"
  :streams="[{ id: 'clicks', emissions: [{ id: 'click-1', value: '🔵', time: 0, lane: 0, role: 'source' }, { id: 'click-2', value: '🔵', time: 1.5, lane: 0, role: 'source' }, { id: 'click-3', value: '🔵', time: 3, lane: 0, role: 'source' }] }, { id: 'inner-1', emissions: [{ id: 'A1', value: 'A1', time: 0.2, lane: 1, role: 'inner' }, { id: 'A2', value: 'A2', time: 0.9, lane: 1, role: 'inner' }, { id: 'A3', value: 'A3', time: 1.6, lane: 1, role: 'inner' }], complete: true }, { id: 'inner-2', emissions: [{ id: 'B1', value: 'B1', time: 1.7, lane: 2, role: 'inner' }, { id: 'B2', value: 'B2', time: 2.4, lane: 2, role: 'inner' }, { id: 'B3', value: 'B3', time: 3.1, lane: 2, role: 'inner' }], complete: true }, { id: 'output', emissions: [{ id: 'out-A1', value: 'A1', time: 0.2, lane: 3, role: 'output' }, { id: 'out-A2', value: 'A2', time: 0.9, lane: 3, role: 'output' }, { id: 'out-B1', value: 'B1', time: 1.7, lane: 3, role: 'output' }, { id: 'out-B2', value: 'B2', time: 2.4, lane: 3, role: 'output' }, { id: 'out-B3', value: 'B3', time: 3.1, lane: 3, role: 'output' }], complete: true }]"
  :duration="4.1"
  :lanes="4"
  :visible-lanes="[0, 1, 2]"
/>

<v-click>

> 🤔 **Predict before advancing**: with `switchMap` (cancel-and-replace), what reaches the output? Which inner gets torn down — and does `A3` ever emit?

</v-click>


---
layout: default
class: px-8
---

## Reveal

<div class="text-sm opacity-70 mb-2">switchMap cancels the previous inner</div>

<AnimatedMarble
  title="switchMap: only the latest inner survives"
  :streams="[{ id: 'clicks', emissions: [{ id: 'click-1', value: '🔵', time: 0, lane: 0, role: 'source' }, { id: 'click-2', value: '🔵', time: 1.5, lane: 0, role: 'source' }, { id: 'click-3', value: '🔵', time: 3, lane: 0, role: 'source' }] }, { id: 'inner-1', emissions: [{ id: 'A1', value: 'A1', time: 0.2, lane: 1, role: 'inner' }, { id: 'A2', value: 'A2', time: 0.9, lane: 1, role: 'inner' }, { id: 'A3', value: 'A3', time: 1.6, lane: 1, role: 'inner' }], complete: true }, { id: 'inner-2', emissions: [{ id: 'B1', value: 'B1', time: 1.7, lane: 2, role: 'inner' }, { id: 'B2', value: 'B2', time: 2.4, lane: 2, role: 'inner' }, { id: 'B3', value: 'B3', time: 3.1, lane: 2, role: 'inner' }], complete: true }, { id: 'output', emissions: [{ id: 'out-A1', value: 'A1', time: 0.2, lane: 3, role: 'output' }, { id: 'out-A2', value: 'A2', time: 0.9, lane: 3, role: 'output' }, { id: 'out-B1', value: 'B1', time: 1.7, lane: 3, role: 'output' }, { id: 'out-B2', value: 'B2', time: 2.4, lane: 3, role: 'output' }, { id: 'out-B3', value: 'B3', time: 3.1, lane: 3, role: 'output' }], complete: true }]"
  :duration="4.1"
  :lanes="4"
/>

<v-click>

> ✅ **Output: `A1, A2, B1, B2, B3` then `|`.** Inner-1 was **abandoned mid-flight** the moment click-2 arrived — notice it has **no `|`** completion marker, and `A3` never emits. Only the latest inner reaches the output lane. That's "cancel-and-replace" — exactly what you want for type-ahead search.

</v-click>


---
layout: default
class: px-8
---

### RxJS · TypeScript · type-ahead search

<<< @/snippets/lesson-4-switchmap.ts

---
layout: default
class: px-8
---

### Rx.NET · C# · type-ahead search

<<< @/snippets/lesson-4-switchmap.cs

> **Input / Output (identical in both)**
> ```
> user types "a"   → (waits 500ms) → Results for: a
> user types "ab"  → cancels "a",  → Results for: ab
> ```

---
layout: default
class: px-8
---

## Summary

- Streams that emit streams need a **flattening** operator.
- **`switchMap`** keeps only the **latest** inner — perfect for "cancel-and-replace" flows (search, navigation).
- The cancellation is **automatic** — you don't tear down the previous inner yourself.
- Next lesson: the opposite choice — `mergeMap`/`SelectMany`, where nothing is cancelled.

---
layout: default
class: px-8
---

<QuizWidget :question-index="3" />
