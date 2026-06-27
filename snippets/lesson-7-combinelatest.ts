import { combineLatest, BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const user$ = new BehaviorSubject<string>('Alice');
const theme$ = new BehaviorSubject<string>('Dark');

const viewData$: Observable<string> = combineLatest([user$, theme$]).pipe(
  map(([user, theme]) => `Rendering ${user} in ${theme} mode.`),
);

viewData$.subscribe(console.log);

user$.next('Bob');
theme$.next('Light');