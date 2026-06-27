using System;
using System.Reactive.Linq;

IObservable<int> sourceStream = Observable.Range(1, 8);

IObservable<int> processedStream = sourceStream
    .Where((int x) => x % 2 == 0)
    .Select((int x) => x * 10)
    .Take(3);

processedStream.Subscribe((int result) => Console.WriteLine(result));