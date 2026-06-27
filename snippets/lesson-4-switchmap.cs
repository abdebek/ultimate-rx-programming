using System;
using System.Reactive.Linq;
using System.Threading.Tasks;

IObservable<string> typeStream = Observable.Interval(TimeSpan.FromMilliseconds(200))
    .Select(_ => "User typed something...");

IObservable<string> resultsStream = typeStream
    .Select(term => Observable.FromAsync(async () =>
    {
        await Task.Delay(500);
        return $"Results for: {term}";
    }))
    .Switch();

resultsStream.Subscribe((string data) => Console.WriteLine(data));