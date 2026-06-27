import { fromEvent, Observable, of } from 'rxjs';
import { mergeMap, delay } from 'rxjs/operators';

const button = document.getElementById('jobBtn') as HTMLInputElement;
const clickStream$: Observable<Event> = fromEvent(button, 'click');

let jobCount = 0;

const results$: Observable<string> = clickStream$.pipe(
  mergeMap(() => {
    const jobId = ++jobCount;
    return of(`job-${jobId}:start`, `job-${jobId}:done`).pipe(
      delay(1000),
    );
  }),
);

results$.subscribe((data: string) => console.log(data));