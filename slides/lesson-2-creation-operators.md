---
layout: cover
class: text-center
level: 1
title: Creation Operators — of, from, range
---


# Lesson 2 · Creation Operators

---
layout: default
class: px-8
---

## The shortcut for creating streams

Imagine writing a `for`-loop by hand, calling `emit()` once per value. That's what `new Observable(subscriber => { ... })` feels like — powerful, but tedious for the common case.

**Creation operators** are the shortcut: declarative at write-time, still lazy at run-time. You describe *what* the stream contains; the library does the `next()` calls for you.

## The three you'll reach for constantly

| Purpose | RxJS | Rx.NET |
| :-- | :-- | :-- |
| Single/multiple values | `of(...values)` | `Observable.Return()` |
| From an array/iterable | `from(iterable)` | `array.ToObservable()` |
| Integer range | `range(start, count)` | `Observable.Range(start, count)` |

<v-click>

> `of` and `from` are the RxJS names you'll see most. Rx.NET spreads the same idea across `Return`, `ToObservable`, and `Range`. All of them are **cold** — re-read Lesson 1's last slide if that word feels fuzzy.

</v-click>

---
layout: default
class: px-8
---

## Visualization · `of(1, 2, 3)` vs `range(1, 3)`

<div class="grid grid-cols-2 gap-8">

<div>

### `of(1, 2, 3)`

<AnimatedMarble
  title="of(1, 2, 3)"
  :streams="[{ id: 'source', emissions: [{ id: '1', value: '1', time: 0, lane: 0, role: 'source' }, { id: '2', value: '2', time: 1, lane: 0, role: 'source' }, { id: '3', value: '3', time: 2, lane: 0, role: 'source' }], complete: true }]"
  :duration="3"
  :lanes="1"
/>

</div>

<div>

### `range(1, 3)`

<AnimatedMarble
  title="range(1, 3)"
  :streams="[{ id: 'source', emissions: [{ id: '1', value: '1', time: 0, lane: 0, role: 'source' }, { id: '2', value: '2', time: 1, lane: 0, role: 'source' }, { id: '3', value: '3', time: 2, lane: 0, role: 'source' }], complete: true }]"
  :duration="3"
  :lanes="1"
/>

</div>

</div>

<v-click>

> Both emit the same values here — `of` lists them literally, `range` computes them. The animation uses each marble's `time`, so spacing reflects emission cadence, not magic numbers.

</v-click>

---
layout: default
class: px-8
---

### RxJS · TypeScript

<<< @/snippets/lesson-2-creation.ts

---
layout: default
class: px-8
---

### Rx.NET · C#

<<< @/snippets/lesson-2-creation.cs

> **Input / Output (identical in both)**
> ```
> Name: Alice
> Name: Bob
> Name: Charlie
> Number: 1
> Number: 2
> Number: 3
> Number: 4
> Number: 5
> ```

---
layout: default
class: px-8
---

## Summary

- **`of`** emits a fixed list of values, then completes.
- **`from`** flattens any iterable into a stream.
- **`range`** generates a numeric sequence without an array.
- All three are **cold** — each subscription gets its own execution (see Lesson 1).

---
layout: default
class: px-8
---

<QuizWidget :question-index="1" />
