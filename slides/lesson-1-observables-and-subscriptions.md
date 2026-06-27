---
layout: cover
class: text-center
level: 1
title: Observables & Subscriptions
---


# Lesson 1 · Observables & Subscriptions

---
layout: default
class: px-8
---

## Pull → Push

A **for-loop** is *pull*: you ask for the next value. An **Observable** is *push*: the next value arrives on its own, whenever it's ready. That single inversion — **pull → push** — is what reactive programming buys you.

Three roles make it work:

<v-clicks>

- **Observable** — the *producer* (a lazy description of a stream of values over time)
- **Observer** — the *consumer* (`next` / `error` / `complete`)
- **Subscription** — the *connection* (tear it down when you're done)

</v-clicks>

<v-click>

Think of it as a push-based version of an iterator: **you don't pull values, values are pushed to you.**

</v-click>

---
layout: two-cols
class: px-8
---

## The mental model

A stream emits three kinds of signals:

1. **next** — a new value
2. **error** — a failure (terminal)
3. **complete** — success end (terminal)

Once `error` or `complete` fires, the stream is **done forever** — no more values will arrive.

::right::

## Core types across ecosystems

| Concept | RxJS | Rx.NET |
| :-- | :-- | :-- |
| The stream | `Observable<T>` | `IObservable<T>` |
| The listener | `Observer<T>` | `IObserver<T>` |
| The connection | `Subscription` | `IDisposable` |

> The names differ; the contract is identical.

---
layout: default
class: px-8
---

## How to read a marble diagram

Throughout this course, streams are drawn as **marble diagrams**. Here's the visual language — learn it once, it never changes.

<AnimatedMarble
  title="Legend — values, completion, and errors"
  :streams="[{ id: 'values', emissions: [{ id: 'leg-1', value: '1', time: 0, lane: 0, role: 'source' }, { id: 'leg-2', value: '2', time: 1, lane: 0, role: 'source' }, { id: 'leg-3', value: '3', time: 2, lane: 0, role: 'source' }], complete: true }, { id: 'error', emissions: [{ id: 'leg-err', value: '✖', time: 1, lane: 1, role: 'error' }], complete: true }]"
  :duration="3"
  :lanes="2"
/>

---
layout: default
class: px-8
---

## Reading rules

<v-clicks>

- Each **circle** is one emitted value — its horizontal position = `marble.time`.
- A **`|`** at the end of a lane marks `complete` (clean end).
- A **`✖``** marks `error` (terminal failure).
- Time always flows **left → right**. Nothing animates until you advance the slide.

</v-clicks>

<v-click>

> **Colors are semantic** — each marble's color reflects its *role*, and the meaning is consistent across every lesson:
>
> <span style="color: var(--role-source)">●</span> source = input stream &nbsp; <span style="color: var(--role-inner)">●</span> inner = nested stream &nbsp; <span style="color: var(--role-output)">●</span> output = transformed result &nbsp; <span style="color: var(--role-fallback)">●</span> fallback = recovery &nbsp; <span style="color: var(--role-error)">●</span> error = terminal failure &nbsp; <span style="color: var(--role-discarded)">●</span> discarded = filtered out &nbsp; <span style="color: var(--role-hot)">●</span> hot = multicast/Subject
>
> (The actual hues adapt to light/dark mode — try Slidev's theme toggle. The role names never change.)

</v-click>

---
layout: center
class: text-center
---

## Visualization · a synchronous stream

<AnimatedMarble
  title="new Observable → next(1), next(2), next(3), complete()"
  :streams="[{ id: 'source', emissions: [{ id: '1', value: '1', time: 0, lane: 0, role: 'source' }, { id: '2', value: '2', time: 1, lane: 0, role: 'source' }, { id: '3', value: '3', time: 2, lane: 0, role: 'source' }], complete: true }]"
  :duration="3"
  :lanes="1"
/>

<v-click>

Each marble's horizontal position is derived from `marble.time` — **no hardcoded CSS delays**.

</v-click>

---
layout: default
class: px-8
---

### RxJS · TypeScript

<<< @/snippets/lesson-1-observable.ts

---
layout: default
class: px-8
---

### Rx.NET · C#

<<< @/snippets/lesson-1-observable.cs

> **Input / Output (identical in both)**
> ```
> Received: 1
> Received: 2
> Received: 3
> Stream completed!
> ```

---
layout: default
class: px-8
---

## Cold by default — the most important property of an Observable

An Observable is **lazy**: nothing happens until you `subscribe`. And **each subscriber gets its own independent execution** — like calling a function twice.

<AnimatedMarble
  title="Cold stream: two subscriptions, two independent runs"
  :streams="[{ id: 'sub-A', emissions: [{ id: 'a1', value: '1', time: 0, lane: 0, role: 'source' }, { id: 'a2', value: '2', time: 1, lane: 0, role: 'source' }, { id: 'a3', value: '3', time: 2, lane: 0, role: 'source' }], complete: true }, { id: 'sub-B', emissions: [{ id: 'b1', value: '1', time: 0, lane: 1, role: 'hot' }, { id: 'b2', value: '2', time: 1, lane: 1, role: 'hot' }, { id: 'b3', value: '3', time: 2, lane: 1, role: 'hot' }], complete: true }]"
  :duration="3"
  :lanes="2"
/>

---
layout: default
class: px-8
---

## Cold vs Hot

<v-clicks>

- **Cold** = unicast. The producer starts *per subscriber*. (this lesson's `new Observable`, plus `of`, `from`, `range` next lesson)
- **Hot** = multicast. One shared execution, late subscribers miss earlier values. (the **Subjects** in Lesson 6)

</v-clicks>

<v-click>

> This single distinction explains most "why didn't my second subscriber get the first value?" bugs.

</v-click>

---
layout: default
class: px-8
---

## Summary

- An **Observable** is lazy — nothing runs until you **subscribe**.
- Observers receive `next`, `error`, and `complete`; the latter two are terminal.
- **Always unsubscribe / dispose** to avoid leaks.
- Observables are **cold by default** — each subscriber gets its own run.
- RxJS and Rx.NET share the same contract; only the surface API differs.

---
layout: default
class: px-8
---

<QuizWidget :question-index="0" />
