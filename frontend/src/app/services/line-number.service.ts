import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

// Here line number stands for the line containing the column names.
// Here first line stands for the line where we are willing to locate the first entry.

export class LineNumberService {
  private columnNameRowSubject = new BehaviorSubject<number>(0); // Default line number 0
  columnNameRow$ = this.columnNameRowSubject.asObservable();

  private firstEntrySubject = new BehaviorSubject<number>(0); // Default line number 0
  firstEntry$ = this.firstEntrySubject.asObservable();

  private todayDateSubject = new BehaviorSubject<string>(''); // Default: empty string
  todayDate$ = this.todayDateSubject.asObservable();

  setColumnNameRow(value: number): void {
    this.columnNameRowSubject.next(value);
  }

  getColumnNameRow(): number {
    return this.columnNameRowSubject.getValue();
  }

  setFirstEntry(value: number): void {
    this.firstEntrySubject.next(value);
  }

  getFirstEntry(): number {
    return this.firstEntrySubject.getValue();
  }

  setTodayDate(value: string): void { // Accepts string now
    this.todayDateSubject.next(value);
  }

  getTodayDate(): string { // Returns string now
    return this.todayDateSubject.getValue();
  }
}
