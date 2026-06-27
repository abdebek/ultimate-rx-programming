import { fromEvent, of } from 'rxjs';
import { exhaustMap, delay } from 'rxjs/operators';

const refreshBtn = document.getElementById('refresh-btn')!;

fromEvent(refreshBtn, 'click').pipe(
  exhaustMap(() => {
    console.log('Refreshing…');
    return of('Loaded').pipe(delay(2000));
  }),
).subscribe(status => console.log('Done:', status));

// Fast double-click:
// Refreshing…     ← first click
// Done: Loaded    ← 2s later
// (second click was ignored)
