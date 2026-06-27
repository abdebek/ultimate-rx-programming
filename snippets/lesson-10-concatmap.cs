using System;
using System.Reactive.Linq;
using System.Threading.Tasks;

var files = new[] { "photo.jpg", "report.pdf", "notes.txt" };

files.ToObservable()
    .Select(file => Observable.FromAsync(async () =>
    {
        Console.WriteLine($"Uploading {file}");
        await Task.Delay(800);
        return "OK";
    }))
    .Concat()
    .Subscribe(status => Console.WriteLine($"Result: {status}"));
