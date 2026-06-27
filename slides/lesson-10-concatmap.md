---
layout: cover
class: text-center
level: 2
title: concatMap — serialize inner subscriptions
---


# Lesson 10 · concatMap

---

layout: default
class: px-8
---

## A single-lane bridge

A single-lane bridge: cars line up and cross **one at a time**. The next car can't enter the bridge until the first has reached the far side. That's `concatMap`: it queues inner subscriptions and processes them **sequentially** — the next inner doesn't start until the previous one completes.

This is the third of the four higher-order mapping strategies ("the four horsemen"):

| Strategy | RxJS | Rx.NET | Behavior |
| :-- | :-- | :-- | :-- |
| **Switch** | `switchMap` | `Select().Switch()` | Cancel previous inner |
| **Merge** | `mergeMap` | `SelectMany` | Let all inners run concurrently |
| **Concat** | `concatMap` | `Select().Concat()` | Queue inners, run one at a time |
| **Exhaust** | `exhaustMap` | `Select().Exhaust()` | Ignore new emissions while inner is active |

<v-click>

> The question you ask yourself: **does order matter?** If the second emission depends on the first completing (file upload, write to a log, sequential API calls) → `concatMap`. If it doesn't → `mergeMap` / `switchMap`.

</v-click>

---

layout: default
class: px-8
---

## The scenario · two clicks, same timing as Lessons 4 & 5

Same setup you've seen with switchMap and mergeMap: two clicks at t=0 and t=1, each spawning a ~1.5s inner. But this time — `concatMap`.

<AnimatedMarble
  title="Two clicks and their inner streams"
  :streams="[{ id: 'clicks', emissions: [{ id: 'click-1', value: '🔵', time: 0, lane: 0, role: 'source' }, { id: 'click-2', value: '🔵', time: 1, lane: 0, role: 'source' }] }, { id: 'inner-1', emissions: [{ id: 'A1', value: 'A1', time: 0.5, lane: 1, role: 'inner' }, { id: 'A2', value: 'A2', time: 1, lane: 1, role: 'inner' }, { id: 'A3', value: 'A3', time: 1.5, lane: 1, role: 'inner' }], complete: true }, { id: 'inner-2', emissions: [{ id: 'B1', value: 'B1', time: 2, lane: 2, role: 'inner' }, { id: 'B2', value: 'B2', time: 2.5, lane: 2, role: 'inner' }, { id: 'B3', value: 'B3', time: 3, lane: 2, role: 'inner' }], complete: true }, { id: 'output', emissions: [{ id: 'out-A1', value: 'A1', time: 0.5, lane: 3, role: 'output' }, { id: 'out-A2', value: 'A2', time: 1, lane: 3, role: 'output' }, { id: 'out-A3', value: 'A3', time: 1.5, lane: 3, role: 'output' }, { id: 'out-B1', value: 'B1', time: 2, lane: 3, role: 'output' }, { id: 'out-B2', value: 'B2', time: 2.5, lane: 3, role: 'output' }, { id: 'out-B3', value: 'B3', time: 3, lane: 3, role: 'output' }], complete: true }]"
  :duration="4"
  :lanes="4"
  :visible-lanes="[0, 1, 2]"
/>

<v-click>

> 🤔 **Predict**: click-2 arrives at t=1, but inner-1 doesn't complete until t=1.5. Does click-2's inner start immediately (like mergeMap), or wait? What does the output lane look like? **Count the gap between A3 and B1.**

</v-click>


---
layout: default
class: px-8
---

## Reveal

<div class="text-sm opacity-70 mb-2">concatMap queues click-2 until inner-1 completes</div>

