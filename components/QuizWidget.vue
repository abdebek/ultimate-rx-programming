<script setup lang="ts">
/**
 * QuizWidget — reusable, accessible single-choice quiz component.
 *
 * Consumes the centralized quiz bank in setup/quiz-data.ts by index,
 * so lesson markdown only needs `<QuizWidget :question-index="N" />`.
 *
 * Behavior (per .temp/notes.md):
 *   - keyboard accessible (Arrow Up/Down to move, Enter/Space to select)
 *   - immediate feedback on selection
 *   - explanation shown after selection (the primary teaching moment)
 *   - visually indicates correct vs. incorrect
 *   - prevents accidental reselection after an answer is locked in
 *   - "Try again" resets state without advancing slides
 *
 * No external dependencies — standard Vue 3 + native DOM semantics.
 * Styling uses CSS custom properties that adapt to Slidev's light/dark
 * themes via the .dark selector (see styles/marble.css companion in
 * Phase 4; this component defines its own scoped tokens as a fallback
 * so it is usable standalone).
 */
import { computed, ref, useTemplateRef, watch, onMounted, onBeforeUnmount } from 'vue';
import type { QuizQuestion } from '../setup/types';
import quizQuestions from '../setup/quiz-data';

const props = defineProps<{
  questionIndex: number;
}>();

const question = computed<QuizQuestion>(() => {
  const q = quizQuestions[props.questionIndex];
  if (q === undefined) {
    throw new Error(
      `QuizWidget: questionIndex ${props.questionIndex} is out of range ` +
        `(quiz bank has ${quizQuestions.length} questions).`,
    );
  }
  return q;
});

// --- selection state -------------------------------------------------------

/** Index of the option the learner has chosen, or null if unanswered. */
const selectedIndex = ref<number | null>(null);

/** Index of the currently focused option for keyboard navigation. */
const focusedIndex = ref<number>(0);

/** True once an answer has been locked in — disables further selection. */
const isLocked = computed<boolean>(() => selectedIndex.value !== null);

const selectedOption = computed(() =>
  selectedIndex.value !== null
    ? question.value.options[selectedIndex.value] ?? null
    : null,
);

const correctIndex = computed<number>(() => {
  const idx = question.value.options.findIndex((o) => o.isCorrect);
  if (idx === -1) {
    throw new Error(
      `QuizWidget: question "${question.value.question}" has no correct option. ` +
        `Every QuizQuestion must have exactly one option with isCorrect: true.`,
    );
  }
  return idx;
});

// --- actions --------------------------------------------------------------

function selectOption(index: number): void {
  if (isLocked.value) return;
  selectedIndex.value = index;
  focusedIndex.value = index;
}

function resetAnswer(): void {
  selectedIndex.value = null;
  focusedIndex.value = 0;
}

// --- keyboard interaction --------------------------------------------------
//
// The option list is a real <ul role="listbox"> with <li role="option">s.
// We attach a single keydown handler on the <ul> and dispatch by key:
//   ArrowUp/ArrowDown  — move focus (wraps)
//   Home/End           — jump to first/last
//   Enter/Space        — select the focused option (if not locked)
//   Escape             — if locked, reset so the learner can try again
//
// The listbox auto-manages aria-activedescendant so screen readers
// announce the focused option without us moving DOM focus per item.

const listboxRef = useTemplateRef<HTMLUListElement>('listbox');

function onKeyDown(event: KeyboardEvent): void {
  const count = question.value.options.length;
  if (count === 0) return;

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      focusedIndex.value = (focusedIndex.value + 1) % count;
      break;
    case 'ArrowUp':
      event.preventDefault();
      focusedIndex.value = (focusedIndex.value - 1 + count) % count;
      break;
    case 'Home':
      event.preventDefault();
      focusedIndex.value = 0;
      break;
    case 'End':
      event.preventDefault();
      focusedIndex.value = count - 1;
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      selectOption(focusedIndex.value);
      break;
    case 'Escape':
      if (isLocked.value) {
        event.preventDefault();
        resetAnswer();
      }
      break;
    default:
      // No-op: let other keys bubble (e.g. Slidev navigation shortcuts).
      return;
  }
}

