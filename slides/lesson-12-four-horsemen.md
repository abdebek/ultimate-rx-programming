---
layout: cover
class: text-center
level: 2
title: Four Horsemen — Recap & Synthesis
---

# Lesson 12 · The Four Horsemen

A side-by-side look at all four higher-order mapping strategies.

---
layout: default-content
---

## Same input · four operators · four outputs

Two clicks (t=0, t=1), each spawning a 3-value inner (0.5s apart).

| Operator | Behavior | Values emitted |
| :-- | :-- | :-- |
| `switchMap` | Cancel previous inner | A1, A2, B1, B2, B3 (5 — A3 cancelled) |
| `mergeMap` | Concurrent — let all inners run | A1, A2, A3, B1, B2, B3 (6 — interleaved) |
| `concatMap` | Serial — queue next inner | A1, A2, A3, B1, B2, B3 (6 — sequential, gap) |
| `exhaustMap` | Ignore new while inner is active | A1, A2, A3 (3 — click-2 ignored) |

<v-click>

> The same input, asked through four operators, produces three different output patterns. **The operator is a semantic decision.**

</v-click>

---
layout: default-content
---

## Decision matrix · when to use which

| Operator | Use when… | Avoid when… |
| :-- | :-- | :-- |
| `switchMap` | Latest result matters (typeahead, search) | Every emission must be processed |
| `mergeMap` | All requests should run (fan-out, parallel) | Order matters or resources are tight |
| `concatMap` | Order matters (sequential API, file uploads) | Inners are long-lived (queue grows) |
| `exhaustMap` | Duplicates are wasted (refresh, payment, polling) | Every emission must produce an operation |

<v-click>

> **Quick heuristic**: ask yourself "Can I cancel? Queue? Parallelize? Ignore?" — the answer narrows you to exactly one operator.

</v-click>

---
layout: default-content
---

### RxJS — the four operators side by side

```ts
import { switchMap, mergeMap, concatMap, exhaustMap } from 'rxjs/operators';

source$.pipe(switchMap(fn));    // cancel previous
source$.pipe(mergeMap(fn));     // concurrent
source$.pipe(concatMap(fn));    // serial — queue
source$.pipe(exhaustMap(fn));   // ignore new while active
```

---
layout: default-content
---

### Rx.NET — the four operators side by side

```cs
source.Select(fn).Switch();   // cancel previous
source.SelectMany(fn);        // concurrent
source.Select(fn).Concat();   // serial — queue
source.Select(fn).Exhaust();  // ignore new while active
```

---
layout: default-content
---

## Key takeaways

<v-clicks>

- **Same input, different operator → different output.** The values, order, and timing all change.
- The four horsemen form a clean decision matrix: Cancel / Concurrent / Serial / Ignore.
- There is no "best" operator — only the right one for the semantics you need.
- The higher-order flattener is where most Rx bugs hide. Get this right, and everything else falls into place.

</v-clicks>

---
layout: default-content
---

<QuizWidget :question-index="11" />
