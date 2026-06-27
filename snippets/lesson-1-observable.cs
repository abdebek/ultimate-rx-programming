using System;
using System.Reactive.Disposables;
using System.Reactive.Linq;

IObservable<int> numberStream = Observable.Create<int>(observer =>
{
    observer.OnNext(1);
    observer.OnNext(2);
    observer.OnNext(3);
    observer.OnCompleted();
    return Disposable.Empty;
});

IDisposable subscription = numberStream.Subscribe(
    onNext: (int value) => Console.WriteLine($"Received: {value}"),
    onError: (Exception err) => Console.WriteLine($"Error: {err.Message}"),
    onCompleted: () => Console.WriteLine("Stream completed!")
);

subscription.Dispose();