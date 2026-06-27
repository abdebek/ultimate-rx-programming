---
layout: cover
class: text-center
level: 2
title: Error Handling — catchError & retry
---


# Lesson 8 · Resilience

---
layout: default-content
---

## A backup generator for your streams

A fuse blows and the power cuts out — unless you have a backup generator that kicks in the instant the main line fails. `catchError` (RxJS) / `Catch` (Rx.NET) is that generator: it catches the error and **swaps in a fallback stream**, so downstream subscribers keep receiving values instead of dying.

The critical fact: **an unhandled `error` is terminal.** The stream never emits again. Every downstream subscriber is notified of the error and torn down. `catchError` interrupts that propagation.

## Error handling

| Operation | RxJS | Rx.NET |
| :-- | :-- | :-- |
| Catch & replace | `catchError(fn)` | `.Catch<Exception>(fn)` |
| Retry | `retry(n)` | `.Retry(n)` |

<v-click>

> Use `retry` for **transient** failures (network blips, momentary overload). Don't `retry` a stream that fails deterministically — you'll just loop the same error forever.

</v-click>

---
layout: default-content
---

## The scenario · a source that errors after one value

A source emits `1`, then errors (`✖`). Without `catchError`, the output would stop at `1` and die. With it, a **green** fallback stream swaps in. Predict the output.

<AnimatedMarble
  title="source: 1, then error"
  :streams="[{ id: 'source', emissions: [{ id: 'src-1', value: '1', time: 0, lane: 0, role: 'source' }, { id: 'src-err', value: '✖', time: 1, lane: 0, role: 'error' }], complete: true }, { id: 'fallback', emissions: [{ id: 'fb', value: 'Fallback', time: 1.1, lane: 1, role: 'fallback' }], complete: true }, { id: 'output', emissions: [{ id: 'out-1', value: '1', time: 0, lane: 2, role: 'output' }, { id: 'out-fb', value: 'Fallback', time: 1.1, lane: 2, role: 'output' }], complete: true }]"
  :duration="2.1"
  :lanes="3"
  :visible-lanes="[0]"
/>

<v-click>

> 🤔 **Predict**: with `catchError(() => of('Fallback'))`, what does the output lane look like? Does the `✖` propagate to the subscriber? Where does the stream complete?

</v-click>


---
layout: default-content
---

## Reveal

<div class="text-sm opacity-70 mb-2">catchError swaps in a fallback stream</div>

<AnimatedMarble
  title="source → catchError → of(&quot;Fallback&quot;)"
  :streams="[{ id: 'source', emissions: [{ id: 'src-1', value: '1', time: 0, lane: 0, role: 'source' }, { id: 'src-err', value: '✖', time: 1, lane: 0, role: 'error' }], complete: true }, { id: 'fallback', emissions: [{ id: 'fb', value: 'Fallback', time: 1.1, lane: 1, role: 'fallback' }], complete: true }, { id: 'output', emissions: [{ id: 'out-1', value: '1', time: 0, lane: 2, role: 'output' }, { id: 'out-fb', value: 'Fallback', time: 1.1, lane: 2, role: 'output' }], complete: true }]"
  :duration="2.1"
  :lanes="3"
/>

<v-click>

> ✅ **Output: `1, Fallback` then `|`.** The `✖` is caught — it does **not** propagate to the subscriber. Instead, the **green** fallback stream (`of('Fallback')`) is subscribed to, emits once, and completes. The output lane carries `1` from the source, then `Fallback` from the recovery, then completes cleanly. Without `catchError`, the output would have ended at `1` with an `✖`.

</v-click>


---
layout: default-content
---

### RxJS · TypeScript

<<< @/snippets/lesson-8-error.ts

---
layout: default-content
---

### Rx.NET · C#

<<< @/snippets/lesson-8-error.cs

> **Input / Output (identical in both)**
> ```
> Caught: Network Failure!
> Fallback Data
> ```

---
layout: default-content
---

## Summary

- **Uncaught errors terminate streams forever** — every subscriber is notified and torn down.
- `catchError` / `Catch` swaps in a **fallback stream** (green) so downstream keeps working.
- `retry` / `Retry` resubscribes to the source — use for transient failures, not deterministic ones.
- Recovery is itself a stream — you can fall back to *another network call*, not just a static value.

---
layout: default-content
---

<QuizWidget :question-index="7" />
