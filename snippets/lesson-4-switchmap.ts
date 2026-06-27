import { fromEvent, Observable, of } from 'rxjs';
import { switchMap, delay } from 'rxjs/operators';

const searchInput = document.getElementById('search') as HTMLInputElement;
const typeStream$: Observable<Event> = fromEvent(searchInput, 'input');

const results$: Observable<string> = typeStream$.pipe(
  switchMap((event: Event) => {
    const term = (event.target as HTMLInputElement).value;
    return of(`Results for: ${term}`).pipe(delay(500));
  }),
);

results$.subscribe((data: string) => console.log(data));