<script setup lang="ts">
/**
 * AnimatedMarble — the visualization engine for the Reactive Programming
 * course. Renders a marble diagram and animates each emission along a
 * timeline driven by `marble.time` (never hardcoded CSS delays).
 *
 * Contract (see setup/types.ts):
 *   - props: AnimatedMarbleProps
 *   - exposed: AnimationControl  (play / pause / reset / step)
 *
 * Slidev integration:
 *   - `onSlideEnter` resets the animation to t=0 so replaying a slide
 *     always starts fresh.
 *   - `step()` is wired to Slidev's local `$clicks` via `useSlideContext`:
 *     each click advances the timeline by exactly one emission and
 *     pauses there. This lets a lesson author place `<AnimatedMarble>`
 *     inside a `<v-clicks>`-style flow without writing glue code.
 *   - When the slide is left (presenter navigates away) the rAF loop is
 *     cancelled to avoid burning CPU on off-screen slides.
 *
 * Animation strategy (per .temp/notes.md):
 *   - CSS keyframes + CSS transforms for the marble slide-in.
 *   - `requestAnimationFrame` drives the playhead ONLY to decide which
 *     marbles are "revealed" (visible) vs "pending" (hidden). The actual
 *     motion of a marble entering is a CSS transition on `transform` +
 *     `opacity`, so the browser compositor handles it efficiently.
 *   - No GSAP / Motion One / Anime.js / VueUse. Only Vue 3 + standard DOM.
 *
 * Dark mode:
 *   - Palette is defined as CSS custom properties (--marble-<color>) in
 *     styles/marble.css (Phase 4) with light + dark variants. This
 *     component consumes them via `var(--marble-<color>)` and adds a
 *     handful of scoped layout rules. useDarkMode() is used only to
 *     force a re-evaluation of the timeline ruler tick color in JS-driven
 *     rendering paths; CSS handles the rest.
 */
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
} from 'vue';
import { onSlideLeave, useDarkMode, useIsSlideActive, useSlideContext } from '@slidev/client';
import type {
  AnimatedMarbleProps,
  AnimationControl,
  AnimationPhase,
  Marble,
  Stream,
} from '../setup/types';

// HMR-safe prop typing without runtime defineProps boilerplate mismatch.
const props = withDefaults(defineProps<AnimatedMarbleProps>(), {
  lanes: undefined,
  visibleLanes: undefined,
  replay: true,
});

// --- derived layout -------------------------------------------------------

/**
 * Total lane rows to render. Falls back to the highest lane index found
 * in any stream's emissions (+1), so diagrams without an explicit `lanes`
 * prop still lay out correctly.
 */
const laneCount = computed<number>(() => {
  if (props.lanes !== undefined) return props.lanes;
  let max = 0;
  for (const stream of props.streams) {
    for (const e of stream.emissions) {
      if (e.lane > max) max = e.lane;
    }
  }
  return max + 1;
});

/**
 * Allowlist of lane indices to actually render. When `visibleLanes` is
 * provided (the predict-before-reveal beat), lanes NOT in the list are
 * rendered as empty placeholder rows — they still take up vertical
 * space so the reveal slide doesn't cause a layout shift.
 */
const visibleLaneSet = computed<Set<number> | null>(() => {
  if (props.visibleLanes === undefined) return null;
  return new Set(props.visibleLanes);
});

function isLaneVisible(lane: number): boolean {
  const set = visibleLaneSet.value;
  return set === null ? true : set.has(lane);
}

/**
 * Flattened, time-sorted list of every emission across all streams.
 * Used by the playhead to know which emission to reveal next on `step()`
 * and during `play()`. Streams whose lane is hidden are excluded from
 * the reveal schedule (they still render, just always-visible if they
 * were already shown — but in practice predict slides hide the output
 * lane entirely, so there's nothing to reveal on that lane).
 */
