using System;
using System.Reactive.Linq;
using System.Reactive.Subjects;
using System.Threading.Tasks;

var refreshes = new Subject<Unit>();

refreshes
    .Select(_ => Observable.FromAsync(async () =>
    {
        Console.WriteLine("Refreshing…");
        await Task.Delay(2000);
        return "Loaded";
    }))
    .Exhaust()
    .Subscribe(status => Console.WriteLine($"Done: {status}"));

refreshes.OnNext(Unit.Default); // first click
refreshes.OnNext(Unit.Default); // ignored while first is active
