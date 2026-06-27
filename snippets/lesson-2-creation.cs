using System;
using System.Reactive.Linq;

string[] names = { "Alice", "Bob", "Charlie" };
IObservable<string> namesStream = names.ToObservable();
namesStream.Subscribe((string name) => Console.WriteLine($"Name: {name}"));

IObservable<int> sequenceStream = Observable.Range(1, 5);
sequenceStream.Subscribe((int num) => Console.WriteLine($"Number: {num}"));