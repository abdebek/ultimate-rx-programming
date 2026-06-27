using System;
using System.Reactive.Linq;

IObservable<string> fragileStream = Observable.Throw<string>(new Exception("Network Failure!"));

IObservable<string> safeStream = fragileStream.Catch<Exception>(err =>
{
    Console.WriteLine($"Caught: {err.Message}");
    return Observable.Return("Fallback Data");
});

safeStream.Subscribe((string data) => Console.WriteLine(data));