// Reset internal state if the question changes (defensive: lessons mount
// a fresh QuizWidget per slide today, but this guards future reuse).
watch(
  () => props.questionIndex,
  () => {
    resetAnswer();
  },
);

// Focus the listbox on mount so keyboard users can interact immediately
// without an extra Tab. Slidev's slide activation handles the surrounding
// focus context; this is additive, not stealing.
onMounted(() => {
  listboxRef.value?.focus();
});

// Clean up is handled by Vue's auto-cleanup of scoped listeners; nothing
// manual to remove since onKeyDown is bound via @keydown in template.
onBeforeUnmount(() => {
  /* no-op — template-bound listeners are auto-cleaned */
});

// Expose a small surface for parent components / tests.
defineExpose({ selectOption, resetAnswer, isLocked });
</script>

<template>
  <section
    class="quiz-widget max-w-4xl mx-auto text-left text-base leading-relaxed"
    :aria-label="`Quiz question ${questionIndex + 1}`"
  >
    <p class="quiz-widget__prompt text-xl font-semibold mt-0 mb-5">
      {{ question.question }}
    </p>

    <ul
      ref="listbox"
      class="quiz-widget__options list-none m-0 mb-5 p-0 flex flex-col gap-2 outline-none"
      :class="{ 'cursor-default': isLocked }"
      role="listbox"
      tabindex="0"
      :aria-activedescendant="
        isLocked ? undefined : `quiz-opt-${questionIndex}-${focusedIndex}`
      "
      :aria-disabled="isLocked ? 'true' : 'false'"
      @keydown="onKeyDown"
    >
      <li
        v-for="(option, i) in question.options"
        :id="`quiz-opt-${questionIndex}-${i}`"
        :key="i"
        class="quiz-widget__option flex items-start gap-3 px-4 py-3 border rounded-lg cursor-pointer transition-colors duration-120"
        :class="{
          'quiz-widget__option--focused': !isLocked && i === focusedIndex,
          'quiz-widget__option--selected': selectedIndex === i,
          'quiz-widget__option--correct': isLocked && option.isCorrect,
          'quiz-widget__option--incorrect': selectedIndex === i && !option.isCorrect,
          'quiz-widget__option--muted': isLocked && selectedIndex !== i && !option.isCorrect,
        }"
        role="option"
        :aria-selected="selectedIndex === i"
        :tabindex="isLocked ? -1 : 0"
        @click="selectOption(i)"
      >
        <span
          class="quiz-widget__marker shrink-0 w-6 font-bold text-center leading-6"
          aria-hidden="true"
        >
          <template v-if="isLocked && option.isCorrect">✓</template>
          <template v-else-if="selectedIndex === i && !option.isCorrect">✗</template>
          <template v-else>{{ String.fromCharCode(65 + i) }}</template>
        </span>
        <span class="flex-1">{{ option.text }}</span>
      </li>
    </ul>

    <transition name="quiz-widget__feedback">
      <div
        v-if="selectedOption"
        class="quiz-widget__feedback mt-2 px-5 py-4 rounded-lg border"
        :class="{
          'quiz-widget__feedback--correct': selectedOption.isCorrect,
          'quiz-widget__feedback--incorrect': !selectedOption.isCorrect,
        }"
        role="status"
        aria-live="polite"
      >
        <p class="font-bold m-0 mb-2">
          <template v-if="selectedOption.isCorrect">✓ Correct</template>
          <template v-else>✗ Not quite</template>
        </p>
        <p class="m-0 mb-3">{{ selectedOption.explanation }}</p>
        <button
          type="button"
          class="quiz-widget__retry text-sm px-3.5 py-1.5 border rounded-md transition-colors duration-120"
          @click="resetAnswer"
        >
          Try again
        </button>
      </div>
    </transition>
  </section>
</template>

