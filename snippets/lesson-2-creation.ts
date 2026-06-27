import { from, range, Observable } from 'rxjs';

const names: string[] = ['Alice', 'Bob', 'Charlie'];
const names$: Observable<string> = from(names);
names$.subscribe((name: string) => console.log(`Name: ${name}`));

const sequence$: Observable<number> = range(1, 5);
sequence$.subscribe((num: number) => console.log(`Number: ${num}`));