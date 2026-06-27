using System;
using System.Reactive.Disposables;
using System.Reactive.Subjects;

var mySubject = new Subject<int>();
var disposables = new CompositeDisposable();

disposables.Add(mySubject.Subscribe(v => Console.WriteLine($"Sub 1: {v}")));
disposables.Add(mySubject.Subscribe(v => Console.WriteLine($"Sub 2: {v}")));

mySubject.OnNext(100);

disposables.Dispose();
Console.WriteLine("(subscriptions disposed)");