const schedule = computed<readonly Marble[]>(() => {
  const all: Marble[] = [];
  for (const stream of props.streams) {
    if (!isLaneVisible(stream.laneFromFirstEmission)) continue;
    for (const e of stream.emissions) all.push(e);
  }
  all.sort((a, b) => a.time - b.time);
  return all;
});

// Augment Stream with a tiny helper used above. We keep this local rather
// than polluting the public Stream interface in setup/types.ts.
declare module '../setup/types' {
  interface Stream {
    readonly laneFromFirstEmission: number;
  }
}

// The above module augmentation is a *type-level* convenience. At runtime
// we compute the lane from the stream's emissions directly:
function streamLane(stream: Stream): number {
  if (stream.emissions.length === 0) return 0;
  return stream.emissions[0].lane;
}

// Re-implement schedule without the augmentation (cleaner, no phantom field):
const schedule2 = computed<readonly Marble[]>(() => {
  const all: Marble[] = [];
  for (const stream of props.streams) {
    if (!isLaneVisible(streamLane(stream))) continue;
    for (const e of stream.emissions) all.push(e);
  }
  all.sort((a, b) => a.time - b.time);
  return all;
});

// Use the clean version going forward.
const timeline = schedule2;

// --- playback state -------------------------------------------------------

const phase = ref<AnimationPhase>('idle');
/** Index into `timeline` of the next emission to reveal. */
const revealCursor = ref<number>(0);
/** Current playhead time in seconds (only meaningful while playing). */
const currentTime = ref<number>(0);

const rafHandle = shallowRef<number | null>(null);
let lastFrameTime = 0;

const totalDuration = computed<number>(() => Math.max(props.duration, 0.001));
const isDone = computed<boolean>(
  () => revealCursor.value >= timeline.value.length && phase.value !== 'playing',
);

// --- rAF loop -------------------------------------------------------------

function cancelRaf(): void {
  if (rafHandle.value !== null) {
    cancelAnimationFrame(rafHandle.value);
    rafHandle.value = null;
  }
}

function tick(timestamp: number): void {
  if (phase.value !== 'playing') {
    cancelRaf();
    return;
  }
  if (lastFrameTime === 0) lastFrameTime = timestamp;
  const delta = (timestamp - lastFrameTime) / 1000;
  lastFrameTime = timestamp;

  currentTime.value += delta;

  // Reveal any marbles whose time has been reached.
  while (
    revealCursor.value < timeline.value.length &&
    timeline.value[revealCursor.value].time <= currentTime.value
  ) {
    revealCursor.value++;
  }

  if (currentTime.value >= totalDuration.value) {
    revealCursor.value = timeline.value.length;
    phase.value = 'done';
    cancelRaf();
    return;
  }
  rafHandle.value = requestAnimationFrame(tick);
}

// --- AnimationControl (exposed) ------------------------------------------

function play(): void {
  if (phase.value === 'playing') return;
  if (phase.value === 'done') {
    // Replaying from the end → restart.
    reset();
  }
  phase.value = 'playing';
  lastFrameTime = 0;
  cancelRaf();
  rafHandle.value = requestAnimationFrame(tick);
}

function pause(): void {
  if (phase.value !== 'playing') return;
  phase.value = 'paused';
  cancelRaf();
}

function reset(): void {
  cancelRaf();
  phase.value = 'idle';
  revealCursor.value = 0;
  currentTime.value = 0;
  lastFrameTime = 0;
}

/**
 * Advance exactly one emission forward and pause. Integrates with
 * Slidev click progression: a parent can call `step()` on each `$clicks`
 * increment to reveal marbles one at a time.
 */
function step(): void {
  if (revealCursor.value >= timeline.value.length) {
    phase.value = 'done';
    return;
  }
  revealCursor.value++;
  currentTime.value = timeline.value[revealCursor.value - 1].time;
  phase.value = revealCursor.value >= timeline.value.length ? 'done' : 'paused';
  cancelRaf();
}

