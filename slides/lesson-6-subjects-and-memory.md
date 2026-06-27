---
layout: cover
class: text-center
level: 2
title: Subjects & Memory Management
---


# Lesson 6 · Subjects & Memory

A **radio station** broadcasts to anyone tuned in — it doesn't start the song over for each new listener. That's a **Subject**: an Observable that's **hot**, not cold. One shared execution, multicasted to many subscribers. Late listeners catch the show in progress; they don't get a replay of songs they missed.

A Subject is special because it plays **both** roles: it's an Observer (you call `next()` on it) *and* an Observable (others subscribe to it).

---
layout: default
class: px-8
---

## Cold vs Hot, side by side

| | Cold (default) | Hot (Subject) |
| :-- | :-- | :-- |
| Producers | one per subscriber | one, shared |
| Late subscribers | get full replay | miss earlier values |
| Examples | `of`, `from`, `range`, `new Observable` | `Subject`, `BehaviorSubject`, `ReplaySubject` |

---
layout: default
class: px-8
---

## Subject types & cleanup

<v-clicks>

- `Subject` — multicasts; late subscribers see only future values.
- `BehaviorSubject` — like `Subject` but new subscribers immediately get the *latest* value. (Used next lesson.)
- `ReplaySubject` — replays a buffer of past values to late subscribers.

</v-clicks>

<v-click>

> ⚠️ **Always clean up.** A leaked subscription keeps its source (and anything it closes over) alive. Use `unsubscribe()` / `CompositeDisposable` / `takeUntil`.

</v-click>

---
layout: default
class: px-8
---

## Predict

<div class="text-sm opacity-70 mb-2">A Subject multicasts one value to two subscribers</div>

<AnimatedMarble
  title="Subject.next(100) — one emission, two subscribers"
  :streams="[{ id: 'subject', emissions: [{ id: 'subj-100', value: '100', time: 0, lane: 0, role: 'hot' }] }, { id: 'sub-1', emissions: [{ id: 's1-100', value: '100', time: 0, lane: 1, role: 'output' }], complete: true }, { id: 'sub-2', emissions: [{ id: 's2-100', value: '100', time: 0, lane: 2, role: 'output' }], complete: true }]"
  :duration="1"
  :lanes="3"
  :visible-lanes="[0]"
/>

<v-click>

> 🤔 **Before you advance**: sketch the output lane in your head. *What values appear, in what order, and where does the stream complete?*

</v-click>

---
layout: default
class: px-8
---

## Reveal

<div class="text-sm opacity-70 mb-2">A Subject multicasts one value to two subscribers</div>

<AnimatedMarble
  title="Subject.next(100) — one emission, two subscribers"
  :streams="[{ id: 'subject', emissions: [{ id: 'subj-100', value: '100', time: 0, lane: 0, role: 'hot' }] }, { id: 'sub-1', emissions: [{ id: 's1-100', value: '100', time: 0, lane: 1, role: 'output' }], complete: true }, { id: 'sub-2', emissions: [{ id: 's2-100', value: '100', time: 0, lane: 2, role: 'output' }], complete: true }]"
  :duration="1"
  :lanes="3"
/>

<v-click>

> ✅ The **teal** source lane emits `100` **once**. Both subscriber lanes light up with the same value — that's multicasting. With a cold Observable you'd have seen two independent runs (two separate `100`s at different times). The Subject ran once and broadcast.

</v-click>


---
layout: default
class: px-8
---

### RxJS · TypeScript · multicasting + cleanup

<<< @/snippets/lesson-6-subject.ts

---
layout: default
class: px-8
---

### Rx.NET · C# · multicasting + cleanup

<<< @/snippets/lesson-6-subject.cs

> **Input / Output (identical in both)**
> ```
> Sub 1: 100
> Sub 2: 100
> (subscriptions disposed)
> ```

---
layout: default
class: px-8
---

## Summary

- **Subjects** are the **hot** counterpart to cold Observables — like a radio station, not a function call.
- `Subject` multicasts; `BehaviorSubject` adds "current value" semantics; `ReplaySubject` buffers the past.
- **Dispose everything.** A leaked subscription keeps its source alive.
- You'll need `BehaviorSubject` next lesson — that's why we covered Subjects first.

---
layout: default
class: px-8
---

<QuizWidget :question-index="5" />
