/**
 * Centralized quiz bank for the Reactive Programming course.
 *
 * Referenced from lesson markdown via:
 *   <QuizWidget :question-index="N" />
 *
 * Index → lesson mapping is documented in .temp/scripts/quiz-data.js.
 * Do not reorder entries — lessons reference them by stable index.
 */
import type { QuizQuestion } from './types';

const quizQuestions: readonly QuizQuestion[] = [
  // 0 — Lesson 1: Observables & Subscriptions
  {
    question:
      'You create an Observable (RxJS) or IObservable (Rx.NET) but never call subscribe() / Subscribe(). What happens?',
    options: [
      {
        text: 'It executes immediately on construction.',
        isCorrect: false,
        explanation:
          "Misconception: confusing Observables with eager code. Observables are lazy — construction only builds the description, it doesn't run the producer.",
      },
      {
        text: 'It throws an "Unbound Stream" error at runtime.',
        isCorrect: false,
        explanation:
          'No such error exists. The library does not enforce subscription — it simply does nothing without one.',
      },
      {
        text: 'Nothing happens. The stream is lazy — the producer only runs when subscribed to.',
        isCorrect: true,
        explanation:
          'Correct. Observables are cold and lazy by default. The function you pass to new Observable(subscriber => ...) is invoked per subscription, and not at all if there are zero subscriptions.',
      },
      {
        text: 'It runs once, completes, and caches the result for later subscribers.',
        isCorrect: false,
        explanation:
          'This describes a hot/replayed stream (e.g. shareReplay), not a plain Observable. A default Observable runs fresh per subscriber — and zero times if never subscribed.',
      },
    ],
  },

  // 1 — Lesson 2: Creation operators
  {
    question:
      'You subscribe to of(1, 2, 3) twice. How many times does the producer emit values in total across both subscriptions?',
    options: [
      {
        text: '3 — the values are emitted once and shared.',
        isCorrect: false,
        explanation:
          'This would be true for a hot/multicasted stream. of() is cold: each subscription gets its own independent execution.',
      },
      {
        text: '6 — each subscription triggers its own independent run of 3 emissions.',
        isCorrect: true,
        explanation:
          'Correct. of, from, and range are all cold creation operators. Two subscriptions = two separate executions = 6 total emissions. (Lesson 1 covered cold-by-default; this is the practical consequence.)',
      },
      {
        text: '0 — of() only emits when you explicitly call next().',
        isCorrect: false,
        explanation:
          "of() handles the next() calls for you — that's the whole point of a creation operator. The producer runs on subscribe.",
      },
      {
        text: 'It depends on whether the two subscriptions happen at the same time.',
        isCorrect: false,
        explanation:
          'Timing of subscriptions does not affect a cold Observable — each runs independently regardless of overlap.',
      },
    ],
  },

  // 2 — Lesson 3: Transformation & Filtering
  {
    question:
      'Given range(1, 100).pipe(filter(x => x % 2 === 0), map(x => x * 10), take(3)), how many values does the source range(1, 100) actually emit before being torn down?',
    options: [
      {
        text: '3 — take(3) means only 3 values flow through the whole pipe.',
        isCorrect: false,
        explanation:
          'Confuses downstream output count with upstream emission count. take(3) limits the OUTPUT to 3, but the source emits more than that — filter drops the odd ones before take ever sees them.',
      },
      {
        text: '100 — range always emits all 100 values regardless of downstream.',
        isCorrect: false,
        explanation:
          'Would be true without take(3). But take completes the stream after 3 OUTPUT values and UNSUBSCRIBES from upstream — which tears down the source mid-flight.',
      },
      {
        text: '6 — the source emits 1..6: three odd values (filtered out) plus three even values (20, 40, 60) that satisfy take(3).',
        isCorrect: true,
        explanation:
          'Correct. take(3) needs 3 values to pass through filter+map. filter only lets evens through, so the source must emit 2,4,6 (3 evens) — which means it also emitted 1,3,5 (3 odds, filtered out) on the way. After the 3rd even (6), take fires complete and tears down the source. Total source emissions: 6.',
      },
      {
        text: 'It cannot be determined — operators run in unpredictable order.',
        isCorrect: false,
        explanation:
          'Operator order is strictly left-to-right and deterministic. The pipe is a fixed composition.',
      },
    ],
  },

  // 3 — Lesson 4: switchMap
  {
    question:
      'A user types in a search box. Each keystroke triggers a 500ms HTTP request via switchMap. The user types "a", then 200ms later types "b" (so "ab"). What does the subscriber receive?',
    options: [
      {
        text: 'Results for "a", then Results for "ab".',
        isCorrect: false,
        explanation:
          'This is what mergeMap/SelectMany would do — no cancellation. switchMap cancels the previous inner the moment a new one arrives.',
      },
      {
        text: 'Results for "ab" only — the "a" request was cancelled before it completed.',
        isCorrect: true,
        explanation:
          'Correct. The "a" request needed 500ms but "b" arrived at 200ms — switchMap tears down the "a" inner immediately and subscribes to the "ab" inner. Only "ab" completes (at 700ms) and reaches the subscriber.',
      },
      {
        text: 'Nothing — switchMap drops all emissions if keystrokes arrive too fast.',
        isCorrect: false,
        explanation:
          'switchMap drops the PREVIOUS inner, not all of them. The latest inner always gets a chance to complete (unless it too is cancelled).',
      },
      {
        text: 'Both results, but in random order depending on network speed.',
        isCorrect: false,
        explanation:
          'Random ordering describes mergeMap with concurrent requests. switchMap guarantees only the latest inner is alive — ordering is deterministic.',
      },
    ],
  },

  // 4 — Lesson 5: mergeMap / SelectMany
  {
    question:
      'You use mergeMap (RxJS) / SelectMany (Rx.NET) to fire a 5-second job on every button click. The user clicks 3 times in rapid succession. How many jobs run, and how many complete?',
    options: [
      {
        text: '1 job runs — only the last click matters.',
        isCorrect: false,
        explanation:
          'This is switchMap behavior. mergeMap keeps every inner alive — it never cancels.',
      },
      {
        text: '3 jobs run concurrently, and all 3 complete.',
        isCorrect: true,
        explanation:
          'Correct. mergeMap subscribes to every inner stream and runs them all in parallel. None is cancelled. All three jobs run to completion and their emissions interleave on the output lane.',
      },
      {
        text: '3 jobs start, but only the first completes — the others are queued.',
        isCorrect: false,
        explanation:
          'Queuing describes concatMap, not mergeMap. mergeMap runs everything concurrently with no queue.',
      },
      {
        text: 'Only 1 job runs — mergeMap deduplicates clicks within a short window.',
        isCorrect: false,
        explanation:
          'No operator deduplicates by default. That would require distinctUntilChanged or a debounce upstream. mergeMap fires on every emission.',
      },
    ],
  },

  // 5 — Lesson 6: Subjects & Memory
  {
    question:
      'You create a Subject, subscribe to it (Subscriber A), then call subject.next(1). Then you subscribe a second time (Subscriber B) and call subject.next(2). What does Subscriber B receive?',
    options: [
      {
        text: '1, then 2 — the Subject replays all past values to new subscribers.',
        isCorrect: false,
        explanation:
          'A plain Subject does NOT replay. This describes ReplaySubject. A plain Subject multicasts future values only.',
      },
      {
        text: '2 only — the Subject is hot, so Subscriber B missed the earlier emission.',
        isCorrect: true,
        explanation:
          'Correct. A Subject is hot: it has one shared execution, and late subscribers only see values emitted AFTER they subscribe. Subscriber B subscribed after next(1), so it only sees next(2). (BehaviorSubject would have given B the latest value 1 immediately on subscribe; plain Subject does not.)',
      },
      {
        text: 'Nothing — Subject emissions are buffered until all subscribers are present.',
        isCorrect: false,
        explanation:
          'Subjects do not buffer. Emissions are pushed to whoever is subscribed at the moment of next().',
      },
      {
        text: '2 only, and Subscriber A also receives only 2 — Subject emissions are not multicasted.',
        isCorrect: false,
        explanation:
          'Wrong on two counts: Subscriber A received 1 AND 2 (it was subscribed for both). Subjects DO multicast — that is their defining property.',
      },
    ],
  },

  // 6 — Lesson 7: combineLatest
  {
    question:
      'You call combineLatest([streamA, streamB]). streamA emits at t=0; streamB emits at t=1, t=2, t=3. How many times does combineLatest emit, and at what times?',
    options: [
      {
        text: '4 times — at t=0, t=1, t=2, t=3.',
        isCorrect: false,
        explanation:
          'Wrong on the first emission. combineLatest waits for ALL sources to emit at least once before firing. At t=0 only streamA has emitted — streamB is silent — so combineLatest cannot fire yet.',
      },
      {
        text: '3 times — at t=1, t=2, t=3.',
        isCorrect: true,
        explanation:
          'Correct. combineLatest waits until every source has emitted at least once. streamB emits at t=1 — now both have emitted — so combineLatest fires for the first time at t=1, combining streamA latest (its t=0 value) with streamB latest (its t=1 value). Then it fires again at t=2 and t=3 as streamB continues. Total: 3 emissions. The t=0 streamA emission alone is not enough.',
      },
      {
        text: '1 time — at t=3, when the last emission arrives.',
        isCorrect: false,
        explanation:
          'combineLatest does not wait for completion — it fires on every emission after the initial wait. It would fire at t=1, t=2, AND t=3.',
      },
      {
        text: '0 times — combineLatest only emits when both sources emit simultaneously.',
        isCorrect: false,
        explanation:
          'combineLatest fires on ANY source emission (after the initial wait), not on simultaneous ones. That is its whole purpose: react to any change.',
      },
    ],
  },

  // 7 — Lesson 8: Error handling
  {
    question:
      'A stream emits 1, 2, then errors. A subscriber is attached with an error handler that logs the error. What does the subscriber receive, and what is the state of the stream afterward?',
    options: [
      {
        text: '1, 2, then the error. The stream is now dead — it will never emit again.',
        isCorrect: true,
        explanation:
          'Correct. error is TERMINAL — once it fires, the stream is done forever. The error handler lets you REACT to the failure (log, show UI) but does not keep the stream alive. To recover, you need catchError/Retry upstream that swaps in a fallback or resubscribes BEFORE the error reaches the subscriber.',
      },
      {
        text: '1, 2, the error, then the stream resumes from where it left off.',
        isCorrect: false,
        explanation:
          'Streams do not resume after error. The error handler is a notification, not a resume signal. Recovery requires an operator like catchError that intercepts the error upstream.',
      },
      {
        text: '1, 2 only — the error handler suppresses the error and the stream continues.',
        isCorrect: false,
        explanation:
          'An error handler on subscribe does NOT suppress the error or keep the stream alive. It only gives you a callback. The stream still terminates. Suppression requires catchError in the pipe.',
      },
      {
        text: 'The error only — values emitted before the error are discarded.',
        isCorrect: false,
        explanation:
          'Values emitted before the error were already delivered to the subscriber in real time. They are not retroactively discarded.',
      },
    ],
  },

  // 8 — Lesson 9: Final synthesis quiz
  {
    question:
      'You are building a live dashboard that shows "Welcome, {user}" and refreshes whenever EITHER the user changes OR the app locale changes. The user and locale are both BehaviorSubjects with initial values. Which operator do you use, and why BehaviorSubjects specifically?',
    options: [
      {
        text: 'merge — because we want to react to either source.',
        isCorrect: false,
        explanation:
          'merge would interleave the raw emissions of both streams, but it does not COMBINE them — you would not have access to the latest user AND latest locale in one emission. You need combineLatest to pair them.',
      },
      {
        text: 'combineLatest — because we need the latest value from BOTH sources on every change, and BehaviorSubjects ensure combineLatest fires immediately (no waiting for first emissions).',
        isCorrect: true,
        explanation:
          'Correct on both counts. combineLatest gives you the latest from every source on any change — perfect for a dashboard. BehaviorSubjects are the natural source because they always have a current value, so combineLatest does not have to wait for both sources to emit before its first fire. Plain Subjects or cold Observables would cause an awkward initial silence.',
      },
      {
        text: 'switchMap — because the locale change should cancel the previous user rendering.',
        isCorrect: false,
        explanation:
          'switchMap is for flattening streams-of-streams (cancel-and-replace). Here we are COMBINING two independent state streams, not nesting them. The cancellation semantic is irrelevant and would discard the user value.',
      },
      {
        text: 'combineLatest with plain Subjects — BehaviorSubjects add no benefit here.',
        isCorrect: false,
        explanation:
          'Wrong on the second half. With plain Subjects, combineLatest would not fire until BOTH had emitted at least once — so on dashboard load, you would see a blank screen until both the user AND locale changed for the first time. BehaviorSubjects give immediate fire on load because they already hold initial values.',
      },
    ],
  },
  // 9 — Lesson 10: concatMap
  {
    question:
      'Three file uploads are queued with concatMap: file A (5s upload), file B (5s), file C (5s). What happens to file B?',
    options: [
      {
        text: 'file B starts after file A completes — all three uploads run one at a time.',
        isCorrect: true,
        explanation:
          'Correct. concatMap queues inner subscriptions and processes them sequentially. file B waits for file A to complete before starting, and file C waits for file B. Total time: 15s.',
      },
      {
        text: 'file B is cancelled the moment file C is queued.',
        isCorrect: false,
        explanation:
          'This is switchMap behavior — cancel-and-replace. concatMap does not cancel; it queues. file B will still run after file A, regardless of whether file C is in the queue.',
      },
      {
        text: 'file B starts immediately, running concurrently with file A.',
        isCorrect: false,
        explanation:
          'This is mergeMap/SelectMany behavior — concurrent execution. concatMap serializes: it waits for file A to complete before starting file B.',
      },
      {
        text: 'file B is ignored — concatMap discards emissions while an inner is active.',
        isCorrect: false,
        explanation:
          'This is exhaustMap behavior — ignore new emissions while the current inner is active. concatMap queues them instead.',
      },
    ],
  },
  // 10 — Lesson 11: exhaustMap
  {
    question:
      'Two clicks (t=0, t=1) each spawn a 3-value inner (0.5s apart). ' +
      'The output is: A1, A2, A3. The stream then completes. Which operator was used?',
    options: [
      {
        text: 'switchMap — A3 was cancelled at t=1, so B1, B2, B3 appear instead. Output: A1, A2, B1, B2, B3.',
        isCorrect: false,
        explanation:
          'switchMap cancels the previous inner when a new one arrives. With clicks at t=0 and t=1, A3 (scheduled at t=1.0) is cancelled; B1, B2, B3 take over. Five total values — not three.',
      },
      {
        text: 'mergeMap — all six values (A1, A2, A3, B1, B2, B3) appear interleaved. Both inners run concurrently.',
        isCorrect: false,
        explanation:
          'mergeMap subscribes to every inner simultaneously. B1 fires at t=1.5 alongside A3. Six values total — not three.',
      },
      {
        text: 'concatMap — all six values appear sequentially (A1, A2, A3, B1, B2, B3) with a gap after A3. B1 is queued.',
        isCorrect: false,
        explanation:
          'concatMap queues the second inner until the first completes. B1 is delayed until after A3, giving six sequential values — not three.',
      },
      {
        text: 'exhaustMap — click-2 was ignored because inner-1 was still active. Only A1, A2, A3 reach the output.',
        isCorrect: true,
        explanation:
          'Correct. exhaustMap ignores new source emissions while the current inner subscription is active. Click-2 at t=1.0 arrived during inner-1 (active until t=1.5) and was silently dropped. Only three values — A1, A2, A3 — appear in the output.',
      },
    ],
  },
] as const;

export default quizQuestions;
