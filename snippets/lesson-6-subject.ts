import { Subject, Subscription } from 'rxjs';

const mySubject = new Subject<number>();

const sub1: Subscription = mySubject.subscribe((v: number) => console.log(`Sub 1: ${v}`));
const sub2: Subscription = mySubject.subscribe((v: number) => console.log(`Sub 2: ${v}`));

mySubject.next(100);

sub1.unsubscribe();
sub2.unsubscribe();
console.log('(subscriptions disposed)');