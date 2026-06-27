---
layout: cover
class: text-center
level: 2
title: Combining Streams — combineLatest
---


# Lesson 7 · Combining Streams

---
layout: default
class: px-8
---

## A dashboard that reacts to any sensor

A car's dashboard updates whenever *any* sensor changes — speedometer, fuel gauge, temperature — each display combining the latest reading from every relevant sensor. That's `combineLatest`: react whenever **any** source changes, using the latest value from each.

The natural sources are **`BehaviorSubject`s** (Lesson 6) — each piece of UI state always has a current value, so `combineLatest` fires immediately without waiting.

## The combiners you'll meet

| Operation | RxJS | Rx.NET | Emits when… |
| :-- | :-- | :-- | :-- |
| **Combine latest** | `combineLatest([s1, s2])` | `s1.CombineLatest(s2, fn)` | any source emits (after all have emitted once) |
| **Merge** | `merge(s1, s2)` | `s1.Merge(s2)` | any source emits (no combining) |

<v-click>

> `combineLatest` **waits** for every source to emit at least once, then fires on every subsequent emission from any source — combining the latest values into one tuple. With `BehaviorSubject`s holding initial values, the "wait" is instant.

</v-click>

---
layout: default
class: px-8
---

## The setup · two sources feeding one view

A `user$` stream and a `theme$` stream. The view combines them into "`{user} in {theme} mode`". Predict what the output lane looks like before you reveal.

<AnimatedMarble
  title="user$ and theme$ → combineLatest"
  :streams="[{ id: 'user$', emissions: [{ id: 'u1', value: 'Alice', time: 0, lane: 0, role: 'source' }, { id: 'u2', value: 'Bob', time: 3, lane: 0, role: 'source' }] }, { id: 'theme$', emissions: [{ id: 't1', value: 'Dark', time: 1, lane: 1, role: 'source' }, { id: 't2', value: 'Light', time: 4, lane: 1, role: 'source' }] }, { id: 'view', emissions: [{ id: 'v1', value: 'Alice|Dark', time: 1, lane: 2, role: 'output' }, { id: 'v2', value: 'Bob|Dark', time: 3, lane: 2, role: 'output' }, { id: 'v3', value: 'Bob|Light', time: 4, lane: 2, role: 'output' }], complete: true }]"
  :duration="5"
  :lanes="3"
  :visible-lanes="[0, 1]"
/>

<v-click>

> 🤔 **Predict**: when does the **first** combined emission appear? (Hint: it can't fire until *both* sources have emitted at least once.) And what are the three combined values?

</v-click>

---
layout: default
class: px-8
---

## Predict · combineLatest waits for all, then fires on any

<AnimatedMarble
  title="combineLatest([user$, theme$]) → &quot;{user} in {theme} mode&quot;"
  :streams="[{ id: 'user$', emissions: [{ id: 'u1', value: 'Alice', time: 0, lane: 0, role: 'source' }, { id: 'u2', value: 'Bob', time: 3, lane: 0, role: 'source' }] }, { id: 'theme$', emissions: [{ id: 't1', value: 'Dark', time: 1, lane: 1, role: 'source' }, { id: 't2', value: 'Light', time: 4, lane: 1, role: 'source' }] }, { id: 'view', emissions: [{ id: 'v1', value: 'Alice|Dark', time: 1, lane: 2, role: 'output' }, { id: 'v2', value: 'Bob|Dark', time: 3, lane: 2, role: 'output' }, { id: 'v3', value: 'Bob|Light', time: 4, lane: 2, role: 'output' }], complete: true }]"
  :duration="5"
  :lanes="3"
  :visible-lanes="[0, 1]"
/>

<v-click>

> 🤔 **Before you advance**: sketch the output lane in your head. *What values appear, in what order, and where does the stream complete?*

</v-click>

---
layout: default
class: px-8
---

## Reveal · combineLatest waits for all, then fires on any

<AnimatedMarble
  title="combineLatest([user$, theme$]) → &quot;{user} in {theme} mode&quot;"
  :streams="[{ id: 'user$', emissions: [{ id: 'u1', value: 'Alice', time: 0, lane: 0, role: 'source' }, { id: 'u2', value: 'Bob', time: 3, lane: 0, role: 'source' }] }, { id: 'theme$', emissions: [{ id: 't1', value: 'Dark', time: 1, lane: 1, role: 'source' }, { id: 't2', value: 'Light', time: 4, lane: 1, role: 'source' }] }, { id: 'view', emissions: [{ id: 'v1', value: 'Alice|Dark', time: 1, lane: 2, role: 'output' }, { id: 'v2', value: 'Bob|Dark', time: 3, lane: 2, role: 'output' }, { id: 'v3', value: 'Bob|Light', time: 4, lane: 2, role: 'output' }], complete: true }]"
  :duration="5"
  :lanes="3"
/>

<v-click>

> ✅ **First emission at `t=1`**: `Alice|Dark` — the moment `theme$` emits its first value, *both* sources have emitted, so `combineLatest` fires. Then at `t=3` the user changes → `Bob|Dark`. At `t=4` the theme changes → `Bob|Light`. Three emissions total. Note the output is **silent at `t=0`** — `user$` had emitted but `theme$` hadn't, so the combine couldn't fire yet.

</v-click>


---
layout: default
class: px-8
---

### RxJS · TypeScript

<<< @/snippets/lesson-7-combinelatest.ts

---
layout: default
class: px-8
---

### Rx.NET · C#

<<< @/snippets/lesson-7-combinelatest.cs

> **Input / Output (identical in both)**
> ```
> Rendering Alice in Dark mode.
> Rendering Bob in Dark mode.
> Rendering Bob in Light mode.
> ```

---
layout: default
class: px-8
---

## Summary

- `combineLatest` waits for **all** sources to emit once, then fires on **any** change — like a dashboard.
- Each emission carries the **latest** value from every source.
- Rx.NET's overload takes a **selector function** instead of returning a tuple.
- `BehaviorSubject` (Lesson 6) is the natural source — it always has a current value.
- `merge` is the simpler sibling — it just interleaves, no combining.

---
layout: default
class: px-8
---

<QuizWidget :question-index="6" />
