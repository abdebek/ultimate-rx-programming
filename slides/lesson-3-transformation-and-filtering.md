---
layout: cover
class: text-center
level: 1
title: Transformation & Filtering
---


# Lesson 3 · Transformation & Filtering

---
layout: default-content
---

## Workstations on a conveyor belt

If an Observable is the raw material on a conveyor belt, **operators** are the workstations along the line. Each one takes a value, does something to it, and passes it along — or pulls it off the belt entirely.

RxJS chains workstations with `pipe()`; Rx.NET uses LINQ method chains. The semantics match one-to-one.

| Operation | RxJS | Rx.NET |
| :-- | :-- | :-- |
| Transform | `map(fn)` | `Select(fn)` |
| Filter | `filter(pred)` | `Where(pred)` |
| Take first N | `take(n)` | `Take(n)` |

<v-click>

> Same operators, different spelling. If you know LINQ, you know RxJS operators — and vice versa.

</v-click>

---
layout: default-content
---

## The pipeline

Over `range(1, 8)`:

`filter(x => x % 2 === 0) → map(x => x * 10) → take(3)`

<v-clicks>

1. **`filter`** keeps only even values → `2, 4, 6, 8`
2. **`map`** multiplies each by 10 → `20, 40, 60, 80`
3. **`take(3)`** keeps the first three → `20, 40, 60` — then **completes**

</v-clicks>

<v-click>

> Note: `take(3)` doesn't just stop emitting — it **unsubscribes** from upstream. The source is torn down. Values `7` and `8` never flow.

</v-click>

---
layout: default-content
---

## Predict

<div class="text-sm opacity-70 mb-2">filter → map → take</div>

<AnimatedMarble
  title="range(1, 8) → filter(even) → map(×10) → take(3)"
  :streams="[{ id: 'source', emissions: [{ id: 'src-1', value: '1', time: 0, lane: 0, role: 'discarded' }, { id: 'src-2', value: '2', time: 1, lane: 0, role: 'source' }, { id: 'src-3', value: '3', time: 2, lane: 0, role: 'discarded' }, { id: 'src-4', value: '4', time: 3, lane: 0, role: 'source' }, { id: 'src-5', value: '5', time: 4, lane: 0, role: 'discarded' }, { id: 'src-6', value: '6', time: 5, lane: 0, role: 'source' }, { id: 'src-7', value: '7', time: 6, lane: 0, role: 'discarded' }, { id: 'src-8', value: '8', time: 7, lane: 0, role: 'source' }] }, { id: 'output', emissions: [{ id: '20-a', value: '20', time: 1, lane: 1, role: 'output' }, { id: '40-a', value: '40', time: 3, lane: 1, role: 'output' }, { id: '60-a', value: '60', time: 5, lane: 1, role: 'output' }], complete: true }]"
  :duration="8"
  :lanes="2"
  :visible-lanes="[0]"
/>

<v-click>

> 🤔 **Before you advance**: sketch the output lane in your head. *What values appear, in what order, and where does the stream complete?*

</v-click>

---
layout: default-content
---

## Reveal

<div class="text-sm opacity-70 mb-2">filter → map → take</div>

<AnimatedMarble
  title="range(1, 8) → filter(even) → map(×10) → take(3)"
  :streams="[{ id: 'source', emissions: [{ id: 'src-1', value: '1', time: 0, lane: 0, role: 'discarded' }, { id: 'src-2', value: '2', time: 1, lane: 0, role: 'source' }, { id: 'src-3', value: '3', time: 2, lane: 0, role: 'discarded' }, { id: 'src-4', value: '4', time: 3, lane: 0, role: 'source' }, { id: 'src-5', value: '5', time: 4, lane: 0, role: 'discarded' }, { id: 'src-6', value: '6', time: 5, lane: 0, role: 'source' }, { id: 'src-7', value: '7', time: 6, lane: 0, role: 'discarded' }, { id: 'src-8', value: '8', time: 7, lane: 0, role: 'source' }] }, { id: 'output', emissions: [{ id: '20-a', value: '20', time: 1, lane: 1, role: 'output' }, { id: '40-a', value: '40', time: 3, lane: 1, role: 'output' }, { id: '60-a', value: '60', time: 5, lane: 1, role: 'output' }], complete: true }]"
  :duration="8"
  :lanes="2"
/>

<v-click>

> ✅ **Output: `20, 40, 60`** then `|`. The **gray** marbles (`1, 3, 5, 7`) were filtered out — they never reach the output lane. `take(3)` completes the stream after the third emission, so `80` (which would have come from `8`) never appears. Notice the output marble times line up with the source times — causality is visible.

</v-click>


---
layout: default-content
---

### RxJS · TypeScript

<<< @/snippets/lesson-3-transform.ts

---
layout: default-content
---

### Rx.NET · C#

<<< @/snippets/lesson-3-transform.cs

> **Input / Output (identical in both)**
> ```
> 20
> 40
> 60
> ```

---
layout: default-content
---

## Summary

- `map`/`Select` transforms each value 1:1.
- `filter`/`Where` keeps values matching a predicate (the rest become **gray** — discarded).
- `take`/`Take` completes the stream after N values — and **unsubscribes** from the source.
- Operators compose left-to-right; order matters.

---
layout: default-content
---

<QuizWidget :question-index="2" />