<style scoped>
/*
 * Only state-conditional styling lives here. Layout, spacing, typography,
 * and dark-mode are handled by UnoCSS utilities in the template (Slidev
 * ships UnoCSS as a core dependency, so this adds zero new deps).
 *
 * Colors use Tailwind's default palette via dark: variants in the class
 * bindings below; this block just wires the state → class mapping that's
 * awkward to express as concatenated utility strings.
 */

.quiz-widget__option {
  border-color: #d9dee2;
  background: #ffffff;
  color: #1f2933;
}
:global(.dark) .quiz-widget__option {
  border-color: #334155;
  background: #1a1f2e;
  color: #e2e8f0;
}

.quiz-widget__option:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
:global(.dark) .quiz-widget__option:focus-visible {
  outline-color: #60a5fa;
}

.quiz-widget__option--focused {
  border-color: #2563eb;
  background: color-mix(in srgb, #2563eb 8%, #ffffff);
}
:global(.dark) .quiz-widget__option--focused {
  border-color: #60a5fa;
  background: color-mix(in srgb, #60a5fa 12%, #1a1f2e);
}

/* Hover only when the option is still pickable (not locked, not the chosen one). */
.quiz-widget__option:not(.quiz-widget__option--selected):not(.quiz-widget__option--correct):not(.quiz-widget__option--muted):hover {
  border-color: #2563eb;
}
:global(.dark) .quiz-widget__option:not(.quiz-widget__option--selected):not(.quiz-widget__option--correct):not(.quiz-widget__option--muted):hover {
  border-color: #60a5fa;
}

.quiz-widget__option--selected,
.quiz-widget__option--incorrect {
  border-color: #ef4444;
  background: #fef2f2;
  color: #991b1b;
  cursor: default;
}
:global(.dark) .quiz-widget__option--selected,
:global(.dark) .quiz-widget__option--incorrect {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
}

.quiz-widget__option--correct {
  border-color: #10b981;
  background: #ecfdf5;
  color: #065f46;
  cursor: default;
}
:global(.dark) .quiz-widget__option--correct {
  background: rgba(16, 185, 129, 0.15);
  color: #6ee7b7;
}

.quiz-widget__option--muted {
  opacity: 0.55;
  cursor: default;
}

/* Feedback panel — border/bg per verdict. Text color inherits from above. */
.quiz-widget__feedback {
  border-color: #d9dee2;
  background: #ffffff;
}
:global(.dark) .quiz-widget__feedback {
  border-color: #334155;
  background: #1a1f2e;
}

.quiz-widget__feedback--correct {
  border-color: #10b981;
  background: #ecfdf5;
  color: #065f46;
}
:global(.dark) .quiz-widget__feedback--correct {
  background: rgba(16, 185, 129, 0.15);
  color: #6ee7b7;
}

.quiz-widget__feedback--incorrect {
  border-color: #ef4444;
  background: #fef2f2;
  color: #991b1b;
}
:global(.dark) .quiz-widget__feedback--incorrect {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
}

.quiz-widget__retry {
  border-color: #d9dee2;
  background: #ffffff;
  color: #1f2933;
}
:global(.dark) .quiz-widget__retry {
  border-color: #334155;
  background: #1a1f2e;
  color: #e2e8f0;
}
.quiz-widget__retry:hover,
.quiz-widget__retry:focus-visible {
  border-color: #2563eb;
  outline: none;
  background: color-mix(in srgb, #2563eb 10%, #ffffff);
}
:global(.dark) .quiz-widget__retry:hover,
:global(.dark) .quiz-widget__retry:focus-visible {
  border-color: #60a5fa;
  background: color-mix(in srgb, #60a5fa 14%, #1a1f2e);
}

/* Vue transition for the feedback panel. */
.quiz-widget__feedback-enter-active,
.quiz-widget__feedback-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}
.quiz-widget__feedback-enter-from,
.quiz-widget__feedback-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

@media (prefers-reduced-motion: reduce) {
  .quiz-widget__option,
  .quiz-widget__retry,
  .quiz-widget__feedback-enter-active,
  .quiz-widget__feedback-leave-active {
    transition: none;
  }
}
</style>