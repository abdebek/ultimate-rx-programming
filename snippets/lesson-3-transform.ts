import { range, Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

const source$: Observable<number> = range(1, 8);

const processed$: Observable<number> = source$.pipe(
  filter((x: number) => x % 2 === 0),
  map((x: number) => x * 10),
  take(3),
);

processed$.subscribe((result: number) => console.log(result));