import { of, throwError, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

const fragileStream$: Observable<string> = throwError(() => new Error('Network Failure!'));

const safeStream$: Observable<string> = fragileStream$.pipe(
  catchError((err: Error) => {
    console.warn(`Caught: ${err.message}`);
    return of('Fallback Data');
  }),
);

safeStream$.subscribe((data: string) => console.log(data));