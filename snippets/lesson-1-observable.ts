import { Observable, Subscription } from 'rxjs';

const numberStream$: Observable<number> = new Observable<number>((subscriber) => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  subscriber.complete();
});

const subscription: Subscription = numberStream$.subscribe({
  next: (value: number) => console.log(`Received: ${value}`),
  error: (err: Error) => console.error(`Error: ${err.message}`),
  complete: () => console.log('Stream completed!'),
});

subscription.unsubscribe();