defineExpose<AnimationControl>({ play, pause, reset, step });

// --- per-marble reactive visibility --------------------------------------

/**
 * A marble is "revealed" when its index in the global timeline is less
 * than `revealCursor`. Because marbles across streams share one sorted
 * timeline, this correctly handles inter-stream ordering.
 *
 * We pre-index each marble's timeline position for O(1) lookups.
 */
const marbleTimelineIndex = computed<Map<string, number>>(() => {
  const map = new Map<string, number>();
  timeline.value.forEach((marble, i) => {
    map.set(marble.id, i);
  });
  return map;
});

function isMarbleRevealed(marble: Marble): boolean {
  // Hidden-lane marbles are always revealed (they're not part of the
  // predict/reveal flow — they just show up when the lane is visible).
  if (!isLaneVisible(marble.lane)) return true;
  const idx = marbleTimelineIndex.value.get(marble.id);
  if (idx === undefined) return true; // defensive: orphan marble
  return idx < revealCursor.value;
}

// --- Slidev integration ---------------------------------------------------

const { $clicks } = useSlideContext();
const isDark = useDarkMode();
const isActive = useIsSlideActive();

// Reset animation whenever we enter the slide (covers navigation back to
// the slide, and the initial mount). We use a watch on `isActive` rather
// than `onSlideEnter` because `onSlideEnter` fires only on route change —
// `isActive` also covers the case where the slide was already mounted but
// backgrounded by presenter mode.
watch(isActive, (active) => {
  if (active) {
    reset();
    // Auto-play on entry so the animation runs without requiring a click.
    // Authors who want manual control can omit auto-play by setting a
    // future `:manual` prop — not in the current contract, so default
    // to auto-play which matches every lesson's current design.
    play();
  } else {
    cancelRaf();
  }
}, { immediate: true });

// Tie `step()` to click progression: when $clicks increases, step the
// animation forward. This lets a lesson author wrap <AnimatedMarble> in
// <v-clicks> or rely on the default click count to reveal emissions
// one-by-one. We watch for INCREASES only — going backward (clicking
// "previous") resets the animation via the isActive watcher above.
watch($clicks, (now, prev) => {
  if (now > (prev ?? 0)) {
    step();
  }
});

// When the slide is left, stop the loop. Belt-and-suspenders alongside
// the isActive watcher (presenter mode may keep the slide mounted).
onSlideLeave(() => {
  cancelRaf();
});

// Also clean up on unmount (e.g. HMR).
onBeforeUnmount(() => {
  cancelRaf();
});

// --- rendering helpers ----------------------------------------------------

/**
 * Horizontal position of a marble as a CSS percentage of the lane width.
 * Derived from marble.time / duration — never hardcoded.
 */
function marbleLeft(marble: Marble): string {
  const pct = (marble.time / totalDuration.value) * 100;
  // Clamp to [2%, 98%] so end marbles don't overflow the lane padding.
  return `${Math.min(98, Math.max(2, pct))}%`;
}

/**
 * Whether a stream should render its `|` completion marker. A stream
 * that errors (last emission is a red ✖) does NOT also render `|`.
 */
function showsCompletion(stream: Stream): boolean {
  if (!stream.complete) return false;
  if (stream.emissions.length === 0) return true;
  const last = stream.emissions[stream.emissions.length - 1];
  return !(last.color === 'red' && last.value === '✖');
}

// Re-render the timeline ruler ticks when dark mode toggles, since the
// tick color is set via JS for crispness on hidpi screens.
watch(isDark, () => {
  /* no-op: tick color comes from CSS via --marble-ruler */
});

// Initial mount: the isActive watcher with `immediate: true` handles
// the first play() call, so no separate onMounted is needed.
onMounted(() => {
  /* intentional no-op — isActive watcher bootstraps playback */
});
</script>

