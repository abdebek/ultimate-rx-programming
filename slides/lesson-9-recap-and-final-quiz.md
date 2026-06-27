---
layout: cover
class: text-center
level: 2
title: Recap & Final Quiz
---


# Lesson 9 · Recap

---
layout: default-content
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
layout: default-content
---

# 🧠 Final Quiz

<QuizWidget :question-index="8" />

---
layout: default-content
---

## Where to go next

- **Schedulers** — controlling *when* and *where* emissions run
- **Backpressure** — what if a source emits faster than you can consume?
- **`TestScheduler`** — marble diagrams as *assertions* in unit tests
- **`share`, `shareReplay`, `publish`** — making cold streams hot on your terms

> You've got the foundations. Everything from here is a deeper dive into one of these.

