import { from, of } from 'rxjs';
import { concatMap, delay } from 'rxjs/operators';

const files = ['photo.jpg', 'report.pdf', 'notes.txt'];

from(files).pipe(
  concatMap(file => {
    console.log('Uploading', file);
    return of('OK').pipe(delay(800));
  }),
).subscribe(status => console.log('Result:', status));
