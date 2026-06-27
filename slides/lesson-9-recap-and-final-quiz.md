---
layout: cover
class: text-center
level: 2
title: Recap & Final Quiz
---


# Lesson 9 · Recap

---
layout: default
class: px-8
---

## The full toolkit

You've now seen the full reactive toolkit end-to-end:

<v-clicks>

- **Lesson 1** — Observables, Observers, Subscriptions; cold by default
- **Lesson 2** — `of`, `from`, `range` creation operators
- **Lesson 3** — `map`/`Select`, `filter`/`Where`, `take`/`Take`
- **Lesson 4** — `switchMap` / `Select().Switch()` — cancel-and-replace
- **Lesson 5** — `mergeMap` / `SelectMany` — keep every inner
- **Lesson 6** — Subjects: hot streams, multicasting, cleanup
- **Lesson 7** — `combineLatest` — react to any source
- **Lesson 8** — `catchError` / `Catch` — don't let errors kill your stream

</v-clicks>

<v-click>

> The contract is **identical** across RxJS and Rx.NET. Once you internalize the patterns, the library is just a translation table.

</v-click>

---
layout: default
class: px-8
---

# 🧠 Final Quiz

<QuizWidget :question-index="8" />

---
layout: default
class: px-8
---

## Where to go next

- **Schedulers** — controlling *when* and *where* emissions run
- **Backpressure** — what if a source emits faster than you can consume?
- **`TestScheduler`** — marble diagrams as *assertions* in unit tests
- **`share`, `shareReplay`, `publish`** — making cold streams hot on your terms

> You've got the foundations. Everything from here is a deeper dive into one of these.

---
layout: cover
class: text-center
---

# You're done!

Subscribe. React. Dispose.

<div class="text-sm opacity-60 mt-8">
  The contract is the same across RxJS and Rx.NET — you've learned both.
</div>
