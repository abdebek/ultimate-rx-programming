using System;
using System.Reactive.Subjects;
using System.Reactive.Linq;

var userStream = new BehaviorSubject<string>("Alice");
var themeStream = new BehaviorSubject<string>("Dark");

IObservable<string> viewData = userStream.CombineLatest(
    themeStream,
    (user, theme) => $"Rendering {user} in {theme} mode.");

viewData.Subscribe(Console.WriteLine);

userStream.OnNext("Bob");
themeStream.OnNext("Light");