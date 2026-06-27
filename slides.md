---
# Slidev frontmatter — project-level config applied to every slide
# unless overridden per-slide. See https://sli.dev/custom/
title: Ultimate Reactive Programming
theme: default
info: |
  An interactive course teaching the fundamentals of Reactive Programming
  with marble-diagram animations and quizzes. Covers RxJS and Rx.NET side
  by side.
highlighter: shiki
transition: slide-left
mdc: true
---

# Ultimate Reactive Programming

An interactive course · RxJS & Rx.NET side by side

<div class="text-sm opacity-70 mt-8">
  Marble diagrams animate as you advance. Quizzes check your understanding.
  Toggle dark mode with the theme switch — every diagram adapts.
</div>

---
layout: center
class: text-center
---

# Component smoke test

If both render below, the scaffold is healthy.

<AnimatedMarble
  title="smoke test: source → output"
  :streams="[{ id: 'src', emissions: [{ id: 's1', value: '1', time: 0, lane: 0, role: 'source' }, { id: 's2', value: '2', time: 1, lane: 0, role: 'source' }, { id: 's3', value: '3', time: 2, lane: 0, role: 'source' }], complete: true }, { id: 'out', emissions: [{ id: 'o1', value: '1', time: 0, lane: 1, role: 'output' }, { id: 'o2', value: '4', time: 1, lane: 1, role: 'output' }, { id: 'o3', value: '9', time: 2, lane: 1, role: 'output' }], complete: true }]"
  :duration="3"
  :lanes="2"
/>

<QuizWidget :question-index="0" class="mt-12" />

---
src: ./slides/lesson-1-observables-and-subscriptions.md
---

---
src: ./slides/lesson-2-creation-operators.md
---

---
src: ./slides/lesson-3-transformation-and-filtering.md
---

---
src: ./slides/lesson-4-switchmap.md
---

---
src: ./slides/lesson-5-selectmany-mergemap.md
---

---
src: ./slides/lesson-6-subjects-and-memory.md
---

---
src: ./slides/lesson-7-combinelatest.md
---

---
src: ./slides/lesson-8-error-handling.md
---

---
src: ./slides/lesson-9-recap-and-final-quiz.md
---