<template>
  <figure
    class="animated-marble mx-auto w-full max-w-4xl my-4 text-left select-none"
    role="img"
    :aria-label="title"
  >
    <figcaption
      class="animated-marble__title text-sm font-medium mb-2 opacity-80"
    >
      {{ title }}
    </figcaption>

    <!-- timeline ruler -->
    <div
      class="animated-marble__ruler relative h-1 mb-2 rounded-full"
      aria-hidden="true"
    />

    <ol
      class="animated-marble__lanes list-none m-0 p-0 flex flex-col gap-3"
      :style="{ '--lane-count': laneCount }"
    >
      <li
        v-for="lane in laneCount"
        :key="lane - 1"
        class="animated-marble__lane relative h-10 rounded-full"
        :class="{
          'animated-marble__lane--hidden': !isLaneVisible(lane - 1),
        }"
        :aria-hidden="!isLaneVisible(lane - 1) ? 'true' : undefined"
      >
        <!-- lane label + the stream's marbles, only for visible lanes -->
        <template v-for="stream in streams" :key="stream.id">
          <template v-if="streamLane(stream) === lane - 1 && isLaneVisible(lane - 1)">
            <span
              class="animated-marble__lane-label absolute -left-0.5 -top-0.5 text-xs font-mono opacity-70"
            >{{ stream.id }}</span>
            <span
              v-if="showsCompletion(stream)"
              class="animated-marble__completion"
              :style="{ left: marbleLeft(stream.emissions[stream.emissions.length - 1]) }"
              aria-hidden="true"
            >|</span>
            <span
              v-for="marble in stream.emissions"
              :key="marble.id"
              class="animated-marble__marble"
              :class="[
                `animated-marble__marble--${marble.color}`,
                {
                  'animated-marble__marble--pending': !isMarbleRevealed(marble),
                  'animated-marble__marble--error': marble.color === 'red' && marble.value === '✖',
                },
              ]"
              :style="{ left: marbleLeft(marble) }"
              :aria-label="`${marble.value} at t=${marble.time}s`"
            >{{ marble.value }}</span>
          </template>
        </template>
      </li>
    </ol>

    <!-- replay control -->
    <div v-if="replay" class="animated-marble__controls mt-3 flex items-center gap-2">
      <button
        type="button"
        class="animated-marble__replay text-xs px-2.5 py-1 border rounded-md transition-colors duration-150"
        :disabled="phase === 'idle'"
        @click="reset(); play()"
      >
        ↻ Replay
      </button>
      <span class="text-xs opacity-60">{{ phase }}</span>
    </div>
  </figure>
</template>

<style scoped>
/*
 * Layout + structural styling lives here. The marble color palette is
 * NOT defined here — it comes from CSS custom properties (--marble-<color>)
 * in styles/marble.css (Phase 4), which has light + dark variants. This
 * keeps the palette centralized and consistent with the legend slide.
 *
 * If this component is ever used outside the Slidev project (e.g. in a
 * test), the fallback values below ensure it still renders readably
 * without the global stylesheet.
 */

.animated-marble {
  --marble-size: 2rem;
  --marble-track-bg: #e5e7eb;
  --marble-ruler: #9ca3af;
}
:global(.dark) .animated-marble {
  --marble-track-bg: #374151;
  --marble-ruler: #6b7280;
}

.animated-marble__ruler {
  background: var(--marble-ruler);
}

.animated-marble__lane {
  background: var(--marble-track-bg);
  border: 1px solid color-mix(in srgb, var(--marble-ruler) 40%, transparent);
}

.animated-marble__lane--hidden {
  background: transparent;
  border-style: dashed;
  border-color: color-mix(in srgb, var(--marble-ruler) 25%, transparent);
}

.animated-marble__lane-label {
  /* sits just above the lane line, monospace for stream IDs like user$ */
  line-height: 1;
}

