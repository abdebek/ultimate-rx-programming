/**
 * Shared type definitions for the Reactive Programming course.
 *
 * Strict TypeScript — no `any`, no untyped assertions. Every interface here
 * is consumed by at least one of:
 *   - components/AnimatedMarble.vue   (Marble, Stream, MarbleRole, AnimationControl)
 *   - components/QuizWidget.vue        (QuizOption, QuizQuestion)
 *   - setup/quiz-data.ts              (QuizQuestion[])
 *   - lesson markdown via <AnimatedMarble> / <QuizWidget> props
 *
 * Reusable constants belong in setup/constants.ts, not here.
 * Reusable helpers belong in setup/utils.ts, not here.
 */

/**
 * The seven semantic roles a marble can play on a diagram.
 *
 * A role names *what the marble means*, not what color it is. The actual
 * color is a view-mode-dependent implementation detail owned by
 * styles/tokens.css: each role maps to a `--role-<name>` CSS custom
 * property that has separate light and dark values. If we later decide
 * "source" should render indigo instead of blue, we change ONE line in
 * tokens.css — no component, no lesson, no generator touches a color.
 *
 * The roles are committed and taught on the Lesson 1 legend slide:
 *   - source    → source / input stream
 *   - inner     → inner streams (higher-order mapping)
 *   - output    → output / transformed result
 *   - fallback  → fallback / recovery (error handling ONLY)
 *   - error     → error (terminal failure)
 *   - discarded → filtered out / discarded
 *   - hot       → hot / multicast / Subject
 *
 * Components consume `--role-<name>` and `--role-<name>-fg` (text color
 * for legibility on the role's fill) via the MarbleRole → class mapping
 * in AnimatedMarble.vue. Neither layer knows the literal color.
 */
export type MarbleRole =
  | 'source'
  | 'inner'
  | 'output'
  | 'fallback'
  | 'error'
  | 'discarded'
  | 'hot';

/**
 * A single emission on a marble diagram.
 *
 * `time` is in seconds from the start of the animation and drives the
 * marble's horizontal position via a CSS transform. It is NEVER a
 * hardcoded CSS delay — the AnimatedMarble component converts `time`
 * into `left: calc(time / duration * 100%)`.
 *
 * `lane` is a 0-based row index. Lane 0 is the top row.
 *
 * `id` must be unique within a Stream so Vue can use it as a `:key`
 * for list rendering. When values repeat across emissions, pass an
 * explicit id (e.g. '20-a', '20-b').
 *
 * Marbles are immutable: once a Stream is constructed its emissions
 * array is readonly. Mutations would desync the animation from the
 * declarative spec.
 */
export interface Marble {
  readonly id: string;
  readonly value: string;
  readonly time: number;
  readonly lane: number;
  readonly role: MarbleRole;
}

/**
 * A horizontal lane on a marble diagram.
 *
 * `id` is the stream identifier shown in the lane label.
 * `emissions` is the ordered, immutable list of marbles on this lane.
 * `complete` — when true, the lane renders a `|` completion marker at
 *   the time of its last emission. A stream that errors instead of
 *   completing is represented by a Marble whose `role` is `'error'`
 *   and whose `value` is `'✖'`; that marble is terminal and the lane
 *   does not also render `|`.
 *
 * Note: `complete` is optional for backwards-compatibility with
 * streams that have no terminal signal in the diagram (e.g. an
 * abandoned inner stream in a switchMap visualization).
 */
export interface Stream {
  readonly id: string;
  readonly emissions: readonly Marble[];
  readonly complete?: boolean;
}

/**
 * One selectable answer in a quiz question.
 *
 * `text` is the answer shown to the learner.
 * `isCorrect` marks the single right answer. The QuizWidget enforces
 *   exactly one correct option per question at runtime.
 * `explanation` is shown after the learner selects ANY option — it
 *   explains why the correct answer is right AND (for wrong options)
 *   names the specific misconception that option targets. The
 *   explanation is the primary teaching moment, not the score.
 */
export interface QuizOption {
  readonly text: string;
  readonly isCorrect: boolean;
  readonly explanation: string;
}

/**
 * A single quiz prompt.
 *
 * `question` is the prompt text.
 * `options` is the full, unordered list of selectable answers. Order
 *   is preserved as-authored for stable rendering; the QuizWidget does
 *   not shuffle (shuffling would make the "explanation names the
 *   misconception" copy harder to write).
 *
 * Exactly one option MUST have `isCorrect: true`. This is enforced by
 * a runtime guard in QuizWidget.vue, not by a branded type, to keep
 * the authoring ergonomics in setup/quiz-data.ts simple.
 */
export interface QuizQuestion {
  readonly question: string;
  readonly options: readonly QuizOption[];
}

/**
 * Playback state of an AnimatedMarble instance.
 *
 * Exposed via `defineExpose` so a parent (or Slidev's click progression
 * integration) can drive the animation programmatically.
 *
 *   play()  — resume from the current position
 *   pause() — freeze at the current position
 *   reset() — return to t=0 and stop
 *   step()  — advance exactly one emission forward and pause there
 *
 * `step()` exists to integrate with Slidev's click progression: each
 * slide click can call `step()` to reveal marbles one at a time
 * without running the full timeline. When the timeline is exhausted,
 * `step()` becomes a no-op.
 */
export interface AnimationControl {
  play: () => void;
  pause: () => void;
  reset: () => void;
  step: () => void;
}

/**
 * Playback phase, useful for parent components that need to react to
 * the animation's lifecycle (e.g. disabling a "play" button while
 * playing).
 *
 *   'idle'    — at t=0, not playing (initial state after reset)
 *   'playing' — timeline advancing
 *   'paused'  — frozen at an intermediate position
 *   'done'    — reached the end of the timeline
 */
export type AnimationPhase = 'idle' | 'playing' | 'paused' | 'done';

/**
 * Props accepted by the AnimatedMarble component.
 *
 * Documented here as a shared contract so lesson authors (and the
 * generator scripts in .temp/scripts/) can validate prop usage
 * without importing the .vue file.
 *
 *   title         — caption rendered above the diagram
 *   streams       — the lanes to render (see Stream)
 *   duration      — total timeline length in seconds; each marble's
 *                   horizontal position = (marble.time / duration) * 100%
 *   lanes         — total number of lane rows to lay out (may exceed
 *                   streams.length to reserve empty rows for the
 *                   predict-before-reveal beat)
 *   visibleLanes  — optional allowlist of lane indices to actually
 *                   render. Used by the "Predict" slide: pass only the
 *                   source lane indices so the output lane is hidden
 *                   until the learner advances to the "Reveal" slide.
 *                   When omitted, all lanes render.
 *   replay        — when true, show a ↻ replay button so the learner
 *                   can re-run the animation without navigating slides
 */
export interface AnimatedMarbleProps {
  readonly title: string;
  readonly streams: readonly Stream[];
  readonly duration: number;
  readonly lanes?: number;
  readonly visibleLanes?: readonly number[];
  readonly replay?: boolean;
}

/**
 * Props accepted by the QuizWidget component.
 *
 *   questionIndex — index into the centralized quiz bank in
 *                   setup/quiz-data.ts. Lessons reference quizzes by
 *                   stable index (see .temp/scripts/quiz-data.js for
 *                   the index → lesson map). The QuizWidget imports
 *                   the bank itself; lessons do not pass question data
 *                   inline, keeping quiz authoring centralized.
 */
export interface QuizWidgetProps {
  readonly questionIndex: number;
}