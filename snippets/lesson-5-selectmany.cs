using System;
using System.Reactive.Linq;
using System.Threading.Tasks;

IObservable<string> clickStream = Observable.Interval(TimeSpan.FromMilliseconds(500));
int jobCount = 0;

IObservable<string> resultsStream = clickStream.SelectMany(_ =>
{
    int jobId = ++jobCount;
    return Observable.Return($"job-{jobId}:start")
        .Concat(Observable.Return($"job-{jobId}:done").Delay(TimeSpan.FromSeconds(1)));
});

resultsStream.Subscribe((string data) => Console.WriteLine(data));