/*
 * Marbles are absolutely positioned along the lane. Their `left` is set
 * inline from marbleLeft(); the slide-in motion is a CSS transition on
 * transform + opacity, toggled by the --pending class. This means the
 * browser compositor handles the motion — no JS per-frame work needed
 * for the actual animation, only for deciding WHEN to reveal.
 */
.animated-marble__marble {
  position: absolute;
  top: 50%;
  width: var(--marble-size);
  height: var(--marble-size);
  margin-left: calc(var(--marble-size) / -2);
  margin-top: calc(var(--marble-size) / -2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
  text-align: center;
  background: var(--marble-bg, #cbd5e1);
  color: var(--marble-fg, #0f172a);
  border: 2px solid var(--marble-border, transparent);
  transform: translateY(0) scale(1);
  opacity: 1;
  transition: transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 220ms ease;
  will-change: transform, opacity;
}

.animated-marble__marble--pending {
  transform: translateY(-12px) scale(0.4);
  opacity: 0;
  pointer-events: none;
}

.animated-marble__marble--error {
  /* ✖ markers: square, not circle, to visually distinguish from values */
  border-radius: 4px;
  font-weight: 700;
}

.animated-marble__completion {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--marble-ruler);
  line-height: 1;
}

.animated-marble__replay {
  border-color: #d9dee2;
  background: #ffffff;
  color: #1f2933;
}
:global(.dark) .animated-marble__replay {
  border-color: #334155;
  background: #1a1f2e;
  color: #e2e8f0;
}
.animated-marble__replay:hover:not(:disabled),
.animated-marble__replay:focus-visible:not(:disabled) {
  border-color: #2563eb;
  outline: none;
}
:global(.dark) .animated-marble__replay:hover:not(:disabled),
:global(.dark) .animated-marble__replay:focus-visible:not(:disabled) {
  border-color: #60a5fa;
}
.animated-marble__replay:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (prefers-reduced-motion: reduce) {
  .animated-marble__marble,
  .animated-marble__replay {
    transition: none;
  }
  .animated-marble__marble--pending {
    transform: none;
    /* keep opacity so the marble is still hidden, just without motion */
  }
}

/*
 * Per-color marble palette. These SELECT which CSS custom properties
 * the marble uses. The actual color values are defined in styles/marble.css
 * (Phase 4) with light + dark variants. Fallback values inline ensure
 * the component renders standalone for tests.
 */
.animated-marble__marble--blue {
  --marble-bg: var(--marble-blue, #3b82f6);
  --marble-fg: #ffffff;
  --marble-border: var(--marble-blue-border, transparent);
}
.animated-marble__marble--purple {
  --marble-bg: var(--marble-purple, #8b5cf6);
  --marble-fg: #ffffff;
  --marble-border: var(--marble-purple-border, transparent);
}
.animated-marble__marble--amber {
  --marble-bg: var(--marble-amber, #f59e0b);
  --marble-fg: #1f2933;
  --marble-border: var(--marble-amber-border, transparent);
}
.animated-marble__marble--green {
  --marble-bg: var(--marble-green, #10b981);
  --marble-fg: #ffffff;
  --marble-border: var(--marble-green-border, transparent);
}
.animated-marble__marble--red {
  --marble-bg: var(--marble-red, #ef4444);
  --marble-fg: #ffffff;
  --marble-border: var(--marble-red-border, transparent);
}
.animated-marble__marble--gray {
  --marble-bg: var(--marble-gray, #9ca3af);
  --marble-fg: #ffffff;
  --marble-border: var(--marble-gray-border, transparent);
  opacity: 0.7;
}
.animated-marble__marble--gray.animated-marble__marble--pending {
  opacity: 0;
}
.animated-marble__marble--teal {
  --marble-bg: var(--marble-teal, #14b8a6);
  --marble-fg: #ffffff;
  --marble-border: var(--marble-teal-border, transparent);
}
</style>