<AnimatedMarble
  title="concatMap: serial queuing — one inner at a time"
  :streams="[{ id: 'clicks', emissions: [{ id: 'click-1', value: '🔵', time: 0, lane: 0, role: 'source' }, { id: 'click-2', value: '🔵', time: 1, lane: 0, role: 'source' }] }, { id: 'inner-1', emissions: [{ id: 'A1', value: 'A1', time: 0.5, lane: 1, role: 'inner' }, { id: 'A2', value: 'A2', time: 1, lane: 1, role: 'inner' }, { id: 'A3', value: 'A3', time: 1.5, lane: 1, role: 'inner' }], complete: true }, { id: 'inner-2', emissions: [{ id: 'B1', value: 'B1', time: 2, lane: 2, role: 'inner' }, { id: 'B2', value: 'B2', time: 2.5, lane: 2, role: 'inner' }, { id: 'B3', value: 'B3', time: 3, lane: 2, role: 'inner' }], complete: true }, { id: 'output', emissions: [{ id: 'out-A1', value: 'A1', time: 0.5, lane: 3, role: 'output' }, { id: 'out-A2', value: 'A2', time: 1, lane: 3, role: 'output' }, { id: 'out-A3', value: 'A3', time: 1.5, lane: 3, role: 'output' }, { id: 'out-B1', value: 'B1', time: 2, lane: 3, role: 'output' }, { id: 'out-B2', value: 'B2', time: 2.5, lane: 3, role: 'output' }, { id: 'out-B3', value: 'B3', time: 3, lane: 3, role: 'output' }], complete: true }]"
  :duration="4"
  :lanes="4"
/>

<v-click>

> ✅ **Output: `A1, A2, A3, B1, B2, B3` then `|`** — all six values, **no interleaving**. Compare with mergeMap (Lesson 5): there B1 appeared at t=1.5 (alongside A3). Here B1 is **delayed** to t=2.0 because inner-2 was queued until inner-1 completed at t=1.5. Notice the gap between A3 (t=1.5) and B1 (t=2.0) — that's concatMap's queue delay.

</v-click>


---

layout: default
class: px-8
---

## When to use concatMap

<v-clicks>

- **Sequential API calls** — fetch a user, then fetch their orders. The second call needs data from the first.
- **File uploads** — upload one file at a time so you don't saturate the network.
- **Ordered writes** — write to a database in a specific sequence; a concurrent write would corrupt state.
- **Animation sequences** — run animation A, then animation B, never overlapping.

</v-clicks>

<v-click>

> ⚠️ **Beware**: if your inner streams are long-lived, `concatMap`'s queue grows unbounded. Use `switchMap` (cancel) or `exhaustMap` (ignore) for streams that should never queue.

</v-click>

---

layout: default
class: px-8
---

### RxJS · TypeScript · sequential file upload

```ts
import { from, of } from 'rxjs';
import { concatMap, delay } from 'rxjs/operators';

const files = ['photo.jpg', 'report.pdf', 'notes.txt'];

from(files).pipe(
  concatMap(file => {
    console.log('Uploading', file);
    return of('OK').pipe(delay(800));
  }),
).subscribe(status => console.log('Result:', status));
```

> **Output:**
> ```
> Uploading photo.jpg
> Result: OK
> Uploading report.pdf
> Result: OK
> Uploading notes.txt
> Result: OK
> ```

---

layout: default
class: px-8
---

### Rx.NET · C# · sequential file upload

```cs
using System;
using System.Reactive.Linq;
using System.Threading.Tasks;

var files = new[] { "photo.jpg", "report.pdf", "notes.txt" };

files.ToObservable()
    .Select(file => Observable.FromAsync(async () =>
    {
        Console.WriteLine($"Uploading {file}");
        await Task.Delay(800);
        return "OK";
    }))
    .Concat()
    .Subscribe(status => Console.WriteLine($"Result: {status}"));
```

> **Output (identical to RxJS):**
> ```
> Uploading photo.jpg
> Result: OK
> Uploading report.pdf
> Result: OK
> Uploading notes.txt
> Result: OK
> ```

---

layout: default
class: px-8
---

## Summary

- `concatMap` — **serialize** inner subscriptions. The next inner waits for the previous to complete.
- RxJS: `concatMap(fn)`. Rx.NET: `.Select(fn).Concat()`.
- Use it when **order matters** and concurrent processing would cause bugs.
- The four horsemen are now: `switchMap` (cancel), `mergeMap` (concurrent), `concatMap` (serial), `exhaustMap` (ignore) — next lesson.
- Same input, different operator → different output. **The operator is a semantic decision.**

---

layout: default
class: px-8
---

<QuizWidget :question-index="9" />
